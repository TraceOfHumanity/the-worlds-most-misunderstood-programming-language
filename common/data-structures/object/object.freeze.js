// для замороження обʼєкта використовується Object.freeze. це забороняє змінювати властивості обʼєкта.

const obj = {
    name: "Alex",
    age: 26_169_017,
    isDev: true
};

Object.freeze(obj);
obj.name = "John";
console.log(obj);
