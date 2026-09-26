function execute(callback) {
  console.log("до виклику");
  callback();
  console.log("до виклику");
}

execute(function () {
  console.log("Я callback");
});

function greet(callback) {
  callback("alex");
}

greet(function(name){
    console.log(name)
})
