// ==========================================================================
// HIDDEN CLASSES (SHAPES) & OBJECT SHAPE CONSISTENCY — V8 OPTIMIZATION
// ==========================================================================

// 0. ЗАГАЛЬНА ІДЕЯ
// -----------------------------------------------------
// Hidden Classes (у сучасному V8 їх називають Shapes) — внутрішня
// оптимізація, яка дозволяє рушію ДУЖЕ швидко звертатись до властивостей
// об'єкта. Це ОДНА З НАЙВАЖЛИВІШИХ оптимізацій V8, бо вона стосується
// МАЙЖЕ КОЖНОГО об'єкта, який ти створюєш.
//
// Основне правило: ІНІЦІАЛІЗУЙ УСІ властивості при СТВОРЕННІ об'єкта.
// НІКОЛИ не додавай і не видаляй властивості динамічно ПІСЛЯ створення.
//
// Розуміння Hidden Classes дає 2-9x приросту продуктивності для
// об'єктно-орієнтованого коду.


// ==========================================================================
// 1. ПРОБЛЕМА, ЯКУ ВИРІШУЮТЬ HIDDEN CLASSES
// ==========================================================================

// 1.1. БЕЗ ОПТИМІЗАЦІЙ: СЛОВНИКОВИЙ ПОШУК
// -----------------------------------------------------
// Уяви, що ти — рушій V8. Користувач пише:
//
//   const person = { name: "Alice", age: 30 };
//   console.log(person.name); // як знайти "name"?
//
// БЕЗ оптимізацій довелось би зберігати словник (dictionary) прямо
// всередині об'єкта:
//
//   person = {
//     dict: {
//       "name": адреса Z (зберігає "Alice"),
//       "age":  адреса W (зберігає 30)
//     }
//   }
//
// Кожен доступ person.name виконував би:
//   1) подивись у __dict__
//   2) знайди ключ "name"
//   3) дістань адресу Z
//   4) прочитай значення
//
// Це O(log n) або навіть O(n) операція. При МІЛЬЙОНАХ доступів —
// дуже повільно:
//
//   for (let i = 0; i < 10000000; i++) {
//     const val = person.name; // O(log n) * 10M = повільно
//   }

const person = { name: "Alice", age: 30 };
console.log(person.name); // "Alice"


// 1.2. СПОСТЕРЕЖЕННЯ V8: БІЛЬШІСТЬ ОБ'ЄКТІВ ОДНІЄЇ "ФОРМИ"
// -----------------------------------------------------
// V8 помічає патерн:

const person1 = { name: "Alice", age: 30 };
const person2 = { name: "Bob", age: 25 };
const person3 = { name: "Carol", age: 35 };

// Усі три об'єкти мають ОДНІ Й ТІ Ж властивості в ОДНОМУ Й ТОМУ Ж
// ПОРЯДКУ: спершу name, потім age. Це можна використати для оптимізацій!


// ==========================================================================
// 2. ІДЕЯ HIDDEN CLASSES
// ==========================================================================

// Замість зберігати словник у КОЖНОМУ об'єкті, V8 ВИТЯГУЄ опис форми
// в ОКРЕМИЙ, СПІЛЬНИЙ об'єкт — Hidden Class (Shape):
//
//   Hidden Class A:
//   ┌─────────────────┐
//   │ name: String     │  offset: +8 bytes
//   │ age: Number      │  offset: +16 bytes
//   └─────────────────┘
//   person1 → [Shape: A] → { "Alice", 30 }
//   person2 → [Shape: A] → { "Bob", 25 }
//   person3 → [Shape: A] → { "Carol", 35 }
//
// Тепер доступ person1.name:
//
//   БЕЗ оптимізації:
//     lookup("name") in dictionary → адреса → значення (O(log n), повільно)
//
//   З Hidden Class:
//     offset = Shape.getOffset("name"); // = 8 (один раз, потім кешується)
//     value = memory[person_address + 8]; // O(1), швидко
//
// Це змінює O(log n) на O(1)!


// ==========================================================================
// 3. ДЕТАЛЬНА МЕХАНІКА OFFSET
// ==========================================================================

