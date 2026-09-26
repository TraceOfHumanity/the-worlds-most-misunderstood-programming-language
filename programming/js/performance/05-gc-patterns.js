// ==========================================================================
// GC PATTERNS & MEMORY MANAGEMENT — V8 OPTIMIZATION
// ==========================================================================

// 0. ЗАГАЛЬНА ІДЕЯ
// -----------------------------------------------------
// Garbage Collection (GC) у V8 — механізм автоматичного видалення
// об'єктів з пам'яті, які більше не потрібні. Проблема: GC-паузи можуть
// ПОВНІСТЮ зламати 60fps і зробити застосунок "фризким".
//
// Для стабільної продуктивності (особливо в реал-тайм застосунках —
// іграх, 3D-візуалізації) потрібно МІНІМІЗУВАТИ GC-паузи шляхом
// мінімізації нових алокацій у гарячих циклах.
//
// Розуміння GC patterns дає 2-3x стабільності у frame rate.


// ==========================================================================
// 1. ЯК ПРАЦЮЄ GARBAGE COLLECTION У V8
// ==========================================================================

// 1.1. SCAVENGER (YOUNG GENERATION GC)
// -----------------------------------------------------
// V8 використовує GENERATIONAL GC — об'єкти розділені на "молоді" та "старі":
//
//   ┌────────────────────────────────────┐
//   │ Young Generation (Scavenger)       │ ← часто чиститься
//   │ (новостворені об'єкти), ~1-2 MB    │
//   └────────────────────────────────────┘
//   ┌────────────────────────────────────┐
//   │ Old Generation (Mark & Sweep)      │ ← рідко чиститься
//   │ (об'єкти, що пережили Scavenger)   │
//   │ ~100+ MB                            │
//   └────────────────────────────────────┘


// 1.2. КОЛИ ЗАПУСКАЄТЬСЯ GC
// -----------------------------------------------------
// Scavenger GC (Young): кожного разу, коли Young Generation ПОВНА.
//   - Young Gen вміщує ~2 MB
//   - якщо ти створиш об'єкти на понад 2 MB — V8: "Young Gen переповнена!
//     Запусти Scavenger GC"
//   - пауза: ~10-50ms (залежить від того, скільки об'єктів живі)
//
// Full GC (Old + Young): коли Old Generation теж переповнена.
//   - Old Gen вміщує ~100 MB
//   - якщо багато об'єктів переживають Scavenger GC — V8: "Old Gen
//     переповнена! Запусти Full GC"
//   - пауза: 100-200ms (ДУЖЕ довго!)
//
// НА 60fps ЦЕ ОЗНАЧАЄ:
//   60fps = 1 frame кожні 16.67ms
//   - якщо GC-пауза 50ms  = 3 frames пропущено
//   - якщо GC-пауза 200ms = 12 frames пропущено!
//   - користувач бачить заморозку на 200ms


// ==========================================================================
// 2. ПРОБЛЕМА НАЇВНОГО ПІДХОДУ: 1M ЧАСТИНОК НА FRAME
// ==========================================================================

// ❌ НАЇВНИЙ ПІДХІД
class ParticleNaive {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }
}
const particlesNaive = [];
function gameLoopNaive() {
  for (let i = 0; i < 1000000; i++) {
    const particle = new ParticleNaive(0, 0, 1, 1); // ❌ новий об'єкт!
    particlesNaive.push(particle);
  }
}

