// ==========================================================================
// FACTORY — ПАТЕРНИ "ФАБРИКА": SIMPLE FACTORY, FACTORY METHOD, ABSTRACT FACTORY
// ==========================================================================

// 1. ЩО ТАКЕ FACTORY І НАВІЩО ВОНА
// -----------------------------------------------------
// Factory — це сімейство породжуючих патернів, ідея яких одна:
// ВІДОКРЕМИТИ ЛОГІКУ СТВОРЕННЯ ОБ'ЄКТА від коду, що його використовує.
// Клієнт не пише new КонкретнийКлас(...) — він просить фабрику
// "дай мені об'єкт такого-то виду", а яку саме реалізацію створити
// і як її налаштувати, вирішує фабрика.
//
// Навіщо:
//   - клієнтський код НЕ залежить від конкретних класів (легко
//     замінити чи додати новий вид);
//   - складна ініціалізація живе в одному місці, а не розмазана
//     копіпастою по всьому проєкту;
//   - фабрика може повертати РІЗНІ типи, кешувати, перевикористовувати
//     об'єкти — конструктор через new так не вміє (завжди створює
//     новий екземпляр саме свого класу).
//
// Під назвою "Factory" ховаються три різні речі — розберемо кожну.


// ==========================================================================
// 2. ПРОБЛЕМА: КОД, ЩО ЗАЛЕЖИТЬ ВІД КОНКРЕТНИХ КЛАСІВ
// ==========================================================================

class EmailNotification {
  constructor(to) { this.to = to; }
  send(text) { return `Email → ${this.to}: ${text}`; }
}
class SmsNotification {
  constructor(to) { this.to = to; }
  send(text) { return `SMS → ${this.to}: ${text}`; }
}
class PushNotification {
  constructor(to) { this.to = to; }
  send(text) { return `Push → ${this.to}: ${text}`; }
}

// ❌ Клієнт знає про ВСІ класи і сам вибирає, який створити. Кожне
// нове місце, де потрібне сповіщення, дублює цей if/else; додавання
// нового каналу означає правку в усіх таких місцях.
function notifyBad(channel, to, text) {
  let notification;
  if (channel === "email") notification = new EmailNotification(to);
  else if (channel === "sms") notification = new SmsNotification(to);
  else if (channel === "push") notification = new PushNotification(to);
  else throw new Error(`Невідомий канал: ${channel}`);
  return notification.send(text);
}
console.log(notifyBad("sms", "+380501112233", "Привіт"));


// ==========================================================================
// 3. SIMPLE FACTORY — ОДНА ФУНКЦІЯ, ЩО СТВОРЮЄ ОБ'ЄКТИ
// ==========================================================================

// Найпростіший і найчастіший у JS варіант — звичайна функція, що
// ховає вибір класу. (Строго кажучи, це не "офіційний" патерн із
// книги GoF, а ідіома, але саме її люди зазвичай мають на увазі.)

function createNotification(channel, to) {
  switch (channel) {
    case "email": return new EmailNotification(to);
    case "sms": return new SmsNotification(to);
    case "push": return new PushNotification(to);
    default: throw new Error(`Невідомий канал: ${channel}`);
  }
}

console.log(createNotification("email", "a@b.com").send("Привіт"));
console.log(createNotification("push", "device-42").send("Привіт"));
// Тепер вибір класу — В ОДНОМУ місці. Клієнту потрібне лише send().


// ==========================================================================
// 4. ФАБРИКА БЕЗ switch: РЕЄСТР КОНСТРУКТОРІВ (OPEN/CLOSED)
// ==========================================================================

// switch у фабриці змушує ПРАВИТИ саму фабрику при кожному новому виді.
// Реєстр дозволяє ДОДАВАТИ види ззовні, не чіпаючи код фабрики
// (принцип відкритості/закритості — SOLID, common/SOLID/).

const notificationRegistry = new Map([
  ["email", EmailNotification],
  ["sms", SmsNotification],
  ["push", PushNotification],
]);

function createFromRegistry(channel, ...args) {
  const NotificationClass = notificationRegistry.get(channel);
  if (!NotificationClass) throw new Error(`Невідомий канал: ${channel}`);
  return new NotificationClass(...args);
}

