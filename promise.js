new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("promise resolved");
  }, 1000);
}).then((data) => {
  console.log(data);
});
