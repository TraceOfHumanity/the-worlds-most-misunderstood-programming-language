function allAnagrams(arr) {
  const sorted = arr.map((str) => str.split("").sort().join(""));
  return sorted.every((str) => str === sorted[0]);
}

console.log(allAnagrams(["abcd", "bdac", "cabd"]));
console.log(allAnagrams(["abcd", "bdac", "cabd", "abc"]));