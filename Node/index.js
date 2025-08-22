
const express = require('express');
const app = express();
const crypto = require('crypto');
const { Worker } = require('worker_threads');

app.get('/', (req, res) => {
  let responseSent = false;
  const start = Date.now();
  console.log(`Worker started: ${Date.now() - start}ms`);

  const worker = new Worker('./worker.js');

  worker.on('error', function (error) {
    if (!responseSent) {
      responseSent = true;
      res.send(`Error: ${error}`);
    }
  });

  worker.on('exit', function (code) {
    if (!responseSent) {
      responseSent = true;
      res.send(`Exit: ${code}`);
    }
  });

  worker.on('message', function (message) {
    if (!responseSent) {
      responseSent = true;
      res.send(`Result: ${message}`);
      worker.terminate();
    }
  });
  console.log(`Worker finished: ${Date.now() - start}ms`);
});

app.get('/fast', (req, res) => {
  res.send('This was fast!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});