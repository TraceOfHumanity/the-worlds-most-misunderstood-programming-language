// ==========================================================================
// REGEXP — РЕГУЛЯРНІ ВИРАЗИ В JAVASCRIPT ДЕТАЛЬНО
// ==========================================================================

// 1. ЩО ТАКЕ RegExp
// -----------------------------------------------------
// Регулярний вираз (regular expression) — ШАБЛОН для пошуку, перевірки
// й заміни тексту. У JS це об'єкт RegExp, який зберігає:
//   - source — текст шаблону;
//   - flags  — прапорці, що змінюють поведінку (g, i, m, s, u, v, y, d);
//   - lastIndex — позицію, з якої продовжити пошук (розділ 7 — пастка!).
//
// Коли використовувати: валідація формату, вилучення частин тексту,
// складна заміна, розбиття за шаблоном. Коли НЕ використовувати:
//   - для простого пошуку підрядка — includes/startsWith
//     (common/data-structures/String/String.js);
//   - для розбору HTML/JSON/вкладених структур — потрібен справжній парсер.

const re = /ab+c/gi;
console.log(re.source); // ab+c
console.log(re.flags); // gi
console.log(re.global, re.ignoreCase); // true true
console.log(typeof re, re instanceof RegExp); // object true


// ==========================================================================
// 2. СТВОРЕННЯ: ЛІТЕРАЛ І КОНСТРУКТОР
// ==========================================================================

// 2.1. Літерал /шаблон/прапорці — компілюється один раз при розборі коду
const literal = /\d+/g;

// 2.2. Конструктор new RegExp(рядок, прапорці) — коли шаблон динамічний
const dynamic = new RegExp("\\d+", "g"); // ⚠️ подвійний слеш: спершу екранується рядок
console.log(literal.source === dynamic.source); // true

// Пастка: у рядковому літералі \d стає просто "d" (символ \ з'їдається рядком)
console.log(new RegExp("\d+").source); // d+ — не те, що хотіли
console.log(new RegExp("\\d+").source); // \d+ — правильно
console.log(String.raw`\d+` === "\\d+"); // true — String.raw не з'їдає слеші

// 2.3. Копіювання з іншими прапорцями
console.log(new RegExp(/abc/g, "i").flags); // i — прапорці ЗАМІНЮЮТЬСЯ, а не додаються
console.log(new RegExp(/abc/g).flags); // g — без другого аргументу успадковуються

// 2.4. Екранування користувацького вводу — ОБОВ'ЯЗКОВО!
// Спецсимволи . * + ? ^ $ { } ( ) | [ ] \ / мають особливе значення.
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
console.log(escapeRegExp("1+1=2 (ok?)")); // 1\+1=2 \(ok\?\)

const userInput = "a.b";
console.log(new RegExp(userInput).test("axb")); // true — "." збігся з будь-яким символом!
console.log(new RegExp(escapeRegExp(userInput)).test("axb")); // false — шукає саме "a.b"
// Невиправлений ввід — не лише баг, а й уразливість (розділ 10, ReDoS).

// 2.5. Літерал не можна перебудувати "на льоту", але можна
//      скомпонувати з частин через .source:
const digits = /\d{3}/;
const phone = new RegExp(`^\\+380${digits.source}\\d{4}$`);
console.log(phone.test("+380501234567")); // true


// ==========================================================================
// 3. ПРАПОРЦІ (FLAGS)
// ==========================================================================

// g — global: шукати ВСІ збіги, а не лише перший
console.log("a1b2c3".match(/\d/)); // ['1', index: 1, ...] — лише перший
console.log("a1b2c3".match(/\d/g)); // [ '1', '2', '3' ] — усі

// i — ignore case: без урахування регістру
console.log(/hello/i.test("HeLLo")); // true

// m — multiline: ^ і $ збігаються на межах КОЖНОГО рядка, а не всього тексту
const text = "перший\nдругий\nтретій";
console.log(text.match(/^./g)); // [ 'п' ]
console.log(text.match(/^./gm)); // [ 'п', 'д', 'т' ]

// s — dotAll: крапка збігається і з \n (за замовчуванням — ні)
console.log(/a.b/.test("a\nb")); // false
console.log(/a.b/s.test("a\nb")); // true

