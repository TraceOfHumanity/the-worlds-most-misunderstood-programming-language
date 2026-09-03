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


// ==========================================================================
// Object.keys() — детальний розбір
// ==========================================================================

// 1. ЩО РОБИТЬ
// -----------------------------------------------------
// Object.keys(obj) повертає МАСИВ рядків — імен ВЛАСНИХ (own)
// перелічуваних (enumerable) властивостей об'єкта, у тому порядку,
// в якому їх би обходив цикл for...in (але БЕЗ успадкованих
// властивостей з прототипу).

const userKeys = { name: "John", age: 30, city: "Kyiv" };
console.log(Object.keys(userKeys)); // ["name", "age", "city"]


// 2. "ВЛАСНІ" (OWN) — НЕ УСПАДКОВАНІ ВЛАСТИВОСТІ
// -----------------------------------------------------
// Object.keys() ігнорує властивості, отримані через прототип.
// Бере лише ті, що визначені безпосередньо на самому об'єкті.

const parentObj = { inherited: "я з прототипу" };
const childObj = Object.create(parentObj);
childObj.own = "я власна властивість";

console.log(Object.keys(childObj)); // ["own"] — inherited НЕ потрапляє


// 3. ТІЛЬКИ ENUMERABLE (перелічувані) ВЛАСТИВОСТІ
// -----------------------------------------------------
// Якщо властивість оголошена через Object.defineProperty з
// enumerable: false, вона не потрапить у результат Object.keys().

const withHiddenProp = {};
Object.defineProperty(withHiddenProp, "visible", {
  value: "видима",
  enumerable: true,
});
Object.defineProperty(withHiddenProp, "hidden", {
  value: "прихована",
  enumerable: false,
});
console.log(Object.keys(withHiddenProp)); // ["visible"]


// 4. ПОРЯДОК КЛЮЧІВ
// -----------------------------------------------------
// Порядок ключів у результаті НЕ довільний, він регламентований
// специфікацією:
//   1) спочатку всі ключі, що є цілими невід'ємними числами
//      (integer-like keys, наприклад "0", "1", "2") — у ЗРОСТАЮЧОМУ
//      числовому порядку, незалежно від порядку додавання;
//   2) потім усі звичайні строкові ключі — у порядку ДОДАВАННЯ
//      (insertion order);
//   3) symbol-ключі Object.keys() взагалі не повертає.

const orderedObj = { b: 1, 2: "два", a: 2, 1: "один" };
console.log(Object.keys(orderedObj)); // ["1", "2", "b", "a"]
// числові ключі "1" і "2" підняті наверх і відсортовані,
// а "b" і "a" йдуть у порядку, в якому їх дописали


// 5. РЕЗУЛЬТАТ — ЗАВЖДИ МАСИВ РЯДКІВ
// -----------------------------------------------------
// Навіть числові ключі повертаються як РЯДКИ, а не числа.

const numericKeysObj = { 10: "a", 20: "b" };
console.log(Object.keys(numericKeysObj)); // ["10", "20"]
console.log(typeof Object.keys(numericKeysObj)[0]); // "string"


// 6. РОБОТА З МАСИВАМИ
// -----------------------------------------------------
// Масиви — теж об'єкти, тому Object.keys() працює і з ними,
// повертаючи індекси елементів як рядки.

const arrForKeys = ["x", "y", "z"];
console.log(Object.keys(arrForKeys)); // ["0", "1", "2"]


// 7. ПОРОЖНІЙ ОБ'ЄКТ ТА "МЕЖОВІ" ЗНАЧЕННЯ
// -----------------------------------------------------
console.log(Object.keys({})); // []

// Примітиви автоматично обгортаються у Wrapper-об'єкт (String, Number...),
// і Object.keys повертає їхні власні перелічувані властивості:
console.log(Object.keys("abc")); // ["0", "1", "2"] — символи рядка

// null та undefined кидають помилку, бо їх неможливо привести до об'єкта:
// Object.keys(null); // TypeError: Cannot convert undefined or null to object


// 8. НАЙЧАСТІШЕ ЗАСТОСУВАННЯ — ІТЕРАЦІЯ ПО ОБ'ЄКТУ
// -----------------------------------------------------
// Оскільки об'єкти не є ітерованими (iterable) напряму (на відміну
// від масивів чи Map), Object.keys() — найпоширеніший спосіб
// пройтися по властивостях за допомогою forEach/map/for...of.

const productForIteration = { title: "Ноутбук", price: 25000, inStock: true };

