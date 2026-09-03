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


// ==========================================================================
// Object.assign() — детальний розбір
// ==========================================================================

// 1. ЩО РОБИТЬ
// -----------------------------------------------------
// Object.assign(target, ...sources) КОПІЮЄ всі власні перелічувані
// властивості з одного чи кількох об'єктів-джерел (sources) у
// цільовий об'єкт (target) і ПОВЕРТАЄ target (той самий, змінений).
// Це МУТАЦІЯ target, а не створення нового об'єкта "з нуля".

const target1 = { a: 1 };
const source1 = { b: 2 };
const result1 = Object.assign(target1, source1);
console.log(result1);      // { a: 1, b: 2 }
console.log(result1 === target1); // true — це той самий об'єкт, не копія


// 2. ЯК СТВОРИТИ НОВИЙ ОБ'ЄКТ (найпоширеніший патерн)
// -----------------------------------------------------
// Щоб не мутувати жоден із джерельних об'єктів, першим аргументом
// передають ПОРОЖНІЙ об'єкт {} — саме так Object.assign() зазвичай
// використовують для (поверхневого) клонування/злиття.

const original = { x: 1, y: 2 };
const clone = Object.assign({}, original);
clone.x = 100;
console.log(original.x); // 1 — оригінал не змінився
console.log(clone.x);    // 100


// 3. ЗЛИТТЯ КІЛЬКОХ ДЖЕРЕЛ — ПОРЯДОК МАЄ ЗНАЧЕННЯ
// -----------------------------------------------------
// Можна передати скільки завгодно джерел. Властивості з наступних
// джерел ПЕРЕЗАПИСУЮТЬ однойменні властивості з попередніх
// (і з самого target), тобто "хто останній — той і переміг".

const merged = Object.assign({}, { a: 1, b: 1 }, { b: 2, c: 2 }, { c: 3 });
console.log(merged); // { a: 1, b: 2, c: 3 }


// 4. ЦЕ SHALLOW COPY (ПОВЕРХНЕВЕ КОПІЮВАННЯ)
// -----------------------------------------------------
// Object.assign() копіює значення властивостей ПЕРШОГО РІВНЯ.
// Якщо значення властивості — об'єкт/масив (reference type),
// копіюється лише ПОСИЛАННЯ на нього, а не сам вкладений об'єкт.

const nestedSource = { info: { age: 30 } };
const shallowCopy = Object.assign({}, nestedSource);

shallowCopy.info.age = 99;
console.log(nestedSource.info.age); // 99 — теж змінилось!
console.log(shallowCopy.info === nestedSource.info); // true — те саме посилання

// Для глибокого копіювання потрібні інші інструменти:
// structuredClone(obj), JSON.parse(JSON.stringify(obj)) (з обмеженнями),
// або рекурсивна функція / бібліотека (lodash.cloneDeep і т.д.)


// 5. ЩО САМЕ КОПІЮЄТЬСЯ: OWN + ENUMERABLE (включно з symbol-ключами)
// -----------------------------------------------------
// На відміну від Object.keys()/values()/entries(), Object.assign()
// копіює НЕ ЛИШЕ рядкові, а й SYMBOL-ключі — головне, щоб властивість
// була власною (own) і перелічуваною (enumerable).

const symKey = Symbol("id");
const sourceWithSymbol = { [symKey]: 123, regular: "звичайна" };
const targetWithSymbol = Object.assign({}, sourceWithSymbol);
console.log(targetWithSymbol[symKey]); // 123 — символ теж скопійований

// Успадковані та non-enumerable властивості НЕ копіюються:
const protoSource = { fromProto: "з прототипу" };
const ownSource = Object.create(protoSource);
ownSource.own = "власна";
console.log(Object.assign({}, ownSource)); // { own: "власна" } — без fromProto


// 6. ВИКОРИСТАННЯ ГЕТТЕРІВ/СЕТТЕРІВ ПІД ЧАС КОПІЮВАННЯ
// -----------------------------------------------------
// Object.assign() використовує звичайне присвоєння через [[Set]] —
// тобто якщо в джерелі є геттер, він БУДЕ викликаний, щоб отримати
// значення, а якщо в target є сеттер з тим самим ім'ям — спрацює він.
// Результат — завжди ЗВИЧАЙНА ДАНА властивість (data property) в target,
// геттери/сеттери самого source в target НЕ переносяться як geттери.

const sourceWithGetter = {
  get computed() {
    console.log("геттер викликано");
    return 42;
  },
};
const plainResult = Object.assign({}, sourceWithGetter);
console.log(plainResult); // { computed: 42 } — вже звичайне значення, не геттер


// 7. ПРОПУСКАЄ null / undefined СЕРЕД ДЖЕРЕЛ (АЛЕ НЕ TARGET)
// -----------------------------------------------------
// Якщо джерело — null або undefined, воно просто ігнорується
// (не кидає помилку). А от якщо null/undefined передати як TARGET
// (перший аргумент) — буде TypeError.

console.log(Object.assign({}, null, { a: 1 }, undefined)); // { a: 1 }
// Object.assign(null, { a: 1 }); // TypeError: Cannot convert undefined or null to object


// 8. ПРИМІТИВИ ЯК ДЖЕРЕЛА
// -----------------------------------------------------
// Примітиви-джерела обгортаються у Wrapper-об'єкт, і копіюються
// їхні власні перелічувані властивості (для рядка — це символи-індекси).

console.log(Object.assign({}, "abc")); // { 0: "a", 1: "b", 2: "c" }


// 9. ТИПОВІ ЗАСТОСУВАННЯ
// -----------------------------------------------------
// - злиття конфігів/опцій з дефолтними значеннями:
function createConfig(userOptions) {
  const defaults = { theme: "light", fontSize: 14 };
  return Object.assign({}, defaults, userOptions);
}
console.log(createConfig({ fontSize: 18 })); // { theme: "light", fontSize: 18 }

// - додавання властивостей до this всередині конструктора/методу:
class Widget {
  constructor(options) {
    Object.assign(this, { visible: true }, options);
  }
}
console.log(new Widget({ label: "OK" })); // Widget { visible: true, label: "OK" }


// 10. ПОРІВНЯННЯ ЗІ SPREAD-ОПЕРАТОРОМ { ...obj }
// -----------------------------------------------------
// object spread (ES2018) робить те саме, що Object.assign({}, obj),
// але це синтаксична конструкція, а не виклик функції, і вона
// завжди створює НОВИЙ об'єкт (не можна "мутувати" існуючий target).

const spreadMerge = { ...{ a: 1 }, ...{ b: 2 } };
const assignMerge = Object.assign({}, { a: 1 }, { b: 2 });
console.log(spreadMerge, assignMerge); // однаковий результат: { a: 1, b: 2 }

// Ключова відмінність: Object.assign() МОЖЕ мутувати переданий target,
// spread — ніколи (завжди новий об'єкт). У сучасному коді для
// злиття/клонування частіше обирають spread саме через це.


// ПІДСУМОК:
// - копіює власні enumerable властивості (включно з symbol-ключами)
//   з джерел у target і повертає МУТОВАНИЙ target
// - Object.assign({}, ...) — спосіб отримати новий об'єкт без мутації джерел
// - при кількох джерелах пізніші перезаписують однойменні властивості
// - це shallow copy — вкладені об'єкти копіюються ЗА ПОСИЛАННЯМ
// - викликає геттери джерела; в target записує звичайні значення
// - null/undefined серед джерел ігноруються, як target — кидають TypeError
// - типове застосування: злиття опцій/конфігів, розширення this
// - сучасна альтернатива для клонування/злиття — spread { ...obj }


// ==========================================================================
// Object.defineProperty() — детальний розбір
// ==========================================================================

// 1. ЩО РОБИТЬ
// -----------------------------------------------------
// Object.defineProperty(obj, propName, descriptor) визначає (або
// змінює) ОДНУ властивість об'єкта, даючи повний контроль над її
// поведінкою через "дескриптор властивості" — об'єкт з налаштуваннями.
// Повертає той самий obj (мутований).

const preciseObj = {};
Object.defineProperty(preciseObj, "id", {
  value: 1,
  writable: false,
  enumerable: true,
  configurable: false,
});
console.log(preciseObj.id); // 1


// 2. ЧИМ ЦЕ ВІДРІЗНЯЄТЬСЯ ВІД ЗВИЧАЙНОГО ПРИСВОЄННЯ
// -----------------------------------------------------
// Звичайне `obj.prop = value` створює властивість з "гостинними"
// дефолтами: writable, enumerable, configurable — усі TRUE.
// Object.defineProperty() дозволяє ЯВНО вказати кожен з цих
// прапорців (flags), і якщо не вказати — за замовчуванням вони FALSE.

const plainAssign = {};
plainAssign.a = 1; // writable: true, enumerable: true, configurable: true

const viaDefineProperty = {};
Object.defineProperty(viaDefineProperty, "a", { value: 1 });
// тут writable/enumerable/configurable — усі FALSE за замовчуванням!
console.log(Object.keys(viaDefineProperty)); // [] — властивість НЕ enumerable
viaDefineProperty.a = 999; // мовчки ігнорується (writable: false)
console.log(viaDefineProperty.a); // 1


