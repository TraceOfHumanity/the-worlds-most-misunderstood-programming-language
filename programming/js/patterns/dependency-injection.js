// ==========================================================================
// DEPENDENCY INJECTION — ПАТЕРН "ЗАЛЕЖНОСТІ ПРИХОДЯТЬ ЗЗОВНІ"
// ==========================================================================

// 1. ЩО ТАКЕ DEPENDENCY INJECTION (DI)
// -----------------------------------------------------
// Залежність — це інший об'єкт, який потрібен класу для роботи
// (база даних, логер, HTTP-клієнт, годинник).
//
// DI — підхід, за якого об'єкт НЕ СТВОРЮЄ свої залежності сам (через
// `new` всередині), а ОТРИМУЄ їх ззовні: через конструктор, метод або
// властивість. Хто саме створює й підставляє — вирішує код "вище"
// (composition root або DI-контейнер).
//
// Навіщо:
//   - ТЕСТОВАНІСТЬ: у тесті підставляємо фейк замість справжньої БД;
//   - ГНУЧКІСТЬ: заміна реалізації (Postgres → Mongo) без правки класу;
//   - СЛАБКА ЗВ'ЯЗАНІСТЬ: клас залежить від "контракту", а не від
//     конкретного класу;
//   - явність: за конструктором видно, що потрібно класу.
//
// Терміни, які плутають:
//   DI  (Dependency Injection)  — ТЕХНІКА: залежності передають ззовні;
//   IoC (Inversion of Control)  — ПРИНЦИП: не клас керує створенням
//                                  залежностей, а хтось інший;
//   DIP (Dependency Inversion)  — ПРИНЦИП SOLID: залежати від
//                                  абстракцій, а не від конкретики;
//   DI-контейнер                — ІНСТРУМЕНТ, що автоматизує DI (Nest).


// ==========================================================================
// 2. ПРОБЛЕМА: КЛАС САМ СТВОРЮЄ ЗАЛЕЖНОСТІ
// ==========================================================================

class RealDatabase {
  find(id) {
    // уявімо: тут справжній запит у мережу
    return { id, name: "Оля (з реальної БД)" };
  }
}

// ❌ UserServiceBad жорстко прив'язаний до RealDatabase
class UserServiceBad {
  constructor() {
    this.db = new RealDatabase(); // прихована залежність
  }
  getName(id) {
    return this.db.find(id).name;
  }
}

console.log(new UserServiceBad().getName(1)); // Оля (з реальної БД)
// Проблеми:
//   - у тесті неможливо замінити БД, не чіпаючи клас
//     (тільки хаки на кшталт мокінгу модулів);
//   - змінити реалізацію = редагувати UserServiceBad;
//   - з коду виклику не видно, що сервіс залежить від БД.


// ==========================================================================
// 3. CONSTRUCTOR INJECTION — ОСНОВНИЙ СПОСІБ
// ==========================================================================

class UserService {
  #db;
  #logger;

  // залежності — параметри конструктора: чесний контракт класу
  constructor(db, logger) {
    this.#db = db;
    this.#logger = logger;
  }

  getName(id) {
    this.#logger.log(`пошук користувача ${id}`);
    return this.#db.find(id).name;
  }
}

const consoleLogger = { log: (msg) => console.log(`[LOG] ${msg}`) };

const service = new UserService(new RealDatabase(), consoleLogger);
console.log(service.getName(1));
// [LOG] пошук користувача 1
// Оля (з реальної БД)

// Різні реалізації — той самий UserService:
const inMemoryDb = { find: (id) => ({ id, name: "Тестовий користувач" }) };
const silentLogger = { log: () => {} };

const testService = new UserService(inMemoryDb, silentLogger);
console.log(testService.getName(42)); // Тестовий користувач


// ==========================================================================
// 4. ТЕСТОВАНІСТЬ: ФЕЙКИ ТА ШПИГУНИ
// ==========================================================================

// Завдяки DI перевіряємо поведінку без мережі, часу і випадковості.
function createSpyLogger() {
  const calls = [];
  return { log: (msg) => calls.push(msg), calls };
}

const spy = createSpyLogger();
new UserService(inMemoryDb, spy).getName(7);
console.log(spy.calls); // [ 'пошук користувача 7' ]

// Класичний випадок — час і випадковість. Не викликайте Date.now() /
// Math.random() усередині класу напряму, а ін'єктуйте:
class TokenService {
  constructor(clock) {
    this.clock = clock;
  }
  isExpired(expiresAt) {
    return this.clock.now() >= expiresAt;
  }
}