Object.keys(productForIteration).forEach((key) => {
  console.log(`${key}: ${productForIteration[key]}`);
});
// title: Ноутбук
// price: 25000
// inStock: true

for (const key of Object.keys(productForIteration)) {
  console.log(key, "=", productForIteration[key]);
}


// 9. ПОРІВНЯННЯ З ІНШИМИ СПОСОБАМИ ОБХОДУ
// -----------------------------------------------------
// - Object.keys(obj)         → масив [ключ, ключ, ...] (лише власні enumerable)
// - Object.values(obj)       → масив [значення, значення, ...]
// - Object.entries(obj)      → масив [[ключ, значення], ...]
// - for...in                 → перебирає ключі, ВКЛЮЧНО зі спадкованими
//   (тому в for...in часто додатково перевіряють obj.hasOwnProperty(key))
// - Reflect.ownKeys(obj)     → усі власні ключі, включно з НЕ-enumerable
//   і symbol-ключами (найповніший варіант)

const forInDemo = Object.create({ inheritedProp: "з прототипу" });
forInDemo.ownProp = "власна";

for (const key in forInDemo) {
  console.log("for...in:", key); // виведе і ownProp, і inheritedProp
}
// Object.keys(forInDemo) поверне лише ["ownProp"]


// 10. ЧАСТИЙ ПРИЙОМ: ПЕРЕВІРКА, ЧИ ОБ'ЄКТ ПОРОЖНІЙ
// -----------------------------------------------------
function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}
console.log(isEmptyObject({})); // true
console.log(isEmptyObject({ a: 1 })); // false


// ПІДСУМОК:
// - повертає масив рядків-імен власних enumerable властивостей
// - НЕ включає успадковані з прототипу властивості
// - НЕ включає symbol-ключі
// - НЕ включає non-enumerable властивості
// - порядок: числові ключі за зростанням → рядкові за порядком додавання
// - працює з масивами (повертає індекси-рядки) і з примітивами-обгортками
// - null/undefined → TypeError
// - головне застосування: ітерація по властивостях об'єкта


// ==========================================================================
// Object.values() — детальний розбір
// ==========================================================================

// 1. ЩО РОБИТЬ
// -----------------------------------------------------
// Object.values(obj) повертає МАСИВ значень ВЛАСНИХ (own)
// перелічуваних (enumerable) властивостей об'єкта. По суті —
// "сестра" Object.keys(), але замість ключів повертає значення.

const userValues = { name: "John", age: 30, city: "Kyiv" };
console.log(Object.values(userValues)); // ["John", 30, "Kyiv"]


// 2. ПОРЯДОК ЗНАЧЕНЬ ЗБІГАЄТЬСЯ З ПОРЯДКОМ Object.keys()
// -----------------------------------------------------
// Значення йдуть у ТОМУ Ж порядку, що й ключі з Object.keys():
// спочатку числові ключі за зростанням, потім рядкові за порядком
// додавання (insertion order).

const orderedValuesObj = { b: "два-Б", 2: "два", a: "два-А", 1: "один" };
console.log(Object.keys(orderedValuesObj));   // ["1", "2", "b", "a"]
console.log(Object.values(orderedValuesObj)); // ["один", "два", "два-Б", "два-А"]
// values[i] відповідає keys[i] — порядок завжди узгоджений


// 3. "ВЛАСНІ" (OWN) — НЕ УСПАДКОВАНІ ЗНАЧЕННЯ
// -----------------------------------------------------
// Так само, як і Object.keys(), значення успадкованих з прототипу
// властивостей у результат НЕ потрапляють.

const parentForValues = { inherited: "я з прототипу" };
const childForValues = Object.create(parentForValues);
childForValues.own = "я власна властивість";

console.log(Object.values(childForValues)); // ["я власна властивість"]


// 4. ТІЛЬКИ ENUMERABLE ЗНАЧЕННЯ
// -----------------------------------------------------
// Значення non-enumerable властивостей (enumerable: false)
// у результат не входять — так само, як і в Object.keys().

const withHiddenValue = {};
Object.defineProperty(withHiddenValue, "visible", {
  value: "видиме значення",
  enumerable: true,
});
Object.defineProperty(withHiddenValue, "hidden", {
  value: "приховане значення",
  enumerable: false,
});
console.log(Object.values(withHiddenValue)); // ["видиме значення"]


