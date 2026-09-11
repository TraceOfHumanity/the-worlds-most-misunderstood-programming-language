// ==========================================================================
// UTILITY TYPES — ВБУДОВАНІ ГЕНЕРИКИ ДЛЯ ТРАНСФОРМАЦІЇ ІСНУЮЧИХ ТИПІВ
// ==========================================================================

// 0. ЗАГАЛЬНА ІДЕЯ
// -----------------------------------------------------
// Utility types — це ГОТОВІ, вбудовані в TypeScript generic-типи
// (детально механіка generics — у typescript/generics.ts), які
// БЕРУТЬ вже існуючий тип і ПОВЕРТАЮТЬ ЙОГО ТРАНСФОРМОВАНУ ВЕРСІЮ —
// без потреби переписувати структуру вручну. Більшість із них
// побудовані на MAPPED TYPES (перебір усіх ключів існуючого типу за
// шаблоном) і CONDITIONAL TYPES (тип, що залежить від умови) —
// коротко торкались цього в typescript/interface-vs-type.ts, п. 8.

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}


// ==========================================================================
// 1. Partial<T> — УСІ ПОЛЯ СТАЮТЬ НЕОБОВ'ЯЗКОВИМИ
// ==========================================================================

// Partial<T> перетворює КОЖНЕ поле T на `поле?: Тип` — зручно для
// "часткового оновлення" об'єкта (patch-подібні операції):

function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates };
}

const existingUser: User = { id: 1, name: "Олег", email: "oleg@example.com", age: 30 };
const updatedUser = updateUser(existingUser, { age: 31 }); // можна передати ЛИШЕ те, що змінюється
console.log(updatedUser);

// updateUser(existingUser, { id: "abc" }); // ❌ Type 'string' is not assignable to type 'number | undefined'.

// У ЧИСТОМУ JS для "часткового оновлення" писали б функцію без жодних
// анотацій — і НІЩО не заважало б передати updates з ЗОВСІМ неправильними
// полями чи типами; помилка виявилась би лише десь ДАЛІ по коду.


// ==========================================================================
// 2. Required<T> — УСІ ПОЛЯ СТАЮТЬ ОБОВ'ЯЗКОВИМИ (ПРОТИЛЕЖНІСТЬ Partial)
// ==========================================================================

interface UserDraft {
  name?: string;
  email?: string;
}

function createUser(draft: Required<UserDraft>): void {
  // тут ГАРАНТОВАНО є ОБИДВА поля — Required прибрав "?" з КОЖНОГО
  console.log(`Створюємо користувача: ${draft.name} <${draft.email}>`);
}
createUser({ name: "Марія", email: "maria@example.com" }); // ok
// createUser({ name: "Марія" }); // ❌ Property 'email' is missing


// ==========================================================================
// 3. Readonly<T> — УСІ ПОЛЯ СТАЮТЬ readonly (COMPILE-TIME ЗАХИСТ ВІД ЗАПИСУ)
// ==========================================================================

const frozenUser: Readonly<User> = { id: 1, name: "Ірина", email: "irina@example.com", age: 25 };
// frozenUser.age = 26; // ❌ Cannot assign to 'age' because it is a read-only property.

// ВАЖЛИВО: Readonly<T> — ЛИШЕ COMPILE-TIME перевірка, вона НЕ ДІЄ в
// рантаймі (на відміну від Object.freeze() у чистому JS, детально
// в common/data-structures/Object/Object.js) — якщо цей самий об'єкт
// передати в ЗВИЧАЙНУ JS-функцію (чи навіть у скомпільований JS-код,
// де типів уже немає), нічого НЕ ЗАВАЖАЄ реально змінити властивість:
function unsafeMutate(obj: { age: number }) {
  obj.age = 999; // компілятор тут НЕ бачить конфлікту з Readonly<User>,
                    // бо obj тут — ІНШИЙ, ширший тип
}
unsafeMutate(frozenUser as unknown as { age: number }); // "обхід" через as
console.log(frozenUser.age); // 999 — Readonly НЕ захистив у рантаймі!

// ДЛЯ СПРАВЖНЬОГО рантайм-захисту потрібен САМЕ Object.freeze() —
// Readonly<T> і Object.freeze() РОЗВ'ЯЗУЮТЬ РІЗНІ проблеми (перша —
// compile-time дисципліна коду, друга — реальна незмінність у пам'яті).


// ==========================================================================
// 4. Pick<T, Keys> — ЗАЛИШИТИ ЛИШЕ ВИБРАНІ ПОЛЯ
// ==========================================================================

type UserPreview = Pick<User, "id" | "name">; // { id: number; name: string }
const preview: UserPreview = { id: 1, name: "Олег" };
console.log(preview);
// const invalidPreview: UserPreview = { id: 1, name: "Олег", email: "x" };
// ❌ Object literal may only specify known properties, and 'email' does
//    not exist in type 'UserPreview'.


