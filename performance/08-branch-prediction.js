// ==========================================================================
// BRANCH PREDICTION & CPU MICROARCHITECTURE — V8 OPTIMIZATION
// ==========================================================================

// 0. ЗАГАЛЬНА ІДЕЯ
// -----------------------------------------------------
// CPU НЕ чекає, поки обчислиться умова if — він ВГАДУЄ, який шлях
// буде виконано, і починає виконувати його ЗАЗДАЛЕГІДЬ (speculative
// execution). Якщо вгадав правильно — виграш у швидкості. Якщо ні —
// PIPELINE FLUSH (штраф 10-20 тактів).
//
// Розуміння branch prediction дає 1.5-3x приросту для коду з умовами
// на великих даних.


// ==========================================================================
// 1. ЯК ПРАЦЮЄ CPU PIPELINE
// ==========================================================================

// Сучасний CPU НЕ виконує інструкції по одній. Він використовує
// PIPELINE — кілька інструкцій виконуються ПАРАЛЕЛЬНО на різних стадіях:
//
//   Такт 1: [Fetch A] [------] [------] [------]
//   Такт 2: [Decode A] [Fetch B] [------] [------]
//   Такт 3: [Execute A] [Decode B] [Fetch C] [------]
//   Такт 4: [Write A] [Execute B] [Decode C] [Fetch D]
//
//   Усі стадії зайняті одночасно → максимальна ефективність!
//
// ПРОБЛЕМА З BRANCH (умовним переходом):
//
//   ; if (x > 0) { doA() } else { doB() }
//   Такт 1: [Fetch: cmp x, 0]
//   Такт 2: [Decode: cmp] [Fetch: ???]  ← CPU не знає, що fetch далі!
//                                          doA() чи doB()?
//   Без prediction: CPU чекає, поки обчислиться умова → pipeline порожній
//   Штраф: 10-20 тактів простою
//
// З BRANCH PREDICTION:
//
//   Такт 1: [Fetch: cmp x, 0]
//   Такт 2: [Decode: cmp] [Fetch: doA()] ← CPU вгадує "x > 0" = true
//   Такт 3: [Execute: cmp] [Decode: doA()] [Fetch: next]
//
//   Якщо вгадав правильно → pipeline повний, штрафу немає!
//   Якщо помилився → pipeline flush, викидаємо doA(), завантажуємо doB()
//   Штраф: ~15 тактів


// ==========================================================================
// 2. BRANCH PREDICTOR
// ==========================================================================

// CPU має спеціальний блок — BRANCH PREDICTOR з таблицею (Branch
// History Table). Він запам'ятовує для КОЖНОГО branch: "зазвичай true
// чи false?"
//
//   Branch History Table (спрощено):
//   Адреса branch | Остання поведінка | Prediction
//   0x1234        | T T T T T         | → True (завжди true?)
//   0x5678        | F F F F F         | → False (завжди false?)
//   0x9ABC        | T F T F T F       | → ??? (непередбачуваний!)
//
// ПЕРЕДБАЧУВАНИЙ branch — ідеально:
//   Після сортування: спочатку всі false, потім усі true
//   Branch: [F F F F F ... T T T T T]
//   Predictor: "спочатку завжди false, потім завжди true"
//   Miss rate: ~1 (тільки в точці переходу)
//
// НЕПЕРЕДБАЧУВАНИЙ branch — погано:
//   Випадкові дані: [T F T T F T F F T F]
//   Predictor: "не можу вгадати..."
//   Miss rate: ~50% → постійні pipeline flushes


// ==========================================================================
// 3. ПРАКТИЧНИЙ ВПЛИВ — БЕНЧМАРК
// ==========================================================================

const { performance } = require("perf_hooks");
const SIZE = 10000000;

const data = new Int32Array(SIZE);
for (let i = 0; i < SIZE; i++) {
  data[i] = (Math.random() * 200) | 0; // 0-199
}

// ❌ Непередбачуваний branch (випадкові дані)
function sumUnpredictable(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > 100) { // ~50% true, ~50% false — випадково!
      sum += arr[i];
    }
  }
  return sum;
}

// ✅ Передбачуваний branch (відсортовані дані)
const sorted = data.slice().sort((a, b) => a - b);
function sumPredictable(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > 100) { // спочатку завжди false, потім завжди true
      sum += arr[i];
    }
  }
  return sum;
}

let t0 = performance.now();
sumUnpredictable(data);
console.log(`Unpredictable: ${(performance.now() - t0).toFixed(0)}ms`);

t0 = performance.now();
sumPredictable(sorted);
console.log(`Predictable:   ${(performance.now() - t0).toFixed(0)}ms`);

// Орієнтовний результат:
//   Unpredictable: ~180ms
//   Predictable:   ~70ms
//   Різниця: ~2.5x


// ==========================================================================
// ПРАВИЛА ДЛЯ BRANCH PREDICTION
// ==========================================================================

// ПРАВИЛО 1: Сортуй дані перед обробкою (якщо можливо)
// -----------------------------------------------------
const usersStub = Array.from({ length: 1000 }, (_, i) => ({
  isPremium: Math.random() > 0.7,
  revenue: Math.round(Math.random() * 100),
}));