// 5. РОБОТА З МАСИВАМИ
// -----------------------------------------------------
// Для масивів Object.values() повертає самі елементи (а не індекси,
// як це робить Object.keys()) — тобто фактично копію масиву значень.

const arrForValues = ["x", "y", "z"];
console.log(Object.values(arrForValues)); // ["x", "y", "z"]


// 6. ПРИМІТИВИ ТА "МЕЖОВІ" ЗНАЧЕННЯ
// -----------------------------------------------------
console.log(Object.values({})); // []
console.log(Object.values("abc")); // ["a", "b", "c"] — символи рядка
// Object.values(null); // TypeError: Cannot convert undefined or null to object


// 7. ЯКЩО ЗНАЧЕННЯ — ГЕТТЕР (getter)
// -----------------------------------------------------
// Object.values() ВИКЛИКАЄ геттер, щоб отримати актуальне значення —
// на відміну від Object.getOwnPropertyDescriptor(), який повернув би
// саму функцію-геттер, а не результат її виклику.

const objWithGetter = {
  _price: 100,
  get price() {
    console.log("геттер price викликано");
    return this._price * 1.2; // наприклад, ціна з ПДВ
  },
};
console.log(Object.values(objWithGetter)); // [100, 120] — геттер спрацював


// 8. НАЙЧАСТІШЕ ЗАСТОСУВАННЯ
// -----------------------------------------------------
// Коли потрібні саме ЗНАЧЕННЯ об'єкта, а ключі не важливі —
// наприклад, для підрахунків, пошуку, перевірки умов.

const cart = { apple: 3, banana: 5, orange: 2 };

// сума всіх значень:
const totalItems = Object.values(cart).reduce((sum, count) => sum + count, 0);
console.log(totalItems); // 10

// чи є хоч одне значення більше 4:
console.log(Object.values(cart).some((count) => count > 4)); // true

// максимальне значення:
console.log(Math.max(...Object.values(cart))); // 5


// 9. ПОРІВНЯННЯ З Object.keys() ТА Object.entries()
// -----------------------------------------------------
// - Object.keys(obj)    → ["k1", "k2", ...]              лише ключі
// - Object.values(obj)  → ["v1", "v2", ...]              лише значення
// - Object.entries(obj) → [["k1","v1"], ["k2","v2"], ...] і ключ, і значення
// Якщо потрібні одразу і ключ, і значення — краще одразу взяти
// Object.entries(), а не окремо викликати keys() і values().


// ПІДСУМОК:
// - повертає масив значень власних enumerable властивостей
// - порядок завжди узгоджений з Object.keys() (той самий обхід)
// - НЕ включає успадковані та non-enumerable властивості
// - для геттерів повертає РЕЗУЛЬТАТ виклику геттера, а не саму функцію
// - працює з масивами (повертає елементи) і з примітивами-обгортками
// - null/undefined → TypeError
// - головне застосування: підрахунки/пошук/агрегації по значеннях об'єкта


// ==========================================================================
// Object.entries() — детальний розбір
// ==========================================================================

// 1. ЩО РОБИТЬ
// -----------------------------------------------------
// Object.entries(obj) повертає МАСИВ пар [ключ, значення] для
// ВЛАСНИХ (own) перелічуваних (enumerable) властивостей об'єкта.
// Кожен елемент результату — це масив із двох елементів: [key, value].

const userEntries = { name: "John", age: 30, city: "Kyiv" };
console.log(Object.entries(userEntries));
// [["name","John"], ["age",30], ["city","Kyiv"]]


// 2. ПО СУТІ — ОБ'ЄДНАННЯ Object.keys() ТА Object.values()
// -----------------------------------------------------
// Object.entries(obj)[i] === [Object.keys(obj)[i], Object.values(obj)[i]]
// Порядок пар той самий, що й порядок обходу в keys()/values():
// спочатку числові ключі за зростанням, потім рядкові за insertion order.

const orderedEntriesObj = { b: 1, 2: "два", a: 2, 1: "один" };
console.log(Object.entries(orderedEntriesObj));
// [["1","один"], ["2","два"], ["b",1], ["a",2]]


// 3. "ВЛАСНІ" ENUMERABLE ПАРИ — ТІ САМІ ПРАВИЛА, ЩО Й У keys()/values()
// -----------------------------------------------------
// Успадковані з прототипу та non-enumerable властивості в результат
// не потрапляють.

const parentForEntries = { inherited: "з прототипу" };
const childForEntries = Object.create(parentForEntries);
childForEntries.own = "власна";
console.log(Object.entries(childForEntries)); // [["own", "власна"]]


