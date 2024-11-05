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