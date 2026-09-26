// ==========================================================================
// ARRAY — ВПОРЯДКОВАНА КОЛЕКЦІЯ ЗНАЧЕНЬ ЗА ІНДЕКСОМ
// ==========================================================================

// 1. ЩО ТАКЕ Array
// -----------------------------------------------------
// Array — це спеціалізований об'єкт (насправді все ще object,
// Array.prototype успадковує від Object.prototype) для зберігання
// впорядкованого списку значень будь-якого типу, доступних за
// ЧИСЛОВИМ ІНДЕКСОМ (з 0). Має службову властивість length, яка
// автоматично оновлюється при додаванні/видаленні елементів.

const simpleArr = [1, "два", true, { id: 3 }, [4, 5]];
console.log(simpleArr.length); // 5
console.log(typeof simpleArr); // "object" — масив теж об'єкт
console.log(Array.isArray(simpleArr)); // true — надійний спосіб перевірити "чи це масив"


// ==========================================================================
// 2. СТВОРЕННЯ МАСИВІВ
// ==========================================================================

// а) array literal — найпоширеніший спосіб
const literalArr = [1, 2, 3];

// б) new Array() — рідко використовують, є пастка з одним числовим аргументом
const arrFromNew = new Array(1, 2, 3); // [1, 2, 3] — кілька аргументів = елементи
const arrWithLength = new Array(5);     // [empty × 5] — ОДИН числовий аргумент = ДОВЖИНА, не елемент!
console.log(arrWithLength.length); // 5, але масив ПОРОЖНІЙ (усі "дірки")

// в) Array.of() — уникає пастки new Array(n): завжди створює масив ІЗ переданих значень
console.log(Array.of(5));       // [5] — а не масив довжиною 5
console.log(Array.of(1, 2, 3)); // [1, 2, 3]

// г) Array.from() — створює масив з iterable або array-like об'єкта
console.log(Array.from("abc"));              // ["a", "b", "c"] — рядок iterable
console.log(Array.from(new Set([1, 2, 2])));  // [1, 2] — з будь-якого iterable
console.log(Array.from({ length: 3 }, (_, i) => i * 2)); // [0, 2, 4] — з array-like + мапер
console.log(Array.from({ length: 5 }, (_, i) => i));      // [0, 1, 2, 3, 4] — швидкий спосіб діапазону

// д) Array(n).fill(value) — типовий патерн заповнення "порожнього" масиву
const filledFromNew = new Array(3).fill(0);
console.log(filledFromNew); // [0, 0, 0]


// ==========================================================================
// МУТУЮЧІ МЕТОДИ (змінюють оригінальний масив)
// ==========================================================================

// 3. push(...items) — додає елемент(и) В КІНЕЦЬ, повертає НОВУ length
// -----------------------------------------------------
const pushArr = [1, 2];
const newLength = pushArr.push(3, 4);
console.log(pushArr, newLength); // [1, 2, 3, 4] 4


// 4. pop() — видаляє й повертає ОСТАННІЙ елемент
// -----------------------------------------------------
const popArr = [1, 2, 3];
const popped = popArr.pop();
console.log(popArr, popped); // [1, 2] 3
console.log([].pop()); // undefined — на порожньому масиві не кидає помилку


// 5. unshift(...items) — додає елемент(и) НА ПОЧАТОК, повертає нову length
// -----------------------------------------------------
const unshiftArr = [3, 4];
unshiftArr.unshift(1, 2);
console.log(unshiftArr); // [1, 2, 3, 4]
// push/pop працюють з КІНЦЕМ масиву — O(1), швидко.
// unshift/shift працюють з ПОЧАТКОМ — O(n), бо всі елементи
// зсуваються на нову позицію. На великих масивах це помітно повільніше.


// 6. shift() — видаляє й повертає ПЕРШИЙ елемент
// -----------------------------------------------------
const shiftArr = [1, 2, 3];
const shifted = shiftArr.shift();
console.log(shiftArr, shifted); // [2, 3] 1


// 7. splice(start, deleteCount, ...items) — універсальний "хірург" масиву
// -----------------------------------------------------
// Видаляє/вставляє/замінює елементи ПРЯМО В ОРИГІНАЛІ, повертає
// МАСИВ ВИДАЛЕНИХ елементів.

const spliceArr = [1, 2, 3, 4, 5];

