// ==========================================================================
// UNDERSTANDING STREAMS — READABLE STREAMS ДЕТАЛЬНО
// ==========================================================================

const { Readable } = require("stream");
const fs = require("fs");
const fsPromises = require("fs/promises");
const os = require("os");
const path = require("path");
const demoFilePath = path.join(os.tmpdir(), "streams-readable-demo.txt");

async function main() {
  await fsPromises.writeFile(demoFilePath, "0123456789".repeat(2000)); // 20000 байтів


  // ========================================================================
  // 1. ДВА РЕЖИМИ: FLOWING (ПОТОКОВИЙ) ТА PAUSED (ПРИЗУПИНЕНИЙ)
  // ========================================================================

  // Readable stream МОЖЕ ПЕРЕБУВАТИ В ОДНОМУ З ДВОХ РЕЖИМІВ:
  //
  //   PAUSED (за замовчуванням, "стан спокою") — ДАНІ НЕ ТЕЧУТЬ
  //   АВТОМАТИЧНО; ТРЕБА ЯВНО ВИКЛИКАТИ .read(), ЩОБ ОТРИМАТИ chunk
  //
  //   FLOWING — ДАНІ ТЕЧУТЬ АВТОМАТИЧНО, ЯК ТІЛЬКИ З'ЯВЛЯЮТЬСЯ,
  //   І ПОДАЮТЬСЯ ЧЕРЕЗ ПОДІЮ "data" НАСТІЛЬКИ ШВИДКО, НАСКІЛЬКИ
  //   МОЖЛИВО
  //
  // ДОДАВАННЯ ОБРОБНИКА .on("data", ...) АВТОМАТИЧНО ПЕРЕМИКАЄ
  // STREAM У FLOWING-РЕЖИМ (детально показано в 01-overview.js) —
  // ЦЕ НАЙПРОСТІШИЙ, "НАЇВНИЙ" СПОСІБ СПОЖИВАННЯ ДАНИХ:

  await new Promise((resolve) => {
    const flowingStream = fs.createReadStream(demoFilePath);
    let flowingBytes = 0;
    flowingStream.on("data", (chunk) => {
      flowingBytes += chunk.length; // ДАНІ "ЛЛЮТЬСЯ" АВТОМАТИЧНО
    });
    flowingStream.on("end", () => {
      console.log("Flowing-режим: прочитано", flowingBytes, "байтів");
      resolve();
    });
  });

  // PAUSED-РЕЖИМ — ЯВНЕ ЧИТАННЯ ЧЕРЕЗ .read() У ВІДПОВІДЬ НА
  // ПОДІЮ "readable" (СИГНАЛ "Є ЩОСЬ ГОТОВЕ ДО ЧИТАННЯ"):

  await new Promise((resolve) => {
    const pausedStream = fs.createReadStream(demoFilePath);
    let pausedBytes = 0;
    pausedStream.on("readable", () => {
      let chunk;
      while ((chunk = pausedStream.read()) !== null) {
        pausedBytes += chunk.length; // ТИ САМ КОНТРОЛЮЄШ, КОЛИ ЧИТАТИ
      }
    });
    pausedStream.on("end", () => {
      console.log("Paused-режим: прочитано", pausedBytes, "байтів");
      resolve();
    });
  });


  // ========================================================================
  // 2. highWaterMark — РОЗМІР ОДНОГО CHUNK'А (ВНУТРІШНІЙ БУФЕР)
  // ========================================================================

  // highWaterMark ЗАДАЄ РОЗМІР ВНУТРІШНЬОГО БУФЕРА STREAM'А В
  // БАЙТАХ (ЗА ЗАМОВЧУВАННЯМ — 64 KB ДЛЯ ФАЙЛОВИХ STREAMS) — ЦЕ
  // ПРИБЛИЗНИЙ РОЗМІР ОДНОГО chunk'а, ЯКИЙ ТИ ОТРИМАЄШ У "data":

  await new Promise((resolve) => {
    const smallChunkStream = fs.createReadStream(demoFilePath, { highWaterMark: 1024 }); // 1 KB
    let chunks = 0;
    smallChunkStream.on("data", () => chunks++);
    smallChunkStream.on("end", () => {
      console.log(`highWaterMark: 1024 → отримано ${chunks} chunks (файл 20000 байтів)`);
      resolve();
    });
  });

  await new Promise((resolve) => {
    const bigChunkStream = fs.createReadStream(demoFilePath, { highWaterMark: 8192 }); // 8 KB
    let chunks = 0;
    bigChunkStream.on("data", () => chunks++);
    bigChunkStream.on("end", () => {
      console.log(`highWaterMark: 8192 → отримано ${chunks} chunks (той самий файл)`);
      resolve();
    });
  });
  // МЕНШИЙ highWaterMark → БІЛЬШЕ chunks (кожен менший);
  // БІЛЬШИЙ highWaterMark → МЕНШЕ chunks (кожен більший)


  // ========================================================================
  // 3. КЛАСИЧНА ПАСТКА: chunk'и НЕ ЗБІГАЮТЬСЯ З "ЛОГІЧНИМИ" ОДИНИЦЯМИ ДАНИХ
  // ========================================================================

  // ЯКЩО ОБРОБЛЯТИ chunk ЯК "ОДИН РЯДОК" ЧИ "ОДНЕ ЧИСЛО" — ЦЕ
  // ПОМИЛКОВЕ ПРИПУЩЕННЯ: РЯДОК/ЧИСЛО МОЖЕ ОПИНИТИСЬ "РОЗРІЗАНИМ"
  // НА МЕЖІ ДВОХ chunk'ів. САМЕ ЦЯ ПРОБЛЕМА ВИРІШУЄТЬСЯ У
  // ПРАКТИЧНОМУ ПРИКЛАДІ ЧИТАННЯ ВЕЛИКОГО ФАЙЛУ (колишній node/streams/readBig, видалений з репозиторію — лишився в git-історії)
  // ЧЕРЕЗ ЗМІННУ split, ЩО "ЗБЕРІГАЄ" НЕПОВНИЙ
  // ШМАТОК ДАНИХ МІЖ ДВОМА ПОДІЯМИ "data":

  const csvLikePath = path.join(os.tmpdir(), "streams-csv-demo.txt");
  const numbers = Array.from({ length: 500 }, (_, i) => i).join(",");
  await fsPromises.writeFile(csvLikePath, numbers);

  await new Promise((resolve) => {
    const csvStream = fs.createReadStream(csvLikePath, {
      encoding: "utf-8",
      highWaterMark: 50, // ШТУЧНО МАЛИЙ, ЩОБ ГАРАНТОВАНО "РОЗРІЗАТИ" ЧИСЛА
    });

    let leftover = ""; // ТЕ, ЩО НЕ ВДАЛОСЬ "ДОПАРСИТИ" В ПОПЕРЕДНЬОМУ chunk'у
    let parsedCount = 0;

    csvStream.on("data", (chunk) => {
      const combined = leftover + chunk;
      const parts = combined.split(",");
      leftover = parts.pop(); // ОСТАННЯ частина МОЖЕ бути НЕПОВНОЮ — залишаємо "на потім"
      parsedCount += parts.length;
    });

    csvStream.on("end", () => {
      if (leftover) parsedCount++; // останній, вже ПОВНИЙ шматок після останнього chunk'а
      console.log(`Коректно розпарсено ${parsedCount} чисел (мало бути 500)`);
      resolve();
    });
  });

  // БЕЗ ЦІЄЇ ЛОГІКИ (ПРОСТО split(",") НА КОЖНОМУ chunk'у ОКРЕМО)
  // ЧИСЛА НА МЕЖАХ chunk'ів БУЛИ Б "РОЗІРВАНІ" НАВПІЛ — НАПРИКЛАД,
  // "123" МІГ БИ ПЕРЕТВОРИТИСЬ НА ДВА ОКРЕМІ, НЕПОВНІ ЗНАЧЕННЯ "1" І "23".


  // ========================================================================
  // 4. Readable.from() — СТВОРЕННЯ STREAM ІЗ МАСИВУ/ІТЕРАТОРА
  // ========================================================================

  // Readable.from() ПЕРЕТВОРЮЄ БУДЬ-ЯКИЙ ITERABLE (масив, генератор,
  // навіть асинхронний ітератор — детально
  // common/data-structures/iterator/iterator.js) НА READABLE STREAM —
  // ЗРУЧНО ДЛЯ ТЕСТУВАННЯ ЧИ ГЕНЕРАЦІЇ ДАНИХ "НА ЛЬОТУ":

  function* numberGenerator() {
    for (let i = 0; i < 5; i++) yield `число ${i}\n`;
  }
  const generatorStream = Readable.from(numberGenerator());
  for await (const chunk of generatorStream) {
    process.stdout.write("з генератора: " + chunk);
  }


  // ========================================================================
  // 5. for await...of — СУЧАСНИЙ СПОСІБ СПОЖИВАННЯ READABLE STREAM
  // ========================================================================

  // Readable РЕАЛІЗУЄ Symbol.asyncIterator (детально сам протокол —
  // common/asynchronous/asynchronous.js, розділ 19) — ЦЕ ДОЗВОЛЯЄ ОБРОБЛЯТИ STREAM
  // ЧЕРЕЗ for await...of, БЕЗ callback-ІВ "data"/"end" ВЗАГАЛІ:

  const iterableStream = fs.createReadStream(demoFilePath, { encoding: "utf-8", highWaterMark: 4096 });
  let totalViaIterator = 0;
  for await (const chunk of iterableStream) {
    totalViaIterator += chunk.length;
  }
  console.log("for await...of прочитав:", totalViaIterator, "символів");


  // ========================================================================
  // ПРИБИРАННЯ
  // ========================================================================
  await fsPromises.rm(demoFilePath, { force: true });
  await fsPromises.rm(csvLikePath, { force: true });
}

main().catch((err) => console.error("Помилка в демонстрації:", err));


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// - Readable stream працює в ОДНОМУ з двох режимів: flowing (дані
//   течуть автоматично через "data") або paused (явне читання через
//   .read() у відповідь на подію "readable")
// - highWaterMark задає ПРИБЛИЗНИЙ розмір одного chunk'а (за
//   замовчуванням 64 KB для файлових потоків) — менший highWaterMark
//   дає БІЛЬШЕ, дрібніших chunks
// - chunk'и НЕ відповідають "логічним" одиницям даних (рядкам,
//   числам тощо) — дані МОЖУТЬ бути "розрізані" на межі двох chunks,
//   потрібно самостійно зберігати "недописаний залишок" (leftover)
//   між подіями "data" (той самий принцип демонструє реальний
//   практичний приклад читання великого файлу (колишній node/streams/readBig, видалений з репозиторію — лишився в git-історії))
// - Readable.from(iterable) перетворює БУДЬ-ЯКИЙ iterable (масив,
//   генератор) на Readable stream
// - for await...of — сучасний спосіб споживання Readable stream,
//   що використовує вбудований Symbol.asyncIterator, без ручних
//   callback'ів "data"/"end"