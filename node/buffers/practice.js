import { Buffer } from "buffer";

const buffer = Buffer.alloc(4); // 4 байти, 32 біти
buffer[0] = 0x48;


console.log(buffer);

//---

// 0100 1000 0110 1001 0010 0001
const hiBuffer = Buffer.alloc(3);
hiBuffer[0] = 0x48;
hiBuffer[1] = 0x69;
hiBuffer[2] = 0x21;

console.log(hiBuffer.toString("utf-8"));

//---
// Способи створення буферів

const buffer1 = Buffer.alloc(10);
const buffer2 = Buffer.allocUnsafe(10);
const buffer3 = Buffer.from([1, 2, 3]);
const buffer4 = Buffer.from([0x48, 0x69, 0x21]);
const buffer5 = Buffer.from("486921","hex");  
const buffer6 = Buffer.from("Hello");
const buffer7 = Buffer.from("Hello", "utf-8");

console.log(buffer1);
console.log(buffer2);
console.log(buffer3);
console.log(buffer4);
console.log(buffer5);
console.log(buffer6);
console.log(buffer7);