// ==========================================================================
// REACT.JS — useEffect ДЕТАЛЬНО
// ==========================================================================

// ПРИМІТКА ПРО ЗАПУСК: приклади нижче використовують react +
// react-test-renderer — СПРАВЖНІЙ React, без браузера й без JSX/бандлера
// (React.createElement замість JSX). Це дозволяє перевірити РЕАЛЬНУ
// поведінку useEffect (коли викликається, коли — cleanup, як залежить
// від масиву залежностей). Встановлено як devDependency:
//   npm install --save-dev react react-dom react-test-renderer
// (версія 18 — у 19-й react-test-renderer офіційно deprecated). У
// СПРАВЖНЬОМУ проєкті рендер — TestRenderer.create/update/unmount —
// відповідає першому монтуванню компонента, перерендеру (зміна
// пропсів/стану) і розмонтуванню на реальній сторінці.

globalThis.IS_REACT_ACT_ENVIRONMENT = true; // прибирає службове попередження test-renderer'а
const React = require("react");
const TestRenderer = require("react-test-renderer");
const { act } = TestRenderer; // act() гарантує, що ВСІ ефекти встигли відпрацювати


// 1. ЩО ТАКЕ useEffect
// -----------------------------------------------------
// useEffect — хук для ПОБІЧНИХ ЕФЕКТІВ: усього, що виходить за межі
// чистого обчислення JSX (запити до сервера, підписки, таймери, ручна
// робота з DOM, синхронізація із зовнішньою системою). Тіло компонента
// має лишатись ЧИСТОЮ функцією від пропсів/стану — усе "нечисте"
// виносять в ефект.
//
// Сигнатура:
//   useEffect(setup, dependencies?)
//     setup        — функція, що виконується ПІСЛЯ рендеру;
//                    може повернути функцію "прибирання" (cleanup);
//     dependencies — масив значень, що визначає, КОЛИ ефект
//                    перезапускається (розділ 4).
//
// Головне правило: ефект виконується ПІСЛЯ того, як React оновив DOM
// (у браузері — асинхронно, після пофарбування екрана), а НЕ під час
// самого рендеру. Тому в ефекті вже можна читати актуальний DOM.


// ==========================================================================
// 2. ПРОБЛЕМА: ПОБІЧНИЙ ЕФЕКТ ПРЯМО В ТІЛІ КОМПОНЕНТА
// ==========================================================================

// ❌ Виклик "нечистого" коду прямо під час рендеру:
//   function BadClock() {
//     document.title = new Date().toString(); // побічний ефект під час рендеру
//     return React.createElement("div", null, "...");
//   }
// Проблеми: React може рендерити компонент кілька разів до фактичного
// відображення (Concurrent Mode, Strict Mode), тож "нечистий" код
// виконається ЗАЙВІ рази; такий код неможливо ні прибрати (cleanup),
// ні відкласти до моменту, коли DOM справді готовий.


// ==========================================================================
// 3. БАЗОВИЙ ПРИКЛАД: ЕФЕКТ ВИКОНУЄТЬСЯ ПІСЛЯ РЕНДЕРУ
// ==========================================================================

function Greeting({ name }) {
  console.log(`  рендер: Greeting(${name})`);
  React.useEffect(() => {
    console.log(`  ефект: привітали ${name}`);
  });
  return React.createElement("div", null, `Привіт, ${name}`);
}

let renderer;
act(() => {
  renderer = TestRenderer.create(React.createElement(Greeting, { name: "Оля" }));
});
//   рендер: Greeting(Оля)
//   ефект: привітали Оля
// Порядок незмінний: СПОЧАТКУ рендер (обчислення JSX), ПОТІМ ефект.

console.log(renderer.toJSON().children); // [ 'Привіт, Оля' ] — DOM уже оновлено ДО ефекту


// ==========================================================================
// 4. МАСИВ ЗАЛЕЖНОСТЕЙ: КОЛИ ЕФЕКТ ПЕРЕЗАПУСКАЄТЬСЯ
// ==========================================================================

// 4.1. Без другого аргументу — ефект виконується ПІСЛЯ КОЖНОГО рендеру
function EveryRender({ value }) {
  React.useEffect(() => {
    console.log(`  [без deps] ефект, value=${value}`);
  });
  return React.createElement("div", null, value);
}
let r1;
act(() => { r1 = TestRenderer.create(React.createElement(EveryRender, { value: 1 })); });
//   [без deps] ефект, value=1
act(() => { r1.update(React.createElement(EveryRender, { value: 1 })); }); // те саме значення
//   [без deps] ефект, value=1 — ⚠️ ефект ВСЕ ОДНО повторився

