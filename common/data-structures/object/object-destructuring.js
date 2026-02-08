const human = {
    name: "Alex",
    age: 26_169_017,
    isDev: true
};

const { name, age, isDev } = human;
console.log(name, age, isDev);

//--------------------------------
// З дефолтами:

const { role = "developer" } = human;
console.log(role);

//--------------------------------
// Spread / Rest:
const { x = "x value", ...rest } = human;
console.log(x, rest);