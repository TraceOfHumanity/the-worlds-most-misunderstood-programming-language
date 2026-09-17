// ==========================================================================
// UNDERSTANDING FILE SYSTEM — СПОСТЕРЕЖЕННЯ ЗА ЗМІНАМИ (fs.watch / fs.watchFile)
// ==========================================================================

const fs = require("fs"); // fs.watch/watchFile — у КОРЕНЕВОМУ модулі fs (не /promises)
const fsPromises = require("fs/promises");
const os = require("os");
const path = require("path");
const demoFilePath = path.join(os.tmpdir(), "fs-watch-demo.txt");

async function main() {
  await fsPromises.writeFile(demoFilePath, "початковий вміст");

  // ========================================================================
  // 1. fs.watch() — ПІДПИСКА НА ПОДІЇ ФАЙЛОВОЇ СИСТЕМИ (НА РІВНІ ОС)
  // ========================================================================

  // fs.watch() ВИКОРИСТОВУЄ РІДНІ (native) МЕХАНІЗМИ ОПЕРАЦІЙНОЇ
  // СИСТЕМИ ДЛЯ СПОСТЕРЕЖЕННЯ ЗА ЗМІНАМИ (inotify на Linux, FSEvents
  // на macOS, ReadDirectoryChangesW на Windows) — ЦЕ РОБИТЬ ЙОГО
  // ШВИДКИМ (СПОВІЩЕННЯ МАЙЖЕ МИТТЄВЕ), АЛЕ Й "НЕСТАБІЛЬНИМ" МІЖ
  // РІЗНИМИ ОС (детально пастки — розділ 3):

  const watcher = fs.watch(demoFilePath, (eventType, filename) => {
    console.log(`fs.watch: подія "${eventType}" для файлу "${filename}"`);
  });

  // ДАЄМО ЧАС watcher'у "ЗАРЕЄСТРУВАТИСЬ" В ОС ПЕРЕД ЗМІНОЮ ФАЙЛУ
  // (у РЕАЛЬНОМУ коді ЦЕ НЕ ПОТРІБНО — тут ЛИШЕ ЩОБ ДЕМОНСТРАЦІЯ
  // ГАРАНТОВАНО СПРАЦЮВАЛА в один прогін скрипта):
  await new Promise((resolve) => setTimeout(resolve, 100));

  await fsPromises.writeFile(demoFilePath, "змінений вміст #1");
  await new Promise((resolve) => setTimeout(resolve, 200)); // чекаємо на подію

  watcher.close(); // ⚠️ ОБОВ'ЯЗКОВО закривати watcher, ІНАКШЕ ПРОЦЕС НЕ
                      // ЗАВЕРШИТЬСЯ САМ (watcher тримає event loop "живим" —
                      // детально, чому це важливо, у майбутньому файлі
                      // про event loop і process lifecycle)


  // ========================================================================
  // 2. fs.watchFile() — АЛЬТЕРНАТИВА ЧЕРЕЗ ОПИТУВАННЯ (POLLING)
  // ========================================================================

  // НА ВІДМІНУ ВІД fs.watch() (ПОДІЄВИЙ, залежить від ОС),
  // fs.watchFile() ПЕРІОДИЧНО (ЗА ЗАМОВЧУВАННЯМ — раз на 5 секунд,
  // НАЛАШТОВУЄТЬСЯ через { interval }) ПОРІВНЮЄ stat() ФАЙЛУ З
  // ПОПЕРЕДНІМ ЗНІМКОМ — ЦЕ ПОВІЛЬНІШЕ (затримка МІЖ РЕАЛЬНОЮ
  // ЗМІНОЮ І ВИЯВЛЕННЯМ), АЛЕ НАБАГАТО СТАБІЛЬНІШЕ МІЖ РІЗНИМИ ОС
  // І ФАЙЛОВИМИ СИСТЕМАМИ (особливо МЕРЕЖЕВИМИ дисками, ДЕ inotify-
  // подібні механізми ЧАСТО НЕ ПРАЦЮЮТЬ НАДІЙНО):

  const watchFileListener = (curr, prev) => {
    console.log(`fs.watchFile: mtime змінився з ${prev.mtimeMs} на ${curr.mtimeMs}`);
  };
  fs.watchFile(demoFilePath, { interval: 100 }, watchFileListener);

  await fsPromises.writeFile(demoFilePath, "змінений вміст #2");
  await new Promise((resolve) => setTimeout(resolve, 300)); // чекаємо НАСТУПНОГО опитування

  fs.unwatchFile(demoFilePath, watchFileListener); // ⚠️ ТЕЖ ОБОВ'ЯЗКОВО "відписатись"


  // ========================================================================
  // 3. ЧОМУ fs.watch() ОФІЦІЙНО ПОЗНАЧЕНИЙ ЯК "НЕ ПОВНІСТЮ УЗГОДЖЕНИЙ" МІЖ ОС
  // ========================================================================

  // ОФІЦІЙНА ДОКУМЕНТАЦІЯ Node.js ПРЯМО ПОПЕРЕДЖАЄ: ПОВЕДІНКА
  // fs.watch() "ВАРІЮЄТЬСЯ ЗНАЧНО МІЖ ПЛАТФОРМАМИ":
  //   - на macOS/Windows filename ЗАЗВИЧАЙ надійно передається;
  //   - на ДЕЯКИХ Linux-конфігураціях/мережевих файлових системах
  //     (NFS, деякі Docker-volume-монтування) filename МОЖЕ бути
  //     null, А ПОДІЇ МОЖУТЬ ВЗАГАЛІ НЕ СПРАЦЬОВУВАТИ НАДІЙНО;
  //   - ОДНА "ЛОГІЧНА" ЗМІНА ФАЙЛУ (наприклад, збереження у
  //     текстовому редакторі) МОЖЕ ЗГЕНЕРУВАТИ КІЛЬКА ПОДІЙ "change"
  //     ПОСПІЛЬ (редактори ЧАСТО пишуть у ТИМЧАСОВИЙ файл, а ПОТІМ
  //     ПЕРЕЙМЕНОВУЮТЬ ЙОГО — ЦЕ ВИГЛЯДАЄ ЯК "rename", а НЕ "change"!)
  //
  // САМЕ ЧЕРЕЗ ЦЕ В РЕАЛЬНИХ ПРОЄКТАХ (build-тули, dev-сервери з
  // hot-reload) ЗАЗВИЧАЙ ВИКОРИСТОВУЮТЬ СТОРОННІ БІБЛІОТЕКИ (chokidar —
  // НАЙПОШИРЕНІША), ЯКІ "ЗГЛАЖУЮТЬ" ЦІ РОЗБІЖНОСТІ Й ДОДАЮТЬ DEBOUNCING
  // (детально сама ІДЕЯ debounce — common/asynchronous.js, розділ
  // "DEBOUNCE ДЛЯ АСИНХРОННИХ ВИКЛИКІВ"), А НЕ fs.watch() НАПРЯМУ.


  // ========================================================================
  // 4. eventType: "change" VS "rename" — ЩО ЦЕ РЕАЛЬНО ОЗНАЧАЄ
  // ========================================================================

  //   "change" — ЗМІНИВСЯ ВМІСТ АБО МЕТАДАНІ ІСНУЮЧОГО файлу
  //   "rename" — ФАЙЛ СТВОРЕНО, ВИДАЛЕНО, АБО ПЕРЕЙМЕНОВАНО (Node.js
  //              НЕ РОЗРІЗНЯЄ ЦІ ТРИ ВИПАДКИ НА РІВНІ eventType —
  //              усі вони позначаються ОДНАКОВО як "rename")
  //
  // ЦЕ ОЗНАЧАЄ: ЯКЩО ФАЙЛ ВИДАЛИЛИ, watcher ПОКАЖЕ "rename", А НЕ
  // "delete" (ТАКОЇ ПОДІЇ ВЗАГАЛІ НЕМАЄ) — ЩОБ ЗРОЗУМІТИ, ЩО САМЕ
  // СТАЛОСЯ, ТРЕБА ДОДАТКОВО ПЕРЕВІРИТИ, ЧИ ФАЙЛ ЩЕ ІСНУЄ:

  const renameDemoPath = path.join(os.tmpdir(), "fs-watch-rename-demo.txt");
  await fsPromises.writeFile(renameDemoPath, "тимчасовий файл");

  const renameWatcher = fs.watch(renameDemoPath, async (eventType) => {
    if (eventType === "rename") {
      try {
        await fsPromises.access(renameDemoPath);
        console.log("rename-подія: файл усе ще ІСНУЄ (перейменування/пересворення)");
      } catch {
        console.log("rename-подія: файл БІЛЬШЕ НЕ існує (видалення)");
      }
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 100));
  await fsPromises.rm(renameDemoPath); // ВИДАЛЕННЯ теж дає eventType === "rename"!
  await new Promise((resolve) => setTimeout(resolve, 200));
  renameWatcher.close();


  // ========================================================================
  // 5. АСИНХРОННИЙ ІТЕРАТОР: for await...of ПО fs.promises.watch()
  // ========================================================================

  // fs/promises ТАКОЖ ДАЄ watch() ЯК АСИНХРОННИЙ ІТЕРАТОР (детально
  // сам механізм for await...of і Symbol.asyncIterator —
  // common/asynchronous.js, розділ 19) — ЗРУЧНІШЕ ДЛЯ async/await-коду,
  // НІЖ callback-СТИЛЬ ЗВИЧАЙНОГО fs.watch():

  await fsPromises.writeFile(demoFilePath, "для async-ітератора");

  async function watchWithAsyncIterator() {
    const ac = new AbortController(); // детально AbortController — common/asynchronous.js, розділ 20
    const watcher = fsPromises.watch(demoFilePath, { signal: ac.signal });

    setTimeout(async () => {
      await fsPromises.writeFile(demoFilePath, "тригер для ітератора");
    }, 100);
    setTimeout(() => ac.abort(), 400); // ЗУПИНЯЄМО спостереження через AbortController,
                                          // ІНАКШЕ for await...of ЧЕКАВ БИ НАЗАВЖДИ

    try {
      for await (const event of watcher) {
        console.log("async-ітератор побачив подію:", event.eventType);
      }
    } catch (err) {
      if (err.name !== "AbortError") throw err; // AbortError — ОЧІКУВАНИЙ РЕЗУЛЬТАТ abort()
    }
  }
  await watchWithAsyncIterator();


  // ========================================================================
  // ПРИБИРАННЯ
  // ========================================================================
  await fsPromises.rm(demoFilePath, { force: true });
}

main().catch((err) => console.error("Помилка в демонстрації:", err));


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// - fs.watch() — подієве спостереження ЧЕРЕЗ РІДНІ механізми ОС
//   (inotify/FSEvents/ReadDirectoryChangesW) — швидке, АЛЕ ПОВЕДІНКА
//   помітно ВІДРІЗНЯЄТЬСЯ між платформами й файловими системами
// - fs.watchFile() — POLLING (періодична перевірка stat()) —
//   повільніше (затримка = interval), АЛЕ значно СТАБІЛЬНІШЕ між ОС,
//   особливо для мережевих файлових систем
// - watcher ОБОВ'ЯЗКОВО треба ЗАКРИВАТИ (watcher.close() /
//   fs.unwatchFile()) — інакше він тримає event loop "живим", і
//   процес не завершиться сам
// - eventType має лише ДВА значення: "change" (змінився вміст/
//   метадані) і "rename" (СТВОРЕННЯ, ВИДАЛЕННЯ Й перейменування —
//   УСІ ТРИ під однією назвою!) — щоб розрізнити видалення від
//   перейменування, треба ДОДАТКОВО перевірити, чи файл ще існує
// - для РЕАЛЬНИХ проєктів (build-тули, hot-reload) типово
//   використовують СТОРОННЮ бібліотеку (chokidar), що згладжує
//   міжплатформні розбіжності й додає debouncing, а НЕ fs.watch()
//   напряму
// - fs/promises.watch() дає той самий механізм ЯК АСИНХРОННИЙ
//   ІТЕРАТОР (for await...of) — зупиняється через AbortController,
//   природніше поєднується з async/await-кодом