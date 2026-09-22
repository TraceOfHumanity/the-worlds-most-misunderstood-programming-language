// ==========================================================================
// VUE.JS — COMPUTED ДЕТАЛЬНО
// ==========================================================================

// ПРИМІТКА ПРО ЗАПУСК: приклади нижче використовують @vue/reactivity —
// ЦЕ ТОЙ САМИЙ реактивний рушій, на якому побудований Vue 3 (computed()
// у справжньому Vue — просто реекспорт звідси). Це дозволяє перевірити
// РЕАЛЬНУ поведінку computed (кешування, лінивість, трекінг залежностей)
// без браузера й без .vue-файлів. Встановлено як devDependency:
//   npm install --save-dev @vue/reactivity
// У СПРАВЖНЬОМУ проєкті ти імпортуєш те саме з "vue":
//   import { reactive, computed } from "vue";

const { reactive, computed, effect } = require("@vue/reactivity");


// 1. ЩО ТАКЕ computed
// -----------------------------------------------------
// computed — ПОХІДНЕ реактивне значення: результат обчислюється з інших
// реактивних джерел (reactive/ref) і автоматично оновлюється, коли вони
// змінюються. Головні властивості, що відрізняють його від звичайної
// функції чи методу:
//   - ЛІНИВІСТЬ (lazy): getter не виконується, поки НІХТО не прочитав .value;
//   - КЕШУВАННЯ: повторне читання .value НЕ перераховує значення, якщо
//     залежності не змінювались — повертається закешований результат;
//   - ТРЕКІНГ ЗАЛЕЖНОСТЕЙ: Vue сам визначає, які реактивні властивості
//     читає getter, і перераховує значення ЛИШЕ коли змінюється ОДНА З
//     НИХ (а не "будь-що в компоненті").
//
// У шаблоні Vue-компонента (.vue, <script setup>) це виглядає так:
//   <script setup>
//   import { reactive, computed } from "vue";
//   const state = reactive({ price: 100, qty: 2 });
//   const total = computed(() => state.price * state.qty);
//   </script>
//   <template><p>{{ total }}</p></template>
// Нижче — той самий приклад БЕЗ шаблону, з ручною перевіркою .value.


// ==========================================================================
// 2. ПРОБЛЕМА: МЕТОД ПЕРЕРАХОВУЄ ЗНАЧЕННЯ ЩОРАЗУ
// ==========================================================================

// ❌ Якщо total — звичайний метод (функція), він виконується ПРИ КОЖНОМУ
// виклику, навіть якщо price і qty не змінювались відтоді:
const stateBad = reactive({ price: 100, qty: 2 });

let methodCalls = 0;
function totalMethod() {
  methodCalls++;
  return stateBad.price * stateBad.qty;
}

console.log(totalMethod(), totalMethod(), totalMethod()); // 200 200 200
console.log(methodCalls); // 3 — порахував тричі, хоча дані не мінялись

// У реальному компоненті метод у шаблоні викликається на КОЖЕН
// перерендер (навіть якщо змінилось щось геть інше в компоненті) —
// для дорогих обчислень (сортування великого масиву, фільтрація) це
// прямий удар по продуктивності.


// ==========================================================================
// 3. БАЗОВИЙ ПРИКЛАД: computed КЕШУЄ РЕЗУЛЬТАТ
// ==========================================================================

const state = reactive({ price: 100, qty: 2 });

let computeCount = 0;
const total = computed(() => {
  computeCount++;
  return state.price * state.qty;
});

console.log(total.value); // 200
console.log(total.value); // 200
console.log(total.value); // 200
console.log(computeCount); // 1 — getter виконався ЛИШЕ РАЗ, решта — з кешу

state.qty = 3; // змінили залежність
console.log(total.value); // 300 — перерахувалось
console.log(computeCount); // 2

console.log(total.value); // 300 — знову з кешу
console.log(computeCount); // 2 — не змінилось


// ==========================================================================
// 4. ЛІНИВІСТЬ: GETTER НЕ ВИКОНУЄТЬСЯ, ПОКИ ЙОГО НЕ ПРОЧИТАЛИ
// ==========================================================================

let lazyCalls = 0;
const neverRead = computed(() => {
  lazyCalls++;
  return state.price * 100;
});

state.price = 999; // змінили залежність computed'а, який ніхто не читає
console.log(lazyCalls); // 0 — getter ЖОДНОГО РАЗУ не викликався

