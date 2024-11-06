let original = {name: "Alex", details: {age: 30}};
let shallowCopy = { ...original };

console.log(shallowCopy);

shallowCopy.details.age = 31;

console.log(original);
console.log(shallowCopy);
