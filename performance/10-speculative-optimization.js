// ==========================================================================
// SPECULATIVE OPTIMIZATION & DEOPTIMIZATION — V8 OPTIMIZATION
// ==========================================================================

// 0. ЗАГАЛЬНА ІДЕЯ
// -----------------------------------------------------
// Speculative Optimization — ключова стратегія TurboFan: компілювати
// НАЙШВИДШИЙ можливий код на основі спостережень, і мати ЗАПАСНИЙ ПЛАН,
// якщо припущення виявилось хибним. Цей файл узагальнює механіки з
// попередніх принципів (01-09) і додає практичні патерни для контролю
// деоптимізації.


// ==========================================================================
// 1. ЯК ПРАЦЮЄ SPECULATION
// ==========================================================================

// V8 НЕ просто компілює код — він компілює ОПТИМІСТИЧНИЙ код з
// вбудованими перевірками (guards):

function multiply(x) {
  return x * x;
}
// V8 спостерігає: завжди SMI → компілює (концептуально):
//   function multiply(x) {
//     GUARD: typeof x === SMI → якщо ні: DEOPTIMIZE
//     return x * x; // пряма машинна інструкція (1 такт)
//   }

// GUARD — це маленька перевірка перед швидким кодом:
//
//   ; ARM64: оптимізований multiply(x)
//   tst  x0, #1              ; перевір, чи x — SMI (bit tag)
//   bne  .deoptimize          ; якщо ні → deoptimize
//   mul  x0, x0, x0          ; x * x (швидко!)
//   ret
//   .deoptimize:
//   bl   DeoptimizeFunction  ; повернись до інтерпретатора
//
// Якщо guard спрацьовує РІДКО або НІКОЛИ — функція працює на
// максимальній швидкості. Якщо ЧАСТО — деоптимізація стає bottleneck.


// ==========================================================================
// 2. ДВА ТИПИ DEOPTIMIZATION
// ==========================================================================

// 2.1. EAGER DEOPT (негайна)
// -----------------------------------------------------
// Відбувається, коли guard НЕ пройшов ПРЯМО під час виконання:

function add(a, b) {
  return a + b;
}
for (let i = 0; i < 100000; i++) add(i, 1); // 100k разів з числами →
                                              // TurboFan компілює під числа
// add("hello", " world"); // ← EAGER DEOPT тут і зараз
// V8: "Guard failed! Викидаю оптимізований код, повертаюсь до Ignition"


// 2.2. LAZY DEOPT (відкладена)
// -----------------------------------------------------
// Відбувається, коли ЗОВНІШНІЙ стан змінився, поки функція виконувалась:

function processUser(user) {
  return user.name.toUpperCase(); // оптимізовано під { name: String }
}
// поки processUser виконується, хтось робить:
//   user.name = 42; // тип змінився! → Lazy deopt при наступному виклику


// ==========================================================================
// 3. ВАРТІСТЬ DEOPTIMIZATION
// ==========================================================================

// Один deopt event:
//   1) зупини виконання оптимізованого коду       (~0.1ms)
//   2) reconstruct stack frame для інтерпретатора  (~0.3ms)
//   3) продовж в Ignition (30x повільніше)          (ongoing)
//   4) збери нову статистику типів                 (кілька тисяч викликів)
//   5) спробуй скомпілювати знову (тепер ширше)     (~1-2ms)
//   Разом: ~0.5-2ms на один deopt + функція тимчасово виконується
//   в інтерпретаторі
//
// Якщо deopt відбувається в requestAnimationFrame:
//   ~0.5ms / 16.67ms per frame = 3% frame budget витрачено ТІЛЬКИ на deopt!


// ==========================================================================
// 4. ЯК ЗНАЙТИ DEOPTIMIZATIONS
// ==========================================================================

//   node --trace-deopt myfile.js
//   node --trace-deopt --trace-deopt-verbose myfile.js
//
// Виведе:
//   [deoptimizing (DEOPT eager)]: begin 0x2a4b multiply
//     reason: not a Smi
//     function: multiply (0x2a4b)
//     bytecode offset: 4
//   [deoptimizing]: end 0x2a4b multiply => node=3 height=1 took 0.432 ms
//
//   node --prof myfile.js
//   node --prof-process isolate-*.log | grep -A5 "deopt"


// ==========================================================================
// 5. ПРАВИЛЬНИЙ "РОЗІГРІВ" ФУНКЦІЙ
// ==========================================================================

// V8 потребує КІЛЬКА ТИСЯЧ викликів, щоб вирішити компілювати функцію
// через TurboFan. Правильний warm-up — критичний для production коду.

function calculate(x) {
  return x * 2 + 1;
}

// ❌ Неправильний warm-up: різні типи під час розігріву
// calculate(1);
// calculate(1.5);   // ← HeapNumber під час warm-up!
// calculate("2");   // ← String під час warm-up!
// Після warm-up функція megamorphic — повільна назавжди

