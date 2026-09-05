// ==========================================================================
// CLOSURES (ЗАМИКАННЯ) — ФУНКЦІЯ + "ЗАМОРОЖЕНЕ" ЛЕКСИЧНЕ ОТОЧЕННЯ
// ==========================================================================

// 1. ВИЗНАЧЕННЯ
// -----------------------------------------------------
// Closure (замикання) — це функція РАЗОМ ІЗ посиланням на лексичне
// оточення, у якому вона БУЛА СТВОРЕНА. Це посилання зберігається
// НАЗАВЖДИ, НАВІТЬ ЯКЩО зовнішня функція вже ЗАВЕРШИЛА виконання
// і, здавалося б, її змінні мали б зникнути. Це ПРЯМИЙ наслідок
// лексичного скоупінгу (детально в common/variables-and-execution-context/scope.js):
// функція завжди шукає вільні змінні там, де вона НАПИСАНА, а не
// там, де вона ВИКЛИКАНА.

function makeGreeter(greeting) {
  return function (name) {
    return `${greeting}, ${name}!`; // greeting — ВІЛЬНА змінна, взята із зовнішньої функції
  };
}

const greetUkrainian = makeGreeter("Привіт");
const greetEnglish = makeGreeter("Hello");

console.log(greetUkrainian("Іван")); // "Привіт, Іван!"
console.log(greetEnglish("John"));    // "Hello, John!"
// makeGreeter("Привіт") давно ЗАВЕРШИВСЯ, але greetUkrainian
// ВСЕ ОДНО "пам'ятає" значення greeting = "Привіт" — це і є closure


// ==========================================================================
// 2. ЩО САМЕ "ЖИВЕ" В ЗАМИКАННІ — НЕ КОПІЯ ЗНАЧЕННЯ, А ПОСИЛАННЯ НА ЗМІННУ
// ==========================================================================

// Замикання зберігає ПОСИЛАННЯ на САМУ ЗМІННУ (binding), а НЕ
// "знімок" її значення на момент створення функції. Тому якщо
// зовнішня змінна ЗМІНЮЄТЬСЯ ПІСЛЯ створення функції, замикання
// побачить НОВЕ значення.

function makeCounter() {
  let count = 0; // count живе в ЛЕКСИЧНОМУ ОТОЧЕННІ makeCounter
  return {
    increment() {
      count += 1; // ЗМІНЮЄ ту саму зовнішню змінну
      return count;
    },
    reset() {
      count = 0; // ІНША функція, АЛЕ той самий count через СПІЛЬНЕ замикання
      return count;
    },
  };
}

const counter = makeCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.reset());     // 0 — reset() і increment() ДІЛЯТЬ ОДНЕ й ТЕ САМЕ count

// КОЖЕН виклик makeCounter() створює НОВЕ, повністю НЕЗАЛЕЖНЕ
// лексичне оточення — тому різні "лічильники" НЕ заважають один одному:
const counter2 = makeCounter();
console.log(counter2.increment()); // 1 — власний, окремий count, не 3


// ==========================================================================
// 3. КЛАСИЧНА ПАСТКА: var У ЦИКЛІ + ЗАМИКАННЯ (СПІЛЬНА ЗМІННА НА ВСІХ)
// ==========================================================================

// (детально в common/variables-and-execution-context/var.js — тут
// фокус саме на ПРИЧИНІ через призму замикань)

var callbacksWithVar = [];
for (var i = 0; i < 3; i++) {
  callbacksWithVar.push(function () {
    console.log("var i =", i); // усі функції замикають на ОДНУ Й ТУ САМУ i
  });
}
callbacksWithVar.forEach((cb) => cb()); // "var i = 3" тричі — цикл давно завершився,
                                          // і всі колбеки бачать ФІНАЛЬНЕ значення i

// let СТВОРЮЄ НОВЕ ЛЕКСИЧНЕ ОТОЧЕННЯ (а отже, і нову змінну) НА
// КОЖНІЙ ітерації циклу — тому кожне замикання "бачить" СВОЮ i:
let callbacksWithLet = [];
for (let j = 0; j < 3; j++) {
  callbacksWithLet.push(function () {
    console.log("let j =", j);
  });
}
callbacksWithLet.forEach((cb) => cb()); // "let j = 0", "let j = 1", "let j = 2"