const fixedClock = { now: () => 1000 };
console.log(new TokenService(fixedClock).isExpired(999)); // true
console.log(new TokenService(fixedClock).isExpired(2000)); // false
// Результат детермінований — тест ніколи не "мигає".


// ==========================================================================
// 5. ІНШІ ВИДИ ІН'ЄКЦІЇ
// ==========================================================================

// 5.1. SETTER / PROPERTY INJECTION — залежність ставиться після створення
class Reporter {
  setLogger(logger) {
    this.logger = logger;
  }
  report() {
    this.logger.log("звіт готовий"); // ⚠️ якщо setLogger не викликали — TypeError
  }
}
const reporter = new Reporter();
reporter.setLogger(consoleLogger);
reporter.report(); // [LOG] звіт готовий
// Мінус: об'єкт може існувати у неповному стані. Використовують для
// НЕОБОВ'ЯЗКОВИХ залежностей або циклічних (див. розділ 8).

// 5.2. METHOD (PARAMETER) INJECTION — залежність приходить в один виклик
function formatUser(user, formatter) {
  return formatter(user);
}
console.log(formatUser({ name: "Оля" }, (u) => u.name.toUpperCase())); // ОЛЯ

// 5.3. ФУНКЦІОНАЛЬНИЙ DI: ЗАМИКАННЯ (фабрика приймає залежності)
// У JS часто не потрібні класи — достатньо функції вищого порядку
// (closures — common/closures.js; фабрики — patterns/factory.js):
const makeGetUserName = (db) => (id) => db.find(id).name;

const getUserName = makeGetUserName(inMemoryDb);
console.log(getUserName(5)); // Тестовий користувач


// ==========================================================================
// 6. COMPOSITION ROOT — ЄДИНЕ МІСЦЕ, ДЕ ВСЕ З'ЄДНУЄТЬСЯ
// ==========================================================================

// "Ручний" DI: залежності збираються в одному місці на вході в
// застосунок (main). Решта коду про конкретні класи не знає.

function createApp(config) {
  const db = config.useFake ? inMemoryDb : new RealDatabase();
  const logger = config.silent ? silentLogger : consoleLogger;
  const userService = new UserService(db, logger);
  return { userService };
}

const app = createApp({ useFake: false, silent: false });
console.log(app.userService.getName(3));
// [LOG] пошук користувача 3
// Оля (з реальної БД)
// Без контейнера це чудово працює для малих і середніх проєктів.


// ==========================================================================
// 7. ПРОСТИЙ DI-КОНТЕЙНЕР (ЯК ЦЕ ПРАЦЮЄ У NEST "ПІД КАПОТОМ")
// ==========================================================================

// Контейнер зберігає "рецепти" створення і сам будує граф залежностей.
// Реєстрація за токеном (ім'ям); залежності перелічені явно.

class Container {
  #recipes = new Map(); // token → { factory, deps, singleton }
  #instances = new Map(); // кеш singleton-екземплярів

  register(token, factory, { deps = [], singleton = true } = {}) {
    this.#recipes.set(token, { factory, deps, singleton });
    return this;
  }

  resolve(token, chain = []) {
    if (chain.includes(token)) {
      throw new Error(`Циклічна залежність: ${[...chain, token].join(" → ")}`);
    }
    const recipe = this.#recipes.get(token);
    if (!recipe) throw new Error(`Не зареєстровано: ${token}`);

    if (recipe.singleton && this.#instances.has(token)) {
      return this.#instances.get(token);
    }

    // рекурсивно будуємо залежності
    const args = recipe.deps.map((dep) => this.resolve(dep, [...chain, token]));
    const instance = recipe.factory(...args);

    if (recipe.singleton) this.#instances.set(token, instance);
    return instance;
  }
}

const container = new Container()
  .register("db", () => new RealDatabase())
  .register("logger", () => consoleLogger)
  .register("userService", (db, logger) => new UserService(db, logger), {
    deps: ["db", "logger"],
  });

const resolved = container.resolve("userService");
console.log(resolved.getName(9));
// [LOG] пошук користувача 9
// Оля (з реальної БД)
console.log(container.resolve("userService") === resolved); // true — singleton

