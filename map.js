const map = new Map();

map.set("name", "John");
map.set("age", 25);

console.log(map.get("name")); // John
console.log(map.get("age")); // 25

console.log(map.has("name")); // true
console.log(map.has("age")); // true
console.log(map.has("city")); // false

console.log(map.size); // 2

map.delete("name");

console.log(map.has("name")); // false

map.clear();

console.log(map.has("age")); // false
console.log(map.size); // 0

const user = {name: "John", id: 1};
const detailsUserInfo = {city: "New York", country: "USA"};

map.set(user, detailsUserInfo).set("age", 25);

const details = map.get(user);

console.log(user, details);

for (let item of map.keys()) {
  console.log(item);
}

for (let item of map.values()) {
  console.log(item);
}

for (let item of map.entries()) {
  console.log(item);
}

console.log(...map.values());
console.log(...map.keys());
console.log(...map.entries());
console.log(...map);
console.log([...map]);
console.log(Array.from(map));

console.log(
  map.forEach((value, key, map) => {
    console.log(key, value, map);
  })
);

map.clear();

console.log(map);

map
  .set("HTML", "HyperText Markup Language")
  .set("CSS", "Cascading Style Sheets")
  .set("JS", "JavaScript");
const [fist, second, third] = map;
console.log(fist, second, third);