// u — unicode: коректна робота з символами за межами BMP (емодзі тощо),
// \u{1F600}, \p{...} (розділ 9)
console.log("😀".length); // 2 — два UTF-16 code unit
console.log(/^.$/.test("😀")); // false — без u крапка бачить лише половину
console.log(/^.$/u.test("😀")); // true

// y — sticky: збіг МАЄ починатися рівно з lastIndex (токенізатори, лексери)
const sticky = /\d/y;
sticky.lastIndex = 1;
console.log(sticky.test("a1")); // true — на позиції 1 стоїть цифра
sticky.lastIndex = 0;
console.log(sticky.test("a1")); // false — на позиції 0 стоїть "a"

// d — indices: додає позиції початку/кінця кожної групи
const withIndices = /(\d+)-(\d+)/d.exec("тел: 12-34");
console.log(withIndices.indices[0]); // [ 5, 10 ]
console.log(withIndices.indices[1]); // [ 5, 7 ]

// v — unicodeSets (ES2024): розширення u — операції над класами
// ([\p{L}--[a-z]] — різниця, [A&&B] — перетин), рядкові властивості емодзі.
// Це суворіший режим: u і v разом вказувати не можна.
console.log(/[\p{L}--[a-z]]/v.test("a")); // false — латинські малі виключені
console.log(/[\p{L}--[a-z]]/v.test("Я")); // true


// ==========================================================================
// 4. МЕТОДИ: test, exec, ТА МЕТОДИ РЯДКІВ
// ==========================================================================

// 4.1. regex.test(str) → boolean (найшвидша перевірка "чи є збіг")
console.log(/\d/.test("abc1")); // true

// 4.2. regex.exec(str) → масив збігу з деталями, або null
const m = /(\d{4})-(\d{2})/.exec("дата 2024-03-15");
console.log(m[0]); // 2024-03 — увесь збіг
console.log(m[1], m[2]); // 2024 03 — групи
console.log(m.index); // 5 — позиція збігу
console.log(m.input); // дата 2024-03-15
console.log(/\d/.exec("abc")); // null

// 4.3. str.match(regex)
//   без g → як exec (з групами та index);
//   з g   → масив ВСІХ збігів (без груп) або null
console.log("a1b22".match(/\d+/g)); // [ '1', '22' ]
console.log("abc".match(/\d/g)); // null — не порожній масив! ⚠️
console.log("abc".match(/\d/g) ?? []); // [] — безпечний варіант

// 4.4. str.matchAll(regex) → ітератор ВСІХ збігів З групами (потрібен g!)
const iso = "2024-03-15, 2025-01-02";
for (const match of iso.matchAll(/(\d{4})-(\d{2})-(\d{2})/g)) {
  console.log(match[0], "→ рік", match[1], "місяць", match[2], "індекс", match.index);
}
// 2024-03-15 → рік 2024 місяць 03 індекс 0
// 2025-01-02 → рік 2025 місяць 01 індекс 12
console.log([..."a1b2".matchAll(/\d/g)].map((x) => x[0])); // [ '1', '2' ]
try {
  "a1".matchAll(/\d/); // без g
} catch (err) {
  console.log(err.name); // TypeError
}
// (ітератори — common/data-structures/iterator/iterator.js)

// 4.5. str.search(regex) → індекс першого збігу або -1 (аналог indexOf)
console.log("abc123".search(/\d/)); // 3

// 4.6. str.replace / replaceAll (розділ 8)
// 4.7. str.split(regex) (розділ 11)


// ==========================================================================
// 5. СИНТАКСИС: КЛАСИ СИМВОЛІВ, ЯКОРІ, КВАНТИФІКАТОРИ
// ==========================================================================

// 5.1. Класи символів
//   .       будь-який символ, крім кінця рядка (з s — включно з ним)
//   \d \D   цифра / не цифра          [0-9]
//   \w \W   "словесний" символ / ні   [A-Za-z0-9_]  ⚠️ ТІЛЬКИ латиниця!
//   \s \S   пробільний / ні (пробіл, \t, \n, \r, ...)
//   [abc]   один із символів;  [^abc] — будь-який, КРІМ
//   [a-z]   діапазон
console.log("кіт cat".match(/\w+/g)); // [ 'cat' ] — кирилиця НЕ входить у \w
console.log("кіт cat".match(/[а-яіїєґ]+/gi)); // [ 'кіт' ]