// ❌ Випадковий порядок → непередбачуваний branch
function getPremiumRevenueBad(users) {
  let total = 0;
  for (const user of users) {
    if (user.isPremium) { // ~30% true, але в випадковому порядку
      total += user.revenue;
    }
  }
  return total;
}

// ✅ Відсортуй спочатку → передбачуваний branch
const sortedUsers = [...usersStub].sort((a, b) => Number(a.isPremium) - Number(b.isPremium));
// тепер: [false, false, ... true, true, true]
// branch: один перехід у середині → Predictor легко!


// ПРАВИЛО 2: Виноси рідкісні умови назовні
// -----------------------------------------------------
// ❌ Рідкісна умова всередині гарячого циклу
function processItemsBad(items, debug = false) {
  const output = [];
  for (const item of items) {
    const result = item.value * 2;
    if (debug) {            // 99.9% false, але branch є в КОЖНІЙ ітерації!
      console.log(result);
    }
    output.push(result);
  }
  return output;
}

// ✅ Винеси рідкісну умову назовні
function processItems(items, debug = false) {
  const output = [];
  if (debug) {
    for (const item of items) {
      const result = item.value * 2;
      console.log(result);
      output.push(result);
    }
  } else {
    for (const item of items) {    // чистий цикл без branch!
      output.push(item.value * 2);
    }
  }
  return output;
}


// ПРАВИЛО 3: Замінюй branch математикою
// -----------------------------------------------------
// ❌ Branch для clamp
function clampBad(value, min, max) {
  if (value < min) return min;      // branch 1
  if (value > max) return max;      // branch 2
  return value;
}

// ✅ Математика без branch
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max); // CPU: cmov (conditional move)
}

// ❌ Branch для abs
function absBad(x) {
  return x < 0 ? -x : x; // branch
}

// ✅ Bit trick без branch (для цілих чисел)
function absBranchless(x) {
  const mask = x >> 31;          // -1, якщо від'ємне, 0, якщо додатнє
  return (x + mask) ^ mask;      // branchless!
}
console.log(absBranchless(-5), absBranchless(5)); // 5 5


// ПРАВИЛО 4: Групуй схожі об'єкти разом
// -----------------------------------------------------
function updateEnemy(e) { /* ... */ }
function updatePlayer(p) { /* ... */ }

const entities = [
  { type: "enemy", hp: 100 },
  { type: "player", hp: 200 },
  { type: "enemy", hp: 50 },
  { type: "player", hp: 150 },
  // ... перемішані
];

// ❌ Змішані типи → непередбачуваний branch
function updateEntitiesBad(list) {
  for (const entity of list) {
    if (entity.type === "enemy") { // непередбачуваний!
      updateEnemy(entity);
    } else {
      updatePlayer(entity);
    }
  }
}

// ✅ Розділи за типом → передбачуваний branch (або взагалі без branch)
const enemies = entities.filter((e) => e.type === "enemy");
const players = entities.filter((e) => e.type === "player");
// тепер два чистих цикли без умов!
enemies.forEach(updateEnemy);
players.forEach(updatePlayer);


// ПРАВИЛО 5: Early return для найчастіше виконуваних умов
// -----------------------------------------------------
// ❌ Найпоширеніший випадок перевіряється останнім
function processValueBad(value) {
  if (value === null) return 0;             // рідко
  if (value === undefined) return 0;        // рідко
  if (typeof value !== "number") return 0;  // рідко
  return value * 2;                          // 99% випадків — але перевіряється останнім!
}

// ✅ Найпоширеніший випадок перевіряється першим
function processValue(value) {
  if (typeof value === "number") return value * 2; // 99% → передбачуваний!
  return 0; // рідкісні випадки в кінці
}


// ==========================================================================
// КОЛИ BRANCH PREDICTION НАЙБІЛЬШ КРИТИЧНИЙ
// ==========================================================================
// 1. Великі масиви з фільтрацією — .filter(), ручні цикли з if
// 2. Particle systems — перевірка активності частинок
// 3. Collision detection — перевірка меж
// 4. Data processing pipelines — обробка великих датасетів
//
// Для малих масивів (< 1000 елементів) branch prediction НЕ має
// помітного впливу.


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// | Ситуація                    | Prediction Miss Rate     | Вплив                  |
// |--------------------------------|-----------------------------|--------------------------|
// | Відсортовані дані            | ~0% (1 miss на перехід)   | Максимальна швидкість  |
// | Завжди true/false             | ~0%                        | Максимальна швидкість  |
// | Чергування T/F/T/F            | ~100%                      | Найгірший варіант      |
// | Випадкові дані (50/50)        | ~50%                       | 2-3x повільніше         |
// | Branchless (Math.min/max)     | 0%                         | Немає branch взагалі   |
//
// КЛЮЧОВИЙ ПРИНЦИП: роби гілки передбачуваними — або сортуй дані, або
// виноси рідкісні умови назовні, або замінюй branch математикою.