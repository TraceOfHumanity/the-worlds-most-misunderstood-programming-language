const crypto = require('crypto');

crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', (err, derivedKey) => {
  if (err) throw err;
  console.log(derivedKey.toString('hex'));
});