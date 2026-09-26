// ==========================================================================
// CONST ASSERTIONS (`as const`) — "ЗАМОРОЗКА" ТИПУ ДО НАЙВУЖЧОГО ВАРІАНТА
// ==========================================================================

// 0. ЗАГАЛЬНА ІДЕЯ
// -----------------------------------------------------
// `as const` — це ІНСТРУКЦІЯ компілятору: "виведи для цього значення
// НАЙВУЖЧИЙ, НАЙКОНКРЕТНІШИЙ можливий тип, а НЕ загальний". Без неї
// TS ЗАЗВИЧАЙ "розширює" (widening) конкретні літерали до їхніх
// загальних типів (string, number) — бо припускає, що змінна МОЖЕ
// бути ПЕРЕПРИЗНАЧЕНА пізніше. `as const` вимикає це розширення.
//
// Це НЕ ПОВ'ЯЗАНО з ключовим словом const (яке забороняє
// ПЕРЕПРИЗНАЧЕННЯ змінної в JS, детально в common/variables-and-execution-context/const.js) —
// `as const` — ЦЕ ОКРЕМА, TS-специфічна конструкція для ТИПІВ, хоча
// назва навмисно перегукується з const.


// ==========================================================================
// 1. TYPE WIDENING — ЧОМУ TS "РОЗШИРЮЄ" ТИПИ ЗА ЗАМОВЧУВАННЯМ
// ==========================================================================

let mutableString = "привіт"; // TS виводить ШИРОКИЙ тип: string (НЕ "привіт")
mutableString = "до побачення"; // ok — рушій ЗАЗДАЛЕГІДЬ "передбачив",
                                    // що let МОЖНА перепризначити

const constString = "привіт"; // а тут TS виводить ВУЗЬКИЙ тип: "привіт" (літерал!)
// constString = "до побачення"; // ❌ і сама JS-помилка (const), і типова помилка

// ЦЕ ЛОГІЧНО для ЗМІННИХ (let/var — ШИРОКИЙ тип, const — ВУЗЬКИЙ),
// АЛЕ ВСЕРЕДИНІ ОБ'ЄКТІВ І МАСИВІВ TS "РОЗШИРЮЄ" типи властивостей
// НЕЗАЛЕЖНО від того, const це чи let — САМЕ ЦЕ й вирішує as const:

const pointWithoutAsConst = { x: 10, y: 20 };
// тип pointWithoutAsConst — { x: number; y: number }, а НЕ { x: 10; y: 20 } —
// хоча САМА ЗМІННА оголошена через const! Причина: TS вважає, що
// pointWithoutAsConst.x МОЖЕ бути ЗМІНЕНИЙ пізніше (const захищає
// лише BINDING змінної, а НЕ вміст об'єкта — детально в
// common/data-structures/Object/Object.js, розділ про const vs freeze):
pointWithoutAsConst.x = 999; // ok — властивість об'єкта МУТАБЕЛЬНА,
                                 // тому TS і не звужував тип до "10"


// ==========================================================================
// 2. `as const` НА ОБ'ЄКТІ — ФІКСУЄ І ТИПИ ВЛАСТИВОСТЕЙ, І readonly
// ==========================================================================

const pointWithAsConst = { x: 10, y: 20 } as const;
// тип pointWithAsConst — { readonly x: 10; readonly y: 20 } —
// КОНКРЕТНІ ЛІТЕРАЛИ, А НЕ number! І readonly, а не мутабельні!

// pointWithAsConst.x = 999; // ❌ Cannot assign to 'x' because it is a
                                // read-only property.

console.log(pointWithAsConst.x); // 10 — тип ТОЧНО 10, не "будь-яке число"

// ПОРІВНЯННЯ ДВОХ ТИПІВ НАОЧНО:
function acceptsExactTen(value: 10) {
  console.log(value);
}
acceptsExactTen(pointWithAsConst.x); // ✅ тип ТОЧНО 10 — підходить
// acceptsExactTen(pointWithoutAsConst.x); // ❌ Argument of type 'number'
                                              // is not assignable to
                                              // parameter of type '10'.


// ==========================================================================
// 3. `as const` НА МАСИВІ — ЗВИЧАЙНИЙ МАСИВ СТАЄ READONLY TUPLE
// ==========================================================================

const arrWithoutAsConst = [1, 2, 3];
// тип: number[] — звичайний, мутабельний масив
arrWithoutAsConst.push(4); // ok, це просто number[]

const arrWithAsConst = [1, 2, 3] as const;
// тип: readonly [1, 2, 3] — READONLY TUPLE з КОНКРЕТНИМИ літералами!
// arrWithAsConst.push(4); // ❌ Property 'push' does not exist on type
                             // 'readonly [1, 2, 3]' (push мутує, тут заборонено)