// РУЧНЕ ВИПРАВЛЕННЯ ПРОБЛЕМИ var БЕЗ let — через IIFE, яка СТВОРЮЄ
// НОВЕ лексичне оточення на кожній ітерації вручну (історичний патерн):
var callbacksWithIIFE = [];
for (var k = 0; k < 3; k++) {
  (function (capturedK) {
    callbacksWithIIFE.push(function () {
      console.log("captured k =", capturedK); // capturedK — параметр, СВІЙ на кожен виклик IIFE
    });
  })(k);
}
callbacksWithIIFE.forEach((cb) => cb()); // 0, 1, 2 — так само правильно, як і з let


// ==========================================================================
// 4. МОДУЛЬНИЙ ПАТЕРН (MODULE PATTERN) — ПРИВАТНІСТЬ ЧЕРЕЗ ЗАМИКАННЯ
// ==========================================================================

// ДО появи справжніх приватних полів класу (#field) замикання БУЛИ
// ГОЛОВНИМ способом емулювати приватний стан — те, що недоступне
// ЗЗОВНІ, а лише через "публічний" інтерфейс, який сам має доступ
// до замкненого оточення.

const bankAccount = (function () {
  let balance = 0; // ПРИВАТНА змінна — недоступна ЗЗОВНІ модуля напряму

  function deposit(amount) {
    if (amount <= 0) throw new RangeError("Сума має бути додатною");
    balance += amount;
    return balance;
  }
  function withdraw(amount) {
    if (amount > balance) throw new Error("Недостатньо коштів");
    balance -= amount;
    return balance;
  }
  function getBalance() {
    return balance;
  }

  return { deposit, withdraw, getBalance }; // ЛИШЕ ЦІ функції — "публічний API"
})();

console.log(bankAccount.deposit(100));  // 100
console.log(bankAccount.withdraw(30));  // 70
console.log(bankAccount.getBalance());  // 70
console.log(bankAccount.balance);        // undefined — ЗЗОВНІ balance взагалі недоступна!

// ФАБРИКА МОДУЛІВ — той самий патерн, але для СТВОРЕННЯ БАГАТЬОХ
// незалежних "приватних" екземплярів (а не одного глобального):
function createBankAccount(initialBalance = 0) {
  let balance = initialBalance; // КОЖЕН виклик — своє окреме замикання
  return {
    deposit(amount) {
      balance += amount;
      return balance;
    },
    getBalance() {
      return balance;
    },
  };
}
const accountA = createBankAccount(50);
const accountB = createBankAccount(200);
accountA.deposit(10);
console.log(accountA.getBalance(), accountB.getBalance()); // 60 200 — повністю незалежні


// ==========================================================================
// 5. MEMOIZATION (МЕМОЇЗАЦІЯ) — КЕШУВАННЯ РЕЗУЛЬТАТІВ ЧЕРЕЗ ЗАМИКАННЯ
// ==========================================================================

// Замикання дозволяє функції "пам'ятати" результати попередніх
// викликів МІЖ ВИКЛИКАМИ — кеш зберігається в замкненому оточенні,
// недоступному ззовні, і живе стільки ж, скільки й сама функція.

