// ==========================================================================
// typeof ТА keyof — ДВА ОПЕРАТОРИ, ЩО ЧИТАЮТЬ ІНФОРМАЦІЮ З КОДУ В ТИП
// ==========================================================================

// 0. ЗАГАЛЬНА ІДЕЯ
// -----------------------------------------------------
// typeof і keyof — це ДВА РІЗНІ оператори TypeScript, які "видобувають"
// тип ІЗ ЧОГОСЬ, що ти вже написав, замість того щоб описувати цей
// тип вручну заново. Вони НЕ пов'язані один з одним напряму, але
// ЧАСТО використовуються РАЗОМ (typeof x, а потім keyof (typeof x)) —
// тому їх і варто розглянути в одному файлі.
//
// НАЙГОЛОВНІША РІЧ, яку треба зрозуміти ще до прикладів: у TypeScript
// ІСНУЮТЬ ДВА "ПРОСТОРИ" — ПРОСТІР ЗНАЧЕНЬ (values, той самий JS, що
// виконується в рантаймі) і ПРОСТІР ТИПІВ (types, існує ЛИШЕ на
// етапі компіляції, зникає після компіляції). typeof і keyof —
// це "МОСТИ" З ПРОСТОРУ ЗНАЧЕНЬ У ПРОСТІР ТИПІВ.


// ==========================================================================
// 1. typeof У JAVASCRIPT (ПРОСТІР ЗНАЧЕНЬ) — ЩО ВІН РОБИТЬ У РАНТАЙМІ
// ==========================================================================

// Це той САМИЙ typeof, що є в ЧИСТОМУ JS (детально розглянутий у
// common/type-coercion.js) — РАНТАЙМ-оператор, що повертає РЯДОК
// із назвою типу значення:

const runtimeValue = 42;
console.log(typeof runtimeValue); // "number" — це РЯДОК, обчислений ПІД ЧАС ВИКОНАННЯ

// Цей JS typeof ПРАЦЮЄ й у TS-файлах ТАК САМО — коли він
// зустрічається у ЗВИЧАЙНОМУ виразі (не в позиції типу):
function describeRuntime(value: unknown): string {
  return typeof value; // це РАНТАЙМ typeof — повертає "number"/"string"/... як рядок
}
console.log(describeRuntime("текст")); // "string"


// ==========================================================================
// 2. typeof У TYPESCRIPT (ПРОСТІР ТИПІВ) — ЗОВСІМ ІНША РІЧ, НАЗВАНА ОДНАКОВО
// ==========================================================================

// Коли typeof застосовується В ПОЗИЦІЇ ТИПУ (після двокрапки типу,
// у type alias тощо) — це ВЖЕ ІНШИЙ оператор: "візьми ТИП цього
// значення, ЯКИЙ TS вивів для нього", а НЕ рядок-назву типу:

const configObject = {
  host: "localhost",
  port: 8080,
  debug: true,
};

type ConfigType = typeof configObject;
// ConfigType — ЦЕ ТОЧНИЙ ОПИС: { host: string; port: number; debug: boolean }

const anotherConfig: ConfigType = {
  host: "example.com",
  port: 443,
  debug: false,
};
console.log(anotherConfig);
// const invalidConfig: ConfigType = { host: "x", port: "443", debug: false };
// ❌ Type 'string' is not assignable to type 'number'. (port)

// ЦЕ ГОЛОВНА ПЕРЕВАГА: замість того щоб ОКРЕМО написати type/interface
// і ПОТІМ стежити, щоб об'єкт відповідав цьому опису, typeof дозволяє
// СПОЧАТКУ написати РЕАЛЬНИЙ об'єкт, а тип "витягти" з нього
// АВТОМАТИЧНО — вони НІКОЛИ не розсинхронізуються.


