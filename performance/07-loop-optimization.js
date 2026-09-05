// ==========================================================================
// LOOP OPTIMIZATION & VECTORIZATION — V8 OPTIMIZATION
// ==========================================================================

// 0. ЗАГАЛЬНА ІДЕЯ
// -----------------------------------------------------
// V8 може застосовувати дві ключові оптимізації до циклів:
//   - LOOP UNROLLING (розгортання циклу) — менше ітерацій, менше overhead
//   - VECTORIZATION (SIMD) — обробка кількох елементів за один такт CPU
//
// Обидві оптимізації працюють НАЙКРАЩЕ з Typed Arrays та простою
// математикою. Для звичайних об'єктів V8 РІДКО може застосувати ці
// оптимізації.
//
// Правильне використання дає 2-4x приросту для числових обчислень.


// ==========================================================================
// 1. LOOP UNROLLING
// ==========================================================================

// Звичайний цикл має overhead на КОЖНІЙ ітерації:
//
//   loop:
//     ldr  x0, [x1, x19]   ; завантаж елемент
//     ; ... обробка ...
//     add  x19, x19, #8    ; i++
//     cmp  x19, x20        ; i < length?
//     blt  loop            ; jump назад (branch overhead!)
//
// ПІСЛЯ LOOP UNROLLING (x4) — кожні 4 елементи за одну "ітерацію":
//
//   loop:
//     ldr  x0, [x1, x19]        ; елемент [i]
//     ldr  x2, [x1, x19, #8]    ; елемент [i+1]
//     ldr  x3, [x1, x19, #16]   ; елемент [i+2]
//     ldr  x4, [x1, x19, #24]   ; елемент [i+3]
//     ; ... обробка всіх 4 ...
//     add  x19, x19, #32        ; i += 4
//     cmp  x19, x20
//     blt  loop                 ; 4x менше branch overhead!
//
// РЕЗУЛЬТАТ: 4x менше перевірок умови та branch-інструкцій.


// ==========================================================================
// 2. SIMD VECTORIZATION
// ==========================================================================

// SIMD (Single Instruction Multiple Data) — ОДНА інструкція обробляє
// КІЛЬКА значень паралельно:
//
//   ; БЕЗ SIMD: обробляємо по одному (4 такти)
//   fmul d0, d0, d1   ; result[0] = a[0] * b[0]
//   fmul d2, d2, d3   ; result[1] = a[1] * b[1]
//   fmul d4, d4, d5   ; result[2] = a[2] * b[2]
//   fmul d6, d6, d7   ; result[3] = a[3] * b[3]
//
//   ; З SIMD (ARM64 NEON): обробляємо 4 за раз (1 такт!)
//   fmul v0.4s, v0.4s, v1.4s   ; result[0..3] = a[0..3] * b[0..3]
//
// V8 МОЖЕ автоматично векторизувати цикли, ЯКЩО:
//   1) використовуються Typed Arrays (НЕ звичайні масиви)
//   2) операції ПРОСТІ та передбачувані (без умов усередині)
//   3) дані ПОСЛІДОВНІ в пам'яті (sequential memory access)


// ==========================================================================
// 3. TYPED ARRAYS VS ЗВИЧАЙНІ МАСИВИ
// ==========================================================================

// Це КЛЮЧОВА різниця для loop-оптимізацій:

// ❌ Звичайний масив — V8 НЕ може векторизувати
const regularArrExample = [1.0, 2.0, 3.0, 4.0]; // PACKED_DOUBLE_ELEMENTS
// кожен елемент — HeapNumber-об'єкт на Heap; дані НЕ послідовні в
// пам'яті (кожен об'єкт окремо); V8 не може застосувати SIMD

// ✅ Typed Array — V8 МОЖЕ векторизувати
const typedArrExample = new Float64Array([1.0, 2.0, 3.0, 4.0]);
// дані — чисті числа, послідовно в пам'яті: [1.0][2.0][3.0][4.0] —
// одним блоком! V8 може застосувати SIMD

