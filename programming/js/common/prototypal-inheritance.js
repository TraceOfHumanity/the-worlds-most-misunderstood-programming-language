// ==========================================================================
// PROTOTYPAL INHERITANCE — ПРОТОТИПНЕ НАСЛІДУВАННЯ VS class/extends
// ==========================================================================

// 1. ГОЛОВНА ІДЕЯ: JS НЕ МАЄ "КЛАСИЧНОГО" НАСЛІДУВАННЯ ЗА ЗАДУМОМ
// -----------------------------------------------------
// На відміну від Java/C#/Python (де класи — окрема, самостійна
// концепція), у JavaScript ВСЯ система наслідування побудована на
// ОДНОМУ-ЄДИНОМУ механізмі: КОЖЕН об'єкт має внутрішнє посилання на
// ІНШИЙ об'єкт — свій ПРОТОТИП ([[Prototype]]). Коли рушій шукає
// властивість, якої немає на самому об'єкті, він іде "вгору" по
// ЛАНЦЮЖКУ ПРОТОТИПІВ (prototype chain), доки не знайде її або не
// дійде до null. class/extends (ES6) — це ЛИШЕ СИНТАКСИЧНИЙ ЦУКОР
// над ЦИМ САМИМ механізмом, а не окрема, "справжня" система класів.

const animalProto = {
  speak() {
    return `${this.name} видає звук`;
  },
};

const dog = Object.create(animalProto); // dog.[[Prototype]] === animalProto
dog.name = "Рекс";
console.log(dog.speak()); // "Рекс видає звук" — метод НЕ на dog, а на animalProto
console.log(Object.hasOwn(dog, "speak"));            // false — не власна властивість
console.log(Object.getPrototypeOf(dog) === animalProto); // true


// ==========================================================================
// 2. [[Prototype]] vs __proto__ vs .prototype — ТРИ РІЗНІ РЕЧІ, ЯКІ ПЛУТАЮТЬ
// ==========================================================================

// - [[Prototype]]  — ВНУТРІШНІЙ слот КОЖНОГО об'єкта (не властивість,
//                     недоступний напряму за специфікацією)
// - __proto__      — ЗАСТАРІЛИЙ (legacy) геттер/сеттер, що дає доступ
//                     до [[Prototype]] КОНКРЕТНОГО ОБ'ЄКТА (екземпляра)
// - .prototype     — ЗВИЧАЙНА властивість, яка існує ЛИШЕ НА ФУНКЦІЯХ
//                     (включно з класами) — це об'єкт, який СТАНЕ
//                     [[Prototype]] для екземплярів, створених через new

function Animal(name) {
  this.name = name;
}
console.log(typeof Animal.prototype);          // "object" — властивість самої функції
console.log(Animal.prototype.constructor === Animal); // true — кругове посилання за замовчуванням

const cat = new Animal("Мурчик");
console.log(Object.getPrototypeOf(cat) === Animal.prototype); // true — ось і зв'язок
console.log(cat.__proto__ === Animal.prototype);               // те саме, застарілим способом
console.log(cat.prototype);                                     // undefined! — .prototype є
                                                                   // ЛИШЕ у ФУНКЦІЙ, не в екземплярів


// ==========================================================================
// 3. ЯК ПРАЦЮЄ ПОШУК ВЛАСТИВОСТІ ПО ЛАНЦЮЖКУ ПРОТОТИПІВ
// ==========================================================================

Animal.prototype.eat = function () {
  return `${this.name} їсть`;
};

console.log(cat.eat()); // "Мурчик їсть"
// ПОКРОКОВО, що відбувається при cat.eat():
//   1) рушій дивиться, чи є "eat" ВЛАСНОЮ (own) властивістю cat → немає
//   2) піднімається до Object.getPrototypeOf(cat), тобто Animal.prototype → є! викликає
// Якби не було й там — пішов би ЩЕ ВИЩЕ, до Object.getPrototypeOf(Animal.prototype),
// тобто до Object.prototype, і зрештою до null (кінець ланцюжка).

