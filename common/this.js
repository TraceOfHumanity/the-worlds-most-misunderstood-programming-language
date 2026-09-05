// ==========================================================================
// THIS — КОНТЕКСТ ВИКЛИКУ ФУНКЦІЇ (НАЙБІЛЬШ НЕЗРОЗУМІЛА ЧАСТИНА JS)
// ==========================================================================

// 1. ГОЛОВНЕ ПРАВИЛО, ЯКЕ ТРЕБА ЗАПАМ'ЯТАТИ РАНІШЕ ЗА ВСЕ ІНШЕ
// -----------------------------------------------------
// this в JavaScript визначається НЕ місцем, де функція ОГОЛОШЕНА
// (як це працює зі scope/лексичними змінними), а ТИМ, ЯК САМЕ функція
// БУЛА ВИКЛИКАНА. Одна й та сама функція може мати РІЗНЕ this
// у різних викликах — це і є джерело майже всієї плутанини з this.

function whoIsThis() {
  return this;
}

const objA = { name: "A", whoIsThis };
const objB = { name: "B", whoIsThis };

console.log(objA.whoIsThis().name); // "A" — викликано ЯК objA.method()
console.log(objB.whoIsThis().name); // "B" — та сама функція, інший виклик → інший this

const detachedFn = objA.whoIsThis;
// console.log(detachedFn().name); // TypeError у strict mode: this буде undefined


// ==========================================================================
// 2. ЧОТИРИ ПРАВИЛА ВИЗНАЧЕННЯ THIS (ЗА ПРІОРИТЕТОМ ВІД НАЙВИЩОГО)
// ==========================================================================

// Коли зустрічаєш this у ЗВИЧАЙНІЙ (не стрілковій) функції, перевіряй
// правила в цьому порядку — перше, що підходить, і визначає this:
//
//   1) new Binding       — викликана через `new Функція()`
//   2) Explicit Binding  — викликана через call()/apply()/bind()
//   3) Implicit Binding  — викликана як метод об'єкта: obj.method()
//   4) Default Binding   — просто виклик функції: fn() (найнижчий пріоритет)
//
// Стрілкові функції в цю систему НЕ входять — у них СВОЄ, окреме
// правило (лексичний this, розбираємо в пункті 7).


// ==========================================================================
// 3. DEFAULT BINDING — ЗВИЧАЙНИЙ ВИКЛИК ФУНКЦІЇ fn()
// ==========================================================================

function showDefaultThis() {
  console.log(this);
}

// у СТРОГОМУ РЕЖИМІ (strict mode, а це ЗАВЖДИ так усередині
// модулів ES та класів) this при звичайному виклику — undefined:
function strictDefaultThis() {
  "use strict";
  console.log(this); // undefined
}
strictDefaultThis();

// у НЕСТРОГОМУ РЕЖИМІ (класичний script без "use strict") this
// при звичайному виклику "падає" на глобальний об'єкт —
// globalThis (window у браузері, global у Node у не-модульному коді):
function nonStrictDefaultThis() {
  console.log(this === globalThis); // true (ПОЗА strict mode)
}
// nonStrictDefaultThis(); // у файлі, що працює як ES-модуль, весь файл
                            // автоматично strict — тому тут this буде undefined

// ЧОМУ ЦЕ ВАЖЛИВО: "випадкове" потрапляння this на globalThis —
// класична стара пастка, яка призводила до випадкового читання/запису
// глобальних змінних. Строгий режим існує значною мірою САМЕ для
// того, щоб перетворити цю тиху помилку на явний undefined/TypeError.


// ==========================================================================
// 4. IMPLICIT BINDING — ВИКЛИК ЯК МЕТОД ОБ'ЄКТА obj.method()
// ==========================================================================

// Коли функція викликається ЧЕРЕЗ КРАПКУ (obj.method()), this
// усередині методу вказує САМЕ на об'єкт ЗЛІВА ВІД КРАПКИ —
// не важливо, де метод був спочатку визначений.