// ==========================================================================
// 5. Omit<T, Keys> — ПРИБРАТИ ВИБРАНІ ПОЛЯ (ПРОТИЛЕЖНІСТЬ Pick)
// ==========================================================================

type UserWithoutEmail = Omit<User, "email">; // { id, name, age } — БЕЗ email
const noEmailUser: UserWithoutEmail = { id: 2, name: "Настя", age: 22 };
console.log(noEmailUser);

// ТИПОВЕ ЗАСТОСУВАННЯ Pick/Omit — опис "форми" даних ДЛЯ КОНКРЕТНОГО
// сценарію (форма реєстрації, публічний профіль тощо) БЕЗ повторного
// написання майже ідентичного interface:
type UserRegistrationInput = Omit<User, "id">; // id генерується сервером, не приходить від клієнта
function registerUser(input: UserRegistrationInput): User {
  return { id: Math.floor(Math.random() * 1000), ...input };
}
console.log(registerUser({ name: "Тарас", email: "taras@example.com", age: 27 }));


// ==========================================================================
// 6. Record<Keys, ValueType> — ОБ'ЄКТ ІЗ ВІДОМИМИ КЛЮЧАМИ Й ОДНАКОВИМ ТИПОМ ЗНАЧЕНЬ
// ==========================================================================

type Role = "admin" | "editor" | "viewer";
const rolePermissions: Record<Role, string[]> = {
  admin: ["read", "write", "delete"],
  editor: ["read", "write"],
  viewer: ["read"],
};
console.log(rolePermissions.editor); // ["read", "write"]
// rolePermissions.superadmin = ["read"]; // ❌ Property 'superadmin' does not
                                             // exist on type 'Record<Role, string[]>'.

// Record<Role, ...> ЗМУШУЄ вказати значення ДЛЯ КОЖНОГО варіанта Role —
// якщо забути один із них, TS ОДРАЗУ покаже помилку:
// const incompletePermissions: Record<Role, string[]> = {
//   admin: ["read"],
//   editor: ["read"],
//   // ❌ Property 'viewer' is missing in type '{ admin: string[]; editor: string[]; }'
// };

// Record<string, T> — ПОШИРЕНИЙ спосіб типізувати "словник" із
// довільними рядковими ключами (аналог object-as-map у JS):
const wordCounts: Record<string, number> = { привіт: 3, світ: 1 };
console.log(wordCounts["привіт"]); // 3


// ==========================================================================
// 7. Exclude<T, U> / Extract<T, U> — ФІЛЬТРАЦІЯ ВСЕРЕДИНІ UNION
// ==========================================================================

type AllStatuses = "pending" | "active" | "completed" | "cancelled" | "error";

type ActiveStatuses = Exclude<AllStatuses, "cancelled" | "error">; // "pending" | "active" | "completed"
type FinalStatuses = Extract<AllStatuses, "completed" | "cancelled" | "error">; // "completed" | "cancelled" | "error"

const currentStatus: ActiveStatuses = "active"; // ok
// const badStatus: ActiveStatuses = "error"; // ❌ Type '"error"' is not
                                                 // assignable to type 'ActiveStatuses'.
console.log(currentStatus);

// МНЕМОНІКА: Exclude "викидає" перелічені варіанти з union, Extract
// "залишає ЛИШЕ" ті, що перетинаються з другим union — вони
// ДЗЕРКАЛЬНІ одна до одної.


// ==========================================================================
// 8. NonNullable<T> — ПРИБРАТИ null ТА undefined З ТИПУ
// ==========================================================================

type MaybeName = string | null | undefined;
type DefiniteName = NonNullable<MaybeName>; // просто string

function printDefiniteName(name: DefiniteName) {
  console.log(name.toUpperCase()); // безпечно — тут ГАРАНТОВАНО string
}
printDefiniteName("Олена");
// printDefiniteName(null); // ❌ Argument of type 'null' is not assignable
                              // to parameter of type 'string'.

// ЦЕ КОРИСНО, коли беремо тип ІЗ ІНШОГО місця (наприклад, через
// typeof чи generic-параметр) і ЗНАЄМО, що в цьому конкретному
// сценарії null/undefined вже виключені (наприклад, ПІСЛЯ narrowing —
// детально в typescript/narrowing-and-type-guards.ts).


// ==========================================================================
// 9. ReturnType<T> / Parameters<T> — "ВИТЯГТИ" ТИПИ З СИГНАТУРИ ФУНКЦІЇ
// ==========================================================================

function createPoint(x: number, y: number) {
  return { x, y, magnitude: Math.hypot(x, y) };
}

type Point = ReturnType<typeof createPoint>; // { x: number; y: number; magnitude: number }
// ^ typeof тут — TS-оператор "візьми тип ЦЬОГО значення", а НЕ
// рантайм-typeof із JS (детально різницю розберемо в окремому файлі
// про typeof/keyof); ReturnType бере тип, який createPoint РЕАЛЬНО повертає

const samplePoint: Point = { x: 3, y: 4, magnitude: 5 };
console.log(samplePoint);