// ЩО ВІДБУВАЄТЬСЯ:
//   Frame 1: створи 1M нових об'єктів (4 числа кожен = 32 bytes → 32 MB
//   всього). Young Gen вміщує ~2 MB → переповниться. Scavenger GC
//   запуститься 10+ разів за frame. GC-пауза: ~100-200ms. FPS: 30-40
//   (нестійно, "фризи").
//
//   Frame 2: те ж саме, деякі об'єкти пережили Scavenger → йдуть в
//   Old Gen. Old Gen зростає...
//
//   Frame 10: Old Gen переповнена. Full GC: 200-300ms пауза! Користувач
//   бачить 2 секунди заморозки!
//
// ВІЗУАЛЬНО НА ГРАФІКУ FPS без оптимізації GC:
//   60 ├─────────────────
//      │   ╱╲    ╱╲    ╱╲
//      │  ╱  ╲  ╱  ╲  ╱  ╲
//   40 │╱╲    ╲╱    ╲╱       ← фризи від GC
//      │  ╲
//   20 │   ╲__________________ ← Full GC пауза
//    0 └──────────────────────────────
//      0    5    10   15   20 (секунди)


// ==========================================================================
// 3. РІШЕННЯ 1: OBJECT POOL
// ==========================================================================

// ІДЕЯ: замість створювати нові об'єкти, ПЕРЕВИКОРИСТОВУЙ вже створені.
//
//   Ініціалізація (один раз): Pool: [obj1, obj2, ..., obj100k] — 100k
//   об'єктів у пам'яті одразу
//
//   Frame 1: візьми obj1 з пула, переініціалізуй; візьми obj2,
//   переініціалізуй; ... (1M разів циклічно) → 0 НОВИХ АЛОКАЦІЙ!
//   Frame 2: те саме, перевикористай ТІ САМІ об'єкти → 0 нових алокацій!
//   Результат: 0 GC-паузи, 60fps

class Particle {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.active = false;
    this.lifetime = 0;
  }
  // ініціалізуй об'єкт ПЕРЕД використанням
  init(x, y, vx, vy, lifetime = 1) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.active = true;
    this.lifetime = lifetime;
  }
  // скидай стан при поверненні в пул
  reset() {
    this.active = false;
    this.lifetime = 0;
  }
  // обновляй позицію IN-PLACE
  update(deltaTime) {
    if (!this.active) return;
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) this.reset();
  }
}

class ParticlePool {
  constructor(poolSize = 100000) {
    this.pool = Array.from({ length: poolSize }, () => new Particle()); // один раз
    this.nextIndex = 0;
    this.active = [];
  }
  get() {
    const particle = this.pool[this.nextIndex % this.pool.length];
    this.nextIndex++;
    this.active.push(particle);
    return particle;
  }
  update(deltaTime) {
    for (let i = 0; i < this.active.length; i++) {
      this.active[i].update(deltaTime);
      if (!this.active[i].active) {
        this.active[i] = this.active[this.active.length - 1];
        this.active.pop();
        i--;
      }
    }
  }
  render(ctx) {
    for (let i = 0; i < this.active.length; i++) {
      const p = this.active[i];
      ctx.fillRect(p.x, p.y, 2, 2);
    }
  }
  clear() {
    this.active.length = 0;
    this.nextIndex = 0;
  }
}

// ✅ ВИКОРИСТАННЯ (ctx тут — умовний canvas 2D-контекст)
// const particleSystem = new ParticlePool(100000);
// function gameLoop() {
//   particleSystem.clear();
//   for (let i = 0; i < 1000000; i++) {
//     const p = particleSystem.get();
//     p.init(Math.random() * 800, Math.random() * 600,
//             (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
//   }
//   particleSystem.update(1 / 60);
//   particleSystem.render(ctx);
// }
// Результат: 0 нових об'єктів, 0 GC-паузи, 60fps!

// ПЕРЕВАГИ OBJECT POOL:
//   Пам'ять: наївний 1M * 32 bytes = 32 MB/frame; pool 100k * 32 bytes
//   = 3.2 MB (один раз)
//   GC-паузи: наївний 100-200ms/frame; pool 0ms
//   FPS: наївний 30-40fps; pool 60fps


// ==========================================================================
// 4. РІШЕННЯ 2: TYPED ARRAYS
// ==========================================================================

