// ==========================================================================
// ALLOCATION OPTIMIZATION — V8 OPTIMIZATION
// ==========================================================================

// 0. ЗАГАЛЬНА ІДЕЯ
// -----------------------------------------------------
// Кожна алокація на Heap — це ПОТЕНЦІЙНИЙ GC-тиск у майбутньому.
// Allocation Optimization — це мінімізація КІЛЬКОСТІ та РОЗМІРУ
// алокацій через:
//   - ALLOCATION SINKING     — V8 переносить алокацію ближче до місця використання
//   - ALLOCATION COALESCING  — об'єднання кількох алокацій в одну
//   - PRE-ALLOCATION         — виділення пам'яті заздалегідь одним блоком
//
// Цей принцип тісно пов'язаний з GC Patterns (05) та Escape Analysis
// (03), але фокусується на АРХІТЕКТУРНИХ РІШЕННЯХ щодо алокацій.
//
// Правильне використання дає 2-4x приросту для allocation-heavy коду.


// ==========================================================================
// 1. СПРАВЖНЯ ВАРТІСТЬ АЛОКАЦІЇ
// ==========================================================================

// Алокація — це НЕ просто "виділи пам'яті":
//
//   Кожна new Object() на Heap:
//   1) знайди вільне місце в Young Generation   (~5-10 ns)
//   2) запиши метадані об'єкта (Shape pointer)  (~2-3 ns)
//   3) ініціалізуй властивості нулями           (~2-5 ns)
//   4) оновити allocation pointer               (~1 ns)
//   Разом: ~10-20 ns на алокацію
//
//   На 1,000,000 алокацій: ~10-20ms ТІЛЬКИ від алокацій
//   + GC overhead, коли Young Gen переповнюється
//
// Typed Array або примітивна змінна:
//   let x = 0; або typedArr[i] = 0:
//   1) запиши значення в регістр або stack   (~1 ns)
//   У 10-20x швидше!


// ==========================================================================
// 2. ALLOCATION SINKING
// ==========================================================================

// V8 може "опустити" алокацію вниз по коду, ближче до місця, де вона
// РЕАЛЬНО потрібна. Це зменшує час "життя" об'єкта і зменшує GC-тиск:

const loggerStub = { write: (entry) => console.log("[log]", entry) };

// ❌ Алокація завжди відбувається, навіть якщо не потрібна
function processBad(data, shouldLog) {
  const logEntry = {          // алокується ЗАВЖДИ
    timestamp: Date.now(),
    data: data,
  };
  const result = data * 2;
  if (shouldLog) {            // але використовується тільки ІНОДІ!
    loggerStub.write(logEntry);
  }
  return result;
}

// ✅ Алокація тільки коли реально потрібна
function process(data, shouldLog) {
  const result = data * 2;
  if (shouldLog) {
    loggerStub.write({        // алокується тільки коли shouldLog === true
      timestamp: Date.now(),
      data: data,
    });
  }
  return result;
}


// ==========================================================================
// 3. PRE-ALLOCATION
// ==========================================================================

// Замість динамічного росту структур — виділяй пам'ять ЗАЗДАЛЕГІДЬ:

const itemsStub = Array.from({ length: 1000 }, (_, i) => ({ value: i }));

// ❌ Динамічне зростання масиву
function collectResultsBad(items) {
  const results = [];               // починає з 0
  for (const item of items) {
    results.push(item.value * 2);  // масив росте: 0→4→8→16→32...
    // кожен ріст = нова алокація + копіювання старих даних!
  }
  return results;
}

// ✅ Pre-allocated масив
function collectResults(items) {
  const results = new Array(items.length); // одна алокація потрібного розміру
  for (let i = 0; i < items.length; i++) {
    results[i] = items[i].value * 2;      // записуємо без реалокацій
  }
  return results;
}

// ✅ Або Typed Array (ще краще для чисел)
function collectResultsTyped(items) {
  const results = new Float64Array(items.length);
  for (let i = 0; i < items.length; i++) {
    results[i] = items[i].value * 2;
  }
  return results;
}


// ==========================================================================
// 4. COALESCING — ОБ'ЄДНАННЯ АЛОКАЦІЙ
// ==========================================================================

// ❌ Багато малих алокацій
function buildUserProfileBad(id, name, email, role) {
  const basic = { id, name };                  // алокація 1
  const contact = { email };                    // алокація 2
  const permissions = { role };                 // алокація 3
  const metadata = { createdAt: Date.now() };   // алокація 4
  return { ...basic, ...contact, ...permissions, ...metadata }; // алокація 5!
}

// ✅ Одна алокація
function buildUserProfile(id, name, email, role) {
  return {                                       // одна алокація
    id,
    name,
    email,
    role,
    createdAt: Date.now(),
  };
}

