// ==========================================================================
// PROTOTYPE — ПАТЕРН "КЛОНУВАННЯ ЗАМІСТЬ СТВОРЕННЯ"
// ==========================================================================

// 1. ЩО ТАКЕ PROTOTYPE
// -----------------------------------------------------
// Prototype — породжуючий патерн, за яким НОВИЙ об'єкт створюється
// не через конструктор "з нуля", а шляхом КОПІЮВАННЯ (клонування)
// вже наявного об'єкта — "прототипу". Замість "збери об'єкт з
// параметрів" ти кажеш "зроби такий самий, як цей, і підправ
// потрібне".
//
// Коли це корисно:
//   - створення об'єкта ДОРОГЕ (важкі обчислення, запити до БД,
//     розбір великого конфігу) — клонувати готовий дешевше, ніж
//     збирати заново;
//   - об'єкт має БАГАТО налаштувань, а потрібні варіанти
//     відрізняються лише кількома полями (шаблони: "типовий
//     користувач", "типовий документ");
//   - потрібно відокремити код від конкретних класів: клієнт лише
//     викликає clone() і не знає, який клас під капотом.


// ==========================================================================
// 2. НЕ ПЛУТАЙ: ПАТЕРН PROTOTYPE ≠ PROTOTYPE CHAIN У JAVASCRIPT
// ==========================================================================

// У JS слово "prototype" означає дві різні речі:
//
//   1) прототипне наслідування — механізм мови, коли об'єкт ДЕЛЕГУЄ
//      пошук властивостей іншому об'єкту (детально —
//      common/prototypal-inheritance.js);
//   2) патерн Prototype — КЛОНУВАННЯ: результат є НЕЗАЛЕЖНОЮ КОПІЄЮ.
//
// Ключова різниця:
//   Object.create(proto)  → новий об'єкт ДЕЛЕГУЄ до proto: зміна proto
//                            одразу видна в "нащадку" (живий зв'язок);
//   клон (копія)          → повністю окремий об'єкт: зміна оригіналу
//                            його НЕ зачіпає.

const template = { theme: "dark", fontSize: 14 };

const delegating = Object.create(template);
template.fontSize = 20;
console.log(delegating.fontSize); // 20 — бачить зміну (делегування, НЕ клон)
console.log(Object.hasOwn(delegating, "fontSize")); // false — власних полів нема

const copied = { ...template };
template.fontSize = 99;
console.log(copied.fontSize); // 20 — копія зафіксувала значення на момент клонування
console.log(Object.hasOwn(copied, "fontSize")); // true — це власне поле


// ==========================================================================
// 3. ЧОТИРИ СПОСОБИ КЛОНУВАТИ В JS — І ЧОМУ ВОНИ НЕ ОДНАКОВІ
// ==========================================================================

const original = {
  name: "Шаблон",
  tags: ["a", "b"],
  meta: { version: 1 },
  createdAt: new Date("2026-01-01T00:00:00Z"),
  greet() {
    return `Привіт з ${this.name}`;
  },
};

// 3.1. SHALLOW COPY: spread / Object.assign
// Копіюється один рівень; вкладені об'єкти й масиви — ПОСИЛАННЯМИ.
const shallow = { ...original };
shallow.meta.version = 2; // змінили ВКЛАДЕНИЙ об'єкт клона...
console.log(original.meta.version); // 2 — ...і змінився ОРИГІНАЛ (спільне посилання)
original.meta.version = 1; // повертаємо для наступних прикладів

// 3.2. JSON.parse(JSON.stringify(...)) — "глибока" копія з втратами
const viaJson = JSON.parse(JSON.stringify(original));
console.log(typeof viaJson.greet); // "undefined" — функції зникли
console.log(typeof viaJson.createdAt); // "string" — Date став рядком
// також губляться undefined-поля, Map/Set, символи; кругові посилання
// призводять до помилки

// 3.3. structuredClone() — сучасна глибока копія (Node 17+, браузери)
const { greet, ...cloneable } = original; // функцію прибираємо: її структурне клонування не вміє
const deep = structuredClone(cloneable);
deep.meta.version = 5;
console.log(original.meta.version); // 1 — оригінал НЕ зачеплено
console.log(deep.createdAt instanceof Date); // true — Date збережено
// Обмеження: кидає помилку на функціях, а екземпляр класу стає
// ЗВИЧАЙНИМ об'єктом — прототип (методи) губиться (розділ 5).

try {
  structuredClone(original); // містить метод greet
} catch (err) {
  console.log("structuredClone на функції:", err.name); // DataCloneError
}

// 3.4. Власний метод clone() — повний контроль (розділ 4)


// ==========================================================================
// 4. КЛАСИЧНА РЕАЛІЗАЦІЯ: КЛАС ІЗ МЕТОДОМ clone()
// ==========================================================================

class Document {
  constructor(title, author, sections = [], settings = { font: "serif", margin: 2 }) {
    this.title = title;
    this.author = author;
    this.sections = sections;
    this.settings = settings;
  }

  clone() {
    // кожен вкладений об'єкт копіюємо ЯВНО — так клон не ділить з
    // оригіналом жодного змінного стану
    return new Document(
      this.title,
      this.author,
      this.sections.map((s) => ({ ...s })),
      { ...this.settings },
    );
  }

  describe() {
    return `${this.title} (${this.author}), секцій: ${this.sections.length}, шрифт: ${this.settings.font}`;
  }
}

