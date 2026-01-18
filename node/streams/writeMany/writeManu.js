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

// const fs = require('node:fs/promises');

// (async () => {
//     console.time('write');
//     const fileHandle = await fs.open('test.txt', 'w');
//     const stream = fileHandle.createWriteStream();
//     for (let i = 0; i < 1000000; i++) {
//         const buffer = Buffer.from(` ${i} `, 'utf-8');
//         stream.write(buffer);
//     }
//     fileHandle.close();
//     console.timeEnd('write');
// })();

// // виконано за 165.991ms. Монітор активності не відобразив використання памʼяті. Чиста записані у правильному порядку. Автор курсу не рекомендує використовувати цей метоб бо він використовує багато пасʼяті 

// ------------------------------------------------------------


const fs = require('node:fs/promises');

(async () => {
    console.time('write');
    const fileHandle = await fs.open('test.txt', 'w');
    const stream = fileHandle.createWriteStream();


    const buffer = Buffer.alloc(stream.writableHighWaterMark);

    // stream.on('drain', () => {
    //     console.log('drain');
    // })
    // stream.write(buffer);
    // for (let i = 0; i < 1000000; i++) {
    //     const buffer = Buffer.from(` ${i} `, 'utf-8');
    //     stream.write(buffer);
    // }

    let i = 0;

    const writeMany = () => {
        while (i < 1000000) {
            const buffer = Buffer.from(` ${i} `, 'utf-8');
            if (i === 999999) return stream.end(buffer);
            if (!stream.write(buffer)) break;
            i++;
        }
    }

    writeMany();

    stream.on('drain', () => {
        console.log('drain');
        writeMany();
    })

    stream.on('finish', () => {
        console.timeEnd('write');
        fileHandle.close();
    })
})();