/* Всі бітові оператори

w1 & w2    // AND:  1 якщо обидва 1
w1 | w2    // OR:   1 якщо хоч один 1
w1 ^ w2    // XOR:  1 якщо різні
~w1        // NOT:  інвертує всі біти
w1 << 2    // зсув вліво на 2  = множення на 4
w1 >> 2    // зсув вправо на 2 = ділення на 4
*/

let w1 = 25;
let w2 = 77;
let w3 = 0;

w3 = w1 & w2;
console.log(w1.toString(2).padStart(8, "0"));
console.log(w2.toString(2).padStart(8, "0"));
console.log((w1 & w2).toString(2).padStart(8, "0"));
console.log(w3);


