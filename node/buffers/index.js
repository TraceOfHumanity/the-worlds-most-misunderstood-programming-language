const { Buffer } = require('buffer');

const memoryContainer = Buffer.alloc(4); // allocate 4 bytes of memory
console.log(memoryContainer); // <Buffer 00 00 00 00>

memoryContainer[0] = 0xf4; // 244 in decimal 
console.log(memoryContainer); // <Buffer 14 00 00 00>

console.log(memoryContainer.toString("hex")); // f4000000
console.log(memoryContainer.readUInt32LE(0)); // 244

//---------------------------------------------------------

//0100 1000 0110 1001 0010 0001

const memoryContainer2 = Buffer.alloc(3);
memoryContainer2[0] = 0x48;
memoryContainer2[1] = 0x69;
memoryContainer2[2] = 0x21;

console.log(memoryContainer2.toString("utf-8")); // Hi!

//---------------------------------------------------------

const memoryContainer3 = Buffer.from([0x48, 0x69, 0x21]);
console.log(memoryContainer3.toString("utf-8")); // Hi!

//---------------------------------------------------------

const memoryContainer4 = Buffer.from("Hi!");
console.log(memoryContainer4.toString()); // Hi!

//---------------------------------------------------------

const memoryContainer5 = Buffer.from("486921", "hex");
console.log(memoryContainer5.toString("utf-8")); // Hi!

//---------------------------------------------------------

const memoryContainer6 = Buffer.from("Hi!", "utf-8");
console.log(memoryContainer6.toString("utf-8")); // Hi!

//---------------------------------------------------------

const memoryContainer7 = Buffer.alloc(100, 1);
// console.log(memoryContainer7);

//---------------------------------------------------------

const memoryContainer8 = Buffer.allocUnsafe(10000);

for (let i = 0; i < memoryContainer8.length; i++) {
    if (memoryContainer8[i] !== 0) {
        console.log(memoryContainer8[i].toString(2));
    }
}