type CreatePointArgs = Parameters<typeof createPoint>; // [number, number] — tuple з аргументів!
function callWithLoggedArgs(...args: CreatePointArgs) {
  console.log("викликаємо з аргументами:", args);
  return createPoint(...args);
}
console.log(callWithLoggedArgs(1, 2));

// НАЙБІЛЬША ПЕРЕВАГА: якщо СИГНАТУРА createPoint ЗМІНИТЬСЯ (додасться
// параметр чи зміниться тип повернення) — Point і CreatePointArgs
// ОНОВЛЯТЬСЯ АВТОМАТИЧНО, без потреби синхронізувати їх вручну.


// ==========================================================================
// 10. Awaited<T> — "РОЗГОРНУТИ" ТИП ІЗ Promise (ES2022-СУМІСНИЙ УТИЛІТИ-ТИП)
// ==========================================================================

async function fetchUserById(id: number): Promise<User> {
  // умовний асинхронний запит
  return { id, name: "Завантажений користувач", email: "loaded@example.com", age: 0 };
}

type FetchedUser = Awaited<ReturnType<typeof fetchUserById>>; // User (а НЕ Promise<User>!)
async function useAwaited() {
  const user: FetchedUser = await fetchUserById(1);
  console.log(user.name);
}
useAwaited();

// БЕЗ Awaited довелось би писати ReturnType<typeof fetchUserById> і
// отримати Promise<User> — а НЕ сам User; Awaited "розгортає" Promise
// (і навіть ВКЛАДЕНІ Promise<Promise<T>>, що теоретично можливо) до
// кінцевого типу значення.


// ==========================================================================
// 11. КОМБІНУВАННЯ UTILITY TYPES — РЕАЛЬНИЙ ПРИКЛАД
// ==========================================================================

// Utility types ЧАСТО КОМБІНУЮТЬ одне з одним — типовий приклад:
// "форма для оновлення" — усі поля, окрім id, і всі — необов'язкові:

type UserUpdatePayload = Partial<Omit<User, "id">>;

function patchUser(id: number, payload: UserUpdatePayload): void {
  console.log(`Оновлюємо користувача ${id}:`, payload);
}
patchUser(1, { age: 32 });                     // ok — лише одне поле
patchUser(2, { name: "Нове ім'я", age: 40 });  // ok — кілька полів
// patchUser(3, { id: 999 }); // ❌ Object literal may only specify known
                                 // properties, and 'id' does not exist in type...


// ==========================================================================
// ШПАРГАЛКА: НАЙПОШИРЕНІШІ UTILITY TYPES
// ==========================================================================

// | Утиліта                    | Що робить                                              |
// |--------------------------------|-------------------------------------------------------------|
// | Partial<T>                   | усі поля → необов'язкові (`?`)                            |
// | Required<T>                  | усі поля → обов'язкові (прибирає `?`)                     |
// | Readonly<T>                  | усі поля → readonly (лише compile-time!)                  |
// | Pick<T, K>                   | залишити ЛИШЕ перелічені поля K                            |
// | Omit<T, K>                   | прибрати перелічені поля K                                  |
// | Record<K, V>                 | об'єкт із ключами K (union/string) і значеннями типу V     |
// | Exclude<T, U>                | прибрати з union T варіанти, що є в U                      |
// | Extract<T, U>                | залишити з union T ЛИШЕ варіанти, що є в U                 |
// | NonNullable<T>                | прибрати null і undefined з T                              |
// | ReturnType<typeof fn>        | тип значення, яке ПОВЕРТАЄ fn                               |
// | Parameters<typeof fn>        | tuple типів параметрів fn                                    |
// | Awaited<T>                   | "розгорнути" Promise<T> до типу значення всередині          |


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// - utility types — вбудовані generic-и, що ТРАНСФОРМУЮТЬ вже
//   існуючий тип, а не описують структуру з нуля
// - Partial/Required/Readonly — змінюють "модальність" полів
//   (необов'язковість, обов'язковість, незмінність); Readonly —
//   ЛИШЕ compile-time, для реального рантайм-захисту потрібен
//   Object.freeze() з common/data-structures/Object/Object.js
// - Pick/Omit — вибірка/виключення КОНКРЕТНИХ полів за іменем
// - Record<K, V> — типізований "словник"; ЗМУШУЄ заповнити ВСІ
//   ключі union-типу K, якщо K — не просто string
// - Exclude/Extract — фільтрація ВСЕРЕДИНІ union-типу (дзеркальні
//   одна до одної операції)
// - NonNullable — прибирає null/undefined з типу
// - ReturnType/Parameters/Awaited — "витягують" типи ІЗ СИГНАТУРИ
//   функції, автоматично синхронізуючись зі змінами цієї сигнатури
// - utility types ЧАСТО КОМБІНУЮТЬ (наприклад, `Partial<Omit<T, "id">>`)
//   для точного опису форми даних під конкретний сценарій без
//   дублювання основного interface/type