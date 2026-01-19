const net = require("net");
const fs = require("node:fs/promises");

const server = net.createServer(() => {});

let fileHandle, fileWriteStream;

server.on("connection", (socket) => {
  console.log("New connection!");

  socket.on("data", async (data) => {
    fileHandle = await fs.open(`storage/test.txt`, "w");
    fileWriteStream = fileHandle.createWriteStream();

    // Writing to our destination file
    fileWriteStream.write(data);
  });

  socket.on("end", () => {
    console.log("Connection ended!");
    fileHandle.close();
  });
});

server.listen(5050, "::1", () => {
  console.log("Uploader server opened on", server.address());
});
