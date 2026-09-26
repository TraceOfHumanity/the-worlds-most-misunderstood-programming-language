// ==========================================================================
// SYMBOL — ПРИМІТИВНИЙ ТИП ІЗ ГАРАНТОВАНО УНІКАЛЬНИМ ЗНАЧЕННЯМ (ES6)
// ==========================================================================

// 1. ЩО ТАКЕ Symbol
// -----------------------------------------------------
// Symbol — це СЬОМИЙ примітивний тип у JS (поруч з string, number,
// boolean, undefined, null, bigint). Кожен виклик Symbol() створює
// УНІКАЛЬНЕ значення — навіть якщо передати той самий опис (description),
// два symbol НІКОЛИ не будуть рівними.

const s1 = Symbol();
const s2 = Symbol();
console.log(s1 === s2); // false — кожен symbol унікальний за визначенням
console.log(typeof s1); // "symbol"

const symbolA = Symbol("опис для дебагу");
const symbolB = Symbol("опис для дебагу");
console.log(symbolA === symbolB); // false — description НЕ впливає на унікальність!


// 2. НАВІЩО SYMBOL, І ЧОМУ description — ЛИШЕ ДЛЯ ЛЮДЕЙ
// -----------------------------------------------------
// Рядок, переданий у Symbol("опис"), використовується ВИКЛЮЧНО
// для читабельності в дебазі/логах — він НЕ є ідентифікатором
// і не впливає на порівняння чи пошук symbol.

const idSymbol = Symbol("user id");
console.log(idSymbol.toString());  // "Symbol(user id)"
console.log(idSymbol.description); // "user id" — властивість для читання опису (ES2019)

const noDescSymbol = Symbol();
console.log(noDescSymbol.description); // undefined — опис не задавали


// 3. Symbol() — БЕЗ new!
// -----------------------------------------------------
// На відміну від інших "обгорткових" типів (Number, String, Boolean),
// Symbol НЕ МОЖНА створити через new — це навмисне обмеження.

// const wrongSymbol = new Symbol(); // TypeError: Symbol is not a constructor
const correctSymbol = Symbol("правильно, без new");


// ==========================================================================
// 4. SYMBOL ЯК КЛЮЧ ОБ'ЄКТА — ГАРАНТІЯ ВІД КОЛІЗІЙ
// ==========================================================================

const uniqueKey = Symbol("id");
const objWithSymbolKey = {
  name: "John",
  [uniqueKey]: "унікальне значення",
};
console.log(objWithSymbolKey[uniqueKey]); // "унікальне значення"
console.log(objWithSymbolKey);            // { name: 'John', [Symbol(id)]: 'унікальне значення' }

// ГОЛОВНА ПЕРЕВАГА: два symbol з однаковим description НІКОЛИ не
// конфліктують один з одним, навіть якщо вони прийшли з різних
// бібліотек, що не знають одна про одну:
const libraryASymbol = Symbol("metadata");
const libraryBSymbol = Symbol("metadata");
const sharedObj = {};
sharedObj[libraryASymbol] = "дані бібліотеки A";
sharedObj[libraryBSymbol] = "дані бібліотеки B";
console.log(sharedObj[libraryASymbol], sharedObj[libraryBSymbol]);
// "дані бібліотеки A" "дані бібліотеки B" — жодного перезапису, хоч ключі виглядають однаково


// ==========================================================================
// 5. SYMBOL-КЛЮЧІ "НЕВИДИМІ" ДЛЯ ЗВИЧАЙНИХ СПОСОБІВ ОБХОДУ
// ==========================================================================

// Це навмисна поведінка специфікації — symbol-ключі СВІДОМО виключені
// зі "стандартних" механізмів перебору властивостей:

console.log(Object.keys(objWithSymbolKey));              // ["name"]
console.log(Object.values(objWithSymbolKey));             // ["John"]
console.log(Object.entries(objWithSymbolKey));            // [["name", "John"]]
console.log(Object.getOwnPropertyNames(objWithSymbolKey)); // ["name"]
console.log(JSON.stringify(objWithSymbolKey));             // {"name":"John"}
for (const key in objWithSymbolKey) {
  console.log("for...in:", key); // лише "name"
}

// АЛЕ symbol-ключі — НЕ приватні! Їх можна знайти, знаючи посилання
// на сам symbol, або через спеціальний метод:
console.log(Object.getOwnPropertySymbols(objWithSymbolKey)); // [Symbol(id)]
console.log(Reflect.ownKeys(objWithSymbolKey));              // ["name", Symbol(id)] — усі ключі разом

// spread {...obj} і Object.assign() КОПІЮЮТЬ enumerable symbol-ключі
// (детальніше — в common/data-structures/object/object.js)
console.log({ ...objWithSymbolKey }[uniqueKey]); // "унікальне значення" — скопійовано