// Підміна для тестів: перереєструємо токен, решта коду не змінюється
const testContainer = new Container()
  .register("db", () => inMemoryDb)
  .register("logger", () => silentLogger)
  .register("userService", (db, logger) => new UserService(db, logger), {
    deps: ["db", "logger"],
  });
console.log(testContainer.resolve("userService").getName(9)); // Тестовий користувач

// Це прямий аналог Nest: @Injectable() + providers у модулі +
// constructor-параметри. Nest сам читає типи параметрів (через
// reflect-metadata) замість явного масиву deps — детально
// node/nest/providers-and-dependency-injection.ts та modules.ts.
// Scope singleton/transient/request у Nest — та сама ідея прапорця
// `singleton`; зв'язок з patterns/singleton.js.


// ==========================================================================
// 8. ЦИКЛІЧНІ ЗАЛЕЖНОСТІ
// ==========================================================================

// A залежить від B, а B від A — створити жоден неможливо через
// конструктори. Контейнер має це помітити:
const cyclic = new Container()
  .register("a", (b) => ({ b }), { deps: ["b"] })
  .register("b", (a) => ({ a }), { deps: ["a"] });

try {
  cyclic.resolve("a");
} catch (err) {
  console.log(err.message); // Циклічна залежність: a → b → a
}
// Зазвичай це сигнал поганого дизайну: винесіть спільну частину в
// третій клас або використайте події (patterns/observer.js).
// Nest має forwardRef() як аварійний вихід.


// ==========================================================================
// 9. ТИПОВІ ПОМИЛКИ
// ==========================================================================

// 9.1. SERVICE LOCATOR — ПІДМІНА, А НЕ DI
// Клас сам "дістає" залежності з глобального контейнера:
//   class Bad { run() { container.resolve("db").find(1); } }
// Залежності знову ПРИХОВАНІ (не видно в конструкторі), а клас
// прив'язаний до контейнера. У DI контейнер знає клас, а не навпаки.

// 9.2. ЗАЙВА АБСТРАКЦІЯ
// Не всі залежності треба ін'єктувати. Чисті утиліти (Math, форматери
// без стану) імпортують напряму. Ін'єктуйте те, що ТРЕБА ПІДМІНЯТИ:
// I/O (БД, мережа, файли), час, випадковість, зовнішні сервіси.

// 9.3. "БОЖЕСТВЕННИЙ" КОНСТРУКТОР
// Якщо в конструкторі 8+ залежностей — клас робить забагато (порушення
// Single Responsibility), а не проблема DI.

// 9.4. new УСЕРЕДИНІ ПАРАМЕТРІВ ЗА ЗАМОВЧУВАННЯМ
//   constructor(db = new RealDatabase()) — компроміс: зручно, але
//   повертає жорстку залежність від конкретного класу в модуль.
//   Прийнятно для простих випадків, для великих систем — ні.

// 9.5. ЗАЛЕЖНІСТЬ ВІД КОНКРЕТНОГО КЛАСУ, А НЕ ВІД КОНТРАКТУ
// У JS інтерфейсів немає (duck typing): достатньо, щоб об'єкт мав
// метод find(). У TypeScript контракт виражають через interface —
// typescript/interface-vs-type.ts. Тоді фейки типізуються так само,
// як і справжні реалізації.


// ПІДСУМОК:
// - DI: об'єкт отримує залежності ЗЗОВНІ, а не створює через new
//   всередині; це техніка реалізації принципів IoC і DIP (SOLID)
// - constructor injection — основний спосіб: контракт класу
//   видно в конструкторі, об'єкт одразу у готовому стані;
//   setter injection — для необов'язкових залежностей;
//   method injection — для залежності одного виклику
// - головна користь: тестованість (підставляємо фейки БД, годинника,
//   випадковості) і легка заміна реалізацій без правок класу
// - у JS DI можна робити без класів: замиканням/фабрикою
//   (makeGetUserName(db)) і просто передачею функцій
// - composition root — єдине місце, де збираються всі залежності
//   (ручний DI без контейнера добре працює у малих проєктах)
// - DI-контейнер автоматизує створення графа: реєструє рецепти,
//   рекурсивно резолвить залежності, кешує singleton, виявляє
//   цикли — так працює Nest (@Injectable, providers, scopes)
// - циклічні залежності — сигнал поганого дизайну; Service Locator
//   — це НЕ DI (залежності знову приховані)
// - ін'єктуйте те, що треба підміняти (I/O, час, випадковість),
//   але не перетворюйте DI на абстракцію заради абстракції