// 3. ДВА ТИПИ ДЕСКРИПТОРІВ: DATA DESCRIPTOR і ACCESSOR DESCRIPTOR
// -----------------------------------------------------
// Дескриптор буває ОДНОГО з двох видів — не можна змішувати
// value/writable з get/set в одному дескрипторі.

// --- DATA DESCRIPTOR (звичайна властивість зі значенням) ---
// value:        саме значення властивості (за замовчуванням undefined)
// writable:     чи можна змінити value через звичайне присвоєння (default: false)
// enumerable:   чи властивість з'являється в for...in, Object.keys() і т.д. (default: false)
// configurable: чи можна видалити властивість або змінити її дескриптор пізніше (default: false)

Object.defineProperty(preciseObj, "readOnlyValue", {
  value: "не можна змінити",
  writable: false,
  enumerable: true,
  configurable: true,
});

// --- ACCESSOR DESCRIPTOR (геттер/сеттер) ---
// get:          функція, яка викликається при ЧИТАННІ властивості
// set:          функція, яка викликається при ЗАПИСІ властивості
// enumerable / configurable — ті самі прапорці, що й вище

const accessorObj = {};
let _internalValue = 0;
Object.defineProperty(accessorObj, "value", {
  get() {
    console.log("читаємо value");
    return _internalValue;
  },
  set(newValue) {
    console.log("записуємо value =", newValue);
    _internalValue = newValue;
  },
  enumerable: true,
  configurable: true,
});
accessorObj.value = 10; // "записуємо value = 10"
console.log(accessorObj.value); // "читаємо value" → 10


// 4. WRITABLE: false — ЗАХИСТ ВІД ПЕРЕЗАПИСУ ЗНАЧЕННЯ
// -----------------------------------------------------
const frozenValueObj = {};
Object.defineProperty(frozenValueObj, "version", {
  value: "1.0.0",
  writable: false,
  enumerable: true,
  configurable: true,
});
frozenValueObj.version = "2.0.0"; // у нестрогому режимі — мовчки ігнорується
console.log(frozenValueObj.version); // "1.0.0"

// У СУВОРОМУ РЕЖИМІ (strict mode / модулі / класи) така спроба
// кидає TypeError замість мовчазного ігнорування:
(function () {
  "use strict";
  try {
    frozenValueObj.version = "3.0.0";
  } catch (e) {
    console.log(e.message); // "Cannot assign to read only property 'version'..."
  }
})();


// 5. ENUMERABLE: false — ПРИХОВАТИ ВЛАСТИВІСТЬ ВІД ІТЕРАЦІЙ
// -----------------------------------------------------
// Класичний прийом для "службових" полів, які повинні існувати
// на об'єкті, але не повинні "засмічувати" JSON.stringify,
// Object.keys/values/entries, for...in, spread {...obj}.

const objWithHiddenId = { name: "product" };
Object.defineProperty(objWithHiddenId, "_internalId", {
  value: "uuid-123",
  writable: true,
  enumerable: false,
  configurable: true,
});
console.log(Object.keys(objWithHiddenId)); // ["name"] — _internalId прихована
console.log(objWithHiddenId._internalId);  // "uuid-123" — але доступ напряму працює
console.log(JSON.stringify(objWithHiddenId)); // {"name":"product"} — теж прихована
console.log({ ...objWithHiddenId }); // { name: "product" } — spread теж не бачить


// 6. CONFIGURABLE: false — ЗАХИСТ ВІД ВИДАЛЕННЯ І ПЕРЕВИЗНАЧЕННЯ
// -----------------------------------------------------
// Якщо configurable: false, то:
//   - delete obj.prop не спрацює (мовчки або з TypeError у strict mode);
//   - повторний виклик Object.defineProperty на цій властивості
//     кине TypeError, ЯКЩО намагається змінити щось окрім value
//     (за умови, що writable вже true) — тобто configurable:false
//     "замикає" структуру властивості майже назавжди.

const lockedProp = {};
Object.defineProperty(lockedProp, "locked", {
  value: "мене не можна видалити чи переналаштувати",
  writable: true,
  enumerable: true,
  configurable: false,
});
delete lockedProp.locked; // не спрацює
console.log(lockedProp.locked); // все ще існує

// Object.defineProperty(lockedProp, "locked", { enumerable: false });
// TypeError: Cannot redefine property: locked


// 7. ЗМІНА ІСНУЮЧОЇ ВЛАСТИВОСТІ (не тільки створення нової)
// -----------------------------------------------------
// Якщо властивість вже існує і configurable: true, повторний виклик
// Object.defineProperty() дозволяє змінити її прапорці або значення —
// при цьому НЕ вказані в новому дескрипторі поля залишаються
// такими, якими були (а не скидаються на дефолти).

const reconfigurable = { visible: "спочатку видима" };
Object.defineProperty(reconfigurable, "visible", { enumerable: false });
console.log(Object.keys(reconfigurable)); // [] — тепер прихована,
console.log(reconfigurable.visible);      // "спочатку видима" — value не чіпали


// 8. ЧИТАННЯ ДЕСКРИПТОРА НАЗАД
// -----------------------------------------------------
// Щоб побачити поточні прапорці властивості, використовують
// Object.getOwnPropertyDescriptor() (детально — в окремому розділі).

console.log(Object.getOwnPropertyDescriptor(preciseObj, "id"));
// { value: 1, writable: false, enumerable: true, configurable: false }


// 9. ТИПОВІ ЗАСТОСУВАННЯ
// -----------------------------------------------------
// - створення справжніх приватних/службових полів (enumerable: false)
// - створення обчислюваних (computed) властивостей через get/set
// - створення констант на об'єкті (writable: false, configurable: false)
// - реалізація патерну "реактивність" (Vue 2 саме так відстежував
//   зміни властивостей — через Object.defineProperty з get/set)
// - валідація значення при записі (через set):

const validatedObj = {};
let _age = 0;
Object.defineProperty(validatedObj, "age", {
  get() {
    return _age;
  },
  set(newAge) {
    if (typeof newAge !== "number" || newAge < 0) {
      throw new RangeError("Вік має бути невід'ємним числом");
    }
    _age = newAge;
  },
  enumerable: true,
  configurable: true,
});
validatedObj.age = 25;
console.log(validatedObj.age); // 25
// validatedObj.age = -5; // RangeError: Вік має бути невід'ємним числом


// 10. ПОРІВНЯННЯ З object literal / звичайним присвоєнням
// -----------------------------------------------------
// - obj.prop = value              → просто, але без контролю над
//                                    writable/enumerable/configurable
//                                    (усі стають true за замовчуванням)
// - Object.defineProperty(...)    → повний контроль, але прапорці
//                                    за замовчуванням FALSE, якщо
//                                    їх явно не вказати
// - клас з get/set у тілі         → синтаксичний цукор над accessor
//                                    descriptor'ами, декларативніший
//                                    спосіб зробити те саме


// ПІДСУМОК:
// - визначає/змінює ОДНУ властивість з повним контролем через дескриптор
// - дескриптор буває data (value/writable) АБО accessor (get/set) —
//   не можна змішувати в одному виклику
// - прапорці writable/enumerable/configurable за замовчуванням FALSE
//   (на відміну від звичайного присвоєння, де вони всі TRUE)
// - writable:false     → заборонено змінювати value
// - enumerable:false   → властивість не видно в keys/values/entries/
//   for...in/JSON.stringify/spread
// - configurable:false → заборонено видаляти й переналаштовувати
//   (окрім зміни value, якщо writable:true)
// - типове застосування: приховані службові поля, обчислювані
//   властивості, константи на об'єкті, валідація при записі


// ==========================================================================
// Object.defineProperties() — детальний розбір
// ==========================================================================

// 1. ЩО РОБИТЬ
// -----------------------------------------------------
// Object.defineProperties(obj, descriptorsMap) — те саме, що й
// Object.defineProperty(), але дозволяє визначити/змінити ОДРАЗУ
// КІЛЬКА властивостей за один виклик. Другий аргумент — це об'єкт,
// де КЛЮЧІ — імена властивостей, а ЗНАЧЕННЯ — їхні дескриптори.
// Повертає той самий obj (мутований).

const multiPropObj = {};
Object.defineProperties(multiPropObj, {
  id: {
    value: 1,
    writable: false,
    enumerable: true,
    configurable: false,
  },
  name: {
    value: "Товар",
    writable: true,
    enumerable: true,
    configurable: true,
  },
});
console.log(multiPropObj); // { id: 1, name: 'Товар' }


// 2. ФОРМА ДРУГОГО АРГУМЕНТА
// -----------------------------------------------------
// { propName1: descriptor1, propName2: descriptor2, ... }
// Кожен descriptor — звичайний дескриптор властивості (data або
// accessor), за тими самими правилами, що й в Object.defineProperty():
// прапорці writable/enumerable/configurable за замовчуванням FALSE,
// якщо не вказані явно.


// 3. МОЖНА ЗМІШУВАТИ DATA І ACCESSOR ДЕСКРИПТОРИ В ОДНОМУ ВИКЛИКУ
// -----------------------------------------------------
const mixedDescriptorsObj = {};
let _celsius = 0;

