//The null value represents the intentional absence of any object value.

function getVowels(str) {
  const m = str.match(/sky/gi);
  if (m === null) {
    return 0;
  }
  return m.length;
}

console.log(getVowels('sky')); // 1
console.log(getVowels('sky sky sky')); // 3
console.log(getVowels('qwerty')); // 0