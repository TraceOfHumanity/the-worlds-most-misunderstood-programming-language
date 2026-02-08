// every метод перевіряє, чи всі елементи в масиві задовольняють умові
// повертає true або false

const array = [1, 2, 3, 4, 5];
console.log(array.every(item => item > 0));

//--------------------------------

const array1 = [1, 2, 3, 4, 5];
console.log(array1.every(item => item > 10));