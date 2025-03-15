process.on("message", (msg) => {
  console.log("Message from parent process:", msg);
});

let counter = 0;
setInterval(() => {
  process.send({counter: counter++});
  if (counter >= 10) {
    process.exit(0);
  }
}, 1000);
