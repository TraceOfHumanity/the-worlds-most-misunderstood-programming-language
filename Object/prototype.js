const person = {name: "Alex", age: 17};

console.log(person.toString()); // [object Object] because it inherits from Object.prototype
console.log(person.hasOwnProperty("name")); // true because it is a property of the person object
console.log(person.hasOwnProperty("toString")); // false because it is a method of the Object.prototype

for (let key in person) {
    console.log(key);
}

console.log(Object.getOwnPropertyNames(person));
console.log(Object.getOwnPropertyNames(person.__proto__));
console.log(person.__proto__.constructor.name);
console.log(person instanceof Object);
console.log(Object.getOwnPropertyNames(person.__proto__.constructor.prototype));
console.log(person.__proto__ === Object.prototype);

//--------------------------------

const isCheating = true;
console.log(isCheating.__proto__ === Boolean.prototype);
console.log(isCheating === Boolean.prototype.constructor("true"));

//--------------------------------

const message = "Hello";
console.log(message.__proto__ === String.prototype);
console.log(message === String.prototype.constructor("Hello"));

//--------------------------------

const number = 17;
console.log(number.__proto__ === Number.prototype);
console.log(number === Number.prototype.constructor(17));

//--------------------------------

const array = [1, 2, 3];
console.log(array.__proto__ === Array.prototype);
console.log(array === Array.prototype.constructor([1, 2, 3]));

//--------------------------------

const func = () => {};
console.log(func.__proto__ === Function.prototype);
console.log(func === Function.prototype.constructor(() => {}));

//--------------------------------

const date = new Date();
console.log(date.__proto__ === Date.prototype);
console.log(date === Date.prototype.constructor(new Date()));

//--------------------------------

const error = new Error();
console.log(error.__proto__ === Error.prototype);
console.log(error === Error.prototype.constructor(new Error()));

//--------------------------------

const regex = /abc/;
console.log(regex.__proto__ === RegExp.prototype);
console.log(regex === RegExp.prototype.constructor("/abc/"));

//--------------------------------

const symbol = Symbol("symbol");
console.log(symbol.__proto__ === Symbol.prototype);
console.log(symbol === Symbol.prototype.constructor("symbol"));

//--------------------------------

const obj = {};
console.log(obj.__proto__ === Object.prototype);
console.log(obj === Object.prototype.constructor());


