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

  const commands = {
    createFile: "create a file",
  };

  const createFile = async (path) => {
    try {
      const existingFile = await fs.open(path, "r");
      existingFile.close();
      return console.log(`File ${path} already exists`);
    } catch (error) {
      const newFile = await fs.open(path, "w");
      console.log(`File ${path} created`);
      newFile.close();
    }
  }

  commandFileHandler.on("change", async () => {
    const bufferSize = (await commandFileHandler.stat()).size;
    const buffer = Buffer.alloc(bufferSize);
    const offset = 0;
    const length = bufferSize;
    const position = 0;

    await commandFileHandler.read(buffer, offset, length, position);
    // console.log(buffer.toString());
    const command = buffer.toString("utf-8");

    if (command.includes(commands.createFile)) {
      const path = command.substring(commands.createFile.length + 1);
      createFile(path);
    }
  });

  const watcher = await fs.watch("./commands.txt");
  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
  await commandFileHandler.close();
})();
