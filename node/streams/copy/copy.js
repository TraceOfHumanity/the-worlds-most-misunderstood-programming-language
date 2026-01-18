const fs = require('node:fs/promises');
const { pipeline } = require('node:stream');
// (async () => {
//     console.time("copy");

//     const sourcefile = await fs.open('src.txt', 'r');
//     const destFile = await fs.open('dest.txt', 'w');

//     let bytesRead = -1;

//     while (bytesRead !== 0) {
//         const readResult = await sourcefile.read()
//         bytesRead = readResult.bytesRead

//         console.log(bytesRead)
//         if (bytesRead !== 16384) {
//             const indexOfNotFilled = readResult.buffer.indexOf(0);
//             const newBuffer = Buffer.alloc(indexOfNotFilled);
//             readResult.buffer.copy(newBuffer, 0, 0, indexOfNotFilled);
//             destFile.write(newBuffer);
//         } else {
//             destFile.write(readResult.buffer);
//         };

//     }

//     console.timeEnd("copy");
// })()

// ------------------------------------------------------------


(async () => {
    console.time("copy");

    const sourcefile = await fs.open('src.txt', 'r');
    const destFile = await fs.open('dest.txt', 'w');

    const readStream = sourcefile.createReadStream();
    const writeStream = destFile.createWriteStream();

    // readStream.pipe(writeStream);
    // readStream.on("end", () => {
    //     console.timeEnd("copy");
    // })

    await pipeline(readStream, writeStream, (err) => {
        if (err) {
            console.log(err);
        }
        console.timeEnd("copy");
    });

})()