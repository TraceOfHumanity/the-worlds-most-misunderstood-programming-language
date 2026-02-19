// для певерхневого копіювання обʼєкта:

const obj = {
    name: "Alex",
    age: 2_680_169_017,
    isDev: true
};

const objCopy = Object.assign({}, obj);
console.log(objCopy);

// для глибокого копіювання обʼєкта можна використовувати JSON.parse(JSON.stringify(obj)); функції не копіюються