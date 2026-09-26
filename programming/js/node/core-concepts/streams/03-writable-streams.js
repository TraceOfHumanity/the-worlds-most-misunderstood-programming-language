// ==========================================================================
// UNDERSTANDING STREAMS — WRITABLE STREAMS ТА BACKPRESSURE ДЕТАЛЬНО
// ==========================================================================

const fs = require("fs");
const fsPromises = require("fs/promises");
const os = require("os");
const path = require("path");
const demoFilePath = path.join(os.tmpdir(), "streams-writable-demo.txt");

async function main() {
  // ========================================================================
  // 1. write() ТА end() — ОСНОВНІ МЕТОДИ WRITABLE STREAM
  // ========================================================================

  await new Promise((resolve) => {
    const writeStream = fs.createWriteStream(demoFilePath);

    writeStream.write("Перший рядок\n");
    writeStream.write("Другий рядок\n");
    writeStream.end("Останній рядок\n"); // end() МОЖЕ прийняти ОСТАННІЙ шматок
                                            // даних, ЯК ЗРУЧНИЙ СКОРОЧЕНИЙ ЗАПИС
                                            // ("write() + завершити потік" за один виклик)

    writeStream.on("finish", () => {
      console.log("Запис завершено (подія 'finish')");
      resolve();
    });
  });
  console.log(await fsPromises.readFile(demoFilePath, "utf-8"));


  // ========================================================================
  // 2. BACKPRESSURE — ЩО ЦЕ І ЧОМУ write() ПОВЕРТАЄ boolean
  // ========================================================================

  // write() ПОВЕРТАЄ true/false — ЦЕ СИГНАЛ, ЧИ ВНУТРІШНІЙ БУФЕР
  // WRITABLE STREAM'А ВСЕ ЩЕ "ПІД" highWaterMark, ЧИ ВЖЕ ПЕРЕПОВНЕНИЙ:
  //
  //   true  — БУФЕР ВСЕ ЩЕ МАЄ МІСЦЕ, МОЖНА ПРОДОВЖУВАТИ ПИСАТИ
  //   false — БУФЕР ПЕРЕПОВНЕНИЙ (ДОСЯГ highWaterMark); ПРИЙМАЧ
  //           (диск, мережа) НЕ ВСТИГАЄ ОБРОБЛЯТИ ДАНІ НАСТІЛЬКИ
  //           ШВИДКО, НАСКІЛЬКИ ЇХ ПИШУТЬ
  //
  // ЦЕ Й Є BACKPRESSURE ("зворотний тиск") — МЕХАНІЗМ, ЩО ПОПЕРЕДЖАЄ:
  // "ЗУПИНИСЬ ПИСАТИ ДАЛІ, ІНАКШЕ ПАМ'ЯТЬ ЗРОСТАТИМЕ НЕОБМЕЖЕНО,
  // БО ДАНІ НАКОПИЧУЮТЬСЯ ШВИДШЕ, НІЖ ЇХ ПОСПІВАЄ ОБРОБИТИ ПРИЙМАЧ".

  const backpressureDemoPath = path.join(os.tmpdir(), "streams-backpressure-demo.txt");

  await new Promise((resolve) => {
    const writeStream = fs.createWriteStream(backpressureDemoPath, { highWaterMark: 16 }); // ШТУЧНО малий,
                                                                                              // щоб гарантовано
                                                                                              // побачити false
    const chunk = "0123456789".repeat(5); // 50 байтів — БІЛЬШЕ за highWaterMark

    const canContinue = writeStream.write(chunk);
    console.log("write() повернув:", canContinue); // false — буфер переповнено

    writeStream.end();
    writeStream.on("finish", resolve);
  });


  // ========================================================================
  // 3. ПОДІЯ "drain" — КОЛИ МОЖНА БЕЗПЕЧНО ПРОДОВЖИТИ ПИСАТИ
  // ========================================================================

  // ЯКЩО write() ПОВЕРНУВ false, ПРАВИЛЬНА ПОВЕДІНКА — ЗУПИНИТИ
  // ПОДАЛЬШИЙ ЗАПИС І ДОЧЕКАТИСЬ ПОДІЇ "drain" ("буфер злився/
  // спорожнів"), ЯКА СИГНАЛІЗУЄ, ЩО МОЖНА ПРОДОВЖУВАТИ:

  await new Promise((resolve) => {
    const bpFilePath = path.join(os.tmpdir(), "streams-backpressure-manual.txt");
    const writeStream = fs.createWriteStream(bpFilePath, { highWaterMark: 16 });

    let i = 0;
    const total = 20;

    function writeNext() {
      let canContinue = true;
      while (i < total && canContinue) {
        i++;
        canContinue = writeStream.write(`шматок-${i};`);
        if (!canContinue) {
          console.log(`Буфер переповнено на шматку ${i} — чекаємо 'drain'`);
        }
      }
      if (i < total) {
        writeStream.once("drain", writeNext); // ПРОДОВЖУЄМО ЛИШЕ ПІСЛЯ 'drain'
      } else {
        writeStream.end(() => {
          fs.rmSync(bpFilePath, { force: true });
          resolve();
        });
      }
    }
    writeNext();
  });

  // ❌ ЯКЩО ІГНОРУВАТИ backpressure (ПРОДОВЖУВАТИ write() НЕЗАЛЕЖНО
  // ВІД РЕЗУЛЬТАТУ) — ВНУТРІШНІЙ БУФЕР МОЖЕ РОСТИ НЕОБМЕЖЕНО, ЩО
  // ПРИЗВОДИТЬ ДО НЕКОНТРОЛЬОВАНОГО СПОЖИВАННЯ ПАМ'ЯТІ (ТОЙ САМИЙ
  // ПРИНЦИП "НЕ СТВОРЮЙ БІЛЬШЕ, НІЖ МОЖЕШ ОБРОБИТИ", ЩО Й У
  // performance/05-gc-patterns.js — ТАМ ПРО GC-тиск ВІД АЛОКАЦІЙ,
  // ТУТ — ПРО ТУ САМУ ІДЕЮ, АЛЕ ДЛЯ STREAM-БУФЕРІВ).


  // ========================================================================
  // 4. ПРАВИЛЬНЕ РІШЕННЯ: pipe() САМ ОБРОБЛЯЄ backpressure
  // ========================================================================

  // РУЧНЕ КЕРУВАННЯ backpressure (розділ 3) — ГРОМІЗДКЕ Й
  // СХИЛЬНЕ ДО ПОМИЛОК. САМЕ ЧЕРЕЗ ЦЕ ІСНУЄ readableStream.pipe()
  // (і pipeline()) — ВОНИ АВТОМАТИЧНО СТЕЖАТЬ ЗА write()/"drain" І
  // САМІ ПРИЗУПИНЯЮТЬ/ВІДНОВЛЮЮТЬ Readable, КОЛИ ТРЕБА (детально —
  // 04-piping-and-backpressure.js, наступний файл).


  // ========================================================================
  // 5. КОРИСНІ ОПЦІЇ/МЕТОДИ: cork()/uncork()
  // ========================================================================

  // cork() "ЗАТИКАЄ" stream — УСІ write() НАКОПИЧУЮТЬСЯ У ВНУТРІШНІЙ
  // ЧЕРЗІ, НЕ ВІДПРАВЛЯЮЧИСЬ ОДРАЗУ; uncork() "ВІДКРИВАЄ" ЙОГО —
  // УСІ НАКОПИЧЕНІ ДАНІ ВІДПРАВЛЯЮТЬСЯ ОДНИМ ПАКЕТОМ. КОРИСНО, КОЛИ
  // РОБИШ БАГАТО МАЛЕНЬКИХ write() ПОСПІЛЬ І ХОЧЕШ ЗМЕНШИТИ
  // КІЛЬКІСТЬ РЕАЛЬНИХ SYSCALL-ІВ ДО ДИСКУ/МЕРЕЖІ (той самий принцип
  // "об'єднай кілька операцій в одну", що й Buffer.concat() у
  // node/core-concepts/buffers/index.js, розділ 7):

  await new Promise((resolve) => {
    const corkPath = path.join(os.tmpdir(), "streams-cork-demo.txt");
    const writeStream = fs.createWriteStream(corkPath);

    writeStream.cork();
    for (let i = 0; i < 5; i++) {
      writeStream.write(`частина ${i}\n`); // НАКОПИЧУЮТЬСЯ, ще НЕ "ЗЛИТІ"
    }
    process.nextTick(() => writeStream.uncork()); // "ЗЛИВАЄМО" усе одним пакетом

    writeStream.end(() => {
      fs.rmSync(corkPath, { force: true });
      resolve();
    });
  });
  console.log("cork()/uncork() приклад завершено");


  // ========================================================================
  // ПРИБИРАННЯ
  // ========================================================================
  await fsPromises.rm(demoFilePath, { force: true });
  await fsPromises.rm(backpressureDemoPath, { force: true });
}

main().catch((err) => console.error("Помилка в демонстрації:", err));


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// - write(chunk) додає дані до Writable stream; end([chunk]) завершує
//   запис, опційно дописавши ОСТАННІЙ шматок; подія "finish" сигналізує,
//   що ВСІ дані РЕАЛЬНО записані
// - write() повертає boolean — true, якщо внутрішній буфер ще НЕ
//   переповнений (< highWaterMark), false — якщо ВЖЕ переповнений
// - BACKPRESSURE — механізм "зворотного тиску": коли write()
//   повертає false, правильна поведінка — ЗУПИНИТИ подальший запис
//   і дочекатись події "drain", перш ніж продовжувати
// - ІГНОРУВАННЯ backpressure призводить до неконтрольованого
//   зростання внутрішнього буфера в пам'яті
// - pipe()/pipeline() РОБЛЯТЬ ЦЕ АВТОМАТИЧНО — саме тому вони
//   рекомендований спосіб з'єднати Readable і Writable (детально —
//   04-piping-and-backpressure.js)
// - cork()/uncork() дозволяють НАКОПИЧИТИ кілька write() і
//   відправити їх ОДНИМ пакетом — зменшує кількість реальних
//   операцій вводу/виводу