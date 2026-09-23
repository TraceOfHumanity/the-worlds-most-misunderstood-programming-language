// ==========================================================================
// BUFFER У NODE.JS — РОБОТА З БІНАРНИМИ ДАНИМИ
// ==========================================================================

// 1. ЩО ТАКЕ Buffer, І ЧОМУ ВІН З'ЯВИВСЯ САМЕ В NODE.JS
// -----------------------------------------------------
// Buffer — це вбудований у Node.js клас для роботи з СИРИМИ
// БІНАРНИМИ ДАНИМИ (raw binary data) — послідовністю БАЙТІВ,
// незалежно від того, ЩО САМЕ ці байти представляють: текст у
// певному кодуванні, вміст файлу, картинку, дані з мережі тощо.
//
// Buffer З'ЯВИВСЯ РАНІШЕ, НІЖ TypedArray СТАВ ЧАСТИНОЮ САМОЇ МОВИ
// JavaScript (детально TypedArray — у
// common/data-structures/Array/TypedArray.js): Node.js ПОТРЕБУВАВ
// СПОСІБ РОБОТИ З БІНАРНИМИ ПОТОКАМИ (файлова система, мережа, TCP/
// HTTP) ЩЕ ДО ТОГО, ЯК ES6 ввів Uint8Array/ArrayBuffer у САМ рушій
// V8. Сьогодні Buffer ІСНУЄ ЯК ПІДКЛАС Uint8Array — тобто це, по
// суті, СПЕЦІАЛІЗОВАНИЙ TypedArray З ДОДАТКОВИМИ, NODE-СПЕЦИФІЧНИМИ
// зручностями для роботи саме з байтами (кодування рядків, читання/
// запис чисел у різних форматах, порівняння буферів).

const { Buffer } = require("buffer"); // у Node.js Buffer доступний і ГЛОБАЛЬНО,
                                         // без require — імпорт тут лише для явності

const bufferIsUint8Array = Buffer.from([1, 2, 3]);
console.log(bufferIsUint8Array instanceof Uint8Array); // true — Buffer Є Uint8Array!
console.log(Buffer.isBuffer(bufferIsUint8Array));         // true — надійніша перевірка,
                                                              // ніж instanceof (детально нижче)


// ==========================================================================
// 2. СТВОРЕННЯ БУФЕРІВ: alloc(), allocUnsafe(), from()
// ==========================================================================

// 2.1. Buffer.alloc(size) — ВИДІЛЯЄ ПАМ'ЯТЬ, ЗАПОВНЕНУ НУЛЯМИ
// -----------------------------------------------------
// НАЙБЕЗПЕЧНІШИЙ спосіб: гарантовано отримуєш "чисту" пам'ять —
// жодних випадкових старих даних, що могли лишитись у ЦІЙ ділянці
// пам'яті від попередніх операцій:
const zeroedBuffer = Buffer.alloc(4);
console.log(zeroedBuffer); // <Buffer 00 00 00 00> — усі байти нульові

// МОЖНА одразу заповнити ІНШИМ значенням (другий аргумент):
const filledBuffer = Buffer.alloc(5, 1); // 5 байтів, кожен = 1
console.log(filledBuffer); // <Buffer 01 01 01 01 01>


// 2.2. Buffer.allocUnsafe(size) — ШВИДШЕ, АЛЕ БЕЗ ГАРАНТІЇ "ЧИСТОТИ"
// -----------------------------------------------------
// НЕ обнуляє пам'ять перед видачею — ЦЕ ШВИДШЕ (немає витрат на
// заповнення нулями), АЛЕ буфер МОЖЕ містити "СМІТТЯ" — СТАРІ ДАНІ
// з ПОПЕРЕДНЬОГО використання ЦІЄЇ ж ділянки пам'яті (Node.js
// перевикористовує ВНУТРІШНІЙ "пул" пам'яті для маленьких буферів,
// заради продуктивності):

