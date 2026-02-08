// some метод перевіряє, чи є хоча б один елемент в масиві, який задовольняє умові
// повертає true або false

const array = [1, 2, 3, 4, 5];
console.log(array.some(item => item > 3));

//--------------------------------

const array1 = [1, 2, 3, 4, 5];
console.log(array1.some(item => item > 10));