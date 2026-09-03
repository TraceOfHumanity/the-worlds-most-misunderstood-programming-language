// ==========================================================================
// PROXY — ОБ'ЄКТ-ПОСЕРЕДНИК ДЛЯ ПЕРЕХОПЛЕННЯ ОПЕРАЦІЙ НАД ОБ'ЄКТОМ (ES6)
// ==========================================================================

// 1. ЩО ТАКЕ Proxy
// -----------------------------------------------------
// Proxy — це "обгортка" навколо іншого об'єкта (target), яка
// дозволяє ПЕРЕХОПЛЮВАТИ й ПЕРЕВИЗНАЧАТИ базові операції над ним:
// читання властивості, запис, видалення, перевірку наявності,
// виклик функції тощо. Кожна операція, яку можна перехопити,
// називається "пасткою" (trap).

const target = { name: "Alex", age: 30 };
const handler = {
  get(target, prop) {
    console.log(`читаємо властивість "${prop}"`);
    return target[prop];
  },
};
const proxy = new Proxy(target, handler);

console.log(proxy.name); // "читаємо властивість "name"" → "Alex"


// 2. КОНСТРУКТОР: new Proxy(target, handler)
// -----------------------------------------------------
// - target  — оригінальний об'єкт, який "обгортається"
// - handler — об'єкт-конфігурація з "пастками" (trap-функціями);
//   handler БЕЗ жодної пастки означає "прозорий" проксі —
//   поводиться так само, як і сам target.

const transparentProxy = new Proxy({ a: 1 }, {});
console.log(transparentProxy.a); // 1 — жодних перехоплень, просто проходить далі


// ==========================================================================
// 3. TRAP: get(target, prop, receiver) — перехоплення ЧИТАННЯ властивості
// ==========================================================================

// Спрацьовує при БУДЬ-ЯКОМУ читанні: proxy.prop, proxy["prop"],
// навіть при деструктуризації чи for...in.

const userTarget = { name: "John", age: 25, password: "secret123" };

const userProxy = new Proxy(userTarget, {
  get(target, prop, receiver) {
    if (prop === "password") {
      throw new Error("Доступ до password заборонено");
    }
    if (!(prop in target)) {
      console.warn(`Властивості "${String(prop)}" не існує`);
      return undefined;
    }
    return Reflect.get(target, prop, receiver); // "правильний" спосіб делегувати операцію далі
  },
});

console.log(userProxy.name); // "John"
// console.log(userProxy.password); // Error: Доступ до password заборонено
userProxy.city; // console.warn: Властивості "city" не існує


// ==========================================================================
// 4. TRAP: set(target, prop, value, receiver) — перехоплення ЗАПИСУ
// ==========================================================================

// Спрацьовує при proxy.prop = value. ПОВИНЕН повертати true/false
// (успіх/неуспіх) — у strict mode false призводить до TypeError.

const validatedTarget = { age: 30 };

const validatedProxy = new Proxy(validatedTarget, {
  set(target, prop, value, receiver) {
    if (prop === "age") {
      if (typeof value !== "number" || value < 0) {
        throw new TypeError("age повинен бути невід'ємним числом");
      }
    }
    return Reflect.set(target, prop, value, receiver);
  },
});

validatedProxy.age = 31; // ок
console.log(validatedProxy.age); // 31
// validatedProxy.age = -5; // TypeError: age повинен бути невід'ємним числом
// validatedProxy.age = "тридцять"; // TypeError: age повинен бути невід'ємним числом


// ==========================================================================
// 5. TRAP: has(target, prop) — перехоплення оператора `in`
// ==========================================================================

const hiddenPropsTarget = { visible: 1, _secret: 2 };

const hiddenPropsProxy = new Proxy(hiddenPropsTarget, {
  has(target, prop) {
    if (typeof prop === "string" && prop.startsWith("_")) {
      return false; // "приховати" властивості, що починаються з _
    }
    return Reflect.has(target, prop);
  },
});

console.log("visible" in hiddenPropsProxy); // true
console.log("_secret" in hiddenPropsProxy); // false — хоча властивість насправді існує
console.log(hiddenPropsProxy._secret);       // 2 — has() не впливає на пряме читання!


// ==========================================================================
// 6. TRAP: deleteProperty(target, prop) — перехоплення delete
// ==========================================================================

const protectedTarget = { name: "John", id: 1 };

