// ==========================================================================
// MAP — КОЛЕКЦІЯ КЛЮЧ-ЗНАЧЕННЯ З БУДЬ-ЯКИМ ТИПОМ КЛЮЧА (ES6)
// ==========================================================================

// 1. ЩО ТАКЕ Map І ЧИМ ВІН ВІДРІЗНЯЄТЬСЯ ВІД ЗВИЧАЙНОГО ОБ'ЄКТА
// -----------------------------------------------------
// Map — це вбудована структура даних для зберігання пар ключ-значення,
// де КЛЮЧЕМ може бути значення БУДЬ-ЯКОГО типу (не лише рядок чи
// symbol, як у звичайного об'єкта) — число, boolean, об'єкт, функція,
// масив, навіть NaN. Пари зберігають ПОРЯДОК ДОДАВАННЯ (insertion order).

const simpleMap = new Map();
simpleMap.set("рядковий ключ", 1);
simpleMap.set(42, "числовий ключ");
simpleMap.set(true, "булевий ключ");

const objAsKey = { id: 1 };
simpleMap.set(objAsKey, "об'єкт як ключ");

console.log(simpleMap.get(objAsKey)); // "об'єкт як ключ" — працює тільки з Map


// ==========================================================================
// 2. СТВОРЕННЯ MAP
// ==========================================================================

// а) порожній Map
const emptyMap = new Map();

// б) Map одразу з даними — конструктор приймає iterable з пар [ключ, значення]
const filledMap = new Map([
  ["name", "John"],
  ["age", 30],
]);
console.log(filledMap); // Map(2) { 'name' => 'John', 'age' => 30 }

// в) з масиву пар (той самий принцип, що й вище)
const arrayOfPairs = [
  ["a", 1],
  ["b", 2],
];
const fromArray = new Map(arrayOfPairs);

// г) з іншого Map (копіювання — поверхневе, shallow copy)
const copiedMap = new Map(filledMap);
console.log(copiedMap.get("name")); // "John"
console.log(copiedMap === filledMap); // false — новий, незалежний Map

// д) з Object.entries() — перетворення звичайного об'єкта в Map
const plainObj = { x: 1, y: 2, z: 3 };
const mapFromObject = new Map(Object.entries(plainObj));
console.log(mapFromObject.get("x")); // 1


// ==========================================================================
// 3. map.set(key, value) — ДОДАВАННЯ / ОНОВЛЕННЯ ЕЛЕМЕНТА
// ==========================================================================

const userMap = new Map();
userMap.set("name", "Alex");
userMap.set("age", 25);

// повторний set() з тим самим ключем — ОНОВЛЮЄ значення, а не дублює:
userMap.set("age", 26);
console.log(userMap.get("age")); // 26 — старе значення перезаписано

// set() ПОВЕРТАЄ САМ Map — тому виклики можна ЛАНЦЮЖКОМ (chaining):
const chainedMap = new Map().set("a", 1).set("b", 2).set("c", 3);
console.log(chainedMap); // Map(3) { 'a' => 1, 'b' => 2, 'c' => 3 }


// ==========================================================================
// 4. map.get(key) — ОТРИМАННЯ ЗНАЧЕННЯ
// ==========================================================================

console.log(userMap.get("name")); // "Alex"
console.log(userMap.get("nonExistentKey")); // undefined — якщо ключа немає

// на відміну від Object, тут ключі порівнюються за SameValueZero-
// алгоритмом (майже як ===, але NaN === NaN тут вважається true):
const mapWithNaN = new Map();
mapWithNaN.set(NaN, "значення для NaN");
console.log(mapWithNaN.get(NaN)); // "значення для NaN" — знайдено, хоча NaN !== NaN


// ==========================================================================
// 5. map.has(key) — ПЕРЕВІРКА НАЯВНОСТІ КЛЮЧА
// ==========================================================================

console.log(userMap.has("name"));   // true
console.log(userMap.has("email"));  // false

// ВАЖЛИВО: на відміну від obj.prop (де undefined може означати і
// "властивості немає", і "властивість дорівнює undefined"), тут
// has() дає ОДНОЗНАЧНУ відповідь:
userMap.set("middleName", undefined);
console.log(userMap.get("middleName"));  // undefined
console.log(userMap.has("middleName"));  // true — ключ ІСНУЄ, просто значення undefined
console.log(userMap.has("neverSetKey")); // false — а цього ключа взагалі немає


// ==========================================================================
// 6. map.delete(key) — ВИДАЛЕННЯ ЕЛЕМЕНТА
// ==========================================================================

const deletableMap = new Map([["a", 1], ["b", 2]]);
console.log(deletableMap.delete("a")); // true — видалення відбулось
console.log(deletableMap.delete("z")); // false — такого ключа не було, нічого не видалено
console.log(deletableMap); // Map(1) { 'b' => 2 }
// delete() ПОВЕРТАЄ boolean (успіх/неуспіх) — на відміну від
// оператора delete для звичайних об'єктів, який завжди повертає true


// ==========================================================================
// 7. map.clear() — ОЧИЩЕННЯ ВСІЄЇ КОЛЕКЦІЇ
// ==========================================================================

