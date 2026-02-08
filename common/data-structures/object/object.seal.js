// Object.seal забороняє додавати нові властивості і видаляти існуючі, але дозволяє змінювати існуючі.

const obj = {
    name: "Alex",
    age: 26_169_017,
    isDev: true
};

Object.seal(obj);
obj.name = "John";
console.log(obj);
