// ==========================================================================
// GENERICS — ТИПИ, ПАРАМЕТРИЗОВАНІ ІНШИМИ ТИПАМИ
// ==========================================================================

// 0. ЗАГАЛЬНА ІДЕЯ
// -----------------------------------------------------
// Generic — це спосіб написати функцію/тип/клас, який працює з
// БУДЬ-ЯКИМ типом, але ЗБЕРІГАЄ ЗВ'ЯЗОК між типом ВХОДУ і типом
// ВИХОДУ. Це РІШЕННЯ ПРОБЛЕМИ, яка виникає, якщо намагатись
// "узагальнити" функцію через any: any МОЖЕ прийняти будь-що, АЛЕ
// повністю ВТРАЧАЄ інформацію про те, ЯКИЙ САМЕ тип був переданий.
//
// Generic-параметр пишеться в КУТОВИХ ДУЖКАХ `<T>` одразу ПІСЛЯ
// імені функції/типу/класу — за конвенцією ОДНА велика літера
// (T, U, K, V), хоча можна писати й повне слово.


// ==========================================================================
// 1. ПРОБЛЕМА, ЯКУ ВИРІШУЮТЬ GENERICS
// ==========================================================================

// ❌ Варіант 1: конкретний тип — працює ЛИШЕ з number, для рядків
// доведеться писати ОКРЕМУ, майже ідентичну функцію:
function firstNumber(arr: number[]): number {
  return arr[0];
}

// ❌ Варіант 2: any — "працює з усім", АЛЕ втрачає ТИП результату:
function firstAny(arr: any[]): any {
  return arr[0];
}
const resultAny = firstAny(["a", "b", "c"]);
// resultAny.toUpperCase(); // TS НЕ ЗНАЄ, що це рядок — жодної підказки
                              // й жодного захисту, компілятор мовчить

// ✅ Варіант 3: generic — ОДНА функція, що працює з БУДЬ-ЯКИМ типом,
// АЛЕ ЗБЕРІГАЄ, ЯКИЙ САМЕ тип був переданий:
function first<T>(arr: T[]): T {
  return arr[0];
}
const firstString = first(["a", "b", "c"]); // T виведено як string
console.log(firstString.toUpperCase());       // ✅ TS ЗНАЄ, що це string — автодоповнення й перевірка працюють

const firstNum = first([1, 2, 3]); // T виведено як number
console.log(firstNum.toFixed(2));    // ✅ TS ЗНАЄ, що це number


// ==========================================================================
// 2. GENERIC-ФУНКЦІЇ: T ВИВОДИТЬСЯ АВТОМАТИЧНО З АРГУМЕНТУ
// ==========================================================================

// У БІЛЬШОСТІ випадків T НЕ ПОТРІБНО вказувати вручну — компілятор
// сам виводить його з переданого аргументу (той самий принцип type
// inference, що й у typescript/basic-types.ts):

function wrapInArray<T>(value: T): T[] {
  return [value];
}
const wrappedNumbers = wrapInArray(42);      // T виведено як number → number[]
const wrappedStrings = wrapInArray("текст"); // T виведено як string → string[]
console.log(wrappedNumbers, wrappedStrings);

// ЯВНА ВКАЗІВКА типу (коли вивід неможливий або потрібно ЗМІНИТИ
// висновок компілятора) — той самий синтаксис `<T>` при ВИКЛИКУ:
const explicitCall = wrapInArray<string | number>(42); // (string | number)[]
console.log(explicitCall);


// ==========================================================================
// 3. КІЛЬКА GENERIC-ПАРАМЕТРІВ ОДНОЧАСНО
// ==========================================================================

// Функція МОЖЕ мати СКІЛЬКИ УГОДНО generic-параметрів — кожен
// незалежно виводиться зі свого аргументу:

function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}
const idNamePair = pair(1, "Олег"); // [number, string]
console.log(idNamePair);

// ТИПОВИЙ ПРИКЛАД — функція злиття двох об'єктів (аналог
// Object.assign, але з ЗБЕРЕЖЕННЯМ типів ОБОХ аргументів у типі
// результату):
function merge<A, B>(a: A, b: B): A & B { // A & B — intersection,
                                             // детально в union-and-intersection-types.ts
  return { ...a, ...b };
}
const mergedConfig = merge({ name: "Олег" }, { age: 30 });
console.log(mergedConfig.name, mergedConfig.age); // TS знає ОБИДВА поля