const clearableMap = new Map([["a", 1], ["b", 2], ["c", 3]]);
clearableMap.clear();
console.log(clearableMap);      // Map(0) {}
console.log(clearableMap.size); // 0


// ==========================================================================
// 8. map.size — КІЛЬКІСТЬ ЕЛЕМЕНТІВ
// ==========================================================================

// size — це ГЕТТЕР (властивість), а НЕ метод — викликається БЕЗ дужок.
console.log(userMap.size); // кількість пар у userMap

// Головна перевага над Object.keys(obj).length: size обчислюється
// рушієм за O(1), тоді як для об'єкта треба спершу зібрати масив
// усіх ключів — O(n).
console.log(Object.keys(plainObj).length); // теж працює, але дорожче для великих об'єктів


// ==========================================================================
// 9. ІТЕРАЦІЯ: map.keys() / map.values() / map.entries()
// ==========================================================================

const iterableMap = new Map([
  ["name", "John"],
  ["age", 30],
  ["city", "Kyiv"],
]);

// map.keys() — ітератор по КЛЮЧАХ
for (const key of iterableMap.keys()) {
  console.log("ключ:", key);
}

// map.values() — ітератор по ЗНАЧЕННЯХ
for (const value of iterableMap.values()) {
  console.log("значення:", value);
}

// map.entries() — ітератор по ПАРАХ [ключ, значення]
for (const [key, value] of iterableMap.entries()) {
  console.log(key, "=", value);
}

// ВАЖЛИВО: усі три методи повертають Map Iterator, а НЕ масив —
// щоб отримати справжній масив, потрібно обгорнути у Array.from()
// або розгорнути через spread:
const keysArray = Array.from(iterableMap.keys());
const valuesAsArray = [...iterableMap.values()];
console.log(keysArray, valuesAsArray);


// ==========================================================================
// 10. MAP ЄSTЬ ITERABLE НАПРЯМУ — for...of БЕЗ .entries()
// ==========================================================================

// Map реалізує Symbol.iterator так, що ітерація за замовчуванням —
// це те саме, що й map.entries(). Саме тому for...of працює
// прямо по самому Map, без виклику жодного методу:

for (const [key, value] of iterableMap) {
  console.log("прямий обхід:", key, value);
}

// це і є причина, чому [...map] дає масив пар, а не щось інше:
console.log([...iterableMap]); // [["name","John"], ["age",30], ["city","Kyiv"]]

// а на відміну від Map, ЗВИЧАЙНИЙ ОБ'ЄКТ НЕ iterable — for...of по
//ньому напряму кине TypeError:
// for (const pair of plainObj) {} // TypeError: plainObj is not iterable


// ==========================================================================
// 11. map.forEach(callback) — ПЕРЕБІР ІЗ КОЛБЕКОМ
// ==========================================================================

// Сигнатура колбека: (value, key, map) — саме в такому порядку
// (значення ПЕРШЕ, а не ключ, на відміну від інтуїтивного очікування,
// але так само, як array.forEach((item, index, array) => {})).

iterableMap.forEach((value, key, mapRef) => {
  console.log(`${key}: ${value}`);
});

// forEach() не має способу "перервати" перебір (break/return не
// зупиняють цикл) — якщо потрібне дострокове завершення, використовуй
// звичайний for...of з break.
for (const [key, value] of iterableMap) {
  if (key === "age") break; // так можна, forEach так не можна
}


// ==========================================================================
// 12. Map.groupBy() — СТАТИЧНИЙ МЕТОД ГРУПУВАННЯ (ES2024)
// ==========================================================================

// Map.groupBy(iterable, callback) групує елементи колекції в НОВИЙ
// Map, де ключі — результат виклику callback, а значення — масиви
// елементів цієї групи. Порівняно з Object.groupBy() (який повертає
// звичайний об'єкт), тут ключами групування можуть бути будь-які
// значення, не лише рядки/символи.

const products = [
  { name: "Ноутбук", category: "техніка", price: 25000 },
  { name: "Мишка", category: "техніка", price: 500 },
  { name: "Хліб", category: "їжа", price: 30 },
];

const groupedByCategory = Map.groupBy(products, (item) => item.category);
console.log(groupedByCategory.get("техніка")); // [{ name: "Ноутбук", ... }, { name: "Мишка", ... }]
console.log(groupedByCategory instanceof Map); // true

// групування за нестандартним ключем — наприклад, за самим об'єктом:
const categoryTechnika = { label: "техніка" };
const categoryFood = { label: "їжа" };
const groupedByObjectKey = Map.groupBy(products, (item) =>
  item.category === "техніка" ? categoryTechnika : categoryFood
);
console.log(groupedByObjectKey.get(categoryTechnika).length); // 2 — ключ-об'єкт спрацював


// ==========================================================================
// 13. КОНВЕРТАЦІЯ MAP ↔ ОБ'ЄКТ ↔ МАСИВ
// ==========================================================================

// Map → масив пар:
const mapToArray = [...iterableMap]; // або Array.from(iterableMap)