// видалення 2 елементів починаючи з індексу 1:
const removed = spliceArr.splice(1, 2);
console.log(spliceArr, removed); // [1, 4, 5] [2, 3]

// вставка без видалення (deleteCount = 0):
const spliceArr2 = [1, 2, 5];
spliceArr2.splice(2, 0, 3, 4);
console.log(spliceArr2); // [1, 2, 3, 4, 5]

// заміна елементів (видалити й одразу вставити нові):
const spliceArr3 = [1, 2, 3];
spliceArr3.splice(1, 1, "два", "два з половиною");
console.log(spliceArr3); // [1, "два", "два з половиною", 3]

// негативний start — рахує з КІНЦЯ масиву:
const spliceArr4 = [1, 2, 3, 4, 5];
spliceArr4.splice(-2, 1);
console.log(spliceArr4); // [1, 2, 3, 5] — видалено передостанній елемент


// 8. sort(compareFn) — сортує МАСИВ НА МІСЦІ, повертає той самий масив
// -----------------------------------------------------
// БЕЗ compareFn сортує елементи ЯК РЯДКИ (лексикографічно!) — класична пастка.

const numbersDefaultSort = [10, 1, 21, 2];
console.log(numbersDefaultSort.sort()); // [1, 10, 2, 21] — "10" < "2" як рядки!

// правильне числове сортування — через компаратор:
console.log([10, 1, 21, 2].sort((a, b) => a - b)); // [1, 2, 10, 21] — за зростанням
console.log([10, 1, 21, 2].sort((a, b) => b - a)); // [21, 10, 2, 1] — за спаданням

// сортування рядків з урахуванням локалі (правильна кирилиця/діакритика):
console.log(["яблуко", "апельсин", "банан"].sort((a, b) => a.localeCompare(b)));
// ["апельсин", "банан", "яблуко"]


// 9. reverse() — розвертає МАСИВ НА МІСЦІ, повертає той самий масив
// -----------------------------------------------------
const reverseArr = [1, 2, 3];
reverseArr.reverse();
console.log(reverseArr); // [3, 2, 1]


// 10. fill(value, start, end) — заповнює масив значенням "на місці"
// -----------------------------------------------------
const fillArr = [1, 2, 3, 4, 5];
fillArr.fill(0, 1, 3); // заповнити 0 з індексу 1 до (не включно) 3
console.log(fillArr); // [1, 0, 0, 4, 5]
console.log(new Array(3).fill("x")); // ["x", "x", "x"] — типове застосування


// 11. copyWithin(target, start, end) — копіює частину масиву в інше місце ТОГО Ж масиву
// -----------------------------------------------------
const copyWithinArr = [1, 2, 3, 4, 5];
copyWithinArr.copyWithin(0, 3); // скопіювати з індексу 3 до кінця, вставити з індексу 0
console.log(copyWithinArr); // [4, 5, 3, 4, 5] — рідко використовується на практиці


// ==========================================================================
// НЕМУТУЮЧІ МЕТОДИ (повертають НОВИЙ масив/значення, оригінал не чіпають)
// ==========================================================================

// 12. concat(...arraysOrValues) — об'єднує масиви в НОВИЙ масив
// -----------------------------------------------------
const concatArr1 = [1, 2];
const concatArr2 = [3, 4];
const concatenated = concatArr1.concat(concatArr2, [5, 6], 7);
console.log(concatenated); // [1, 2, 3, 4, 5, 6, 7]
console.log(concatArr1);   // [1, 2] — оригінал НЕ змінився

// сучасна альтернатива — spread:
console.log([...concatArr1, ...concatArr2]); // [1, 2, 3, 4]


// 13. slice(start, end) — вирізає ЧАСТИНУ масиву в НОВИЙ масив
// -----------------------------------------------------
const sliceArr = [1, 2, 3, 4, 5];
console.log(sliceArr.slice(1, 3));  // [2, 3] — end не включається
console.log(sliceArr.slice(-2));    // [4, 5] — негативний індекс: з кінця
console.log(sliceArr.slice());      // [1, 2, 3, 4, 5] — популярний спосіб СКОПІЮВАТИ масив
console.log(sliceArr);              // [1, 2, 3, 4, 5] — оригінал не змінився

