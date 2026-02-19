// Object.seal забороняє додавати нові властивості і видаляти існуючі, але дозволяє змінювати існуючі.

const human = {
    name: "Alex",
    age: 2_680_169_017,
    isDev: true
};

Object.seal(human);
human.name = "John";
console.log(human);