// Для ЧИСТО ЧИСЛОВИХ даних Typed Arrays значно ефективніші.
//
// ПРОБЛЕМА ОБ'ЄКТІВ: об'єкт { x, y, vx, vy } — це структура + заголовок
// + метадані, реальний розмір ~64-128 bytes (не 32!).

// ✅ TYPED ARRAY ПІДХІД: чистий масив чисел
class ParticleBuffer {
  constructor(maxParticles = 1000000) {
    this.maxParticles = maxParticles;
    this.count = 0;
    this.data = new Float64Array(maxParticles * 4); // x,y,vx,vy для кожної частинки
    this.lifetime = new Float32Array(maxParticles);
  }
  add(x, y, vx, vy, lifetime = 1) {
    if (this.count >= this.maxParticles) return;
    const idx = this.count * 4;
    this.data[idx] = x;
    this.data[idx + 1] = y;
    this.data[idx + 2] = vx;
    this.data[idx + 3] = vy;
    this.lifetime[this.count] = lifetime;
    this.count++;
  }
  update(deltaTime) {
    let writeIdx = 0;
    for (let i = 0; i < this.count; i++) {
      const idx = i * 4;
      this.data[idx] += this.data[idx + 2] * deltaTime;
      this.data[idx + 1] += this.data[idx + 3] * deltaTime;
      this.lifetime[i] -= deltaTime;
      if (this.lifetime[i] > 0) {
        if (writeIdx !== i) {
          this.data[writeIdx * 4] = this.data[idx];
          this.data[writeIdx * 4 + 1] = this.data[idx + 1];
          this.data[writeIdx * 4 + 2] = this.data[idx + 2];
          this.data[writeIdx * 4 + 3] = this.data[idx + 3];
          this.lifetime[writeIdx] = this.lifetime[i];
        }
        writeIdx++;
      }
    }
    this.count = writeIdx;
  }
  render(ctx) {
    for (let i = 0; i < this.count; i++) {
      const idx = i * 4;
      ctx.fillRect(this.data[idx], this.data[idx + 1], 2, 2);
    }
  }
  clear() {
    this.count = 0;
  }
}

// ✅ ВИКОРИСТАННЯ
// const buffer = new ParticleBuffer(1000000);
// function gameLoop() {
//   buffer.clear();
//   for (let i = 0; i < 1000000; i++) {
//     buffer.add(Math.random() * 800, Math.random() * 600,
//                (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
//   }
//   buffer.update(1 / 60);
//   buffer.render(ctx);
// }

// ПЕРЕВАГИ TYPED ARRAYS:
//   Пам'ять: object pool 100k * 128 bytes = 12.8 MB; typed array
//   1M * 32 bytes = 32 MB (один раз)
//   Швидкість: typed array — прямий доступ до пам'яті → 2-3x швидше
//   для батч-операцій
//   GC: обидва варіанти — 0 нових алокацій у стійкому стані


// ==========================================================================
// 5. БАТЧ-ОПЕРАЦІЇ (уникай проміжних об'єктів у циклі)
// ==========================================================================

// Навіть з Object Pool, якщо створюєш проміжні об'єкти в циклі, GC буде!

// ❌ ПОГАНО: проміжні об'єкти у циклі
function processParticlesBad(particles) {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const velocity = { x: p.vx, y: p.vy }; // новий об'єкт!
    const position = { x: p.x, y: p.y };   // новий об'єкт!
    position.x += velocity.x;
    position.y += velocity.y;
    p.x = position.x;
    p.y = position.y;
  }
}

// ✅ ДОБРЕ: in-place батч-операції
function processParticles(particles) {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 9.8; // gravity
    // 0 проміжних об'єктів
  }
}
// НА 1M ЧАСТИНОК: без батч — 2M нових об'єктів/frame, GC-пауза
// 100-150ms; з батч-операціями — 0 нових об'єктів, GC-пауза 0ms.
// Різниця: 60fps vs 30fps.


