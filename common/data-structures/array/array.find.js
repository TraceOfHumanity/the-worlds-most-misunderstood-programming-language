// find метод повертає перший елемент масиву, який задовольняє умові
// якщо елемент не знайдений, то повертає undefined

const array = [1, 2, 3, 4, 5];
console.log(array.find(item => item > 3));

//--------------------------------

//якщо елемент не знайдений, то повертає undefined
const array1 = [1, 2, 3, 4, 5];
console.log(array1.find(item => item > 6));