// ==========================================================================
// 4. GENERIC CONSTRAINTS (extends) — ОБМЕЖЕННЯ, ЩО T МАЄ ВМІТИ
// ==========================================================================

// Без обмежень T може бути БУДЬ-ЯКИМ типом — а отже, компілятор
// дозволяє звертатись ЛИШЕ до того, що є в АБСОЛЮТНО ВСІХ типів
// (наприклад, властивостей із Object.prototype, і то не завжди):

// function getLength<T>(value: T): number {
//   return value.length; // ❌ Property 'length' does not exist on type 'T'.
//                            (T міг бути числом, у якого немає .length)
// }

// ✅ extends ОБМЕЖУЄ T до типів, що МАЮТЬ конкретну властивість —
// тут "має length: number" (не плутати з extends у класах чи
// interface — тут це ОБМЕЖЕННЯ, а не наслідування):
function getLength<T extends { length: number }>(value: T): number {
  return value.length; // ✅ тепер TS ЗНАЄ, що value ТОЧНО має .length
}
console.log(getLength("рядок"));        // 5 — у string є .length
console.log(getLength([1, 2, 3, 4]));    // 4 — у масиву є .length
// console.log(getLength(42));            // ❌ Argument of type 'number' is not
                                             // assignable to parameter of type '{ length: number }'.


// 5. ОБМЕЖЕННЯ ДО КОНКРЕТНОГО СОЮЗУ ТИПІВ
// -----------------------------------------------------
function double<T extends number | string>(value: T): T {
  if (typeof value === "number") return (value * 2) as T;
  return ((value as string) + (value as string)) as T; // as — type assertion, детально в окремому файлі
}
console.log(double(5));      // 10
console.log(double("ab"));   // "abab"


// ==========================================================================
// 6. keyof + GENERIC — ТИПОБЕЗПЕЧНИЙ ДОСТУП ДО ВЛАСТИВОСТЕЙ ОБ'ЄКТА
// ==========================================================================

// keyof T — це тип-union із УСІХ ІМЕН властивостей T (детально keyof
// як окрему тему розглянемо пізніше, тут — лише в контексті generics,
// бо це НАЙПОШИРЕНІШЕ практичне поєднання).

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const userForGetProp = { name: "Марія", age: 28, email: "maria@example.com" };
const nameValue = getProperty(userForGetProp, "name"); // TS ЗНАЄ: тип — string
const ageValue = getProperty(userForGetProp, "age");     // TS ЗНАЄ: тип — number
console.log(nameValue.toUpperCase(), ageValue.toFixed(0));

// getProperty(userForGetProp, "phone"); // ❌ Argument of type '"phone"' is not
                                            // assignable to parameter of type
                                            // '"name" | "age" | "email"'.
// ЦЕ ОСНОВНА ПЕРЕВАГА: неможливо звернутись до властивості, якої НЕ
// ІСНУЄ на об'єкті — помилка ловиться ЩЕ ДО запуску, а НЕ як undefined
// у рантаймі (те, що сталося б у ЧИСТОМУ JS: userForGetProp.phone === undefined,
// без жодного попередження).


// ==========================================================================
// 7. GENERIC INTERFACES / TYPE ALIASES
// ==========================================================================

// Так само, як функції, interface і type МОЖУТЬ бути параметризовані:

interface Box<T> {
  value: T;
}
const numberBox: Box<number> = { value: 42 };
const stringBox: Box<string> = { value: "текст" };
console.log(numberBox.value, stringBox.value);

// ДУЖЕ ПОШИРЕНИЙ РЕАЛЬНИЙ ПРИКЛАД — типізована "обгортка" для
// відповіді API (той самий принцип discriminated union із
// union-and-intersection-types.ts, тепер параметризований):
type ApiResult<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string };