// Новий канал додається БЕЗ змін у createFromRegistry:
class TelegramNotification {
  constructor(to) { this.to = to; }
  send(text) { return `Telegram → ${this.to}: ${text}`; }
}
notificationRegistry.set("telegram", TelegramNotification);
console.log(createFromRegistry("telegram", "@alex").send("Привіт"));


// ==========================================================================
// 5. FACTORY METHOD — ФАБРИЧНИЙ МЕТОД У ПІДКЛАСАХ
// ==========================================================================

// Класичний GoF-патерн: базовий клас описує АЛГОРИТМ, у якому є
// крок "створи продукт", але САМ не знає, який саме продукт; цей
// крок (фабричний метод) перевизначають підкласи.

class Dialog {
  // "шаблонний" метод: алгоритм відомий, кнопку створює підклас
  render() {
    const button = this.createButton(); // ← фабричний метод
    return `Діалог з кнопкою: ${button.render()}`;
  }
  createButton() {
    throw new Error("createButton() має бути реалізований у підкласі");
  }
}

class WindowsButton { render() { return "[Windows-кнопка]"; } }
class WebButton { render() { return "<button>Web-кнопка</button>"; } }

class WindowsDialog extends Dialog {
  createButton() { return new WindowsButton(); }
}
class WebDialog extends Dialog {
  createButton() { return new WebButton(); }
}

console.log(new WindowsDialog().render());
console.log(new WebDialog().render());
// Dialog.render() не залежить від конкретної кнопки — його не треба
// змінювати, коли з'являється новий вид діалогу (детально
// прототипне наслідування й extends — common/prototypal-inheritance.js).

// РІЗНИЦЯ з Simple Factory: там вибір робить ФУНКЦІЯ за параметром,
// тут вибір робить ПІДКЛАС через перевизначення методу.


// ==========================================================================
// 6. ABSTRACT FACTORY — ФАБРИКА ЦІЛИХ "СІМЕЙСТВ" ПОВ'ЯЗАНИХ ОБ'ЄКТІВ
// ==========================================================================

// Коли треба створювати НЕ один об'єкт, а НАБІР ЗГОДЖЕНИХ між собою
// об'єктів (кнопка + чекбокс + меню однієї теми), і гарантувати, що
// вони не змішаються з елементами іншої теми.

class LightButton { render() { return "світла кнопка"; } }
class LightCheckbox { render() { return "світлий чекбокс"; } }
class DarkButton { render() { return "темна кнопка"; } }
class DarkCheckbox { render() { return "темний чекбокс"; } }

const lightThemeFactory = {
  createButton: () => new LightButton(),
  createCheckbox: () => new LightCheckbox(),
};
const darkThemeFactory = {
  createButton: () => new DarkButton(),
  createCheckbox: () => new DarkCheckbox(),
};

function renderForm(themeFactory) {
  // клієнт працює з ІНТЕРФЕЙСОМ фабрики й не знає про Light/Dark
  const button = themeFactory.createButton();
  const checkbox = themeFactory.createCheckbox();
  return `${button.render()} + ${checkbox.render()}`;
}

console.log(renderForm(lightThemeFactory)); // світла кнопка + світлий чекбокс
console.log(renderForm(darkThemeFactory));  // темна кнопка + темний чекбокс
// Змінити тему цілого інтерфейсу = передати іншу фабрику.


// ==========================================================================
// 7. ФАБРИЧНА ФУНКЦІЯ ЯК ЗАМІНА КЛАСУ: ПРИВАТНИЙ СТАН ЧЕРЕЗ ЗАМИКАННЯ
// ==========================================================================

// У JS "фабрика" часто — просто функція, що повертає об'єкт. Вона
// не потребує new, не має проблем із втратою this (common/this.js) і
// може ховати стан у замиканні (common/closures.js):

function createCounter(start = 0) {
  let count = start; // приватне: ззовні недоступне

  return {
    increment: () => ++count,
    current: () => count,
  };
}

const c1 = createCounter();
const c2 = createCounter(10);
c1.increment();
c1.increment();
console.log(c1.current(), c2.current()); // 2 10 — незалежні екземпляри
console.log(c1.count); // undefined — стан справді прихований

// Компроміс проти class: кожен об'єкт має ВЛАСНІ копії методів
// (у class вони спільні на прототипі — економія пам'яті, детально
// common/prototypal-inheritance.js, розділ 10), і немає instanceof.


