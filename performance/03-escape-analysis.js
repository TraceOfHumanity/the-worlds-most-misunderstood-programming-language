// ==========================================================================
// ESCAPE ANALYSIS & MEMORY LAYOUT — V8 OPTIMIZATION
// ==========================================================================

// 0. ЗАГАЛЬНА ІДЕЯ
// -----------------------------------------------------
// Escape Analysis — це оптимізація V8, яка визначає: ЧИ МОЖЕ об'єкт
// вийти за межі функції? Якщо НІ — V8 може виділити його на STACK (або
// взагалі замінити скалярними змінними — Scalar Replacement) замість
// HEAP. Це усуває GC-тиск і дає пряму алокацію в регістрах CPU.
//
// Основне правило: локалізуй об'єкти. Якщо об'єкт не потрібен за
// межами функції, V8 оптимізує його на stack.
//
// Розуміння Escape Analysis дає 5-10x приросту для функцій з
// тимчасовими об'єктами.


// ==========================================================================
// 1. STACK VS HEAP
// ==========================================================================

//   STACK (швидкий):
//     - фіксований розмір (~1-8 MB)
//     - автоматично очищається (коли функція завершується)
//     - O(1) алокація (просто зсунь pointer)
//     - НЕМАЄ GC-тиску
//
//   HEAP (повільний):
//     - великий (~100MB+)
//     - очищається через GC
//     - складніша алокація
//     - GC-тиск
//
// V8 при КОЖНОМУ `new Object()` (чи об'єктному літералі) запитує:
// "Цей об'єкт може вийти за межі функції?"
//   - Ні  → Stack / регістри CPU (Scalar Replacement)
//   - Так → Heap (звичайний шлях)


// ==========================================================================
// 2. ЩО ТАКЕ "ВТЕЧА" (ESCAPE)
// ==========================================================================

// Об'єкт ВТІКАЄ з функції, якщо він:

// 2.1. ПОВЕРТАЄТЬСЯ з функції
function createPoint() {
  const p = { x: 1, y: 2 };
  return p; // ❌ ESCAPE
}

// 2.2. ЗАПИСУЄТЬСЯ в зовнішню змінну
let globalPoint;
function setPoint() {
  const p = { x: 1, y: 2 };
  globalPoint = p; // ❌ ESCAPE
}

// 2.3. ПЕРЕДАЄТЬСЯ в зовнішню функцію
function someExternalFn(p) {
  console.log(p.x);
}
function createAndUse() {
  const p = { x: 1, y: 2 };
  someExternalFn(p); // ❌ Потенційний ESCAPE — V8 не знає, що робить someExternalFn з p
}

// 2.4. НЕ ВТІКАЄ
function getDistance() {
  const p = { x: 3, y: 4 }; // ✅ NO ESCAPE
  return Math.sqrt(p.x * p.x + p.y * p.y); // повертаємо число, не об'єкт
}
console.log(getDistance()); // 5


// ==========================================================================
// 3. SCALAR REPLACEMENT
// ==========================================================================

// Якщо V8 визначає, що об'єкт НЕ втікає, він робить Scalar Replacement —
// розкладає об'єкт на ОКРЕМІ СКАЛЯРНІ ЗМІННІ:

// Твій код:
function getDistance2() {
  const p = { x: 3, y: 4 };
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

// Те, що V8 РЕАЛЬНО виконує після оптимізації (концептуально):
function getDistance2Optimized() {
  const p_x = 3; // скалярна змінна замість об'єкта
  const p_y = 4; // скалярна змінна замість об'єкта
  return Math.sqrt(p_x * p_x + p_y * p_y);
}
// Об'єкт { x, y } НІКОЛИ не створюється на Heap! p_x/p_y живуть у
// регістрах CPU.

// НА РІВНІ ASM (ARM64), після Escape Analysis + Scalar Replacement,
// жодної алокації на heap немає:
//   mov x0, #3        ; x0 = p.x (регістр CPU)
//   mov x1, #4        ; x1 = p.y (регістр CPU)
//   mul x2, x0, x0    ; x2 = p.x * p.x = 9
//   mul x3, x1, x1    ; x3 = p.y * p.y = 16
//   add x0, x2, x3    ; x0 = 25
//   bl  sqrt          ; sqrt(25) = 5.0
//   ret


// ==========================================================================
// 4. КОЛИ V8 НЕ МОЖЕ ОПТИМІЗУВАТИ
// ==========================================================================

// V8 НЕ знає, що робить зовнішня функція з об'єктом:
function process(callback) {
  const temp = { value: 42 };
  callback(temp); // ❓ можливо, callback зберігає temp десь?
  // V8: "не впевнений → Heap (безпечний варіант)"
  return temp.value;
}

// "Чорні ящики" для V8 (ЗАВЖДИ Escape):
// - будь-яка зовнішня функція (fetch, console.log, setTimeout...)
// - замикання (closures), що захоплюють об'єкт
// - DOM API виклики


// ==========================================================================
// ПРАВИЛА ДЛЯ ESCAPE ANALYSIS
// ==========================================================================

// ПРАВИЛО 1: Не повертай проміжні об'єкти
// -----------------------------------------------------
// ❌ Неправильно: кожен виклик = новий об'єкт на Heap
function addVectorsBad(a, b) {
  return { x: a.x + b.x, y: a.y + b.y }; // ESCAPE
}
function calculatePathBad(points) {
  let result = { x: 0, y: 0 };
  for (const p of points) {
    result = addVectorsBad(result, p); // кожна ітерація = НОВИЙ об'єкт!
  }
  return result;
}
// На 10000 points: 10000 нових об'єктів → GC-тиск

// ✅ Правильно: скалярні змінні всередині циклу
function calculatePath(points) {
  let rx = 0;
  let ry = 0;
  for (const p of points) {
    rx += p.x; // скаляр на Stack
    ry += p.y; // скаляр на Stack
  }
  return { x: rx, y: ry }; // ТІЛЬКИ ОДИН об'єкт у кінці
}
// 1 об'єкт замість 10000


// ПРАВИЛО 2: Використовуй скаляри для тимчасових обчислень
// -----------------------------------------------------
// ❌ Неправильно: непотрібні об'єкти для обчислень
function distanceEscape(x1, y1, x2, y2) {
  const dx = { value: x2 - x1 }; // непотрібний об'єкт!
  const dy = { value: y2 - y1 }; // непотрібний об'єкт!
  return Math.sqrt(dx.value * dx.value + dy.value * dy.value);
}

// ✅ Правильно: прямі скалярні змінні
function distanceNoEscape(x1, y1, x2, y2) {
  const dx = x2 - x1; // число на Stack
  const dy = y2 - y1; // число на Stack
  return Math.sqrt(dx * dx + dy * dy);
}


// ПРАВИЛО 3: Виноси константні об'єкти за межі функцій
// -----------------------------------------------------
// ❌ Неправильно: новий об'єкт при кожному виклику
function getConfigBad() {
  return { timeout: 5000, retries: 3 }; // ESCAPE + новий об'єкт щоразу!
}

// ✅ Правильно: константи поза функцією (створюються один раз)
const CONFIG = { timeout: 5000, retries: 3 };
function getConfig() {
  return CONFIG;
}

// (У React/Vue той самий принцип — статичний style-об'єкт виносять
//  за межі компонента, щоб не створювати його на кожен рендер:
//    const STYLE = { color: "red", fontSize: 16 };
//    function Component({ data }) { return <div style={STYLE}>{data}</div>; }
// )


// ПРАВИЛО 4: Уникай проміжних об'єктів у гарячих циклах
// -----------------------------------------------------
// ❌ Неправильно:
function processParticlesBad(particles) {
  for (const p of particles) {
    const velocity = { x: p.vx, y: p.vy }; // новий об'єкт кожну ітерацію!
    const position = { x: p.x, y: p.y };   // новий об'єкт кожну ітерацію!
    updatePosition(position, velocity);     // обидва escape!
    p.x = position.x;
    p.y = position.y;
  }
}
function updatePosition(position, velocity) {
  position.x += velocity.x;
  position.y += velocity.y;
}

// ✅ Правильно: in-place, без проміжних об'єктів
function processParticles(particles) {
  for (const p of particles) {
    p.x += p.vx; // модифікуємо прямо
    p.y += p.vy; // модифікуємо прямо
    // 0 нових об'єктів
  }
}


// ПРАВИЛО 5: Object Pool для об'єктів, що НЕМИНУЧЕ повертаються
// -----------------------------------------------------
// Коли МУСИШ повертати об'єкт (він неминуче escape), використовуй Object Pool:

class ObjectPool {
  constructor(Ctor, size) {
    this.Ctor = Ctor;
    this.available = Array.from({ length: size }, () => new Ctor());
  }
  get() {
    return this.available.pop() || new this.Ctor();
  }
  release(obj) {
    this.available.push(obj);
  }
}
class Vec2 {
  constructor() {
    this.x = 0;
    this.y = 0;
  }
}

// ❌ Неминучий Escape без пулу: кожен виклик = новий об'єкт
const player = { x: 10, y: 20 };
function getPlayerPositionBad() {
  return { x: player.x, y: player.y }; // ESCAPE, але потрібен
}
for (let i = 0; i < 10000; i++) {
  getPlayerPositionBad(); // 10000 нових об'єктів!
}

// ✅ Object Pool для неминучих escape-об'єктів
const positionPool = new ObjectPool(Vec2, 100);
function getPlayerPosition() {
  const pos = positionPool.get();
  pos.x = player.x;
  pos.y = player.y;
  return pos; // ESCAPE, але перевикористовуємо з пула
}
for (let i = 0; i < 10000; i++) {
  const pos = getPlayerPosition();
  // ... використання ...
  positionPool.release(pos);
}
// 0 нових алокацій → 0 GC-паузи


// ==========================================================================
// КОНТЕКСТ-СПЕЦИФІЧНІ ПРИКЛАДИ
// ==========================================================================

// ЧИСТИЙ JAVASCRIPT
// -----------------------------------------------------
// ❌ Неправильно: проміжні об'єкти в pipeline
function processDataBad(data) {
  const filtered = data.filter((x) => x > 0);          // новий масив!
  const mapped = filtered.map((x) => ({ v: x }));       // новий масив + нові об'єкти!
  const result = mapped.reduce((acc, x) => acc + x.v, 0);
  return result;
}

// ✅ Правильно: один прохід, без проміжних структур
function processData(data) {
  let result = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i] > 0) {
      result += data[i]; // скаляр, без проміжних об'єктів
    }
  }
  return result;
}

