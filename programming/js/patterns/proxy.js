// ==========================================================================
// PROXY — ПАТЕРН "ЗАМІСНИК, ЩО КОНТРОЛЮЄ ДОСТУП ДО ОБ'ЄКТА"
// ==========================================================================

// 1. ЩО ТАКЕ PROXY
// -----------------------------------------------------
// Proxy — структурний патерн: об'єкт-замісник має ТОЙ САМИЙ інтерфейс,
// що й реальний об'єкт (Subject), і стоїть між клієнтом та ним. Клієнт
// не помічає підміни, а замісник вирішує, ЧИ, КОЛИ і ЯК передати
// виклик справжньому об'єкту.
//
// Види проксі:
//   Virtual    — відкладає створення дорогого об'єкта (lazy loading);
//   Protection — перевіряє права доступу;
//   Caching    — запам'ятовує результати викликів;
//   Logging    — записує виклики (аудит, метрики);
//   Remote     — представляє об'єкт в іншому місці (RPC, HTTP-клієнт);
//   Smart ref  — рахує посилання, керує ресурсами.
//
// Не плутати:
//   мовна можливість Proxy (`new Proxy`) — механізм, яким патерн
//   зручно реалізувати; детально — common/data-structures/Proxy/Proxy.js.
//   Патерн Proxy можна написати й без `new Proxy` (розділ 3).


// ==========================================================================
// 2. ВІДМІННОСТІ ВІД СХОЖИХ ПАТЕРНІВ
// ==========================================================================

//   Proxy      — ТОЙ САМИЙ інтерфейс; мета — КОНТРОЛЬ доступу до об'єкта;
//                зазвичай сам керує життєвим циклом реального об'єкта.
//   Decorator  — ТОЙ САМИЙ інтерфейс; мета — ДОДАТИ поведінку; обгортки
//                складаються в ланцюжок, вирішує клієнт.
//   Adapter    — ІНШИЙ інтерфейс; мета — зробити несумісне сумісним.
// Технічно Proxy і Decorator схожі; розрізняє їх намір.


// ==========================================================================
// 3. КЛАСИЧНА РЕАЛІЗАЦІЯ: ОДИН ІНТЕРФЕЙС, ДВА КЛАСИ
// ==========================================================================

// Спільний інтерфейс (duck typing): метод getUser(id)
class RealUserApi {
  getUser(id) {
    console.log(`  [мережа] завантаження користувача ${id}`);
    return { id, name: `Користувач ${id}` };
  }
}

// Замісник тримає посилання на реальний об'єкт і передає йому виклики
class CachingUserApi {
  #target;
  #cache = new Map();

  constructor(target) {
    this.#target = target;
  }

  getUser(id) {
    if (this.#cache.has(id)) {
      console.log(`  [кеш] користувач ${id}`);
      return this.#cache.get(id);
    }
    const user = this.#target.getUser(id);
    this.#cache.set(id, user);
    return user;
  }
}

const api = new CachingUserApi(new RealUserApi());
api.getUser(1); //   [мережа] завантаження користувача 1
api.getUser(1); //   [кеш] користувач 1
api.getUser(2); //   [мережа] завантаження користувача 2
// Клієнтський код працює з api так само, як із RealUserApi.


// ==========================================================================
// 3.1. VIRTUAL PROXY: ЛІНИВЕ СТВОРЕННЯ ДОРОГОГО ОБ'ЄКТА
// ==========================================================================

class HeavyReport {
  constructor() {
    console.log("  [важка ініціалізація HeavyReport]");
    this.data = [1, 2, 3];
  }
  render() {
    return `Звіт: ${this.data.join(", ")}`;
  }
}

class LazyReport {
  #real = null;

  render() {
    // реальний об'єкт створюється при ПЕРШОМУ використанні
    this.#real ??= new HeavyReport();
    return this.#real.render();
  }
}

const lazy = new LazyReport(); // тут HeavyReport ще не створено
console.log("створили замісник");
console.log(lazy.render()); //   [важка ініціалізація HeavyReport] → Звіт: 1, 2, 3
console.log(lazy.render()); // Звіт: 1, 2, 3 (вдруге без ініціалізації)


// ==========================================================================
// 3.2. PROTECTION PROXY: ПЕРЕВІРКА ПРАВ
// ==========================================================================

class Document {
  read() {
    return "секретний вміст";
  }
  delete() {
    return "видалено";
  }
}

class ProtectedDocument {
  #doc;
  #role;

  constructor(doc, role) {
    this.#doc = doc;
    this.#role = role;
  }

  read() {
    return this.#doc.read(); // читати можуть усі
  }