// ❌ String concatenation в циклі (N алокацій рядків)
function buildHTMLBad(items) {
  let html = "";
  for (const item of items) {
    html += `<li>${item.name}</li>`; // новий рядок на КОЖНІЙ ітерації!
  }
  return html;
}

// ✅ Array join (одна алокація в кінці)
function buildHTML(items) {
  const parts = new Array(items.length);
  for (let i = 0; i < items.length; i++) {
    parts[i] = `<li>${items[i].name}</li>`;
  }
  return parts.join(""); // один concat у кінці
}


// ==========================================================================
// ПРАВИЛА ДЛЯ ALLOCATION OPTIMIZATION
// ==========================================================================

// ПРАВИЛО 1: Pre-allocate масиви відомого розміру
// -----------------------------------------------------
// ❌ Динамічний push
function mapValuesBad(arr) {
  const result = [];
  for (const item of arr) {
    result.push(item * 2);
  }
  return result;
}

// ✅ Pre-allocated
function mapValues(arr) {
  const result = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    result[i] = arr[i] * 2;
  }
  return result;
}

// ✅ Typed Array для чисел
function mapValuesTyped(arr) {
  const result = new Float64Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    result[i] = arr[i] * 2;
  }
  return result;
}


// ПРАВИЛО 2: Уникай алокацій у гарячих шляхах (наприклад, rAF-циклі)
// -----------------------------------------------------
function computeMatrix(x, y, scale) {
  return [scale, 0, x, 0, scale, y]; // умовна "матриця"
}
const objStub = { x: 0, y: 0, scale: 1 };

// ❌ Алокація на кожен виклик гарячої функції
function getTransformBad(x, y, scale) {
  return { x, y, scale, matrix: computeMatrix(x, y, scale) }; // Heap!
}
// requestAnimationFrame(function loop() {
//   const transform = getTransformBad(objStub.x, objStub.y, objStub.scale); // нова алокація щоразу!
//   applyTransform(transform);
//   requestAnimationFrame(loop);
// });

// ✅ Перевикористовуй об'єкт (мутуй існуючий)
const transformCache = { x: 0, y: 0, scale: 1, matrix: null };
function updateTransform(x, y, scale) {
  transformCache.x = x;          // мутація існуючого
  transformCache.y = y;          // мутація існуючого
  transformCache.scale = scale;  // мутація існуючого
  transformCache.matrix = computeMatrix(x, y, scale);
  return transformCache;
}
// requestAnimationFrame(function loop() {
//   const transform = updateTransform(objStub.x, objStub.y, objStub.scale); // 0 алокацій!
//   applyTransform(transform);
//   requestAnimationFrame(loop);
// });


// ПРАВИЛО 3: Lazy Allocation — виділяй тільки коли потрібно
// -----------------------------------------------------
// ❌ Eager allocation — завжди виділяємо, навіть якщо не потрібно
class DataProcessorEager {
  constructor() {
    this.cache = new Map();                 // завжди виділяється
    this.buffer = new Float64Array(10000);  // завжди виділяється
    this.metadata = {};                     // завжди виділяється
  }
}
// якщо 90% використань не потребують cache/buffer — марна витрата!

// ✅ Lazy allocation — виділяємо тільки при першому використанні
class DataProcessor {
  constructor() {
    this._cache = null;
    this._buffer = null;
  }
  get cache() {
    if (!this._cache) this._cache = new Map(); // тільки при першому доступі
    return this._cache;
  }
  get buffer() {
    if (!this._buffer) this._buffer = new Float64Array(10000);
    return this._buffer;
  }
}


// ПРАВИЛО 4: Уникай spread у гарячих функціях
// -----------------------------------------------------
const DEFAULT_CONFIG = { timeout: 5000, retries: 3 };
const itemsWithConfig = [{ config: { timeout: 1000 } }, { config: { retries: 5 } }];
function processConfigStub() {}

// ❌ Spread = нова алокація
function mergeBad(defaults, overrides) {
  return { ...defaults, ...overrides }; // нова алокація щоразу!
}
// for (const item of itemsWithConfig) {
//   const config = mergeBad(DEFAULT_CONFIG, item.config); // N алокацій!
//   processConfigStub(config);
// }

// ✅ Мутуй існуючий об'єкт
const tempConfig = { ...DEFAULT_CONFIG }; // один раз поза циклом
for (const item of itemsWithConfig) {
  tempConfig.timeout = item.config.timeout ?? DEFAULT_CONFIG.timeout;
  tempConfig.retries = item.config.retries ?? DEFAULT_CONFIG.retries;
  processConfigStub(tempConfig); // 0 нових алокацій!
}


// ПРАВИЛО 5: Buffer reuse для тимчасових даних
// -----------------------------------------------------
async function processChunkStub() {}

