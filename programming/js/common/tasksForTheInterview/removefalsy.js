// 1. using filter method
// const arr = [1, 2, 3, 4, 5, 0, null, undefined, "", NaN];
// const filteredArr = arr.filter((item) => item);
// console.log(filteredArr);

// 2. using for loop
// const arr = [1, 2, 3, 4, 5, 0, null, undefined, "", NaN];
// const filteredArr = [];
// for (let i = 0; i < arr.length; i++) {
//   if (arr[i]) {
//     filteredArr.push(arr[i]);
//   }
// }
// console.log(filteredArr);

// 3.Boolean constructor
const arr = [1, 2, 3, 4, 5, 0, null, undefined, "", NaN];
const filteredArr = arr.filter(Boolean);
console.log(filteredArr);
