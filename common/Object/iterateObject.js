const obj = {
  name: "John",
  age: 30,
  city: "New York",
};

console.log(obj);

for (const key in obj) {
  if (obj.hasOwnProperty(key)) {
    console.log(key, obj[key]);
  }
}

Object.keys(obj).forEach((key) => {
  console.log(key, obj[key]);
});

Object.entries(obj).forEach(([key, value]) => {
  console.log(key, value);
});

Object.values(obj).forEach((value) => {
  console.log(value);
});

Object.getOwnPropertyNames(obj).forEach((key) => {
  console.log(key, obj[key]);
});

Reflect.ownKeys(obj).forEach((key) => {
  console.log(key, obj[key]);
});
