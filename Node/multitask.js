// process.env.UV_THREADPOOL_SIZE = 2;
const crypto = require('crypto');
const https = require('https');
const fs = require('fs');

const start = Date.now();

function doHash(index) {
  crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', (err, derivedKey) => {
    if (err) throw err;
    console.log(`Hash: ${index}`, Date.now() - start);
  });
}

function doRequest() {
  https.request('https://www.google.com', (res) => {
    res.on('data', () => { });
    res.on('end', () => {
      console.log(Date.now() - start);
    });
  }).end();
}
doRequest();

fs.readFile('multitask.js', 'utf8', (err, data) => {
  console.log('File read:', Date.now() - start);
});

doHash(1);
doHash(2);
doHash(3);
doHash(4);