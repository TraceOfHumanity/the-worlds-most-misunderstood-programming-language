// ==========================================================================
// HOISTING (спливання / підняття) — поведінка JS-двигуна на фазі creation
// ==========================================================================

// 1. ЩО ТАКЕ HOISTING НАСПРАВДІ
// -----------------------------------------------------
// Hoisting — це не буквальне "перенесення рядків коду наверх файлу",
// а наслідок того, ЯК працює виконання коду в JS. Кожен виклик функції
// (або запуск скрипта) створює Execution Context, а вхід у нього
// відбувається у ДВІ фази:
//
//   1) Creation Phase (Memory Creation Phase)
//      - рушій сканує весь код поточного скоупу ще ДО його виконання
//      - знаходить усі оголошення (var, let, const, function, class)
//      - резервує для кожного ідентифікатора пам'ять і binding
//        у відповідному Environment Record
//      - var та function-оголошення одразу отримують значення
//        (var → undefined, function declaration → сама функція)
//      - let, const, class отримують стан "uninitialized" (TDZ)
//
//   2) Execution Phase
//      - код виконується рядок за рядком зверху вниз
//      - присвоєння значень відбувається саме тут
//
// Тобто "hoisting" — це видимий ефект creation phase: ідентифікатор
// вже існує в пам'яті ДО того, як виконання дійшло до рядка оголошення.

// 2. VAR HOISTING
// -----------------------------------------------------
// var піднімається РАЗОМ З ІНІЦІАЛІЗАЦІЄЮ значенням undefined.
// Тому звернення до var до її оголошення не кидає помилку.

console.log(varExample); // undefined (а не ReferenceError)
var varExample = "значення";
console.log(varExample); // "значення"

// Еквівалент того, що робить рушій на фазі creation + execution:
// Creation:  var varExample; (=> undefined)
// Execution: varExample = "значення";

// 3. LET / CONST HOISTING І TEMPORAL DEAD ZONE (TDZ)
// -----------------------------------------------------
// let і const ТЕЖ піднімаються (binding резервується на creation phase),
// АЛЕ без ініціалізації — вони залишаються у стані "uninitialized".
// Проміжок від початку блоку до рядка фактичного оголошення
// називається Temporal Dead Zone (TDZ). Будь-яке звернення до
// ідентифікатора в цей проміжок кидає ReferenceError.

// console.log(letExample); // ReferenceError: Cannot access 'letExample' before initialization
let letExample = "значення";

{
  // TDZ для zoneVar починається з відкриття блоку
  // typeof zoneVar; // навіть typeof кидає ReferenceError в TDZ!
  let zoneVar = "ok";
}

// ВАЖЛИВО: typeof для НЕОГОЛОШЕНОЇ взагалі змінної не кидає помилку:
console.log(typeof neverDeclared); // "undefined" — безпечно
// А ось typeof змінної, яка ІСНУЄ, але ще в TDZ — кидає ReferenceError,
// бо рушій вже "знає" про binding, просто він ще не ініціалізований.

// 4. FUNCTION DECLARATION HOISTING
// -----------------------------------------------------
// Оголошення функції через `function name() {}` піднімається
// ПОВНІСТЮ — разом з тілом. Тому такі функції можна викликати
// навіть до рядка, де вони визначені у коді.

sayHello(); // "Привіт!" — працює, хоча виклик стоїть вище оголошення

function sayHello() {
  console.log("Привіт!");
}

// 5. FUNCTION EXPRESSION HOISTING — ІНША ПОВЕДІНКА
// -----------------------------------------------------
// Якщо функція присвоюється змінній (function expression), піднімається
// лише сама змінна (за правилами var/let/const), а НЕ функція.

// sayBye(); // TypeError: sayBye is not a function (var-варіант)
var sayBye = function () {
  console.log("Бувай!");
};
sayBye(); // ок, після присвоєння

// arrowGreet(); // ReferenceError (для let/const — TDZ)
const arrowGreet = () => console.log("Привіт зі стрілки!");
arrowGreet();

// 6. CLASS HOISTING
// -----------------------------------------------------
// class теж піднімається, але, як і let/const, залишається
// в TDZ до моменту оголошення.

// const instance = new MyClass(); // ReferenceError: Cannot access 'MyClass' before initialization
class MyClass {
  greet() {
    console.log("Я екземпляр класу");
  }
}
new MyClass().greet();

// 7. КОЛІЗІЯ ІМЕН: FUNCTION VS VAR
// -----------------------------------------------------
// Якщо в одному скоупі є і `var foo`, і `function foo() {}`,
// на фазі creation function-оголошення "перемагає" var —
// саме функція записується в binding. Але подальше виконання коду
// (звичайне присвоєння) може це перезаписати.

console.log(typeof duplicateName); // "function" — function declaration переміг
var duplicateName = "тепер я рядок"; // виконання: присвоєння перезаписує
function duplicateName() {}
console.log(typeof duplicateName); // "string"

// 8. HOISTING У РІЗНИХ EXECUTION CONTEXT
// -----------------------------------------------------
// Кожен виклик функції створює СВІЙ власний Execution Context
// і СВОЮ creation phase. Тобто hoisting відбувається окремо
// для глобального контексту, і окремо — для кожного виклику
// кожної функції.

function outer() {
  console.log(innerVar); // undefined — своя creation phase для outer()
  var innerVar = "локальна для outer";
  console.log(innerVar);
}
outer();
// console.log(innerVar); // ReferenceError — innerVar не існує в глобальному контексті

// ПІДСУМОК:
// - hoisting — наслідок creation phase, яка передує execution phase
// - var: піднімається + одразу ініціалізується undefined → безпечна для
//   читання до оголошення (але поверне undefined)
// - let/const/class: піднімаються, але БЕЗ ініціалізації → TDZ,
//   звернення до оголошення кидає ReferenceError
// - function declaration: піднімається повністю разом з тілом,
//   можна викликати до оголошення в коді
// - function expression / arrow function: піднімається лише
//   змінна-контейнер (за правилами var/let/const), не сама функція
// - hoisting відбувається окремо в кожному Execution Context
//   (глобальному та в кожному виклику функції)