Object.defineProperties(mixedDescriptorsObj, {
  // data descriptor
  unit: {
    value: "metric",
    enumerable: true,
    writable: false,
    configurable: false,
  },
  // accessor descriptor
  celsius: {
    get() {
      return _celsius;
    },
    set(value) {
      _celsius = value;
    },
    enumerable: true,
    configurable: true,
  },
  // accessor descriptor, обчислюється на основі іншої властивості
  fahrenheit: {
    get() {
      return _celsius * 1.8 + 32;
    },
    set(value) {
      _celsius = (value - 32) / 1.8;
    },
    enumerable: true,
    configurable: true,
  },
});

mixedDescriptorsObj.celsius = 100;
console.log(mixedDescriptorsObj.fahrenheit); // 212
mixedDescriptorsObj.fahrenheit = 32;
console.log(mixedDescriptorsObj.celsius); // 0


// 4. ЗАСТОСУВАННЯ ДО ВЖЕ ІСНУЮЧИХ ВЛАСТИВОСТЕЙ
// -----------------------------------------------------
// Так само, як і defineProperty(), можна одразу переналаштувати
// кілька вже наявних властивостей — наприклад, "заморозити" частину
// полів об'єкта, зробивши їх non-writable/non-enumerable.

const configObjMulti = { host: "localhost", port: 3000, debug: true };
Object.defineProperties(configObjMulti, {
  host: { writable: false },
  port: { writable: false },
});
configObjMulti.host = "example.com"; // ігнорується (writable: false)
configObjMulti.debug = false;         // ок — debug не чіпали
console.log(configObjMulti); // { host: 'localhost', port: 3000, debug: false }


// 5. ГОЛОВНА ВІДМІННІСТЬ ВІД Object.defineProperty()
// -----------------------------------------------------
// - Object.defineProperty(obj, "one", descriptor)   → ОДНА властивість
// - Object.defineProperties(obj, { one: d1, two: d2 }) → БАГАТО властивостей
// По суті, defineProperties() — це "пакетна" (batch) версія
// defineProperty(), яка внутрішньо викликає Object.defineProperty()
// для кожного ключа переданого дескриптор-об'єкта.


// 6. ЗВ'ЯЗОК З Object.getOwnPropertyDescriptors()
// -----------------------------------------------------
// Ці два методи — пара, що працює в парі (аналогічно entries()/fromEntries()):
// getOwnPropertyDescriptors() дістає ПОВНИЙ набір дескрипторів об'єкта,
// а defineProperties() дозволяє застосувати такий набір до іншого об'єкта.
// Це дає СПРАВЖНЄ клонування об'єкта — з усіма прапорцями й
// геттерами/сеттерами (на відміну від Object.assign()/spread, які
// "спрощують" геттери до звичайних значень).

const sourceForClone = {
  get computed() {
    return 42;
  },
};
Object.defineProperty(sourceForClone, "hidden", {
  value: "прихована",
  enumerable: false,
});

const properClone = Object.defineProperties(
  {},
  Object.getOwnPropertyDescriptors(sourceForClone)
);
console.log(Object.getOwnPropertyDescriptor(properClone, "computed"));
// { get: [Function: get computed], set: undefined, enumerable: true, configurable: true }
// геттер СКОПІЙОВАНО ЯК ГЕТТЕР, а не викликано і "сплющено" у значення


// 7. НАЙЧАСТІШЕ ЗАСТОСУВАННЯ
// -----------------------------------------------------
// - масове визначення обчислюваних (get/set) властивостей
// - масове "замороження" кількох конкретних полів об'єкта
// - точне (deep-structure-aware) клонування об'єкта разом
//   з геттерами/сеттерами та прапорцями через getOwnPropertyDescriptors()
// - створення "публічного API" об'єкта з чіткими правилами доступу
//   до кожного поля за один прохід, замість кількох окремих
//   викликів defineProperty()


// ПІДСУМОК:
// - пакетна версія Object.defineProperty(): визначає/змінює
//   ОДРАЗУ кілька властивостей за один виклик
// - другий аргумент — мапа { propName: descriptor, ... }
// - ті самі правила дескрипторів (data/accessor, дефолти false)
// - можна змішувати data і accessor дескриптори в одному виклику
// - у парі з Object.getOwnPropertyDescriptors() дає точне клонування
//   об'єкта разом з геттерами/сеттерами і прапорцями


// ==========================================================================
// Object.getOwnPropertyNames() — детальний розбір
// ==========================================================================

// 1. ЩО РОБИТЬ
// -----------------------------------------------------
// Object.getOwnPropertyNames(obj) повертає МАСИВ рядків — імен УСІХ
// власних (own) властивостей об'єкта, ВКЛЮЧНО з non-enumerable,
// але БЕЗ symbol-ключів. Це головна відмінність від Object.keys().

const namesDemoObj = { visible: "видима" };
Object.defineProperty(namesDemoObj, "hidden", {
  value: "прихована",
  enumerable: false,
});

console.log(Object.keys(namesDemoObj));            // ["visible"]
console.log(Object.getOwnPropertyNames(namesDemoObj)); // ["visible", "hidden"]
// getOwnPropertyNames() бачить і non-enumerable властивість,
// а Object.keys() — ні


// 2. ЧОМУ ЦЕ ВАЖЛИВО: "ПОВНИЙ" СПИСОК ВЛАСНИХ РЯДКОВИХ КЛЮЧІВ
// -----------------------------------------------------
// Object.keys()               → лише own + enumerable
// Object.getOwnPropertyNames()→ own + enumerable І non-enumerable
//                                (але тільки рядкові ключі, без symbol)
// Reflect.ownKeys()           → own + enumerable + non-enumerable
//                                + symbol-ключі (найповніший варіант)


// 3. ПОРЯДОК КЛЮЧІВ — ТІ САМІ ПРАВИЛА, ЩО Й У Object.keys()
// -----------------------------------------------------
// Спочатку integer-like ключі за зростанням, потім рядкові —
// у порядку додавання (insertion order).

const orderedNamesObj = { b: 1, 2: "два", a: 2, 1: "один" };
console.log(Object.getOwnPropertyNames(orderedNamesObj));
// ["1", "2", "b", "a"]


// 4. МАСИВИ: ПОБАЧИТИ СЛУЖБОВУ ВЛАСТИВІСТЬ "length"
// -----------------------------------------------------
// У масивів властивість length технічно існує, але вона
// non-enumerable — тому Object.keys() її не показує, а
// getOwnPropertyNames() — показує.

const arrForNames = ["x", "y", "z"];
console.log(Object.keys(arrForNames));             // ["0", "1", "2"]
console.log(Object.getOwnPropertyNames(arrForNames)); // ["0", "1", "2", "length"]


// 5. НАЙЧАСТІШЕ ЗАСТОСУВАННЯ — ІНТРОСПЕКЦІЯ (ОБХІД БЕЗ ФІЛЬТРАЦІЇ)
// -----------------------------------------------------
// Використовують, коли треба побачити СПРАВЖНЮ повну "анатомію"
// об'єкта — наприклад, для дебагу, для написання утиліт
// серіалізації/клонування, або для перевірки, чи є на об'єкті
// службові/приховані поля.

function inspectObject(obj) {
  Object.getOwnPropertyNames(obj).forEach((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);
    console.log(key, "→", descriptor);
  });
}
inspectObject(namesDemoObj);
// visible → { value: 'видима', writable: true, enumerable: true, configurable: true }
// hidden  → { value: 'прихована', writable: false, enumerable: false, configurable: false }


// 6. КЛАСИ Й МЕТОДИ ПРОТОТИПУ — ЧОМУ ВОНИ NON-ENUMERABLE
// -----------------------------------------------------
// Методи, оголошені в тілі class, за специфікацією є
// non-enumerable — саме тому їх не видно через Object.keys(instance)
// чи for...in, але видно через getOwnPropertyNames() на прототипі.

class ExampleClass {
  method() {}
}
console.log(Object.keys(ExampleClass.prototype));               // []
console.log(Object.getOwnPropertyNames(ExampleClass.prototype));
// ["constructor", "method"]


// 7. НЕ ВКЛЮЧАЄ УСПАДКОВАНІ ВЛАСТИВОСТІ (як і keys/values/entries)
// -----------------------------------------------------
const protoForNames = { fromProto: "з прототипу" };
const ownForNames = Object.create(protoForNames);
ownForNames.own = "власна";
console.log(Object.getOwnPropertyNames(ownForNames)); // ["own"]


// 8. "МЕЖОВІ" ЗНАЧЕННЯ
// -----------------------------------------------------
console.log(Object.getOwnPropertyNames({})); // []
console.log(Object.getOwnPropertyNames("ab")); // ["0", "1", "length"]
// Object.getOwnPropertyNames(null); // TypeError: Cannot convert undefined or null to object


// 9. ПОРІВНЯННЯ ЗІ SYMBOL-ВЕРСІЄЮ
// -----------------------------------------------------
// Якщо потрібні лише symbol-ключі об'єкта — існує "симетричний"
// метод Object.getOwnPropertySymbols() (розбираємо окремо далі).
// А якщо потрібні ОБИДВА типи ключів одразу (рядкові + symbol,
// enumerable + non-enumerable) — використовують Reflect.ownKeys().