const protectedProxy = new Proxy(protectedTarget, {
  deleteProperty(target, prop) {
    if (prop === "id") {
      throw new Error("Не можна видалити id");
    }
    return Reflect.deleteProperty(target, prop);
  },
});

delete protectedProxy.name; // ок
console.log(protectedProxy); // { id: 1 }
// delete protectedProxy.id; // Error: Не можна видалити id


// ==========================================================================
// 7. TRAP: ownKeys(target) — перехоплення Object.keys()/for...in/Object.getOwnPropertyNames()
// ==========================================================================

const filteredKeysTarget = { name: "John", _internal: "службове", age: 30 };

const filteredKeysProxy = new Proxy(filteredKeysTarget, {
  ownKeys(target) {
    return Reflect.ownKeys(target).filter((key) => !String(key).startsWith("_"));
  },
  getOwnPropertyDescriptor(target, prop) {
    // ownKeys() МАЄ бути узгоджений з дескрипторами — без цього
    // Object.keys() кине помилку "invariant violation" для
    // "прихованих" ключів
    return Reflect.getOwnPropertyDescriptor(target, prop);
  },
});

console.log(Object.keys(filteredKeysProxy)); // ["name", "age"] — _internal прихована


// ==========================================================================
// 8. TRAP: defineProperty(target, prop, descriptor) — перехоплення Object.defineProperty()
// ==========================================================================

const definePropertyTarget = {};

const definePropertyProxy = new Proxy(definePropertyTarget, {
  defineProperty(target, prop, descriptor) {
    console.log(`визначаємо властивість "${String(prop)}"`);
    return Reflect.defineProperty(target, prop, descriptor);
  },
});

Object.defineProperty(definePropertyProxy, "id", { value: 1, enumerable: true });
console.log(definePropertyProxy.id); // "визначаємо властивість "id"" → 1


// ==========================================================================
// 9. TRAP: getPrototypeOf / setPrototypeOf — перехоплення роботи з прототипом
// ==========================================================================

const protoTarget = {};
const customProto = { greet: () => "Привіт!" };

const protoProxy = new Proxy(protoTarget, {
  getPrototypeOf(target) {
    console.log("читаємо прототип");
    return Reflect.getPrototypeOf(target);
  },
  setPrototypeOf(target, proto) {
    console.log("змінюємо прототип");
    return Reflect.setPrototypeOf(target, proto);
  },
});

Object.setPrototypeOf(protoProxy, customProto); // "змінюємо прототип"
console.log(Object.getPrototypeOf(protoProxy) === customProto); // "читаємо прототип" → true


// ==========================================================================
// 10. TRAP: apply(target, thisArg, argumentsList) — перехоплення ВИКЛИКУ ФУНКЦІЇ
// ==========================================================================

// Працює ЛИШЕ якщо target — функція (проксі "над функцією").

function greet(name) {
  return `Hello, ${name}`;
}

const greetProxy = new Proxy(greet, {
  apply(target, thisArg, argumentsList) {
    if (typeof argumentsList[0] !== "string") {
      throw new TypeError("Перший аргумент має бути рядком");
    }
    console.log(`викликаємо ${target.name} з аргументами:`, argumentsList);
    return Reflect.apply(target, thisArg, argumentsList);
  },
});

console.log(greetProxy("John")); // лог виклику → "Hello, John"
// greetProxy(123); // TypeError: Перший аргумент має бути рядком


// ==========================================================================
// 11. TRAP: construct(target, argumentsList, newTarget) — перехоплення `new`
// ==========================================================================

class Person {
  constructor(name) {
    this.name = name;
  }
}

const PersonProxy = new Proxy(Person, {
  construct(target, argumentsList, newTarget) {
    console.log("створюємо новий екземпляр з:", argumentsList);
    if (typeof argumentsList[0] !== "string" || argumentsList[0].length === 0) {
      throw new TypeError("Ім'я не може бути порожнім");
    }
    return Reflect.construct(target, argumentsList, newTarget);
  },
});

const newPerson = new PersonProxy("Марія"); // лог → створено
console.log(newPerson.name); // "Марія"
// new PersonProxy(""); // TypeError: Ім'я не може бути порожнім


// ==========================================================================
// 12. ІНШІ TRAP-И (коротко, зустрічаються рідше)
// ==========================================================================

