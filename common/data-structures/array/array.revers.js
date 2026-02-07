// reverse метод перевертає елементи масиву
// reverse змінює оригінальний масив

const array = [1, 2, 3, 4, 5];
console.log(array.reverse());

//--------------------------------

//для власної реалізації reverse можна використовувати цикл for
const array1 = [1, 2, 3, 4, 5];
const reversedArray = [];
for (let i = array1.length - 1; i >= 0; i--) {
  reversedArray.push(array1[i]);
}
console.log(reversedArray);

//--------------------------------

const array2 = [1, 2, 3, 4, 5];