const symKeyForNames = Symbol("meta");
const objWithBoth = { regular: 1, [symKeyForNames]: 2 };
console.log(Object.getOwnPropertyNames(objWithBoth)); // ["regular"] — symbol пропущено
console.log(Reflect.ownKeys(objWithBoth)); // ["regular", Symbol(meta)] — усе разом


// ПІДСУМОК:
// - повертає масив ВСІХ власних рядкових ключів — enumerable І non-enumerable
// - НЕ включає symbol-ключі (для них — Object.getOwnPropertySymbols())
// - НЕ включає успадковані з прототипу властивості
// - порядок ключів: integer-like за зростанням → рядкові за insertion order
// - показує "службові" non-enumerable властивості (length масиву,
//   методи класу на прототипі тощо) — на відміну від Object.keys()
// - найповніший варіант обходу власних ключів обох типів — Reflect.ownKeys()
// - типове застосування: інтроспекція/дебаг, повний обхід структури об'єкта


// ==========================================================================
// Object.getOwnPropertySymbols() — детальний розбір
// ==========================================================================

// 1. ЩО РОБИТЬ
// -----------------------------------------------------
// Object.getOwnPropertySymbols(obj) повертає МАСИВ усіх власних (own)
// symbol-ключів об'єкта. Це "дзеркальна" версія
// Object.getOwnPropertyNames() — але для symbol-ключів замість рядкових.
// Включає symbol-ключі НЕЗАЛЕЖНО від того, enumerable вони чи ні.

const idSymbol = Symbol("id");
const metaSymbol = Symbol("meta");

const objWithSymbols = {
  regular: "звичайна властивість",
  [idSymbol]: "значення id",
};
Object.defineProperty(objWithSymbols, metaSymbol, {
  value: "значення meta",
  enumerable: false,
});

console.log(Object.getOwnPropertySymbols(objWithSymbols));
// [Symbol(id), Symbol(meta)] — обидва symbol-ключі, enumerable і ні


// 2. НАВІЩО ВЗАГАЛІ ПОТРІБНІ SYMBOL-КЛЮЧІ
// -----------------------------------------------------
// Symbol — примітивний тип, кожне значення якого УНІКАЛЬНЕ (навіть
// Symbol("id") !== Symbol("id")). Symbol-ключі використовують, щоб:
//   - додати на об'єкт "приховану" властивість, яка НІКОЛИ не
//     перетнеться з рядковим ключем (навіть випадково);
//   - реалізувати "напівприватні" внутрішні поля бібліотек;
//   - визначити спеціальну поведінку об'єкта через well-known
//     symbols (Symbol.iterator, Symbol.toPrimitive і т.д.)


// 3. ЧОМУ ЗВИЧАЙНІ МЕТОДИ ЇХ НЕ БАЧАТЬ
// -----------------------------------------------------
// Symbol-ключі СВІДОМО виключені зі "звичайних" способів обходу
// об'єкта — саме тому вони й підходять для приховування:

console.log(Object.keys(objWithSymbols));              // ["regular"]
console.log(Object.values(objWithSymbols));             // ["звичайна властивість"]
console.log(Object.entries(objWithSymbols));            // [["regular", "звичайна властивість"]]
console.log(Object.getOwnPropertyNames(objWithSymbols)); // ["regular"]
console.log(JSON.stringify(objWithSymbols));            // {"regular":"звичайна властивість"}
for (const key in objWithSymbols) {
  console.log("for...in:", key); // лише "regular"
}
console.log({ ...objWithSymbols }); // spread копіює symbol-ключі! (див. пункт 5)


// 4. АЛЕ SYMBOL-КЛЮЧІ — НЕ ПРИВАТНІ (це важливо!)
// -----------------------------------------------------
// Symbol-ключ НЕ дає справжньої приватності — якщо в когось є
// посилання на сам symbol, він вільно читає і пише властивість.
// Крім того, Object.getOwnPropertySymbols() дозволяє "знайти" всі
// symbol-ключі об'єкта, навіть не маючи посилання на сам символ.

console.log(objWithSymbols[idSymbol]); // "значення id" — прочитати можна легко

// Справжня приватність у класах — це #privateField (hash-поля),
// вони недоступні навіть через getOwnPropertySymbols().


// 5. SYMBOL-КЛЮЧІ ТА Object.assign() / SPREAD
// -----------------------------------------------------
// На відміну від Object.keys()/values()/entries(), spread {...obj}
// і Object.assign() ПЕРЕНОСЯТЬ enumerable symbol-ключі (адже вони
// орієнтуються на "own + enumerable", а не на тип ключа).

console.log(Object.getOwnPropertySymbols({ ...objWithSymbols }));
// [Symbol(id)] — idSymbol скопійовано (enumerable: true за замовчуванням),
// а metaSymbol — НІ, бо його явно зробили enumerable: false


// 6. WELL-KNOWN SYMBOLS — ВБУДОВАНІ SYMBOL-КЛЮЧІ ДВИГУНА
// -----------------------------------------------------
// JS сам використовує спеціальні symbol-ключі для налаштування
// поведінки об'єктів "під капотом" (наприклад, Symbol.iterator
// визначає, як об'єкт поводиться в for...of / spread).
// getOwnPropertySymbols() покаже і ЇХ, якщо вони визначені
// БЕЗПОСЕРЕДНЬО на об'єкті (а не успадковані з прототипу).

const iterableObj = {
  items: [1, 2, 3],
  [Symbol.iterator]() {
    let index = 0;
    const items = this.items;
    return {
      next() {
        return index < items.length
          ? { value: items[index++], done: false }
          : { value: undefined, done: true };
      },
    };
  },
};
console.log([...iterableObj]); // [1, 2, 3] — власний Symbol.iterator спрацював
console.log(Object.getOwnPropertySymbols(iterableObj)); // [Symbol(Symbol.iterator)]


// 7. НЕ ВКЛЮЧАЄ УСПАДКОВАНІ SYMBOL-КЛЮЧІ (тільки власні)
// -----------------------------------------------------
const protoWithSymbol = { [Symbol("fromProto")]: "з прототипу" };
const childOwnSymbols = Object.create(protoWithSymbol);
childOwnSymbols[Symbol("own")] = "власний";
console.log(Object.getOwnPropertySymbols(childOwnSymbols).length); // 1 — лише свій


// 8. "МЕЖОВІ" ЗНАЧЕННЯ
// -----------------------------------------------------
console.log(Object.getOwnPropertySymbols({})); // []
// Object.getOwnPropertySymbols(null); // TypeError: Cannot convert undefined or null to object


// 9. ПОВНИЙ ОБХІД: SYMBOLS + NAMES РАЗОМ
// -----------------------------------------------------
// Якщо потрібні і рядкові, і symbol-ключі об'єкта одночасно —
// або комбінують ці два методи, або одразу беруть Reflect.ownKeys().

function getAllKeys(obj) {
  return [
    ...Object.getOwnPropertyNames(obj),
    ...Object.getOwnPropertySymbols(obj),
  ];
}
console.log(getAllKeys(objWithSymbols)); // ["regular", Symbol(id), Symbol(meta)]
console.log(Reflect.ownKeys(objWithSymbols)); // те саме, одним викликом


// ПІДСУМОК:
// - повертає масив усіх ВЛАСНИХ symbol-ключів об'єкта
// - включає їх незалежно від enumerable (на відміну від keys/values/entries)
// - symbol-ключі "невидимі" для keys/values/entries/for...in/JSON.stringify/
//   getOwnPropertyNames — саме тому їх використовують для "прихованих" полів
// - НЕ дають справжньої приватності — символ можна знайти цим методом
//   і прочитати значення, знаючи посилання на сам symbol
// - spread {...obj} і Object.assign() копіюють enumerable symbol-ключі
// - показує і well-known symbols (Symbol.iterator тощо), якщо вони
//   визначені прямо на об'єкті
// - НЕ включає успадковані symbol-ключі з прототипу
// - для повного списку всіх ключів (рядкові + symbol) — Reflect.ownKeys()


// ==========================================================================
// Object.getOwnPropertyDescriptor() — детальний розбір
// ==========================================================================

// 1. ЩО РОБИТЬ
// -----------------------------------------------------
// Object.getOwnPropertyDescriptor(obj, propName) повертає ОБ'ЄКТ-
// дескриптор ОДНІЄЇ конкретної власної (own) властивості — тобто
// показує, ЯК саме ця властивість налаштована "під капотом".
// Це логічна протилежність до Object.defineProperty(): один метод
// ЗАПИСУЄ дескриптор, інший — ЧИТАЄ його назад.

const descriptorDemoObj = { name: "John" };
console.log(Object.getOwnPropertyDescriptor(descriptorDemoObj, "name"));
// { value: 'John', writable: true, enumerable: true, configurable: true }
// саме такі прапорці отримує властивість при звичайному присвоєнні obj.prop = value


// 2. DATA DESCRIPTOR ПРИ ЧИТАННІ
// -----------------------------------------------------
// Для "звичайної" властивості (не геттера/сеттера) повертається
// data descriptor з полями: value, writable, enumerable, configurable.

