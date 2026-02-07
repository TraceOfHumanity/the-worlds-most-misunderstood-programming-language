// масив це колекція елементів, які зберігаються в послідовності і можуть бути доступні за індексом.

// синтаксис для створення масиву
const array = [1,2,3] 
console.log(array);
// або
const array1 = new Array(1,2,3)
console.log(array1);
// або
const arrayWithTransform = Array.from([1,2,3], (item) => item * 2)
console.log(arrayWithTransform);
// або
const array2 = Array.of(1,2,3)
console.log(array2);
// або
const array3 = Array.from([1,2,3])
console.log(array3);
// або
const array4 = Array(10) // створює масив довжиною 10
console.log(array4);