// 4.2. Порожній масив [] — ефект виконується ЛИШЕ РАЗ, при монтуванні
function OnMountOnly() {
  React.useEffect(() => {
    console.log("  [deps: []] лише при монтуванні");
  }, []);
  return React.createElement("div", null, "mounted");
}
let r2;
act(() => { r2 = TestRenderer.create(React.createElement(OnMountOnly)); });
//   [deps: []] лише при монтуванні
act(() => { r2.update(React.createElement(OnMountOnly)); }); // перерендер...
console.log("  (перерендер OnMountOnly без нового логу)"); // ...а логу немає

// 4.3. [деякі значення] — ефект перезапускається, ЛИШЕ коли ЗМІНИЛОСЬ
// ХОЧА Б ОДНЕ з перелічених значень (порівняння через Object.is —
// common/data-structures/Object/Object.js)
function DependsOnCount({ count, label }) {
  React.useEffect(() => {
    console.log(`  [deps: count] ефект для count=${count}`);
  }, [count]); // label НЕ у списку — зміна label ефект НЕ перезапустить
  return React.createElement("div", null, `${label}: ${count}`);
}
let r3;
act(() => { r3 = TestRenderer.create(React.createElement(DependsOnCount, { count: 0, label: "Рахунок" })); });
//   [deps: count] ефект для count=0
act(() => { r3.update(React.createElement(DependsOnCount, { count: 0, label: "Інший підпис" })); });
console.log("  (label змінився, count — ні: ефект НЕ повторився)"); // логу немає
act(() => { r3.update(React.createElement(DependsOnCount, { count: 1, label: "Інший підпис" })); });
//   [deps: count] ефект для count=1 — тепер перезапустився


// ==========================================================================
// 5. CLEANUP: ФУНКЦІЯ "ПРИБИРАННЯ"
// ==========================================================================

// Якщо setup повертає функцію — це cleanup. React викликає її:
//   а) ПЕРЕД тим, як запустити ефект ЗАНОВО (коли залежності змінились);
//   б) ПРИ розмонтуванні компонента.
// Це запобігає витокам: таймери, підписки, слухачі подій, які
// "пережили" б компонент, якщо їх не прибрати.

function TimerLabel({ seconds }) {
  React.useEffect(() => {
    console.log(`  ефект: підписались на seconds=${seconds}`);
    return () => console.log(`  cleanup: відписались від seconds=${seconds}`);
  }, [seconds]);
  return React.createElement("div", null, `${seconds}с`);
}

let r4;
act(() => { r4 = TestRenderer.create(React.createElement(TimerLabel, { seconds: 0 })); });
//   ефект: підписались на seconds=0
act(() => { r4.update(React.createElement(TimerLabel, { seconds: 1 })); });
//   cleanup: відписались від seconds=0   ← СПОЧАТКУ прибирання СТАРОГО
//   ефект: підписались на seconds=1      ← ПОТІМ новий ефект
act(() => { r4.unmount(); });
//   cleanup: відписались від seconds=1   ← і при розмонтуванні теж

// Практичний приклад: підписка на зовнішнє джерело (типовий кейс —
// window.addEventListener, WebSocket, EventEmitter — patterns/observer.js)
function useWindowResizeCount() {
  // імітація EventEmitter замість справжнього window (немає браузера)
  const bus = React.useRef(new (require("node:events").EventEmitter)()).current;
  const [size, setSize] = React.useState(0);
  React.useEffect(() => {
    const handleResize = (w) => setSize(w);
    bus.on("resize", handleResize);
    console.log("  useWindowResizeCount: підписались на 'resize'");
    return () => {
      bus.off("resize", handleResize);
      console.log("  useWindowResizeCount: відписались від 'resize'");
    };
  }, [bus]);
  return { size, bus };
}


// ==========================================================================
// 6. STRICT MODE: ЕФЕКТ МОЖЕ ЗАПУСТИТИСЬ ДВІЧІ В DEV
// ==========================================================================