const preciseDescObj = {};
Object.defineProperty(preciseDescObj, "version", {
  value: "1.0.0",
  writable: false,
  enumerable: true,
  configurable: false,
});
console.log(Object.getOwnPropertyDescriptor(preciseDescObj, "version"));
// { value: '1.0.0', writable: false, enumerable: true, configurable: false }


// 3. ACCESSOR DESCRIPTOR ПРИ ЧИТАННІ
// -----------------------------------------------------
// Для властивості-геттера/сеттера повертається accessor descriptor —
// з полями get, set (замість value, writable). ВАЖЛИВО: get/set тут —
// самі ФУНКЦІЇ (посилання), метод НЕ викликає геттер, щоб дізнатись значення.

const accessorDescObj = {
  get computed() {
    return 42;
  },
};
console.log(Object.getOwnPropertyDescriptor(accessorDescObj, "computed"));
// { get: [Function: get computed], set: undefined, enumerable: true, configurable: true }
// зверни увагу: НІЯКОГО value тут немає — це вже інший тип дескриптора


// 4. ЯК ВІДРІЗНИТИ DATA ВІД ACCESSOR ДЕСКРИПТОРА ПРОГРАМНО
// -----------------------------------------------------
function isAccessorProperty(obj, propName) {
  const descriptor = Object.getOwnPropertyDescriptor(obj, propName);
  return descriptor !== undefined && ("get" in descriptor || "set" in descriptor);
}
console.log(isAccessorProperty(accessorDescObj, "computed")); // true
console.log(isAccessorProperty(descriptorDemoObj, "name"));   // false


// 5. ПОВЕРТАЄ undefined, ЯКЩО ВЛАСТИВОСТІ НЕМАЄ (own)
// -----------------------------------------------------
// Метод НЕ кидає помилку для відсутньої властивості — просто
// повертає undefined. Це стосується і властивостей з прототипу —
// метод дивиться ЛИШЕ на власні (own) властивості.

console.log(Object.getOwnPropertyDescriptor(descriptorDemoObj, "nonExistent")); // undefined

const protoForDescriptor = { fromProto: "з прототипу" };
const ownForDescriptor = Object.create(protoForDescriptor);
console.log(Object.getOwnPropertyDescriptor(ownForDescriptor, "fromProto")); // undefined
// хоча ownForDescriptor.fromProto доступне через прототип,
// дескриптор саме ВЛАСНОЇ властивості з такою назвою відсутній


// 6. ЧОМУ ЦЕ НАДІЙНІШЕ, НІЖ ПРОСТО ЧИТАТИ ЗНАЧЕННЯ obj[prop]
// -----------------------------------------------------
// Просте звернення obj.prop не покаже:
//   - чи це геттер, і чи має він побічні ефекти при виклику;
//   - чи властивість взагалі writable/enumerable/configurable;
//   - чи властивість "своя", чи прийшла з прототипу.
// getOwnPropertyDescriptor() дає повну, ТОЧНУ інформацію без
// побічних ефектів (геттер НЕ викликається під час перевірки).

const loggingGetterObj = {
  get value() {
    console.log("геттер викликано!"); // побічний ефект
    return Math.random();
  },
};
loggingGetterObj.value; // "геттер викликано!" — value прочитано, геттер спрацював
Object.getOwnPropertyDescriptor(loggingGetterObj, "value"); // тихо, без побічних ефектів


// 7. НАЙЧАСТІШЕ ЗАСТОСУВАННЯ
// -----------------------------------------------------
// - перевірка, чи можна безпечно перезаписати/видалити властивість,
//   перед тим, як це робити:
function canOverwrite(obj, propName) {
  const descriptor = Object.getOwnPropertyDescriptor(obj, propName);
  return descriptor === undefined || (descriptor.writable && descriptor.configurable);
}
console.log(canOverwrite(preciseDescObj, "version")); // false — заморожена

// - написання власних утиліт клонування/серіалізації, які повинні
//   зберегти геттери/сеттери, а не "сплющити" їх у значення
//   (саме так побудований Object.getOwnPropertyDescriptors(), який
//   розбираємо наступним)

// - дебаг/інтроспекція: подивитись, ЯК саме влаштована конкретна
//   властивість стороннього об'єкта чи бібліотеки


// 8. "МЕЖОВІ" ЗНАЧЕННЯ
// -----------------------------------------------------
console.log(Object.getOwnPropertyDescriptor({}, "anything")); // undefined
// Object.getOwnPropertyDescriptor(null, "x"); // TypeError: Cannot convert undefined or null to object


// 9. РОБОТА З SYMBOL-КЛЮЧАМИ
// -----------------------------------------------------
// propName може бути не лише рядком, а й символом — метод однаково
// працює і для symbol-властивостей.

const symKeyForDescriptor = Symbol("secret");
const objWithSymbolProp = { [symKeyForDescriptor]: "таємне значення" };
console.log(Object.getOwnPropertyDescriptor(objWithSymbolProp, symKeyForDescriptor));
// { value: 'таємне значення', writable: true, enumerable: true, configurable: true }


// 10. ПОРІВНЯННЯ З ІНШИМИ getOwnProperty*-МЕТОДАМИ
// -----------------------------------------------------
// - getOwnPropertyNames(obj)              → усі власні рядкові КЛЮЧІ
// - getOwnPropertySymbols(obj)            → усі власні symbol-КЛЮЧІ
// - getOwnPropertyDescriptor(obj, key)    → ДЕСКРИПТОР однієї конкретної властивості
// - getOwnPropertyDescriptors(obj)        → ДЕСКРИПТОРИ УСІХ власних властивостей одразу
//   (розбираємо в наступному розділі)


// ПІДСУМОК:
// - повертає повний дескриптор ОДНІЄЇ власної властивості (або undefined)
// - для звичайної властивості: { value, writable, enumerable, configurable }
// - для геттера/сеттера: { get, set, enumerable, configurable } — БЕЗ виклику геттера
// - дивиться ЛИШЕ на власні (own) властивості — з прототипу нічого не бере
// - не має побічних ефектів (на відміну від obj.prop, який викликає геттер)
// - працює і з рядковими, і з symbol-ключами
// - типове застосування: перевірка writable/configurable перед зміною,
//   написання утиліт клонування/серіалізації, дебаг


// ==========================================================================
// Object.getOwnPropertyDescriptors() — детальний розбір
// ==========================================================================

// 1. ЩО РОБИТЬ
// -----------------------------------------------------
// Object.getOwnPropertyDescriptors(obj) повертає ОБ'ЄКТ, де КОЖЕН
// ключ — це ім'я власної (own) властивості вихідного об'єкта,
// а ЗНАЧЕННЯ — повний дескриптор цієї властивості. По суті — це
// "множина" з Object.getOwnPropertyDescriptor(), викликаного одразу
// для КОЖНОЇ власної властивості об'єкта (включно з symbol-ключами
// та non-enumerable властивостями).

const multiDescObj = { name: "John" };
Object.defineProperty(multiDescObj, "id", {
  value: 1,
  writable: false,
  enumerable: false,
  configurable: false,
});

console.log(Object.getOwnPropertyDescriptors(multiDescObj));
// {
//   name: { value: 'John', writable: true, enumerable: true, configurable: true },
//   id:   { value: 1, writable: false, enumerable: false, configurable: false }
// }


// 2. ГОЛОВНЕ ЗАСТОСУВАННЯ: ТОЧНЕ (SHALLOW) КЛОНУВАННЯ ОБ'ЄКТА
// -----------------------------------------------------
// На відміну від Object.assign({}, obj) чи spread {...obj}, які
// "сплющують" геттери/сеттери у звичайні значення (викликаючи їх
// один раз і копіюючи РЕЗУЛЬТАТ), пара
// Object.create() + Object.getOwnPropertyDescriptors() зберігає
// геттери/сеттери ЯК ГЕТТЕРИ/СЕТТЕРИ, а також усі прапорці
// (writable/enumerable/configurable) один-в-один.

const sourceWithGetterSetter = {
  _value: 10,
  get doubled() {
    console.log("геттер doubled викликано");
    return this._value * 2;
  },
  set doubled(v) {
    this._value = v / 2;
  },
};

// "наївне" клонування — ГЕТТЕР ВТРАЧАЄТЬСЯ:
const naiveClone = { ...sourceWithGetterSetter };
console.log(Object.getOwnPropertyDescriptor(naiveClone, "doubled"));
// { value: 20, writable: true, enumerable: true, configurable: true } — уже НЕ геттер!

// точне клонування — ГЕТТЕР/СЕТТЕР ЗБЕРЕЖЕНО:
const preciseClone = Object.defineProperties(
  {},
  Object.getOwnPropertyDescriptors(sourceWithGetterSetter)
);
console.log(Object.getOwnPropertyDescriptor(preciseClone, "doubled"));
// { get: [Function: get doubled], set: [Function: set doubled], enumerable: true, configurable: true }
preciseClone._value = 5;
console.log(preciseClone.doubled); // "геттер doubled викликано" → 10 (реально перерахувалось)


// 3. РЕКОМЕНДОВАНИЙ ПАТЕРН З Object.create()
// -----------------------------------------------------
// MDN прямо рекомендує саме цю комбінацію як "правильний" спосіб
// поверхневого копіювання об'єкта (на відміну від Object.assign()):