// ✅ Правильний warm-up: тільки очікувані типи
for (let i = 0; i < 10000; i++) {
  calculate(i); // тільки SMI → TurboFan компілює під SMI
}
// тепер calculate оптимізована для чисел


// ==========================================================================
// ПРАВИЛА ДЛЯ SPECULATIVE OPTIMIZATION
// ==========================================================================

// ПРАВИЛО 1: Не "бруднити" функції під час розробки/тестування
// -----------------------------------------------------
function calculatePrice(quantity, price) {
  // основна функція — завжди числа, завжди швидка
  return quantity * price;
}
// ❌ Тести з неправильними типами "бруднять" функцію
// calculatePrice("invalid", 10); // ← бруднить у тестах!
// calculatePrice(5, null);        // ← бруднить у тестах!
// у production функція вже megamorphic ПІСЛЯ тестів!

// ✅ Перевіряй типи явно, не бруднь основну логіку
function safeCalculatePrice(quantity, price) {
  // захист тут — окремо від гарячої функції
  if (typeof quantity !== "number" || typeof price !== "number") {
    throw new TypeError("Очікувались числа");
  }
  return calculatePrice(quantity, price);
}


// ПРАВИЛО 2: Ізолюй поліморфний код від монаморфного
// -----------------------------------------------------
// ❌ Поліморфний код в одній функції з гарячою логікою
function processValueBad(value) {
  const result = value * 2 + 1; // ця частина — гаряча, має бути monomorphic
  if (typeof value === "number") console.log(`Number: ${value}`); // поліморфна логування
  else if (typeof value === "string") console.log(`String: ${value}`);
  return result;
}

// ✅ Розділи: гаряча функція залишається monomorphic
function processValue(value) {
  return value * 2 + 1; // завжди числа, monomorphic, inlining!
}
function logValue(value) {
  if (typeof value === "number") console.log(`Number: ${value}`);
  else if (typeof value === "string") console.log(`String: ${value}`);
}
function processValueWithLog(value) {
  const result = processValue(value); // processValue інлайниться
  logValue(value);                     // поліморфний код окремо
  return result;
}


// ПРАВИЛО 3: Уникай зміни типів властивостей після ініціалізації
// -----------------------------------------------------
// ❌ Зміна типу властивості → deopt для ВСЬОГО коду, що використовує об'єкт
const configBad = { timeout: 5000 }; // number
// десь пізніше:
// configBad.timeout = "disabled"; // ← змінює тип! Lazy deopt!

// ✅ Використовуй окрему властивість для різних станів
const config = {
  timeout: 5000,
  timeoutDisabled: false,
};
config.timeoutDisabled = true; // Boolean → Boolean (стабільно)


// ПРАВИЛО 4: Перевіряй типи на межах системи, не всередині
// -----------------------------------------------------
// ❌ Перевірка типів усередині гарячої функції
function transformBad(matrix, vector) {
  if (!Array.isArray(matrix)) throw new Error("matrix must be array"); // guard всередині гарячої функції
  if (!Array.isArray(vector)) throw new Error("vector must be array");
  return [
    matrix[0] * vector[0] + matrix[1] * vector[1],
    matrix[2] * vector[0] + matrix[3] * vector[1],
  ];
}

// ✅ Перевірка на межі + чиста гаряча функція
function validateInputs(matrix, vector) {
  if (!Array.isArray(matrix)) throw new Error("matrix must be array");
  if (!Array.isArray(vector)) throw new Error("vector must be array");
}
function transform(matrix, vector) {
  // чиста математика, без перевірок → завжди monomorphic
  return [
    matrix[0] * vector[0] + matrix[1] * vector[1],
    matrix[2] * vector[0] + matrix[3] * vector[1],
  ];
}
// використання:
const sampleMatrix = [1, 0, 0, 1];
const sampleVector = [3, 4];
validateInputs(sampleMatrix, sampleVector); // один раз, на межі
const transformResult = transform(sampleMatrix, sampleVector); // швидко, без guards
console.log(transformResult);


// ПРАВИЛО 5: Стеж за "отруєними" (poisoned) функціями
// -----------------------------------------------------
// Функція МОЖЕ бути "отруєна" і НІКОЛИ не відновитись до оптимального
// стану після deopt з megamorphic:

function hotFunction(x) {
  return x + 1; // ніколи не отримує неправильний тип
}
// якщо хтось викликав з рядком: hotFunction("oops"); ← Deopt! Тепер
// polymorphic назавжди. Єдине рішення: створити НОВУ функцію (свіжа
// компіляція) або перезапустити процес.

// ✅ Захист: перевіряй у wrapper, не в самій функції
function hotFunctionSafe(x) {
  if (typeof x !== "number") return NaN; // wrapper перехоплює
  return hotFunction(x);
}


