// ==========================================================================
// NARROWING & TYPE GUARDS — ЗВУЖЕННЯ ТИПУ ДО КОНКРЕТНОГО ВАРІАНТА
// ==========================================================================

// 0. ЗАГАЛЬНА ІДЕЯ
// -----------------------------------------------------
// Narrowing (звуження) — процес, коли компілятор ЗМЕНШУЄ можливий
// набір типів змінної на основі коду, який ти написав (перевірка
// typeof, порівняння, оператор in тощо). Type guard — БУДЬ-ЯКИЙ
// вираз, що дозволяє TS звузити тип у ГІЛЦІ коду ПІСЛЯ перевірки.
//
// Ми вже торкались найпростішого narrowing (typeof) у
// typescript/union-and-intersection-types.ts — тут розглянемо ВСІ
// способи звуження систематично, включно з тими, яких там не було.


// ==========================================================================
// 1. typeof NARROWING — ДЛЯ ПРИМІТИВІВ
// ==========================================================================

function formatValue(value: string | number | boolean) {
  if (typeof value === "string") {
    return value.toUpperCase(); // тут value — ТОЧНО string
  }
  if (typeof value === "number") {
    return value.toFixed(2); // тут value — ТОЧНО number
  }
  return value ? "true" : "false"; // те, що лишилось, — ТОЧНО boolean
}
console.log(formatValue("abc"));  // "ABC"
console.log(formatValue(3.14159)); // "3.14"
console.log(formatValue(true));    // "true"

// ВАЖЛИВО: typeof працює ЛИШЕ для примітивів (string/number/boolean/
// bigint/symbol/undefined/function) — для об'єктів typeof ЗАВЖДИ
// повертає "object" (навіть для масивів, null, дат) і НЕ розрізняє
// РІЗНІ форми об'єктів (детально в common/type-coercion.js щодо typeof взагалі).


// ==========================================================================
// 2. TRUTHINESS NARROWING — ЗВУЖЕННЯ ЧЕРЕЗ if(value)
// ==========================================================================

// Проста перевірка "значення truthy" (детально truthy/falsy — у
// common/type-coercion.js, п. 7) ВІДКИДАЄ null/undefined/""/0/NaN/false
// з можливих варіантів усередині гілки:

function printName(name: string | null | undefined) {
  if (name) {
    console.log(name.toUpperCase()); // тут name — ГАРАНТОВАНО string
                                         // (не null, не undefined, не "")
  } else {
    console.log("ім'я не вказано");
  }
}
printName("Марія"); // "МАРІЯ"
printName(null);      // "ім'я не вказано"
printName("");         // "ім'я не вказано" — ПОРОЖНІЙ рядок теж falsy!

// ПАСТКА: truthiness-перевірка ВІДКИДАЄ БІЛЬШЕ, ніж просто null/
// undefined — якщо порожній рядок/0 — ЛЕГІТИМНЕ значення, а не
// "відсутність даних", truthiness-перевірка помилково відфільтрує і їх:
function printCount(count: number | null) {
  if (count) {
    console.log(`Кількість: ${count}`);
  } else {
    console.log("кількість не вказана"); // ❌ АЛЕ якщо count === 0 (легітимний
  }                                         //    нуль!) — потрапить сюди помилково
}
printCount(0); // "кількість не вказана" — імовірно, НЕ те, що очікувалось

// ✅ ПРАВИЛЬНІШЕ для чисел — явна перевірка САМЕ на null/undefined:
function printCountSafe(count: number | null) {
  if (count !== null) {
    console.log(`Кількість: ${count}`); // 0 тепер обробляється коректно
  } else {
    console.log("кількість не вказана");
  }
}
printCountSafe(0); // "Кількість: 0"


// ==========================================================================
// 3. EQUALITY NARROWING — ЗВУЖЕННЯ ЧЕРЕЗ ===, !==, ==, !=
// ==========================================================================

function compareValues(a: string | number, b: string | boolean) {
  if (a === b) {
    // TS звужує ОБИДВІ змінні до типу, СПІЛЬНОГО для union'ів a і b —
    // тут це може бути лише string (єдиний тип, що є в ОБОХ union)
    console.log(a.toUpperCase(), b.toUpperCase());
  }
}
compareValues("текст", "текст");

// == null / != null — ІДІОМАТИЧНИЙ спосіб ОДРАЗУ відкинути і null,
// і undefined (детально пояснено, чому саме == тут доречний, у
// common/type-coercion.js, п. 11):
function greetUser(name: string | null | undefined) {
  if (name != null) {
    console.log(`Привіт, ${name.toUpperCase()}!`); // тут name — ТОЧНО string
                                                        // (== null відкидає ОБИДВА варіанти)
  }
}
greetUser("Іван");   // "Привіт, ІВАН!"
greetUser(null);       // нічого не виведе
greetUser(undefined);  // нічого не виведе


