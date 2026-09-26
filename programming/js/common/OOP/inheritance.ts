class Animal {
  constructor(public name: string) {}

  move(distance: number) {
    console.log(`${this.name} moved ${distance}m.`);
    return `${this.name} moved ${distance}m.`;
  }
}

class Dog extends Animal {
  constructor(name: string = "Dog") {
    super(name);
  }
}

const myDog = new Dog("Buddy");
console.log(myDog.name);
console.log(myDog instanceof Animal);
console.log(myDog instanceof Dog);
console.log(myDog.move(10));
// ------------------------------------------------------------

class Product {
  constructor(
    public id: string,
    public price: number,
    public description: string
  ) {}

  display() {
    console.log(`Product ID: ${this.id}, Price: ${this.price}, Description: ${this.description}`);
  }
}

class Book extends Product {
  constructor(id: string, price: number, description: string, public author: string) {
    super(id, price, description);
  }

  display() {
    super.display();
    console.log(`Author: ${this.author}`);
  }
}

const myBook = new Book("123", 10, "A book about dogs", "John Doe");
myBook.display();

class ElectronicProduct extends Product {
  constructor(id: string, price: number, description: string, public brand: string) {
    super(id, price, description);
  }
  
  display() {
    super.display();
    console.log(`Brand: ${this.brand}`);
  }
}

const myElectronicProduct = new ElectronicProduct("123", 10, "A book about dogs", "John Doe");
myElectronicProduct.display();
