// ==========================================================================
// infer — "ЗМІННА ТИПУ" ВСЕРЕДИНІ CONDITIONAL TYPES
// ==========================================================================

// 0. ЗАГАЛЬНА ІДЕЯ
// -----------------------------------------------------
// infer — це ключове слово, яке МОЖНА використати ЛИШЕ всередині
// УМОВИ conditional type (`T extends ... ? ... : ...`, коротко
// згадано в typescript/interface-vs-type.ts, п. 8). Воно ОГОЛОШУЄ
// НОВУ "ЗМІННУ ТИПУ" ПРЯМО ВСЕРЕДИНІ ШАБЛОНУ, якою TS ЗАПОВНЮЄ
// "ДІРКУ" в структурі типу — і ЦЕ ЗНАЧЕННЯ можна ПОТІМ використати
// в ГІЛЦІ true цього ж conditional type.
//
// Найпростіша аналогія — деструктуризація, але НА РІВНІ ТИПІВ, а не
// значень: так само, як `const { x } = point` "витягує" ЗНАЧЕННЯ x
// із ЗМІННОЇ point, `infer U` "витягує" ТИП U із ТИПУ T.


// ==========================================================================
// 1. ЗГАДАЄМО CONDITIONAL TYPES БЕЗ infer (ОСНОВА, НА ЯКІЙ ІНФЕР ПРАЦЮЄ)
// ==========================================================================

type IsString<T> = T extends string ? true : false;
type CheckA = IsString<"текст">; // true
type CheckB = IsString<42>;       // false

// Тут `T extends string` — це ПЕРЕВІРКА "чи T СУМІСНИЙ зі string".
// infer ДОДАЄ ДО ЦЬОГО можливість НЕ ПРОСТО перевірити, а Й
// "ВИТЯГТИ" ЯКУСЬ ЧАСТИНУ T, якщо перевірка пройшла.


// ==========================================================================
// 2. ПЕРШИЙ ПРИКЛАД: "ВИТЯГТИ" ТИП ЕЛЕМЕНТА З МАСИВУ
// ==========================================================================

// Без infer ми ВЖЕ вміємо брати тип елемента масиву через
// `(typeof arr)[number]` (детально в typescript/typeof-and-keyof.ts,
// п. 8) — АЛЕ ЦЕ ПРАЦЮЄ ЛИШЕ для КОНКРЕТНОГО значення (з typeof).
// Якщо ж є GENERIC-ТИП "масив ЧОГОСЬ", і потрібно дістати "ЧОГОСЬ" —
// знадобиться саме infer:

type ElementType<T> = T extends (infer U)[] ? U : never;
//                              ^^^^^^^^^^
//                              "якщо T — це масив ЯКОГОСЬ типу U,
//                               то візьми САМЕ U (а не масив)"

type NumberElement = ElementType<number[]>; // number
type StringElement = ElementType<string[]>; // string
type NotArray = ElementType<boolean>;         // never — boolean НЕ масив, гілка false

const oneNumber: NumberElement = 42;   // ok, просто number
const oneString: StringElement = "ok";  // ok, просто string
console.log(oneNumber, oneString);

// ПОРІВНЯННЯ З `(typeof arr)[number]`:
// - (typeof arr)[number]  — бере тип елемента З РЕАЛЬНОГО значення arr
// - ElementType<T>         — бере тип елемента З БУДЬ-ЯКОГО ТИПУ T,
//                             навіть якщо жодного реального значення немає
//                             (наприклад, T прийшов як generic-параметр іншої функції)


// ==========================================================================
// 3. САМЕ ТАК ПОБУДОВАНИЙ ReturnType<T> (typescript/utility-types.ts, п. 9)
// ==========================================================================

// ReturnType — це ВБУДОВАНИЙ utility type, АЛЕ його "внутрішня"
// реалізація (спрощено, та сама ідея, що й у стандартній бібліотеці
// TS lib.es5.d.ts) виглядає ТОЧНІСІНЬКО так:

type MyReturnType<T extends (...args: never[]) => unknown> = T extends (
  ...args: never[]
) => infer R
  ? R
  : never;
//                                       ^^^^^^^
//                                       "якщо T — функція, що повертає ЩОСЬ R,
//                                        то візьми САМЕ R (тип результату)"

function createPoint(x: number, y: number) {
  return { x, y, magnitude: Math.hypot(x, y) };
}
type MyPoint = MyReturnType<typeof createPoint>; // { x: number; y: number; magnitude: number }
const samplePoint: MyPoint = { x: 3, y: 4, magnitude: 5 };
console.log(samplePoint);

