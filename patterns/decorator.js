// ==========================================================================
// DECORATOR — ПАТЕРН "ДОДАТИ ПОВЕДІНКУ, ОБГОРНУВШИ ОБ'ЄКТ"
// ==========================================================================

// 1. ЩО ТАКЕ DECORATOR
// -----------------------------------------------------
// Decorator — структурний патерн: динамічно ДОДАЄ об'єкту нову
// поведінку, обгортаючи його в інший об'єкт із ТИМ САМИМ інтерфейсом.
// Обгортка виконує власну логіку до/після виклику вкладеного об'єкта.
// Обгортки можна нашаровувати: декоратор над декоратором.
//
// Навіщо:
//   - розширити поведінку БЕЗ наслідування (не плодити підкласи
//     "КаваЗМолокомІЦукром…");
//   - додавати/прибирати можливості під час роботи програми;
//   - дотримання Open/Closed: клас не змінюється, поведінка розширюється;
//   - комбінувати незалежні "шари" (логування + кеш + повтор).
//
// У JS існують ТРИ різні речі під назвою "decorator":
//   1) патерн Decorator (цей файл, розділи 2–5);
//   2) функції-декоратори — обгортки функцій (розділ 6);
//   3) синтаксис @decorator для класів (розділ 7), яким користується Nest.


// ==========================================================================
// 2. ПРОБЛЕМА: КОМБІНАТОРНИЙ ВИБУХ ПІДКЛАСІВ
// ==========================================================================

// ❌ Кава з молоком, кава з цукром, кава з молоком і цукром, латте з
// сиропом... Кожна комбінація — новий клас: 2ⁿ підкласів для n добавок.
// class CoffeeWithMilk extends Coffee {}
// class CoffeeWithMilkAndSugar extends CoffeeWithMilk {}  // і так далі


// ==========================================================================
// 3. КЛАСИЧНА РЕАЛІЗАЦІЯ: ОБГОРТКА З ТИМ САМИМ ІНТЕРФЕЙСОМ
// ==========================================================================

// Спільний інтерфейс (duck typing): cost() і description()
class Coffee {
  cost() {
    return 50;
  }
  description() {
    return "Кава";
  }
}

// Базовий декоратор: тримає обгорнутий об'єкт і за замовчуванням делегує
class CoffeeDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }
  cost() {
    return this.coffee.cost();
  }
  description() {
    return this.coffee.description();
  }
}

class Milk extends CoffeeDecorator {
  cost() {
    return super.cost() + 10;
  }
  description() {
    return `${super.description()} + молоко`;
  }
}

class Sugar extends CoffeeDecorator {
  cost() {
    return super.cost() + 5;
  }
  description() {
    return `${super.description()} + цукор`;
  }
}

class Syrup extends CoffeeDecorator {
  cost() {
    return super.cost() + 15;
  }
  description() {
    return `${super.description()} + сироп`;
  }
}

let order = new Coffee();
console.log(order.description(), order.cost()); // Кава 50

order = new Milk(order);
order = new Sugar(order);
order = new Syrup(order);
console.log(order.description(), order.cost()); // Кава + молоко + цукор + сироп 80

// Довільна комбінація без нових класів; можна навіть подвійно:
const doubleSugar = new Sugar(new Sugar(new Coffee()));
console.log(doubleSugar.description(), doubleSugar.cost()); // Кава + цукор + цукор 60

// Клієнт працює з order так само, як із Coffee — інтерфейс той самий.


// ==========================================================================
// 4. ПОРЯДОК ДЕКОРАТОРІВ МАЄ ЗНАЧЕННЯ
// ==========================================================================

// Кожен шар виконується "зсередини назовні": зовнішній декоратор
// бачить результат внутрішнього. Якщо операції не комутативні —
// порядок змінює результат:
class Discount extends CoffeeDecorator {
  cost() {
    return super.cost() * 0.5; // знижка 50% на ВСЕ, що всередині
  }
}

console.log(new Discount(new Milk(new Coffee())).cost()); // (50 + 10) * 0.5 = 30
console.log(new Milk(new Discount(new Coffee())).cost()); // 50 * 0.5 + 10 = 35


// ==========================================================================
// 5. ДЕКОРАТОР ЯК ОБГОРТКА ОБ'ЄКТА З ПОВЕДІНКОЮ: ПОТОКИ ДАНИХ
// ==========================================================================

