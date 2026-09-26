const removeDuplicates = (arr) => {
  const unique = new Map();
  for (const item of arr) {
    unique.set(item, true); 
  }
  return Array.from(unique.keys());
};

const data = [1, 2, 3, 1, 2, 4];
console.log(removeDuplicates(data));