// ТЕПЕР ЗРОЗУМІЛО, ЧОМУ ReturnType/Parameters/Awaited З
// typescript/utility-types.ts "ПРОСТО ПРАЦЮЮТЬ" — усі вони
// ВСЕРЕДИНІ ПОБУДОВАНІ САМЕ НА infer, просто TS дає їх ГОТОВИМИ,
// щоб не писати цей шаблон самостійно щоразу.


// ==========================================================================
// 4. САМЕ ТАК ПОБУДОВАНИЙ Parameters<T> — infer З TUPLE
// ==========================================================================

type MyParameters<T extends (...args: never[]) => unknown> = T extends (
  ...args: infer P
) => unknown
  ? P
  : never;
//                       ^^^^^^^
//                       "візьми ВЕСЬ tuple аргументів П як один тип P"

type CreatePointArgs = MyParameters<typeof createPoint>; // [x: number, y: number]
function callWithLoggedArgs(...args: CreatePointArgs) {
  console.log("викликаємо з аргументами:", args);
  return createPoint(...args);
}
console.log(callWithLoggedArgs(1, 2));


// ==========================================================================
// 5. САМЕ ТАК ПОБУДОВАНИЙ Awaited<T> — infer "ЗАЗИРАЄ ВСЕРЕДИНУ" Promise
// ==========================================================================

type MyAwaited<T> = T extends Promise<infer V> ? V : T;
//                                    ^^^^^^^^
//                                    "якщо T — це Promise ЧОГОСЬ V,
//                                     то візьми САМЕ V (а не Promise)"

async function fetchUserById(id: number) {
  return { id, name: "Завантажений користувач" };
}
type FetchedUser = MyAwaited<ReturnType<typeof fetchUserById>>;
// ReturnType<typeof fetchUserById> тут — Promise<{id, name}>,
// а MyAwaited "розгортає" Promise до { id: number; name: string }

async function useAwaited() {
  const user: FetchedUser = await fetchUserById(1);
  console.log(user.name);
}
useAwaited();

// ЗВЕРНИ УВАГУ: справжній вбудований Awaited<T> РЕКУРСИВНИЙ (розгортає
// НАВІТЬ Promise<Promise<T>>), а MyAwaited вище — СПРОЩЕНА, "поверхнева"
// версія лише для ілюстрації принципу; рекурсію розглянемо в п. 8.


// ==========================================================================
// 6. infer З КІЛЬКОМА КАНДИДАТАМИ — DISTRIBUTIVE CONDITIONAL TYPES
// ==========================================================================

// Якщо conditional type застосувати до UNION-типу, TS ОБЧИСЛЮЄ його
// ОКРЕМО ДЛЯ КОЖНОГО ЧЛЕНА union, а ПОТІМ ОБ'ЄДНУЄ результати назад
// в union — це називається "distributive conditional type":

type ElementOrSelf<T> = T extends (infer U)[] ? U : T;

type Mixed = ElementOrSelf<number[] | string | boolean[]>;
// ОБЧИСЛЮЄТЬСЯ ОКРЕМО для кожного члена union:
//   number[]  extends (infer U)[] ? U : T  →  number
//   string    extends (infer U)[] ? U : T  →  string (не масив, гілка T)
//   boolean[] extends (infer U)[] ? U : T  →  boolean
// РЕЗУЛЬТАТ: number | string | boolean

const mixedValue: Mixed = "просто рядок"; // ok, string — один із варіантів union
console.log(mixedValue);


// ==========================================================================
// 7. КІЛЬКА infer В ОДНІЙ УМОВІ
// ==========================================================================

// Можна "витягти" ОДРАЗУ ДЕКІЛЬКА частин типу за один conditional type:

type FirstAndRest<T> = T extends [infer First, ...infer Rest] ? [First, Rest] : never;

type SplitTuple = FirstAndRest<[string, number, boolean]>;
// [string, [number, boolean]] — First = string, Rest = [number, boolean]

const splitResult: SplitTuple = ["текст", [42, true]];
console.log(splitResult);

// САМЕ ТАКИЙ ШАБЛОН (`[infer First, ...infer Rest]`) ЛЕЖИТЬ В ОСНОВІ
// багатьох "рекурсивних" бібліотечних типів, що обробляють tuple
// поелементно (наприклад, типізація функцій каррінгу).


// ==========================================================================
// 8. РЕКУРСИВНИЙ infer — "РОЗГОРНУТИ" ВКЛАДЕНІСТЬ ПОВНІСТЮ
// ==========================================================================

// conditional type МОЖЕ ПОСИЛАТИСЬ САМ НА СЕБЕ — так виходить
// рекурсія на рівні типів. Класичний приклад — ПОВНЕ "розгортання"
// вкладених масивів (аналог Array.prototype.flat(Infinity) з
// common/data-structures/array/Array.js, розділ 15, але НА РІВНІ ТИПІВ):