function handleUserResult(result: ApiResult<{ name: string; age: number }>) {
  if (result.status === "success") {
    console.log(result.data.name, result.data.age); // TS знає ФОРМУ data
  } else {
    console.log("Помилка:", result.message);
  }
}
handleUserResult({ status: "success", data: { name: "Іван", age: 40 } });


// ==========================================================================
// 8. GENERIC CLASSES
// ==========================================================================

class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }
  pop(): T | undefined {
    return this.items.pop();
  }
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
  get size(): number {
    return this.items.length;
  }
}

const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
numberStack.push(3);
console.log(numberStack.pop());  // 3
console.log(numberStack.size);   // 2

const stringStack = new Stack<string>();
stringStack.push("a");
stringStack.push("b");
console.log(stringStack.peek()); // "b"

// У ЧИСТОМУ JS клас Stack був би АБСОЛЮТНО ТИМ САМИМ кодом (типів
// немає), АЛЕ НІЧОГО НЕ ЗАВАЖАЛО Б випадково зробити
// numberStack.push("текст") — помилка виявилась би ЛИШЕ там, де
// результат реально зламав би логіку, а не в місці самої помилки.


// ==========================================================================
// 9. DEFAULT TYPE PARAMETERS — ТИП "ЗА ЗАМОВЧУВАННЯМ" ДЛЯ GENERIC
// ==========================================================================

// Так само, як у параметрів функцій можуть бути дефолтні ЗНАЧЕННЯ,
// у generic-параметрів МОЖУТЬ бути дефолтні ТИПИ — якщо конкретний
// тип НЕ вказано явно й НЕМА звідки його вивести:

interface Container<T = string> {
  value: T;
}
const defaultContainer: Container = { value: "текст" }; // T = string (за замовчуванням)
const explicitContainer: Container<number> = { value: 42 }; // T явно вказано як number
console.log(defaultContainer.value, explicitContainer.value);


// ==========================================================================
// 10. GENERIC-ФУНКЦІЯ, ЩО ПОВЕРТАЄ ІНШУ ФУНКЦІЮ (ЗБЕРЕЖЕННЯ ТИПІВ КРІЗЬ КОЛБЕКИ)
// ==========================================================================

// Дуже поширений реальний патерн — фабрика функцій-валідаторів/
// трансформаторів, де важливо, щоб ТИП ВХОДУ й ТИП ВИХОДУ лишались
// пов'язаними навіть крізь "прошарок" функції вищого порядку:

function createArrayValidator<T>(predicate: (item: T) => boolean) {
  return function validate(items: T[]): T[] {
    return items.filter(predicate);
  };
}

const isPositive = createArrayValidator<number>((n) => n > 0);
console.log(isPositive([1, -2, 3, -4, 5])); // [1, 3, 5]

const isNonEmpty = createArrayValidator<string>((s) => s.length > 0);
console.log(isNonEmpty(["a", "", "b", ""])); // ["a", "b"]


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// - generic (`<T>`) — параметризація типу: функція/interface/type/
//   клас працює з БУДЬ-ЯКИМ типом, АЛЕ зберігає зв'язок між типом
//   входу й типом виходу — на відміну від any, який цей зв'язок
//   повністю втрачає
// - T переважно ВИВОДИТЬСЯ автоматично з аргументу (type inference);
//   явна вказівка `<Тип>` при виклику потрібна рідко
// - можна мати кілька generic-параметрів одночасно (`<K, V>`)
// - `extends` у generic-контексті — ОБМЕЖЕННЯ ("T має бути хоча б
//   таким"), не наслідування; дозволяє звертатись лише до того, що
//   ГАРАНТОВАНО є в усіх допустимих T
// - `<T, K extends keyof T>` — типобезпечний доступ до властивостей
//   об'єкта: неможливо звернутись до неіснуючого ключа, помилка
//   ловиться на етапі компіляції
// - generic interface/type/class — той самий принцип параметризації,
//   застосований до опису форми даних чи структури класу
// - default type parameters (`<T = string>`) — тип "за замовчуванням",
//   якщо конкретний не вказано й нема звідки вивести
// - головна практична вигода: ОДНА функція/клас/тип замінює БАГАТО
//   майже ідентичних, типізованих під кожен конкретний випадок
//   окремо — без втрати перевірки типів, яку дав би any