const countOccurrences = (arr) => {
  const counts = new Map();
  for (const item of arr) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  return counts;
};

const data = ["apple", "banana", "apple", "orange", "banana", "apple"];
console.log(countOccurrences(data));
// Map { 'apple' => 3, 'banana' => 2, 'orange' => 1 }