// ГОЛОВНЕ МНЕМОНІЧНЕ ПРАВИЛО: slice() — "зрізати копію" (не мутує),
// splice() — "хірургічно втрутитись" (мутує оригінал)


// 14. join(separator) — перетворює масив на РЯДОК
// -----------------------------------------------------
console.log([1, 2, 3].join());     // "1,2,3" — за замовчуванням через кому
console.log([1, 2, 3].join(" - ")); // "1 - 2 - 3"
console.log([1, 2, 3].join(""));    // "123"


// 15. flat(depth) — "розплющує" вкладені масиви в НОВИЙ масив
// -----------------------------------------------------
const nestedArr = [1, [2, 3], [4, [5, 6]]];
console.log(nestedArr.flat());       // [1, 2, 3, 4, [5, 6]] — depth за замовчуванням = 1
console.log(nestedArr.flat(2));      // [1, 2, 3, 4, 5, 6] — глибина 2
console.log(nestedArr.flat(Infinity)); // повністю "сплющити", незалежно від глибини
console.log([1, [2, [3, [4]]]].flat(Infinity)); // [1, 2, 3, 4]


// 16. flatMap(callback) — map() + flat(1) за один прохід (ефективніше окремих викликів)
// -----------------------------------------------------
const sentences = ["привіт світ", "як справи"];
console.log(sentences.map((s) => s.split(" ")));      // [["привіт","світ"], ["як","справи"]]
console.log(sentences.flatMap((s) => s.split(" ")));  // ["привіт", "світ", "як", "справи"]


// 17. toSorted() / toReversed() / toSpliced() / with() — НЕМУТУЮЧІ версії (ES2023)
// -----------------------------------------------------
// Сучасна альтернатива sort()/reverse()/splice(), яка НЕ змінює
// оригінальний масив, а повертає НОВИЙ — вирішує класичну проблему
// "випадково мутував масив, на який ще є посилання деінде".

const originalForToMethods = [3, 1, 2];
const sortedCopy = originalForToMethods.toSorted((a, b) => a - b);
console.log(sortedCopy);            // [1, 2, 3]
console.log(originalForToMethods);  // [3, 1, 2] — оригінал не змінився!

console.log(originalForToMethods.toReversed()); // [2, 1, 3]
console.log(originalForToMethods.toSpliced(1, 1, "X")); // [3, "X", 2]
console.log(originalForToMethods.with(0, 100));  // [100, 1, 2] — замінити елемент за індексом


// ==========================================================================
// МЕТОДИ ПОШУКУ ТА ПЕРЕВІРКИ
// ==========================================================================

// 18. indexOf(value) / lastIndexOf(value) — пошук ЗА ЗНАЧЕННЯМ (===)
// -----------------------------------------------------
const indexOfArr = [10, 20, 30, 20];
console.log(indexOfArr.indexOf(20));     // 1 — перше входження
console.log(indexOfArr.lastIndexOf(20)); // 3 — останнє входження
console.log(indexOfArr.indexOf(999));    // -1 — не знайдено

// indexOf() використовує СУВОРУ рівність (===) — NaN НІКОЛИ не знайдеться:
console.log([NaN].indexOf(NaN)); // -1 — пастка, бо NaN !== NaN


// 19. includes(value) — чи МІСТИТЬ масив значення (повертає boolean)
// -----------------------------------------------------
console.log([1, 2, 3].includes(2));   // true
console.log([1, 2, 3].includes(99));  // false

// на відміну від indexOf(), includes() коректно знаходить NaN
// (використовує SameValueZero, як і Set/Map):
console.log([NaN].includes(NaN)); // true — тут пастки немає


// 20. find(callback) / findLast(callback) — перший/останній ЕЛЕМЕНТ за умовою
// -----------------------------------------------------
const users = [
  { id: 1, active: false },
  { id: 2, active: true },
  { id: 3, active: true },
];
console.log(users.find((u) => u.active));     // { id: 2, active: true } — перший активний
console.log(users.findLast((u) => u.active)); // { id: 3, active: true } — останній активний
console.log(users.find((u) => u.id === 999)); // undefined — якщо нічого не знайдено


// 21. findIndex(callback) / findLastIndex(callback) — перший/останній ІНДЕКС за умовою
// -----------------------------------------------------
console.log(users.findIndex((u) => u.active));     // 1
console.log(users.findLastIndex((u) => u.active)); // 2
console.log(users.findIndex((u) => u.id === 999)); // -1


