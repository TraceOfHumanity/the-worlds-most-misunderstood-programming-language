// 1. recursive
// function fibonacci(n) {
//   if (n <= 1) return n;
//   return fibonacci(n - 1) + fibonacci(n - 2);
// }

// console.log(fibonacci(6)); // Виведе: 8

// // 2. iterative
// function fibonacci(n) {
//   let a = 0, b = 1, c;
//   for (let i = 2; i <= n; i++) {
//     c = a + b;
//     a = b;
//     b = c;
//   }
//   return b;
// }

// console.log(fibonacci(6)); // Виведе: 8

// 3. memoization
function fibonacci(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}