// 3. ЯК ВІДРІЗНИТИ ДВА typeof МІЖ СОБОЮ
// -----------------------------------------------------
// - typeof У ЗВИЧАЙНОМУ ВИРАЗІ (там, де очікується ЗНАЧЕННЯ) —
//   РАНТАЙМ-оператор JS, повертає РЯДОК
// - typeof ПІСЛЯ ДВОКРАПКИ ТИПУ / У type alias (там, де очікується
//   ТИП) — TS-оператор, повертає ТИП
//
// Обидва МОЖУТЬ зустрітися в ОДНІЙ функції, і компілятор безпомилково
// розрізняє їх ЗА ПОЗИЦІЄЮ в коді:

function demoTwoTypeofs(value: number) {
  const runtimeCheck: string = typeof value;     // ← рантайм typeof: "number" (рядок)
  type ValueType = typeof value;                   // ← TS typeof: тип number (не рядок!)
  const typed: ValueType = 100;                    // ValueType тут — просто "number"
  console.log(runtimeCheck, typed);
}
demoTwoTypeofs(5);


// ==========================================================================
// 4. НАЙПОШИРЕНІШЕ ЗАСТОСУВАННЯ TS typeof: ТИП ІЗ ФУНКЦІЇ ЧИ КОНСТАНТИ
// ==========================================================================

// а) ТИП ЗІ ЗМІННОЇ/КОНСТАНТИ (уже показано вище з configObject)

// б) ТИП ІЗ САМОЇ ФУНКЦІЇ (весь тип функції, разом із сигнатурою):
function calculateArea(width: number, height: number): number {
  return width * height;
}
type CalculateAreaFn = typeof calculateArea; // (width: number, height: number) => number

function logAndCall(fn: CalculateAreaFn, ...args: Parameters<CalculateAreaFn>) {
  // Parameters<T> — utility type з typescript/utility-types.ts,
  // тут показано, як typeof і Parameters/ReturnType ПРАЦЮЮТЬ РАЗОМ
  console.log("викликаємо з:", args);
  return fn(...args);
}
console.log(logAndCall(calculateArea, 5, 10)); // 50

// в) ТИП ІЗ enum-ПОДІБНОГО ОБ'ЄКТА (класичний "JS-стиль enum" —
// об'єкт із Object.freeze, детально розглянутий у
// common/data-structures/Symbol/Symbol.js, приклад Direction):
const Colors = {
  RED: "red",
  GREEN: "green",
  BLUE: "blue",
} as const; // "as const" — робить об'єкт максимально "вузьким"
              // (детально в окремому файлі про const assertions;
              // тут важливо, що БЕЗ as const ключі мали б ширший тип string)

type ColorValue = (typeof Colors)[keyof typeof Colors]; // "red" | "green" | "blue"
// ^ ОСЬ ТУТ typeof І keyof ПРАЦЮЮТЬ РАЗОМ — детально keyof нижче,
// а цей рядок читається "справа наліво": типи КЛЮЧІВ Colors →
// типи ЗНАЧЕНЬ ЗА ЦИМИ ключами

function paint(color: ColorValue) {
  console.log(`Фарбуємо в колір: ${color}`);
}
paint(Colors.RED); // "Фарбуємо в колір: red"
// paint("purple"); // ❌ Argument of type '"purple"' is not assignable
                       // to parameter of type '"red" | "green" | "blue"'.


// ==========================================================================
// 5. keyof — СОЮЗ (UNION) ІЗ УСІХ ІМЕН ВЛАСТИВОСТЕЙ ТИПУ
// ==========================================================================

// keyof T ПОВЕРТАЄ ТИП, що є UNION-ом усіх РЯДКОВИХ (і symbol) ключів
// об'єктного типу T — literal union, той самий принцип, що й
// у typescript/union-and-intersection-types.ts, п. 4:

interface Product {
  id: number;
  name: string;
  price: number;
}

type ProductKey = keyof Product; // "id" | "name" | "price"

function getProductField(product: Product, key: ProductKey) {
  return product[key];
}
const sampleProduct: Product = { id: 1, name: "Ноутбук", price: 25000 };
console.log(getProductField(sampleProduct, "name"));  // "Ноутбук"
// getProductField(sampleProduct, "weight"); // ❌ Argument of type '"weight"' is
                                                // not assignable to parameter of type 'ProductKey'.