// 22. some(callback) — ЧИ ХОЧА Б ОДИН елемент задовольняє умову
// -----------------------------------------------------
console.log(users.some((u) => u.active)); // true — достатньо одного
console.log([1, 2, 3].some((n) => n > 10)); // false


// 23. every(callback) — ЧИ ВСІ елементи задовольняють умову
// -----------------------------------------------------
console.log(users.every((u) => u.active)); // false — не всі активні
console.log([2, 4, 6].every((n) => n % 2 === 0)); // true — усі парні

// some()/every() на ПОРОЖНЬОМУ масиві:
console.log([].some(() => true));  // false — немає жодного, що задовольняє
console.log([].every(() => false)); // true — "усі" тривіально істинно (vacuous truth)


// ==========================================================================
// МЕТОДИ ІТЕРАЦІЇ ТА ТРАНСФОРМАЦІЇ
// ==========================================================================

// 24. forEach(callback) — виконує callback ДЛЯ КОЖНОГО елемента, нічого не повертає
// -----------------------------------------------------
[1, 2, 3].forEach((item, index, array) => {
  console.log(`${index}: ${item} з ${array.length}`);
});
// forEach() ЗАВЖДИ повертає undefined і НЕ переривається через break/return
// (для дострокового виходу треба звичайний for/for...of)


// 25. map(callback) — перетворює КОЖЕН елемент, повертає НОВИЙ масив тієї ж довжини
// -----------------------------------------------------
console.log([1, 2, 3].map((n) => n * 2)); // [2, 4, 6]
console.log(users.map((u) => u.id));       // [1, 2, 3]


// 26. filter(callback) — залишає лише елементи, що задовольняють умову
// -----------------------------------------------------
console.log([1, 2, 3, 4, 5].filter((n) => n % 2 === 0)); // [2, 4]
console.log(users.filter((u) => u.active)); // масив із двох активних користувачів


// 27. reduce(callback, initialValue) — "згортає" масив в ОДНЕ значення
// -----------------------------------------------------
// callback(accumulator, currentItem, index, array)

console.log([1, 2, 3, 4].reduce((sum, n) => sum + n, 0)); // 10 — сума
console.log([1, 2, 3, 4].reduce((max, n) => Math.max(max, n))); // 4 — без initialValue
// БЕЗ initialValue: acc починається з ПЕРШОГО елемента, ітерація йде з ДРУГОГО.
// На ПОРОЖНЬОМУ масиві без initialValue — TypeError: Reduce of empty array with no initial value

// типове застосування — групування (те, що робить Object.groupBy):
const wordsToCount = ["a", "b", "a", "c", "b", "a"];
const counts = wordsToCount.reduce((acc, word) => {
  acc[word] = (acc[word] || 0) + 1;
  return acc;
}, {});
console.log(counts); // { a: 3, b: 2, c: 1 }


// 28. reduceRight(callback, initialValue) — те саме, що reduce(), але СПРАВА НАЛІВО
// -----------------------------------------------------
console.log(["a", "b", "c"].reduce((acc, s) => acc + s));      // "abc"
console.log(["a", "b", "c"].reduceRight((acc, s) => acc + s)); // "cba"


// 29. at(index) — доступ за індексом, ПІДТРИМУЄ НЕГАТИВНІ ІНДЕКСИ (ES2022)
// -----------------------------------------------------
const atArr = [10, 20, 30];
console.log(atArr.at(0));  // 10
console.log(atArr.at(-1)); // 30 — останній елемент, без arr[arr.length - 1]
console.log(atArr[-1]);    // undefined — звичайний доступ через [] так НЕ вміє


// 30. keys() / values() / entries() — ітератори (як і в Map)
// -----------------------------------------------------
for (const index of [10, 20, 30].keys()) {
  console.log("індекс:", index); // 0, 1, 2
}
for (const value of [10, 20, 30].values()) {
  console.log("значення:", value); // 10, 20, 30
}
for (const [index, value] of [10, 20, 30].entries()) {
  console.log(index, "->", value); // 0 -> 10, 1 -> 20, 2 -> 30
}


// ==========================================================================
// СТАТИЧНІ МЕТОДИ Array
// ==========================================================================