// - isExtensible(target)              → перехоплення Object.isExtensible()
// - preventExtensions(target)         → перехоплення Object.preventExtensions()
// - getOwnPropertyDescriptor(target, prop) → перехоплення Object.getOwnPropertyDescriptor()
// Усього пасток 13 — вони покривають практично КОЖНУ внутрішню
// операцію, яку рушій може виконати над об'єктом.


// ==========================================================================
// 13. Reflect — "ПАРА" ДО Proxy: БЕЗПЕЧНИЙ СПОСІБ ВИКОНАТИ ОПЕРАЦІЮ ДАЛІ
// ==========================================================================

// Reflect — вбудований об'єкт зі статичними методами, які ДЗЕРКАЛЬНО
// повторюють усі можливі trap-и Proxy (Reflect.get, Reflect.set,
// Reflect.has, Reflect.deleteProperty, Reflect.apply, Reflect.construct
// і т.д.). Усередині пастки завжди варто делегувати "решту роботи"
// саме через Reflect, а не через прямий target[prop] чи target[prop] = value:

// ЧОМУ САМЕ Reflect, А НЕ target[prop] НАПРЯМУ:
// - Reflect.get/set коректно передають receiver — критично важливо
//   для геттерів/сеттерів, успадкованих через прототипний ланцюжок
//   з проксі всередині нього (без receiver `this` у геттері може
//   вказувати не на той об'єкт);
// - Reflect-методи повертають boolean для set/deleteProperty/
//   defineProperty — зручно одразу повернути результат з пастки;
// - це узгоджений, "офіційний" спосіб виконати ту саму базову
//   операцію, яку зараз перехоплює trap.

const receiverDemoTarget = {
  _value: 10,
  get value() {
    return this._value; // this залежить від того, ЯК був викликаний геттер
  },
};

const receiverDemoProxy = new Proxy(receiverDemoTarget, {
  get(target, prop, receiver) {
    // Reflect.get(...) передає receiver — тому this у геттері вище
    // вказуватиме на receiverDemoProxy, а не напряму на target
    return Reflect.get(target, prop, receiver);
  },
});
console.log(receiverDemoProxy.value); // 10 — коректно, завдяки receiver


// ==========================================================================
// 14. НАЙЧАСТІШІ ЗАСТОСУВАННЯ Proxy
// ==========================================================================

// а) ВАЛІДАЦІЯ ДАНИХ ПРИ ЗАПИСІ (показано вище, validatedProxy)

// б) LOGGING / ДЕБАГ — прозоре логування будь-яких звернень до об'єкта
function withLogging(obj, label) {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      console.log(`[${label}] читання "${String(prop)}" →`, value);
      return value;
    },
    set(target, prop, value, receiver) {
      console.log(`[${label}] запис "${String(prop)}" =`, value);
      return Reflect.set(target, prop, value, receiver);
    },
  });
}
const loggedUser = withLogging({ name: "Іван" }, "user");
loggedUser.name;         // [user] читання "name" → Іван
loggedUser.name = "Петро"; // [user] запис "name" = Петро

// в) ЗНАЧЕННЯ ЗА ЗАМОВЧУВАННЯМ ДЛЯ ВІДСУТНІХ КЛЮЧІВ (аналог defaultdict)
function withDefault(defaultValue) {
  return new Proxy(
    {},
    {
      get(target, prop) {
        return prop in target ? target[prop] : defaultValue;
      },
    }
  );
}
const countersWithDefault = withDefault(0);
console.log(countersWithDefault.views); // 0 — навіть без явного встановлення

// г) НЕГАТИВНІ ІНДЕКСИ ДЛЯ МАСИВІВ (як у Python: arr[-1])
function withNegativeIndices(array) {
  return new Proxy(array, {
    get(target, prop, receiver) {
      if (typeof prop === "string" && /^-\d+$/.test(prop)) {
        return target[target.length + Number(prop)];
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}
const negativeIndexArr = withNegativeIndices([10, 20, 30]);
console.log(negativeIndexArr[-1]); // 30 — те, для чого зазвичай потрібен at(-1)

// д) "ЖИВІ" ОБ'ЄКТИ, ЩО РЕАГУЮТЬ НА ЗМІНИ (спрощена реактивність,
//    саме так у своїй основі влаштована реактивність Vue 3)
function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver);
      onChange(prop, value);
      return result;
    },
  });
}
const reactiveState = reactive({ count: 0 }, (prop, value) => {
  console.log(`стан змінено: ${prop} = ${value}`);
});
reactiveState.count = 1; // "стан змінено: count = 1"