const userImplicit = {
  name: "Олег",
  greet() {
    console.log(`Привіт, я ${this.name}`);
  },
};
userImplicit.greet(); // "Привіт, я Олег" — this === userImplicit


// 4.1. ВАЖЛИВИЙ НЮАНС: this ВИЗНАЧАЄТЬСЯ ОСТАННЬОЮ ЧАСТИНОЮ ПЕРЕД ВИКЛИКОМ
// -----------------------------------------------------
const outerImplicit = {
  name: "зовнішній",
  inner: {
    name: "внутрішній",
    greet() {
      console.log(this.name);
    },
  },
};
outerImplicit.inner.greet(); // "внутрішній" — this === outerImplicit.inner,
                              // а НЕ outerImplicit, хоч він теж є в ланцюжку


// 4.2. КЛАСИЧНА ПАСТКА: "ВІДОКРЕМЛЕННЯ" МЕТОДУ ВІД ОБ'ЄКТА
// -----------------------------------------------------
// Implicit Binding діє ЛИШЕ у момент виклику через obj.method().
// Якщо ту саму функцію ПРИСВОЇТИ змінній і викликати ОКРЕМО —
// зв'язок з об'єктом ВТРАЧАЄТЬСЯ, спрацьовує вже Default Binding.

const counterObj = {
  count: 0,
  increment() {
    this.count++;
    return this.count;
  },
};

console.log(counterObj.increment()); // 1 — implicit binding, this === counterObj

const incrementDetached = counterObj.increment; // просто копія посилання на функцію
// console.log(incrementDetached()); // TypeError: Cannot read properties of undefined
// this тут — undefined (strict mode), бо викликано БЕЗ obj. попереду

// САМЕ ЦЯ ПАСТКА "ламає" передачу методів як колбеків:
// setTimeout(counterObj.increment, 1000); // this всередині БУДЕ undefined!
// document.querySelector("button").addEventListener("click", counterObj.increment);
// у обробнику подій this === сам DOM-елемент, а НЕ counterObj —
// теж наслідок того, що виклик відбувається як element.addEventListener,
// а функція передається "окремо" від counterObj


// ==========================================================================
// 5. EXPLICIT BINDING — call() / apply() / bind()
// ==========================================================================

// Ці три методи (доступні на КОЖНІЙ звичайній функції через
// Function.prototype) дозволяють ЯВНО вказати, чим буде this
// усередині функції під час виклику — незалежно від того, як/де
// функція визначена.

function introduce(greeting, punctuation) {
  console.log(`${greeting}, я ${this.name}${punctuation}`);
}

const personX = { name: "Марія" };
const personY = { name: "Іван" };


// 5.1. call(thisArg, arg1, arg2, ...) — аргументи ПЕРЕЛІКОМ
// -----------------------------------------------------
introduce.call(personX, "Привіт", "!"); // "Привіт, я Марія!"
introduce.call(personY, "Вітаю", "."); // "Вітаю, я Іван."


// 5.2. apply(thisArg, [argsArray]) — аргументи МАСИВОМ
// -----------------------------------------------------
introduce.apply(personX, ["Добрий день", "!"]); // "Добрий день, я Марія!"
// різниця call/apply — ЛИШЕ у формі передачі аргументів,
// сенс щодо this — ідентичний

// типове історичне застосування apply(): виклик функції з масивом
// "динамічної" довжини аргументів (до появи spread-оператора):
console.log(Math.max.apply(null, [3, 1, 4, 1, 5])); // 5
console.log(Math.max(...[3, 1, 4, 1, 5]));           // 5 — сучасний еквівалент через spread


// 5.3. bind(thisArg, arg1, ...) — ПОВЕРТАЄ НОВУ функцію з "прив'язаним" this
// -----------------------------------------------------
// На відміну від call()/apply(), bind() НЕ викликає функцію одразу —
// він створює НОВУ функцію, у якої this (і, за бажанням, частина
// аргументів) вже НАЗАВЖДИ зафіксовані і НЕ МОЖУТЬ бути перевизначені
// повторним call()/apply() чи новим bind().

