// trim is a function that removes whitespace from both ends of a string. 

function trim(str) {
  return str.replace(/^\s+|\s+$/g, '');
}

console.log(trim("  Hello world!  ")); // "Hello world!"