console.log(Object.getPrototypeOf(Animal.prototype) === Object.prototype); // true
console.log(Object.getPrototypeOf(Object.prototype));                       // null — кінець ланцюжка

// cat.toString() ЩЕ ДАЛІ по ланцюжку — знайдеться аж на Object.prototype:
console.log(cat.toString()); // "[object Object]" — знайдено аж на Object.prototype, не на cat і не на Animal.prototype


// 4. SHADOWING — ВЛАСНА ВЛАСТИВІСТЬ "ЗАТІНЮЄ" ОДНОЙМЕННУ З ПРОТОТИПУ
// -----------------------------------------------------
// Якщо додати властивість З ТИМ САМИМ ІМ'ЯМ безпосередньо на екземпляр,
// вона "перекриє" однойменну з прототипу — рушій знайде "свою" ПЕРШОЮ
// і НАВІТЬ НЕ ПІДНІМЕТЬСЯ вище по ланцюжку.

cat.eat = function () {
  return `${this.name} їсть ОСОБЛИВО`;
};
console.log(cat.eat()); // "Мурчик їсть ОСОБЛИВО" — власна властивість переможла
delete cat.eat;
console.log(cat.eat()); // "Мурчик їсть" — знову бере з прототипу, як і раніше


// ==========================================================================
// 5. ЧОТИРИ СПОСОБИ РЕАЛІЗУВАТИ ПРОТОТИПНЕ НАСЛІДУВАННЯ (ІСТОРИЧНО)
// ==========================================================================

// --- 5.1. Object.create() — НАЙПРЯМІШИЙ, "ЧИСТИЙ" СПОСІБ ---
// -----------------------------------------------------
const vehicleProto = {
  init(type) {
    this.type = type;
    return this;
  },
  describe() {
    return `Це ${this.type}`;
  },
};
const car = Object.create(vehicleProto).init("автомобіль");
console.log(car.describe()); // "Це автомобіль"


// --- 5.2. FUNCTION CONSTRUCTOR + .prototype (ES5, "класичний" підхід) ---
// -----------------------------------------------------
function Vehicle(type) {
  this.type = type;
}
Vehicle.prototype.describe = function () {
  return `Це ${this.type}`;
};

function Car(type, wheels) {
  Vehicle.call(this, type); // "успадкування" ВЛАСНИХ ПОЛІВ через явний виклик
                              // батьківського конструктора з this поточного об'єкта
  this.wheels = wheels;
}
// ключовий рядок "класичного" наслідування — ПІДМІНА прототипу:
Car.prototype = Object.create(Vehicle.prototype);
Car.prototype.constructor = Car; // виправляємо "зламаний" constructor після підміни

Car.prototype.honk = function () {
  return `${this.type} сигналить!`;
};

const myCar = new Car("Седан", 4);
console.log(myCar.describe()); // "Це Седан" — успадковано від Vehicle.prototype
console.log(myCar.honk());     // "Седан сигналить!" — власний метод Car
console.log(myCar instanceof Car);    // true
console.log(myCar instanceof Vehicle); // true — ланцюжок працює

// ЧОМУ ВАЖЛИВО Object.create(Vehicle.prototype), А НЕ new Vehicle():
// new Vehicle() ВИКОНАВ БИ конструктор Vehicle одразу (побічні ефекти,
// зайва робота), а Object.create() лише СТВОРЮЄ об'єкт із потрібним
// прототипом, НЕ викликаючи жодного коду конструктора.


// --- 5.3. Object.setPrototypeOf() — ЗМІНА ПРОТОТИПУ ВЖЕ ІСНУЮЧОГО ОБ'ЄКТА ---
// -----------------------------------------------------
// (детально розібрано в common/data-structures/Object/Object.js —
// тут лише нагадування, чому це РІДКО правильний вибір для наслідування:
// офіційно НЕ рекомендовано для продуктивного коду, бо ламає внутрішні
// оптимізації рушія; Object.create() — кращий вибір, коли прототип
// відомий ЗАЗДАЛЕГІДЬ, під час створення об'єкта)


