const net = require("net");
const fs = require("node:fs/promises");

const server = net.createServer(() => {});

let fileHandle, fileWriteStream;

server.on("connection", (socket) => {
  console.log("New connection!");

  socket.on("data", async (data) => {
    if (!fileHandle) {
      socket.pause(); 
      fileHandle = await fs.open(`storage/test.txt`, "w");
      fileWriteStream = fileHandle.createWriteStream(); 

      fileWriteStream.write(data);

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
    fileHandle.close();
    fileHandle = undefined;
    fileWriteStream = undefined;
    console.log("Connection ended!");
  });
});

server.listen(5050, "::1", () => {
  console.log("Uploader server opened on", server.address());
});