const introduceAsMaria = introduce.bind(personX);
introduceAsMaria("Привіт", "!"); // "Привіт, я Марія!" — this зафіксовано

// bind() також підтримує ЧАСТКОВЕ ЗАСТОСУВАННЯ (partial application) —
// можна одразу "заморозити" й частину аргументів:
const greetAsMaria = introduce.bind(personX, "Салют");
greetAsMaria("!!!"); // "Салют, я Марія!!!" — thisArg + перший аргумент зафіксовані

// ПОВТОРНИЙ bind()/call() НЕ ЗМІНЮЄ вже прив'язаний this:
const alreadyBound = introduce.bind(personX);
alreadyBound.call(personY, "Привіт", "?"); // "Привіт, я Марія?" — все одно Марія, не Іван!

// саме bind() найчастіше рятує "втрачений" this із пункту 4.2:
const safeIncrement = counterObj.increment.bind(counterObj);
console.log(safeIncrement()); // 2 — тепер безпечно передавати як колбек
// setTimeout(safeIncrement, 1000); // спрацює коректно, this всередині — counterObj


// ==========================================================================
// 6. NEW BINDING — ВИКЛИК ЧЕРЕЗ new Функція()
// ==========================================================================

// Коли функція викликається з ключовим словом new, рушій виконує
// (спрощено) чотири кроки:
//   1) створює НОВИЙ порожній об'єкт;
//   2) прив'язує його прототип до Функція.prototype;
//   3) викликає функцію-конструктор, де this === щойно створений об'єкт;
//   4) якщо функція явно НЕ повертає інший об'єкт — повертає цей новий об'єкт.

function Cat(name) {
  console.log(this); // Cat {} — порожній новостворений об'єкт (на момент виклику)
  this.name = name; // записуємо властивість НА цей новий об'єкт
  // немає явного return { ... } — тому автоматично повернеться this
}

const cat1 = new Cat("Мурчик");
console.log(cat1.name); // "Мурчик"
console.log(cat1 instanceof Cat); // true

// ЯКЩО КОНСТРУКТОР ЯВНО ПОВЕРТАЄ ОБ'ЄКТ — new Binding "відкидається",
// повертається саме той об'єкт, а не щойно створений this:
function WeirdConstructor() {
  this.value = "я не буду використаний";
  return { value: "а я буду, бо це явний return об'єкта" };
}
console.log(new WeirdConstructor().value); // "а я буду..."
// але якщо повернути ПРИМІТИВ (return "рядок"; return 42; тощо) —
// такий return ІГНОРУЄТЬСЯ, і new все одно поверне this:
function ReturnsPrimitive() {
  this.value = "я БУДУ використаний";
  return "цей рядок буде проігноровано";
}
console.log(new ReturnsPrimitive().value); // "я БУДУ використаний"

// class у ES6 — це, по суті, синтаксичний цукор над цим самим
// механізмом: конструктор класу теж використовує New Binding.
class Dog {
  constructor(name) {
    this.name = name; // this === новий екземпляр Dog
  }
}
console.log(new Dog("Рекс").name); // "Рекс"

// ЩО СТАНЕТЬСЯ, ЯКЩО ВИКЛИКАТИ ФУНКЦІЮ-КОНСТРУКТОР БЕЗ new:
function Bird(name) {
  this.name = name; // "use strict" неявний у класах, але звичайна function — ні
}
Bird("Папужка"); // this тут — Default Binding (undefined у strict, globalThis інакше)
// console.log(globalThis.name); // "Папужка" — якщо не strict, властивість "втекла" на глобальний об'єкт!

// клас же НЕ МОЖНА викликати без new — рушій явно захищає від цієї пастки:
// Dog("Рекс"); // TypeError: Class constructor Dog cannot be invoked without 'new'


