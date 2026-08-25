// робота з ідентифікаторами відбувається в 3 етапи: declaration, initialization, assignment/usage

// step 1: declaration
var userName; // Дана команда резервує пам'ять для ідентифікатора userName. Покищо це просто посилання на місце в пам'яті. Цей обсяг пам'яті практично мінімальний тому що двигун JavaScript не знає яке значення буде в ньому.

// step 2: initialization
userName = "John"; // Дана команда записує значення в пам'ять. Це призводить до перерозподілу пам'яті щоб вмістити нове значення.

// step 3: assignment/usage
console.log(userName);


// ------------------------------------------------------------
// Hoisting - підняття

console.log(variable1); // ідентифікатор доступний для звернення але має значення undefined поки не буде ініціалізований
var variable1;
// TDZ - Temporary Dead Zone

// TDZ start before the declaration
console.log(foo);
let foo = "Hello, World!"; // TDZ end after the declaration
console.log("last line of the file");