// ==========================================================================
// 6. Symbol() vs Symbol.for() — ЛОКАЛЬНІ VS ГЛОБАЛЬНІ (РЕЄСТРОВАНІ) SYMBOL
// ==========================================================================

// Symbol.for(key) працює через ГЛОБАЛЬНИЙ РЕЄСТР symbol'ів — на
// відміну від Symbol(), повторний виклик з ТИМ САМИМ рядком-ключем
// ПОВЕРТАЄ ОДИН І ТОЙ САМИЙ symbol.

const registeredSymbol1 = Symbol.for("shared.key");
const registeredSymbol2 = Symbol.for("shared.key");
console.log(registeredSymbol1 === registeredSymbol2); // true — той самий symbol з реєстру!

// на відміну від звичайного Symbol("shared.key") — щоразу новий:
console.log(Symbol("shared.key") === Symbol("shared.key")); // false

// Symbol.keyFor(symbol) — зворотна операція: дізнатись реєстраційний
// ключ ЗАРЕЄСТРОВАНОГО symbol (для НЕзареєстрованого — undefined):
console.log(Symbol.keyFor(registeredSymbol1)); // "shared.key"
console.log(Symbol.keyFor(Symbol("не в реєстрі"))); // undefined

// КОЛИ ЦЕ ПОТРІБНО: Symbol.for() використовують, коли symbol має
// бути ОДНАКОВИМ у РІЗНИХ частинах застосунку/різних файлах/навіть
// різних вкладках браузера (глобальний реєстр — спільний на весь
// JS-рантайм), тоді як звичайний Symbol() зазвичай тримають
// у модульній змінній саме заради ІЗОЛЯЦІЇ.


// ==========================================================================
// 7. WELL-KNOWN SYMBOLS — ВБУДОВАНІ SYMBOL, ЩО НАЛАШТОВУЮТЬ ПОВЕДІНКУ ДВИГУНА
// ==========================================================================

// JS сам використовує спеціальні "вбудовані" symbol-ключі (well-known
// symbols) для налаштування того, як об'єкт поводиться в певних
// вбудованих механізмах мови. Найважливіші з них:


// --- 7.1. Symbol.iterator — робить об'єкт ІТЕРОВАНИМ (iterable) ---
// -----------------------------------------------------
// Дозволяє використовувати for...of, spread {...obj}/[...obj],
// деструктуризацію масивів, Array.from() тощо для КАСТОМНОГО об'єкта.

const customRange = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      },
    };
  },
};

for (const num of customRange) {
  console.log("значення з range:", num); // 1, 2, 3, 4, 5
}
console.log([...customRange]); // [1, 2, 3, 4, 5] — spread теж працює завдяки Symbol.iterator

// делегування вже готовому ітератору (найпростіший спосіб зробити
// об'єкт-обгортку ітерованим):
const dataWrapper = {
  data: [10, 20, 30],
  [Symbol.iterator]() {
    return this.data[Symbol.iterator](); // делегуємо ітератору масиву
  },
};
for (const value of dataWrapper) {
  console.log("з обгортки:", value); // 10, 20, 30
}


// --- 7.2. Symbol.toPrimitive — налаштування ToPrimitive-приведення ---
// -----------------------------------------------------
// Дає повний контроль над тим, як об'єкт перетворюється на примітив
// (замість окремих toString()/valueOf()) — hint підказує КОНТЕКСТ
// приведення: "number", "string" або "default".

class Money {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
  }
  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.amount;
    if (hint === "string") return `${this.amount} ${this.currency}`;
    return `${this.amount} ${this.currency} (default)`; // hint === "default"
  }
}
const price = new Money(100, "грн");
console.log(+price);          // 100 — hint: "number"
console.log(`Ціна: ${price}`); // "Ціна: 100 грн" — hint: "string"
console.log(price + "");       // "100 грн (default)" — hint: "default"


// --- 7.3. Symbol.toStringTag — налаштування Object.prototype.toString() ---
// -----------------------------------------------------
// Впливає на те, що повертає Object.prototype.toString.call(obj) —
// корисно для власних класів, щоб їх можна було коректно
// ідентифікувати через цей "надійний" спосіб перевірки типу.

class CustomCollection {
  get [Symbol.toStringTag]() {
    return "CustomCollection";
  }
}
console.log(Object.prototype.toString.call(new CustomCollection())); // "[object CustomCollection]"
console.log(Object.prototype.toString.call([]));   // "[object Array]"
console.log(Object.prototype.toString.call(null)); // "[object Null]"


// --- 7.4. Symbol.hasInstance — кастомізація instanceof ---
// -----------------------------------------------------
class EvenNumber {
  static [Symbol.hasInstance](value) {
    return typeof value === "number" && value % 2 === 0;
  }
}
console.log(4 instanceof EvenNumber); // true — навіть попри те, що 4 не створювалось через new
console.log(5 instanceof EvenNumber); // false


