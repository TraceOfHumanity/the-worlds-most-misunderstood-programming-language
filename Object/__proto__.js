const car = {
  getBrand() {
    return this.brand;
  },
};

const toyota = {
  brand: 'Toyota',
  age: 10,
};

const honda = {
  brand: 'Honda',
  age: 5,
};

// console.log(car.__proto__);

console.log(toyota.getBrand());
console.log(honda.getBrand());