// 3.1. ЩО ТАКЕ OFFSET
// -----------------------------------------------------
// Offset — це ВІДСТАНЬ У БАЙТАХ від початку об'єкта до властивості.
//
// Уяви, що об'єкт розташований в пам'яті:
//
//   Адреса пам'яті:    Вміст:
//   0x1000            [Object Header - 8 байтів]
//   0x1008            [name value - 8 байтів]
//   0x1010            [age value - 8 байтів]
//   0x1018            [salary value - 8 байтів]
//
// Offset відраховується від адреси об'єкта:
//
//   const person = ...; // знаходиться за адресою 0x1000
//   // властивість "name" за адресою 0x1008 → offset = 0x1008 - 0x1000 = 8
//   // властивість "age"  за адресою 0x1010 → offset = 0x1010 - 0x1000 = 16
//   // властивість "salary" за адресою 0x1018 → offset = 0x1018 - 0x1000 = 24


// 3.2. ЧОМУ OFFSET 8, 16, 24
// -----------------------------------------------------
// На 64-бітних системах (ARM64, x86-64) кожне значення займає 8 байтів:
//
//   SMI (Small Integer)  → 8 байтів
//   Double (число)       → 8 байтів
//   String (вказівник)   → 8 байтів
//   Boolean               → 8 байтів
//   Object/Array ref      → 8 байтів
//
// Структура об'єкта:
//
//   ┌───────────────────┐
//   │ HEADER (offset 0) │ ← Map pointer (вказівник на Shape) + GC-метадані
//   └───────────────────┘
//   ┌─────────────────┐
//   │ PROPERTY 1       │ ← offset 8  (перша властивість)
//   └─────────────────┘
//   ┌─────────────────┐
//   │ PROPERTY 2       │ ← offset 16 (друга властивість)
//   └─────────────────┘
//   ┌─────────────────┐
//   │ PROPERTY 3       │ ← offset 24 (третя властивість)
//   └─────────────────┘
//
// Чому НЕ з offset 0? Бо offset 0 ЗАЙНЯТИЙ заголовком (Map pointer,
// GC info). Перша властивість завжди починається з offset 8.


// 3.3. НА РІВНІ ASM (ARM64)
// -----------------------------------------------------
// Коли V8 генерує машинний код, це виглядає так:
//
//   ; person у регістрі x0
//   ; отримати значення name по offset 8
//   ldr x1, [x0, #8]  ; завантаж значення з адреси (x0 + 8) у x1
//   ret               ; повернись (результат у x1)
//
// Це ДУЖЕ швидко — один процесорний такт!


// ==========================================================================
// 4. ЯК V8 БУДУЄ HIDDEN CLASSES (TRANSITION CHAIN)
// ==========================================================================

// Коли V8 бачить новий об'єкт, він будує Shape через "ланцюг переходів"
// (transition chain):

const obj = {};
// Крок 1: Shape0: {} (порожня форма)

obj.x = 10;
// Крок 2: додано властивість x → Shape0 → Shape1: { x (offset 8) }

obj.y = 20;
// Крок 3: додано властивість y → Shape1 → Shape2: { x (offset 8), y (offset 16) }

obj.z = 30;
// Крок 4: додано властивість z → Shape2 → Shape3: { x (offset 8), y (offset 16), z (offset 24) }

// ЦЕ ВАЖЛИВО: V8 будує це як ЛАНЦЮГ. Кожна нова властивість = НОВИЙ Shape.
// obj: Shape0 → Shape1 → Shape2 → Shape3


// ==========================================================================
// 5. INLINE CACHING & ДІЗНАВАННЯ ФОРМ
// ==========================================================================

// Коли ти пишеш функцію:
function getName(obj) {
  return obj.name;
}

// V8 НЕ ЗНАЄ заздалегідь, яку форму матиме obj. Тому при ПЕРШОМУ виклику:
//   1) подивись на об'єкт і його Shape
//   2) знайди offset для "name" у цьому Shape
//   3) ЗАПАМ'ЯТАЙ цей Shape + offset у Inline Cache

const shapeAPerson1 = { name: "Alice", age: 30 };
getName(shapeAPerson1); // V8: "Я бачу Shape A, name на offset 8" → кешується: Shape A → offset 8

const shapeAPerson2 = { name: "Bob", age: 25 };
getName(shapeAPerson2); // V8: "Чи person2 має Shape A? Так! Використай кеш." — дуже швидко

