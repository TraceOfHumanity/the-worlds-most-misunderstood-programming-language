// ==========================================================================
// АСИНХРОННИЙ КОД У JAVASCRIPT — УСІ ПІДХОДИ ТА ЯК ЦЕ ПРАЦЮЄ "ПІД КАПОТОМ"
// ==========================================================================

// 0. ЧОМУ ВЗАГАЛІ ІСНУЄ АСИНХРОННІСТЬ: JS — ОДНОПОТОКОВИЙ (SINGLE-THREADED)
// -----------------------------------------------------
// У JS є ЛИШЕ ОДИН потік виконання (call stack) — два шматки JS-коду
// НІКОЛИ не виконуються буквально одночасно. Але операції, що
// вимагають ЧАСУ ОЧІКУВАННЯ (мережевий запит, таймер, читання файлу),
// не повинні "заморожувати" цей єдиний потік — інакше сторінка/сервер
// зависає. Тому такі операції передаються "рушію" (браузеру/Node),
// а сам JS-потік у цей час продовжує виконувати ІНШИЙ код. Коли
// операція завершується, її колбек/обробник СТАЄ В ЧЕРГУ і виконується,
// коли call stack звільниться. Саме ця модель — "call stack + черги
// завдань + event loop" — і є фундаментом усього, що написано нижче.


// ==========================================================================
// СПОСІБ 1: CALLBACK (найстаріший підхід)
// ==========================================================================

// 1. ЩО ТАКЕ CALLBACK
// -----------------------------------------------------
// Callback — це просто функція, яку передають ІНШІЙ функції, щоб та
// викликала її ПІЗНІШЕ, коли асинхронна операція завершиться.

function loadUserCallback(id, onSuccess, onError) {
  setTimeout(() => {
    if (id <= 0) {
      onError(new Error("Некоректний id"));
      return;
    }
    onSuccess({ id, name: "Іван" });
  }, 500);
}

loadUserCallback(
  1,
  (user) => console.log("користувач завантажений:", user),
  (err) => console.log("помилка:", err.message)
);


// 2. "CALLBACK HELL" (ПІРАМІДА ПРИРЕЧЕННЯ) — ГОЛОВНА ПРОБЛЕМА ПІДХОДУ
// -----------------------------------------------------
// Коли одна асинхронна операція залежить від результату попередньої,
// колбеки вкладаються один в одного — код "з'їжджає" вправо і стає
// важким для читання й обробки помилок (кожен рівень має власний
// try/catch-подібний обробник помилок).

function loadUser(id, cb) {
  setTimeout(() => cb(null, { id, name: "Іван" }), 100);
}
function loadPosts(userId, cb) {
  setTimeout(() => cb(null, [{ id: 1, title: "Пост 1" }]), 100);
}
function loadComments(postId, cb) {
  setTimeout(() => cb(null, ["Коментар 1"]), 100);
}

loadUser(1, (err1, user) => {
  if (err1) return console.log(err1);
  loadPosts(user.id, (err2, posts) => {
    if (err2) return console.log(err2);
    loadComments(posts[0].id, (err3, comments) => {
      if (err3) return console.log(err3);
      console.log("callback hell результат:", { user, posts, comments });
      // ще один рівень вкладеності — і читати це стає дедалі важче
    });
  });
});


// 3. NODE.JS "ERROR-FIRST CALLBACK" КОНВЕНЦІЯ
// -----------------------------------------------------
// Історичний стандарт Node.js: перший аргумент колбека ЗАВЖДИ
// зарезервований під помилку (err), або null/undefined, якщо все ок.
// Саме так побудовані показані вище loadUser/loadPosts/loadComments.