// ==========================================================================
// 4. instanceof NARROWING — ДЛЯ КЛАСІВ
// ==========================================================================

class ValidationError extends Error {
  field: string;
  constructor(field: string, message: string) {
    super(message);
    this.field = field;
  }
}
class NetworkError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

function handleError(error: Error) {
  if (error instanceof ValidationError) {
    console.log(`Помилка валідації поля "${error.field}": ${error.message}`);
  } else if (error instanceof NetworkError) {
    console.log(`Мережева помилка (${error.statusCode}): ${error.message}`);
  } else {
    console.log(`Невідома помилка: ${error.message}`);
  }
}
handleError(new ValidationError("email", "Некоректний формат"));
handleError(new NetworkError(404, "Не знайдено"));


// ==========================================================================
// 5. in NARROWING — ЧИ ІСНУЄ ВЛАСТИВІСТЬ (ДЛЯ ОБ'ЄКТІВ БЕЗ СПІЛЬНОГО ТЕГУ)
// ==========================================================================

// Оператор in перевіряє, чи ІСНУЄ властивість на об'єкті — корисно
// для union-типів БЕЗ явного "дискримінантного" поля, показаного
// в п. 6 нижче:

type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim(); // тут TS звузив animal до Fish
  } else {
    animal.fly(); // тут — до Bird
  }
}
move({ swim: () => console.log("плаває") }); // "плаває"
move({ fly: () => console.log("летить") });    // "летить"


// ==========================================================================
// 6. DISCRIMINATED UNION NARROWING — НАЙПОШИРЕНІШИЙ ПРАКТИЧНИЙ ПАТЕРН
// ==========================================================================

// Показано вже в union-and-intersection-types.ts — тут повторюємо
// саме як ТЕХНІКУ narrowing, з фокусом на ІДЕЮ "тегованого" поля:

type LoadingState = { status: "loading" };
type SuccessState = { status: "success"; data: string[] };
type ErrorState = { status: "error"; error: string };
type FetchState = LoadingState | SuccessState | ErrorState;

function renderState(state: FetchState): string {
  switch (state.status) { // "status" — СПІЛЬНЕ, "тегуюче" поле для всіх трьох
    case "loading":
      return "Завантаження...";
    case "success":
      return `Дані: ${state.data.join(", ")}`; // тут TS ЗНАЄ про data
    case "error":
      return `Помилка: ${state.error}`; // тут TS ЗНАЄ про error
  }
}
console.log(renderState({ status: "loading" }));
console.log(renderState({ status: "success", data: ["a", "b"] }));
console.log(renderState({ status: "error", error: "щось зламалось" }));


// ==========================================================================
// 7. CUSTOM TYPE GUARDS — ФУНКЦІЇ-ПРЕДИКАТИ З `value is Type`
// ==========================================================================

// Якщо ЛОГІКА перевірки складна і потрібна в БАГАТЬОХ місцях — можна
// написати ВЛАСНУ функцію-перевірку, тип повернення якої записується
// ЯК `параметр is Тип` — це "обіцянка" компілятору: "якщо ця функція
// повернула true, вважай параметр саме цим типом":

type Cat = { kind: "cat"; meow: () => void };
type Dog = { kind: "dog"; bark: () => void };

function isCat(animal: Cat | Dog): animal is Cat { // ← custom type guard
  return animal.kind === "cat";
}

function makeSound(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow(); // TS ДОВІРЯЄ isCat() і звужує до Cat
  } else {
    animal.bark(); // а тут — до Dog
  }
}
makeSound({ kind: "cat", meow: () => console.log("Мяу!") }); // "Мяу!"
makeSound({ kind: "dog", bark: () => console.log("Гав!") });   // "Гав!"

// БЕЗ `is Cat` (просто `: boolean`) TS НЕ ЗМІГ БИ звузити тип після
// викликаю isCat(animal) — функція повернула б звичайний boolean,
// і компілятор не пов'язав би результат ІЗ ТИПОМ параметра.

// ПРАКТИЧНЕ ЗАСТОСУВАННЯ — перевірка "чи це масив рядків" для
// довільних вхідних даних (типовий кейс парсингу JSON/API-відповіді):
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function processUnknownInput(input: unknown) {
  if (isStringArray(input)) {
    console.log(input.join(", ")); // тут TS ЗНАЄ, що input — string[]
  } else {
    console.log("некоректний формат вхідних даних");
  }
}
processUnknownInput(["a", "b", "c"]); // "a, b, c"
processUnknownInput([1, 2, 3]);         // "некоректний формат вхідних даних"


// ==========================================================================
// 8. ASSERTION FUNCTIONS — `asserts value is Type` (КИДАЮТЬ ПОМИЛКУ, А НЕ boolean)
// ==========================================================================