// ==========================================================================
// 6. DEOPT-RESISTANT PATTERNS
// ==========================================================================

// Патерни, які роблять код СТІЙКИМ до деоптимізації:

// 1) КОНСТАНТНІ ФУНКЦІЇ — ніколи не деоптимізуються, якщо тип стабільний
const double = (x) => x * 2;

// 2) TYPED ARRAYS — V8 знає тип на 100%
const typedArrForDeopt = new Float64Array(1000);
// typedArrForDeopt[i] ЗАВЖДИ Float64 → жодних guards → жодних deopt

// 3) CLASS-МЕТОДИ ЗІ СТАБІЛЬНИМИ ФОРМАМИ
class Vec2 {
  constructor(x, y) {
    this.x = x; // завжди number
    this.y = y; // завжди number
  }
  dot(other) {
    return this.x * other.x + this.y * other.y; // monomorphic назавжди
  }
}

// 4) PURE FUNCTIONS — легко оптимізуються та стабільні
function lerp(a, b, t) {
  return a + (b - a) * t; // завжди числа, pure, жодних side effects
}


// ==========================================================================
// ВПЛИВ НА ПРОДУКТИВНІСТЬ — БЕНЧМАРК
// ==========================================================================

const { performance } = require("perf_hooks");

function hotCalc(x) {
  return x * x + x * 2 + 1;
}

// ✅ Правильний warm-up
for (let i = 0; i < 10000; i++) hotCalc(i);

let t0 = performance.now();
for (let i = 0; i < 100000000; i++) hotCalc(i);
console.log(`After correct warmup: ${(performance.now() - t0).toFixed(0)}ms`);

// ❌ "Отруюємо" функцію
hotCalc("poison");
hotCalc(1.5);
hotCalc(null);

t0 = performance.now();
for (let i = 0; i < 100000000; i++) hotCalc(i);
console.log(`After poisoning:      ${(performance.now() - t0).toFixed(0)}ms`);

// Орієнтовний результат:
//   After correct warmup: ~120ms  (monomorphic)
//   After poisoning:      ~580ms  (megamorphic після deopt)
//   Різниця: ~5x


// ==========================================================================
// ПІДСУМОК: УСІ 10 ПРИНЦИПІВ РАЗОМ
// ==========================================================================

// Speculative Optimization — це ФІНАЛЬНИЙ ШАР. Усі попередні принципи
// по суті про те, щоб НЕ ЗМУШУВАТИ V8 деоптимізуватись:
//
// | Принцип             | Як запобігає deopt                                          |
// |------------------------|-----------------------------------------------------------------|
// | Hidden Classes (01)   | Стабільна форма → guard для shape завжди проходить         |
// | Type Stability (02)   | Стабільний тип → guard для типу завжди проходить            |
// | Escape Analysis (03)  | Менше об'єктів на Heap → менше guards для GC               |
// | Inline Caching (04)   | Monomorphic IC → швидкий шлях без deopt                     |
// | GC Patterns (05)      | Менше алокацій → менше GC-induced deopt                     |
// | Function Size (06)    | Маленькі функції → inlining → менше точок deopt             |
// | Loop Optimization (07)| Typed Arrays → V8 знає типи точно → 0 guards                |
// | Branch Prediction (08)| Передбачувані гілки → CPU не флашить pipeline               |
// | Allocation Opt (09)   | Менше алокацій → менше тиску → стабільніша компіляція       |
// | Speculative Opt (10)  | Правильний warm-up → V8 компілює під правильний тип         |
//
// КЛЮЧОВИЙ ПРИНЦИП: V8 оптимізує агресивно, але потребує
// ПЕРЕДБАЧУВАНОСТІ. Будь передбачуваним у типах, формах об'єктів та
// патернах доступу — і TurboFan згенерує код, що конкурує з
// компільованими мовами.
//
// ЧЕКЛИСТ:
// [ ] Чи є функції, що отримують різні типи в різних контекстах?
// [ ] Чи "бруднять" тести або dev-код production функції неправильними типами?
// [ ] Чи є зміни типів властивостей після ініціалізації об'єктів?
// [ ] Чи є валідація типів усередині гарячих функцій (виноси назовні!)?
// [ ] Чи розігріваються гарячі функції правильними типами перед використанням?
//
// ПРОФІЛЮВАННЯ: ПОВНИЙ TOOLKIT
//   node --trace-deopt myfile.js      # знайти всі deopt-події
//   node --trace-opt myfile.js        # детальний профіль оптимізацій
//   node --trace-ic myfile.js         # IC-стани (monomorphic/polymorphic/megamorphic)
//   node --prof myfile.js             # повний профіль для аналізу
//   node --prof-process isolate-*.log > profile.txt