const net = require("net");
const fs = require("node:fs/promises");

const server = net.createServer(() => {});

server.on("connection", (socket) => {
  console.log("New connection!");
  let fileHandle, fileWriteStream;

  socket.on("data", async (data) => {
    if (!fileHandle) {
      socket.pause(); 

      const indexOfDivider = data.indexOf("-------");
      const fileName = data.subarray(10, indexOfDivider).toString("utf-8");

      fileHandle = await fs.open(`storage/${fileName}`, "w");
      fileWriteStream = fileHandle.createWriteStream(); 

      fileWriteStream.write(data.subarray(indexOfDivider + 7));

      socket.resume(); 
      fileWriteStream.on("drain", () => {
        socket.resume();
      });
    } else {
      if (!fileWriteStream.write(data)) {
        socket.pause();
      }
    }
  });

  socket.on("end", () => {
    if (fileHandle) fileHandle.close();
    fileHandle = undefined;
    fileWriteStream = undefined;
    console.log("Connection ended!");
  });
});

server.listen(5050, "::1", () => {
  console.log("Uploader server opened on", server.address());
});
