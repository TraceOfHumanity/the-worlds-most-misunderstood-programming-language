const human = {
    name: "Alex",
    age: 26_169_017,
    isDev: true
};

//--------------------------------

for (const key in human) {
    console.log(key, human[key]);
}

//--------------------------------

Object.keys(human).forEach(
    (key) => {
        console.log(key, human[key]);
    }
)

//--------------------------------

console.log(Object.keys(human));
console.log(Object.values(human));
console.log(Object.entries(human));