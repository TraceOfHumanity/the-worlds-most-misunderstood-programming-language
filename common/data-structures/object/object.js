// ==========================================================================
// СПОСОБИ СТВОРЕННЯ ОБ'ЄКТІВ У JAVASCRIPT
// ==========================================================================

// 1. OBJECT LITERAL (об'єктний літерал) — найпоширеніший спосіб
// -----------------------------------------------------
const literalObj = {
  name: "John",
  age: 30,
};
console.log(literalObj);


// 2. NEW OBJECT()
// -----------------------------------------------------
// Створює порожній об'єкт через вбудований конструктор Object.
// Функціонально ідентично до {}, але {} — швидший і прийнятіший
// (idiomatic) варіант.
const newObj = new Object();
newObj.name = "Alex";
console.log(newObj);


// 3. OBJECT.CREATE()
// -----------------------------------------------------
// Створює новий об'єкт з ЯВНО вказаним прототипом.
// Object.create(null) створює об'єкт БЕЗ прототипу взагалі
// (навіть без Object.prototype) — корисно для "чистих" словників.
const proto = {
  greet() {
    return "Привіт!";
  },
};
const createdObj = Object.create(proto);
createdObj.name = "Ann";
console.log(createdObj.greet()); // "Привіт!" — успадковано з proto
console.log(Object.getPrototypeOf(createdObj) === proto); // true

const dictLikeObj = Object.create(null);
dictLikeObj.key = "value";
console.log(dictLikeObj); // [Object: null prototype] { key: 'value' }


// 4. CONSTRUCTOR FUNCTION (функція-конструктор)
// -----------------------------------------------------
// Виклик функції з ключовим словом `new` створює новий об'єкт,
// прив'язує до нього this і повертає його (якщо конструктор
// явно не повертає інший об'єкт).
function Person(name, age) {
  this.name = name;
  this.age = age;
}
const personFromConstructor = new Person("Bob", 25);
console.log(personFromConstructor);


// 5. CLASS (ES6 класи — синтаксичний цукор над конструктор-функціями)
// -----------------------------------------------------
class PersonClass {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}
const personFromClass = new PersonClass("Kate", 28);
console.log(personFromClass);


// 6. FACTORY FUNCTION (фабрична функція)
// -----------------------------------------------------
// Звичайна функція, яка повертає новий об'єкт БЕЗ використання `new`.
// Не потребує this і конструкторів, простіше уникнути пасток з `this`.
function createPerson(name, age) {
  return {
    name,
    age,
  };
}
const personFromFactory = createPerson("Mike", 40);
console.log(personFromFactory);


// 7. OBJECT.ASSIGN()
// -----------------------------------------------------
// Створює новий об'єкт (точніше, копіює властивості в цільовий об'єкт)
// шляхом об'єднання одного чи кількох джерел. Часто використовують
// для (поверхневого) клонування чи злиття об'єктів.
const assignedObj = Object.assign({}, { a: 1 }, { b: 2 });
console.log(assignedObj); // { a: 1, b: 2 }


// 8. SPREAD OPERATOR (оператор розгортання, ES2018)
// -----------------------------------------------------
// Створює новий об'єкт, копіюючи властивості існуючих об'єктів
// (поверхнева копія — shallow copy).
const spreadSource = { x: 1, y: 2 };
const spreadObj = { ...spreadSource, z: 3 };
console.log(spreadObj); // { x: 1, y: 2, z: 3 }


// 9. JSON.PARSE()
// -----------------------------------------------------
// Створює об'єкт із рядка у форматі JSON. Часто використовується
// при отриманні даних з API або з localStorage.
const jsonObj = JSON.parse('{"name":"Zoe","age":22}');
console.log(jsonObj);


// 10. OBJECT.FROMENTRIES()
// -----------------------------------------------------
// Створює об'єкт із масиву пар [ключ, значення] (або з Map,
// або з будь-якого iterable, що видає такі пари).
const entriesObj = Object.fromEntries([
  ["a", 1],
  ["b", 2],
]);
console.log(entriesObj); // { a: 1, b: 2 }

const mapForEntries = new Map([["x", 10], ["y", 20]]);
console.log(Object.fromEntries(mapForEntries)); // { x: 10, y: 20 }


// 11. SINGLETON PATTERN (через IIFE — Immediately Invoked Function Expression)
// -----------------------------------------------------
// Функція, яка одразу викликається і повертає об'єкт. Використовується
// для створення єдиного екземпляра об'єкта з інкапсульованим станом.
const singleton = (function () {
  let privateValue = 0;
  return {
    increment() {
      privateValue += 1;
      return privateValue;
    },
  };
})();
console.log(singleton.increment()); // 1
console.log(singleton.increment()); // 2


// ПІДСУМОК:
// - {}                     — object literal, найпростіший і найшвидший спосіб
// - new Object()           — те саме, що {}, але через явний виклик конструктора
// - Object.create(proto)   — повний контроль над прототипом об'єкта
// - function + new         — класичний конструктор (pre-ES6 патерн)
// - class                  — сучасний синтаксис для конструкторів
// - factory function       — звичайна функція, що повертає об'єкт (без new/this)
// - Object.assign()        — злиття/копіювання властивостей у новий об'єкт
// - spread { ...obj }      — сучасна альтернатива Object.assign для копіювання
// - JSON.parse()           — створення об'єкта з JSON-рядка
// - Object.fromEntries()   — створення об'єкта з масиву пар [ключ, значення]
// - IIFE / singleton       — створення одного об'єкта з приватним станом


// ==========================================================================
// МЕТОДИ OBJECT — повний перелік (розбираємо по черзі)
// ==========================================================================

// --- СТАТИЧНІ МЕТОДИ (Object.methodName(...)) ---

// Робота з властивостями
// Object.keys()
// Object.values()
// Object.entries()
// Object.fromEntries()
// Object.assign()
// Object.defineProperty()
// Object.defineProperties()
// Object.getOwnPropertyNames()
// Object.getOwnPropertySymbols()
// Object.getOwnPropertyDescriptor()
// Object.getOwnPropertyDescriptors()
// Object.hasOwn()

// Створення об'єктів і робота з прототипами
// Object.create()
// Object.getPrototypeOf()
// Object.setPrototypeOf()

// Обмеження мутацій об'єкта
// Object.freeze()
// Object.isFrozen()
// Object.seal()
// Object.isSealed()
// Object.preventExtensions()
// Object.isExtensible()

// Порівняння
// Object.is()

// Групування (ES2024)
// Object.groupBy()


// --- МЕТОДИ ЕКЗЕМПЛЯРА (obj.methodName(...), через Object.prototype) ---

// obj.hasOwnProperty()
// obj.isPrototypeOf()
// obj.propertyIsEnumerable()
// obj.toString()
// obj.toLocaleString()
// obj.valueOf()