// ==========================================================================
// 7. СТРІЛКОВІ ФУНКЦІЇ — ОКРЕМЕ, П'ЯТЕ ПРАВИЛО: ЛЕКСИЧНИЙ this
// ==========================================================================

// Стрілкова функція НЕ МАЄ ВЛАСНОГО this. Вона просто "успадковує"
// this із НАЙБЛИЖЧОГО ЗВИЧАЙНОГО (не стрілкового) оточення, у якому
// стрілкова функція БУЛА НАПИСАНА (лексично) — так само, як звичайна
// змінна шукається по scope chain (див. common/variables-and-execution-context/scope.js).
// Жодне з чотирьох правил вище (default/implicit/explicit/new) НЕ
// ПРАЦЮЄ для стрілкових функцій — call()/apply()/bind() НЕ можуть
// змінити їхній this, а new з ними взагалі кидає помилку.

const arrowThis = () => {
  console.log(this);
};
arrowThis(); // this — те саме, що й у оточенні, де arrowThis була ОГОЛОШЕНА
             // (у модулі верхнього рівня — undefined; у script — globalThis)

// const arrowConstructor = () => {};
// new arrowConstructor(); // TypeError: arrowConstructor is not a constructor


// 7.1. ГОЛОВНЕ ПРАКТИЧНЕ ЗАСТОСУВАННЯ: "ФІКС" this У ВКЛАДЕНИХ КОЛБЕКАХ
// -----------------------------------------------------
// Класична стара проблема ДО стрілкових функцій: звичайна функція
// всередині методу має СВІЙ ВЛАСНИЙ this (Default Binding, бо
// викликається сама по собі, без obj. попереду) — тому втрачає
// зв'язок із зовнішнім об'єктом.

const timerObjOld = {
  label: "Старий підхід",
  startBroken() {
    setTimeout(function () {
      console.log(this.label); // undefined/помилка — this тут НЕ timerObjOld!
                                 // (звичайна функція, викликана "сама по собі" рушієм setTimeout)
    }, 100);
  },
  startFixed() {
    setTimeout(() => {
      console.log(this.label); // "Новий підхід" — стрілкова функція взяла
                                 // this з лексичного оточення startFixed(), де this === timerObjOld
    }, 100);
  },
};
timerObjOld.startFixed(); // "Новий підхід"

// ДО появи стрілкових функцій цю саму проблему вирішували вручну —
// "зберігали" this у звичайну змінну (типово названу self/that/_this):
const timerObjLegacy = {
  label: "Легасі підхід",
  start() {
    const self = this; // "заморожуємо" правильний this у замиканні
    setTimeout(function () {
      console.log(self.label); // "Легасі підхід" — через замикання на self, не this
    }, 100);
  },
};
timerObjLegacy.start();


// 7.2. КОЛИ СТРІЛКОВІ ФУНКЦІЇ ШКОДЯТЬ: МЕТОДИ ОБ'ЄКТІВ/КЛАСІВ
// -----------------------------------------------------
// Оскільки стрілкова функція НЕ має власного this, її НЕ МОЖНА
// використовувати як метод, якому потрібен this === сам об'єкт —
// вона "підніме" this з оточення, де об'єкт/клас був визначений
// (найчастіше — модульний/глобальний рівень), а НЕ з виклику obj.method().

const brokenByArrow = {
  name: "Я зламаний",
  greet: () => {
    console.log(this?.name); // НЕ "Я зламаний" — this тут із зовнішнього
                               // (модульного) оточення, а не brokenByArrow!
  },
};
brokenByArrow.greet(); // undefined (або помилка, залежно від оточення)

// ПРАВИЛО: у методах об'єктів/класів, яким потрібен this === сам
// об'єкт/екземпляр — використовуй ЗВИЧАЙНИЙ синтаксис методу
// (method() {...} чи function), а не стрілкову функцію.


// ==========================================================================
// 8. this У КЛАСАХ
// ==========================================================================

// Методи класу — ЗАВЖДИ у strict mode (незалежно від того, чи
// файл сам є модулем) — це закладено в самому синтаксисі class.