// --- 5.4. class/extends (ES6) — СУЧАСНИЙ, РЕКОМЕНДОВАНИЙ СИНТАКСИС ---
// -----------------------------------------------------
// Той САМИЙ результат, що й у 5.2, але без ручного жонглювання
// prototype/call() — рушій робить усе це "під капотом" сам.


// ==========================================================================
// 6. class/extends — СИНТАКСИЧНИЙ ЦУКОР НАД ПРОТОТИПАМИ (НЕ НОВА СИСТЕМА)
// ==========================================================================

class VehicleClass {
  constructor(type) {
    this.type = type;
  }
  describe() {
    return `Це ${this.type}`;
  }
}

class CarClass extends VehicleClass {
  constructor(type, wheels) {
    super(type); // еквівалент Vehicle.call(this, type) з пункту 5.2
    this.wheels = wheels;
  }
  honk() {
    return `${this.type} сигналить!`;
  }
}

const myCarClass = new CarClass("Хетчбек", 4);
console.log(myCarClass.describe()); // "Це Хетчбек" — той самий механізм пошуку по прототипу
console.log(myCarClass.honk());

// ДОКАЗ, ЩО ЦЕ ТОЙ САМИЙ МЕХАНІЗМ:
console.log(typeof CarClass);                                  // "function" — class це і є функція!
console.log(Object.getPrototypeOf(myCarClass) === CarClass.prototype);        // true
console.log(Object.getPrototypeOf(CarClass.prototype) === VehicleClass.prototype); // true — ланцюжок прототипів,
                                                                                       // побудований АВТОМАТИЧНО extends'ом
console.log(Object.getPrototypeOf(CarClass) === VehicleClass);  // true! — навіть СТАТИЧНІ методи/сама
                                                                    // функція-клас теж отримує прототипний зв'язок


// ==========================================================================
// 7. super — ЩО ВІН НАСПРАВДІ РОБИТЬ (ДВІ РІЗНІ РЕЧІ)
// ==========================================================================

// а) super(...) У КОНСТРУКТОРІ — виклик БАТЬКІВСЬКОГО конструктора
// -----------------------------------------------------
// У ПОХІДНОМУ класі (extends) this НЕ ІСНУЄ, доки НЕ викликано
// super() — це ключова відмінність від звичайних функцій-конструкторів!

class Broken extends VehicleClass {
  constructor(type) {
    // this.type = type; // ReferenceError: Must call super constructor
    //                     before accessing 'this' or returning from derived constructor
    super(type); // ОБОВ'ЯЗКОВО ПЕРШИМ ділом у похідному класі
    this.extra = "ok"; // тепер this доступний
  }
}
new Broken("тест");

// б) super.method() У ЗВИЧАЙНОМУ МЕТОДІ — виклик БАТЬКІВСЬКОЇ ВЕРСІЇ методу
// -----------------------------------------------------
class Base {
  describe() {
    return "базовий опис";
  }
}
class Derived extends Base {
  describe() {
    return `${super.describe()} + додатковий опис`; // явно викликаємо ВЕРСІЮ З ПРОТОТИПУ Base
  }
}
console.log(new Derived().describe()); // "базовий опис + додатковий опис"


// ==========================================================================
// 8. МЕТОДИ КЛАСУ — NON-ENUMERABLE, НА ВІДМІНУ ВІД ЗВИЧАЙНИХ ВЛАСТИВОСТЕЙ
// ==========================================================================

// Усі методи, оголошені в тілі class, автоматично non-enumerable —
// це навмисно зроблено, щоб for...in / Object.keys() на екземплярі
// НЕ "засмічувались" методами з прототипу.

console.log(Object.keys(myCarClass));                       // ["type", "wheels"] — лише ВЛАСНІ ПОЛЯ
console.log(Object.getOwnPropertyNames(CarClass.prototype)); // ["constructor", "honk"] — методи ТУТ

