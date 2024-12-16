const constants = require("./constants");
const {fork} = require("child_process");
const express = require("express");
const app = express();

app.get("/", (_, res) => {
  const childProcess = fork("child-process.js");

  const message = {
    multiplier: constants.MULTIPLIER,
    iterations: constants.ITERATIONS,
  };

  childProcess.send(message);
  const startTime = new Date();

  childProcess.on("message", (message) => {
    const endTime = new Date();
    res.status(200).send({
      ...message,
      time: endTime.getTime() - startTime.getTime() + "ms",
    });
    console.log("Child process killed");
    childProcess.kill();
  });
  console.log("i am unblocked now");
});

app.get("/testrequest", (req, res) => {
  res.send("I am unblocked now");
});

app.listen(constants.PORT, constants.HOST, () =>
  console.log(
    "listening on port " + constants.PORT + " and host " + constants.HOST
  )
);

// const express = require("express");
// const app = express();
// const { Worker } = require("worker_threads");
// const constants = require("../constants");

// app.get("/", (_, res) => {
//   const worker = new Worker("./worker.js");

//   const message = {
//     multiplier: constants.MULTIPLIER,
//     iterations: constants.ITERATIONS
//   };

//   const startTime = new Date();

//   worker.postMessage(message);

//   worker.once("message", result => {
//     const endTime = new Date();
//     res.status(200).send({
//       ...result,
//       time: endTime.getTime() - startTime.getTime() + "ms"
//     });
//   });
// });

// app.get("/testrequest", (req, res) => {
//   res.send("I am unblocked now");
// });

// app.listen(constants.PORT, constants.HOST, () =>
//   console.log(
//     "listening on port " + constants.PORT + " and host " + constants.HOST
//   )
// );
