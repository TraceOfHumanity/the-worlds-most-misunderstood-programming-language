const fs = require('fs/promises');
const { buffer } = require('stream/consumers');

//---------------------------------------------------------

// const content = fs.readFileSync('./text.txt'); // виведе всі байти, які є в файлі у вигляді буфера
// const content = fs.readFileSync('./text.txt', 'utf-8'); // виведе текстовий вміст файлу

//---------------------------------------------------------

(async () => {
    const commandFileHandler = await fs.open('./command.txt', 'r');
    const watcher = fs.watch('./command.txt');

    for await (const event of watcher) {
        if (event.eventType === 'change') {
            console.log("This file has been changed");
            const size = (await commandFileHandler.stat()).size;
            const buffer = Buffer.alloc(size);
            const offset = 0;
            const length = buffer.byteLength;
            const position = 0;

            const content = await commandFileHandler.read(buffer, offset, length, position);
            console.log(content);
        }
    }
})();