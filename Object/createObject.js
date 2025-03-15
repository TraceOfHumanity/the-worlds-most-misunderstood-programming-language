// const person = {
//   name: "Alice",
//   age: 25,
// };

// console.log(person);
//------------------------------------------------------------------------------------------

// const person = new Object();
// person.name = "Alice";
// person.age = 25;

// console.log(person);
//------------------------------------------------------------------------------------------

// function Person(name, age) {
//   this.name = name;
//   this.age = age;
// }

// const person1 = new Person("Alice", 25);
// const person2 = new Person("Bob", 30);

// console.log(person1);
// console.log(person2);
//------------------------------------------------------------------------------------------

// const personPrototype = {
//   greet() {
//     console.log(`Hello, my name is ${this.name}`);
//   }
// };

// const person = Object.create(personPrototype);
// person.name = "Alice";
// person.age = 25;
// person.greet();
//------------------------------------------------------------------------------------------

// class Person {
//   constructor(name, age) {
//     this.name = name;
//     this.age = age;
//   }

//   greet() {
//     console.log(`Hello, my name is ${this.name}`);
//   }
// }

// const person1 = new Person("Alice", 25);
// person1.greet();
//------------------------------------------------------------------------------------------

// const defaults = { name: "Anonymous", age: 0 };
// const person = Object.assign({}, defaults, { isAdmin: false, age: 25 });
// console.log(person);
//------------------------------------------------------------------------------------------

// function createPerson(name, age) {
//   return {
//     name,
//     age,
//     greet() {
//       console.log(`Hello, my name is ${this.name}`);
//     }
//   };
// }

// const person = createPerson("Alice", 25);
// person.greet();
//------------------------------------------------------------------------------------------  

// const jsonString = '{"name": "Alice", "age": 25}';
// const person = JSON.parse(jsonString);
// console.log(person);
//------------------------------------------------------------------------------------------

const entries = [["name", "Alice"], ["age", 25]];
const person = Object.fromEntries(entries);
console.log(person);