// У ЧИСТОМУ JS звернення до sampleProduct["weight"] МОВЧКИ поверне
// undefined — жодної перевірки НЕ ІСНУЄ; keyof робить саме ЦЮ
// перевірку доступною на етапі компіляції.


// ==========================================================================
// 6. keyof + GENERIC — БУЛО ПОКАЗАНО В generics.ts, ТУТ — ЧОМУ ЦЕ ПРАЦЮЄ
// ==========================================================================

// Комбінація `<T, K extends keyof T>` (typescript/generics.ts, п. 6)
// працює завдяки ТОМУ, що keyof T — ЦЕ ЗВИЧАЙНИЙ union-тип, і його
// МОЖНА використати як ОБМЕЖЕННЯ (constraint) для generic-параметра K:

function pluck<T, K extends keyof T>(obj: T, keys: K[]): T[K][] {
  return keys.map((key) => obj[key]);
}
console.log(pluck(sampleProduct, ["name", "price"])); // ["Ноутбук", 25000]
// pluck(sampleProduct, ["weight"]); // ❌ weight немає в keyof Product


// ==========================================================================
// 7. keyof НА typeof — НАЙПОШИРЕНІША КОМБІНАЦІЯ (АНАЛІЗ ПОКРОКОВО)
// ==========================================================================

// Розберемо детально приклад ColorValue із п. 4 — багато хто плутається,
// ЧОМУ там ДВА typeof/keyof в одному рядку:

const HttpStatusMessages = {
  200: "OK",
  404: "Not Found",
  500: "Internal Server Error",
} as const;

// КРОК 1: typeof HttpStatusMessages — ТИП об'єкта:
//   { readonly 200: "OK"; readonly 404: "Not Found"; readonly 500: "Internal Server Error" }
type StatusMessagesType = typeof HttpStatusMessages;

// КРОК 2: keyof StatusMessagesType — union КЛЮЧІВ цього типу:
//   200 | 404 | 500 (числові літерали, бо ключі числові!)
type StatusCode = keyof StatusMessagesType;

// КРОК 3: StatusMessagesType[StatusCode] — тип ЗНАЧЕНЬ за ЦИМИ ключами:
//   "OK" | "Not Found" | "Internal Server Error"
type StatusMessage = StatusMessagesType[StatusCode];

function getStatusMessage(code: StatusCode): StatusMessage {
  return HttpStatusMessages[code];
}
console.log(getStatusMessage(404)); // "Not Found"
// getStatusMessage(999); // ❌ Argument of type '999' is not assignable
                             // to parameter of type '200 | 404 | 500'.

// ТОЙ САМИЙ РЕЗУЛЬТАТ В ОДИН РЯДОК (як у ColorValue з п. 4):
type StatusMessageShort = (typeof HttpStatusMessages)[keyof typeof HttpStatusMessages];
const shortVersion: StatusMessageShort = "OK";
console.log(shortVersion);


// ==========================================================================
// 8. keyof НА typeof МАСИВУ — ВІДМІННІСТЬ ВІД ОБ'ЄКТА
// ==========================================================================

// Для МАСИВУ keyof поверне НЕ ЛИШЕ числові індекси, а й УСІ методи
// й службові властивості з Array.prototype (детально сам список — у
// common/data-structures/array/Array.js) — ЦЕ ЧАСТА ПАСТКА для тих,
// хто очікує keyof масиву = "лише індекси":

const fruitsArray = ["яблуко", "банан", "вишня"];
type FruitsArrayKeys = keyof typeof fruitsArray;
// FruitsArrayKeys — це "length" | "push" | "pop" | ... | number | ...
// (ВЕЛИКИЙ union із методів масиву, А НЕ просто 0 | 1 | 2!)

// ЩОБ ОТРИМАТИ САМЕ ТИП ЕЛЕМЕНТІВ масиву (а не ключі!), використовують
// ІНДЕКСНИЙ доступ через `number`, а НЕ keyof:
type FruitElement = (typeof fruitsArray)[number]; // string (тип ОДНОГО елемента)
const oneFruit: FruitElement = "апельсин"; // ok, це просто string
console.log(oneFruit);