console.log(neverRead.value); // 99900 — тепер обчислив, при ПЕРШОМУ читанні
console.log(lazyCalls); // 1
state.price = 100; // повертаємо для наступних прикладів


// ==========================================================================
// 5. ТРЕКІНГ ЗАЛЕЖНОСТЕЙ: РЕАГУЄ ЛИШЕ НА ТЕ, ЩО РЕАЛЬНО ЧИТАЄ
// ==========================================================================

const cart = reactive({ price: 100, qty: 2, note: "терміново" });

let priceOnlyCalls = 0;
// getter звертається ЛИШЕ до price — note НЕ є його залежністю
const priceLabel = computed(() => {
  priceOnlyCalls++;
  return `${cart.price} грн`;
});

console.log(priceLabel.value); // 100 грн
console.log(priceOnlyCalls); // 1

cart.note = "не терміново"; // змінили властивість, яку computed НЕ читає
console.log(priceLabel.value); // 100 грн — той самий кеш
console.log(priceOnlyCalls); // 1 — НЕ перерахувалось!

cart.price = 150; // а тепер змінили те, що computed СПРАВДІ використовує
console.log(priceLabel.value); // 150 грн
console.log(priceOnlyCalls); // 2

// Це і є головна перевага над "перерахувати все в одному watch/методі":
// Vue сам будує граф залежностей під час першого виконання getter'а.


// ==========================================================================
// 6. УМОВНІ ЗАЛЕЖНОСТІ: СПИСОК ЗАЛЕЖНОСТЕЙ МОЖЕ ЗМІНЮВАТИСЬ
// ==========================================================================

const toggle = reactive({ useDiscount: false, price: 100, discountPrice: 80 });

let condCalls = 0;
const finalPrice = computed(() => {
  condCalls++;
  // при useDiscount=false discountPrice ВЗАГАЛІ не читається —
  // отже computed на нього поки НЕ підписаний
  return toggle.useDiscount ? toggle.discountPrice : toggle.price;
});

console.log(finalPrice.value); // 100
console.log(condCalls); // 1

toggle.discountPrice = 70; // ще не залежність — гілка не читалась
console.log(finalPrice.value); // 100 — не перерахувалось
console.log(condCalls); // 1

toggle.useDiscount = true; // тепер price перестав бути залежністю...
console.log(finalPrice.value); // 70
console.log(condCalls); // 2

toggle.price = 999; // ...і зміна price більше НЕ впливає на результат
console.log(finalPrice.value); // 70 — той самий кеш
console.log(condCalls); // 2 — не перерахувалось, бо ця гілка вже не читає price


// ==========================================================================
// 7. WRITABLE COMPUTED: get + set
// ==========================================================================

// computed(fn) — тільки для читання (read-only). Щоб дозволити ЗАПИС,
// передають об'єкт { get, set } — типовий приклад: computed-властивість,
// що "розкладає" одне значення на кілька реактивних джерел (форма з
// повним ім'ям, зібраним з імені та прізвища).

const person = reactive({ firstName: "Оля", lastName: "Коваль" });

const fullName = computed({
  get() {
    return `${person.firstName} ${person.lastName}`;
  },
  set(value) {
    [person.firstName, person.lastName] = value.split(" ");
  },
});

console.log(fullName.value); // Оля Коваль
fullName.value = "Марія Петренко"; // виклик set()
console.log(person.firstName, person.lastName); // Марія Петренко
console.log(fullName.value); // Марія Петренко — get() перерахував з нових даних

total.value = 500; // спроба записати в readonly-computed (розділ 3, немає set)
// [Vue warn] Write operation failed: computed value is readonly
// ⚠️ Помилка НЕ кидається — це лише dev-попередження в консоль;
// присвоєння мовчки ІГНОРУЄТЬСЯ, значення лишається як було:
console.log(total.value); // 300 — не змінилось


// ==========================================================================
// 8. ЛАНЦЮЖКИ: computed, ЩО ЗАЛЕЖИТЬ ВІД ІНШОГО computed
// ==========================================================================

const order = reactive({ price: 200, qty: 3, taxRate: 0.2 });

const subtotal = computed(() => order.price * order.qty); // 1-й рівень
const tax = computed(() => subtotal.value * order.taxRate); // залежить від computed
const grandTotal = computed(() => subtotal.value + tax.value); // залежить від двох

