// function Car(brand, age) {
//   this.brand = brand;
//   this.age = age;
// }

// Car.prototype.getBrand = function () {
//   return this.brand;
// };

// const toyota = new Car('Toyota', 10);
// const honda = new Car('Honda', 5);

// console.log(toyota.getBrand());
// console.log(honda.getBrand());


// class Car {
//   constructor(brand, age) {
//     this.brand = brand;
//     this.age = age;
//   }

//   getBrand() {
//     return this.brand;
//   }
// }

const a = "qwerty";

console.log(a.__proto__);

console.log(a.__proto__ === String.prototype);