const unsafeBuffer = Buffer.allocUnsafe(10);
console.log(unsafeBuffer); // <Buffer ?? ?? ?? ...> — ВМІСТ НЕПЕРЕДБАЧУВАНИЙ!

// ⚠️ БЕЗПЕКА: якщо В ЦІЙ пам'яті РАНІШЕ лежали, наприклад, ЧУЖІ
// паролі чи токени сесії (з попередньої мережевої операції, яка
// перевикористала той самий шматок пулу) — allocUnsafe() МІГ БИ
// "ПОКАЗАТИ" ЦІ СТАРІ ДАНІ, якщо БУФЕР НЕ ПЕРЕЗАПИСАТИ ПОВНІСТЮ
// ПЕРЕД ВИКОРИСТАННЯМ. Тому правило: allocUnsafe() МОЖНА
// використовувати ЛИШЕ тоді, коли ти ГАРАНТОВАНО ЗАПОВНИШ КОЖЕН
// байт ВЛАСНИМИ даними ще ДО того, як буфер КУДИСЬ ПІДЕ (лог,
// мережа, відповідь клієнту).

for (let i = 0; i < unsafeBuffer.length; i++) {
  unsafeBuffer[i] = 0; // ТЕПЕР безпечно — увесь буфер перезаписано власноруч
}
console.log(unsafeBuffer); // <Buffer 00 00 00 00 00 00 00 00 00 00>


// 2.3. Buffer.from() — З ІСНУЮЧИХ ДАНИХ (масив, рядок, інший буфер)
// -----------------------------------------------------
const fromArray = Buffer.from([0x48, 0x69, 0x21]); // з масиву байтів (чисел 0-255)
console.log(fromArray.toString("utf-8")); // "Hi!"

const fromString = Buffer.from("Привіт"); // з рядка — за замовчуванням UTF-8
console.log(fromString);                    // <Buffer d0 bf ... > — байти UTF-8-кодування
console.log(fromString.length);              // 12 — БІЛЬШЕ, ніж 6 "видимих" символів!
                                                // (кожна кирилична літера — 2 байти в UTF-8;
                                                // детально різниця "байти vs символи" — розділ 5)

const fromHexString = Buffer.from("486921", "hex"); // з HEX-РЯДКА
console.log(fromHexString.toString("utf-8")); // "Hi!"

const fromAnotherBuffer = Buffer.from(fromArray); // КОПІЯ іншого буфера (НЕ спільна пам'ять!)
fromAnotherBuffer[0] = 0;
console.log(fromArray[0], fromAnotherBuffer[0]); // 72 0 — зміна КОПІЇ НЕ вплинула на оригінал


// ==========================================================================
// 3. ЗАПИС І ЧИТАННЯ ОКРЕМИХ БАЙТІВ — ЯК У ЗВИЧАЙНОГО TypedArray
// ==========================================================================

// Buffer — Є Uint8Array, ТОМУ доступ через [] працює ТОЧНО так само
// (детально механіка — common/data-structures/Array/TypedArray.js,
// розділ 5): кожен елемент — ЦІЛЕ число 0-255 (1 байт).

const memoryContainer = Buffer.alloc(4);
console.log(memoryContainer); // <Buffer 00 00 00 00>

memoryContainer[0] = 0xf4; // 244 в десятковій системі
console.log(memoryContainer); // <Buffer f4 00 00 00>

console.log(memoryContainer.toString("hex")); // "f4000000" — той самий вміст, як HEX-рядок
console.log(memoryContainer.readUInt32LE(0)); // 244 — читаємо ЯК 32-бітне ціле (детально розділ 4)


// ==========================================================================
// 4. ЧИСЛОВІ МЕТОДИ readUInt.../writeUInt... — ІНТЕРПРЕТАЦІЯ БАЙТІВ ЯК ЧИСЕЛ
// ==========================================================================