class Wallet {
  #balance = 0; // приватне поле
  constructor(owner) {
    this.owner = owner; // this === новий екземпляр (New Binding)
  }
  deposit(amount) {
    this.#balance += amount; // this === екземпляр, ЯКЩО викликано як wallet.deposit()
    return this.#balance;
  }
}

const wallet = new Wallet("Настя");
console.log(wallet.deposit(100)); // 100 — implicit binding, this === wallet

const depositDetached = wallet.deposit;
// depositDetached(50); // TypeError: Cannot read private member #balance
// той самий "втрачений this", що й у пункті 4.2 — методи класу
// теж потрібно передавати через .bind(), стрілкову обгортку,
// або оголошувати як CLASS FIELD зі стрілковою функцією (нижче)


// 8.1. CLASS FIELDS ЗІ СТРІЛКОВИМИ ФУНКЦІЯМИ — "АВТО-ПРИВ'ЯЗАНІ" МЕТОДИ
// -----------------------------------------------------
// Сучасний патерн для методів, які точно передаватимуться як
// колбеки (наприклад, обробники подій у React): оголосити метод
// як ПОЛЕ КЛАСУ (не в тілі, а через =), значенням якого є
// стрілкова функція. Оскільки поля класу ініціалізуються в
// конструкторі КОЖНОГО екземпляра, стрілка "захоплює" this саме
// того екземпляра, до якого належить — назавжди, незалежно від виклику.

class Button {
  label = "Клікни";

  // звичайний метод — this залежить від того, ЯК його викликали:
  handleClickUnsafe() {
    console.log(this.label);
  }

  // class field зі стрілкою — this ЗАВЖДИ === екземпляр Button,
  // навіть якщо метод "відірвати" й передати окремо:
  handleClickSafe = () => {
    console.log(this.label);
  };
}

const button = new Button();
const unsafeCallback = button.handleClickUnsafe;
const safeCallback = button.handleClickSafe;
// unsafeCallback(); // TypeError — this втрачено
safeCallback();      // "Клікни" — this "заморожений" на екземплярі назавжди


// ==========================================================================
// 9. ПРІОРИТЕТ ПРАВИЛ — ЩО ПЕРЕМАГАЄ, ЯКЩО ЗАСТОСОВНІ КІЛЬКА
// ==========================================================================

// New Binding > Explicit Binding > Implicit Binding > Default Binding
// (стрілкові функції — поза цією системою, завжди лексичний this)

function showPriorityThis() {
  console.log(this.label);
}
const objForPriority = { label: "об'єкт", showPriorityThis };

// explicit (bind) ПЕРЕМАГАЄ implicit (виклик через крапку):
const boundToOther = objForPriority.showPriorityThis.bind({ label: "прив'язаний bind()" });
boundToOther(); // "прив'язаний bind()" — bind переміг би навіть, якби викликали як obj.boundToOther()

// new ПЕРЕМАГАЄ explicit (bind) — навіть попередньо "прив'язана" bind()
// функція, викликана через new, отримає НОВИЙ об'єкт як this:
function BoundConstructor(value) {
  this.value = value;
}
const HardBound = BoundConstructor.bind({ value: "буде проігноровано" });
const instanceFromBound = new HardBound("новий об'єкт переміг");
console.log(instanceFromBound.value); // "новий об'єкт переміг" — new Binding сильніший за bind()


// ==========================================================================
// 10. globalThis — УНІВЕРСАЛЬНЕ ПОСИЛАННЯ НА ГЛОБАЛЬНИЙ ОБ'ЄКТ (ES2020)
// ==========================================================================

// До появи globalThis кожне середовище мало СВОЮ назву для
// глобального об'єкта: window/self у браузері, global у Node.js,
// this на верхньому рівні старих (non-module) скриптів — писати
// код, що працює скрізь, доводилось з "обхідними" перевірками.
// globalThis — стандартизоване, однакове ім'я для ВСІХ середовищ.