const descriptor = Object.getOwnPropertyDescriptor(CarClass.prototype, "honk");
console.log(descriptor.enumerable); // false


// ==========================================================================
// 9. instanceof — ЯК ВІН НАСПРАВДІ ПЕРЕВІРЯЄ ("ЧЕРЕЗ" ПРОТОТИП, НЕ ЧЕРЕЗ ІМ'Я КЛАСУ)
// ==========================================================================

// obj instanceof Constructor перевіряє, чи Є Constructor.prototype
// ДЕСЬ У ЛАНЦЮЖКУ ПРОТОТИПІВ obj — а НЕ "чи obj БУВ СТВОРЕНИЙ САМЕ
// ЦИМ конструктором". Це показує, що instanceof теж працює через
// прототипи, а не через якусь окрему "мітку класу".

console.log(myCarClass instanceof CarClass);     // true
console.log(myCarClass instanceof VehicleClass); // true — прототип VehicleClass теж у ланцюжку
console.log(myCarClass instanceof Object);       // true — Object.prototype теж у ланцюжку (найвищий рівень)

// ДОКАЗ, ЩО instanceof "не знає" про сам клас, а лише про prototype:
function FakeCar() {}
FakeCar.prototype = CarClass.prototype; // підмінили prototype вручну
console.log(new FakeCar() instanceof CarClass); // true! — хоча new FakeCar()
                                                   // НІКОЛИ не викликав жодного коду CarClass


// ==========================================================================
// 10. МЕТОДИ ПРОТОТИПУ VS ВЛАСНІ ПОЛЯ ЕКЗЕМПЛЯРА — ЕКОНОМІЯ ПАМ'ЯТІ
// ==========================================================================

// Методи, визначені В ТІЛІ class (чи через Constructor.prototype.method),
// СПІЛЬНІ для ВСІХ екземплярів — існують В ОДНІЙ КОПІЇ на прототипі.
// Якщо ж визначити "метод" як CLASS FIELD зі стрілкою (this.method = () => {}
// у конструкторі), КОЖЕН екземпляр отримає СВОЮ ВЛАСНУ копію функції.

class WithPrototypeMethod {
  describe() {
    return "метод на прототипі";
  }
}
class WithInstanceField {
  describe = () => "метод як власне поле екземпляра";
}

const p1 = new WithPrototypeMethod();
const p2 = new WithPrototypeMethod();
console.log(p1.describe === p2.describe); // true — ОДНА Й ТА САМА функція в пам'яті (economно)

const f1 = new WithInstanceField();
const f2 = new WithInstanceField();
console.log(f1.describe === f2.describe); // false — КОЖЕН екземпляр має СВОЮ окрему функцію
// компроміс: клас-поле зі стрілкою дає "авто-прив'язаний" this
// (детально в common/this.js), АЛЕ коштує додаткової пам'яті на
// кожен екземпляр — для великої кількості об'єктів це може бути помітно


// ==========================================================================
// 11. МІКСИНИ (MIXINS) — "МНОЖИННЕ НАСЛІДУВАННЯ" ЧЕРЕЗ КОМПОЗИЦІЮ ФУНКЦІЙ
// ==========================================================================

// JS НЕ МАЄ множинного наслідування (extends приймає ЛИШЕ ОДИН клас) —
// але можна ЕМУЛЮВАТИ його через функції, що приймають клас і
// повертають НОВИЙ клас-"обгортку" з доданою поведінкою.

const CanFly = (Base) =>
  class extends Base {
    fly() {
      return `${this.name} летить`;
    }
  };
const CanSwim = (Base) =>
  class extends Base {
    swim() {
      return `${this.name} пливе`;
    }
  };

class Creature {
  constructor(name) {
    this.name = name;
  }
}
class Duck extends CanSwim(CanFly(Creature)) {} // "ланцюжок" міксинів