// Так само, як DataView для ArrayBuffer (детально
// common/data-structures/Array/TypedArray.js, розділ 8), Buffer МАЄ
// ВЛАСНІ read*/write* методи для ЧИТАННЯ/ЗАПИСУ багатобайтових чисел
// ЗА КОНКРЕТНИМ ЗСУВОМ — і ТУТ КРИТИЧНО ВАЖЛИВА "ENDIANNESS"
// (ПОРЯДОК БАЙТІВ):
//
//   LE (Little Endian) — МОЛОДШИЙ байт ЗАПИСУЄТЬСЯ ПЕРШИМ (за
//                          МЕНШОЮ адресою) — стандарт для x86/ARM
//   BE (Big Endian)    — СТАРШИЙ байт записується ПЕРШИМ — типово
//                          для мережевих протоколів ("network byte order")

const endiannessDemo = Buffer.alloc(4);
endiannessDemo.writeUInt32LE(0x12345678, 0); // запис як Little Endian
console.log(endiannessDemo); // <Buffer 78 56 34 12> — байти "перевернуті"!

const endiannessDemoBE = Buffer.alloc(4);
endiannessDemoBE.writeUInt32BE(0x12345678, 0); // запис як Big Endian
console.log(endiannessDemoBE); // <Buffer 12 34 56 78> — байти "по порядку"

console.log(endiannessDemo.readUInt32LE(0));   // 305419896 (= 0x12345678) — читаємо ПРАВИЛЬНО,
console.log(endiannessDemoBE.readUInt32BE(0)); // 305419896 (= 0x12345678)    якщо метод відповідає
                                                  // тому, ЯКИМ методом писали!

// ЯКЩО ПЕРЕПЛУТАТИ LE/BE ПРИ ЧИТАННІ — ОТРИМАЄШ ЗОВСІМ ІНШЕ ЧИСЛО,
// БЕЗ ЖОДНОЇ ПОМИЛКИ (тиха, "мовчазна" пастка):
console.log(endiannessDemo.readUInt32BE(0)); // 2018915346 — ЗОВСІМ НЕ 0x12345678!

// ПОВНИЙ НАБІР МЕТОДІВ (те саме, що DataView, але як методи буфера):
//   readInt8/readUInt8, readInt16LE/BE, readUInt16LE/BE,
//   readInt32LE/BE, readUInt32LE/BE, readBigInt64LE/BE,
//   readFloatLE/BE, readDoubleLE/BE — і ВІДПОВІДНІ write*-версії


// ==========================================================================
// 5. РЯДКИ ↔ БУФЕРИ: КОДУВАННЯ (ENCODING)
// ==========================================================================

// toString(encoding) і Buffer.from(string, encoding) — ДВА БОКИ
// ОДНІЄЇ ОПЕРАЦІЇ: перетворення МІЖ "сирими байтами" і "текстом",
// ІНТЕРПРЕТОВАНИМ ЗА КОНКРЕТНИМ КОДУВАННЯМ:

const helloBuffer = Buffer.from("Hi!", "utf-8");
console.log(helloBuffer.toString());        // "Hi!" — за замовчуванням "utf-8"
console.log(helloBuffer.toString("hex"));    // "486921" — ті самі байти як HEX
console.log(helloBuffer.toString("base64")); // "SGkh" — ті самі байти як Base64
console.log(helloBuffer.toString("ascii"));   // "Hi!" — для звичайних ASCII-символів так само

// ПІДТРИМУВАНІ КОДУВАННЯ: "utf8"/"utf-8" (за замовчуванням), "ascii",
// "utf16le"/"ucs2" (2 байти на символ), "base64", "base64url",
// "hex", "latin1"/"binary" (1 байт на символ, 0-255 напряму)

// ⚠️ ПАСТКА: length БУФЕРА — ЦЕ КІЛЬКІСТЬ БАЙТІВ, А НЕ СИМВОЛІВ —
// для БАГАТОБАЙТОВИХ кодувань (UTF-8 з кирилицею/емодзі) ЦІ ЦИФРИ
// РОЗХОДЯТЬСЯ (та сама проблема, що й з String.length у
// common/data-structures/String/String.js, розділ 4, але ТУТ вона
// стосується Buffer, а не JS-рядка):