// arrWithAsConst[0] = 999; // ❌ Cannot assign to '0' because it is a
                              // read-only property.

console.log(arrWithAsConst); // [1, 2, 3]

// ЦЕ Й ПОЯСНЮЄ трюк `(typeof responseTuple)[number]` із
// typescript/typeof-and-keyof.ts, п. 8 — САМЕ as const перетворює
// звичайний масив на tuple, з якого можна "витягти" union КОНКРЕТНИХ
// значень, а не просто "widened" number/string.


// ==========================================================================
// 4. НАЙПОШИРЕНІШЕ ЗАСТОСУВАННЯ: ЗАМІННИК enum БЕЗ РАНТАЙМ-КОДУ
// ==========================================================================

// Класична проблема: без as const літеральний union доводиться
// оголошувати ДВІЧІ — один раз як РЯДКОВІ значення (для рантайму),
// і ще раз як ТИП (для перевірки) — з ризиком, що вони РОЗІЙДУТЬСЯ:

// ❌ БЕЗ as const — TS "розширює" значення властивостей до string,
// і союз конкретних значень довелось би писати ОКРЕМО, вручну:
const DirectionsWidened = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
};
// typeof DirectionsWidened.UP тут — просто string, а НЕ "up"
function moveWidened(direction: string) { // ← довелось узяти "широкий" string,
  console.log(`рух: ${direction}`);         //    бо конкретики звідси не витягти
}
moveWidened("будь-що завгодно"); // ❌ жодної помилки — string приймає ВСЕ

// ✅ З as const — ТОЧНІ літерали автоматично, БЕЗ дублювання опису:
const Directions = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
} as const;

type Direction = (typeof Directions)[keyof typeof Directions]; // "up" | "down" | "left" | "right"
// (детальний розбір ЦІЄЇ конструкції — у typescript/typeof-and-keyof.ts, п. 7)

function move(direction: Direction) {
  console.log(`рух: ${direction}`);
}
move(Directions.UP); // ok
// move("будь-що завгодно"); // ❌ Argument of type '"будь-що завгодно"' is not
                                // assignable to parameter of type 'Direction'.

// ПЕРЕВАГА над справжнім enum (TypeScript enum — окрема тема): цей
// об'єкт — ЗВИЧАЙНИЙ JS-об'єкт, БЕЗ додаткового згенерованого коду
// в рантаймі (enum компілюється в окрему функцію-обгортку; детально
// порівняння — в майбутньому файлі про enums).


// ==========================================================================
// 5. `as const` НА РЯДКОВОМУ/ЧИСЛОВОМУ ЛІТЕРАЛІ — "ЗАФІКСУВАТИ" ТОЧНЕ ЗНАЧЕННЯ
// ==========================================================================

// Рідше застосовується напряму до примітива, АЛЕ корисно розуміти:
let widenedLiteral = "GET"; // тип: string
let narrowedLiteral = "GET" as const; // тип: "GET" (буквально ЦЕ значення)

function sendRequest(method: "GET" | "POST") {
  console.log(`Метод: ${method}`);
}
// sendRequest(widenedLiteral); // ❌ Argument of type 'string' is not
                                    // assignable to parameter of type '"GET" | "POST"'.
sendRequest(narrowedLiteral); // ✅ тип точно "GET" — підходить


// ==========================================================================
// 6. ГЛИБИНА as const — ЗАСТОСОВУЄТЬСЯ РЕКУРСИВНО, ДО ВСІХ РІВНІВ ВКЛАДЕНОСТІ
// ==========================================================================

const nestedConfig = {
  server: {
    host: "localhost",
    port: 8080,
  },
  features: ["auth", "logging"],
} as const;

// УСІ рівні стали readonly й НАЙВУЖЧИМИ:
// nestedConfig.server.port = 9090; // ❌ readonly навіть на ВКЛАДЕНОМУ рівні
// nestedConfig.features.push("cache"); // ❌ readonly-tuple, .push відсутній

type FeatureName = (typeof nestedConfig.features)[number]; // "auth" | "logging"
const feature: FeatureName = "auth"; // ok
console.log(feature);


// ==========================================================================
// 7. `as const` VS Readonly<T> / ReadonlyArray<T> — ЧИМ ВІДРІЗНЯЄТЬСЯ
// ==========================================================================

// Readonly<T> (детально в typescript/utility-types.ts) БЕРЕ ВЖЕ
// ІСНУЮЧИЙ тип T і робить його поля readonly — АЛЕ НЕ звужує самі
// ТИПИ значень (number лишається number, а НЕ конкретним літералом):

