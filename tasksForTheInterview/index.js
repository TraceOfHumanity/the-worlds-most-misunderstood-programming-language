// sum of all numbers in an array

// const arr = [1, 3, 2, 4, 8, 6, 7, 5, 9, 10];
const arr = [12, 2];
// // 1. using for loop
// let sum = 0;

// for (let i = 0; i < arr.length; i++) {
//   sum += arr[i];
// }

// console.log(sum);

// // 2. using reduce
// const sum = arr.reduce((acc, curr) => acc + curr, 0);

// console.log(sum);

// // 3. using forEach
// let sum = 0;
// arr.forEach((num) => {
//   sum += num;
// });

// console.log(sum);

// // 4. using while loop
// let sum = 0;
// let i = 0;
// while (i < arr.length) {
//   sum += arr[i];
//   i++;
// }

// console.log(sum);

// // 5. using recursion
// const sum = (arr) => {
//   if (arr.length === 0) return 0;
//   return arr[0] + sum(arr.slice(1));
// };

// console.log(sum(arr));

//min and max number in an array

// // 1. using for loop
// let min = arr[0];
// let max = arr[0];

// for (let i = 0; i < arr.length; i++) {
//   if (arr[i] < min) min = arr[i];
//   if (arr[i] > max) max = arr[i];
// }

// console.log(min, max);

// // 2. using Math.min and Math.max
// const min = Math.min(...arr);
// const max = Math.max(...arr);

// console.log(min, max);

// // 3. using sort
// const sortedArr = arr.sort((a, b) => a - b);
// const min = sortedArr[0];
// const max = sortedArr[sortedArr.length - 1];

// console.log(min, max);

// sort an array
const sortedArr = arr.sort((a, b) => b - a);
// console.log(sortedArr);

// const sortedArr = arr.sort((a, b) => {
//   if (a < b) return -1;
//   if (a > b) return 1;
//   return 0;
// });
console.log(sortedArr);