function readFileNodeStyle(path, callback) {
  const fakeFileSystem = { "/config.json": '{"debug": true}' };
  setTimeout(() => {
    if (!(path in fakeFileSystem)) {
      callback(new Error(`Файл ${path} не знайдено`));
      return;
    }
    callback(null, fakeFileSystem[path]);
  }, 50);
}
readFileNodeStyle("/config.json", (err, content) => {
  if (err) return console.log("помилка:", err.message);
  console.log("вміст файлу:", content);
});


// ==========================================================================
// СПОСІБ 2: PROMISE (ES6) — АБСТРАКЦІЯ НАД "МАЙБУТНІМ" ЗНАЧЕННЯМ
// ==========================================================================

// 4. ЩО ТАКЕ Promise І ЙОГО ТРИ СТАНИ
// -----------------------------------------------------
// Promise — об'єкт, що представляє значення, яке БУДЕ (або НЕ буде)
// доступне в майбутньому. Має РІВНО ТРИ стани, і перехід між ними
// ОДНОСТОРОННІЙ (назад повернутись не можна):
//   - pending   (очікування) — початковий стан, ще невідомо, чим закінчиться
//   - fulfilled (виконано)   — операція успішна, є значення
//   - rejected  (відхилено)  — операція провалилась, є причина помилки

const pendingPromise = new Promise((resolve, reject) => {
  // executor — виконується СИНХРОННО й НЕГАЙНО, у момент створення Promise
  console.log("executor виконується одразу");
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve("значення при успіху"); // → стан переходить у fulfilled
    } else {
      reject(new Error("причина відхилення")); // → стан переходить у rejected
    }
  }, 300);
});
console.log("цей рядок виконається РАНІШЕ за колбек setTimeout всередині");


// 5. .then() / .catch() / .finally() — ПІДПИСКА НА РЕЗУЛЬТАТ
// -----------------------------------------------------
pendingPromise
  .then((value) => {
    console.log("успіх:", value); // спрацює, коли Promise стане fulfilled
    return value.toUpperCase();    // те, що ПОВЕРНУТО тут, стає значенням НАСТУПНОГО .then()
  })
  .then((upperValue) => {
    console.log("після трансформації:", upperValue);
  })
  .catch((error) => {
    console.log("спіймана помилка:", error.message); // спрацює при reject У БУДЬ-ЯКОМУ .then() вище
  })
  .finally(() => {
    console.log("finally: виконається ЗАВЖДИ, і при success, і при error");
  });


// 6. PROMISE CHAINING (ЛАНЦЮЖКИ) — РІШЕННЯ ПРОБЛЕМИ "CALLBACK HELL"
// -----------------------------------------------------
// Кожен .then() ПОВЕРТАЄ НОВИЙ Promise — тому виклики можна пов'язувати
// в ПЛОСКИЙ (а не вкладений) ланцюжок. Якщо колбек .then() повертає
// ЗВИЧАЙНЕ значення — воно "обгортається" в Promise.resolve() автоматично;
// якщо повертає ІНШИЙ Promise — ланцюжок "чекає" на нього перед тим,
// як передати результат далі (це і називається "розгортання"/unwrapping).

function loadUserPromise(id) {
  return new Promise((resolve) => setTimeout(() => resolve({ id, name: "Іван" }), 100));
}
function loadPostsPromise(userId) {
  return new Promise((resolve) => setTimeout(() => resolve([{ id: 1, title: "Пост 1" }]), 100));
}
function loadCommentsPromise(postId) {
  return new Promise((resolve) => setTimeout(() => resolve(["Коментар 1"]), 100));
}

loadUserPromise(1)
  .then((user) => loadPostsPromise(user.id))     // повертаємо НОВИЙ Promise — ланцюжок його дочекається
  .then((posts) => loadCommentsPromise(posts[0].id))
  .then((comments) => console.log("promise chain результат:", comments))
  .catch((err) => console.log("будь-яка помилка з БУДЬ-ЯКОГО кроку ланцюжка:", err));
