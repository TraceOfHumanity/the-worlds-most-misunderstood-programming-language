const { parentPort } = require('worker_threads');

let count = 0;
while (count < 1e9) {
  count++;
}

parentPort.postMessage(count);