// Але що якщо порядок властивостей ІНШИЙ:
const shapeBPerson = { age: 30, name: "Dave" }; // ІНШИЙ ПОРЯДОК! → інший Shape
getName(shapeBPerson);
// Cache miss! shapeBPerson має Shape B, а не Shape A.
// V8 тепер РОЗШИРЮЄ Inline Cache:
//   Inline Cache для getName:
//     Shape A → offset 8 ✓
//     Shape B → offset 8 ✓ (у Shape B name якраз на offset 8, бо age перше)
// Це називається POLYMORPHIC INLINE CACHE — кеш пам'ятає КІЛЬКА Shapes.


// ==========================================================================
// 6. MEGAMORPHISM — КРАХ ОПТИМІЗАЦІЙ
// ==========================================================================

// V8 не може пам'ятати БЕЗМЕЖНО. Inline Cache має ліміт (зазвичай 4 записи).

function getX(obj) {
  return obj.x;
}

const megaObj1 = { x: 1, y: 2 };            // Shape A
const megaObj2 = { y: 2, x: 1 };            // Shape B (інший порядок)
const megaObj3 = { x: 1, y: 2, z: 3 };      // Shape C (додатковий z)
const megaObj4 = { x: 1 };                   // Shape D (без y)
const megaObj5 = { a: 1, x: 2, b: 3 };      // Shape E (інші властивості)

getX(megaObj1); // Cache: [A → 8]
getX(megaObj2); // Cache: [A → 8, B → 8]
getX(megaObj3); // Cache: [A → 8, B → 8, C → 8]
getX(megaObj4); // Cache: [A → 8, B → 8, C → 8, D → 8]
getX(megaObj5); // ❌ CACHE OVERFLOW! 5-й Shape — V8: "забудь про детальний
                //     кеш, просто інтерпретуй" → MEGAMORPHIC режим

// У Megamorphic режимі замість:
//   if (shape === A) { return [addr + 8]; } else if (shape === B) { ... }
// V8 робить:
//   lookup(obj, "x") // у ЗАГАЛЬНІЙ таблиці (дуже повільно)
//
// Це може бути 10-20x ПОВІЛЬНІШЕ!


// 6.1. НА РІВНІ ASM
// -----------------------------------------------------
// Monomorphic code (одна форма):
//
//   ldr x1, [x0, #8]  ; просто прочитай по offset 8
//   ret
//   ; 2 інструкції, 1 такт
//
// Megamorphic code (багато форм):
//
//   ldr x1, [x0]              ; завантаж Shape
//   movz x2, 0x12345678       ; очікуваний Shape
//   cmp x1, x2                ; порівняй
//   bne .slow_path            ; якщо не підходить — повільний шлях
//   ldr x0, [x0, #8]          ; прочитай
//   ret
//   .slow_path:
//   bl GetPropertySlow        ; виклич функцію (ДУЖЕ повільно, 30+ інструкцій)
//   ret


// ==========================================================================
// 7. ПРАКТИЧНІ ПРИКЛАДИ
// ==========================================================================

// 7.1. ПОРЯДОК ВЛАСТИВОСТЕЙ МАЄ ЗНАЧЕННЯ
// -----------------------------------------------------
function createPersonA(name, age, email) {
  return { name, age, email }; // Shape 1: { name, age, email }
}
function createPersonB(name, age, email) {
  return { email, name, age }; // Shape 2: { email, name, age } — ІНШИЙ ПОРЯДОК!
}
function displayPerson(person) {
  return person.name + " (" + person.age + ")";
}

const orderP1 = createPersonA("Alice", 30, "alice@example.com");
const orderP2 = createPersonB("Bob", 25, "bob@example.com");

displayPerson(orderP1); // Shape 1
displayPerson(orderP2); // Shape 2 ← інша форма!
// Cache miss! Megamorphic операція.
//
// ЧОМУ ЦЕ ПРОБЛЕМА: V8 компілює displayPerson під форму
// { name, age, email } і кешує offset name=8, age=16. Коли приходить
// об'єкт з ІНШИМ порядком, offset ЗМІНЮЮТЬСЯ (у Shape 2: name=24, age=8) —
// кеш неточний → cache miss → повільніше.


// 7.2. ДИНАМІЧНЕ ДОДАВАННЯ ВЛАСТИВОСТЕЙ
// -----------------------------------------------------
// ❌ Погано:
const userDynamic = { name: "Alice" };
userDynamic.email = "alice@example.com"; // ❌ SHAPE CHANGE!
userDynamic.age = 30;                     // ❌ SHAPE CHANGE!
// user змінив Shape тричі: {} → {name} → {name, email} → {name, email, age}
// Будь-який код, оптимізований під {name}, тепер невалідний.