// ==========================================================================
// 8. ФАБРИКА ПОВЕРТАЄ ЩОСЬ, ЧОГО КОНСТРУКТОР НЕ МОЖЕ
// ==========================================================================

// 8.1. КЕШУВАННЯ / ПЕРЕВИКОРИСТАННЯ ЕКЗЕМПЛЯРІВ
// new завжди створює новий об'єкт; фабрика може віддати вже наявний
// (це перегукується з Singleton і Flyweight — patterns/singleton.js).

const colorCache = new Map();
function getColor(hex) {
  if (!colorCache.has(hex)) {
    colorCache.set(hex, Object.freeze({ hex }));
  }
  return colorCache.get(hex);
}
console.log(getColor("#ff0000") === getColor("#ff0000")); // true — один об'єкт

// 8.2. АСИНХРОННЕ СТВОРЕННЯ
// Конструктор не може бути async (не може повернути Promise), тому
// для об'єктів, яким потрібна асинхронна ініціалізація (з'єднання,
// читання файлу), використовують статичну фабрику.

class Connection {
  constructor(id) { this.id = id; }

  static async create(id) {
    await new Promise((resolve) => setTimeout(resolve, 10)); // "підключення"
    return new Connection(id);
  }
}

// 8.3. ПОВЕРНЕННЯ ЗАЛЕЖНО ВІД ВХІДНИХ ДАНИХ
// Один вхід — різні типи виходу. Клієнт працює з однаковим інтерфейсом.

function parserFor(filename) {
  if (filename.endsWith(".json")) return { parse: (t) => JSON.parse(t) };
  if (filename.endsWith(".csv")) return { parse: (t) => t.split("\n").map((r) => r.split(",")) };
  throw new Error(`Немає парсера для ${filename}`);
}
console.log(parserFor("data.csv").parse("a,b\n1,2"));

(async () => {
  const conn = await Connection.create("db-1");
  console.log("Асинхронна фабрика створила:", conn.id);
})();


// ==========================================================================
// 9. ПОШИРЕНІ ПОМИЛКИ ТА НАДМІРНЕ УСКЛАДНЕННЯ
// ==========================================================================

// - Фабрика заради фабрики: якщо є один клас і одна конфігурація,
//   звичайний new простіший і чесніший — не додавай шар без потреби.
// - Фабрика-"комбайн" з десятками параметрів і гілок — сигнал, що
//   пора розбити її на кілька спеціалізованих (або перейти на
//   Builder, коли головна складність — у поетапній збірці одного
//   об'єкта, а не у виборі виду).
// - Змішування вибору й побічних ефектів: фабрика має створювати
//   об'єкти, а не робити запити в мережу чи писати логи.


// ==========================================================================
// 10. ЗВ'ЯЗОК З NEST.JS
// ==========================================================================

// У Nest фабричний підхід вбудований у DI: provider з useFactory
// (node/nest/providers-and-dependency-injection.ts, розділ 7.3) —
// це фабрика, якій контейнер сам передає залежності (inject: [...]),
// і яка може бути асинхронною. Ручний Simple Factory тут потрібен
// рідше, бо вибір реалізації (useClass залежно від середовища) і
// створення значень контейнер бере на себе.


// ПІДСУМОК:
// - Factory відокремлює створення об'єкта від його використання:
//   клієнт просить "дай об'єкт виду X" і не залежить від конкретних
//   класів та деталей ініціалізації
// - Simple Factory — функція з вибором класу (switch або реєстр
//   конструкторів); реєстр краще, бо нові види додаються без правки
//   фабрики (open/closed)
// - Factory Method — базовий клас має крок "створи продукт", а
//   підкласи перевизначають його; вибір робить підклас, не параметр
// - Abstract Factory — створює ціле СІМЕЙСТВО узгоджених об'єктів
//   (темна/світла тема); зміна сімейства = передача іншої фабрики
// - у JS фабрика часто просто функція, що повертає об'єкт: без new,
//   без проблем із this, приватний стан у замиканні (ціна — власні
//   копії методів і немає instanceof)
// - фабрика вміє те, чого не вміє new: кешувати/перевикористовувати
//   екземпляри, повертати різні типи, створювати асинхронно
//   (статичний async create, бо constructor не може бути async)
// - не ускладнюй: для одного класу без варіацій достатньо new; у Nest
//   роль фабрики виконує provider з useFactory