// 5.2. Якорі і межі
//   ^  початок рядка (з m — кожного рядка)     $  кінець
//   \b межа слова     \B — не межа слова (\b теж працює лише з ASCII \w)
console.log(/^\d+$/.test("123")); // true
console.log(/^\d+$/.test("123abc")); // false — без якорів було б true
console.log(/\d+/.test("123abc")); // true
console.log("cat concat".match(/\bcat\b/g)); // [ 'cat' ]

// 5.3. Квантифікатори (скільки разів повторювати)
//   *      0 або більше       +      1 або більше       ?    0 або 1
//   {n}    рівно n            {n,}   n або більше       {n,m} від n до m
console.log("color colour".match(/colou?r/g)); // [ 'color', 'colour' ]
console.log("2 22 2222".match(/\b\d{2,3}\b/g)); // [ '22' ]

// 5.4. Жадібні (greedy) і ліниві (lazy) квантифікатори
// За замовчуванням квантифікатор бере ЯК МОГА БІЛЬШЕ; "?" після нього —
// як МОГА МЕНШЕ (lazy).
const html = "<b>жирний</b> і <i>курсив</i>";
console.log(html.match(/<.+>/)[0]); // <b>жирний</b> і <i>курсив</i> — жадібно, усе одним збігом
console.log(html.match(/<.+?>/g)); // [ '<b>', '</b>', '<i>', '</i>' ] — ліниво
console.log(html.match(/<[^>]+>/g)); // те саме, але швидше й надійніше (без backtracking)

// 5.5. Альтернація |
console.log("cat dog bird".match(/cat|bird/g)); // [ 'cat', 'bird' ]
// ⚠️ | має найнижчий пріоритет: /^a|b$/ означає "^a" АБО "b$"
console.log(/^cat|dog$/.test("catfish")); // true — "^cat" збіглося
console.log(/^(cat|dog)$/.test("catfish")); // false — із групою правильно

// 5.6. Екранування
console.log(/1\+1/.test("1+1")); // true
console.log(/[.]/.test("a")); // false — усередині [] крапка вже звичайна
console.log(/a\.b/.test("a.b")); // true


// ==========================================================================
// 6. ГРУПИ ТА ПОСИЛАННЯ НАЗАД
// ==========================================================================

// 6.1. Захоплювальна група (...)
console.log("Іван Петренко".replace(/(\S+) (\S+)/, "$2 $1")); // Петренко Іван

// 6.2. Незахоплювальна група (?:...) — групує, але не запам'ятовує
console.log(/(?:ab)+/.exec("ababab")[0]); // ababab
console.log(/(ab)+/.exec("ababab")); // ['ababab', 'ab', ...] — зайва група в результаті

// 6.3. Іменовані групи (?<name>...) — читабельніше за номери
const dateRe = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const { year, month, day } = "Дата: 2024-03-15".match(dateRe).groups;
console.log(year, month, day); // 2024 03 15
console.log("2024-03-15".replace(dateRe, "$<day>.$<month>.$<year>")); // 15.03.2024

