// object це колекція ключів і значень
// ключі: string | symbol
// значення: будь-який тип (включно з функціями, іншими обʼєктами)

// синтаксис для створення об'єкта
const user = {
    name: "Alex",
    age: 2_169_017,
    isDev: true
};

console.log(user);

// доступ до значень об'єкта виконується за допомогою крапки
console.log(user.name);
// або за допомогою квадратних дужок
console.log(user["age"]);

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