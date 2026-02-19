/* Symbol це тип даних який представляє унікальний і незмінний ключ.
Symbol може бути використаний для створення унікальних ключів для обʼєктів, масивів, функцій, класів, модулів, проксі, редюсерів, сетів, map, map.

Головна властивість: кожен Symbol() — гарантовано унікальний.

Чому це важливо?
- неможливо випадково перезаписати поле
- не конфліктує з іншими бібліотеками
- не з'являється у for...in
- не з'являється у Object.keys()
*/

const s1 = Symbol();
const s2 = Symbol();

console.log(s1 === s2); // false

// ------------------------------------------------------------

const symbol = Symbol("symbol");
console.log(symbol);

const symbol2 = Symbol("symbol");
console.log(symbol2);

console.log(symbol === symbol2);

const obj = {
    [symbol]: "symbol value",
};
console.log(obj);

// ------------------------------------------------------------

// Symbol.iterator
// Дозволяє зробити об'єкт ітерабельним.

const obj2 = {
  data: [1, 2, 3],
  [Symbol.iterator]() {
    return this.data[Symbol.iterator]();
  }
};

for (const item of obj2) {
  console.log(item);
}