type DeepFlatten<T> = T extends (infer U)[] ? DeepFlatten<U> : T;

type Nested = DeepFlatten<number[][][]>; // number — "пройшло" крізь ВСІ три рівні вкладеності
const deepValue: Nested = 42;
console.log(deepValue);

// ПОКРОКОВО, ЯК TS ЦЕ ОБЧИСЛЮЄ:
//   DeepFlatten<number[][][]>
//   → number[][] extends (infer U)[] ? DeepFlatten<U> : T  (U = number[][])
//   → DeepFlatten<number[][]>
//   → DeepFlatten<number[]>
//   → DeepFlatten<number>
//   → number extends (infer U)[] ? ... : T   ← number НЕ масив → гілка T
//   → number (кінцевий результат)


// ==========================================================================
// 9. ЧОМУ infer ПРАЦЮЄ ЛИШЕ ВСЕРЕДИНІ extends — ЦЕ НЕ ВИПАДКОВІСТЬ
// ==========================================================================

// infer ПОТРЕБУЄ "ШАБЛОНУ", З ЯКИМ TS порівнюватиме T, щоб зрозуміти,
// ЯКА САМЕ частина відповідає інфер-змінній — САМЕ conditional type
// (`T extends Шаблон ? ... : ...`) і дає ЦЕЙ шаблон. Поза
// conditional type в infer просто НЕМА "з чим порівнювати":

// type Invalid<T> = infer U; // ❌ 'infer' declarations are only permitted
                                 // in the 'extends' clause of a conditional type.


// ==========================================================================
// 10. ПРАКТИЧНИЙ ПРИКЛАД: ТИП ДЛЯ "РОЗПАКОВКИ" API-ВІДПОВІДІ
// ==========================================================================

// Комбінація infer + discriminated union (typescript/union-and-intersection-types.ts,
// п. 3) — "дістати" тип data З УСПІШНОЇ гілки відповіді API, НЕ
// пишучи цей тип вручну ще раз:

type ApiResult<T> = { status: "success"; data: T } | { status: "error"; message: string };

type ExtractData<T> = T extends { status: "success"; data: infer D } ? D : never;

type UserResult = ApiResult<{ name: string; age: number }>;
type ExtractedUserData = ExtractData<UserResult>; // { name: string; age: number }

function handleSuccess(data: ExtractedUserData) {
  console.log(data.name, data.age);
}
handleSuccess({ name: "Ірина", age: 30 });


// ==========================================================================
// ШПАРГАЛКА
// ==========================================================================

// | Шаблон                                          | Що "витягує" infer                          |
// |------------------------------------------------------|---------------------------------------------------|
// | T extends (infer U)[] ? U : never                   | тип ЕЛЕМЕНТА масиву                              |
// | T extends (...args: never[]) => infer R ? R : never  | тип РЕЗУЛЬТАТУ функції (як ReturnType)          |
// | T extends (...args: infer P) => unknown ? P : never  | tuple АРГУМЕНТІВ функції (як Parameters)        |
// | T extends Promise<infer V> ? V : T                    | тип ЗНАЧЕННЯ всередині Promise (як Awaited)     |
// | T extends [infer First, ...infer Rest] ? ... : never | перший елемент tuple + "решту" окремо           |
// | T extends (infer U)[] ? DeepFlatten<U> : T (рекурсія)| повністю "розгорнутий" тип, без жодної вкладеності |


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// - infer — ключове слово, що ОГОЛОШУЄ нову "змінну типу" ВСЕРЕДИНІ
//   умови conditional type; працює ЛИШЕ там (поза extends — синтаксична помилка)
// - механіка — TS ПОРІВНЮЄ T ІЗ ШАБЛОНОМ, що містить infer U, і ЯКЩО
//   структура збігається — "заповнює" U відповідною частиною T,
//   яку МОЖНА використати в гілці true
// - саме на infer ПОБУДОВАНІ бібліотечні ReturnType/Parameters/Awaited
//   з typescript/utility-types.ts — вони не "магічні", а звичайні
//   conditional types з infer, просто вже готові у стандартній бібліотеці
// - якщо conditional type застосувати до union — TS обчислює його
//   ОКРЕМО для кожного члена й ОБ'ЄДНУЄ результати (distributive
//   conditional types)
// - можна "витягти" КІЛЬКА частин ОДНОЧАСНО (`[infer First, ...infer Rest]`)
// - conditional type МОЖЕ бути РЕКУРСИВНИМ — так реалізують повне
//   "розгортання" вкладеності на рівні типів (аналог flat(Infinity),
//   але для типів, а не значень)
// - типове практичне застосування — "дістати" тип ІЗ ЧАСТИНИ іншого
//   типу (елемент масиву, результат функції, значення з Promise,
//   поле з гілки discriminated union) без дублювання опису вручну