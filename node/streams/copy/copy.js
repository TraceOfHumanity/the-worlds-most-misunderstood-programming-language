const fs = require('node:fs/promises');

(async () => {
    console.time("copy");

    const source = await fs.open('src.txt', 'r');
    const destFile = await fs.open('dest.txt', 'w');

    let bytesRead = -1;

    while (bytesRead !== 0) {
        const readResult = await source.read()
        bytesRead = readResult.bytesRead

        console.log(bytesRead)
        if (bytesRead !== 16384) {
            const indexOfNotFilled = readResult.buffer.indexOf(0);
            const newBuffer = Buffer.alloc(indexOfNotFilled);
            readResult.buffer.copy(newBuffer, 0, 0, indexOfNotFilled);
            destFile.write(newBuffer);
        } else {
            destFile.write(readResult.buffer);
        };

    }

    console.timeEnd("copy");
})()