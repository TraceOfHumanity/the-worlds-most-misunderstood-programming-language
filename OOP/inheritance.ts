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
