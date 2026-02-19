/* proxy це обʼєкт який перехоплює доступ до властивостей обʼєкта і може виконувати певні дії перед тим як доступ до властивості буде отриманий.
Proxi може бути використаний для реалізації таких функцій як:
- перевірка доступу до властивостей
- перевірка типу властивостей
- перевірка наявності властивостей
- перевірка наявності методу
- перевірка наявності функції
- перевірка наявності обʼєкта
- перевірка наявності масиву
- перевірка наявності рядка
- перевірка наявності числа
- перевірка наявності булевого значення
*/

const person = {
    name: "Alex",
    age: 2_680_169_017,
    isDev: true,
    password: "123456",
    location: "London"
};

// const proxy = new Proxy(person, {
//     get: function (target, prop, receiver) {
//         if (prop in target) {
//             return target[prop];
//         } else {
//             throw new Error(`Property ${prop} does not exist`);
//         }

//         // return Reflect.get(...arguments);
//     },
//     set: function (target, prop, value) {
//         if (prop in target) {
//             target[prop] = value;
//             return true;
//         } else {
//             throw new Error(`Property ${prop} does not exist`);
//         }
//     }
// });

// console.log(proxy.name);
// console.log(proxy.age);
// console.log(proxy.isDev);
// // console.log(proxy.city);
// proxy.city = "New York";
// console.log(proxy.city);

// ------------------------------------------------------------


// const proxy = new Proxy(person, {
//     get: function(target, prop, receiver) {
//         return Reflect.get(...arguments);
//     }
// });

// console.log(proxy.name);
// console.log(proxy.age);
// console.log(proxy.isDev);
// console.log(proxy.city);
// console.log(proxy);

// ------------------------------------------------------------

// const proxy = new Proxy(person, {
//     get: function(target, prop, ) {
//         if (prop === "password") {
//             throw new Error("You are not allowed to access password");
//         }
//         return Reflect.get(...arguments);
//     }
// });

// console.log(proxy.password);
// console.log(proxy.name);

// ------------------------------------------------------------

// const proxy = new Proxy(person, {
//     set: function (target, prop, value) {
//         if (prop === 'location') {
//             throw new Error("You are not allowed to change location");
//         }
//         target[prop] = value;
//         return true;
//     }
// });

// console.log(proxy.location);
// proxy.location = "New York";
// console.log(proxy.location);

// ------------------------------------------------------------

function greet(name) {
    console.log(`Hello, ${name}`);
}

const proxy = new Proxy(greet, {
    apply(target, thisArg, argumentsList) {
        if (typeof argumentsList[0] !== 'string') {
            throw new Error("First argument must be a string");
        }
        return Reflect.apply(target, thisArg, argumentsList);
    }
});

greet("John");
proxy("John");
greet(123);
proxy(123);