function shallowClone(obj) {
  return Object.create(
    Object.getPrototypeOf(obj),               // зберігає той самий прототип
    Object.getOwnPropertyDescriptors(obj)      // зберігає усі властивості з прапорцями
  );
}
const properShallowClone = shallowClone(sourceWithGetterSetter);
console.log(Object.getPrototypeOf(properShallowClone) === Object.getPrototypeOf(sourceWithGetterSetter)); // true


// 4. ЩО ТУТ ВАЖЛИВО: ЦЕ ВСЕ ЩЕ SHALLOW (ПОВЕРХНЕВЕ) КОПІЮВАННЯ
// -----------------------------------------------------
// Значення властивостей першого рівня копіюються "як є" — якщо
// value є об'єктом/масивом, у клоні буде те саме ПОСИЛАННЯ,
// а не глибока копія (аналогічно Object.assign()/spread).

const nestedForDescriptors = { info: { age: 30 } };
const shallowClonedNested = Object.create(
  Object.getPrototypeOf(nestedForDescriptors),
  Object.getOwnPropertyDescriptors(nestedForDescriptors)
);
shallowClonedNested.info.age = 99;
console.log(nestedForDescriptors.info.age); // 99 — теж змінилось (спільне посилання)


// 5. ЗВ'ЯЗОК З Object.defineProperties()
// -----------------------------------------------------
// Ці два методи спеціально спроєктовані як пара для запису/читання:
// getOwnPropertyDescriptors() ЧИТАЄ повний "знімок" (snapshot)
// усіх властивостей, а defineProperties() ЗАПИСУЄ такий знімок
// в інший об'єкт — саме так і працює патерн клонування вище.


// 6. МІКСИНИ (MIXINS) БЕЗ "СПЛЮЩЕННЯ" ГЕТТЕРІВ
// -----------------------------------------------------
// Ще одне типове застосування — коректне додавання методів/геттерів
// одного об'єкта до іншого (наприклад, реалізація патерну mixin),
// коли важливо не втратити get/set поведінку.

const canFlyMixin = {
  fly() {
    return `${this.name} летить`;
  },
};
const canSwimMixin = {
  swim() {
    return `${this.name} пливе`;
  },
};

class Duck {
  constructor(name) {
    this.name = name;
  }
}
Object.defineProperties(Duck.prototype, {
  ...Object.getOwnPropertyDescriptors(canFlyMixin),
  ...Object.getOwnPropertyDescriptors(canSwimMixin),
});

const duck = new Duck("Кряк");
console.log(duck.fly());  // "Кряк летить"
console.log(duck.swim()); // "Кряк пливе"


// 7. ВКЛЮЧАЄ NON-ENUMERABLE ТА SYMBOL-КЛЮЧІ
// -----------------------------------------------------
// На відміну від Object.assign()/spread (які беруть лише
// enumerable), getOwnPropertyDescriptors() охоплює ВСІ власні
// властивості — рядкові й symbol, enumerable і ні — тобто це
// найповніший "знімок" структури об'єкта.

const symKeyForDescriptors = Symbol("meta");
const objForFullSnapshot = { visible: 1, [symKeyForDescriptors]: 2 };
Object.defineProperty(objForFullSnapshot, "hidden", {
  value: 3,
  enumerable: false,
});
console.log(Object.keys(Object.getOwnPropertyDescriptors(objForFullSnapshot)));
// ["visible", "hidden"] — рядкові ключі власного знімка...
console.log(Object.getOwnPropertySymbols(Object.getOwnPropertyDescriptors(objForFullSnapshot)));
// [Symbol(meta)] — ...і symbol-ключ теж присутній у знімку


// 8. "МЕЖОВІ" ЗНАЧЕННЯ
// -----------------------------------------------------
console.log(Object.getOwnPropertyDescriptors({})); // {}
// Object.getOwnPropertyDescriptors(null); // TypeError: Cannot convert undefined or null to object


// ПІДСУМОК:
// - повертає об'єкт { propName: descriptor } для УСІХ власних
//   властивостей (рядкових і symbol, enumerable і non-enumerable)
// - у парі з Object.defineProperties()/Object.create() дає
//   ТОЧНЕ (не "сплющене") поверхневе клонування об'єкта — з
//   геттерами/сеттерами і всіма прапорцями як є
// - на відміну від Object.assign()/spread, НЕ викликає геттери
//   й НЕ втрачає accessor-природу властивостей при клонуванні
// - все ще shallow copy — вкладені об'єкти копіюються за посиланням
// - зручний для коректної реалізації mixin-патерну
// - типове застосування: точне клонування об'єктів, mixins,
//   збереження/перенесення повної "структури" властивостей


// ==========================================================================
// Object.hasOwn() — детальний розбір
// ==========================================================================

// 1. ЩО РОБИТЬ
// -----------------------------------------------------
// Object.hasOwn(obj, propName) повертає true/false — чи має obj
// ВЛАСНУ (own) властивість з таким ім'ям (рядковим або symbol),
// НЕЗАЛЕЖНО від того, enumerable вона чи ні. Це СУЧАСНА (ES2022)
// заміна для obj.hasOwnProperty(propName).

const hasOwnDemoObj = { name: "John" };
console.log(Object.hasOwn(hasOwnDemoObj, "name"));   // true
console.log(Object.hasOwn(hasOwnDemoObj, "toString")); // false — toString з прототипу


// 2. ЧОМУ ЦЕ ЗАМІНА ДЛЯ obj.hasOwnProperty()
// -----------------------------------------------------
// Раніше для цієї перевірки використовували метод екземпляра:
console.log(hasOwnDemoObj.hasOwnProperty("name")); // true — той самий результат

// Проблема методу-екземпляра: він успадковується через прототип,
// і якщо ЦЕЙ конкретний об'єкт (чи щось у його ланцюжку прототипів)
// перевизначив hasOwnProperty — виклик зламається.
const brokenHasOwnProperty = { hasOwnProperty: "я не функція!" };
// brokenHasOwnProperty.hasOwnProperty("x"); // TypeError: hasOwnProperty is not a function
console.log(Object.hasOwn(brokenHasOwnProperty, "hasOwnProperty")); // true — а так все ок


// 3. НАЙБІЛЬШ КЛАСИЧНА ПРОБЛЕМА: Object.create(null)
// -----------------------------------------------------
// Об'єкти без прототипу (створені через Object.create(null)) взагалі
// НЕ МАЮТЬ методу hasOwnProperty — виклик obj.hasOwnProperty() кине
// TypeError. Object.hasOwn() — це СТАТИЧНИЙ метод, тому він працює
// для БУДЬ-ЯКОГО об'єкта, незалежно від його прототипу.

const dictObj = Object.create(null);
dictObj.key = "value";
// dictObj.hasOwnProperty("key"); // TypeError: dictObj.hasOwnProperty is not a function
console.log(Object.hasOwn(dictObj, "key")); // true — працює завжди


// 4. РАНІШЕ ЦЮ ПРОБЛЕМУ ОБХОДИЛИ ЧЕРЕЗ .call()
// -----------------------------------------------------
// До появи Object.hasOwn() (ES2022) "безпечним" способом вважали
// виклик hasOwnProperty напряму з Object.prototype через .call():

console.log(Object.prototype.hasOwnProperty.call(dictObj, "key")); // true
// Object.hasOwn(dictObj, "key") робить те саме, але коротше й читабельніше


// 5. РІЗНИЦЯ МІЖ "МАЄ ВЛАСНУ ВЛАСТИВІСТЬ" І "ЗНАЧЕННЯ НЕ undefined"
// -----------------------------------------------------
// Object.hasOwn() перевіряє САМ ФАКТ ІСНУВАННЯ властивості,
// а не те, чи її значення "порожнє". Це критична відмінність
// від перевірки типу `if (obj.prop)` чи `if (obj.prop !== undefined)`.

const objWithFalsyValues = {
  zero: 0,
  emptyString: "",
  explicitUndefined: undefined,
  isFalse: false,
};

console.log(Object.hasOwn(objWithFalsyValues, "zero"));             // true — властивість існує
console.log(objWithFalsyValues.zero ? "є" : "немає");                // "немає" — 0 хибне (falsy)!

console.log(Object.hasOwn(objWithFalsyValues, "explicitUndefined")); // true — властивість ІСНУЄ
console.log(objWithFalsyValues.explicitUndefined !== undefined);     // false — а значення дійсно undefined

console.log(Object.hasOwn(objWithFalsyValues, "neverDeclared"));     // false — а цієї властивості взагалі немає
console.log(objWithFalsyValues.neverDeclared !== undefined);         // false — той самий результат, що й вище!
// ^ саме тому перевірка "!== undefined" НЕНАДІЙНА — вона не розрізняє
// "властивості немає" від "властивість є, але дорівнює undefined"


// 6. ВІДРІЗНЯЄ "ВЛАСНУ" ВІД "УСПАДКОВАНОЇ" — на відміну від `in`
// -----------------------------------------------------
// Оператор `in` перевіряє наявність властивості В УСЬОМУ ланцюжку
// прототипів (включно з успадкованими), а Object.hasOwn() —
// ТІЛЬКИ власні (own) властивості самого об'єкта.