// 6.4. Посилання назад \1 або \k<name>: повторити те, що зловила група
console.log(/(\w)\1/.test("hello")); // true — "ll"
console.log("hello aabb".match(/(\w)\1/g)); // [ 'll', 'aa', 'bb' ]
console.log(/^(?<q>["']).*\k<q>$/.test(`"текст"`)); // true — лапки парні
console.log(/^(?<q>["']).*\k<q>$/.test(`"текст'`)); // false

// 6.5. Необов'язкова група, що не збіглася, дає undefined
const opt = /(\d+)(px)?/.exec("12");
console.log(opt[1], opt[2]); // 12 undefined

// 6.6. Дублювання імен у різних гілках альтернації (ES2025)
// /(?<y>\d{4})-\d\d|\d\d-(?<y>\d{4})/ — підтримка залежить від версії рушія.


// ==========================================================================
// 7. lastIndex ТА "СТАН" g/y — ГОЛОВНА ПАСТКА
// ==========================================================================

// З прапорцями g і y об'єкт RegExp ЗАПАМ'ЯТОВУЄ lastIndex — позицію
// після останнього збігу. test() та exec() починають наступний пошук
// саме з неї. Це означає, що ОДИН І ТОЙ САМИЙ регекс дає різні
// результати на ті самі дані:

const stateful = /a/g;
console.log(stateful.test("a")); // true — lastIndex стає 1
console.log(stateful.lastIndex); // 1
console.log(stateful.test("a")); // false — шукає з позиції 1, а там кінець
console.log(stateful.lastIndex); // 0 — після невдачі скинулось
console.log(stateful.test("a")); // true — і знову по колу

// Типова помилка: регекс з g, оголошений поза функцією
const isDigit = /\d/g;
const check = (s) => isDigit.test(s);
console.log(check("1"), check("1")); // true false — ⚠️ баг!
// Виправлення: прибрати g у test-перевірках або створювати регекс усередині.
const isDigitOk = /\d/;
console.log(isDigitOk.test("1"), isDigitOk.test("1")); // true true

// exec у циклі: класичний спосіб обходу всіх збігів (з g)
const loop = /\d+/g;
const found = [];
let match;
while ((match = loop.exec("a1 b22 c333")) !== null) {
  found.push([match[0], match.index, loop.lastIndex]);
}
console.log(found); // [ [ '1', 1, 2 ], [ '22', 4, 6 ], [ '333', 8, 11 ] ]
// (кожен елемент: [збіг, index, lastIndex після збігу])
// Сучасніше й безпечніше: matchAll (розділ 4.4). Без g цикл exec
// нескінченний — exec завжди повертає перший збіг!

// str.match(/g/), replace, matchAll, split ПЕРЕД викликом самі
// скидають/копіюють lastIndex, а test/exec — ні.


// ==========================================================================
// 8. ЗАМІНА: replace, replaceAll
// ==========================================================================

// 8.1. Без g replace замінює лише ПЕРШИЙ збіг
console.log("a-b-c".replace(/-/, "+")); // a+b-c
console.log("a-b-c".replace(/-/g, "+")); // a+b+c
console.log("a-b-c".replaceAll("-", "+")); // a+b+c — рядок теж працює
try {
  "a-b".replaceAll(/-/, "+"); // regex БЕЗ g у replaceAll — помилка
} catch (err) {
  console.log(err.name); // TypeError
}

// 8.2. Спеціальні послідовності в рядку заміни
//   $&  увесь збіг      $1..$99  група      $<name>  іменована група
//   $`  текст ДО збігу  $'  текст ПІСЛЯ     $$  літерал "$"
console.log("cat".replace(/a/, "[$&]")); // c[a]t
console.log("cat".replace(/a/, "[$`|$']")); // c[c|t]t
console.log("100".replace(/\d+/, "$$$&")); // $100

// ⚠️ Якщо заміна містить $ від користувача — використовуйте функцію:
const price = "$5";
console.log("x".replace(/x/, price)); // $5 — тут ок, але "$&" ламало б
console.log("x".replace(/x/, "$&$&")); // xx — "$&" інтерпретовано!
console.log("x".replace(/x/, () => "$&$&")); // $&$& — функція повертає буквально

// 8.3. Функція-замінник (match, p1, p2, ..., offset, string, groups)
console.log("a1b2".replace(/\d/g, (d) => d * 2)); // a2b4
console.log(
  "2024-03-15".replace(/(\d+)-(\d+)-(\d+)/, (_, y, mo, d) => `${d}/${mo}/${y}`),
); // 15/03/2024
console.log(
  "hello world".replace(/\b\w/g, (c) => c.toUpperCase()),
); // Hello World
console.log(
  "2024-03-15".replace(dateRe, (...args) => {
    const groups = args.at(-1); // якщо є іменовані групи — вони ОСТАННІЙ аргумент
    return `${groups.day}.${groups.month}`;
  }),
); // 15.03

// 8.4. Шаблонізація: підстановка змінних
const tpl = "Привіт, {name}! Тобі {age}.";
const data = { name: "Оля", age: 20 };
console.log(tpl.replace(/\{(\w+)\}/g, (_, key) => data[key] ?? "")); // Привіт, Оля! Тобі 20.

// 8.5. camelCase ↔ snake_case ↔ kebab-case
const toSnake = (s) => s.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
const toCamel = (s) => s.replace(/_(\w)/g, (_, c) => c.toUpperCase());
console.log(toSnake("userFirstName")); // user_first_name
console.log(toCamel("user_first_name")); // userFirstName

// 8.6. Форматування числа з розділювачами тисяч
console.log("1234567.89".replace(/\B(?=(\d{3})+(?!\d))/g, ",")); // 1,234,567.89
// (Для реального коду краще Intl.NumberFormat — common/math.js)


// ==========================================================================
// 9. LOOKAROUND: ПЕРЕВІРКА КОНТЕКСТУ БЕЗ "СПОЖИВАННЯ" СИМВОЛІВ
// ==========================================================================

// Lookaround перевіряє, що стоїть поруч, але НЕ входить у збіг.
//   (?=...)  позитивний lookahead  — далі йде ...
//   (?!...)  негативний lookahead  — далі НЕ йде ...
//   (?<=...) позитивний lookbehind — перед цим стоїть ...
//   (?<!...) негативний lookbehind — перед цим НЕ стоїть ...

console.log("100$ 200€ 300$".match(/\d+(?=\$)/g)); // [ '100', '300' ] — числа перед $
console.log("100$ 200€".match(/\d+(?!\d|\$)/g)); // [ '200' ] — числа НЕ перед "$"
// (для "100$" рушій відкочується на "10" та "1", але після них стоїть цифра,
//  тож умова (?!\d|\$) не виконується; "200" стоїть перед "€" — підходить)
console.log("price: $5, cost: €7".match(/(?<=\$)\d+/g)); // [ '5' ] — цифри після $
console.log("foo.js bar.ts baz.js".match(/\w+(?=\.js)/g)); // [ 'foo', 'baz' ]
console.log("foobar foobaz".match(/foo(?!bar)\w+/g)); // [ 'foobaz' ]
console.log("cat scat".match(/(?<!s)cat/g)); // [ 'cat' ] — cat, перед яким немає "s"

// Валідація пароля: кілька умов одночасно (кожен lookahead — окрема вимога)
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
console.log(strongPassword.test("Passw0rdX")); // true
console.log(strongPassword.test("password")); // false — немає великої літери й цифри


// ==========================================================================
// 10. КАТАСТРОФІЧНИЙ BACKTRACKING (ReDoS)
// ==========================================================================

// Рушій шукає збіг перебором із ВІДКАТОМ (backtracking). Для деяких
// шаблонів кількість варіантів росте ЕКСПОНЕНЦІЙНО з довжиною тексту —
// один запит може повісити event loop на секунди й хвилини
// (common/asynchronous.js — блокування потоку). Це ReDoS-атака.
//
// Небезпечні патерни — вкладені квантифікатори й перетинні альтернативи:
//   (a+)+$       (a|aa)+$       (\w+\s?)*$       (.*a){x}

function time(re, s) {
  const start = performance.now();
  re.test(s);
  return performance.now() - start;
}

const evil = /^(a+)+$/;
const safe = /^a+$/;
const attack = "a".repeat(26) + "!"; // майже збіг, що невдало завершується

console.log(time(safe, attack) < 5); // true — миттєво
console.log(time(evil, attack) > time(safe, attack) * 100); // true — на порядки повільніше
// (додайте кілька "a" — час подвоюється з кожним; на ~35 символах — хвилини)

// Як захищатись:
//   - не вкладайте квантифікатори: (a+)+ → a+;
//   - уточнюйте класи: [^"]* замість .*;
//   - обмежуйте довжину вводу ДО застосування регексу;
//   - не будуйте регекс із неекранованого користувацького вводу;
//   - для критичних місць — бібліотеки на RE2 (лінійний час), таймаут у
//     Worker (node/ — worker_threads);
//   - остання надія — перевірка інструментами (safe-regex, recheck).


// ==========================================================================
// 11. split ТА ІНШІ ПРАКТИЧНІ ЗАДАЧІ
// ==========================================================================

// 11.1. split за шаблоном
console.log("a, b;c  d".split(/[,;\s]+/)); // [ 'a', 'b', 'c', 'd' ]
console.log("2024-03-15".split(/-/)); // [ '2024', '03', '15' ]
// Група в split → роздільники ЗАЛИШАЮТЬСЯ в результаті
console.log("a1b2c".split(/(\d)/)); // [ 'a', '1', 'b', '2', 'c' ]
console.log("a1b2c".split(/\d/, 2)); // [ 'a', 'b' ] — ліміт кількості

// 11.2. Розбиття на рядки з різними закінченнями
console.log("a\r\nb\nc".split(/\r?\n/)); // [ 'a', 'b', 'c' ]

// 11.3. Витяг усіх чисел із тексту
console.log("ціна 12.5 і -3, знижка 0.75".match(/-?\d+(?:\.\d+)?/g)); // [ '12.5', '-3', '0.75' ]

// 11.4. Розбір query-рядка
const qs = "a=1&b=hello&c=";
const parsedQs = Object.fromEntries(
  [...qs.matchAll(/([^&=]+)=([^&]*)/g)].map((x) => [x[1], x[2]]),
);
console.log(parsedQs); // { a: '1', b: 'hello', c: '' }
// (Для реальних URL — URL/URLSearchParams, не регекси.)

// 11.5. Обрізання пробілів усередині
console.log("  a   b  ".replace(/\s+/g, " ").trim()); // a b

// 11.6. Валідація формату (обережно з "ідеальними" регексами!)
const hexColor = /^#(?:[0-9a-f]{3}){1,2}$/i;
console.log(hexColor.test("#fff"), hexColor.test("#a1b2c3"), hexColor.test("#ffff")); // true true false
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
console.log(uuid.test("550e8400-e29b-41d4-a716-446655440000")); // true (utils/uuid.js — генерація)
const simpleEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
console.log(simpleEmail.test("user@example.com"), simpleEmail.test("user@@example")); // true false
// Повна відповідність RFC 5322 регексом практично неможлива. Практика:
// проста перевірка формату + лист із підтвердженням.

// 11.7. Токенізатор із sticky (y)
function tokenize(src) {
  const tokenRe = /\s*(?:(\d+)|([+\-*/()]))/y;
  const tokens = [];
  let pos = 0;
  while (pos < src.length) {
    tokenRe.lastIndex = pos;
    const t = tokenRe.exec(src);
    if (!t) throw new SyntaxError(`Неочікуваний символ на позиції ${pos}`);
    tokens.push(t[1] !== undefined ? { num: Number(t[1]) } : { op: t[2] });
    pos = tokenRe.lastIndex;
  }
  return tokens;
}
console.log(tokenize("12 + (3*4)").map((t) => t.num ?? t.op).join(" ")); // 12 + ( 3 * 4 )
try {
  tokenize("1 + x");
} catch (err) {
  console.log(err.message); // Неочікуваний символ на позиції 3
}


// ==========================================================================
// 12. UNICODE ТА МІЖНАРОДНІ ТЕКСТИ
// ==========================================================================

// 12.1. \w, \b, \d — ЛИШЕ ASCII, навіть із u. Для інших мов — властивості
// Unicode \p{...} (потрібен u або v):
//   \p{L}  будь-яка літера       \p{Lu} велика       \p{Ll} мала
//   \p{N}  цифра                 \p{P}  пунктуація
//   \p{Script=Cyrillic}          \p{Emoji}
console.log("Привіт, world! 123".match(/\p{L}+/gu)); // [ 'Привіт', 'world' ]
console.log("Привіт".match(/\p{Script=Cyrillic}+/u)[0]); // Привіт
console.log("ААа".match(/\p{Lu}/gu)); // [ 'А', 'А' ]
console.log("a😀b🎉".match(/\p{Emoji_Presentation}/gu)); // [ '😀', '🎉' ]

// 12.2. Слово будь-якою мовою: замість \b — lookaround із \p{L}
const wordRe = /(?<![\p{L}\p{N}])[\p{L}\p{N}]+(?![\p{L}\p{N}])/gu;
console.log("кіт, кішка; cat".match(wordRe)); // [ 'кіт', 'кішка', 'cat' ]

// 12.3. Регістр: i для кирилиці працює; з u — коректніше "case folding"
console.log(/привіт/i.test("ПРИВІТ")); // true

// 12.4. Позиції в рядку — у UTF-16 code units, а не в символах (розділ 3, u)
console.log("😀a".search(/a/)); // 2 — а не 1: емодзі займає 2 code units
console.log("😀a".length); // 3
console.log([..."😀a"].length); // 2 — spread ітерує за символами (code points)
// (String і Unicode детально — common/data-structures/String/String.js)

// 12.5. Композиція символів: "й" може бути одним символом (U+0439) або
// "и" + діакритик (U+0438 U+0306); нормалізуйте перед порівнянням:
const composed = "й";
const decomposed = "й";
console.log(composed === decomposed); // false
console.log(composed === decomposed.normalize("NFC")); // true


// ==========================================================================
// 13. ПРОДУКТИВНІСТЬ ТА ПРАКТИЧНІ ПОРАДИ
// ==========================================================================

// - Літерал компілюється ОДИН раз при розборі коду. Створення
//   new RegExp(...) у гарячому циклі — зайві витрати: виносьте за цикл
//   або кешуйте (patterns/factory.js — кешування фабрик).
// - test() швидший за match()/exec(), коли потрібен лише boolean.
// - Прості перевірки: startsWith/endsWith/includes швидші за регекс
//   і читабельніші (performance/ — бенчмаркуйте, а не вгадуйте).
// - Якорі ^ $ значно скорочують пошук; квантифікатори без якоря
//   "спробують" кожну позицію.
// - Специфічні класи ([^"]*) швидші й безпечніші за .*?
// - Складний регекс розбивайте на частини через RegExp.source
//   (розділ 2.5) або коментуйте кожну групу; довгий шаблон у
//   один рядок — це борг читабельності.
// - Тестуйте на "поганих" даних: порожній рядок, дуже довгий рядок,
//   Unicode, пробіли на краях, \r\n.


// ==========================================================================
// 14. ТИПОВІ ПОМИЛКИ (ЗВЕДЕННЯ)
// ==========================================================================

// 14.1. Забули ^ і $ при валідації — "abc123def" пройшов би /\d+/.
console.log(/\d+/.test("abc123def"), /^\d+$/.test("abc123def")); // true false
// 14.2. Регекс з g + test/exec → lastIndex (розділ 7).
// 14.3. match(/g/) повертає null, а не [] (розділ 4.3).
// 14.4. Неекранований ввід у new RegExp (розділ 2.4) — баги й ReDoS.
// 14.5. \w і \b не розуміють кирилицю (розділ 5.1, 12.1).
// 14.6. "." не збігається з \n без прапорця s.
// 14.7. Жадібність: .* "з'їдає" більше, ніж потрібно (розділ 5.4).
// 14.8. Парсинг HTML/JSON/вкладених дужок регексом: регулярні вирази не
//       вміють рахувати вкладеність — беріть парсер (DOMParser, cheerio, JSON.parse).
// 14.9. Порівняння регексів: /a/ === /a/ — false (об'єкти;
//       common/type-coercion.js). Порівнюйте .source і .flags.
console.log(/a/ === /a/, /a/.source === /a/.source); // false true
// 14.10. Регекс у літералі і "/" усередині: /a\/b/ або new RegExp("a/b").
console.log(/a\/b/.test("a/b")); // true


// ПІДСУМОК:
// - RegExp — об'єкт-шаблон (source + flags + lastIndex); літерал
//   /.../flags або new RegExp(рядок, flags); у рядку слеші треба
//   подвоювати ("\\d"), користувацький ввід — екранувати
// - прапорці: g (усі збіги), i (регістр), m (^$ на кожен рядок),
//   s (крапка з \n), u (Unicode), v (unicodeSets), y (sticky),
//   d (indices)
// - методи: test (boolean), exec (деталі збігу), str.match (без g —
//   як exec; з g — масив або null!), matchAll (ітератор із групами,
//   потрібен g), replace/replaceAll, split, search
// - синтаксис: класи (\d \w \s . [..]), якорі (^ $ \b), квантифікатори
//   (* + ? {n,m}), жадібні vs ліниві (+?), альтернація (|, має
//   найнижчий пріоритет — беріть у групу)
// - групи: (...) захоплювальна, (?:...) незахоплювальна,
//   (?<name>...) іменована ($<name>, groups.name), \1/\k<name> — посилання назад
// - lookaround: (?=) (?!) (?<=) (?<!) — перевіряють контекст, не
//   входячи у збіг
// - ПАСТКА lastIndex: регекс із g/y — це стан; test/exec на ньому
//   дають різні результати на однакових даних
// - у replace використовуйте функцію, коли рядок заміни може мати $;
//   спецпослідовності: $& $1 $<name> $` $' $$
// - \w, \d, \b — лише ASCII; для інших мов — \p{L} із прапорцем u/v
// - ReDoS: вкладені квантифікатори ((a+)+) дають експоненційний
//   backtracking і блокують event loop; обмежуйте ввід, уточнюйте класи
// - регекси не парсять вкладені структури (HTML, JSON) — потрібен парсер;
//   для простих перевірок includes/startsWith кращі за регекс