console.log(subtotal.value, tax.value, grandTotal.value); // 600 120 720

order.qty = 5;
console.log(subtotal.value, tax.value, grandTotal.value); // 1000 200 1200
// Зміна ОДНОГО джерела коректно "проходить" крізь увесь ланцюжок:
// Vue перебудовує залежності на кожному рівні автоматично.


// ==========================================================================
// 9. computed ЯК ЗАЛЕЖНІСТЬ EFFECT (ІМІТАЦІЯ РЕНДЕРУ КОМПОНЕНТА)
// ==========================================================================

// У реальному компоненті шаблон — це, по суті, effect(), який
// перезапускається, коли змінюється БУДЬ-ЩО реактивне, прочитане під
// час рендеру. Порівняємо, скільки разів "рендериться" компонент із
// computed і скільки — якби total був методом.

const shop = reactive({ price: 10, qty: 1, theme: "dark" }); // theme — НЕ бере участь у total

let computedRenders = 0;
const shopTotal = computed(() => shop.price * shop.qty);
effect(() => {
  computedRenders++;
  shopTotal.value; // "шаблон" читає computed
});

let methodRenders = 0;
effect(() => {
  methodRenders++;
  shop.theme; // "шаблон" читає theme напряму (метод total() тут НЕ читається,
  // бо effect стежить лише за тим, що читає ВСЕРЕДИНІ себе — розділ 5)
});

console.log(computedRenders, methodRenders); // 1 1 — початковий запуск

shop.theme = "light"; // змінили те, що НЕ впливає на shopTotal
console.log(computedRenders, methodRenders); // 1 2 — перерендерився лише другий effect

shop.qty = 2; // змінили залежність computed
console.log(computedRenders, methodRenders); // 2 2 — перерахувався лише перший


// ==========================================================================
// 10. ПАСТКИ
// ==========================================================================

// 10.1. ПОБІЧНІ ЕФЕКТИ В GETTER'І — заборонено за задумом
// computed повинен бути ЧИСТОЮ функцією: тільки читати реактивні дані
// й повертати значення. Мутація стану всередині getter'а технічно не
// кидає помилку, але ламає модель "похідне значення" і в реальному Vue
// в dev-режимі виводить попередження в консоль:
const dirty = reactive({ value: 1, log: [] });
const dirtyComputed = computed(() => {
  dirty.log.push("обчислено"); // ❌ побічний ефект: мутація ІНШОЇ властивості
  return dirty.value * 2;
});
console.log(dirtyComputed.value); // 2
console.log(dirty.log); // [ 'обчислено' ] — непередбачувана мутація стану

// 10.2. computed НЕ МОЖЕ БУТИ ASYNC
// getter повинен повертати значення СИНХРОННО. async-функція завжди
// повертає Promise, тож .value стане самим Promise-об'єктом, а не
// результатом — computed НЕ вміє "чекати" і не позначить залежності,
// прочитані ПІСЛЯ await (трекінг завершується разом із синхронним
// виконанням getter'а):
const asyncComputed = computed(async () => {
  await Promise.resolve();
  return state.price;
});
console.log(asyncComputed.value instanceof Promise); // true — не число!
// Правильний підхід для асинхронних даних — ref + watchEffect/onMounted,
// або бібліотеки на кшталт VueUse (asyncComputed/useAsyncState).

// 10.3. МУТАЦІЯ РЕЗУЛЬТАТУ computed З МАСИВОМ/ОБ'ЄКТОМ
// computed().value з масивом — це РЕАКТИВНИЙ проксі (як reactive()).
// Мутувати його напряму ззовні можна (Vue не кидає помилку для read-only
// computed з посилальним типом), але це обхід моделі "похідне
// значення" — джерело правди більше не одне:
const list = reactive({ items: [3, 1, 2] });
const sorted = computed(() => [...list.items].sort((a, b) => a - b));
console.log(sorted.value); // [ 1, 2, 3 ]
sorted.value.push(999); // ⚠️ технічно спрацює, але це антипатерн
console.log(sorted.value); // [ 1, 2, 3, 999 ] — "просочилось" в кеш
list.items = [5, 4]; // тригеримо перерахунок
console.log(sorted.value); // [ 4, 5 ] — стара мутація зникла, бо getter перезапустився