const protoForHasOwn = { fromProto: "з прототипу" };
const ownForHasOwn = Object.create(protoForHasOwn);
ownForHasOwn.own = "власна";

console.log("fromProto" in ownForHasOwn);          // true — `in` бачить прототип
console.log(Object.hasOwn(ownForHasOwn, "fromProto")); // false — а hasOwn — ні
console.log(Object.hasOwn(ownForHasOwn, "own"));       // true


// 7. ПЕРЕВІРЯЄ NON-ENUMERABLE ТА SYMBOL-КЛЮЧІ ТЕЖ
// -----------------------------------------------------
// Так само, як і hasOwnProperty(), Object.hasOwn() бачить
// non-enumerable властивості (на відміну від Object.keys()
// чи for...in) і працює з symbol-ключами.

const hiddenPropObj = {};
Object.defineProperty(hiddenPropObj, "secret", {
  value: 42,
  enumerable: false,
});
console.log(Object.hasOwn(hiddenPropObj, "secret")); // true — навіть прихована

const symKeyForHasOwn = Symbol("id");
const objWithSymbolForHasOwn = { [symKeyForHasOwn]: 1 };
console.log(Object.hasOwn(objWithSymbolForHasOwn, symKeyForHasOwn)); // true


// 8. НАЙЧАСТІШЕ ЗАСТОСУВАННЯ
// -----------------------------------------------------
// - безпечна перевірка наявності ключа перед зверненням до нього
//   (особливо для об'єктів невідомого/динамічного походження, як
//   JSON-відповіді з API):
function getStatusMessage(response) {
  if (Object.hasOwn(response, "error")) {
    return `Помилка: ${response.error}`;
  }
  return "OK";
}
console.log(getStatusMessage({ error: "Не знайдено" })); // "Помилка: Не знайдено"
console.log(getStatusMessage({ data: [] }));               // "OK"

// - фільтрація ключів у циклі for...in (щоб не зачепити успадковані):
for (const key in ownForHasOwn) {
  if (Object.hasOwn(ownForHasOwn, key)) {
    console.log("власна властивість for...in:", key); // лише "own"
  }
}


// 9. "МЕЖОВІ" ЗНАЧЕННЯ
// -----------------------------------------------------
console.log(Object.hasOwn({}, "anything")); // false
// Object.hasOwn(null, "x"); // TypeError: Cannot convert undefined or null to object


// 10. ПОРІВНЯННЯ СПОСОБІВ ПЕРЕВІРКИ НАЯВНОСТІ ВЛАСТИВОСТІ
// -----------------------------------------------------
// - Object.hasOwn(obj, key)        → ВЛАСНА властивість, будь-який об'єкт (РЕКОМЕНДОВАНО)
// - obj.hasOwnProperty(key)        → ВЛАСНА властивість, але ламається на
//                                     Object.create(null) чи перевизначеному hasOwnProperty
// - key in obj                     → ВЛАСНА + УСПАДКОВАНА властивість
// - obj[key] !== undefined         → НЕНАДІЙНО: плутає "немає властивості"
//                                     з "властивість дорівнює undefined"


// ПІДСУМОК:
// - Object.hasOwn(obj, key) — сучасний (ES2022), безпечний спосіб
//   перевірити, чи obj має ВЛАСНУ властивість key
// - працює для БУДЬ-ЯКОГО об'єкта, включно з Object.create(null)
//   (на відміну від obj.hasOwnProperty(), який там впаде з TypeError)
// - перевіряє факт ІСНУВАННЯ властивості, а не "правдивість" значення —
//   надійніше, ніж obj.prop чи obj.prop !== undefined
// - НЕ бачить успадковані властивості (на відміну від оператора in)
// - бачить non-enumerable властивості й symbol-ключі
// - рекомендований сучасний стандарт замість obj.hasOwnProperty()


// ==========================================================================
// Object.getPrototypeOf() — детальний розбір
// ==========================================================================

// 1. ЩО РОБИТЬ
// -----------------------------------------------------
// Object.getPrototypeOf(obj) повертає ПРОТОТИП переданого об'єкта —
// тобто той об'єкт, з якого obj успадковує властивості й методи
// через ланцюжок прототипів ([[Prototype]] / __proto__).

const plainProtoObj = {};
console.log(Object.getPrototypeOf(plainProtoObj) === Object.prototype); // true
// звичайний object literal завжди успадковує від Object.prototype


// 2. ЩО ТАКЕ "ПРОТОТИП" НАСПРАВДІ
// -----------------------------------------------------
// Кожен об'єкт у JS має внутрішній слот [[Prototype]] — посилання
// на ІНШИЙ об'єкт (або null). Коли рушій шукає властивість, якої
// немає у самого об'єкта, він іде по ланцюжку [[Prototype]] —
// саме так, наприклад, obj.toString() працює навіть якщо ти сам
// ніколи не визначав toString на obj.

console.log(plainProtoObj.toString); // [Function: toString] — знайдено через прототип
console.log(Object.hasOwn(plainProtoObj, "toString")); // false — це НЕ власна властивість


// 3. ЗВ'ЯЗОК З КОНКРЕТНИМИ СПОСОБАМИ СТВОРЕННЯ ОБ'ЄКТА
// -----------------------------------------------------

// а) object literal / new Object() → прототип: Object.prototype
console.log(Object.getPrototypeOf({}) === Object.prototype); // true

// б) масив → прототип: Array.prototype (а вже ЙОГО прототип — Object.prototype)
console.log(Object.getPrototypeOf([]) === Array.prototype); // true
console.log(Object.getPrototypeOf(Array.prototype) === Object.prototype); // true

// в) Object.create(proto) → прототип: САМЕ ТОЙ proto, що передали
const customProto = { greet() { return "Привіт!"; } };
const createdWithCustomProto = Object.create(customProto);
console.log(Object.getPrototypeOf(createdWithCustomProto) === customProto); // true

// г) Object.create(null) → прототип: null (об'єкт БЕЗ ланцюжка прототипів)
const noProtoObj = Object.create(null);
console.log(Object.getPrototypeOf(noProtoObj)); // null

// д) function-конструктор / class → прототип: ФункціяКонструктор.prototype
function Animal(name) {
  this.name = name;
}
const dog = new Animal("Рекс");
console.log(Object.getPrototypeOf(dog) === Animal.prototype); // true

class Cat {}
const cat = new Cat();
console.log(Object.getPrototypeOf(cat) === Cat.prototype); // true


// 4. ЛАНЦЮЖОК ПРОТОТИПІВ (PROTOTYPE CHAIN)
// -----------------------------------------------------
// Прототип сам по собі теж є об'єктом і теж має СВІЙ прототип —
// так утворюється ланцюжок, що завершується на null.

console.log(Object.getPrototypeOf(dog));                       // Animal.prototype
console.log(Object.getPrototypeOf(Animal.prototype));           // Object.prototype
console.log(Object.getPrototypeOf(Object.prototype));           // null — кінець ланцюжка

// Функція, що проходить весь ланцюжок і виводить його:
function printPrototypeChain(obj) {
  let current = obj;
  let level = 0;
  while (current !== null) {
    console.log("рівень", level, "→", current.constructor?.name ?? current);
    current = Object.getPrototypeOf(current);
    level++;
  }
}
printPrototypeChain(dog);
// рівень 0 → Animal
// рівень 1 → Object
// (далі Object.getPrototypeOf(Object.prototype) === null → цикл завершується)


// 5. КЛАСИ Й НАСЛІДУВАННЯ (extends)
// -----------------------------------------------------
// При extends прототип дочірнього класу вказує на прототип
// батьківського — саме так дочірні екземпляри отримують доступ
// до батьківських методів.

class Bird extends Animal {
  fly() {
    return `${this.name} летить`;
  }
}
const parrot = new Bird("Папуга");
console.log(Object.getPrototypeOf(Bird.prototype) === Animal.prototype); // true
console.log(parrot instanceof Animal); // true — саме завдяки ланцюжку прототипів


// 6. Object.getPrototypeOf() vs __proto__
// -----------------------------------------------------
// __proto__ — це старий (легасі), нестандартизований спочатку
// геттер/сеттер, який робить те саме, що getPrototypeOf()/
// setPrototypeOf(), але через властивість, а не через функцію.
// Сучасний код повинен використовувати САМЕ статичні методи Object,
// а не __proto__ — він залишений лише для сумісності зі старим кодом.

console.log(plainProtoObj.__proto__ === Object.getPrototypeOf(plainProtoObj)); // true
// [!] __proto__ вважається застарілим (legacy) — уникай його в новому коді


// 7. ЯК ЦЕ ВІДРІЗНЯЄТЬСЯ ВІД instanceof
// -----------------------------------------------------
// instanceof перевіряє, чи є ДАНИЙ прототип десь у ланцюжку
// (повертає true/false), а getPrototypeOf() дає ДОСТУП до
// САМОГО об'єкта-прототипу для подальшого аналізу/маніпуляцій.

console.log(dog instanceof Animal); // true — просто перевірка
console.log(Object.getPrototypeOf(dog)); // сам об'єкт Animal.prototype — можна досліджувати


