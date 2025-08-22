function arraySubset(arr1, arr2) {
  const frequency = {};

  for (const item of arr1) {
    frequency[item] = (frequency[item] || 0) + 1;
  }

  for (const item of arr2) {
    if (!frequency[item]) return false;
    frequency[item]--;
  }

  return true;
}

console.log(arraySubset([1, 2, 3, 4], [2, 3, 4, 5]));
console.log(arraySubset([1, 2, 3, 4], [2, 4, 3]));
console.log(arraySubset([1, 2, 3, 4], [2, 3, 4, 5]));
console.log(arraySubset([1, 2], [1, 2, 3]));
console.log(arraySubset([1, 1, 1, 3], [1, 3, 3]));