function memoize(fn) {
  const cache = new Map(); // ПРИВАТНИЙ кеш, живе в замиканні НАЗАВЖДИ
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log("з кешу для", key);
      return cache.get(key);
    }
    console.log("обчислюємо для", key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

function slowSquare(n) {
  // умовно "дорога" операція
  for (let i = 0; i < 1e6; i++) {} // штучна затримка
  return n * n;
}
const fastSquare = memoize(slowSquare);
console.log(fastSquare(5)); // "обчислюємо для [5]" → 25
console.log(fastSquare(5)); // "з кешу для [5]" → 25 (миттєво, без повторного обчислення)
console.log(fastSquare(6)); // "обчислюємо для [6]" → 36 — НОВИЙ ключ, новий розрахунок


// ==========================================================================
// 6. CURRYING (КАРІЮВАННЯ) — ФУНКЦІЇ, ЩО ПОВЕРТАЮТЬ ФУНКЦІЇ, ЩО ПАМ'ЯТАЮТЬ АРГУМЕНТИ
// ==========================================================================

// Кожен рівень каррі-функції — окреме замикання, що "запам'ятовує"
// аргумент, переданий НА ЦЬОМУ рівні, для використання пізніше.

function multiply(a) {
  return function (b) {
    return function (c) {
      return a * b * c; // a, b — вільні змінні із ЗОВНІШНІХ замикань
    };
  };
}
console.log(multiply(2)(3)(4)); // 24

const double = multiply(2); // "заморожено" a = 2
const doubleAndTriple = double(3); // "заморожено" b = 3 (a = 2 з попереднього рівня теж збережено)
console.log(doubleAndTriple(5)); // 30 — a=2, b=3, c=5

// ПРАКТИЧНЕ ЗАСТОСУВАННЯ — ЧАСТКОВЕ ЗАСТОСУВАННЯ ФУНКЦІЙ:
function createLogger(prefix) {
  return function log(message) {
    console.log(`[${prefix}] ${message}`); // prefix "заморожений" у замиканні назавжди
  };
}
const errorLogger = createLogger("ERROR");
const infoLogger = createLogger("INFO");
errorLogger("Щось пішло не так"); // "[ERROR] Щось пішло не так"
infoLogger("Усе гаразд");          // "[INFO] Усе гаразд"


// ==========================================================================
// 7. ЗАМИКАННЯ + ОБРОБНИКИ ПОДІЙ ТА АСИНХРОННИЙ КОД
// ==========================================================================

// Замикання — причина, чому колбеки/обробники подій "пам'ятають"
// контекст, у якому вони були створені, навіть коли реально
// викликаються МНОГО ПІЗНІШЕ, в зовсім іншому місці виклику.

function setupButtonCounter(label) {
  let clicks = 0;
  return function onClick() {
    clicks += 1;
    console.log(`"${label}" клікнуто ${clicks} раз(и)`);
  };
}
const handleSaveClick = setupButtonCounter("Зберегти");
handleSaveClick(); // "Зберегти" клікнуто 1 раз(и)
handleSaveClick(); // "Зберегти" клікнуто 2 раз(и)
// document.querySelector("#save").addEventListener("click", handleSaveClick);
// ^ типове реальне застосування: обробник "пам'ятає" label і clicks
// між кожним реальним кліком користувача — саме завдяки замиканню


// ==========================================================================
// 8. "ВАЖКІ" ЗАМИКАННЯ ТА ВИТОКИ ПАМ'ЯТІ (MEMORY LEAKS)
// ==========================================================================

// Замикання тримає посилання на ВСЕ лексичне оточення функції, у
// якому вона створена, — НЕ ЛИШЕ на ту одну змінну, яку реально
// використовує. Якщо це оточення містить ВЕЛИКІ структури даних,
// вони НЕ МОЖУТЬ бути зібрані garbage collector'ом, поки існує
// хоч ОДНЕ замикання, що на них посилається (навіть непрямо).

function processLargeDataset() {
  const hugeArray = new Array(1_000_000).fill("багато даних"); // займає багато пам'яті
  const summary = hugeArray.length;

  return function getSummary() {
    return summary; // ВИКОРИСТОВУЄ лише summary, АЛЕ...
    // ...якщо ДВИГУН не оптимізує це достатньо розумно, hugeArray
    // теоретично МОЖЕ залишатись у пам'яті, поки existует getSummary,
    // адже вони належать до одного лексичного оточення
  };
}
const summaryFn = processLargeDataset();
console.log(summaryFn()); // 1000000

// ЯК ЗМЕНШИТИ РИЗИК: явно "звільняти" великі структури, коли вони
// більше не потрібні, замість того, щоб покладатись лише на те,
// що функція їх "не використовує":
function processLargeDatasetSafely() {
  let hugeArray = new Array(1_000_000).fill("багато даних");
  const summary = hugeArray.length;
  hugeArray = null; // явно розриваємо посилання — тепер точно можна зібрати збирачем сміття
  return function getSummary() {
    return summary;
  };
}


// ==========================================================================
// 9. ЗАМИКАННЯ ВСЕРЕДИНІ ЦИКЛУ З ІНДЕКСОМ — ПОШИРЕНИЙ ПАТЕРН "ФАБРИКИ ФУНКЦІЙ"
// ==========================================================================

function createMultipliers() {
  const multipliers = [];
  for (let factor = 1; factor <= 3; factor++) {
    multipliers.push((n) => n * factor); // кожна стрілка замикає СВІЙ factor (завдяки let)
  }
  return multipliers;
}
const [double2, triple, quadruple] = createMultipliers();
console.log(double2(10), triple(10), quadruple(10)); // 10 20 30
// ПОЯСНЕННЯ: factor тут 1,2,3, тому double2=×1, triple=×2, quadruple=×3.
// double2(10)=10, triple(10)=20, quadruple(10)=30 — ІМ'Я змінної "double2"
// НЕ впливає на РЕАЛЬНУ поведінку функції, лише на очікування читача коду
// (сама назва обіцяє "подвоєння", а факт factor=1 робить її тотожною функцією)!


// ==========================================================================
// 10. ЗАМИКАННЯ ТА ГЕНЕРАТОРИ/ІТЕРАТОРИ
// ==========================================================================

// Кожен об'єкт-ітератор, повернутий [Symbol.iterator](), — теж
// замикання: він "пам'ятає" свій прогрес (наприклад, current)
// між викликами next(), незалежно від інших паралельних ітераторів
// того самого iterable (детально в common/data-structures/iterator/iterator.js).

function createRange(from, to) {
  return {
    [Symbol.iterator]() {
      let current = from; // ЗАМИКАННЯ навколо current — унікальне на кожен виклик [Symbol.iterator]()
      return {
        next() {
          return current <= to
            ? { value: current++, done: false }
            : { value: undefined, done: true };
        },
      };
    },
  };
}
const range = createRange(1, 3);
const it1 = range[Symbol.iterator]();
const it2 = range[Symbol.iterator]();
console.log(it1.next().value, it1.next().value); // 1 2 — свій прогрес
console.log(it2.next().value);                     // 1 — НЕЗАЛЕЖНИЙ прогрес, не 3!


// ==========================================================================
// 11. ЯК "ПОБАЧИТИ" ЗАМИКАННЯ В DEVTOOLS
// ==========================================================================

// У Chrome DevTools/Node inspector, поставивши breakpoint (debugger;)
// всередині вкладеної функції, у панелі Scope можна побачити розділ
// "Closure" — це буквально СПИСОК змінних із зовнішніх лексичних
// оточень, які поточна функція фактично захопила.

function outerForDebug() {
  const secretValue = "видно в DevTools як Closure (outerForDebug)";
  return function innerForDebug() {
    debugger; // тут у Scope-панелі буде видно "Closure (outerForDebug): {secretValue}"
    return secretValue;
  };
}
// outerForDebug()();


// ПІДСУМОК:
// - closure = функція + "заморожене" посилання на лексичне оточення,
//   у якому вона була СТВОРЕНА — і воно живе, навіть коли зовнішня
//   функція вже завершилась
// - зберігається ПОСИЛАННЯ на змінну (live binding), а НЕ копія
//   значення на момент створення — тому пізніші зміни зовнішньої
//   змінної відображаються в замиканні
// - кожен ВИКЛИК зовнішньої функції створює НЕЗАЛЕЖНЕ лексичне
//   оточення — різні "екземпляри" замикань не заважають один одному
// - var у циклі + замикання = класична пастка (усі функції ділять
//   ОДНУ спільну змінну); let створює нове оточення на кожній ітерації
// - модульний патерн (IIFE, повертає публічний API) — головний
//   спосіб емулювати приватність до появи #privateField у класах
// - мемоізація — кеш, що живе в замиканні між викликами функції
// - каррінг — ланцюжок замикань, кожне з яких "заморожує" один аргумент
// - замикання тримає ВСЕ лексичне оточення, не лише потрібну змінну —
//   потенційне джерело витоку пам'яті для великих структур даних
// - ітератори — теж замикання: кожен виклик [Symbol.iterator]()
//   створює власне, незалежне лексичне оточення з власним прогресом
// - у DevTools замикання видно як окремий розділ "Closure" у Scope
//   при зупинці на breakpoint усередині вкладеної функції