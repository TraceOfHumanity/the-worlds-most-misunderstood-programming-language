// ==========================================================================
// OBSERVER — ПАТЕРН "ПІДПИСКА НА ПОДІЇ"
// ==========================================================================

// 1. ЩО ТАКЕ OBSERVER
// -----------------------------------------------------
// Observer — поведінковий патерн: об'єкт (Subject, "видавець") зберігає
// список підписників (Observers) і ПОВІДОМЛЯЄ їх про зміни, нічого не
// знаючи про їхню конкретну реалізацію. Зв'язок "один-до-багатьох".
//
// Коли це корисно:
//   - зміна одного об'єкта має спричиняти реакції в інших, а їх
//     кількість і склад заздалегідь невідомі (UI, логування, кеш);
//   - потрібно розвʼязати зв'язок: видавець НЕ імпортує підписників;
//   - події в застосунку: "користувача створено", "замовлення оплачено".
//
// У JS патерн уже "вбудований": DOM addEventListener, Node EventEmitter,
// RxJS Observable, Nest EventEmitter2 — це все різновиди Observer.


// ==========================================================================
// 2. ПРОБЛЕМА: ЖОРСТКА ЗАЛЕЖНІСТЬ ВІД ТИХ, ХТО ЦІКАВИТЬСЯ
// ==========================================================================

// ❌ Видавець знає про ВСІХ і мусить змінюватись при кожному новому
// споживачі:
const emailService = { send: (u) => console.log(`email для ${u}`) };
const analytics = { track: (u) => console.log(`analytics: ${u}`) };

function registerUserBad(name) {
  // ...створення користувача...
  emailService.send(name);
  analytics.track(name);
  // потрібно додати push-сповіщення? Правимо саме ЦЮ функцію.
}
registerUserBad("Оля");
// email для Оля
// analytics: Оля


// ==========================================================================
// 3. МІНІМАЛЬНА РЕАЛІЗАЦІЯ: Subject + subscribe / unsubscribe / notify
// ==========================================================================

class Subject {
  #observers = new Set(); // Set: без дублікатів, швидке видалення

  subscribe(observer) {
    this.#observers.add(observer);
    // повертаємо функцію відписки — зручно й безпечно (розділ 6)
    return () => this.unsubscribe(observer);
  }

  unsubscribe(observer) {
    this.#observers.delete(observer);
  }

  notify(data) {
    for (const observer of this.#observers) observer(data);
  }
}

const userRegistered = new Subject();

const unsubscribeEmail = userRegistered.subscribe((u) => console.log(`email для ${u}`));
userRegistered.subscribe((u) => console.log(`analytics: ${u}`));

userRegistered.notify("Оля");
// email для Оля
// analytics: Оля

unsubscribeEmail();
userRegistered.notify("Іван");
// analytics: Іван   — email більше не отримує
// Нову реакцію додаємо БЕЗ зміни коду видавця.


// ==========================================================================
// 4. ПРАКТИЧНИЙ ПРИКЛАД: СХОВИЩЕ СТАНУ (МІНІ-STORE)
// ==========================================================================

// Так працюють Redux, Vuex, Zustand: підписники отримують новий стан
// після кожної зміни.

class Store {
  #state;
  #listeners = new Set();

  constructor(initial) {
    this.#state = initial;
  }

  getState() {
    return this.#state;
  }

  setState(patch) {
    const prev = this.#state;
    this.#state = { ...prev, ...patch }; // новий об'єкт, а не мутація
    for (const listener of this.#listeners) listener(this.#state, prev);
  }

  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }
}

const store = new Store({ count: 0 });
const stop = store.subscribe((next, prev) => console.log(`count: ${prev.count} → ${next.count}`));
store.setState({ count: 1 }); // count: 0 → 1
store.setState({ count: 2 }); // count: 1 → 2
stop();
store.setState({ count: 3 }); // (тиша — відписались)
console.log(store.getState()); // { count: 3 }


// ==========================================================================
// 5. ВБУДОВАНИЙ OBSERVER У NODE: EventEmitter
// ==========================================================================

const { EventEmitter } = require("node:events");

class Order extends EventEmitter {
  pay() {
    this.emit("paid", { id: 1, sum: 500 });
  }
}

const order = new Order();
order.on("paid", (o) => console.log(`оплачено #${o.id}: ${o.sum} грн`));
order.once("paid", () => console.log("перша оплата (once — лише раз)"));

order.pay();
// оплачено #1: 500 грн
// перша оплата (once — лише раз)
order.pay();
// оплачено #1: 500 грн

// Відмінності від нашого Subject:
//   - іменовані події (emit("paid"), а не один канал);
//   - once(), off(), listenerCount(), prependListener();
//   - спеціальна подія "error": emit("error") БЕЗ слухача кидає виняток.
//   (Streams — теж EventEmitter: node/understanding-streams/.)

try {
  new EventEmitter().emit("error", new Error("нікому обробити"));
} catch (err) {
  console.log("emit('error') без слухача:", err.message); // нікому обробити
}


// ==========================================================================
// 6. ПАСТКИ OBSERVER
// ==========================================================================

// 6.1. ВИТІК ПАМ'ЯТІ (lapsed listener)
// Підписник, якого забули відписати, утримується видавцем і не
// збирається GC, навіть коли більше не потрібен. Довгоживучий Subject
// + короткоживучі підписники = витік. Завжди відписуйтесь (unsubscribe
// у cleanup/dispose). Детально про GC і посилання —
// common/data-structures/WeakMap/WeakMap.js.

const leaky = new EventEmitter();
for (let i = 0; i < 12; i++) leaky.on("tick", () => {});
console.log(leaky.listenerCount("tick")); // 12 — Node навіть попередить (MaxListenersExceededWarning понад 10)
leaky.removeAllListeners("tick");

// 6.2. ЗМІНА СПИСКУ ПІД ЧАС РОЗСИЛКИ
// Якщо підписник відписується (або підписує когось) у момент notify —
// ітерація по живому Set поводиться неочевидно: новододані підписники
// БУДУТЬ викликані в цьому ж циклі.
const tricky = new Subject();
tricky.subscribe(() => {
  console.log("A");
  tricky.subscribe(() => console.log("B (доданий під час розсилки)"));
});
tricky.notify();
// A
// B (доданий під час розсилки)
// Безпечніше ітерувати по КОПІЇ: for (const o of [...this.#observers]).

// 6.3. ПОМИЛКА В ОДНОМУ ПІДПИСНИКУ ЛАМАЄ ВСІХ
const fragile = new Subject();
fragile.subscribe(() => { throw new Error("збій підписника"); });
fragile.subscribe(() => console.log("другий підписник"));
try {
  fragile.notify();
} catch (err) {
  console.log("розсилка перервана:", err.message);
}
// розсилка перервана: збій підписника — "другий підписник" НЕ викликався!
// Рішення: try/catch навколо кожного виклику всередині notify.

// 6.4. ПОРЯДОК І СИНХРОННІСТЬ
// notify синхронний: підписники виконуються один за одним і БЛОКУЮТЬ
// видавця. Важкі реакції варто виносити в чергу/асинхронність
// (common/asynchronous.js). Не покладайтесь на порядок підписників.

// 6.5. ПРИХОВАНІ ЗВ'ЯЗКИ
// Надмірні події роблять потік виконання нечитабельним ("хто саме
// відреагує на це?"). Для простої залежності прямий виклик кращий.


// ==========================================================================
// 7. OBSERVER vs PUB/SUB
// ==========================================================================

// Observer: підписники підписуються НАПРЯМУ на конкретний Subject,
//           видавець знає список (хоч і абстрактний).
// Pub/Sub:  між ними стоїть БРОКЕР (event bus / Redis / Kafka) —
//           видавець і підписники взагалі не знають один про одного.

class EventBus {
  #topics = new Map();

