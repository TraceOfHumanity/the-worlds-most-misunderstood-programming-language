// ==========================================================================
// CONST — блочно-скоупне оголошення з незмінним binding'ом (ES6 / ES2015)
// ==========================================================================

// 1. BLOCK SCOPE (як і let)
// -----------------------------------------------------
// const так само, як і let, має блочну область видимості —
// прив'язана до найближчого {} (if, for, while, або "голий" блок).

function blockScopeExample() {
  if (true) {
    const insideBlock = "я всередині блоку if";
    console.log(insideBlock);
  }
  // console.log(insideBlock); // ReferenceError: insideBlock is not defined
}
blockScopeExample();


// 2. HOISTING + TEMPORAL DEAD ZONE (TDZ)
// -----------------------------------------------------
// Так само, як let, const піднімається на фазі creation у стані
// "uninitialized", і звернення до неї до рядка оголошення кидає
// ReferenceError (TDZ).

// console.log(constVar); // ReferenceError: Cannot access 'constVar' before initialization
const constVar = "я маю бути ініціалізована одразу";
console.log(constVar);


// 3. ОБОВ'ЯЗКОВА ІНІЦІАЛІЗАЦІЯ ПРИ ОГОЛОШЕННІ
// -----------------------------------------------------
// На відміну від var і let, const ВИМАГАЄ значення в момент
// оголошення. Без нього — SyntaxError ще до виконання коду.

// const noValue; // SyntaxError: Missing initializer in const declaration
const withValue = "обов'язково";


// 4. RE-DECLARATION — ЗАБОРОНЕНО (як і в let)
// -----------------------------------------------------
const uniqueConst = "перше значення";
// const uniqueConst = "друге значення"; // SyntaxError: Identifier has already been declared


// 5. REASSIGNMENT — ЗАБОРОНЕНО (головна відмінність від let)
// -----------------------------------------------------
// const створює IMMUTABLE BINDING — не можна повторно присвоїти
// значення тому самому ідентифікатору.

const pi = 3.14159;
// pi = 3.14; // TypeError: Assignment to constant variable.


// 6. ВАЖЛИВО: IMMUTABLE BINDING ≠ IMMUTABLE VALUE
// -----------------------------------------------------
// const робить незмінним саме ПОСИЛАННЯ (binding) на значення,
// а НЕ саме значення. Якщо значення — об'єкт або масив (reference type),
// його внутрішній вміст можна змінювати як завгодно — забороняється
// лише переприсвоєння самого ідентифікатора на щось інше.

const user = { name: "John", age: 30 };
user.age = 31;        // ок — ми змінюємо властивість об'єкта, а не сам binding
user.city = "Kyiv";   // ок — можна навіть додавати нові властивості
console.log(user);    // { name: "John", age: 31, city: "Kyiv" }

// user = { name: "Alex" }; // TypeError: Assignment to constant variable.
// Тут ми намагаємось змінити САМ binding (заставити user вказувати
// на інший об'єкт у пам'яті) — і саме це заборонено.

const numbers = [1, 2, 3];
numbers.push(4);       // ок — мутація масиву дозволена
numbers[0] = 100;       // ок
console.log(numbers);   // [100, 2, 3, 4]
// numbers = [5, 6, 7]; // TypeError: Assignment to constant variable.

// Якщо потрібна СПРАВЖНЯ незмінність вмісту об'єкта — використовують
// Object.freeze() (це вже про immutable value, а не про binding):
const frozenUser = Object.freeze({ name: "Ann" });
frozenUser.name = "Bob"; // мовчки ігнорується (у strict mode — TypeError)
console.log(frozenUser.name); // "Ann"
// Object.freeze робить лише "shallow freeze" — вкладені об'єкти
// всередині все одно залишаються мутабельними, якщо їх не заморозити окремо.


// 7. НЕ СТАЄ ВЛАСТИВІСТЮ ГЛОБАЛЬНОГО ОБ'ЄКТА (як і let)
// -----------------------------------------------------
const globalConst = "мене немає на globalThis";
console.log(globalThis.globalConst); // undefined


// 8. CONST У ЦИКЛАХ
// -----------------------------------------------------
// У класичному for (const i = 0; ...) неможливий, бо ітератор
// вимагає переприсвоєння (i++), а це заборонено для const:
// for (const n = 0; n < 3; n++) {} // TypeError: Assignment to constant variable.

// Але в for...of / for...in const використовувати МОЖНА і навіть
// прийнято — адже на кожній ітерації створюється НОВИЙ binding.
const iterable = ["a", "b", "c"];
for (const item of iterable) {
  console.log("const item =", item); // новий binding на кожній ітерації, все ок
}


// 9. LEXICAL SCOPING (як і let)
// -----------------------------------------------------
const lexicalValue = "зовнішнє значення";
function readsLexicalValue() {
  console.log(lexicalValue);
}
{
  const lexicalValue = "внутрішнє значення";
}
readsLexicalValue(); // "зовнішнє значення"


// 10. ЩО ВІДБУВАЄТЬСЯ ПІД КАПОТОМ (Declarative Environment Record)
// -----------------------------------------------------
// Так само, як let, const створює binding у Declarative Environment
// Record поточного лексичного оточення зі станом uninitialized
// на фазі creation (звідси й TDZ). Відмінність з'являється на
// етапі виконання: рушій позначає const-binding як immutable —
// будь-яка спроба присвоєння (окрім самого моменту ініціалізації)
// призводить до TypeError.


// ПІДСУМОК:
// - scope: блочна (block-scoped), як і let
// - hoisting: так, з TDZ (без ініціалізації undefined)
// - обов'язкова ініціалізація значенням в момент оголошення
// - re-declaration: заборонено (SyntaxError)
// - reassignment самого binding'а: заборонено (TypeError)
// - вміст об'єктів/масивів МОЖНА мутувати — const захищає лише binding,
//   а не значення (immutable binding vs immutable value)
// - глобальний const НЕ потрапляє на globalThis
// - рекомендований дефолт у сучасному коді: використовуй const,
//   якщо ідентифікатор не потребує переприсвоєння; інакше — let
