// ==========================================================================
// CONSTRUCTOR — ПАТЕРН "ШАБЛОН ДЛЯ СТВОРЕННЯ ОБ'ЄКТІВ ЧЕРЕЗ new"
// ==========================================================================

// 1. ЩО ТАКЕ CONSTRUCTOR
// -----------------------------------------------------
// Constructor — найбазовіший спосіб створення об'єктів одного "виду":
// функція/клас-шаблон, який викликають з `new`, і він ініціалізує
// новий об'єкт (`this`) власними даними та отримує спільні методи
// через прототип.
//
// Це основа, на якій стоять інші породжуючі патерни:
//   Factory    — вирішує, ЯКИЙ конструктор викликати (patterns/factory.js);
//   Builder    — збирає аргументи для конструктора (patterns/builder.js);
//   Prototype  — клонує замість виклику конструктора (patterns/prototype.js);
//   Singleton  — обмежує конструктор одним екземпляром (patterns/singleton.js);
//   DI         — передає залежності В конструктор (patterns/dependency-injection.js).


// ==========================================================================
// 2. CONSTRUCTOR-ФУНКЦІЯ (ДОКЛАСОВИЙ СПОСІБ)
// ==========================================================================

function Person(name, age) {
  // `this` — щойно створений порожній об'єкт (детально — common/this.js)
  this.name = name;
  this.age = age;
}

// методи кладуть у prototype, щоб вони були ОДНІ на всіх екземплярів
Person.prototype.greet = function () {
  return `Привіт, я ${this.name}`;
};

const olya = new Person("Оля", 20);
const ivan = new Person("Іван", 25);

console.log(olya.greet()); // Привіт, я Оля
console.log(olya.greet === ivan.greet); // true — один метод у пам'яті
console.log(olya instanceof Person); // true
console.log(olya.constructor === Person); // true
console.log(Object.getPrototypeOf(olya) === Person.prototype); // true
// (прототипний ланцюжок — common/prototypal-inheritance.js)

// Конвенція: конструктори називають з ВЕЛИКОЇ літери — це сигнал "викликай з new".


// ==========================================================================
// 3. ЩО САМЕ РОБИТЬ `new` (4 КРОКИ)
// ==========================================================================

// new Person("Оля", 20) робить приблизно так:
function myNew(Constructor, ...args) {
  const obj = Object.create(Constructor.prototype); // 1. новий об'єкт з правильним прототипом
  const result = Constructor.apply(obj, args); // 2. виклик конструктора з this = obj
  // 3. якщо конструктор повернув ОБ'ЄКТ — беремо його; інакше obj
  return result !== null && (typeof result === "object" || typeof result === "function")
    ? result
    : obj; // 4. повертаємо результат
}

const manual = myNew(Person, "Марія", 30);
console.log(manual.greet()); // Привіт, я Марія
console.log(manual instanceof Person); // true


// ==========================================================================
// 4. return У КОНСТРУКТОРІ
// ==========================================================================

function ReturnsObject() {
  this.a = 1;
  return { b: 2 }; // об'єкт ПЕРЕБИВАЄ this
}
function ReturnsPrimitive() {
  this.a = 1;
  return 42; // примітив ІГНОРУЄТЬСЯ
}

console.log(new ReturnsObject()); // { b: 2 }
console.log(new ReturnsPrimitive()); // ReturnsPrimitive { a: 1 }
// Це і використовує Singleton (конструктор повертає наявний екземпляр).


// ==========================================================================
// 5. ПАСТКА: ЗАБУЛИ new
// ==========================================================================

function Careless(name) {
  this.name = name;
}

// У sloppy-режимі `this` = globalThis: властивість "витікає" в глобальний
// простір, а результат undefined:
const broken = Careless("Оля");
console.log(broken); // undefined
console.log(globalThis.name); // Оля — забруднили глобальний об'єкт!
delete globalThis.name;

// Захист 1: new.target (undefined, якщо викликали без new)
function Safe(name) {
  if (!new.target) return new Safe(name);
  this.name = name;
}
console.log(Safe("Оля").name); // Оля — працює і без new
console.log(new Safe("Іван").name); // Іван

// Захист 2: у strict-режимі `this` = undefined і буде TypeError.
// Захист 3: class — без new викликати заборонено (розділ 6).


// ==========================================================================
// 6. class — СУЧАСНИЙ СИНТАКСИС
// ==========================================================================