// 10.4. computed З ВАЖКОЮ, АЛЕ РІДКО ЗАЛЕЖНОЮ ЛОГІКОЮ
// Кешування рятує лише те, що читається як computed.value. Якщо
// всередині getter'а є виклик функції з ВЛАСНИМ внутрішнім станом
// (Math.random(), Date.now(), зовнішній лічильник) — результат
// перестає бути чистою похідною даних і поводиться непередбачувано
// між перерахунками:
const flaky = computed(() => Math.random()); // ❌ не реактивна залежність, кеш "замерзає" випадково
console.log(flaky.value === flaky.value); // true — те саме випадкове число при повторному читанні
// (бо перерахунку НЕ було — Math.random не є reactive-залежністю)

// 10.5. НАДЛИШКОВИЙ computed ЗАМІСТЬ ЗВИЧАЙНОЇ КОНСТАНТИ
// Якщо значення НЕ залежить від жодного reactive/ref — computed лише
// додає накладні витрати без користі:
// ❌ const pi = computed(() => 3.14159);
// ✅ const pi = 3.14159;


// ==========================================================================
// 11. computed vs ЗВИЧАЙНИЙ ГЕТТЕР КЛАСУ / ОБ'ЄКТА
// ==========================================================================

// Плутанина через однакову назву. Звичайний getter у класі
// (common/data-structures/Object/Object.js, розділ про
// defineProperty) НЕ кешує — виконується щоразу при читанні:
class PlainCart {
  price = 100;
  qty = 2;
  get total() {
    console.log("  [плейн-геттер] обчислення");
    return this.price * this.qty;
  }
}
const plain = new PlainCart();
plain.total; //   [плейн-геттер] обчислення
plain.total; //   [плейн-геттер] обчислення — щоразу заново, кешу немає

// computed() Vue — це геттер + АВТОМАТИЧНЕ кешування + реактивний
// трекінг залежностей; звичайний getter класу — лише синтаксис виклику
// без дужок, без кешування і без підписки на зміни.


// ==========================================================================
// 12. computed vs watch/watchEffect
// ==========================================================================

// computed:     "Обчисли МЕНЕ на основі даних" — повертає ЗНАЧЕННЯ,
//               декларативно, без побічних ефектів, з кешем.
// watch/
// watchEffect:  "Зроби ЩОСЬ, коли дані зміняться" — побічні ефекти
//               (запит на сервер, лог, ручна мутація DOM), значення
//               не повертає.
// Якщо ловиш себе на тому, що пишеш watch і вручну присвоюєш
// результат в ref — це майже завжди мало бути computed:
//   ❌ const total = ref(0);
//      watch([price, qty], () => { total.value = price.value * qty.value; });
//   ✅ const total = computed(() => price.value * qty.value);


// ПІДСУМОК:
// - computed — похідне реактивне значення: ЛІНИВЕ (не рахує, поки
//   ніхто не прочитав .value) і КЕШОВАНЕ (повторне читання без зміни
//   залежностей не перераховує)
// - Vue сам відстежує залежності під час ПЕРШОГО виконання getter'а —
//   реагує лише на реактивні властивості, які getter РЕАЛЬНО прочитав;
//   змінити результат може навіть НАБІР залежностей (умовні гілки,
//   розділ 6)
// - readonly: computed(fn); writable: computed({ get, set }) — set
//   зазвичай "розкладає" нове значення назад у вихідні reactive-джерела
// - ланцюжки computed → computed працюють природно: зміна кореневого
//   джерела коректно проходить крізь усі рівні
// - ПАСТКИ: побічні ефекти в getter'і ламають модель "чиста похідна
//   величина"; computed НЕ підтримує async (getter має бути
//   синхронним, інакше .value стане Promise); мутація масиву/об'єкта
//   з computed().value — антипатерн; Math.random()/Date.now() всередині
//   не є реактивною залежністю, тому кеш не оновлюється передбачувано
// - відрізняй від звичайного getter класу (не кешує, немає трекінгу) і
//   від watch/watchEffect (побічні ефекти, а не повернення значення):
//   якщо результат МОЖНА виразити як функцію від реактивних даних —
//   це computed, а не watch
// - головна практична вигода: дороге обчислення (сортування, фільтрація,
//   агрегація) виконується РІВНО СТІЛЬКИ РАЗІВ, скільки реально
//   змінювались його залежності, а не на кожен рендер компонента
