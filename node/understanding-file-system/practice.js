// // promise api
// const fs = require("fs/promises");

// (async () => {
//   try {
//     await fs.copyFile("file.txt", "file-copy.txt");
//   } catch (error) {
//     console.log(error);
//   }
// })();
// ---
// // callback api
// const fs = require("fs");

// fs.copyFile("file.txt", "file-copy.txt", (err) => {
//   if (err) {
//     console.log(err);
//   }
// });
// ---
// // synchronous api
// const fs = require("fs");

// fs.copyFileSync("file.txt", "file-copy.txt");
// ---

const fs = require("fs/promises");

(async () => {
  const wather = await fs.watch("./");
  for await (const event of wather) {
      if (event.eventType === "change" && event.filename === "commands.txt") {
        console.log(event);

    }
  }
})();
