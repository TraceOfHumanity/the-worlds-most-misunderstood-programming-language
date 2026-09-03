// ==========================================================================
// ITERATOR / ITERABLE — ПРОТОКОЛИ ІТЕРАЦІЇ В JAVASCRIPT (ES6)
// ==========================================================================

// 1. ДВА ОКРЕМІ ПРОТОКОЛИ: ITERATOR ТА ITERABLE
// -----------------------------------------------------
// Це НЕ одне й те саме, хоча терміни часто плутають:
//
//   ITERATOR PROTOCOL (протокол ІТЕРАТОРА):
//   об'єкт є ітератором, якщо в нього є метод next(), який
//   ПОВЕРТАЄ ОБ'ЄКТ виду { value, done }:
//     - value — поточне значення на цьому кроці ітерації
//     - done  — false, поки є ще значення; true, коли ітерація скінчена
//
//   ITERABLE PROTOCOL (протокол ІТЕРОВАНОГО):
//   об'єкт є iterable, якщо в нього є метод [Symbol.iterator](),
//   який ПОВЕРТАЄ ІТЕРАТОР (об'єкт за протоколом вище).
//
// Саме через ЦІ ДВА протоколи працюють for...of, spread [...obj],
// деструктуризація масивів, Array.from(), Promise.all() тощо —
// вони всі шукають [Symbol.iterator] на об'єкті.

const manualIterator = {
  current: 1,
  last: 3,
  next() {
    if (this.current <= this.last) {
      return { value: this.current++, done: false };
    }
    return { value: undefined, done: true };
  },
};
// це "чистий" ІТЕРАТОР — має next(), але НЕ iterable
// (немає [Symbol.iterator]), тому for...of по ньому НЕ спрацює:
console.log(manualIterator.next()); // { value: 1, done: false }
console.log(manualIterator.next()); // { value: 2, done: false }
console.log(manualIterator.next()); // { value: 3, done: false }
console.log(manualIterator.next()); // { value: undefined, done: true }
// for (const x of manualIterator) {} // TypeError: manualIterator is not iterable


// ==========================================================================
// 2. СТВОРЕННЯ ВЛАСНОГО ITERABLE-ОБ'ЄКТА
// ==========================================================================

// Щоб об'єкт став ІТЕРОВАНИМ (можна писати for...of, [...obj]),
// потрібно реалізувати [Symbol.iterator]() — метод БЕЗ АРГУМЕНТІВ,
// що повертає новий об'єкт-ітератор із власним next().

const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  },
};

for (const n of range) {
  console.log(n); // 1, 2, 3, 4, 5
}
console.log([...range]); // [1, 2, 3, 4, 5] — spread теж працює завдяки Symbol.iterator

// деструктуризація теж використовує ітерацію "під капотом":
const [a, b] = range;
console.log(a, b); // 1 2 — беруться перші два значення з ітератора


// 3. ЧОМУ [Symbol.iterator]() ПОВЕРТАЄ НОВИЙ ОБ'ЄКТ КОЖНОГО РАЗУ
// -----------------------------------------------------
// Кожен виклик range[Symbol.iterator]() створює НОВИЙ, незалежний
// об'єкт-ітератор із власним замиканням над current. Це дозволяє
// перебирати range ОДНОЧАСНО кілька разів, не заважаючи одне одному:

const iteratorRun1 = range[Symbol.iterator]();
const iteratorRun2 = range[Symbol.iterator]();
console.log(iteratorRun1.next().value); // 1
console.log(iteratorRun1.next().value); // 2
console.log(iteratorRun2.next().value); // 1 — незалежний прогрес, не 3!


// ==========================================================================
// 4. ВБУДОВАНІ ІТЕРОВАНІ ТИПИ — Array, String, Map, Set
// ==========================================================================

// Усі ці вбудовані структури даних ВЖЕ РЕАЛІЗУЮТЬ [Symbol.iterator]
// самі — саме тому for...of одразу працює з ними без жодних
// додаткових зусиль з боку розробника.

// а) Array — ітератор по ЗНАЧЕННЯХ (еквівалент arr.values())
const arr = [10, 20, 30];
const arrIterator = arr[Symbol.iterator]();
console.log(arrIterator.next()); // { value: 10, done: false }
console.log(arrIterator.next()); // { value: 20, done: false }
console.log(arrIterator.next()); // { value: 30, done: false }
console.log(arrIterator.next()); // { value: undefined, done: true }

// б) String — ітератор по СИМВОЛАХ (коректно враховує Unicode-пари!)
const str = "hi";
const strIterator = str[Symbol.iterator]();
console.log(strIterator.next()); // { value: "h", done: false }
console.log(strIterator.next()); // { value: "i", done: false }
console.log(strIterator.next()); // { value: undefined, done: true }

// рядкова ітерація коректно обробляє символи поза Basic Multilingual
// Plane (наприклад, емодзі), на відміну від звичайного індексування:
const emojiStr = "a😀b";
console.log(emojiStr.length);        // 4 — емодзі займає 2 "code unit"
console.log([...emojiStr]);          // ["a", "😀", "b"] — а ітерація бачить його як ОДИН символ
console.log(emojiStr[1], emojiStr[2]); // "half-emoji" surrogate pairs — зламане індексування