const contract = new Document("Договір", "Юрвідділ", [{ heading: "Предмет" }, { heading: "Ціна" }]);
const contractForClientA = contract.clone();
contractForClientA.title = "Договір — Клієнт A";
contractForClientA.settings.font = "sans";
contractForClientA.sections.push({ heading: "Додаткові умови" });

console.log(contract.describe());            // оригінал НЕ змінився
console.log(contractForClientA.describe());   // клон має власні зміни
console.log(contractForClientA instanceof Document); // true — методи збережено
console.log(contractForClientA === contract); // false


// ==========================================================================
// 5. ПАСТКА: structuredClone ГУБИТЬ ПРОТОТИП (МЕТОДИ)
// ==========================================================================

const brokenClone = structuredClone(contract);
console.log(brokenClone instanceof Document); // false
console.log(typeof brokenClone.describe);      // "undefined" — методів немає
console.log(brokenClone.title);                // "Договір" — дані на місці

// Виправлення, якщо хочеться і глибокої копії, і методів: клонуємо
// дані, а прототип відновлюємо вручну.
const restored = Object.setPrototypeOf(structuredClone(contract), Document.prototype);
console.log(restored.describe()); // працює
// Object.setPrototypeOf повільний і не рекомендований для гарячого
// коду (детально common/data-structures/Object/Object.js) — надійніше
// писати явний clone() (розділ 4).


// ==========================================================================
// 6. РЕЄСТР ПРОТОТИПІВ (PROTOTYPE REGISTRY)
// ==========================================================================

// Часте доповнення до патерна: зберігати готові "зразки" під іменами
// і видавати їхні клони — клієнт не знає, як зразок будується.

class PrototypeRegistry {
  #prototypes = new Map();

  register(name, prototype) {
    this.#prototypes.set(name, prototype);
  }

  create(name, overrides = {}) {
    const prototype = this.#prototypes.get(name);
    if (!prototype) throw new Error(`Невідомий зразок: ${name}`);
    const copy = prototype.clone();
    return Object.assign(copy, overrides); // "клонуй і підправ потрібне"
  }
}

const registry = new PrototypeRegistry();
registry.register("invoice", new Document("Рахунок", "Бухгалтерія", [{ heading: "Позиції" }]));
registry.register("report", new Document("Звіт", "Аналітика", [{ heading: "Висновки" }]));

const invoice1 = registry.create("invoice", { title: "Рахунок №1" });
const invoice2 = registry.create("invoice", { title: "Рахунок №2" });
invoice1.sections.push({ heading: "Знижка" });

console.log(invoice1.describe()); // секцій: 2
console.log(invoice2.describe()); // секцій: 1 — зміна invoice1 не вплинула
console.log(registry.create("report").describe());


// ==========================================================================
// 7. КЛОНУВАННЯ СКЛАДНИХ ДАНИХ: Map, Set, КРУГОВІ ПОСИЛАННЯ
// ==========================================================================

// structuredClone підтримує Map, Set, Date, RegExp, типізовані масиви
// і навіть кругові посилання — те, на чому JSON падає:

const tree = { name: "root", children: new Map([["a", { size: 1 }]]) };
tree.self = tree; // кругове посилання

const treeClone = structuredClone(tree);
console.log(treeClone.self === treeClone); // true — циклічну структуру збережено
console.log(treeClone.children instanceof Map); // true

try {
  JSON.stringify(tree);
} catch (err) {
  console.log("JSON.stringify на циклі:", err.name); // TypeError
}


// ==========================================================================
// 8. ПРОДУКТИВНІСТЬ ТА ДОРЕЧНІСТЬ
// ==========================================================================

// - Глибоке клонування само по собі НЕ безкоштовне: структуру
//   потрібно обійти повністю. Воно вигідне, лише коли ПОБУДОВА об'єкта
//   заново дорожча за копіювання (розбір файлів, запити, важкі
//   обчислення).
// - Для незмінних (immutable) даних клон часто взагалі не потрібен:
//   якщо ніхто не мутує об'єкт, його можна безпечно ділити за
//   посиланням.
// - У UI/стані застосунку (React тощо) замість глибокого клону
//   зазвичай створюють нову версію лише зміненої гілки (structural
//   sharing) — дешевше й зберігає ідентичність незмінених частин.


// ПІДСУМОК:
// - Prototype створює новий об'єкт КЛОНУВАННЯМ наявного, а не
//   конструюванням з нуля — корисно, коли створення дороге або
//   потрібні варіації "шаблону"
// - не плутати з prototype chain: Object.create(proto) дає ЖИВЕ
//   делегування (зміни proto видно в нащадку), клон — НЕЗАЛЕЖНУ
//   копію (зміни оригіналу не видно)
// - spread/Object.assign — shallow: вкладені об'єкти лишаються
//   спільними, зміна клона псує оригінал
// - JSON.parse(JSON.stringify()) — глибока, але з втратами: зникають
//   функції, undefined, символи; Date стає рядком; Map/Set
//   ламаються; кругові посилання дають помилку
// - structuredClone — сучасна глибока копія (Date, Map, Set, цикли),
//   але кидає DataCloneError на функціях і ГУБИТЬ ПРОТОТИП:
//   екземпляр класу стає звичайним об'єктом без методів
// - найнадійніший варіант для власних класів — явний метод clone(),
//   який копіює кожен змінний вкладений об'єкт і зберігає клас
// - реєстр прототипів дає іменовані "зразки": create(name, overrides)
//   = клонуй і підправ потрібне