class User {
  // поля класу — ініціалізуються перед тілом конструктора
  role = "user";
  #password; // приватне поле (детально — common/data-structures/Object/Object.js)

  static count = 0; // статична властивість

  constructor(name, password) {
    this.name = name;
    this.#password = password;
    User.count++;
  }

  checkPassword(input) {
    return this.#password === input;
  }

  greet() {
    return `Привіт, я ${this.name} (${this.role})`;
  }
}

const u = new User("Оля", "secret");
console.log(u.greet()); // Привіт, я Оля (user)
console.log(u.checkPassword("secret")); // true
console.log(u.password); // undefined — приватне поле недоступне зовні
console.log(User.count); // 1

try {
  User("Оля", "x"); // без new
} catch (err) {
  console.log(err.name + ":", err.message);
  // TypeError: Class constructor User cannot be invoked without 'new'
}

// class — це "синтаксичний цукор" над конструкторами й прототипами:
console.log(typeof User); // function
console.log(Object.hasOwn(u, "greet")); // false — метод на User.prototype, не на екземплярі
console.log(Object.hasOwn(User.prototype, "greet")); // true


// ==========================================================================
// 7. МЕТОДИ: В КОНСТРУКТОРІ vs НА ПРОТОТИПІ
// ==========================================================================

class WithOwnMethod {
  constructor() {
    this.hello = () => "привіт"; // ❌ нова функція на КОЖЕН екземпляр
  }
  hi() {
    return "привіт"; // ✅ одна функція на прототипі
  }
}

const w1 = new WithOwnMethod();
const w2 = new WithOwnMethod();
console.log(w1.hello === w2.hello); // false — дублювання в пам'яті
console.log(w1.hi === w2.hi); // true
// Виняток: arrow-функція як поле зберігає this (колбеки), ціною пам'яті.
// Детально про this-пастки — common/this.js.


// ==========================================================================
// 8. НАСЛІДУВАННЯ: extends І super()
// ==========================================================================

class Admin extends User {
  constructor(name, password, level) {
    // у похідному класі super() ОБОВ'ЯЗКОВО перед першим використанням this
    super(name, password);
    this.level = level;
    this.role = "admin";
  }

  greet() {
    return `${super.greet()}, рівень ${this.level}`;
  }
}

const admin = new Admin("Марія", "pass", 3);
console.log(admin.greet()); // Привіт, я Марія (admin), рівень 3
console.log(admin instanceof User); // true
console.log(User.count); // 2 — конструктор батька теж відпрацював

class BrokenAdmin extends User {
  constructor(name) {
    try {
      this.level = 1; // ❌ this ще не створено — його створює батьківський конструктор
    } catch (err) {
      console.log(err.name + ":", err.message);
    }
    super(name, "x");
  }
}
new BrokenAdmin("Тест");
// ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor

// Якщо у похідного класу конструктора немає — JS додає автоматично:
//   constructor(...args) { super(...args); }


// ==========================================================================
// 9. new.target У КЛАСАХ: АБСТРАКТНИЙ КЛАС
// ==========================================================================

class Shape {
  constructor() {
    if (new.target === Shape) {
      throw new TypeError("Shape абстрактний — створюйте підклас");
    }
  }
  area() {
    throw new Error("area() не реалізовано");
  }
}

class Circle extends Shape {
  constructor(r) {
    super();
    this.r = r;
  }
  area() {
    return +(Math.PI * this.r ** 2).toFixed(2);
  }
}

try {
  new Shape();
} catch (err) {
  console.log(err.message); // Shape абстрактний — створюйте підклас
}
console.log(new Circle(2).area()); // 12.57


// ==========================================================================
// 10. ВАЛІДАЦІЯ І ЗНАЧЕННЯ ЗА ЗАМОВЧУВАННЯМ
// ==========================================================================

class Product {
  // options-об'єкт з деструктуризацією — читабельніше за позиційні аргументи
  constructor({ name, price = 0, tags = [] } = {}) {
    if (!name) throw new Error("name обов'язковий");
    if (price < 0) throw new RangeError("price не може бути від'ємним");
    this.name = name;
    this.price = price;
    this.tags = [...tags]; // копія, щоб не ділити масив із зовнішнім кодом
  }
}

