// function uniqueArray(arr) {
//   return Array.from(new Set(arr));
// }

// console.log(uniqueArray([1, 2, 2, 3, 4, 4, 5])); // Виведе: [1, 2, 3, 4, 5]

function uniqueArray(arr) {
  const uniqArr = [];

  for (let i = 0; i < arr.length; i++) {
    if (arr.lastIndexOf(arr[i]) === i) {
      uniqArr.push(arr[i]);
    }
  }

  return uniqArr;
}

console.log(uniqueArray([1, 2, 2, 3, 4, 4, 5])); // Виведе: [1, 2, 3, 4, 5]