// Класичний реальний приклад: обгортки над "джерелом даних".
class PlainStorage {
  #data = new Map();
  write(key, value) {
    this.#data.set(key, value);
  }
  read(key) {
    return this.#data.get(key);
  }
}

class LoggingStorage {
  constructor(inner) {
    this.inner = inner;
  }
  write(key, value) {
    console.log(`  [лог] write ${key}`);
    this.inner.write(key, value);
  }
  read(key) {
    console.log(`  [лог] read ${key}`);
    return this.inner.read(key);
  }
}

class EncryptedStorage {
  constructor(inner) {
    this.inner = inner;
  }
  // "шифрування" — обернення рядка, лише для демонстрації
  #scramble = (s) => [...s].reverse().join("");
  write(key, value) {
    this.inner.write(key, this.#scramble(value));
  }
  read(key) {
    return this.#scramble(this.inner.read(key));
  }
}

const storage = new LoggingStorage(new EncryptedStorage(new PlainStorage()));
storage.write("token", "abc123"); //   [лог] write token
console.log(storage.read("token")); //   [лог] read token → abc123
// Дані у PlainStorage зберігаються зашифрованими; лог і шифрування
// незалежні й складаються довільно (як node:zlib + crypto streams:
// node/understanding-streams/05-duplex-and-transform.js).


// ==========================================================================
// 6. ФУНКЦІЇ-ДЕКОРАТОРИ (HIGHER-ORDER FUNCTIONS)
// ==========================================================================

// У JS функції — значення, тому найприродніший декоратор — функція,
// яка приймає функцію й повертає нову з додатковою поведінкою
// (замикання — common/closures.js).

const withLogging = (fn) => (...args) => {
  console.log(`  виклик ${fn.name}(${args.join(", ")})`);
  const result = fn(...args);
  console.log(`  результат: ${result}`);
  return result;
};

const withTiming = (fn) => (...args) => {
  const start = performance.now();
  const result = fn(...args);
  const ms = performance.now() - start;
  console.log(`  ${fn.name} за ${ms < 5 ? "<5" : ms.toFixed(0)} мс`);
  return result;
};

const withRetry = (times) => (fn) => (...args) => {
  let lastError;
  for (let attempt = 1; attempt <= times; attempt++) {
    try {
      return fn(...args);
    } catch (err) {
      lastError = err;
      console.log(`  спроба ${attempt} не вдалася: ${err.message}`);
    }
  }
  throw lastError;
};

function add(a, b) {
  return a + b;
}

const decoratedAdd = withLogging(withTiming(add));
decoratedAdd(2, 3);
//   виклик (2, 3)        ← ім'я ПОРОЖНЄ: withTiming повернув анонімну стрілку
//   add за <5 мс
//   результат: 5
// (withLogging бачить обгортку withTiming, а не add — див. пастку з name нижче)

// Композиція кількох декораторів:
const compose = (...decorators) => (fn) => decorators.reduceRight((acc, d) => d(acc), fn);

let attempts = 0;
function flaky() {
  attempts++;
  if (attempts < 3) throw new Error("тимчасова помилка");
  return "успіх";
}

const reliable = compose(withLogging, withRetry(3))(flaky);
console.log(reliable());
//   виклик ()                          — withLogging зовнішній: спрацював один раз
//   спроба 1 не вдалася: тимчасова помилка
//   спроба 2 не вдалася: тимчасова помилка
//   результат: успіх
// успіх
// (compose(A, B)(fn) = A(B(fn)): retry вкладений всередину логування)

// ПАСТКА: name і властивості. Обгортка — інша функція: fn.name стає
// "" або назвою внутрішньої стрілки, зникає fn.length, властивості
// оригіналу. Виправлення — скопіювати потрібне:
const preserve = (wrapper, original) =>
  Object.defineProperty(wrapper, "name", { value: original.name });

console.log(add.name); // add
console.log(withLogging(add).name); // "" — втрачено (анонімна стрілка)
console.log(preserve(withLogging(add), add).name); // add

// ПАСТКА: this. Стрілка-обгортка не зберігає this виклику. Для методів
// використовуйте function + fn.apply(this, args) (common/this.js):
function withLoggingMethod(fn) {
  return function (...args) {
    console.log(`  метод ${fn.name}`);
    return fn.apply(this, args);
  };
}

const counter = {
  value: 10,
  inc: withLoggingMethod(function inc() {
    return ++this.value;
  }),
};
console.log(counter.inc()); // метод inc → 11

// ПАСТКА: async. Обгортка async-функції має чекати результат:
const withAsyncTiming = (fn) => async (...args) => {
  const result = await fn(...args); // без await час замірявся б до завершення
  console.log("  async завершено");
  return result;
};
withAsyncTiming(async (x) => x * 2)(21).then((v) => console.log(v)); // async завершено → 42
// (детально async — common/asynchronous/asynchronous.js)


// ==========================================================================
// 7. СИНТАКСИС @decorator (TC39 / TypeScript)
// ==========================================================================

// Синтаксичний цукор, що застосовує функцію-декоратор до класу чи його
// членів. В Node без транспіляції не працює — нижче показано, що
// саме відбувається "під капотом":
//
//   @Log
//   class Service {
//     @Cache
//     load() { … }
//   }
//
// еквівалентно:
//   class Service { load() { … } }
//   Service.prototype.load = Cache(Service.prototype.load);   // (спрощено)
//   Service = Log(Service);
//
// Ручний "метод-декоратор" без спеціального синтаксису:
function Log(target, key) {
  const original = target[key];
  target[key] = function (...args) {
    console.log(`  @Log ${key}(${args.join(", ")})`);
    return original.apply(this, args);
  };
}

class Service {
  load(id) {
    return `дані ${id}`;
  }
}
Log(Service.prototype, "load"); // те, що зробив би @Log
console.log(new Service().load(7)); //   @Log load(7) → дані 7

// У NestJS декоратори (@Controller, @Injectable, @Get, @UseGuards)
// здебільшого реєструють метадані (reflect-metadata), а не обгортають
// виклики — детально node/nest/controllers.ts, modules.ts.
// TypeScript-декоратори: legacy (experimentalDecorators, Nest) і нові
// стандартні (TS 5+ / TC39 Stage 3) мають РІЗНІ сигнатури.


// ==========================================================================
// 8. DECORATOR vs PROXY vs INHERITANCE vs COMPOSITE
// ==========================================================================

//   Decorator vs Наслідування: наслідування статичне (на етапі опису
//     класу), декоратор — динамічний (комбінація в runtime), без вибуху
//     підкласів.
//   Decorator vs Proxy (patterns/proxy.js): технічно схожі; Proxy КЕРУЄ
//     доступом і зазвичай сам створює/тримає реальний об'єкт, Decorator
//     ДОДАЄ поведінку до вже наданого клієнтом об'єкта.
//   Decorator vs Composite (patterns/composite.js): обгортка ОДНОГО
//     об'єкта проти агрегації багатьох.
//   Middleware (Express/Nest/Koa) — по суті ланцюжок декораторів запиту.


// ==========================================================================
// 9. ПАСТКИ ПАТЕРНА
// ==========================================================================

// 9.1. Багато дрібних обгорток → складний стек викликів і налагодження.
// 9.2. Порядок шарів впливає на результат (розділ 4) — документуйте.
// 9.3. Ідентичність: decorated !== original; instanceof для
//      обгортки з іншого класу не спрацює.
console.log(new Milk(new Coffee()) instanceof Coffee); // false
// 9.4. Видалити конкретний шар зі середини ланцюжка важко — обгортки
//      "вшиті" одна в одну.
// 9.5. Для двох-трьох варіантів простіше параметр чи спрощена
//      функція; не створюйте декоратори "про запас".


// ПІДСУМОК:
// - Decorator обгортає об'єкт іншим із ТИМ САМИМ інтерфейсом і додає
//   поведінку до/після виклику; обгортки можна нашаровувати
// - замінює наслідування там, де комбінацій забагато: додаємо
//   можливості в runtime без 2ⁿ підкласів (Open/Closed)
// - порядок декораторів важливий: шари виконуються зсередини назовні
// - у JS найприродніша форма — функції вищого порядку: withLogging(fn),
//   withRetry(3)(fn), compose(...); ПАСТКИ: втрата name/length, this
//   (використовуйте function + apply), async (потрібен await)
// - синтаксис @decorator — цукор для застосування таких функцій до
//   класів/методів; у Nest переважно реєструє метадані
// - відмінності: Proxy контролює доступ, Decorator додає поведінку,
//   Composite агрегує багатьох, Adapter змінює інтерфейс
// - пастки: складне налагодження глибоких стеків обгорток, залежність
//   від порядку, зникає instanceof, важко прибрати шар зсередини