console.log(typeof globalThis); // "object" — і в браузері, і в Node, і в Deno


// ==========================================================================
// 11. this У РІЗНИХ "ВЕРХНІХ РІВНЯХ" — НЕОЧЕВИДНІ ВІДМІННОСТІ
// ==========================================================================

// а) У ES-модулі (import/export) НА ВЕРХНЬОМУ РІВНІ this === undefined
//    (модулі завжди strict, і в них немає "глобального this-об'єкта"):
// console.log(this); // undefined (у файлі з import/export)

// б) У Node.js CommonJS-файлі (require/module.exports) НА ВЕРХНЬОМУ
//    РІВНІ this === module.exports (порожній об'єкт на момент старту
//    файлу) — НЕ globalThis:
// console.log(this === module.exports); // true (у звичайному .js файлі Node без "type": "module")

// в) У браузерному <script> (класичний, не type="module") НА ВЕРХНЬОМУ
//    РІВНІ this === window (тобто globalThis):
// console.log(this === window); // true (класичний non-strict script)


// ==========================================================================
// 12. ЯК "БЕЗПЕЧНО" ВИЗНАЧИТИ this ПІД ЧАС ДЕБАГУ
// ==========================================================================

// Правило для швидкої самоперевірки "яким буде this тут":
//   1. Це стрілкова функція? → шукай this у НАЙБЛИЖЧІЙ звичайній
//      функції/оточенні НАЗОВНІ (лексично), а не тут.
//   2. Функція викликана через new? → this — новий об'єкт.
//   3. Функція викликана через .call()/.apply()/.bind(...)? → this —
//      те, що передане першим аргументом (з урахуванням пункту 9
//      про пріоритет: new все одно переможе навіть bind()).
//   4. Функція викликана як obj.method()? → this — obj (те, що
//      СТОЇТЬ БЕЗПОСЕРЕДНЬО ПЕРЕД КРАПКОЮ в МОМЕНТ виклику).
//   5. Просто fn()? → this — undefined (strict) або globalThis (non-strict).


// ПІДСУМОК:
// - this визначається СПОСОБОМ ВИКЛИКУ функції, а не місцем її оголошення
// - 4 правила за пріоритетом: new > explicit (call/apply/bind) >
//   implicit (obj.method()) > default (просто fn())
// - default binding: undefined у strict mode, globalThis — поза ним
// - implicit binding: this === об'єкт БЕЗПОСЕРЕДНЬО перед крапкою
//   в МОМЕНТ виклику; "відірвана" від об'єкта функція втрачає це
// - explicit binding: call(thisArg, ...args) викликає одразу;
//   apply(thisArg, argsArray) — те саме, але аргументи масивом;
//   bind(thisArg, ...args) — повертає НОВУ функцію з НАЗАВЖДИ
//   зафіксованим this (повторний bind()/call() це вже не змінить)
// - new binding: рушій створює новий об'єкт, прив'язує до нього
//   this, і повертає його автоматично (якщо конструктор явно не
//   повернув інший ОБ'ЄКТ — примітив, поверенений через return, ігнорується)
// - стрілкові функції: НЕ мають власного this — беруть його
//   лексично з найближчого звичайного оточення; call/apply/bind/new
//   на них НЕ впливають (new на стрілці — TypeError)
// - головне практичне застосування стрілок: коректний this у
//   вкладених колбеках (setTimeout, обробники подій) без .bind(self)
// - головна пастка стрілок: НЕ використовуй їх для методів
//   об'єкта/класу, яким потрібен this === сам об'єкт/екземпляр
// - class field зі стрілковою функцією — сучасний спосіб отримати
//   метод, що "автоматично" прив'язаний до конкретного екземпляра
// - globalThis — єдине, стандартне ім'я глобального об'єкта в
//   усіх середовищах (замінює window/global/self)
// - this на верхньому рівні відрізняється за середовищем: undefined
//   в ES-модулі, module.exports у CommonJS Node, window у класичному
//   браузерному script