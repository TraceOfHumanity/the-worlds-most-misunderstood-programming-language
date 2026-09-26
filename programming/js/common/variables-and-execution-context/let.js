// ==========================================================================
// LET — блочно-скоупне оголошення ідентифікаторів (ES6 / ES2015)
// ==========================================================================

// 1. BLOCK SCOPE (блочна область видимості)
// -----------------------------------------------------
// На відміну від var, let створює binding, який належить найближчому
// блоку {} — це може бути тіло if, for, while, або просто {} без
// жодної конструкції. За межами блоку змінна недоступна.

function blockScopeExample() {
  if (true) {
    let insideBlock = "я всередині блоку if";
    console.log(insideBlock); // ок, ми всередині того самого блоку
  }
  // console.log(insideBlock); // ReferenceError: insideBlock is not defined
}
blockScopeExample();

for (let k = 0; k < 3; k++) {
  // k видима лише в межах циклу (включно з умовою і тілом)
}
// console.log(k); // ReferenceError: k is not defined


// 2. HOISTING + TEMPORAL DEAD ZONE (TDZ)
// -----------------------------------------------------
// let теж піднімається (hoisted) на фазі creation, ОДНАК, на відміну
// від var, binding НЕ ініціалізується значенням undefined.
// Він залишається у стані "uninitialized" аж до рядка, де стоїть
// фактичне оголошення. Проміжок від початку блоку до рядка оголошення
// називається Temporal Dead Zone (TDZ) — тимчасова мертва зона.
// Будь-яке звернення до змінної в TDZ кидає ReferenceError.

// console.log(letVar); // ReferenceError: Cannot access 'letVar' before initialization
let letVar = "тепер я ініціалізована";
console.log(letVar);

// TDZ наглядно:
{
  // TDZ для zone починається тут (від початку блоку)
  // console.log(zone); // ReferenceError
  let zone = "значення";
  // TDZ закінчується рядком вище, з цього моменту zone доступна
  console.log(zone);
}


// 3. RE-DECLARATION (повторне оголошення) — ЗАБОРОНЕНО
// -----------------------------------------------------
// На відміну від var, повторне оголошення let в одній і тій самій
// області видимості кидає SyntaxError ще до виконання коду.

let unique = "перше значення";
// let unique = "друге значення"; // SyntaxError: Identifier 'unique' has already been declared

// Але в різних (вкладених) блоках — це вже інші binding'и, і це ок:
let shadow = "зовнішній";
{
  let shadow = "внутрішній"; // це НОВА змінна, вона затіняє (shadowing) зовнішню
  console.log(shadow); // "внутрішній"
}
console.log(shadow); // "зовнішній"


// 4. REASSIGNMENT (переприсвоєння) — ДОЗВОЛЕНО
// -----------------------------------------------------
// let створює mutable binding — саме значення можна змінювати
// скільки завгодно (на відміну від const).

let counter = 0;
counter = counter + 1;
counter += 1;
console.log(counter); // 2


// 5. НЕ СТАЄ ВЛАСТИВІСТЮ ГЛОБАЛЬНОГО ОБ'ЄКТА
// -----------------------------------------------------
// let у глобальному скоупі створює binding у Global Environment
// Record (Declarative Record), а НЕ на самому globalThis.

let globalLet = "мене немає на globalThis";
console.log(globalThis.globalLet); // undefined


// 6. LET У ЦИКЛАХ — КОЖНА ІТЕРАЦІЯ ОТРИМУЄ СВІЙ BINDING
// -----------------------------------------------------
// Це головна причина, чому let "вирішує" класичну проблему замикань
// у циклах, яка існує з var. Для кожної ітерації циклу for рушій
// створює НОВЕ лексичне середовище (окремий binding змінної),
// копіюючи в нього поточне значення з попередньої ітерації.

let letCallbacks = [];
for (let m = 0; m < 3; m++) {
  letCallbacks.push(function () {
    console.log("let m =", m);
  });
}
letCallbacks.forEach((cb) => cb());
// let m = 0
// let m = 1
// let m = 2
// Кожен колбек "запам'ятав" своє власне значення m,
// бо кожна ітерація — це окремий Declarative Environment Record.


// 7. LEXICAL SCOPING
// -----------------------------------------------------
// let (як і const) підпорядковується лексичному скоупінгу:
// область видимості визначається МІСЦЕМ у коді (текстовою структурою),
// а не тим, звідки функцію викликали (це відрізняє JS від динамічного
// скоупінгу, який використовується, наприклад, у Bash).

let lexicalValue = "зовнішнє значення";
function readsLexicalValue() {
  console.log(lexicalValue); // бере значення з зовнішнього лексичного оточення
}
{
  let lexicalValue = "внутрішнє значення (не впливає на функцію вище)";
}
readsLexicalValue(); // "зовнішнє значення"


// 8. ЩО ВІДБУВАЄТЬСЯ ПІД КАПОТОМ (Declarative Environment Record)
// -----------------------------------------------------
// Для let-оголошень у поточному Lexical Environment створюється
// "let binding" зі станом uninitialized на фазі creation.
// Виконання рядка з `let x = ...` переводить binding зі стану
// uninitialized у initialized — і ось саме до цього моменту
// триває TDZ.


// ПІДСУМОК:
// - scope: блочна (block-scoped) — {}, if, for, while і т.д.
// - hoisting: так, але без ініціалізації → TDZ до рядка оголошення
// - re-declaration в тому ж блоці: заборонено (SyntaxError)
// - reassignment: дозволено
// - глобальний let НЕ потрапляє на globalThis
// - у циклах кожна ітерація має власний binding (важливо для замикань)
