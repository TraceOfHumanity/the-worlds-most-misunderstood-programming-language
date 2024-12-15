const calculatePrimes = require("./heavy.calc");

process.on("message", ({multiplier, iterations}) => {
  console.log("Message to child: ");

  const result = calculatePrimes(iterations, multiplier);
  console.log("Result: ", result);
  process.send(result);
  process.exit();
});
