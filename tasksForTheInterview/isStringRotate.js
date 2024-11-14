function isStringRotate(s1, s2) {
  return (s1 + s1).includes(s2) && s1.length === s2.length;
}

console.log(isStringRotate("hello", "lohel"));
console.log(isStringRotate("hello", "loehl"));
console.log(isStringRotate("javascript", "ptscriptja"));
console.log(isStringRotate("javascript", "tavascripj"));
console.log(isStringRotate("java", "avaj"));