  on(topic, handler) {
    if (!this.#topics.has(topic)) this.#topics.set(topic, new Set());
    this.#topics.get(topic).add(handler);
    return () => this.#topics.get(topic)?.delete(handler);
  }

  emit(topic, payload) {
    for (const handler of this.#topics.get(topic) ?? []) handler(payload);
  }
}

const bus = new EventBus();
bus.on("user.created", (u) => console.log("welcome-лист для", u));
bus.on("user.created", (u) => console.log("запис в аудит для", u));
bus.emit("user.created", "Оля");
// welcome-лист для Оля
// запис в аудит для Оля
bus.emit("order.paid", 1); // тема без підписників — нічого не станеться


// ==========================================================================
// 8. ASYNC-ВАРІАНТИ ТА ЗВ'ЯЗОК З ІНШИМИ ТЕМАМИ
// ==========================================================================

// - EventTarget/addEventListener у браузері (і в Node) — стандартний
//   Observer; AbortController зупиняє підписку (common/asynchronous.js).
// - RxJS Observable — Observer + потоки даних: map/filter/debounce
//   над подіями, ліниві, з відписками.
// - Async iterators: events.on(emitter, "x") дозволяє
//   `for await (const [v] of on(emitter, "x"))`.
// - Proxy (common/data-structures/Proxy/Proxy.js) дозволяє "спостерігати"
//   за змінами властивостей — реактивність Vue 3 побудована саме так:

function observable(target, onChange) {
  return new Proxy(target, {
    set(obj, key, value) {
      const old = obj[key];
      obj[key] = value;
      onChange(key, old, value);
      return true;
    },
  });
}

const person = observable({ name: "Оля", age: 20 }, (k, o, n) => console.log(`${k}: ${o} → ${n}`));
person.age = 21; // age: 20 → 21
person.name = "Марія"; // name: Оля → Марія

// - У Nest: @nestjs/event-emitter (EventEmitter2, декоратор @OnEvent) —
//   Observer як модуль, зручний, щоб розчепити сервіси
//   (node/nest/providers-and-dependency-injection.ts).
// - Зв'язок з іншими патернами: Singleton нерідко виступає глобальним
//   EventBus (patterns/singleton.js) — з усіма його мінусами
//   прихованої глобальності.


// ПІДСУМОК:
// - Observer: Subject зберігає підписників і повідомляє їх про зміни,
//   не знаючи їхньої реалізації — зв'язок "один-до-багатьох", слабка
//   залежність
// - мінімум: subscribe / unsubscribe / notify; зручно, щоб subscribe
//   повертав функцію відписки, а підписники жили в Set
// - у JS патерн вбудований: EventEmitter (Node), EventTarget (DOM),
//   RxJS, Redux-подібні store, реактивність на Proxy (Vue 3)
// - ПАСТКИ: витік пам'яті (забута відписка), зміна списку під час
//   розсилки (ітеруйте по копії), виняток в одного підписника
//   зриває решту (try/catch навколо кожного), синхронність блокує
//   видавця, приховані зв'язки ускладнюють читання коду
// - EventEmitter: emit("error") без слухача кидає виняток; once()
//   для одноразових реакцій; понад 10 слухачів — попередження
// - Observer знає про підписників напряму, Pub/Sub — через брокера
//   (event bus, черга повідомлень), тому видавець і підписники
//   повністю розчеплені
// - не зловживайте: для простої залежності прямий виклик читабельніший
//   за подію