// ✅ Добре:
const userStatic = {
  name: "Alice",
  email: "alice@example.com",
  age: 30,
  // усі властивості ІНІЦІАЛІЗОВАНІ в ОДНОМУ об'єкті одразу
};
// userStatic має ОДНУ, стабільну форму із самого початку.


// 7.3. ТИПИ ВЛАСТИВОСТЕЙ ТЕЖ МАЮТЬ ЗНАЧЕННЯ
// -----------------------------------------------------
// ❌ Нестійність типу:
const obj1Unstable = { value: 10 }; // value: SMI (Small Integer)
obj1Unstable.value = 3.14;           // ❌ тип змінився на Double → SHAPE CHANGE!
function process(obj) {
  return obj.value * 2;
}
process(obj1Unstable); // спершу V8 бачить число, компілює під SMI
obj1Unstable.value = 3.14; // тип змінився!
process(obj1Unstable); // Cache miss! obj.value тепер Double — деоптимізація

// ✅ Консистентні типи:
const consistentObj = { value: 10, multiplier: 2 };
consistentObj.value = 20;      // усе ще число, форма не змінюється
consistentObj.multiplier = 3;  // усе ще число, форма не змінюється

// Якщо потрібні РІЗНІ типи — використовуй ОКРЕМІ властивості:
const mixed = {
  count: 0,      // number
  status: "",    // string
  active: false, // boolean
};


// ==========================================================================
// 8. КЛАСИ VS ЛІТЕРАЛИ — ЩО НАДІЙНІШЕ ГАРАНТУЄ ФОРМУ
// ==========================================================================

// Класи ГАРАНТУЮТЬ консистентну форму краще, ніж "вільні" літерали:

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
const classPoint1 = new Point(1, 2); // Shape: { x, y }
const classPoint2 = new Point(3, 4); // Shape: { x, y } — ГАРАНТОВАНО одна й та сама!

// Літерали (ПОТЕНЦІЙНО різні форми, якщо порядок написання відрізняється):
const literalPoint1 = { x: 1, y: 2 };
const literalPoint2 = { y: 2, x: 1 }; // МОЖЛИВО, інша форма!

// Якщо класи не використовуєш (React/Vue) — використовуй ФАБРИЧНІ ФУНКЦІЇ
// для консистентного порядку:
function createPoint(x, y) {
  return { x, y }; // ЗАВЖДИ той самий порядок
}
const factoryPoint1 = createPoint(1, 2);
const factoryPoint2 = createPoint(3, 4);


// ==========================================================================
// 9. КОНТЕКСТ-СПЕЦИФІЧНІ ПРИКЛАДИ
// ==========================================================================

// 9.1. ЧИСТИЙ JAVASCRIPT
// -----------------------------------------------------
// ❌ Неправильно:
function createUserBad() {
  const user = { name: "Alice" };
  user.email = "alice@example.com";
  user.phone = "123-456";
  return user;
}

// ✅ Правильно: фабрична функція з усіма полями одразу
function createUser(name, email = "", phone = "") {
  return { name, email, phone };
}
const goodUser = createUser("Alice", "alice@example.com", "123-456");


// 9.2. VUE (COMPOSITION API) — ПСЕВДОКОД (потребує Vue-рантайму)
// -----------------------------------------------------
// import { reactive } from "vue";
//
// ❌ Неправильно:
// const state = reactive({ user: { name: "Alice" } });
// state.user.email = "alice@example.com"; // Shape change!
//
// ✅ Правильно:
// function useUser() {
//   const state = reactive({
//     user: { name: "Alice", email: "", phone: "" },
//   });
//   return { state };
// }


// 9.3. REACT (HOOKS) — ПСЕВДОКОД (потребує React-рантайму)
// -----------------------------------------------------
// ❌ Неправильно:
// const [user, setUser] = useState({ name: "Alice" });
// const loadUser = async (id) => {
//   const data = await fetch(`/api/users/${id}`);
//   const json = await data.json();
//   setUser((prev) => ({ ...prev, email: json.email, phone: json.phone })); // Shape change!
// };
//
// ✅ Правильно:
// const [user, setUser] = useState({ name: "", email: "", phone: "" });
// const loadUser = useCallback(async (id) => {
//   const data = await fetch(`/api/users/${id}`);
//   const json = await data.json();
//   setUser({ name: json.name, email: json.email, phone: json.phone });
// }, []);


