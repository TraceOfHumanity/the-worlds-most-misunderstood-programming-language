// ==========================================================================
// UNDERSTANDING STREAMS — DUPLEX ТА TRANSFORM STREAMS ДЕТАЛЬНО
// ==========================================================================

const { Duplex, Transform } = require("stream");
const { pipeline } = require("stream/promises");
const fs = require("fs");
const fsPromises = require("fs/promises");
const os = require("os");
const path = require("path");

async function main() {
  // ========================================================================
  // 1. DUPLEX — ОДНОЧАСНО Readable І Writable, АЛЕ НЕЗАЛЕЖНО
  // ========================================================================

  // Duplex МАЄ ОБИДВА ІНТЕРФЕЙСИ (read()/write()) ОДНОЧАСНО, АЛЕ
  // ЦЕ ДВА НЕЗАЛЕЖНІ "КАНАЛИ" ДАНИХ — ТЕ, ЩО ЗАПИСАНО НА ВХІД, НЕ
  // З'ЯВЛЯЄТЬСЯ АВТОМАТИЧНО НА ВИХОДІ (НА ВІДМІНУ ВІД Transform,
  // розділ 2). КЛАСИЧНИЙ ПРИКЛАД Duplex — TCP-сокет: МОЖНА
  // ОДНОЧАСНО ЧИТАТИ ВХІДНІ ДАНІ Й ПИСАТИ ВИХІДНІ, І ЦЕ ДВА РІЗНІ
  // ПОТОКИ БАЙТІВ, НЕ ПОВ'ЯЗАНІ МІЖ СОБОЮ.

  class EchoLaterDuplex extends Duplex {
    constructor(options) {
      super(options);
      this._buffer = []; // ЗБЕРІГАЄМО ТЕ, ЩО ЗАПИСАЛИ, ОКРЕМО від "виходу"
    }
    _write(chunk, encoding, callback) {
      this._buffer.push(chunk); // "ВХІДНИЙ" канал
      callback();
    }
    _read() {
      // "ВИХІДНИЙ" канал — ВІДДАЄМО НАКОПИЧЕНЕ ЛИШЕ КОЛИ САМІ ВИРІШИЛИ:
      if (this._buffer.length > 0) {
        this.push(this._buffer.shift());
      } else {
        this.push(null); // null сигналізує "даних БІЛЬШЕ НЕ буде" (кінець Readable-частини)
      }
    }
  }

  const duplexDemo = new EchoLaterDuplex();
  duplexDemo.write("перший запис");
  duplexDemo.write("другий запис");
  duplexDemo.end();

  const duplexResults = [];
  for await (const chunk of duplexDemo) {
    duplexResults.push(chunk.toString());
  }
  console.log("Duplex зібрав:", duplexResults); // ["перший запис", "другий запис"] —
                                                    // ЗАПИСАНЕ й ПРОЧИТАНЕ — ДВА РІЗНІ "боки"


  // ========================================================================
  // 2. TRANSFORM — ОСОБЛИВИЙ Duplex, ДЕ ВХІД АВТОМАТИЧНО СТАЄ ВИХОДОМ
  // ========================================================================

  // Transform — ЦЕ Duplex, АЛЕ З ОДНІЄЮ КЛЮЧОВОЮ ВІДМІННІСТЮ: ТЕ,
  // ЩО ЗАПИСАНО НА ВХІД (_write), ПІСЛЯ ОБРОБКИ АВТОМАТИЧНО
  // З'ЯВЛЯЄТЬСЯ НА ВИХОДІ (ЧЕРЕЗ push() ВСЕРЕДИНІ _transform) —
  // САМЕ ТАК ПРАЦЮЮТЬ zlib.createGzip(), crypto.createCipheriv()
  // (ДЕТАЛЬНО РЕАЛЬНИЙ ПРИКЛАД ШИФРУВАННЯ — node/streams/encrypt-decrypt/,
  // ІСНУЮЧИЙ У ЦЬОМУ РЕПОЗИТОРІЇ) — ДАНІ "ПРОХОДЯТЬ НАСКРІЗЬ",
  // ЗМІНЮЮЧИСЬ ПО ДОРОЗІ.

  class UppercaseTransform extends Transform {
    _transform(chunk, encoding, callback) {
      const uppercased = chunk.toString().toUpperCase();
      this.push(uppercased); // ТЕ, ЩО push() ТУТ — З'ЯВИТЬСЯ НА ВИХОДІ TRANSFORM'А
      callback(); // ОБОВ'ЯЗКОВО викликати — СИГНАЛ "ГОТОВИЙ ДО НАСТУПНОГО chunk'а"
    }
  }

  const upperTransform = new UppercaseTransform();
  upperTransform.write("привіт, ");
  upperTransform.write("це transform stream");
  upperTransform.end();

  let upperResult = "";
  for await (const chunk of upperTransform) {
    upperResult += chunk;
  }
  console.log("Transform результат:", upperResult); // "ПРИВІТ, ЦЕ TRANSFORM STREAM"


  // ========================================================================
  // 3. TRANSFORM У ЛАНЦЮЖКУ pipeline() — РЕАЛЬНЕ ЗАСТОСУВАННЯ
  // ========================================================================

  // Transform-класи ІДЕАЛЬНО "ВБУДОВУЮТЬСЯ" В pipeline() (детально
  // 04-piping-and-backpressure.js) МІЖ Readable І Writable — ЦЕ
  // ГОЛОВНА ПРИЧИНА, ЧОМУ Transform ІСНУЄ ЯК ОКРЕМИЙ ТИП: ЙОГО
  // ЗРУЧНО "ВСТАВЛЯТИ" В СЕРЕДИНУ ЛАНЦЮЖКА STREAMS:

  const srcPath = path.join(os.tmpdir(), "streams-transform-src.txt");
  const destPath = path.join(os.tmpdir(), "streams-transform-dest.txt");
  await fsPromises.writeFile(srcPath, "рядок один\nрядок два\nрядок три\n");

  class ReverseLineTransform extends Transform {
    constructor(options) {
      super(options);
      this._leftover = ""; // ТА САМА ПРОБЛЕМА "РОЗРІЗАНИХ" chunk'ів,
                              // ЩО Й У 02-readable-streams.js, розділ 3
    }
    _transform(chunk, encoding, callback) {
      const combined = this._leftover + chunk.toString();
      const lines = combined.split("\n");
      this._leftover = lines.pop(); // ОСТАННЯ, МОЖЛИВО НЕПОВНА частина — "на потім"
      for (const line of lines) {
        this.push([...line].reverse().join("") + "\n"); // РОЗВОРОТ рядка (детально
                                                            // сам прийом — common/data-structures/String/String.js)
      }
      callback();
    }
    _flush(callback) {
      // _flush ВИКЛИКАЄТЬСЯ ОДИН РАЗ, КОЛИ ВХІДНІ ДАНІ ЗАКІНЧИЛИСЬ —
      // ТУТ ТРЕБА "ДОПРАЦЮВАТИ" БУДЬ-ЩО, ЩО ЗАЛИШИЛОСЬ У this._leftover:
      if (this._leftover) {
        this.push([...this._leftover].reverse().join(""));
      }
      callback();
    }
  }

  await pipeline(
    fs.createReadStream(srcPath, { encoding: "utf-8" }),
    new ReverseLineTransform(),
    fs.createWriteStream(destPath),
  );

  console.log(await fsPromises.readFile(destPath, "utf-8"));
  // нидо кодяр
  // авд кодяр
  // ирт кодяр


  // ========================================================================
  // 4. ЧОМУ callback() У _transform ОБОВ'ЯЗКОВИЙ
  // ========================================================================

  // Transform ЧИТАЄ НАСТУПНИЙ chunk ЛИШЕ ПІСЛЯ ТОГО, ЯК ПОПЕРЕДНІЙ
  // _transform ВИКЛИКАВ callback() — ЦЕ, ПО СУТІ, ВБУДОВАНИЙ
  // BACKPRESSURE-МЕХАНІЗМ (детально загальна ІДЕЯ backpressure —
  // 03-writable-streams.js, розділ 2): ЯКЩО ЗАБУТИ ВИКЛИКАТИ
  // callback() — TRANSFORM ПРОСТО "ЗАВИСНЕ" НАЗАВЖДИ, ОЧІКУЮЧИ
  // СИГНАЛУ "ГОТОВИЙ ДО НАСТУПНОГО chunk'а", ЯКИЙ НІКОЛИ НЕ ПРИЙДЕ.


  // ========================================================================
  // ПРИБИРАННЯ
  // ========================================================================
  await fsPromises.rm(srcPath, { force: true });
  await fsPromises.rm(destPath, { force: true });
}

