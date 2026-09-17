// ==========================================================================
// UNDERSTANDING FILE SYSTEM — ДИРЕКТОРІЇ ТА МЕТАДАНІ (stat)
// ==========================================================================

const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const demoRoot = path.join(os.tmpdir(), "fs-directories-demo");

async function main() {
  // ========================================================================
  // 1. mkdir() — СТВОРЕННЯ ДИРЕКТОРІЇ
  // ========================================================================

  await fs.rm(demoRoot, { recursive: true, force: true }); // прибираємо "хвости" з попередніх запусків

  await fs.mkdir(demoRoot);
  console.log("Створено:", demoRoot);

  // ❌ БЕЗ { recursive: true } СТВОРИТИ ВКЛАДЕНУ ДИРЕКТОРІЮ, ЯКЩО
  // БАТЬКІВСЬКОЇ ЩЕ НЕМАЄ, — ПОМИЛКА:
  const nestedPath = path.join(demoRoot, "a", "b", "c");
  try {
    await fs.mkdir(nestedPath); // без recursive
  } catch (err) {
    console.log("Без recursive:", err.code); // "ENOENT" — немає проміжних "a" і "a/b"
  }

  // ✅ { recursive: true } СТВОРЮЄ ВСІ ПРОМІЖНІ ДИРЕКТОРІЇ АВТОМАТИЧНО
  // (аналог "mkdir -p" у Unix-shell, детально node/unix):
  await fs.mkdir(nestedPath, { recursive: true });
  console.log("Створено рекурсивно:", nestedPath);


  // ========================================================================
  // 2. readdir() — СПИСОК ВМІСТУ ДИРЕКТОРІЇ
  // ========================================================================

  await fs.writeFile(path.join(demoRoot, "file1.txt"), "вміст 1");
  await fs.writeFile(path.join(demoRoot, "file2.txt"), "вміст 2");

  const entries = await fs.readdir(demoRoot);
  console.log(entries); // ["a", "file1.txt", "file2.txt"] — ЛИШЕ ІМЕНА, БЕЗ
                          // ІНФОРМАЦІЇ, ЩО САМЕ Є файлом, а що директорією

  // { withFileTypes: true } ПОВЕРТАЄ Dirent-ОБ'ЄКТИ З МЕТОДАМИ
  // isFile()/isDirectory() — БЕЗ ПОТРЕБИ РОБИТИ ОКРЕМИЙ stat() НА
  // КОЖЕН ЕЛЕМЕНТ (детально сам stat() — розділ 4):
  const entriesWithTypes = await fs.readdir(demoRoot, { withFileTypes: true });
  for (const entry of entriesWithTypes) {
    console.log(entry.name, "→", entry.isDirectory() ? "директорія" : "файл");
  }
  // a → директорія
  // file1.txt → файл
  // file2.txt → файл

  // { recursive: true } (Node.js 20+) — РЕКУРСИВНИЙ ОБХІД УСІХ
  // ВКЛАДЕНИХ директорій ОДНИМ ВИКЛИКОМ, БЕЗ РУЧНОЇ РЕКУРСІЇ:
  const allEntriesRecursive = await fs.readdir(demoRoot, { recursive: true });
  console.log(allEntriesRecursive.sort());
  // ["a", "a/b", "a/b/c", "file1.txt", "file2.txt"] (шляхи відносні до demoRoot)


  // ========================================================================
  // 3. rm() / rmdir() — ВИДАЛЕННЯ ФАЙЛІВ І ДИРЕКТОРІЙ
  // ========================================================================

  // fs.rm() — УНІВЕРСАЛЬНИЙ метод (ES2021+), ПРАЦЮЄ І ДЛЯ ФАЙЛІВ, І
  // ДЛЯ ДИРЕКТОРІЙ (СТАРІШИЙ fs.rmdir() ІСНУЄ ОКРЕМО, АЛЕ fs.rm() —
  // РЕКОМЕНДОВАНИЙ ЄДИНИЙ ІНСТРУМЕНТ СЬОГОДНІ):

  await fs.rm(path.join(demoRoot, "file1.txt")); // видалити ОДИН файл

  // ❌ ЗВИЧАЙНА (НЕ recursive) ДИРЕКТОРІЯ З ВМІСТОМ — ПОМИЛКА:
  try {
    await fs.rm(path.join(demoRoot, "a"));
  } catch (err) {
    console.log("Без recursive:", err.code); // "ERR_FS_EISDIR" (варіюється залежно
                                                 // від версії Node.js/ОС) — директорія
                                                 // НЕ порожня чи ВЗАГАЛІ директорія
  }

  // ✅ { recursive: true } ВИДАЛЯЄ ДИРЕКТОРІЮ РАЗОМ ІЗ УСІМ ЇЇ ВМІСТОМ
  // (аналог "rm -rf"), { force: true } НЕ КИДАЄ помилку, ЯКЩО ШЛЯХУ
  // ВЖЕ НЕМАЄ (типово для "прибирання за собою", ЯК на початку ЦЬОГО файлу):
  await fs.rm(path.join(demoRoot, "a"), { recursive: true, force: true });
  console.log("Директорію 'a' видалено разом із вмістом");


  // ========================================================================
  // 4. stat() / lstat() — МЕТАДАНІ ФАЙЛУ АБО ДИРЕКТОРІЇ
  // ========================================================================

  const filePath = path.join(demoRoot, "file2.txt");
  const stats = await fs.stat(filePath);

  console.log("size:", stats.size);                 // розмір у БАЙТАХ
  console.log("isFile():", stats.isFile());           // true
  console.log("isDirectory():", stats.isDirectory()); // false
  console.log("mtime:", stats.mtime instanceof Date); // true — дата ОСТАННЬОЇ ЗМІНИ ВМІСТУ
  console.log("birthtime:", stats.birthtime instanceof Date); // true — дата СТВОРЕННЯ
                                                                  // (НЕ на всіх файлових
                                                                  // системах підтримується
                                                                  // однаково надійно)

  // lstat() — ТЕ САМЕ, ЩО stat(), АЛЕ ДЛЯ SYMBOLIC LINK (символьного
  // посилання) ПОВЕРТАЄ ІНФОРМАЦІЮ ПРО САМЕ ПОСИЛАННЯ, А НЕ ПРО
  // ФАЙЛ, НА ЯКИЙ ВОНО ВКАЗУЄ (stat() "ІДЕ ЗА" посиланням АВТОМАТИЧНО,
  // lstat() — НІ):

  const symlinkPath = path.join(demoRoot, "link-to-file2.txt");
  await fs.symlink(filePath, symlinkPath);

  const statFollowsLink = await fs.stat(symlinkPath);
  console.log("stat() на symlink → isFile():", statFollowsLink.isFile()); // true —
                                                                              // "пішов" за посиланням
                                                                              // і побачив ФАЙЛ

  const lstatOnLinkItself = await fs.lstat(symlinkPath);
  console.log("lstat() на symlink → isSymbolicLink():", lstatOnLinkItself.isSymbolicLink()); // true —
                                                                                                 // бачить САМЕ ПОСИЛАННЯ


  // ========================================================================
  // 5. access() — ПЕРЕВІРКА ІСНУВАННЯ/ПРАВ БЕЗ РЕАЛЬНОГО ВІДКРИТТЯ
  // ========================================================================

  // ⚠️ TOCTOU-ПАСТКА (Time-Of-Check to Time-Of-Use): МІЖ МОМЕНТОМ
  // ПЕРЕВІРКИ access() І МОМЕНТОМ РЕАЛЬНОГО readFile()/open() ІНШИЙ
  // ПРОЦЕС МОЖЕ ВИДАЛИТИ/ЗМІНИТИ файл — ПЕРЕВІРКА НЕ Є ГАРАНТІЄЮ
  // НА МОМЕНТ РЕАЛЬНОЇ ОПЕРАЦІЇ. НАДІЙНІШЕ — ПРОСТО СПРОБУВАТИ
  // ОПЕРАЦІЮ І ОБРОБИТИ ПОМИЛКУ (try/catch), А НЕ "СПОЧАТКУ
  // ПЕРЕВІРИТИ, ПОТІМ ЗРОБИТИ":

  try {
    await fs.access(filePath); // БЕЗ ДРУГОГО аргументу — просто "чи ІСНУЄ"
    console.log("Файл існує (access)");
  } catch {
    console.log("Файлу немає");
  }

  // ✅ РЕКОМЕНДОВАНИЙ ПІДХІД — "спробуй і обробити помилку" замість
  // "спочатку перевір":
  async function readIfExists(path) {
    try {
      return await fs.readFile(path, "utf-8");
    } catch (err) {
      if (err.code === "ENOENT") return null; // файлу немає — це ОЧІКУВАНИЙ, НЕ виключний випадок
      throw err; // будь-яка ІНША помилка (права доступу тощо) — прокидаємо далі
    }
  }
  console.log(await readIfExists(filePath));       // "вміст 2"
  console.log(await readIfExists(demoRoot + "-x")); // null — файлу немає, і ЦЕ нормально


  // ========================================================================
  // ПРИБИРАННЯ
  // ========================================================================
  await fs.rm(demoRoot, { recursive: true, force: true });
}

