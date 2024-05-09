const set = new Set([1, 2, 3, 4, 5]);

console.log(set.has(1)); // true
console.log(set.has(6)); // false

set.add(6);

console.log(set.has(6)); // true

console.log(set.size); // 6

set.delete(6);

console.log(set.has(6)); // false

set.clear();

console.log(set.has(1)); // false
console.log(set.size); // 0

set.add("1");
set.add("2");

console.log(set.has("1")); // true
console.log(set.has(1)); // false

set.add({ name: "John" });

console.log(set.has({ name: "John" })); // false

const obj = { name: "John" };
set.add(obj);

console.log(set.has(obj)); // true
