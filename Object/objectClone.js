//Shallow Copy
let original = {name: "Alex", details: {age: 30}};
let shallowCopy = {...original};

console.log(shallowCopy);

shallowCopy.details.age = 31;

console.log(original);
console.log(shallowCopy);

//Deep Copy
// let deepCopy = JSON.parse(JSON.stringify(original));

// console.log(deepCopy);

// deepCopy.details.age = 32;

// console.log(original);
// console.log(deepCopy);

function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  let copy = Array.isArray(obj) ? [] : {};
  
  for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
          copy[key] = deepClone(obj[key]);
      }
  }
  return copy;
}
let deepCopy = deepClone(original);

console.log(deepCopy);

deepCopy.details.age = 32;

console.log(original);
console.log(deepCopy);
