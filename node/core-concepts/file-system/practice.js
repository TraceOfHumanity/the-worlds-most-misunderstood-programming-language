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
const { Buffer } = require("buffer");

(async () => {
  const commandFileHandler = await fs.open("./commands.txt", "r");

  commandFileHandler.on("change", async () => {
    // console.log(event);
    const bufferSize = (await commandFileHandler.stat()).size;
    const buffer = Buffer.alloc(bufferSize);
    const offset = 0;
    const length = bufferSize;
    const position = 0;

    await commandFileHandler.read(buffer, offset, length, position);
    console.log(buffer.toString());
  });

  const watcher = await fs.watch("./commands.txt");
  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
  await commandFileHandler.close();
})();