// ПАМ'ЯТІ LAYOUT:
//   Звичайний масив [1.0, 2.0, 3.0]:
//   Heap: [ptr→HeapNumber] [ptr→HeapNumber] [ptr→HeapNumber]
//              ↓                  ↓                  ↓
//          [1.0 @ 0x1000]   [2.0 @ 0x2000]   [3.0 @ 0x3000]
//          (розкидані по Heap, погано для cache!)
//
//   Float64Array [1.0, 2.0, 3.0]:
//   Buffer: [1.0][2.0][3.0]  ← послідовно, ідеально для SIMD та cache!
//            0x1000 0x1008 0x1010


// ==========================================================================
// 4. CACHE LOCALITY
// ==========================================================================

// Послідовна пам'ять — це НЕ ТІЛЬКИ про SIMD. CPU cache працює блоками
// (cache lines, зазвичай 64 байти):
//
//   Float64Array (8 bytes per element):
//   Cache line (64 bytes) = 8 елементів за раз!
//
//   Коли читаєш arr[0], CPU автоматично завантажує arr[0..7] в cache.
//   arr[1], arr[2], ... arr[7] — вже в cache (безкоштовно!)
//
//   Звичайний масив:
//   arr[0] → завантажуй HeapNumber з 0x1000 (cache miss)
//   arr[1] → завантажуй HeapNumber з 0x2000 (cache miss знову!)
//   arr[2] → завантажуй HeapNumber з 0x3000 (cache miss знову!)
//   Кожен елемент — окремий cache miss!


// ==========================================================================
// ПРАВИЛА ДЛЯ LOOP OPTIMIZATION
// ==========================================================================

// ПРАВИЛО 1: Typed Arrays для числових даних
// -----------------------------------------------------
// ❌ Неправильно: звичайний масив для числових обчислень
const positionsBad = [];
for (let i = 0; i < 10000; i++) {
  positionsBad.push(Math.random());
}
for (let i = 0; i < positionsBad.length; i++) {
  positionsBad[i] *= 2; // V8 не може векторизувати
}

// ✅ Правильно: Typed Array
const positions = new Float64Array(10000);
for (let i = 0; i < positions.length; i++) {
  positions[i] = Math.random();
}
for (let i = 0; i < positions.length; i++) {
  positions[i] *= 2; // V8 МОЖЕ векторизувати!
}


// ПРАВИЛО 2: Structure of Arrays (SoA) замість Array of Structures (AoS)
// -----------------------------------------------------
// ❌ AoS (Array of Structures) — погано для SIMD
const particlesAoS = [];
for (let i = 0; i < 10000; i++) {
  particlesAoS.push({ x: 0, y: 0, vx: 0, vy: 0 });
}
for (let i = 0; i < particlesAoS.length; i++) {
  particlesAoS[i].x += particlesAoS[i].vx; // cache miss на кожному кроці!
}

// ✅ SoA (Structure of Arrays) — ідеально для SIMD
const xs = new Float64Array(10000);
const ys = new Float64Array(10000);
const vxs = new Float64Array(10000);
const vys = new Float64Array(10000);
for (let i = 0; i < 10000; i++) {
  xs[i] += vxs[i]; // послідовний доступ → SIMD + cache friendly
  ys[i] += vys[i]; // послідовний доступ → SIMD + cache friendly
}


// ПРАВИЛО 3: Уникай умов усередині гарячих циклів
// -----------------------------------------------------
// ❌ Умова всередині заважає vectorization
const condArr = new Float64Array(10000);
for (let i = 0; i < condArr.length; i++) {
  if (condArr[i] > 0) {          // умова → V8 не може векторизувати
    condArr[i] = condArr[i] * 2;
  }
}

// ✅ Винеси логіку або використовуй математику замість умов
for (let i = 0; i < condArr.length; i++) {
  condArr[i] = Math.max(0, condArr[i]) * 2; // Math.max замість if
}

// ✅ Або розділи на два цикли (filter → process)
const indices = [];
for (let i = 0; i < condArr.length; i++) {
  if (condArr[i] > 0) indices.push(i);
}
for (let i = 0; i < indices.length; i++) {
  condArr[indices[i]] *= 2;
}


// ПРАВИЛО 4: Прості операції в циклі
// -----------------------------------------------------
function someComplexFunction(v) {
  return v * v + 1; // умовно "складна" функція
}
const dataForComplex = new Float64Array(1000);

// ❌ Складна логіка — V8 не може оптимізувати
for (let i = 0; i < dataForComplex.length; i++) {
  dataForComplex[i] = someComplexFunction(dataForComplex[i]); // виклик функції в циклі
}