const emojiBuffer = Buffer.from("😀");
console.log(emojiBuffer.length);        // 4 — емодзі займає 4 БАЙТИ в UTF-8
console.log([..."😀"].length);           // 1 — а як РЯДОК JS це ОДИН символ
console.log(Buffer.byteLength("😀"));    // 4 — ПРАВИЛЬНИЙ спосіб дізнатись
                                            // розмір рядка В БАЙТАХ, НЕ створюючи буфер


// ==========================================================================
// 6. slice() / subarray() — "ВІКНО" В ТУ САМУ ПАМ'ЯТЬ, БЕЗ КОПІЮВАННЯ
// ==========================================================================

// Так само, як subarray() у звичайного TypedArray (детально
// common/data-structures/Array/TypedArray.js, розділ 6), slice() і
// subarray() у Buffer НЕ КОПІЮЮТЬ дані — ПОВЕРТАЮТЬ НОВИЙ Buffer-
// об'єкт, ЩО "ДИВИТЬСЯ" НА ТУ САМУ ДІЛЯНКУ ПАМ'ЯТІ:

const originalBuffer = Buffer.from("Hello World");
const slicedView = originalBuffer.subarray(0, 5); // "вікно" на перші 5 байтів
console.log(slicedView.toString()); // "Hello"

slicedView[0] = 0x68; // 'h' замість 'H' — МІНЯЄМО через slicedView...
console.log(originalBuffer.toString()); // "hello World" — ...і ОРИГІНАЛ ТЕЖ ЗМІНИВСЯ!
                                          // (спільна пам'ять, а НЕ копія)

// ЯКЩО ПОТРІБНА САМЕ КОПІЯ (незалежна від оригіналу) — Buffer.from(buffer):
const independentCopy = Buffer.from(originalBuffer);
independentCopy[0] = 0x48; // 'H' назад, АЛЕ ЛИШЕ в копії
console.log(originalBuffer.toString(), independentCopy.toString()); // "hello World" "Hello World"


// ==========================================================================
// 7. ОБ'ЄДНАННЯ Й ПОРІВНЯННЯ БУФЕРІВ
// ==========================================================================

// Buffer.concat(list, totalLength?) — ОБ'ЄДНУЄ МАСИВ буферів в ОДИН
// НОВИЙ буфер (одна алокація, детально принцип — той самий, що й
// "Array.join замість += у циклі" з performance/11-string-concatenation.js):

const part1 = Buffer.from("Hello, ");
const part2 = Buffer.from("World!");
const combined = Buffer.concat([part1, part2]);
console.log(combined.toString()); // "Hello, World!"

// Buffer.compare() / .equals() — ПОРІВНЯННЯ ВМІСТУ (а НЕ ідентичності
// посилання, як === для об'єктів):
const bufA = Buffer.from("abc");
const bufB = Buffer.from("abc");
console.log(bufA === bufB);       // false — РІЗНІ об'єкти в пам'яті
console.log(bufA.equals(bufB));    // true — АЛЕ ОДНАКОВИЙ ВМІСТ
console.log(Buffer.compare(bufA, bufB)); // 0 — рівні (від'ємне/додатне число — хто "менший" лексикографічно)


// ==========================================================================
// 8. НАЙЧАСТІШЕ ПРАКТИЧНЕ ЗАСТОСУВАННЯ: ФАЙЛИ, МЕРЕЖА, ПОТОКИ
// ==========================================================================