// 4. НАЙЧАСТІШЕ ЗАСТОСУВАННЯ — ІТЕРАЦІЯ З ДЕСТРУКТУРИЗАЦІЄЮ
// -----------------------------------------------------
// Оскільки кожна пара — це масив [key, value], зручно одразу
// деструктурувати обидва значення прямо в циклі чи в колбеку.

const productForEntries = { title: "Ноутбук", price: 25000, inStock: true };

for (const [key, value] of Object.entries(productForEntries)) {
  console.log(`${key}: ${value}`);
}
// title: Ноутбук
// price: 25000
// inStock: true

Object.entries(productForEntries).forEach(([key, value]) => {
  console.log(key, "->", value);
});


// 5. ПЕРЕТВОРЕННЯ ОБ'ЄКТА ЧЕРЕЗ map/filter (ОБ'ЄКТ → МАСИВ → ОБ'ЄКТ)
// -----------------------------------------------------
// Об'єкти самі по собі не мають map/filter, але через entries()
// їх можна "прогнати" крізь масивні методи, а тоді зібрати назад
// в об'єкт через Object.fromEntries() — це і є та причина,
// чому entries() та fromEntries() зазвичай працюють в парі.

const prices = { apple: 10, banana: 20, orange: 30 };

// підняти всі ціни на 10%:
const pricesWithMarkup = Object.fromEntries(
  Object.entries(prices).map(([key, value]) => [key, Math.round(value * 1.1)])
);
console.log(pricesWithMarkup); // { apple: 11, banana: 22, orange: 33 }

// залишити тільки товари з ціною більше 15:
const expensiveOnly = Object.fromEntries(
  Object.entries(prices).filter(([, value]) => value > 15)
);
console.log(expensiveOnly); // { banana: 20, orange: 30 }


// 6. РОБОТА З МАСИВАМИ
// -----------------------------------------------------
// Для масивів entries() повертає пари [індекс, значення]
// (індекс — у вигляді рядка, як і в keys()).

const arrForEntries = ["x", "y", "z"];
console.log(Object.entries(arrForEntries));
// [["0","x"], ["1","y"], ["2","z"]]


// 7. ЯКЩО ЗНАЧЕННЯ — ГЕТТЕР
// -----------------------------------------------------
// Так само, як і Object.values(), Object.entries() ВИКЛИКАЄ геттер
// і бере результат його виконання, а не саму функцію-геттер.

const objWithGetterEntries = {
  _price: 100,
  get price() {
    return this._price * 1.2;
  },
};
console.log(Object.entries(objWithGetterEntries));
// [["_price", 100], ["price", 120]]


// 8. "МЕЖОВІ" ЗНАЧЕННЯ
// -----------------------------------------------------
console.log(Object.entries({})); // []
console.log(Object.entries("ab")); // [["0","a"], ["1","b"]]
// Object.entries(null); // TypeError: Cannot convert undefined or null to object


// 9. ЗВОРОТНА ОПЕРАЦІЯ — Object.fromEntries()
// -----------------------------------------------------
// Object.fromEntries() — це обернена до Object.entries() операція:
// масив пар [ключ, значення] → об'єкт. Разом вони утворюють
// повний цикл "об'єкт → масив пар → трансформація → об'єкт".

const backToObject = Object.fromEntries(Object.entries(userEntries));
console.log(backToObject); // { name: "John", age: 30, city: "Kyiv" }
console.log(backToObject !== userEntries); // true — це НОВИЙ об'єкт (shallow copy)


// 10. ПОРІВНЯННЯ З Map
// -----------------------------------------------------
// Формат [ключ, значення] пар — це той самий формат, який приймає
// конструктор Map. Тому Object.entries() зручно використовувати
// для перетворення звичайного об'єкта в Map:

const userMap = new Map(Object.entries(userEntries));
console.log(userMap.get("name")); // "John"
console.log(userMap instanceof Map); // true


// ПІДСУМОК:
// - повертає масив пар [ключ, значення] власних enumerable властивостей
// - порядок узгоджений з Object.keys()/Object.values()
// - НЕ включає успадковані та non-enumerable властивості
// - для геттерів повертає результат виклику, а не саму функцію
// - працює з масивами (пари [індекс, елемент]) і примітивами-обгортками
// - null/undefined → TypeError
// - у парі з Object.fromEntries() дозволяє "map/filter" по об'єкту
// - формат пар сумісний із конструктором Map
