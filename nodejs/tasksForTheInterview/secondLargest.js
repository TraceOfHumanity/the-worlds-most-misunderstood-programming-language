// 1. 
// function secondLargest(arr) {
//   arr.sort((a, b) => a - b);
//   return arr[arr.length - 2];
// }

// console.log(secondLargest([10, 5, 8, 20, 15])); // Виведе: 15

// // 2.
// function secondLargest(arr) {
//   let max = Math.max(...arr);
//   return arr.filter(num => num !== max).sort((a, b) => b - a)[0];
// }

// console.log(secondLargest([10, 5, 8, 20, 15])); // Виведе: 15