// ==========================================================================
// 10. РЕАЛЬНИЙ БЕНЧМАРК (запусти через `node 01-hidden-classes.js`)
// ==========================================================================

const { performance } = require("perf_hooks");

// ❌ Нестійні об'єкти (динамічні форми)
function createUnstableObject() {
  const o = {};
  o.a = 1;
  o.b = 2;
  o.c = 3;
  return o;
}

// ✅ Стійкі об'єкти (фіксована форма)
function createStableObject() {
  return { a: 1, b: 2, c: 3 };
}

function sumProperties(obj) {
  return obj.a + obj.b + obj.c;
}

console.log("Unstable objects:");
const unstableArr = [];
for (let i = 0; i < 100000; i++) {
  unstableArr.push(createUnstableObject());
}
let t0 = performance.now();
for (let i = 0; i < 10000000; i++) {
  sumProperties(unstableArr[i % unstableArr.length]);
}
console.log(`Time: ${(performance.now() - t0).toFixed(2)}ms`);

console.log("\nStable objects:");
const stableArr = [];
for (let i = 0; i < 100000; i++) {
  stableArr.push(createStableObject());
}
t0 = performance.now();
for (let i = 0; i < 10000000; i++) {
  sumProperties(stableArr[i % stableArr.length]);
}
console.log(`Time: ${(performance.now() - t0).toFixed(2)}ms`);

// Орієнтовний результат:
//   Unstable objects: ~450ms
//   Stable objects:   ~50ms
//   Різниця: 9x


// ==========================================================================
// 11. ЯК ПОБАЧИТИ HIDDEN CLASSES НАЖИВО
// ==========================================================================

// 11.1. У Chrome DevTools
// -----------------------------------------------------
// 1) Відкрий DevTools (F12)
// 2) Перейди в Console
// 3) Введи ім'я об'єкта (наприклад, p)
// 4) Розгорни об'єкт
// 5) Подивись на [[Prototype]] чи іншу shape-інформацію в деталях

// 11.2. У Node.js з --trace-ic
// -----------------------------------------------------
//   node --trace-ic myfile.js 2>&1 | head -50
//
// Результат приблизно такий:
//   [VariableObject 0x1234: property_load x → SMI/FAST]
//   [VariableObject 0x1234: property_load y → SMI/FAST]
//   [VariableObject 0x5678: megamorphic_store value]

// 11.3. Через --prof та tick processor
// -----------------------------------------------------
//   node --prof myfile.js         # створить v8.log
//   node --prof-process v8.log | head -100
// покаже, де V8 megamorphic, а де оптимізовано


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// - Hidden Class (Shape) — опис структури об'єкта, який V8 використовує
//   для оптимізації доступу до властивостей: замість словника — offset
// - Offset — байтова позиція властивості в пам'яті (на 64-біт системах
//   зазвичай 8, 16, 24, ... байтів; offset 0 зайнятий заголовком)
// - Кожна нова властивість, додана ПІСЛЯ створення об'єкта, створює
//   НОВИЙ Shape в ланцюжку transition chain
// - Inline Cache запам'ятовує, яку форму очікує функція, і кешує offset;
//   Polymorphic IC пам'ятає до ~4 форм
// - Megamorphism (>4 форм) = крах оптимізацій — V8 падає до словникового
//   пошуку (10-20x повільніше)
// - ПРАКТИЧНІ ПРАВИЛА:
//   • ініціалізуй УСІ властивості одразу при створенні об'єкта
//   • дотримуйся ОДНОГО порядку властивостей для однотипних об'єктів
//   • уникай динамічного додавання/видалення властивостей
//   • уникай зміни ТИПУ вже наявної властивості (number → string тощо)
//   • для масивів об'єктів — одна консистентна форма для всіх елементів
//   • класи гарантують стабільну форму краще за "вільні" літерали;
//     якщо класів немає — використовуй фабричні функції
// - вплив: 2-9x різниця між monomorphic та megamorphic кодом
//
// ЧЕКЛИСТ ПЕРЕД НАПИСАННЯМ КОДУ:
// [ ] Чи ініціалізую я ВСІ властивості об'єкта при створенні?
// [ ] Чи додаю я властивості динамічно пізніше?
// [ ] Чи дотримуюсь я одного порядку властивостей?
// [ ] Чи змінюю я тип властивості (число → рядок)?
// [ ] Чи масив об'єктів має консистентну структуру?