// У розробці (не в production-збірці!) React.StrictMode навмисно
// монтує компонент, одразу розмонтовує і монтує ЗНОВУ — щоб виявити
// ефекти без коректного cleanup. Якщо ефект написаний правильно
// (cleanup повністю "відкочує" setup), подвійний виклик НЕ помітний
// користувачу. Якщо ефект без cleanup або з побічними ефектами поза
// компонентом — подвійний запуск покаже баг РАНІШЕ, ніж у продакшені.
//
// ⚠️ react-test-renderer (використаний вище) НЕ відтворює цю
// поведінку — подвійний виклик реалізований лише в react-dom/client.
// Тому саме тут піднімаємо СПРАВЖНІЙ DOM через jsdom і рендеримо
// звичайним createRoot — так, як це відбувається у браузері:
const { JSDOM } = require("jsdom");
const dom = new JSDOM('<div id="root"></div>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
const { createRoot } = require("react-dom/client");

let strictCalls = 0;
function StrictChild() {
  React.useEffect(() => {
    strictCalls++;
    return () => {}; // коректний cleanup — порожній, бо нічого не підписували
  }, []);
  return null;
}
const strictRoot = createRoot(document.getElementById("root"));
act(() => {
  strictRoot.render(
    React.createElement(React.StrictMode, null, React.createElement(StrictChild)),
  );
});
console.log(strictCalls); // 2 — у StrictMode ефект монтування спрацював двічі (setup→cleanup→setup)
// (без StrictMode, як у прикладах вище через react-test-renderer, було б 1)


// ==========================================================================
// 7. ПАСТКА: ЗАСТАРІЛІ ЗНАЧЕННЯ В ЗАМИКАННІ (STALE CLOSURE)
// ==========================================================================

// Ефект — це замикання (common/closures.js): він "запам'ятовує" пропси
// й стан НА МОМЕНТ свого створення. Якщо в масиві залежностей забути
// значення, що використовується всередині, — ефект бачитиме ЗАСТАРІЛЕ
// значення, доки не перезапуститься сам.

function StaleLogger({ value }) {
  React.useEffect(() => {
    console.log(`  [stale-приклад] бачу value=${value}`); // ❌ value відсутній у deps
  }, []); // порожній масив — ефект створюється ОДИН раз і "застигає" на першому value
  return null;
}
let r5;
act(() => { r5 = TestRenderer.create(React.createElement(StaleLogger, { value: "перше" })); });
//   [stale-приклад] бачу value=перше
act(() => { r5.update(React.createElement(StaleLogger, { value: "друге" })); });
console.log("  (жодного нового логу — ефект не перезапустився і не бачить 'друге')");

// ✅ Виправлення — чесно вказати залежність:
function FreshLogger({ value }) {
  React.useEffect(() => {
    console.log(`  [fresh-приклад] бачу value=${value}`);
  }, [value]); // тепер ефект перезапускається і бачить АКТУАЛЬНЕ value
  return null;
}
let r6;
act(() => { r6 = TestRenderer.create(React.createElement(FreshLogger, { value: "перше" })); });
//   [fresh-приклад] бачу value=перше
act(() => { r6.update(React.createElement(FreshLogger, { value: "друге" })); });
//   [fresh-приклад] бачу value=друге

// Лінтер eslint-plugin-react-hooks (правило exhaustive-deps) саме для
// цього і потрібен: він попереджає про значення, використані всередині
// ефекту, але відсутні в масиві залежностей. Ігнорувати це попередження
// "щоб не перезапускалось" — типова причина stale closure багів.


// ==========================================================================
// 8. ПАСТКА: НЕСТАБІЛЬНІ ЗАЛЕЖНОСТІ (ОБ'ЄКТИ Й ФУНКЦІЇ)
// ==========================================================================

// Масив/об'єкт/функція, створені ПРЯМО в тілі компонента, — це НОВЕ
// посилання на КОЖЕН рендер, навіть якщо вміст "той самий" (порівняння
// в deps іде за Object.is, тобто за посиланням для об'єктів —
// common/type-coercion.js). Це змушує ефект перезапускатись щоразу.

function UnstableDeps({ id }) {
  const options = { id }; // ❌ новий об'єкт-посилання при КОЖНОМУ рендері
  React.useEffect(() => {
    console.log(`  [нестабільний obj] ефект для id=${options.id}`);
  }, [options]); // options завжди "змінився" — ефект спрацює щоразу
  return null;
}
let r7;
act(() => { r7 = TestRenderer.create(React.createElement(UnstableDeps, { id: 1 })); });
//   [нестабільний obj] ефект для id=1
act(() => { r7.update(React.createElement(UnstableDeps, { id: 1 })); }); // те саме id!
//   [нестабільний obj] ефект для id=1 — ⚠️ повторився попри однакове id

// Виправлення: залежати від ПРИМІТИВНОГО значення, а не від обгортки:
function StableDeps({ id }) {
  React.useEffect(() => {
    console.log(`  [стабільний примітив] ефект для id=${id}`);
  }, [id]); // число id порівнюється за значенням
  return null;
}
let r8;
act(() => { r8 = TestRenderer.create(React.createElement(StableDeps, { id: 1 })); });
//   [стабільний примітив] ефект для id=1
act(() => { r8.update(React.createElement(StableDeps, { id: 1 })); }); // немає нового логу
console.log("  (id не змінився — ефект коректно НЕ повторився)");
// Для функцій-колбеків та об'єктів, які справді потрібно стабілізувати
// (наприклад, пропс для дочірнього компонента), використовують
// useCallback/useMemo — окрема тема.


// ==========================================================================
// 9. ПАСТКА: setState ВСЕРЕДИНІ useEffect БЕЗ УМОВИ — НЕСКІНЧЕННИЙ ЦИКЛ
// ==========================================================================

// Якщо ефект оновлює стан, від якого сам залежить, БЕЗ жодної умови —
// кожен виклик setState спричиняє новий рендер → новий запуск ефекту →
// знову setState. Демонструємо БЕЗПЕЧНО, з лічильником і штучним лімітом:

function InfiniteLoopRisk() {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    if (count < 3) setCount((c) => c + 1); // ⚠️ БЕЗ УМОВИ це був би нескінченний цикл
  }); // без масиву залежностей — ефект після КОЖНОГО рендеру
  return React.createElement("div", null, count);
}
let r9;
act(() => { r9 = TestRenderer.create(React.createElement(InfiniteLoopRisk)); });
console.log(r9.toJSON().children); // [ '3' ] — зупинилось завдяки умові count < 3
// Без умови "if (count < 3)" цей код "повісив" би рендер-цикл. Якщо
// потрібно оновити стан ОДИН раз на монтуванні — deps: []; якщо стан
// має залежати від пропса — деривуйте значення прямо під час рендеру
// (розділ 10), а не через ефект.