  delete() {
    if (this.#role !== "admin") {
      throw new Error("Доступ заборонено: потрібна роль admin");
    }
    return this.#doc.delete();
  }
}

const guest = new ProtectedDocument(new Document(), "guest");
const admin = new ProtectedDocument(new Document(), "admin");

console.log(guest.read()); // секретний вміст
try {
  guest.delete();
} catch (err) {
  console.log(err.message); // Доступ заборонено: потрібна роль admin
}
console.log(admin.delete()); // видалено


// ==========================================================================
// 4. JS-СПОСІБ: ВБУДОВАНИЙ new Proxy — УНІВЕРСАЛЬНИЙ ЗАМІСНИК
// ==========================================================================

// Ручний замісник (розділ 3) доводиться писати для КОЖНОГО методу.
// new Proxy(target, handler) перехоплює операції над будь-якими
// властивостями одним обробником. Отже, "логуючий проксі" для
// довільного об'єкта:

function withLogging(target, name = "obj") {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const value = Reflect.get(obj, prop, receiver);
      if (typeof value !== "function") return value;
      return (...args) => {
        console.log(`  → ${name}.${String(prop)}(${args.join(", ")})`);
        const result = value.apply(obj, args); // this = справжній об'єкт
        console.log(`  ← ${JSON.stringify(result)}`);
        return result;
      };
    },
  });
}

const calc = withLogging(
  { add: (a, b) => a + b, mul: (a, b) => a * b },
  "calc",
);
calc.add(2, 3); //   → calc.add(2, 3)   ← 5
calc.mul(4, 5); //   → calc.mul(4, 5)   ← 20

// value.apply(obj, args) — важливо: інакше `this` усередині методів
// вказував би на проксі, а не на цільовий об'єкт (пастки this —
// common/this.js). Для приватних полів (#) це критично (розділ 8).


// ==========================================================================
// 5. УНІВЕРСАЛЬНИЙ CACHING PROXY ДЛЯ ФУНКЦІЙ (пастка apply)
// ==========================================================================

function memoize(fn) {
  const cache = new Map();
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) return cache.get(key);
      const result = Reflect.apply(target, thisArg, args);
      cache.set(key, result);
      return result;
    },
  });
}

let calls = 0;
const slowSquare = (n) => {
  calls++;
  return n * n;
};

const fastSquare = memoize(slowSquare);
console.log(fastSquare(9), fastSquare(9), fastSquare(9)); // 81 81 81
console.log("реальних викликів:", calls); // 1
// Ключ JSON.stringify(args) — спрощення: не працює для функцій,
// циклічних об'єктів; Map/Set і символи губляться (common/type-coercion.js).


// ==========================================================================
// 6. VALIDATION PROXY: КОНТРОЛЬ ЗАПИСУ
// ==========================================================================

function withValidation(target, rules) {
  return new Proxy(target, {
    set(obj, prop, value) {
      const rule = rules[prop];
      if (rule && !rule(value)) {
        throw new TypeError(`Некоректне значення для "${String(prop)}": ${value}`);
      }
      return Reflect.set(obj, prop, value);
    },
  });
}

const person = withValidation(
  { name: "Оля", age: 20 },
  { age: (v) => Number.isInteger(v) && v >= 0 && v <= 150 },
);

person.age = 30;
console.log(person.age); // 30
try {
  person.age = -5;
} catch (err) {
  console.log(err.message); // Некоректне значення для "age": -5
}


// ==========================================================================
// 7. REMOTE PROXY: ВИКЛИК ВІДДАЛЕНОГО ОБ'ЄКТА ЯК ЛОКАЛЬНОГО
// ==========================================================================

// Динамічний замісник: будь-який метод перетворюється на "мережевий
// запит". Так працюють RPC-клієнти та ORM-клієнти.
function createRemote(send) {
  return new Proxy(
    {},
    {
      get(_, method) {
        return (...args) => send(String(method), args); // повертає Promise
      },
    },
  );
}

// Імітація мережі (замість реального fetch)
const fakeServer = async (method, args) => {
  const handlers = { sum: (a, b) => a + b, greet: (n) => `Привіт, ${n}` };
  return handlers[method](...args);
};

const remote = createRemote(fakeServer);
remote.sum(2, 3).then((v) => console.log("remote.sum:", v)); // 5
remote.greet("Оля").then((v) => console.log("remote.greet:", v));
// Метод sum на remote НЕ існує — Proxy створює його "на льоту".


// ==========================================================================
// 8. ПАСТКИ PROXY
// ==========================================================================