// ОДИН .catch() у КІНЦІ ланцюжка ловить помилку з БУДЬ-ЯКОГО попереднього
// кроку — не потрібно перевіряти помилку на кожному рівні окремо,
// як це було з callback hell


// 7. Promise.resolve() / Promise.reject() — ГОТОВІ ПРОМІСИ ОДРАЗУ
// -----------------------------------------------------
console.log(0);
Promise.resolve(1).then((data) => console.log("Promise.resolve:", data));
console.log(2);
// ВАЖЛИВО: навіть якщо Promise ВЖЕ вирішений у момент створення,
// .then() ВСЕ ОДНО виконається АСИНХРОННО (у мікрозадачі, див. пункт 15) —
// тому порядок виводу буде: 0, 2, "Promise.resolve: 1"

Promise.reject(new Error("одразу відхилено")).catch((e) => console.log(e.message));

// Promise.resolve(value) також "розгортає" вкладені проміси/thenable —
// якщо value вже є Promise, повертається ВІН САМ, а не обгортка навколо нього:
const original = Promise.resolve(42);
console.log(Promise.resolve(original) === original); // true


// ==========================================================================
// 8. СТАТИЧНІ МЕТОДИ-КОМБІНАТОРИ ДЛЯ РОБОТИ З КІЛЬКОМА PROMISE
// ==========================================================================

const fastPromise = new Promise((r) => setTimeout(() => r("швидкий"), 100));
const slowPromise = new Promise((r) => setTimeout(() => r("повільний"), 300));
const failingPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("провал")), 200));


// 8.1. Promise.all() — ЧЕКАЄ НА ВСІ, "ФЕЙЛИТЬСЯ" НА ПЕРШІЙ ЖЕ ПОМИЛЦІ
// -----------------------------------------------------
// Виконується ПАРАЛЕЛЬНО (усі проміси стартують одразу, а не по черзі).
// fulfilled лише якщо ВСІ успішні; якщо ХОЧА Б ОДИН rejected —
// одразу reject (навіть якщо решта ще не завершились).

Promise.all([fastPromise, slowPromise])
  .then((results) => console.log("Promise.all:", results)) // ["швидкий", "повільний"] — порядок ЗБЕРІГАЄТЬСЯ, як у вхідному масиві
  .catch((err) => console.log("Promise.all помилка:", err));

Promise.all([fastPromise, failingPromise, slowPromise]).catch((err) =>
  console.log("Promise.all відхилено через один провал:", err.message)
);


// 8.2. Promise.allSettled() — ЧЕКАЄ НА ВСІ, НІКОЛИ НЕ "ФЕЙЛИТЬСЯ" (ES2020)
// -----------------------------------------------------
// Завжди fulfilled — повертає масив ОБ'ЄКТІВ-РЕЗУЛЬТАТІВ для кожного
// проміса: { status: "fulfilled", value } або { status: "rejected", reason }.
// Ідеально, коли треба знати результат КОЖНОЇ операції, навіть якщо
// частина з них провалилась.

Promise.allSettled([fastPromise, failingPromise]).then((results) => {
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      console.log("успіх:", result.value);
    } else {
      console.log("провал:", result.reason.message);
    }
  });
});


// 8.3. Promise.race() — ПЕРШИЙ, ХТО ЗАВЕРШИТЬСЯ (УСПІХ АБО ПОМИЛКА)
// -----------------------------------------------------
Promise.race([fastPromise, slowPromise]).then((result) => console.log("Promise.race:", result)); // "швидкий"
Promise.race([failingPromise, slowPromise]).catch((err) => console.log("race завершився помилкою:", err.message));

