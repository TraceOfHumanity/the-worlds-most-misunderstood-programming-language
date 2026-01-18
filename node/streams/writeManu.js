// const fs = require('node:fs/promises');

// (async () => {
//     console.time('write');
//     const fileHandle = await fs.open('test.txt', 'w');
//     for (let i = 0; i < 1000000; i++) {
//         fileHandle.write(` ${i} `);
//     }
//     fileHandle.close();
//     console.timeEnd('write');
// })();

// // виконано за 3.707s, використання памʼяті 2.4GB

// ------------------------------------------------------------

// const fs = require('node:fs');

// (async () => {
//     console.time('write');
//     fs.open('test.txt', 'w', (err, fileDescriptor) => {
//         for (let i = 0; i < 1000000; i++) {
//             fs.writeSync(fileDescriptor, ` ${i} `);
//         }
        
//         console.timeEnd('write');
//     });
// })();
// // виконано за 1.683s, використання памʼяті 21MB. Порушуєтьс порядок запису чисел в файл

// ------------------------------------------------------------

// const fs = require('node:fs');

// (async () => {
//     console.time('write');
//     fs.open('test.txt', 'w', (err, fileDescriptor) => {
//         for (let i = 0; i < 1000000; i++) {
//             const buffer = Buffer.from(` ${i} `, 'utf-8');
//             fs.writeSync(fileDescriptor, buffer);
//         }
        
//         console.timeEnd('write');
//     });
// })();

// // виконано за 1.777s. дуде швидко, монітор активності не відобразив використання памʼяті. Чиста записані у правильному порядку

// ------------------------------------------------------------