// Buffer З'ЯВЛЯЄТЬСЯ БУКВАЛЬНО СКРІЗЬ, ДЕ Node.js РОБИТЬ ВВОДІ/ВИВІД
// БІНАРНИХ ДАНИХ — САМЕ ТОМУ ЙОГО ВАРТО РОЗУМІТИ ГЛИБОКО:
//
//   const fs = require("fs");
//   const fileBuffer = fs.readFileSync("image.png"); // ПОВЕРТАЄ Buffer, НЕ рядок —
//                                                        картинка НЕ Є текстом!
//
//   const server = require("http").createServer((req, res) => {
//     let chunks = [];
//     req.on("data", (chunk) => chunks.push(chunk)); // КОЖЕН chunk — Buffer
//     req.on("end", () => {
//       const body = Buffer.concat(chunks); // збираємо ВЕСЬ буфер тіла запиту
//       console.log(body.toString("utf-8"));
//     });
//   });
//
// (детально самі Streams і Http — інші файли у node/core-concepts/streams, node/core-concepts/http)


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// - Buffer — Node.js-специфічний ПІДКЛАС Uint8Array для роботи із
//   сирими байтами; з'явився ДО того, як TypedArray стали частиною
//   самого JS-стандарту
// - Buffer.alloc(n) — безпечно (нулі за замовчуванням); Buffer.allocUnsafe(n) —
//   швидше, АЛЕ МОЖЕ містити СТАРІ дані з пулу пам'яті — обов'язково
//   заповнюй ВЕСЬ буфер власними даними перед використанням
// - Buffer.from() створює буфер із масиву байтів, рядка (з
//   кодуванням), HEX-рядка чи ІНШОГО буфера (КОПІЮЄ, а НЕ ділить пам'ять)
// - readUInt32LE/BE та подібні методи читають/пишуть багатобайтові
//   числа з урахуванням ENDIANNESS (порядку байтів) — переплутати
//   LE/BE = отримати ЗОВСІМ ІНШЕ число БЕЗ ЖОДНОЇ помилки
// - toString(encoding)/Buffer.from(str, encoding) — перетворення між
//   байтами й текстом; buffer.length — це БАЙТИ, а НЕ символи
//   (Buffer.byteLength(str) — правильний спосіб дізнатись розмір
//   рядка в байтах без створення буфера)
// - slice()/subarray() дають "вікно" в ТУ САМУ пам'ять (як і в
//   звичайного TypedArray) — Buffer.from(buffer) робить СПРАВЖНЮ копію
// - Buffer.concat() об'єднує кілька буферів в один за ОДНУ алокацію;
//   .equals()/Buffer.compare() порівнюють ВМІСТ, а не посилання
// - головне практичне застосування — файлова система, мережа, потоки:
//   БУДЬ-ЯКІ бінарні дані (картинки, TCP-пакети, тіло HTTP-запиту)
//   у Node.js представлені саме через Buffer


// ==========================================================================
// ПРАКТИЧНІ ПРИКЛАДИ
// ==========================================================================

const memoryContainer2 = Buffer.alloc(3);
memoryContainer2[0] = 0x48;
memoryContainer2[1] = 0x69;
memoryContainer2[2] = 0x21;

console.log(memoryContainer2.toString("utf-8")); // Hi!

//---------------------------------------------------------

const memoryContainer3 = Buffer.from([0x48, 0x69, 0x21]);
console.log(memoryContainer3.toString("utf-8")); // Hi!

//---------------------------------------------------------

const memoryContainer4 = Buffer.from("Hi!");
console.log(memoryContainer4.toString()); // Hi!

//---------------------------------------------------------

const memoryContainer5 = Buffer.from("486921", "hex");
console.log(memoryContainer5.toString("utf-8")); // Hi!

//---------------------------------------------------------

const memoryContainer6 = Buffer.from("Hi!", "utf-8");
console.log(memoryContainer6.toString("utf-8")); // Hi!

//---------------------------------------------------------

const memoryContainer7 = Buffer.alloc(100, 1);
// console.log(memoryContainer7);

//---------------------------------------------------------

const memoryContainer8 = Buffer.allocUnsafe(10000);

for (let i = 0; i < memoryContainer8.length; i++) {
    if (memoryContainer8[i] !== 0) {
        console.log(memoryContainer8[i].toString(2));
    }
}