interface Point3D {
  x: number;
  y: number;
}
const readonlyViaUtility: Readonly<Point3D> = { x: 10, y: 20 };
// тип x тут — ЛИШЕ readonly number, БУДЬ-ЯКЕ число підійшло б при створенні:
const anotherReadonly: Readonly<Point3D> = { x: 999, y: -1 }; // ok, число будь-яке

// as const, навпаки, і РОБИТЬ readonly, І звужує ЗНАЧЕННЯ до
// КОНКРЕТНИХ ЛІТЕРАЛІВ одночасно — це ВІДМІННІСТЬ, яку часто
// пропускають:
const literalPoint = { x: 10, y: 20 } as const;
// тип x тут — САМЕ 10 (readonly 10), а НЕ "readonly будь-яке число"

// ПРАВИЛО ВИБОРУ: Readonly<T> — коли ВАЖЛИВА лише незмінність, а
// конкретні значення можуть бути БУДЬ-ЯКИМИ (типова структура даних);
// as const — коли важливо ЗАФІКСУВАТИ САМЕ ЦІ значення (константи,
// enum-подібні об'єкти, конфігурації для literal union).


// ==========================================================================
// 8. ПАСТКА: as const НЕ ЗАХИЩАЄ В РАНТАЙМІ (ТАК САМО, ЯК Readonly<T>)
// ==========================================================================

// Так само, як Readonly<T> (детально в typescript/utility-types.ts,
// п. 3), as const — ЦЕ ЛИШЕ COMPILE-TIME перевірка. Для СПРАВЖНЬОГО
// захисту від мутації В РАНТАЙМІ потрібен Object.freeze() (детально
// в common/data-structures/Object/Object.js):

const compileTimeOnly = { value: 1 } as const;
function unsafeMutation(obj: Record<string, unknown>) {
  obj.value = 999; // TS тут НЕ бачить конфлікту — obj тут ІНШИЙ, ширший тип
}
unsafeMutation(compileTimeOnly);
console.log(compileTimeOnly.value); // 999 — as const НЕ ЗАХИСТИВ у рантаймі!

// ДЛЯ РЕАЛЬНОГО, РАНТАЙМ-НЕЗМІННОГО значення поєднують ОБИДВА підходи:
const trulyFrozen = Object.freeze({ value: 1 } as const);
// тепер є і compile-time перевірка (readonly + літеральний тип), і
// реальний рантайм-захист (Object.freeze)


// ==========================================================================
// ШПАРГАЛКА
// ==========================================================================

// | Запис                          | Тип властивості x при { x: 10 }     | Мутація дозволена?          |
// |------------------------------------|------------------------------------------|-----------------------------------|
// | let obj = { x: 10 }                | number                                  | так (і сама змінна, і поле)      |
// | const obj = { x: 10 }              | number (!)                              | поле — так, ЗМІННА — ні         |
// | const obj = { x: 10 } as const     | 10 (літерал)                            | ні (readonly на compile-time)   |
// | const obj: Readonly<{x:number}> = {x:10} | number (widened)                 | ні (readonly, але тип широкий)   |
// | Object.freeze({ x: 10 } as const)   | 10 (літерал)                            | ні НАВІТЬ У РАНТАЙМІ             |


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// - за замовчуванням TS "розширює" (widening) конкретні літерали до
//   загальних типів (string/number) усередині об'єктів і масивів —
//   НАВІТЬ якщо сама змінна оголошена через const (const захищає
//   лише BINDING змінної, а не типи властивостей усередині)
// - `as const` вимикає це розширення: властивості об'єкта стають
//   readonly з НАЙВУЖЧИМ (літеральним) типом; масив стає readonly
//   tuple із конкретними значеннями на кожній позиції
// - працює РЕКУРСИВНО — усі рівні вкладеності об'єкта/масиву
// - найпоширеніше застосування: enum-подібний об'єкт БЕЗ додаткового
//   згенерованого рантайм-коду, у зв'язці з `(typeof obj)[keyof typeof obj]`
//   (детально ця конструкція — в typescript/typeof-and-keyof.ts)
// - відрізняється від Readonly<T>: as const ОДНОЧАСНО і робить
//   readonly, І звужує самі значення до літералів; Readonly<T> лише
//   додає readonly, залишаючи типи значень широкими
// - як і Readonly<T>, `as const` — ЛИШЕ compile-time; для реального
//   рантайм-захисту від мутації потрібен Object.freeze(), і їх
//   зазвичай комбінують: `Object.freeze({...} as const)`