// ❌ Новий буфер щоразу
async function processChunksBad(data) {
  const CHUNK_SIZE = 1024;
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE); // нова алокація!
    await processChunkStub(chunk);
  }
}

// ✅ Перевикористовуй буфер
async function processChunks(data) {
  const CHUNK_SIZE = 1024;
  const buffer = new Float64Array(CHUNK_SIZE); // один раз
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const end = Math.min(i + CHUNK_SIZE, data.length);
    buffer.set(data.subarray(i, end)); // копіюємо в існуючий буфер
    await processChunkStub(buffer.subarray(0, end - i));
  }
}


// ==========================================================================
// КОНТЕКСТ-СПЕЦИФІЧНІ ПРИКЛАДИ (ПСЕВДОКОД, потребують React/Vue рантайму)
// ==========================================================================

// VUE (Composition API)
// -----------------------------------------------------
// ❌ Нові об'єкти в computed
// const transform = computed(() => ({
//   x: position.value.x * scale.value,  // новий об'єкт при кожному перерахунку!
//   y: position.value.y * scale.value
// }));
//
// ✅ Reactive об'єкт, який мутується
// const transform = reactive({ x: 0, y: 0 });
// watchEffect(() => {
//   transform.x = position.value.x * scale.value; // мутація
//   transform.y = position.value.y * scale.value; // мутація
//   // 0 нових алокацій
// });

// REACT
// -----------------------------------------------------
// ❌ Нові масиви/об'єкти при кожному рендері
// function ItemList({ items }) {
//   const processed = items
//     .filter(item => item.active)   // новий масив!
//     .map(item => ({ ...item, label: item.name.toUpperCase() })); // ще один новий масив + N об'єктів!
//   return <ul>{processed.map(item => <li key={item.id}>{item.label}</li>)}</ul>;
// }
//
// ✅ Мемоізація + уникнення зайвих алокацій
// function ItemList({ items }) {
//   const processed = useMemo(() =>
//     items.filter(item => item.active).map(item => ({ ...item, label: item.name.toUpperCase() })),
//     [items] // перераховується тільки коли items змінюється
//   );
//   return <ul>{processed.map(item => <li key={item.id}>{item.label}</li>)}</ul>;
// }


// ==========================================================================
// ВПЛИВ НА ПРОДУКТИВНІСТЬ — БЕНЧМАРК
// ==========================================================================

const { performance } = require("perf_hooks");
const BENCH_SIZE = 1000000;
const benchData = Array.from({ length: BENCH_SIZE }, (_, i) => i);

let t0 = performance.now();
function withPush(arr) {
  const result = [];
  for (const item of arr) result.push(item * 2);
  return result;
}
withPush(benchData);
console.log(`Dynamic push:  ${(performance.now() - t0).toFixed(0)}ms`);

t0 = performance.now();
function withPrealloc(arr) {
  const result = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) result[i] = arr[i] * 2;
  return result;
}
withPrealloc(benchData);
console.log(`Pre-allocated: ${(performance.now() - t0).toFixed(0)}ms`);

t0 = performance.now();
function withTyped(arr) {
  const result = new Float64Array(arr.length);
  for (let i = 0; i < arr.length; i++) result[i] = arr[i] * 2;
  return result;
}
withTyped(benchData);
console.log(`Typed Array:   ${(performance.now() - t0).toFixed(0)}ms`);

// Орієнтовний результат:
//   Dynamic push:  ~180ms  (реалокації при рості масиву)
//   Pre-allocated: ~80ms   (одна алокація)
//   Typed Array:   ~30ms   (одна алокація + SIMD)


// ==========================================================================
// КОЛИ ALLOCATION OPTIMIZATION НАЙБІЛЬШ КРИТИЧНА
// ==========================================================================
// 1. Hot paths — функції в requestAnimationFrame, гарячих циклах
// 2. Data transformation pipelines — map/filter/reduce на великих масивах
// 3. String processing — конкатенація в циклі
// 4. Network response handling — трансформація API-відповідей


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// | Патерн                            | Алокацій             | Продуктивність |
// |--------------------------------------|-------------------------|-------------------|
// | push() у циклі                     | N + реалокації        | Базова           |
// | new Array(n)                        | 1                       | 2x               |
// | new Float64Array(n)                 | 1                       | 4-6x             |
// | Spread {...a, ...b} у циклі         | N                       | Базова           |
// | Мутація існуючого об'єкта           | 0                       | Максимальна      |
// | Lazy allocation                      | Тільки при потребі     | Ситуативно       |
//
// КЛЮЧОВИЙ ПРИНЦИП: мінімізуй кількість алокацій у гарячих шляхах.
// Pre-allocate, коли розмір відомий. Мутуй існуючі об'єкти замість
// створення нових. Виділяй ліниво, коли використання рідкісне.