// 8. НАЙЧАСТІШЕ ЗАСТОСУВАННЯ
// -----------------------------------------------------
// - визначення "справжнього типу" об'єкта під час дебагу/логування
function getConstructorName(obj) {
  const proto = Object.getPrototypeOf(obj);
  return proto?.constructor?.name ?? "немає прототипу (null)";
}
console.log(getConstructorName(dog));       // "Animal"
console.log(getConstructorName(noProtoObj)); // "немає прототипу (null)"

// - точне (не "сплющене") клонування прототипу разом з даними,
//   як у Object.create(Object.getPrototypeOf(obj), ...) —
//   саме так це і використовувалось у розборі shallowClone() вище

// - перевірка одного з ключових інструментів рефлексії/метапрограмування
//   поряд з Object.setPrototypeOf(), Reflect.getPrototypeOf()


// 9. Object.getPrototypeOf() vs Reflect.getPrototypeOf()
// -----------------------------------------------------
// Reflect.getPrototypeOf() робить те саме, але кидає TypeError,
// якщо аргумент — не об'єкт (замість спроби неявно привести
// примітив до об'єкта). У більшості випадків різниця не критична,
// Reflect-версію обирають у коді, орієнтованому на метапрограмування
// (proxy-трапи, рефлексія).


// 10. "МЕЖОВІ" ЗНАЧЕННЯ
// -----------------------------------------------------
console.log(Object.getPrototypeOf("рядок")); // String.prototype — примітив обгортається
// Object.getPrototypeOf(null); // TypeError: Cannot convert undefined or null to object


// ПІДСУМОК:
// - повертає прототип об'єкта — той об'єкт, з якого obj успадковує
//   властивості й методи через внутрішній слот [[Prototype]]
// - {}/new Object() → Object.prototype; [] → Array.prototype;
//   Object.create(proto) → саме proto; Object.create(null) → null;
//   new Конструктор() / new Клас() → Конструктор.prototype / Клас.prototype
// - прототипи утворюють ЛАНЦЮЖОК, що завершується на null
// - сучасна заміна застарілого obj.__proto__
// - при extends прототип дочірнього класу вказує на прототип батьківського
// - типове застосування: інтроспекція/дебаг типу об'єкта, точне
//   клонування зі збереженням прототипу, метапрограмування


// ==========================================================================
// Object.setPrototypeOf() — детальний розбір
// ==========================================================================

// 1. ЩО РОБИТЬ
// -----------------------------------------------------
// Object.setPrototypeOf(obj, prototype) ЗМІНЮЄ внутрішній слот
// [[Prototype]] вже ІСНУЮЧОГО об'єкта — тобто перепризначає, з якого
// об'єкта obj буде успадковувати властивості й методи. Повертає той
// самий obj (мутований).

const baseProto = {
  greet() {
    return `Привіт, я ${this.name}`;
  },
};

const targetObjForProto = { name: "Ігор" };
console.log(targetObjForProto.greet); // undefined — ще немає такого методу

Object.setPrototypeOf(targetObjForProto, baseProto);
console.log(targetObjForProto.greet()); // "Привіт, я Ігор" — тепер метод успадкований


// 2. ГОЛОВНА ВІДМІННІСТЬ ВІД Object.create()
// -----------------------------------------------------
// Object.create(proto)     → СТВОРЮЄ НОВИЙ об'єкт одразу з потрібним прототипом
// Object.setPrototypeOf()  → ЗМІНЮЄ прототип у ВЖЕ ІСНУЮЧОГО об'єкта
// Якщо прототип відомий заздалегідь — завжди краще Object.create(),
// а не спочатку створювати об'єкт, а потім міняти йому прототип.


// 3. ЦЕ ДУЖЕ ПОВІЛЬНА ОПЕРАЦІЯ — ОФІЦІЙНО НЕ РЕКОМЕНДОВАНА
// -----------------------------------------------------
// За специфікацією та документацією MDN, зміна прототипу вже
// існуючого об'єкта — одна з НАЙПОВІЛЬНІШИХ операцій у JS-рушіях.
// Це руйнує внутрішні оптимізації (приховані класи / shapes),
// які рушій будував для цього об'єкта, і змушує ЙОГО і ВСІ
// об'єкти, що успадковують від нього, повторно оптимізуватись.
// MDN прямо радить: "уникайте зміни [[Prototype]] об'єкта в коді,
// критичному до продуктивності" — використовуйте Object.create().


// 4. ЯК ПРАВИЛЬНО (Object.create ЗАМІСТЬ setPrototypeOf)
// -----------------------------------------------------

// Повільно / не рекомендовано:
const slowWay = {};
slowWay.name = "об'єкт вже існує і використовується";
Object.setPrototypeOf(slowWay, baseProto); // рушій "ламає" вже готову оптимізацію

// Швидко / рекомендовано:
const fastWay = Object.create(baseProto, {
  name: { value: "об'єкт одразу створений з правильним прототипом", enumerable: true },
});


// 5. ЗМІНА ПРОТОТИПУ НА null — ОБ'ЄКТ БЕЗ УСПАДКУВАННЯ
// -----------------------------------------------------
// Так само, як Object.create(null), можна прибрати весь ланцюжок
// прототипів у вже існуючого об'єкта.

const willLoseMethods = { data: 1 };
console.log(typeof willLoseMethods.toString); // "function" — успадковано з Object.prototype
Object.setPrototypeOf(willLoseMethods, null);
console.log(willLoseMethods.toString); // undefined — прототип прибрано повністю


// 6. ЗМІНА ПРОТОТИПУ НА ІНШИЙ КЛАС — "ПЕРЕМИКАННЯ" ПОВЕДІНКИ
// -----------------------------------------------------
// Теоретично можна навіть "перетворити" екземпляр одного класу
// на екземпляр іншого, підмінивши прототип — хоча на практиці
// це радше цікавий приклад, ніж рекомендований патерн.

class Cat {
  speak() {
    return "Няв!";
  }
}
class Dog {
  speak() {
    return "Гав!";
  }
}

const pet = new Cat();
console.log(pet.speak()); // "Няв!"
Object.setPrototypeOf(pet, Dog.prototype);
console.log(pet.speak()); // "Гав!" — той самий об'єкт, інша поведінка
console.log(pet instanceof Dog); // true
console.log(pet instanceof Cat); // false — instanceof тепер теж змінився


// 7. Object.setPrototypeOf() vs __proto__ = value
// -----------------------------------------------------
// Присвоєння через застарілий __proto__ робить те саме, але
// Object.setPrototypeOf() — стандартизований, явний і рекомендований
// спосіб (той самий принцип, що й з getPrototypeOf() vs __proto__).

const legacyWay = {};
legacyWay.__proto__ = baseProto; // працює, але вважається застарілим підходом
console.log(legacyWay.greet());  // спрацює так само


// 8. КОЛИ ЦЕ ВСЕ Ж ВИПРАВДАНО
// -----------------------------------------------------
// - у бібліотеках/фреймворках, які реалізують наслідування "поверх"
//   уже створених об'єктів (наприклад, полiфіли для старих рушіїв);
// - для динамічної зміни поведінки об'єкта в спеціалізованих
//   сценаріях (плагіни, патерн "стратегія" через прототип);
// - НЕ для звичайного щоденного коду — там завжди краще одразу
//   закласти правильний прототип через Object.create() / class / new.


// 9. "МЕЖОВІ" ЗНАЧЕННЯ Й ОБМЕЖЕННЯ
// -----------------------------------------------------
// Якщо об'єкт НЕ extensible (наприклад, після Object.preventExtensions(),
// Object.seal() чи Object.freeze()) — зміна прототипу кине TypeError.

const frozenForProto = Object.freeze({});
// Object.setPrototypeOf(frozenForProto, baseProto);
// TypeError: Cannot set prototype of, object is not extensible

// Object.setPrototypeOf(null, {}); // TypeError: Object.setPrototypeOf called on null or undefined


// 10. ПОРІВНЯННЯ getPrototypeOf() / setPrototypeOf() / create()
// -----------------------------------------------------
// - Object.getPrototypeOf(obj)          → ПРОЧИТАТИ поточний прототип
// - Object.setPrototypeOf(obj, proto)   → ЗМІНИТИ прототип існуючого об'єкта (повільно)
// - Object.create(proto)                → СТВОРИТИ новий об'єкт одразу з потрібним прототипом (швидко)


// ПІДСУМОК:
// - змінює [[Prototype]] вже існуючого об'єкта, повертає той самий obj
// - ОФІЦІЙНО НЕ РЕКОМЕНДОВАНО для продуктивного коду — руйнує
//   внутрішні оптимізації рушія (hidden classes), працює повільно
// - якщо прототип відомий заздалегідь — завжди краще Object.create()
// - можна виставити прототип у null (позбавити об'єкт успадкування)
//   або підмінити на прототип іншого класу
// - сучасна заміна застарілого obj.__proto__ = value
// - кидає TypeError на non-extensible об'єктах (frozen/sealed/prevented)
// - виправдане застосування: бібліотеки/полiфіли, динамічна зміна
//   поведінки; НЕ для звичайного щоденного коду