// е) ОБМЕЖЕННЯ ДОСТУПУ / РЕАЛІЗАЦІЯ "ПРИВАТНИХ" ВЛАСТИВОСТЕЙ
//    (показано вище, userProxy з password)

// є) NOOP-ОБ'ЄКТИ / МОКИ ДЛЯ ТЕСТУВАННЯ — Proxy, що "ловить" будь-яке
//    звернення до неіснуючого методу й повертає передбачувану заглушку


// ==========================================================================
// 15. ВАЖЛИВІ НЮАНСИ Й ОБМЕЖЕННЯ
// ==========================================================================

// а) РІВНІСТЬ: proxy !== target — це РІЗНІ значення для ===
console.log(proxy === target); // false, хоча proxy "прозоро" відображає target

// б) ЗМІНИ ЧЕРЕЗ proxy ВІДОБРАЖАЮТЬСЯ і на target (і навпаки) —
// вони працюють з ОДНИМИ й тими самими даними, якщо пастка не
// перевизначає поведінку:
target.city = "Kyiv"; // змінили напряму
console.log(proxy.city); // "Kyiv" — proxy бачить зміну (get-пастка все одно читає target)

// в) "INVARIANTS" (незмінні правила) — деякі trap-и МАЮТЬ повертати
// узгоджений результат із реальним станом target, інакше рушій
// кидає TypeError. Наприклад, get-trap НЕ МОЖЕ повернути інше
// значення для non-writable + non-configurable властивості:
const invariantTarget = {};
Object.defineProperty(invariantTarget, "locked", {
  value: 42,
  writable: false,
  configurable: false,
});
const invariantProxy = new Proxy(invariantTarget, {
  get() {
    return 999; // порушує invariant для locked
  },
});
// console.log(invariantProxy.locked); // TypeError: 'get' on proxy: property 'locked' is a read-only
//                                        and non-configurable data property... inconsistent value

// г) ПРОДУКТИВНІСТЬ — Proxy додає накладні витрати на кожну
// перехоплену операцію, тому не варто загортати в проксі об'єкти,
// з якими працюють у "гарячих" (hot path), критичних до
// продуктивності ділянках коду.


// ==========================================================================
// 16. Proxy vs Object.defineProperty() — ЧОМУ Proxy ПОТУЖНІШИЙ
// ==========================================================================

// Object.defineProperty() (те, на чому будувалась реактивність Vue 2)
// дозволяє перехопити доступ лише до ЗАЗДАЛЕГІДЬ ВІДОМИХ, вже
// визначених властивостей — не бачить властивості, ДОДАНІ ПІЗНІШЕ,
// і не бачить видалення властивостей.

// Proxy перехоплює операції НА РІВНІ ВСЬОГО ОБ'ЄКТА — включно з
// властивостями, яких на момент створення проксі ще НЕ ІСНУВАЛО:

const dynamicTarget = {};
const dynamicProxy = new Proxy(dynamicTarget, {
  set(target, prop, value) {
    console.log(`нова властивість "${String(prop)}" додана динамічно`);
    target[prop] = value;
    return true;
  },
});
dynamicProxy.brandNewProp = "я з'явилась щойно"; // Proxy це "бачить", defineProperty — ні


// ПІДСУМОК:
// - Proxy(target, handler) — обгортка над об'єктом, що перехоплює
//   базові операції над ним через trap-функції в handler
// - основні trap-и: get, set, has, deleteProperty, ownKeys,
//   defineProperty, getPrototypeOf/setPrototypeOf, apply (для функцій),
//   construct (для класів/конструкторів)
// - Reflect — "пара" до Proxy: усередині пастки завжди делегуй
//   "решту роботи" через Reflect.*, а не напряму через target[prop] —
//   особливо важливо для коректної передачі receiver
// - proxy !== target, але вони працюють з тими самими даними
//   (зміни через один бачить і другий, якщо пастка не змінює поведінку)
// - головні застосування: валідація при записі, логування/дебаг,
//   значення за замовчуванням, "реактивність" (як у Vue 3),
//   обмеження доступу до "приватних" полів, динамічні API-обгортки
// - потужніший за Object.defineProperty(), бо бачить властивості,
//   додані/видалені ПІСЛЯ створення проксі
// - є правила узгодженості (invariants) — деякі пастки не можуть
//   довільно "брехати" про non-configurable властивості
// - додає накладні витрати — уникай у критичних до швидкодії ділянках