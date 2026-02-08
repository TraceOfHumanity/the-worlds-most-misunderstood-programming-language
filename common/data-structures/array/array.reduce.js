// reduce метод згортає масив в одне значення
// повертає одне значення
// не змінює оригінальний масив

const array = [1, 2, 3, 4, 5];
console.log(array.reduce((accumulator, current) => accumulator + current, 0));

// accumulator - це аккумулятор, який зберігає суму всіх елементів
// current - це поточний елемент
// 0 - це початкове значення аккумулятора

