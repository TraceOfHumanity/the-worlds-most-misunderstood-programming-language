// 1. using reverse method

// const arr = [1, 2, 3, 4, 5];
// const reversedArr = arr.reverse();
// console.log(reversedArr);

// 2. using for loop
// const arr = [1, 2, 3, 4, 5];
// const reversedArr = [];
// for (let i = arr.length - 1; i >= 0; i--) {
//   reversedArr.push(arr[i]);
// }
// console.log(reversedArr);

// 3. using while loop
// const arr = [1, 2, 3, 4, 5];
// const reversedArr = [];
// let i = arr.length - 1;
// while (i >= 0) {
//   reversedArr.push(arr[i]);
//   i--;
// }
// console.log(reversedArr);

// 4. using reduce
// const arr = [1, 2, 3, 4, 5];
// const reversedArr = arr.reduce((acc, curr) => {
//   return [curr, ...acc];
// }, []);
// console.log(reversedArr);

// 5. using map
// const arr = [1, 2, 3, 4, 5];
// console.log([...arr].map(arr.pop, arr));

// function reverseString(str) {
//   return str.split('').reverse().join('');
// }

// console.log(reverseString("hello"));

// function reverseString(str) {
//   const reverseStr = [];

//   for (let i = str.length - 1; i > 0; i--) {
//     reverseStr.push(str[i]);
//   }

//   return reverseStr
// }

// console.log(reverseString("hello"));

// function reverseString(str) {
//   const reverseStr = [];
//   let i = str.length - 1;
//   console.log(i);

//   while (i > 0) {
//     reverseStr.push(str[i]);
//     i--
//   }

//   return reverseStr
// }

// console.log(reverseString("hello"));

function reverseString(str) {
  const reverseStr = str.split("").reduce((accumulator, current) => {
    return [current, ...accumulator];
  }, []);

  return reverseStr;
}

console.log(reverseString("hello")); // Виведе: "olleh"
