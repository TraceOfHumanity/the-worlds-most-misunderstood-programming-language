// object це колекція ключів і значень
// ключі: string | symbol
// значення: будь-який тип (включно з функціями, іншими обʼєктами)

// всі основні способи створення об'єкта:
const a = {};
const b = new Object();
const c = Object.create(null);
const d = Object.create(proto);
const human = {
  name: "Alex",
  age: 2_680_169_017,
  isDev: true,
};

console.log(human);

// доступ до значень об'єкта виконується за допомогою крапки
console.log(human.name);
// або за допомогою квадратних дужок
console.log(human["age"]);

// також обʼєкт можн створити за допомогою конструктора Object
const obj = new Object();
// або за допомогою класу
class ClassObject {
  constructor(name) {
    this.name = name;
  }
}
// Через фабрику функції
function classObject(name) {
  return { name };
}

// З прототипом
const ProtoObject = Object.create(null);

/* Object methods:
 */
