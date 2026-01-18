const fs = require('fs/promises');
const { buffer } = require('stream/consumers');

//---------------------------------------------------------

// const content = fs.readFileSync('./text.txt'); // виведе всі байти, які є в файлі у вигляді буфера
// const content = fs.readFileSync('./text.txt', 'utf-8'); // виведе текстовий вміст файлу

//---------------------------------------------------------

(async () => {
    const CREATE_FILE = "create a file";
    const DELETE_FILE = "delete the file";
    const RENAME_FILE = "rename the file";
    const ADD_TO_FILE = "add to the file";

    const createFile = async (path) => {
        try {
            const existingFileHandle = await fs.open(path, 'r');
            existingFileHandle.close();
            return console.log(`this file ${path} already exists`);
        } catch (error) {
            const newFileHandle = await fs.open(path, 'w');
            console.log("A new file has been created");
            newFileHandle.close();
        }
    }

    const deleteFile = async (path) => {
        try {
            await fs.unlink(path);
            console.log(`file ${path} has been deleted`);
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log(`file ${path} does not exist`);
            } else {
                console.log(`error deleting file ${path}: ${error}`);
            }
        }
    }

    const renameFile = async (oldPath, newPath) => {
        try {
            await fs.rename(oldPath, newPath);
            console.log(`file ${oldPath} has been renamed to ${newPath}`);
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log(`file ${oldPath} does not exist`);
            } else {
                console.log(`error renaming file ${oldPath} to ${newPath}: ${error}`);
            }
        }
    }

    let addedContent;

    const addToFile = async (path, content) => {
        if (addedContent === content) return;
        try {
            const fileHandle = await fs.open(path, "a");
            fileHandle.write(content);
            addedContent = content;
            console.log("The content was added successfully.");
        } catch (e) {
            console.log("An error occurred while removing the file: ");
            console.log(e);
        }
    };



    const commandFileHandler = await fs.open('./command.txt', 'r');

    commandFileHandler.on("change", async () => {
        const size = (await commandFileHandler.stat()).size;
        const buffer = Buffer.alloc(size);
        const offset = 0;
        const length = buffer.byteLength;
        const position = 0;

        await commandFileHandler.read(buffer, offset, length, position);
        const command = buffer.toString("utf-8").trim();

        if (command.includes(CREATE_FILE)) {
            const path = command.substring(CREATE_FILE.length + 1);
            await createFile(path);
        }
        if (command.includes(DELETE_FILE)) {
            const path = command.substring(DELETE_FILE.length + 1);
            await deleteFile(path);
        }
        if (command.includes(RENAME_FILE)) {
            const _index = command.indexOf(" to ");
            const oldPath = command.substring(RENAME_FILE.length + 1, _index);
            const newPath = command.substring(_index + 4);

            await renameFile(oldPath, newPath);
        }
        if (command.includes(ADD_TO_FILE)) {
            const _index = command.indexOf(" this content: ");
            const filePath = command.substring(ADD_TO_FILE.length + 1, _index);
            const content = command.substring(_index + 15);

            await addToFile(filePath, content);
        }
    })

    const watcher = fs.watch('./command.txt');
    for await (const event of watcher) {
        if (event.eventType === 'change') {
            commandFileHandler.emit("change");

        }
    }
})();