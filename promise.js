// new Promise((resolve, reject) => {
//   setTimeout(() => {
//     resolve("promise resolved");
//   }, 1000);
// }).then((data) => {
//   console.log(data);
// });

// const response = fetch("https://jsonplaceholder.typicode.com/users")
//   .then((response) => response.json())
//   .then((json) => console.log(json))
//   .catch((error) => console.log(error));

console.log(0);
Promise.resolve(1).then((data) => console.log(data));
console.log(2);