// ТИПОВЕ ЗАСТОСУВАННЯ race() — РЕАЛІЗАЦІЯ TIMEOUT ДЛЯ БУДЬ-ЯКОЇ ОПЕРАЦІЇ:
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Час очікування ${ms}мс вичерпано`)), ms)
  );
  return Promise.race([promise, timeout]);
}
withTimeout(slowPromise, 50).catch((err) => console.log(err.message)); // "Час очікування 50мс вичерпано"


// 8.4. Promise.any() — ПЕРШИЙ УСПІШНИЙ (ES2021)
// -----------------------------------------------------
// fulfilled ЩОЙНО хоч ОДИН проміс став успішним; reject ЛИШЕ якщо
// АБСОЛЮТНО ВСІ проміси провалились (з AggregateError, що містить
// усі причини відхилення).

Promise.any([failingPromise, slowPromise]).then((result) => console.log("Promise.any:", result)); // "повільний"

Promise.any([failingPromise, Promise.reject(new Error("ще один провал"))]).catch((err) => {
  console.log("Promise.any: усі провалились —", err instanceof AggregateError, err.errors.length);
});


// ==========================================================================
// СПОСІБ 3: ASYNC/AWAIT (ES2017) — СИНТАКСИЧНИЙ ЦУКОР НАД PROMISE
// ==========================================================================

// 9. ОСНОВИ: async ФУНКЦІЯ ЗАВЖДИ ПОВЕРТАЄ Promise
// -----------------------------------------------------
// await МОЖНА використовувати ЛИШЕ всередині функції, позначеної
// async (за винятком top-level await у ES-модулях — пункт 14).
// await "призупиняє" виконання ЛИШЕ ЦІЄЇ функції (не блокуючи
// весь потік!) до моменту, коли Promise поруч із await вирішиться.

async function loadUserAsync(id) {
  console.log("починаємо завантаження");
  const user = await loadUserPromise(id); // "чекаємо" результат, не блокуючи інший код
  console.log("користувач готовий:", user);
  return user; // async-функція АВТОМАТИЧНО обгортає це в Promise.resolve(user)
}

const returnedPromise = loadUserAsync(1);
console.log(returnedPromise instanceof Promise); // true — навіть без явного `return new Promise(...)`
returnedPromise.then((user) => console.log("отримано ззовні:", user));


// 10. ПЕРЕПИСУЄМО "ПІРАМІДУ" ЛАНЦЮЖКОМ await — ЧИТАЄТЬСЯ ЯК СИНХРОННИЙ КОД
// -----------------------------------------------------
async function loadEverything() {
  try {
    const user = await loadUserPromise(1);
    const posts = await loadPostsPromise(user.id);
    const comments = await loadCommentsPromise(posts[0].id);
    console.log("async/await результат:", { user, posts, comments });
    return { user, posts, comments };
  } catch (error) {
    // ОДИН try/catch ловить помилку з БУДЬ-ЯКОГО await вище —
    // так само зручно, як один .catch() у Promise-ланцюжку
    console.log("помилка десь у ланцюжку:", error.message);
    throw error; // можна прокинути далі — виклик loadEverything() поверне rejected Promise
  } finally {
    console.log("finally виконається завжди, як і в Promise");
  }
}
loadEverything();


// 11. ПОСЛІДОВНЕ (SEQUENTIAL) ВИКОНАННЯ VS ПАРАЛЕЛЬНЕ (PARALLEL) — КЛАСИЧНА ПАСТКА
// -----------------------------------------------------
// Кожен await ЧЕКАЄ ЗАВЕРШЕННЯ попереднього, перш ніж перейти далі.
// Якщо операції НЕ залежать одна від одної, послідовні await —
// це марна витрата часу (сумарний час = сума ВСІХ операцій).

async function sequentialSlow() {
  console.time("послідовно");
  const a = await new Promise((r) => setTimeout(() => r("A"), 300));
  const b = await new Promise((r) => setTimeout(() => r("B"), 300));
  console.timeEnd("послідовно"); // ~600мс — операції виконались ПО ЧЕРЗІ
  return [a, b];
}

// ПРАВИЛЬНО: якщо операції незалежні — запускай їх ОДРАЗУ (без await),
// а await РОБИ на Promise.all([...]) — так вони виконуються ПАРАЛЕЛЬНО:
async function parallelFast() {
  console.time("паралельно");
  const promiseA = new Promise((r) => setTimeout(() => r("A"), 300)); // стартувало одразу
  const promiseB = new Promise((r) => setTimeout(() => r("B"), 300)); // теж стартувало одразу, НЕ чекаючи promiseA
  const [a, b] = await Promise.all([promiseA, promiseB]);
  console.timeEnd("паралельно"); // ~300мс — обидві операції йшли ОДНОЧАСНО
  return [a, b];
}
sequentialSlow();
parallelFast();


// 12. ПОМИЛКИ В async/await — ЯКЩО ЗАБУТИ try/catch
// -----------------------------------------------------
async function willThrow() {
  throw new Error("щось пішло не так");
}
// БЕЗ .catch()/try-catch помилка стане UNHANDLED PROMISE REJECTION:
willThrow().catch((err) => console.log("перехоплено ззовні:", err.message));

// у Node.js/браузері необроблена rejection породжує подію,
// яку МОЖНА (і варто) слухати глобально для логування/діагностики:
// process.on("unhandledRejection", (reason) => console.log("необроблено:", reason));      // Node.js
// window.addEventListener("unhandledrejection", (event) => console.log(event.reason));    // браузер


// 13. await У ЦИКЛАХ — for...of (послідовно) VS map+Promise.all (паралельно)
// -----------------------------------------------------
async function processSequentially(ids) {
  const results = [];
  for (const id of ids) {
    const user = await loadUserPromise(id); // КОЖНА ітерація чекає ПОПЕРЕДНЮ — повільно, але по черзі
    results.push(user);
  }
  return results;
}

async function processInParallel(ids) {
  const promises = ids.map((id) => loadUserPromise(id)); // усі запити стартують ОДРАЗУ
  return Promise.all(promises); // await тут лише один — на весь набір одразу
}
processSequentially([1, 2, 3]).then((r) => console.log("послідовно:", r));
processInParallel([1, 2, 3]).then((r) => console.log("паралельно:", r));

// forEach() з async-колбеком — КЛАСИЧНА ПАСТКА: await всередині
// forEach НЕ ЗУПИНЯЄ сам forEach від переходу до наступного елемента,
// бо forEach ІГНОРУЄ повернені проміси колбека:
async function brokenForEachDemo(ids) {
  ids.forEach(async (id) => {
    const user = await loadUserPromise(id);
    console.log("з forEach (непередбачуваний порядок завершення):", user);
  });
  console.log("цей рядок виконається РАНІШЕ за всі await всередині forEach!");
}
brokenForEachDemo([1, 2]);


// ==========================================================================
// 14. TOP-LEVEL AWAIT (ES2022) — await ПОЗА async-ФУНКЦІЄЮ
// ==========================================================================

// У ES-МОДУЛЯХ (файл з import/export, чи <script type="module">)
// МОЖНА використовувати await прямо на верхньому рівні файлу,
// без обгортання в async function. У звичайних CommonJS/script-файлах
// це НЕ підтримується.

// // config.mjs (ES-модуль):
// const response = await fetch("https://api.example.com/config");
// export const config = await response.json();
// // імпортер цього модуля буде "чекати" завершення await перед продовженням


// ==========================================================================
// 15. EVENT LOOP: МІКРОЗАДАЧІ (MICROTASKS) VS МАКРОЗАДАЧІ (MACROTASKS)
// ==========================================================================

// ЦЕ ГОЛОВНА ПРИЧИНА "НЕОЧІКУВАНОГО" ПОРЯДКУ ВИКОНАННЯ АСИНХРОННОГО
// КОДУ. Рушій має ДВІ РІЗНІ черги завдань (окрім самого call stack):
//   - MICROTASK QUEUE  — колбеки .then()/.catch()/.finally(), await,
//     queueMicrotask() — ВИЩИЙ пріоритет
//   - MACROTASK QUEUE (task queue) — setTimeout, setInterval, події
//     UI, I/O у Node.js — НИЖЧИЙ пріоритет
//
// ПРАВИЛО EVENT LOOP: після КОЖНОЇ макрозадачі (і після виконання
// всього синхронного коду скрипту) рушій ПОВНІСТЮ СПОРОЖНЯЄ ВСЮ
// чергу мікрозадач (включно з тими, що додались УЖЕ ПІД ЧАС їх
// виконання!), і ЛИШЕ ПОТІМ бере ОДНУ наступну макрозадачу.

console.log("1 (синхронний код)");

setTimeout(() => console.log("4 (macrotask: setTimeout)"), 0);

Promise.resolve().then(() => console.log("3 (microtask: Promise.then)"));

console.log("2 (синхронний код)");

// РЕАЛЬНИЙ ПОРЯДОК ВИВОДУ: 1, 2, 3, 4
// - увесь синхронний код (1, 2) виконується першим, до будь-яких черг
// - потім спорожняється ЦІЛКОМ черга мікрозадач (3)
// - і лише ПОТІМ бере поточну макрозадачу (4), навіть з таймером 0мс


// 16. ЧОМУ setTimeout(fn, 0) НЕ ВИКОНУЄТЬСЯ "ОДРАЗУ"
// -----------------------------------------------------
setTimeout(() => console.log("макрозадача з 0мс"), 0);
Promise.resolve()
  .then(() => console.log("мікрозадача #1"))
  .then(() => console.log("мікрозадача #2")) // ще одна мікрозадача, додана ПІД ЧАС обробки черги
  .then(() => console.log("мікрозадача #3"));
console.log("синхронний код виконався першим");
// Порядок: "синхронний код виконався першим", "мікрозадача #1",
// "мікрозадача #2", "мікрозадача #3", "макрозадача з 0мс" —
// УСІ мікрозадачі (навіть додані одна за одною) виконаються
// РАНІШЕ за будь-яку макрозадачу, незалежно від заявленої затримки


// 17. queueMicrotask() — ЯВНЕ ДОДАВАННЯ В ЧЕРГУ МІКРОЗАДАЧ
// -----------------------------------------------------
console.log("до queueMicrotask");
queueMicrotask(() => console.log("всередині queueMicrotask"));
console.log("після queueMicrotask (виконається РАНІШЕ за колбек вище)");


// ==========================================================================
// СПОСІБ 4: ГЕНЕРАТОРИ ДЛЯ АСИНХРОННОГО КОДУ (ІСТОРИЧНО ВАЖЛИВО)
// ==========================================================================

// 18. function* + yield ЯК ПОПЕРЕДНИК async/await
// -----------------------------------------------------
// ДО появи async/await (ES2017) схожого "синхронно виглядаючого"
// стилю досягали за допомогою генераторів + "раннера" (наприклад,
// бібліотеки co) — генератор ПРИЗУПИНЯЄТЬСЯ на yield, а зовнішній
// код керує, коли й з яким значенням продовжити.

function runGenerator(generatorFn) {
  const iterator = generatorFn();
  function step(input) {
    const { value, done } = iterator.next(input);
    if (done) return value;
    // value очікується як Promise — "чекаємо" і продовжуємо генератор
    return Promise.resolve(value).then(step);
  }
  return step();
}

function* loadEverythingGenerator() {
  const user = yield loadUserPromise(1); // "призупинились" тут, чекаючи Promise
  const posts = yield loadPostsPromise(user.id);
  const comments = yield loadCommentsPromise(posts[0].id);
  return { user, posts, comments };
}

runGenerator(loadEverythingGenerator).then((result) =>
  console.log("через генератор + раннер:", result)
);
// СЬОГОДНІ async/await робить ТЕ САМЕ, але вбудовано в мову —
// генератори для асинхронності лишаються корисними головним чином
// для розуміння того, "як влаштований" async/await зсередини,
// та в спеціалізованих бібліотеках (наприклад, Redux-Saga)


// ==========================================================================
// АСИНХРОННА ІТЕРАЦІЯ: for await...of ТА Symbol.asyncIterator
// ==========================================================================

// 19. АСИНХРОННІ ІТЕРАТОРИ — КОЛИ КОЖНЕ ЗНАЧЕННЯ ПОТРІБНО "ЧЕКАТИ"
// -----------------------------------------------------
// Так само, як Symbol.iterator робить об'єкт iterable для for...of
// (див. common/data-structures/iterator/iterator.js), Symbol.asyncIterator
// робить об'єкт "асинхронно ітерованим" — next() повертає ПРОМІС
// { value, done }, а не готовий об'єкт одразу.

const asyncCounter = {
  from: 1,
  to: 3,
  [Symbol.asyncIterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (current <= last) {
              resolve({ value: current++, done: false });
            } else {
              resolve({ value: undefined, done: true });
            }
          }, 100); // симулюємо асинхронну затримку для кожного значення
        });
      },
    };
  },
};

async function consumeAsyncIterable() {
  for await (const value of asyncCounter) {
    console.log("асинхронна ітерація:", value); // 1, 2, 3 — з паузою між кожним
  }
}
consumeAsyncIterable();

// найпоширеніше практичне застосування — читання потоку сторінок
// із пагінованого API, де кожен "next" — окремий мережевий запит


// ==========================================================================
// СКАСУВАННЯ АСИНХРОННИХ ОПЕРАЦІЙ: AbortController
// ==========================================================================

// 20. AbortController / AbortSignal — СТАНДАРТНИЙ СПОСІБ СКАСУВАННЯ (ES2017+)
// -----------------------------------------------------
// Promise САМІ ПО СОБІ не мають вбудованого способу "скасування" —
// колись почавшись, вони рано чи пізно вирішаться. AbortController —
// окремий, узгоджений механізм: сигнал передається в операцію
// (наприклад, у fetch), і виклик .abort() "просить" операцію зупинитись.

function cancellableDelay(ms, signal) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => resolve(`завершено через ${ms}мс`), ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      reject(new DOMException("Операцію скасовано", "AbortError"));
    });
  });
}

const controller = new AbortController();
cancellableDelay(1000, controller.signal)
  .then((result) => console.log(result))
  .catch((err) => console.log("скасовано:", err.message));

setTimeout(() => controller.abort(), 100); // скасовуємо ЩЕ ДО завершення затримки в 1000мс

// той самий signal передається напряму в fetch():
// const controller2 = new AbortController();
// fetch("https://api.example.com/data", { signal: controller2.signal })
//   .then((r) => r.json())
//   .catch((err) => { if (err.name === "AbortError") console.log("запит скасовано"); });
// controller2.abort();


// ==========================================================================
// ПРАКТИЧНІ ПАТЕРНИ (ЩО ЧАСТО ЗАПИТУЮТЬ НА СПІВБЕСІДАХ)
// ==========================================================================

// 21. RETRY — ПОВТОРНА СПРОБА ПРИ ПРОВАЛІ
// -----------------------------------------------------
async function withRetry(fn, retriesLeft = 3, delayMs = 200) {
  try {
    return await fn();
  } catch (error) {
    if (retriesLeft <= 0) throw error;
    console.log(`повтор через помилку "${error.message}", залишилось спроб: ${retriesLeft}`);
    await new Promise((r) => setTimeout(r, delayMs));
    return withRetry(fn, retriesLeft - 1, delayMs);
  }
}

let attemptCount = 0;
function unreliableOperation() {
  attemptCount++;
  return attemptCount < 3
    ? Promise.reject(new Error(`провал спроби №${attemptCount}`))
    : Promise.resolve("успіх на третій спробі");
}
withRetry(unreliableOperation).then((result) => console.log(result));


// 22. ОБМЕЖЕННЯ КІЛЬКОСТІ ОДНОЧАСНИХ ОПЕРАЦІЙ (CONCURRENCY LIMIT)
// -----------------------------------------------------
// Коли треба обробити ВЕЛИКУ кількість завдань, але НЕ всі одразу
// (наприклад, щоб не перевантажити сервер сотнями паралельних запитів).

async function mapWithConcurrencyLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      results[index] = await mapper(items[index], index);
    }
  }

  const workers = Array.from({ length: limit }, () => worker());
  await Promise.all(workers);
  return results;
}

mapWithConcurrencyLimit([1, 2, 3, 4, 5], 2, async (id) => {
  const user = await loadUserPromise(id);
  console.log("оброблено з лімітом паралельності:", user.id);
  return user;
}).then((all) => console.log("усі оброблені:", all.length));


// 23. DEBOUNCE ДЛЯ АСИНХРОННИХ ВИКЛИКІВ (наприклад, пошук під час набору тексту)
// -----------------------------------------------------
function debounceAsync(fn, delayMs) {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => resolve(fn(...args)), delayMs);
    });
  };
}

const debouncedSearch = debounceAsync((query) => {
  console.log("реальний пошуковий запит для:", query);
  return Promise.resolve([`результат для "${query}"`]);
}, 300);

debouncedSearch("J");
debouncedSearch("Ja");
debouncedSearch("Java"); // лише ЦЕЙ виклик реально "дійде" до fn(), попередні скасовані таймером


// 24. ПЕРЕТВОРЕННЯ CALLBACK-СТИЛЮ NODE.JS У PROMISE — util.promisify()
// -----------------------------------------------------
// function readFileNodeStyle(path, callback) { ... } — показано в пункті 3
function promisify(fn) {
  return function promisified(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}
const readFilePromise = promisify(readFileNodeStyle);
readFilePromise("/config.json").then((content) => console.log("через promisify:", content));
// у самому Node.js для цього є вбудований util.promisify()


// ==========================================================================
// ПІДСУМОК: ЯК ОБИРАТИ ПІДХІД
// ==========================================================================
// - CALLBACK — базовий рівень, на якому все інше побудоване; сьогодні
//   пишуть напряму рідко (окрім деяких Node.js API й обробників подій),
//   але важливо розуміти, бо саме звідси й асинхронність почалась
// - PROMISE — стандартна абстракція "значення в майбутньому" з 3 станами;
//   .then()/.catch()/.finally() дають плоскі ланцюжки замість callback hell;
//   комбінатори all/allSettled/race/any — для роботи з КІЛЬКОМА промісами одразу
// - ASYNC/AWAIT — синтаксичний цукор над Promise, читається як
//   синхронний код; НЕ забувай, що незалежні await варто запускати
//   ПАРАЛЕЛЬНО через Promise.all(), а не по черзі
// - EVENT LOOP: мікрозадачі (Promise/await/queueMicrotask) МАЮТЬ
//   ВИЩИЙ пріоритет за макрозадачі (setTimeout/події) — черга
//   мікрозадач спорожняється ПОВНІСТЮ між кожною макрозадачею
// - ГЕНЕРАТОРИ — історичний, "ручний" попередник async/await;
//   сьогодні корисні переважно для розуміння механізму й у for await...of
// - for await...of / Symbol.asyncIterator — для послідовностей,
//   де КОЖНЕ значення саме по собі асинхронне (пагінація, стріми)
// - AbortController — стандартний спосіб скасувати операцію, що вже почалась
// - практичні патерни (retry, concurrency limit, debounce, promisify)
//   будуються ЗВЕРХУ над Promise/async-await, а не є окремим "способом"