// --- 7.5. Інші well-known symbols (коротко) ---
// -----------------------------------------------------
// - Symbol.asyncIterator   → робить об'єкт асинхронно ітерованим (for await...of)
// - Symbol.isConcatSpreadable → чи "розгортати" об'єкт у Array.prototype.concat()
// - Symbol.species          → який конструктор використовувати для похідних
//                              методів вбудованих класів (map(), filter() тощо)
// - Symbol.unscopables      → які властивості ігнорує застаріла конструкція with


// ==========================================================================
// 8. SYMBOL НЕ ПРИВОДИТЬСЯ НЕЯВНО ДО РЯДКА
// ==========================================================================

// На відміну від решти примітивів, symbol НЕ бере участі в неявному
// приведенні типів через конкатенацію чи шаблонні рядки — це
// навмисний захист від випадкових помилок.

const strictSymbol = Symbol("test");
// console.log(`${strictSymbol}`); // TypeError: Cannot convert a Symbol value to a string
// console.log(strictSymbol + ""); // TypeError: Cannot convert a Symbol value to a string
console.log(String(strictSymbol));      // "Symbol(test)" — ЯВНЕ приведення працює
console.log(strictSymbol.toString());   // "Symbol(test)" — так теж можна


// ==========================================================================
// 9. НАЙЧАСТІШІ ЗАСТОСУВАННЯ SYMBOL
// ==========================================================================

// а) "напівприватні" внутрішні поля бібліотек/фреймворків
//    (перед появою #privateField у класах — див. WeakMap.js
//    для повноцінного патерну приватності)

// б) унікальні "мітки" для розрізнення однотипних об'єктів/подій
const EventType = {
  CLICK: Symbol("click"),
  HOVER: Symbol("hover"),
};
function handleEvent(type) {
  switch (type) {
    case EventType.CLICK:
      return "оброблено клік";
    case EventType.HOVER:
      return "оброблено наведення";
  }
}
console.log(handleEvent(EventType.CLICK)); // "оброблено клік"

// в) реалізація enum-подібних констант (гарантована унікальність,
//    на відміну від звичайних рядкових констант, які МОЖУТЬ випадково
//    збігтися з іншим рядком):
const Direction = Object.freeze({
  UP: Symbol("up"),
  DOWN: Symbol("down"),
  LEFT: Symbol("left"),
  RIGHT: Symbol("right"),
});

// г) кастомізація вбудованої поведінки об'єктів через well-known
//    symbols (ітерованість, приведення типів, instanceof — показано вище)

// д) додавання метаданих до об'єкта без ризику перезаписати чиюсь
//    "звичайну" властивість (навіть якщо структура об'єкта заздалегідь
//    не відома — наприклад, дані, що прийшли ззовні)


// ==========================================================================
// 10. Symbol vs звичайний рядковий ключ — КОЛИ ЩО ОБИРАТИ
// ==========================================================================

// | Критерій                      | Рядковий ключ           | Symbol-ключ                    |
// |---------------------------------|---------------------------|-----------------------------------|
// | Унікальність                   | НЕ гарантована             | гарантована (окрім Symbol.for()) |
// | Видимість у keys/entries/JSON  | видимий                    | невидимий (окрім getOwnPropertySymbols) |
// | Придатність для публічного API | так, очікувано              | зазвичай ні (незвично для читання) |
// | Придатність для "службових" полів | ризик колізії з даними   | безпечно, не конфліктує          |
// | Кастомізація поведінки двигуна | неможлива                  | так (well-known symbols)         |


// ПІДСУМОК:
// - Symbol — примітивний тип, кожне значення якого ГАРАНТОВАНО
//   унікальне, навіть при однаковому description
// - створюється лише через Symbol(), БЕЗ new
// - description — лише для читабельності дебагу, не впливає на рівність
// - symbol-ключі об'єкта "невидимі" для Object.keys/values/entries/
//   for...in/JSON.stringify, але НЕ приватні — видно через
//   Object.getOwnPropertySymbols() / Reflect.ownKeys()
// - Symbol.for(key)/Symbol.keyFor() — глобальний реєстр, повертає
//   ОДНАКОВИЙ symbol для однакового ключа (на відміну від Symbol())
// - well-known symbols (Symbol.iterator, Symbol.toPrimitive,
//   Symbol.toStringTag, Symbol.hasInstance...) кастомізують вбудовану
//   поведінку об'єкта — ітерованість, приведення типів, instanceof
// - НЕ приводиться неявно до рядка (конкатенація кине TypeError) —
//   потрібне явне String(symbol) чи symbol.toString()
// - типове застосування: унікальні "мітки"/enum'и, службові/приховані
//   поля без ризику колізії, кастомізація поведінки об'єктів