// 8.1. ПРИВАТНІ ПОЛЯ (#) ЛАМАЮТЬСЯ ЧЕРЕЗ ПРОКСІ, ЯКЩО this = проксі
class Counter {
  #count = 0;
  increment() {
    return ++this.#count;
  }
}

const brokenProxy = new Proxy(new Counter(), {}); // навіть порожній handler
try {
  brokenProxy.increment(); // this === проксі, а #count є лише у справжнього об'єкта
} catch (err) {
  console.log(err.name + ":", err.message.slice(0, 55));
  // TypeError: Cannot read private member #count from an object whose class did not declare it
}

// Рішення: прив'язувати методи до цільового об'єкта
const workingProxy = new Proxy(new Counter(), {
  get(target, prop) {
    const value = Reflect.get(target, prop, target); // receiver = target
    return typeof value === "function" ? value.bind(target) : value;
  },
});
console.log(workingProxy.increment()); // 1

// 8.2. ІДЕНТИЧНІСТЬ: проксі !== target
const target = {};
const proxied = new Proxy(target, {});
console.log(proxied === target); // false — порівняння за посиланням, Set/Map,
// WeakMap-ключі "бачать" різні об'єкти (common/data-structures/WeakMap/WeakMap.js)

// 8.3. ПРОДУКТИВНІСТЬ
// Кожна операція проходить через пастку — це повільніше за пряме
// звернення і ускладнює оптимізації V8 (hidden classes, inline caching —
// performance/01-hidden-classes.js). У гарячих циклах проксі ставити не
// варто, для рідкісних контрольних точок (валідація, логування) — доречно.

// 8.4. ПРОЗОРІСТЬ — ПАСТКА ПРИХОВАНОЇ ПОВЕДІНКИ
// Клієнт не знає, що працює із замісником: логіка кешування чи прав
// "невидима", що ускладнює налагодження. Документуйте і не ховайте
// в проксі бізнес-логіку.

// 8.5. РЕЗУЛЬТАТ КЕШУ МОЖЕ БУТИ ЗАСТАРІЛИМ
// Caching proxy потребує стратегії інвалідації (TTL, очищення при зміні).

// 8.6. Proxy.revocable — проксі, який можна "вимкнути"
const { proxy: temp, revoke } = Proxy.revocable({ secret: 1 }, {});
console.log(temp.secret); // 1
revoke();
try {
  temp.secret;
} catch (err) {
  console.log(err.name); // TypeError — доступ відкликано
}


// ==========================================================================
// 9. PROXY У РЕАЛЬНОМУ СВІТІ
// ==========================================================================

//   - Vue 3: реактивність (reactive()) побудована на Proxy;
//     раніше Vue 2 використовував Object.defineProperty;
//   - MobX, Immer (draft-об'єкти в produce()) — проксі для відстеження змін;
//   - ORM/RPC-клієнти (Prisma, tRPC): виклики методів → запити;
//   - NestJS: інтерцептори, гарди, кеш (@CacheInterceptor) — по суті
//     проксі навколо обробників (node/nest/controllers.ts); AOP-декоратори
//     обгортають методи так само;
//   - Observer через Proxy: patterns/observer.js (розділ 8);
//   - тести: шпигуни й моки (jest.fn/spyOn) — замісники методів;
//   - CDN, reverse proxy (nginx), API gateway — Proxy на рівні мережі.


// ПІДСУМОК:
// - Proxy — замісник із ТИМ САМИМ інтерфейсом, що контролює доступ до
//   реального об'єкта: створення, права, кешування, логування, віддалений виклик
// - види: virtual (ліниве створення), protection (права), caching,
//   logging, remote, smart reference
// - від Decorator відрізняється наміром (контроль доступу, а не
//   додавання функціональності), від Adapter — тим, що інтерфейс
//   НЕ змінюється
// - класична реалізація: клас-замісник тримає target і делегує виклики,
//   додаючи свою логіку до/після
// - у JS вбудований new Proxy(target, handler) перехоплює get/set/apply
//   тощо для будь-яких властивостей одним обробником (Reflect.get/set/apply
//   — правильний спосіб переслати операцію далі)
// - ПАСТКИ: приватні поля (#) ламаються, якщо this = проксі (рішення:
//   bind(target)); proxy !== target; додаткова вартість кожної операції;
//   прихована поведінка ускладнює налагодження; кеш потребує інвалідації
// - Proxy.revocable дозволяє відкликати доступ
// - застосування: реактивність (Vue 3, MobX, Immer), RPC/ORM-клієнти,
//   інтерцептори і кеш у Nest, шпигуни у тестах
