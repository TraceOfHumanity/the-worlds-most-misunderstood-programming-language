/* Всі бітові оператори

w1 & w2    // AND:  1 якщо обидва 1
w1 | w2    // OR:   1 якщо хоч один 1
w1 ^ w2    // XOR:  1 якщо різні
~w1        // NOT:  інвертує всі біти
w1 << 2    // зсув вліво на 2  = множення на 4
w1 >> 2    // зсув вправо на 2 = ділення на 4
*/

function toBinary(n, bits = 8) {
  return (n >>> 0).toString(2).padStart(bits, "0");
}

function show(label, n, bits = 8) {
  console.log(`${label}  dec=${n}  bin=${toBinary(n, bits)}`);
}

const w1 = 25;
const w2 = 77;

show("w1", w1);
show("w2", w2);
show("w1 & w2", w1 & w2);
show("w1 | w2", w1 | w2);
show("w1 ^ w2", w1 ^ w2);
show("~w1", ~w1, 32);
show("w1 << 2", w1 << 2);
show("w1 >> 2", w1 >> 2);
show("w1 >>> 2", w1 >>> 2);

console.log("");
console.log("порівняння бітів:");
console.log(toBinary(w1, 8), "w1");
console.log(toBinary(w2, 8), "w2");
console.log(toBinary(w1 & w2, 8), "AND");

console.log(Number(25).toString(2).padStart(8, "0"));
console.log(25^77)