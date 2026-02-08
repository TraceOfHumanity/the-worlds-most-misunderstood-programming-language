const obj = {
    name: "Alex",
    age: 26_169_017,
    isDev: true
};

//--------------------------------

for (const key in obj) {
    console.log(key, obj[key]);
}

//--------------------------------

Object.keys(obj).forEach(
    (key) => {
        console.log(key, obj[key]);
    }
)

//--------------------------------

console.log(Object.keys(obj));
console.log(Object.values(obj));
console.log(Object.entries(obj));