const duck = new Duck("Кряк");
console.log(duck.fly());  // "Кряк летить"
console.log(duck.swim()); // "Кряк пливе"
// duck успадковує через ЦІЛУ послідовність прототипів:
// Duck.prototype → CanSwim-клас.prototype → CanFly-клас.prototype → Creature.prototype


// ==========================================================================
// 12. Object.create(null) — ОБ'ЄКТ ПОЗА ЛАНЦЮЖКОМ ПРОТОТИПІВ УЗАГАЛІ
// ==========================================================================

const pureDictionary = Object.create(null);
pureDictionary.key = "значення";
console.log(pureDictionary.toString); // undefined! — навіть Object.prototype відсутній
// console.log(pureDictionary.hasOwnProperty); // undefined — тому Object.hasOwn() (статичний,
                                                  // не залежить від прототипу) — безпечніший вибір
console.log(Object.hasOwn(pureDictionary, "key")); // true — працює для БУДЬ-ЯКОГО об'єкта


// ==========================================================================
// 13. ПРОТОТИПНЕ VS "КЛАСИЧНЕ" НАСЛІДУВАННЯ — КЛЮЧОВА КОНЦЕПТУАЛЬНА РІЗНИЦЯ
// ==========================================================================

// | Класичне наслідування (Java/C#)        | Прототипне наслідування (JS)              |
// |-------------------------------------------|-----------------------------------------------|
// | Клас — "креслення", окрема сутність       | Прототип — ЖИВИЙ ОБ'ЄКТ, що існує в пам'яті   |
// | Копіювання структури при компіляції       | Пошук властивості ДИНАМІЧНО, під час виконання |
// | Зміна класу не впливає на існуючі об'єкти | Зміна ПРОТОТИПУ одразу впливає на ВСІ об'єкти,
// |                                             | що вже посилаються на нього (навіть створені раніше!) |

Vehicle.prototype.newMethod = function () {
  return "я з'явився ПІСЛЯ створення myCar!";
};
console.log(myCar.newMethod()); // працює! — myCar шукає метод У ПРОТОТИПІ В МОМЕНТ ВИКЛИКУ,
                                  // а не в момент свого створення


// ПІДСУМОК:
// - в основі ВСЬОГО лежить ОДИН механізм: [[Prototype]] — посилання
//   кожного об'єкта на інший об'єкт, по якому рушій шукає властивості,
//   якщо не знайшов їх на самому об'єкті (prototype chain)
// - [[Prototype]] (внутрішній слот) ≠ __proto__ (застарілий геттер
//   до нього) ≠ .prototype (властивість ФУНКЦІЙ, що стане [[Prototype]]
//   для екземплярів, створених через new)
// - shadowing: власна властивість екземпляра "перекриває" однойменну
//   з прототипу, не видаляючи й не змінюючи саму властивість прототипу
// - class/extends/super — це ПОВНІСТЮ синтаксичний цукор над тим
//   самим Function + .prototype + Object.create() механізмом, який
//   існував і в ES5 — жодної "нової", окремої системи класів немає
// - super() у конструкторі ОБОВ'ЯЗКОВИЙ до першого звернення до this
//   у похідному класі; super.method() викликає версію методу з
//   прототипу батьківського класу
// - методи класу — non-enumerable за замовчуванням (не "засмічують"
//   Object.keys()/for...in на екземплярі)
// - instanceof перевіряє наявність ПРОТОТИПУ в ланцюжку, а не
//   "справжнє походження" об'єкта від конкретного конструктора
// - методи на прототипі — ОДНА спільна копія для всіх екземплярів;
//   class field зі стрілкою — окрема копія на КОЖЕН екземпляр (this.js)
// - множинного наслідування немає, але міксини (функції, що
//   повертають клас-обгортку) емулюють подібну поведінку через
//   ланцюжок додаткових прототипів
// - зміна прототипу впливає ОДРАЗУ на всі об'єкти, що на нього
//   посилаються, — навіть на ті, що були створені РАНІШЕ за зміну