main().catch((err) => console.error("Помилка в демонстрації:", err));


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// - Duplex — ОДНОЧАСНО Readable і Writable, АЛЕ ЯК ДВА НЕЗАЛЕЖНІ
//   "канали" (наприклад, TCP-сокет) — те, що записано, НЕ з'являється
//   автоматично на виході
// - Transform — ОСОБЛИВИЙ вид Duplex, ДЕ ВХІД АВТОМАТИЧНО ПЕРЕТВОРЮЄТЬСЯ
//   НА ВИХІД через push() всередині _transform(chunk, encoding, callback) —
//   так побудовані zlib.createGzip(), crypto cipher-streams
//   (детально реальний приклад — node/streams/encrypt-decrypt/)
// - _flush(callback) викликається ОДИН РАЗ наприкінці — місце
//   "допрацювати" будь-які залишкові, недооброблені дані (та сама
//   проблема "розрізаних" chunks, що й у Readable, детально
//   02-readable-streams.js, розділ 3)
// - callback() усередині _transform ОБОВ'ЯЗКОВИЙ — це вбудований
//   backpressure-механізм: наступний chunk НЕ прийде, поки
//   попередній НЕ підтверджений через callback()
// - Transform-класи природно "вбудовуються" В СЕРЕДИНУ pipeline()
//   між Readable і Writable — саме тому це окремий, найпоширеніший
//   на практиці тип stream