// Схожі на custom type guards, АЛЕ НЕ повертають boolean — замість
// цього ВОНИ КИДАЮТЬ ПОМИЛКУ, якщо умова не виконана. Після виклику
// такої функції (без if!) TS ЗВУЖУЄ тип на ВЕСЬ ЗАЛИШОК коду нижче:

function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new TypeError("Очікувався рядок");
  }
}

function processValue(value: unknown) {
  assertIsString(value); // якщо тут НЕ кинуло помилку — value ТОЧНО string
  console.log(value.toUpperCase()); // ✅ без if — TS вже звужив тип ВИЩЕ
}
processValue("текст"); // "ТЕКСТ"
// processValue(42);      // кине TypeError під час виконання

// РІЗНИЦЯ з custom type guard (`is`): `is` звужує тип ЛИШЕ УСЕРЕДИНІ
// if-гілки; `asserts` звужує тип для ВСЬОГО КОДУ ПІСЛЯ виклику,
// без потреби обгортати в if.


// ==========================================================================
// 9. НЕОЧЕВИДНА ПАСТКА: NARROWING "ЗАБУВАЄТЬСЯ" ПІСЛЯ ВИКЛИКУ ФУНКЦІЇ
// ==========================================================================

// TS звужує тип на основі ПОТОЧНОГО, статично видимого коду — якщо
// МІЖ перевіркою і використанням відбувається виклик ЗВИЧАЙНОЇ
// функції (яку TS не може "прочитати" наскрізь), звуження МОЖЕ
// "злетіти", ЯКЩО значення зберігалось у ЗМІННІЙ, що технічно могла
// змінитись (mutable let, а не const):

function maybeChangesValue() {
  /* якась логіка, що теоретично МОЖЕ (з точки зору типів) змінити
     зовнішні змінні через closure — компілятор не завжди може довести,
     що це не так */
}

function demoNarrowingLoss(value: string | number) {
  if (typeof value === "string") {
    maybeChangesValue();
    console.log(value.toUpperCase()); // тут ЗАЗВИЧАЙ усе ще ОК для
                                          // ПАРАМЕТРІВ функції (TS достатньо
                                          // "довіряє" в простих випадках),
                                          // АЛЕ для властивостей об'єкта
                                          // (obj.prop) звуження ЧАСТО
                                          // "злітає" саме після будь-якого
                                          // виклику функції між перевіркою
                                          // й використанням — див. нижче
  }
}

// ✅ НАДІЙНІШИЙ ПАТЕРН для властивостей об'єкта — скопіювати значення
// в ЛОКАЛЬНУ const ПЕРЕД перевіркою, а не звужувати сам obj.prop:
function demoSafePattern(obj: { value: string | number }) {
  const value = obj.value; // копія в const — звуження НЕ "злетить"
  if (typeof value === "string") {
    console.log(value.toUpperCase()); // надійно звужено на весь блок
  }
}
demoSafePattern({ value: "текст" });


// ==========================================================================
// ШПАРГАЛКА: ЯКИЙ СПОСІБ NARROWING ОБРАТИ
// ==========================================================================

// | Ситуація                                          | Спосіб звуження           |
// |-------------------------------------------------------|--------------------------------|
// | union із примітивів (string \| number \| boolean)   | typeof                        |
// | потрібно відкинути null/undefined                    | != null / !== null            |
// | union з КЛАСІВ                                        | instanceof                    |
// | union об'єктів БЕЗ спільного поля-тегу               | in (перевірка властивості)    |
// | union об'єктів ІЗ спільним полем-тегом (найкраще!)   | discriminated union + switch  |
// | складна власна логіка перевірки, потрібна БАГАТО РАЗ | custom type guard (`is`)      |
// | треба "кинути" помилку й ЗВУЖИТИ решту коду ОДРАЗУ   | assertion function (`asserts`)|


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// - narrowing — процес, коли TS ЗВУЖУЄ union-тип до конкретного
//   варіанта всередині гілки коду на основі перевірки, яку ти написав
// - typeof — для примітивів; truthiness (if(value)) — простий, але
//   МОЖЕ помилково відкинути легітимні falsy-значення (0, "")
// - == null / != null — ідіоматичний спосіб ОДРАЗУ відкинути і null,
//   і undefined однією перевіркою
// - instanceof — для union із класів; in — для union об'єктів БЕЗ
//   спільного поля-мітки
// - discriminated union (спільне літеральне поле, напр. `status`) +
//   switch — найнадійніший і найпоширеніший практичний патерн,
//   компілятор сам простежує ВИЧЕРПНІСТЬ варіантів
// - custom type guard (`value is Type`) — власна функція-перевірка,
//   яку МОЖНА повторно використовувати; assertion function
//   (`asserts value is Type`) — те саме, але кидає помилку й звужує
//   тип на ВЕСЬ код ПІСЛЯ виклику, без if
// - звуження властивостей об'єкта (obj.prop) МЕНШ надійне за звуження
//   локальних змінних — між перевіркою й використанням безпечніше
//   скопіювати значення в окрему const