// VUE (COMPOSITION API) — ПСЕВДОКОД (для довідки, потребує Vue-рантайму)
// -----------------------------------------------------
// ❌ Неправильно: computed створює новий об'єкт щоразу
// const position = computed(() => ({ x: player.value.x, y: player.value.y }));
//
// ✅ Правильно: окремі computed для скалярів
// const posX = computed(() => player.value.x);
// const posY = computed(() => player.value.y);
//
// Або мутуй існуючий reactive-об'єкт замість створення нового:
// const position = reactive({ x: 0, y: 0 });
// watchEffect(() => {
//   position.x = player.value.x;
//   position.y = player.value.y;
// });

// REACT — ПСЕВДОКОД (для довідки, потребує React-рантайму)
// -----------------------------------------------------
// ❌ Неправильно: новий об'єкт на кожен рендер
// function GameComponent({ player }) {
//   const style = { left: player.x, top: player.y }; // новий об'єкт кожен рендер!
//   return <div style={style} />;
// }
//
// ✅ Правильно для статичних значень: винеси за межі компонента
// const BASE_STYLE = { position: "absolute" };
//
// ✅ Правильно для динамічних: useMemo
// function GameComponent({ player }) {
//   const style = useMemo(() => ({ left: player.x, top: player.y }), [player.x, player.y]);
//   return <div style={style} />;
// }


// ==========================================================================
// ВПЛИВ НА ПРОДУКТИВНІСТЬ — БЕНЧМАРК
// ==========================================================================

const { performance } = require("perf_hooks");

let t0 = performance.now();
for (let i = 0; i < 10000000; i++) distanceEscape(0, 0, i, i);
console.log(`With escape:    ${(performance.now() - t0).toFixed(0)}ms`);

t0 = performance.now();
for (let i = 0; i < 10000000; i++) distanceNoEscape(0, 0, i, i);
console.log(`Without escape: ${(performance.now() - t0).toFixed(0)}ms`);

// Орієнтовний результат:
//   With escape:    ~450ms
//   Without escape: ~80ms
//   Різниця: ~5-6x


// ==========================================================================
// КОЛИ ESCAPE ANALYSIS НАЙБІЛЬШ КРИТИЧНА
// ==========================================================================
// 1. Математичні функції — vector math, physics, geometry
// 2. Гарячі цикли — particle systems, game loops, обробка даних
// 3. Компоненти, що часто ре-рендеряться — React/Vue списки
// 4. Функції, що викликаються в requestAnimationFrame — 60 разів/секунду


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// | Ситуація                              | Де живе об'єкт | GC-тиск  | Швидкість   |
// |-----------------------------------------|-----------------|-----------|--------------|
// | Об'єкт не втікає (Scalar Replacement)  | Регістри CPU   | Нуль      | Максимальна |
// | Об'єкт не втікає (Stack)               | Stack          | Нуль      | Дуже висока |
// | Об'єкт втікає (Heap, короткоживучий)   | Young Gen      | Середній  | Середня     |
// | Об'єкт втікає (Heap, довгоживучий)     | Old Gen        | Низький   | Середня     |
//
// - Escape Analysis визначає, чи об'єкт може вийти за межі функції
//   (повертається, записується назовні, передається в зовнішню функцію)
// - якщо НЕ втікає — V8 може замінити його скалярними змінними
//   (Scalar Replacement) і взагалі не алокувати на Heap
// - зовнішні функції, замикання й DOM API — завжди "чорні ящики",
//   що змушують V8 вважати об'єкт escape
// - для об'єктів, що НЕМИНУЧЕ повертаються часто (game loop тощо) —
//   Object Pool (перевикористання) замість нової алокації щоразу
//
// КЛЮЧОВИЙ ПРИНЦИП: якщо об'єкт потрібен лише для тимчасових обчислень
// усередині функції — використовуй скалярні змінні. Якщо мусиш
// повертати об'єкт — використовуй Object Pool.