console.log(new Product({ name: "Книга", price: 100 }));
// Product { name: 'Книга', price: 100, tags: [] }
try {
  new Product({ price: 5 });
} catch (err) {
  console.log(err.message); // name обов'язковий
}
// Конструктор має створювати ВАЛІДНИЙ об'єкт або кидати помилку —
// напівготових екземплярів бути не повинно. Для багатьох опцій і
// складної валідації див. Builder (patterns/builder.js).


// ==========================================================================
// 11. ОБМЕЖЕННЯ КОНСТРУКТОРІВ
// ==========================================================================

// 11.1. Конструктор НЕ може бути async: він завжди повертає об'єкт, а
// не Promise. Рішення — статичний async-метод-фабрика:
class Connection {
  constructor(handle) {
    this.handle = handle; // конструктор приймає ВЖЕ отримане значення
  }
  static async create() {
    const handle = await Promise.resolve("connection-1"); // асинхронна ініціалізація
    return new Connection(handle);
  }
}
Connection.create().then((c) => console.log(c.handle)); // connection-1
// (детально — patterns/factory.js, розділ про async-фабрики)

// 11.2. Перевантаження за типами немає: один конструктор на клас.
// Варіанти "створити з рядка / з масиву" — статичні фабричні методи:
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  static fromString(s) {
    const [x, y] = s.split(",").map(Number);
    return new Point(x, y);
  }
  static fromArray([x, y]) {
    return new Point(x, y);
  }
}
console.log(Point.fromString("3,4")); // Point { x: 3, y: 4 }
console.log(Point.fromArray([5, 6])); // Point { x: 5, y: 6 }

// 11.3. Важка робота (запити, файли) в конструкторі — погана ідея:
// складно тестувати і обробляти помилки. Конструктор лише присвоює.

// 11.4. Виклик перевизначуваного методу з конструктора батька
class Base {
  constructor() {
    console.log(this.describe()); // викличеться метод ПІДКЛАСУ
  }
  describe() {
    return "Base";
  }
}
class Derived extends Base {
  value = "готово";
  describe() {
    return `Derived, value = ${this.value}`; // поле підкласу ще НЕ ініціалізоване
  }
}
new Derived(); // Derived, value = undefined


// ==========================================================================
// 12. Reflect.construct ТА ВБУДОВАНІ КОНСТРУКТОРИ
// ==========================================================================

// Reflect.construct — програмний виклик `new` (з можливістю задати new.target)
console.log(Reflect.construct(Person, ["Оля", 20]).greet()); // Привіт, я Оля
// Використовується в Proxy-пастці construct (common/data-structures/Proxy/Proxy.js).

// Вбудовані конструктори працюють за тим самим принципом:
//   new Map(), new Set(), new Date(), new Error(), new Array(3)
// Але обгортки примітивів new String("a"), new Number(1), new Boolean(false)
// створюють ОБ'ЄКТИ і майже завжди є помилкою (common/type-coercion.js):
console.log(typeof new String("a")); // object
console.log(typeof String(1)); // string — без new це просто перетворення
console.log(new Boolean(false) ? "істина" : "хиба"); // істина — об'єкт завжди truthy


// ПІДСУМОК:
// - Constructor — функція/клас, що викликається з new і ініціалізує
//   новий об'єкт (`this`); спільні методи лежать на prototype
// - new робить 4 кроки: створити об'єкт із прототипом Constructor.prototype,
//   викликати конструктор з this = цей об'єкт, взяти повернений ОБ'ЄКТ
//   (примітиви ігноруються), інакше — створений об'єкт
// - return об'єкта з конструктора перебиває this (на цьому будується
//   Singleton), примітив ігнорується
// - забутий new у функції-конструкторі "витікає" у globalThis; захист —
//   new.target, strict mode або class (без new кидає TypeError)
// - class — синтаксичний цукор над конструктор-функціями та прототипами;
//   додає приватні поля (#), static, extends/super
// - у похідному класі super() — ДО використання this; без явного
//   конструктора JS додає constructor(...args) { super(...args) }
// - new.target дозволяє робити абстрактні класи
// - методи на прототипі економлять пам'ять; методи в конструкторі
//   (arrow-поля) дублюються на кожен екземпляр
// - конструктор має або створити валідний об'єкт, або кинути помилку;
//   він не може бути async і не перевантажується — для цього статичні
//   фабричні методи (fromString, create)
// - не викликайте з конструктора перевизначувані методи: поля
//   підкласу ще не ініціалізовані
// - не використовуйте new String/Number/Boolean — це об'єкти-обгортки