// в) Map — ітератор по ПАРАХ [ключ, значення] (еквівалент map.entries())
const map = new Map([
  ["a", 1],
  ["b", 2],
]);
for (const [key, val] of map) {
  console.log(key, val); // a 1 / b 2
}

// г) Set — ітератор по ЗНАЧЕННЯХ (еквівалент set.values())
const set = new Set([1, 2, 3]);
for (const value of set) {
  console.log(value); // 1, 2, 3
}


// ==========================================================================
// 5. ЩО САМЕ РОЗУМІЄ [Symbol.iterator] "ПІД КАПОТОМ" — for...of, spread, і т.д.
// ==========================================================================

// for...of (і всі інші механізми, що працюють з iterable) —
// це, по суті, синтаксичний цукор над таким циклом:

function manualForOf(iterable, callback) {
  const iterator = iterable[Symbol.iterator]();
  let result = iterator.next();
  while (!result.done) {
    callback(result.value);
    result = iterator.next();
  }
}
manualForOf([1, 2, 3], (value) => console.log("вручну:", value));
// вручну: 1 / вручну: 2 / вручну: 3

// СПИСОК МЕХАНІЗМІВ, ЯКІ СПИРАЮТЬСЯ САМЕ НА ІТЕРОВАНІСТЬ:
// for...of, spread [...x] / {...x у Map/Set-подібних не спрацює для об'єктів},
// деструктуризація масивів, Array.from(iterable), Promise.all(iterable),
// new Map(iterable) / new Set(iterable), yield* усередині генераторів


// ==========================================================================
// 6. ДЕЛЕГУВАННЯ ГОТОВОМУ ІТЕРАТОРУ — НАЙПРОСТІШИЙ СПОСІБ ЗРОБИТИ OBJ ITERABLE
// ==========================================================================

// Якщо всередині об'єкта вже є масив (чи інша iterable-структура),
// найпростіше — просто ДЕЛЕГУВАТИ виклик його готовому ітератору,
// а не писати next() вручну.

const customCollection = {
  items: ["x", "y", "z"],
  [Symbol.iterator]() {
    return this.items[Symbol.iterator](); // делегування ітератору масиву
  },
};

for (const item of customCollection) {
  console.log(item); // x, y, z
}
console.log(Array.from(customCollection)); // ["x", "y", "z"]


// ==========================================================================
// 7. ГЕНЕРАТОРИ (function*) — НАБАГАТО ПРОСТІШИЙ СПОСІБ СТВОРИТИ ІТЕРАТОР
// ==========================================================================

// Функція-генератор (function* / yield) АВТОМАТИЧНО повертає об'єкт,
// що ОДНОЧАСНО є і ітератором (має next()), і iterable (має власний
// [Symbol.iterator](), що повертає сам себе) — не потрібно вручну
// писати { value, done } на кожному кроці, рушій робить це сам.

function* genRange(from, to) {
  for (let i = from; i <= to; i++) {
    yield i; // "призупиняє" функцію й повертає { value: i, done: false }
  }
  // неявний return після циклу дає останній { value: undefined, done: true }
}

const gen = genRange(1, 3);
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }

// генератор сам є iterable — тому for...of працює напряму:
for (const n of genRange(5, 7)) {
  console.log(n); // 5, 6, 7
}

// ПЕРЕПИСУЮЧИ range ІЗ ПУНКТУ 2 ЧЕРЕЗ ГЕНЕРАТОР — набагато коротше:
const rangeWithGenerator = {
  from: 1,
  to: 5,
  *[Symbol.iterator]() { // генераторний метод одразу як [Symbol.iterator]
    for (let i = this.from; i <= this.to; i++) {
      yield i;
    }
  },
};
console.log([...rangeWithGenerator]); // [1, 2, 3, 4, 5] — той самий результат, менше коду


// ==========================================================================
// 8. НЕСКІНЧЕННІ ІТЕРАТОРИ (LAZY EVALUATION)
// ==========================================================================

// Ітератор НЕ ЗОБОВ'ЯЗАНИЙ колись завершитись (done: true) — можна
// створити НЕСКІНЧЕННУ послідовність, яка обчислює наступне значення
// ЛІШЕ ЗА ЗАПИТОМ ("ліниво" / lazily), а не одразу всю наперед.
// Це головна перевага ітераторів над "готовими" масивами: пам'ять
// не витрачається на всі значення одразу.

const infiniteSequence = {
  start: 0,
  [Symbol.iterator]() {
    let current = this.start;
    return {
      next() {
        return { value: current++, done: false }; // done ЗАВЖДИ false — нескінченно!
      },
    };
  },
};
// [...infiniteSequence]; // НІКОЛИ не завершиться — так робити не можна!

// щоб безпечно користуватись нескінченним ітератором, потрібен
// спосіб ОБМЕЖИТИ кількість значень, які реально забираються:

function take(iterable, count) {
  return {
    [Symbol.iterator]() {
      const it = iterable[Symbol.iterator]();
      let remaining = count;
      return {
        next() {
          if (remaining <= 0) {
            return { value: undefined, done: true };
          }
          const result = it.next();
          if (result.done) {
            return result;
          }
          remaining--;
          return result;
        },
      };
    },
  };
}

const limited = [...take(infiniteSequence, 5)];
console.log(limited); // [0, 1, 2, 3, 4] — нескінченний ітератор, обмежений через take()

// той самий take() через генератор — набагато читабельніше:
function* takeGenerator(iterable, count) {
  let i = 0;
  for (const value of iterable) {
    if (i++ >= count) return;
    yield value;
  }
}
console.log([...takeGenerator(infiniteSequence, 3)]); // [0, 1, 2]


// ==========================================================================
// 9. return() ТА throw() — ДОДАТКОВІ (НЕОБОВ'ЯЗКОВІ) МЕТОДИ ІТЕРАТОРА
// ==========================================================================

// Окрім обов'язкового next(), ітератор МОЖЕ мати необов'язкові
// методи return() і throw(). return() рушій викликає АВТОМАТИЧНО,
// коли ітерація завершується ДОСТРОКОВО (break, return, throw
// усередині for...of) — це шанс "прибрати за собою" (закрити файл,
// звільнити ресурс тощо).

function iterableWithCleanup() {
  return {
    [Symbol.iterator]() {
      let i = 0;
      return {
        next() {
          return i < 5 ? { value: i++, done: false } : { value: undefined, done: true };
        },
        return(value) {
          console.log("прибирання ресурсів (return викликано достроково)");
          return { value, done: true };
        },
      };
    },
  };
}

for (const n of iterableWithCleanup()) {
  console.log(n);
  if (n === 2) break; // достроковий вихід → рушій викликає return() автоматично
}
// 0 / 1 / 2 / "прибирання ресурсів (return викликано достроково)"


// ==========================================================================
// 10. ITERATOR HELPERS — МЕТОДИ ПРЯМО НА ІТЕРАТОРІ (ES2025)
// ==========================================================================

// Сучасні рушії додали методи, схожі на масивні (map/filter/take/
// drop/reduce), які працюють НАПРЯМУ на ІТЕРАТОРІ — ЛІНИВО
// (обчислюють значення по одному, а не будують проміжні масиви).

function* naturalNumbers() {
  let n = 1;
  while (true) yield n++;
}

const firstFiveEvenSquares = naturalNumbers()
  .filter((n) => n % 2 === 0) // лінивий фільтр
  .map((n) => n * n)          // лінивий мапінг
  .take(5)                    // лише перші 5 — саме тут "лінивість" рятує від нескінченного циклу
  .toArray();                 // матеріалізація в звичайний масив

console.log(firstFiveEvenSquares); // [4, 16, 36, 64, 100]
// без Iterator Helpers довелось би писати take()/filter()/map() вручну,
// як показано в пунктах 7-8 вище


// ==========================================================================
// 11. ITERATOR vs GENERATOR vs ITERABLE — ЯК НЕ ПЛУТАТИ ТЕРМІНИ
// ==========================================================================

// | Термін     | Що це                                                     |
// |-------------|------------------------------------------------------------|
// | Iterator    | будь-який об'єкт з next(), що повертає { value, done }    |
// | Iterable    | будь-який об'єкт з [Symbol.iterator](), що повертає iterator |
// | Generator   | СПЕЦІАЛЬНА функція (function*), яка АВТОМАТИЧНО створює   |
// |             | об'єкт, що є одразу і iterator, і iterable                 |

// генератор — це просто НАЙЗРУЧНІШИЙ спосіб отримати правильно
// побудований iterator/iterable, а не окрема, третя сутність


// ПІДСУМОК:
// - Iterator protocol: об'єкт з next(), що повертає { value, done }
// - Iterable protocol: об'єкт з [Symbol.iterator](), що повертає iterator
// - саме на цих двох протоколах тримаються for...of, spread,
//   деструктуризація масивів, Array.from(), Promise.all(), new Map()/Set()
// - Array/String/Map/Set вже iterable "з коробки" — не потребують
//   ручної реалізації
// - String-ітерація коректно враховує Unicode-пари (емодзі), на
//   відміну від прямого індексування рядка
// - найпростіший спосіб зробити об'єкт iterable — делегувати
//   готовому ітератору внутрішньої структури (this.items[Symbol.iterator]())
// - генератори (function*) — набагато простіший спосіб написати
//   ітератор: рушій сам формує { value, done } на кожному yield
// - ітератор може бути НЕСКІНЧЕННИМ (лінива послідовність) — головна
//   перевага над готовими масивами; для безпечного споживання
//   потрібен take()-подібний обмежувач
// - необов'язкові return()/throw() дають шанс "прибрати ресурси"
//   при достроковому виході з for...of (break/return/throw)
// - Iterator Helpers (ES2025) — map/filter/take/drop/reduce/toArray
//   напряму на ітераторі, ліниво, без побудови проміжних масивів