// ✅ Прості математичні операції — V8 vectorize
for (let i = 0; i < dataForComplex.length; i++) {
  dataForComplex[i] = dataForComplex[i] * 2.0 + 1.0; // прямі операції → SIMD
}


// ПРАВИЛО 5: Уникай залежностей між ітераціями
// -----------------------------------------------------
const depArr = new Float64Array(1000);
const resultArr = new Float64Array(1000);

// ❌ Залежність між ітераціями — неможлива vectorization
for (let i = 1; i < depArr.length; i++) {
  depArr[i] = depArr[i] + depArr[i - 1]; // depArr[i] залежить від попереднього!
}

// ✅ Незалежні ітерації — можлива vectorization
for (let i = 0; i < depArr.length; i++) {
  resultArr[i] = depArr[i] * 2; // кожна ітерація незалежна
}


// ==========================================================================
// ВПЛИВ НА ПРОДУКТИВНІСТЬ — БЕНЧМАРК
// ==========================================================================

const { performance } = require("perf_hooks");
const SIZE = 1000000;

// ❌ Звичайний масив
const regularArr = Array.from({ length: SIZE }, () => Math.random());
let t0 = performance.now();
for (let i = 0; i < regularArr.length; i++) {
  regularArr[i] *= 2;
}
console.log(`Regular Array: ${(performance.now() - t0).toFixed(0)}ms`);

// ✅ Typed Array
const typedArr = new Float64Array(SIZE);
for (let i = 0; i < SIZE; i++) typedArr[i] = Math.random();
t0 = performance.now();
for (let i = 0; i < typedArr.length; i++) {
  typedArr[i] *= 2;
}
console.log(`Typed Array:   ${(performance.now() - t0).toFixed(0)}ms`);

// ❌ AoS (Array of Structures)
const aos = Array.from({ length: SIZE }, () => ({ x: Math.random(), y: Math.random() }));
t0 = performance.now();
for (let i = 0; i < aos.length; i++) {
  aos[i].x += aos[i].y;
}
console.log(`AoS:           ${(performance.now() - t0).toFixed(0)}ms`);

// ✅ SoA (Structure of Arrays)
const soa = { x: new Float64Array(SIZE), y: new Float64Array(SIZE) };
for (let i = 0; i < SIZE; i++) {
  soa.x[i] = Math.random();
  soa.y[i] = Math.random();
}
t0 = performance.now();
for (let i = 0; i < SIZE; i++) {
  soa.x[i] += soa.y[i];
}
console.log(`SoA:           ${(performance.now() - t0).toFixed(0)}ms`);

// Орієнтовний результат:
//   Regular Array: ~180ms
//   Typed Array:   ~45ms   (4x швидше)
//   AoS:           ~220ms
//   SoA:           ~40ms   (5.5x швидше)


// ==========================================================================
// КОЛИ LOOP OPTIMIZATION НАЙБІЛЬШ КРИТИЧНА
// ==========================================================================
// 1. Particle systems — оновлення позицій тисяч частинок
// 2. Physics simulations — векторна математика
// 3. Image/audio processing — обробка пікселів, сигналів
// 4. Matrix operations — 3D трансформації
// 5. Data processing — агрегація великих числових датасетів
//
// Для циклів з малою кількістю ітерацій (< 1000) ці оптимізації НЕ
// мають помітного ефекту.


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// | Підхід                    | Швидкість | Причина                                    |
// |-----------------------------|-------------|----------------------------------------------|
// | Звичайний масив             | Базова      | HeapNumber-об'єкти, розкидані по Heap        |
// | Typed Array                 | 2-4x        | Послідовна пам'ять, SIMD можливий             |
// | AoS (Array of Structures)   | Базова      | Cache misses при доступі до одного поля      |
// | SoA (Structure of Arrays)   | 3-5x        | Послідовний доступ, SIMD + cache friendly    |
// | Цикл з умовами              | -20-50%     | Заважає vectorization                        |
// | Цикл без умов               | Максимум    | V8 може повністю векторизувати               |
//
// КЛЮЧОВИЙ ПРИНЦИП: для числових обчислень у циклах — Typed Arrays та
// Structure of Arrays. Тримай тіло циклу простим та без умов.