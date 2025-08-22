// Liskov Substitution Principle
abstract class Shape {
  abstract getArea(): number;
}

class Rectangle extends Shape {
  constructor(private width: number, private height: number) {
    super();
  }

  getArea(): number {
    return this.width * this.height;
  }
}

class Square extends Shape {
  constructor(private side: number) {
    super();
  }

  getArea(): number {
    return this.side * this.side;
  }
}

const rectangle = new Rectangle(10, 20);
const square = new Square(10);

const area = (shape: Shape) => {
  return shape.getArea();
};

console.log(area(rectangle));
console.log(area(square));