main().catch((err) => console.error("Помилка в демонстрації:", err));


// ==========================================================================
// ПІДСУМОК
// ==========================================================================
// - mkdir() БЕЗ { recursive: true } кидає ENOENT, якщо ХОЧА Б ОДНА
//   з проміжних директорій ще не існує; З recursive — створює УВЕСЬ
//   ланцюжок одразу (аналог "mkdir -p")
// - readdir() повертає ЛИШЕ ІМЕНА; { withFileTypes: true } дає
//   Dirent-об'єкти з isFile()/isDirectory() без окремого stat() на
//   кожен елемент; { recursive: true } (Node 20+) обходить ВКЛАДЕНІ
//   директорії одним викликом
// - fs.rm() — універсальний метод для файлів І директорій;
//   { recursive: true } потрібен для непорожніх директорій,
//   { force: true } не кидає помилку, якщо шляху й так уже немає
// - stat() дає метадані: size (байти), isFile()/isDirectory(),
//   mtime (остання зміна), birthtime (створення)
// - lstat() відрізняється від stat() ЛИШЕ для symbolic link: stat()
//   "іде за" посиланням і показує ЦІЛЬОВИЙ файл, lstat() показує
//   ІНФОРМАЦІЮ ПРО САМЕ ПОСИЛАННЯ
// - access() перевіряє існування/права, АЛЕ має TOCTOU-пастку
//   (стан може змінитись між перевіркою й реальною дією) —
//   надійніше просто спробувати операцію й обробити помилку
//   (ENOENT тощо) у try/catch, а не перевіряти заздалегідь