// ==========================================================================
// 10. КОЛИ useEffect НЕ ПОТРІБЕН (НАЙЧАСТІША ПОМИЛКА НОВАЧКІВ)
// ==========================================================================

// ❌ Синхронізація ОДНОГО стану на основі ІНШОГО через ефект — зайвий
// рендер і затримка на кадр:
//   const [firstName, setFirstName] = useState("Оля");
//   const [fullName, setFullName] = useState("");
//   useEffect(() => { setFullName(firstName + " Коваль"); }, [firstName]);
//
// ✅ Якщо значення МОЖНА обчислити прямо під час рендеру — обчислюй
// його ПІД ЧАС рендеру, без useEffect і без окремого стану:
function DerivedName({ firstName }) {
  const fullName = `${firstName} Коваль`; // звичайна змінна, не useState!
  return React.createElement("div", null, fullName);
}
let r10;
act(() => { r10 = TestRenderer.create(React.createElement(DerivedName, { firstName: "Марія" })); });
console.log(r10.toJSON().children); // [ 'Марія Коваль' ] — без жодного useEffect

// useEffect потрібен САМЕ для СИНХРОНІЗАЦІЇ З ЗОВНІШНІМИ СИСТЕМАМИ:
// DOM API, мережеві запити, таймери, підписки, сторонні бібліотеки —
// усе, чого React сам не контролює. Дані, похідні від пропсів/стану
// компонента, обчислюйте прямо в тілі функції (як fullName вище) або
// через useMemo, якщо обчислення дороге.


// ПІДСУМОК:
// - useEffect(setup, deps?) — хук для побічних ефектів: усього, що
//   виходить за межі чистого обчислення JSX (мережа, таймери,
//   підписки, ручний DOM); виконується ПІСЛЯ рендеру, а не під час нього
// - масив залежностей визначає частоту запуску: без нього — після
//   КОЖНОГО рендеру; [] — лише при монтуванні; [a, b] — коли змінилось
//   a АБО b (порівняння за Object.is, тобто об'єкти/функції — за
//   посиланням)
// - setup може повернути функцію cleanup: вона виконується ПЕРЕД
//   наступним запуском ефекту і ПРИ розмонтуванні — саме тут
//   відписуються від подій, скасовують таймери й запити
// - React.StrictMode в dev-режимі монтує/розмонтовує/монтує компонент
//   навмисно двічі, щоб виявити ефекти без коректного cleanup —
//   поведінка, яку компонент користувача не повинен помічати
// - ПАСТКА stale closure: ефект — замикання, що "застигає" на момент
//   створення; забутий у deps пропс/стан лишається застарілим, поки
//   ефект не перезапуститься (лінтер exhaustive-deps ловить це)
// - ПАСТКА нестабільних залежностей: об'єкт/масив/функція, створені в
//   тілі компонента, — нове посилання щорендеру, тому ефект
//   перезапускається завжди; залежайте від примітивів
// - ПАСТКА нескінченного циклу: setState у ефекті БЕЗ умови й БЕЗ
//   правильних deps перезапускає сам себе через кожен новий рендер
// - НАЙЧАСТІША ПОМИЛКА: не використовуйте useEffect + useState для
//   значення, яке можна ОБЧИСЛИТИ прямо під час рендеру — це зайвий
//   рендер, затримка й джерело багів; useEffect — для синхронізації із
//   зовнішнім світом, а не для похідних даних усередині компонента