// Map → звичайний об'єкт (ПРАЦЮЄ КОРЕКТНО, лише якщо всі ключі — рядки/symbol):
const mapToObject = Object.fromEntries(iterableMap);
console.log(mapToObject); // { name: "John", age: 30, city: "Kyiv" }

// об'єкт → Map:
const objectToMap = new Map(Object.entries(mapToObject));

// масив пар → Map:
const pairsToMap = new Map([["a", 1], ["b", 2]]);


// ==========================================================================
// 14. MAP vs OBJECT — КОЛИ ЩО ОБИРАТИ
// ==========================================================================

// | Критерій                      | Map                        | Object                      |
// |--------------------------------|-----------------------------|------------------------------|
// | Тип ключа                     | будь-який (навіть об'єкти)  | лише рядок або symbol        |
// | Порядок ключів                | завжди insertion order      | integer-ключі спереду,       |
// |                                |                              | потім insertion order        |
// | Розмір колекції                | map.size (O(1))             | Object.keys(obj).length (O(n))|
// | Ітерованість (iterable)        | так, напряму (for...of)     | ні, потрібен Object.keys()   |
// |                                |                              | / entries() тощо              |
// | Продуктивність при ЧАСТИХ      | краще оптимізований для     | має накладні витрати через   |
// | додаваннях/видаленнях          | цього сценарію               | прототипний ланцюжок         |
// | Ризик колізії з успадкованим   | немає (немає прототипних     | є (наприклад, ключ "toString"|
// | іменем ("toString" тощо)       | "службових" імен)            | конфліктує з методом)         |
// | Серіалізація в JSON            | НЕ підтримується напряму     | так, JSON.stringify() з коробки |
// |                                | (потрібна ручна конвертація) |                                |

// Приклад проблеми з "небезпечними" ключами в об'єкті — з Map такого немає:
const dangerousKeysMap = new Map();
dangerousKeysMap.set("toString", "я не ламаю нічого");
console.log(dangerousKeysMap.get("toString")); // "я не ламаю нічого" — усе ок

const dangerousKeysObj = {};
dangerousKeysObj["toString"] = "я перевизначив метод!";
console.log(typeof dangerousKeysObj.toString); // "string" — метод справді зламаний

// JSON.stringify НЕ бачить вміст Map:
console.log(JSON.stringify(iterableMap)); // "{}" — треба спочатку сконвертувати в об'єкт/масив
console.log(JSON.stringify(Object.fromEntries(iterableMap))); // {"name":"John","age":30,"city":"Kyiv"}


// ==========================================================================
// 15. WEAKMAP — КОРОТКО, ДЛЯ КОНТРАСТУ З MAP
// ==========================================================================

// WeakMap — "родич" Map з трьома ключовими відмінностями:
//   1) ключами можуть бути ЛИШЕ об'єкти (і, з ES2023, реєстровані symbol) —
//      не можна використати рядок, число чи boolean як ключ;
//   2) ключі зберігаються "слабко" (weak reference) — якщо на об'єкт-ключ
//      більше ніде немає посилань, збирач сміття (garbage collector)
//      може видалити і сам об'єкт, і відповідний запис у WeakMap;
//   3) WeakMap НЕ ітерований — немає keys()/values()/entries()/forEach()/
//      size, бо неможливо надійно "перелічити" вміст, який може
//      зникнути в будь-який момент через garbage collection.

const weakMapDemo = new WeakMap();
let temporaryKey = { id: 1 };
weakMapDemo.set(temporaryKey, "прив'язані приватні дані");
console.log(weakMapDemo.get(temporaryKey)); // "прив'язані приватні дані"

// коли temporaryKey стане недосяжним (наприклад, temporaryKey = null),
// збирач сміття зможе звільнити пам'ять і від самого об'єкта,
// і від запису в WeakMap — це запобігає витокам пам'яті (memory leaks)

// типове застосування WeakMap: зберігання "приватних" метаданих
// для об'єктів, які не заважають самому об'єкту бути зібраним
// збирачем сміття, коли він більше нікому не потрібен.


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// - Map — колекція пар ключ-значення з КЛЮЧЕМ БУДЬ-ЯКОГО ТИПУ
// - зберігає порядок додавання (insertion order) завжди
// - set()/get()/has()/delete()/clear() — базові операції;
//   set() повертає сам Map (можна ланцюжком)
// - size — властивість (геттер), а не метод
// - ключі порівнюються за SameValueZero (NaN === NaN тут true,
//   на відміну від звичайного ===)
// - Map ітерований напряму (for...of), еквівалентно map.entries()
// - forEach(value, key, map) — порядок аргументів: значення першим
// - Map.groupBy() групує iterable у новий Map з довільними ключами
// - конвертація: Object.fromEntries(map) → об'єкт;
//   new Map(Object.entries(obj)) → назад у Map
// - обирай Map замість Object, коли: ключі не є рядками/symbol,
//   важливий порядок, часті додавання/видалення, потрібен
//   безпечний захист від колізій з успадкованими іменами
// - WeakMap — лише об'єкти як ключі, слабкі посилання, не ітерований,
//   використовується для приватних метаданих без витоку пам'яті
