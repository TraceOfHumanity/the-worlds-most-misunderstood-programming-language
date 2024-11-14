
const highestFrequency = (arr) => {
  const frequency = {};
  let maxFrequency = 0;
  let maxFrequencyElement;

  for (const element of arr) {
    frequency[element] = (frequency[element] || 0) + 1;
  }

  for (const element in frequency) {
    if (frequency[element] > maxFrequency) {
      maxFrequency = frequency[element];
      maxFrequencyElement = element;
    }
  }
  return maxFrequencyElement;
  
};

console.log(highestFrequency(["a", "b", "c", "a", "b", "d", "c"]));
console.log(highestFrequency(["abc", "def", "abc", "def", "abc"]));
console.log(highestFrequency(["abc", "def"]));
console.log(
  highestFrequency([
    "abc",
    "abc",
    "def",
    "def",
    "def",
    "ghi",
    "ghi",
    "ghi",
    "ghi",
  ])
);
