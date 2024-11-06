// "use strict";

// console.log("this", this);

// function doLogThis(){
//   console.log("this", this);
// }

// const obj = {
//   name: "John",
//   doLogThis: doLogThis
// };

// obj.doLogThis();

// doLogThis();

// const obj2 = {
//   name: "Jane",
//   doLogThis: function(){
//     console.log("this", this);
//   }
// };

// var doLogThis2 = obj2.doLogThis;
// doLogThis2();

//---------------------------------------------------------
// console.log(this);

// const obj = {
//   name: "John",
//   getName: function () {
//     return this.name;
//   },
// };

// console.log(obj.getName());

// const obj2 = {
//   name: "Jane",
//   getName: () => {
//     return this.name;
//   },
// };

// console.log(obj2.getName());

// const person = {
//   name: "Alex",
//   greet() {
//       console.log(`Hello, ${this.name}`);
//   }
// };

// person.greet(); // "Hello, Alex"

const person = {
  name: "Alex",
  greet: () => {
      console.log(`Hello, ${this.name}`);
  }
};

person.greet();