// ==========================================================================
// 6. REAL-WORLD ПРИКЛАД: КОМБІНОВАНИЙ ПІДХІД ДЛЯ 3D-СИСТЕМИ
// ==========================================================================

class Particle3D {
  constructor() {
    this.position = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.acceleration = { x: 0, y: 0, z: 0 };
    this.lifetime = 0;
    this.active = false;
  }
  init(px, py, pz, vx, vy, vz, lifetime) {
    this.position.x = px;
    this.position.y = py;
    this.position.z = pz;
    this.velocity.x = vx;
    this.velocity.y = vy;
    this.velocity.z = vz;
    this.acceleration.x = 0;
    this.acceleration.y = -9.8;
    this.acceleration.z = 0;
    this.lifetime = lifetime;
    this.active = true;
  }
  update(dt) {
    if (!this.active) return;
    this.velocity.x += this.acceleration.x * dt;
    this.velocity.y += this.acceleration.y * dt;
    this.velocity.z += this.acceleration.z * dt;
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.position.z += this.velocity.z * dt;
    this.lifetime -= dt;
    if (this.lifetime <= 0) this.active = false;
  }
}

class ParticleEmitter {
  constructor(poolSize = 50000) {
    this.pool = Array.from({ length: poolSize }, () => new Particle3D());
    this.active = [];
    this.nextIndex = 0;
  }
  emit(x, y, z, count, lifetime) {
    for (let i = 0; i < count; i++) {
      const p = this.pool[this.nextIndex % this.pool.length];
      this.nextIndex++;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 10 + 5;
      p.init(x, y, z, Math.cos(angle) * speed, Math.random() * 20 + 10, Math.sin(angle) * speed, lifetime);
      this.active.push(p);
    }
  }
  update(dt) {
    for (let i = 0; i < this.active.length; i++) {
      this.active[i].update(dt);
      if (!this.active[i].active) {
        this.active[i] = this.active[this.active.length - 1];
        this.active.pop();
        i--;
      }
    }
  }
}
// const emitter = new ParticleEmitter(50000);
// function gameLoop() {
//   emitter.emit(0, 0, 0, 10000, 2.0);
//   emitter.update(1 / 60);
//   // ... render(camera, renderer) ...
//   // Результат: 60fps без GC-паузи
// }


// ==========================================================================
// 7. ПРОФІЛЮВАННЯ GC
// ==========================================================================

// Chrome DevTools: Performance tab → запиши профіль → дивись на
// GC events (жовті смуги)
//
// Node.js:
//   node --trace-gc myfile.js
// Вихід:
//   [30824:0x110000000] 451 ms: Scavenger (reduce) 1.9 (2.2) -> 1.9 (2.2) MB


// ==========================================================================
// ПІДСУМОК: GC BEST PRACTICES
// ==========================================================================
// 1. Мінімізуй нові алокації у гарячих циклах
// 2. Object Pool для часто створюваних об'єктів
// 3. Typed Arrays для числових даних
// 4. Батч-операції — модифікуй in-place
// 5. Профілюй з DevTools або --trace-gc
//
// ПОРІВНЯННЯ НА 1M ЧАСТИНОК:
//   Наївний підхід:  алокації 1M obj/frame, пам'ять 32 MB/frame,
//                     GC-паузи 50-200ms, FPS 30-40
//   Object Pool:      алокації 0, пам'ять 3-5 MB (один раз),
//                     GC-паузи 0ms, FPS 60
//   Typed Array:      алокації 0, пам'ять 32 MB (одна), GC-паузи 0ms,
//                     FPS 60+
//
// ЧЕКЛИСТ:
// [ ] Чи я створюю нові об'єкти у гарячих циклах?
// [ ] Чи можу я перевикористати об'єкти (Object Pool)?
// [ ] Чи створюю проміжні об'єкти у циклі?
// [ ] Чи можу я використати Typed Arrays?
// [ ] Чи я профілював GC-паузи?