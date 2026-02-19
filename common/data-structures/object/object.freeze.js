// для замороження обʼєкта використовується Object.freeze. це забороняє змінювати властивості обʼєкта.

const human = {
    name: "Alex",
    age: 2_680_169_017,
    isDev: true
};

Object.freeze(human);
human.name = "John";
console.log(human);
