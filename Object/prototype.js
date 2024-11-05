function Car(brand, age) {
  this.brand = brand;
  this.age = age;
}

Car.prototype.getBrand = function () {
  return this.brand;
};

const toyota = new Car('Toyota', 10);
const honda = new Car('Honda', 5);

console.log(toyota.getBrand());
console.log(honda.getBrand());