// 31. Array.isArray(value) — надійна перевірка "чи це масив"
// -----------------------------------------------------
// typeof для масиву повертає "object" — тому для перевірки завжди
// використовують саме Array.isArray(), а не typeof.
console.log(Array.isArray([1, 2, 3])); // true
console.log(Array.isArray({}));         // false
console.log(typeof [1, 2, 3]);          // "object" — тому typeof тут марний


// 32. Array.from() і Array.of() — див. розділ "Створення масивів" вище


// ==========================================================================
// ПАСТКИ ТА ВАЖЛИВІ НЮАНСИ
// ==========================================================================

// 33. МАСИВ — ЦЕ REFERENCE TYPE (як і об'єкт)
// -----------------------------------------------------
const originalReference = [1, 2, 3];
const notACopy = originalReference; // це ТЕ САМЕ посилання, не копія!
notACopy.push(4);
console.log(originalReference); // [1, 2, 3, 4] — теж змінився

// для копіювання — spread, slice() або структурне клонування:
const properCopy = [...originalReference];
const alsoProperCopy = originalReference.slice();
const deepCopy = structuredClone(originalReference); // глибока копія, включно з вкладеними об'єктами


// 34. "ДІРКИ" В МАСИВІ (sparse arrays)
// -----------------------------------------------------
const sparseArr = [1, , 3]; // пропущений елемент — це "дірка", а не undefined
console.log(sparseArr.length); // 3
console.log(sparseArr[1]);     // undefined
// forEach/map/filter ПРОПУСКАЮТЬ дірки (не викликають callback для них):
sparseArr.forEach((item) => console.log("forEach бачить:", item)); // лише 1 і 3, не index 1
console.log(sparseArr.map((n) => n * 2)); // [2, empty, 6] — дірка залишається діркою


// 35. ЧОМУ length МОЖНА "ЗМІНИТИ ВРУЧНУ" (і навіщо це знати)
// -----------------------------------------------------
const truncatableArr = [1, 2, 3, 4, 5];
truncatableArr.length = 2; // обрізає масив!
console.log(truncatableArr); // [1, 2]

truncatableArr.length = 5; // "розширює" масив дірками
console.log(truncatableArr); // [1, 2, <3 empty items>]


// 36. МУТУЮЧІ VS НЕМУТУЮЧІ — ПОВНА ШПАРГАЛКА
// -----------------------------------------------------
// | Дія                | Мутує оригінал      | Не мутує (повертає новий/значення) |
// |---------------------|----------------------|--------------------------------------|
// | додати в кінець      | push()               | concat(), [...arr, item]            |
// | видалити з кінця     | pop()                | slice(0, -1)                        |
// | додати на початок    | unshift()            | [item, ...arr]                      |
// | видалити з початку   | shift()              | slice(1)                            |
// | видалити/вставити    | splice()             | toSpliced()                         |
// | сортувати            | sort()               | toSorted()                          |
// | розвернути           | reverse()            | toReversed()                        |
// | замінити за індексом | arr[i] = value       | with(i, value)                      |
// | заповнити значенням  | fill()               | Array(n).fill() на новому масиві    |


// ПІДСУМОК:
// - Array — впорядкована колекція значень за числовим індексом,
//   технічно теж об'єкт (Array.prototype ← Object.prototype)
// - створення: [], new Array(), Array.of(), Array.from() (з iterable/array-like)
// - мутуючі методи (змінюють оригінал): push/pop/shift/unshift/
//   splice/sort/reverse/fill/copyWithin
// - немутуючі методи (повертають новий масив): concat/slice/flat/
//   flatMap/toSorted/toReversed/toSpliced/with
// - пошук: indexOf/lastIndexOf (===, ламається на NaN), includes
//   (SameValueZero, коректно з NaN), find/findLast/findIndex/findLastIndex
// - перевірка: some (хоч один), every (усі)
// - ітерація/трансформація: forEach, map, filter, reduce/reduceRight,
//   at (негативні індекси), keys/values/entries
// - Array.isArray() — єдиний надійний спосіб перевірити тип масиву
// - масив — reference type: просте присвоєння НЕ копіює, потрібен
//   spread/slice()/structuredClone()
// - є "дірки" (sparse arrays) — forEach/map їх пропускають
// - при виборі методу — думай "мутує чи ні": сучасний код частіше
//   тяжіє до немутуючих версій (toSorted, toReversed тощо)
