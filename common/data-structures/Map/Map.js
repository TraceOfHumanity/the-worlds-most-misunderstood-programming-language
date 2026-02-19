/*
Map це колекція ключів і значень
ключі: будь-який тип
значення: будь-який тип
*/

const map = new Map();

map.set("name", "John");
map.set("age", 25);
map.set("isDev", true);

console.log(map);

// додавання елементів
map.set("name", "John");

// отримання елементів
console.log(map.get("name"));
console.log(map.get("age"));
console.log(map.get("isDev"));

// перевірка наявності елемента
console.log(map.has("name"));
console.log(map.has("age"));
console.log(map.has("isDev"));

// видалення елемента
map.delete("age");
console.log(map);

// // очищення колекції
// map.clear();
// console.log(map);

// отримання кількості елементів
console.log(map.size);


// перебір колекції
for (let [key, value] of map) {
    console.log(key, value);
}

// перебір ключів
for (let key of map.keys()) {
    console.log(key);
}

// перебір значень
for (let value of map.values()) {
    console.log(value);
}

// перебір ключів і значень
for (let [key, value] of map.entries()) {
    console.log(key, value);
}