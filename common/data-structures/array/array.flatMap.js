// flatMap метод об'єднує map і flat
// повертає новий масив
// не змінює оригінальний масив

const array = [1, 2, 3, 4, 5];
console.log(array.flatMap(item => [item, item * 2]));

//--------------------------------

console.log([1,2,3].flatMap(x => [x, x*2]));