// А для tuple (масиву ФІКСОВАНОЇ довжини — детально в
// typescript/basic-types.ts, п. 5) `[number]`-доступ дає САМЕ union
// РЕАЛЬНИХ типів елементів tuple, що ТОЧНІШЕ:
const responseTuple = [200, "OK"] as const;
type ResponseTupleElement = (typeof responseTuple)[number]; // 200 | "OK"


// ==========================================================================
// 9. typeof НАД ІМПОРТОМ/КЛАСОМ — ТИП "ЕКЗЕМПЛЯРА" VS ТИП "САМОГО КЛАСУ"
// ==========================================================================

class Repository {
  constructor(public name: string) {}
  save(item: string): void {
    console.log(`Збережено "${item}" у репозиторії ${this.name}`);
  }
}

const repo = new Repository("users");
type RepoInstanceType = typeof repo; // Repository (тип КОНКРЕТНОГО екземпляра)
type RepoClassType = typeof Repository; // тип САМОГО КЛАСУ (конструктора) —
                                           // "new (name: string) => Repository"

function createRepo(RepoClass: RepoClassType, name: string): RepoInstanceType {
  return new RepoClass(name); // typeof Repository дозволяє викликати new
}
const anotherRepo = createRepo(Repository, "products");
anotherRepo.save("новий товар");

// ЦЕ ВАЖЛИВА РІЗНИЦЯ: `repo: Repository` (звичайна анотація) означає
// "значення — ЕКЗЕМПЛЯР класу Repository", а `RepoClass: typeof Repository`
// означає "значення — САМ КЛАС (конструктор), який МОЖНА викликати
// через new" — принципово різні речі, які легко сплутати.


// ==========================================================================
// ШПАРГАЛКА
// ==========================================================================

// | Оператор                        | Простір       | Що повертає                                    |
// |-------------------------------------|------------------|------------------------------------------------------|
// | typeof x (у виразі)                | ЗНАЧЕННЯ (JS)  | рядок з назвою типу в рантаймі ("number" тощо)     |
// | typeof x (у позиції типу)          | ТИПИ (TS)      | ТИП значення x, виведений компілятором              |
// | keyof T                             | ТИПИ (TS)      | union усіх імен властивостей типу T                 |
// | typeof Клас (клас, не екземпляр)   | ТИПИ (TS)      | тип КОНСТРУКТОРА (можна new-ити), не екземпляра    |
// | (typeof arr)[number]                | ТИПИ (TS)      | тип ЕЛЕМЕНТА масиву/tuple (а не ключів!)            |


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// - typeof ІСНУЄ у ДВОХ зовсім різних ролях: рантайм-оператор JS
//   (повертає РЯДОК із назвою типу) і TS-оператор у позиції типу
//   (повертає САМ ТИП значення) — розрізняються лише за ПОЗИЦІЄЮ в коді
// - TS typeof дозволяє "витягти" тип із ВЖЕ НАПИСАНОГО значення/функції/
//   класу замість того, щоб описувати цей тип вручну ЗАНОВО — вони
//   НІКОЛИ не розсинхронізуються між собою
// - keyof T — union усіх ІМЕН властивостей об'єктного типу T; ЧАСТО
//   використовується як constraint для generic-параметра
//   (`<T, K extends keyof T>`, детально в generics.ts)
// - typeof + keyof РАЗОМ — найпоширеніший спосіб отримати union
//   ЗНАЧЕНЬ (а не ключів) із enum-подібного об'єкта, оголошеного
//   через `as const`
// - ПАСТКА: keyof МАСИВУ повертає ключі/методи Array.prototype, а
//   НЕ просто числові індекси — для типу ЕЛЕМЕНТА масиву використовуй
//   `(typeof arr)[number]`, а не keyof
// - typeof Клас (без new) дає тип КОНСТРУКТОРА, typeof екземпляр
//   (після new) дає тип самого класу-як-типу-значення — це принципово
//   різні речі, які легко переплутати