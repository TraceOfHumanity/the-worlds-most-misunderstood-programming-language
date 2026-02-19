/* 
Протокол ітератора — це контракт: об’єкт є ітератором, якщо має метод next(), який повертає об’єкт { value, done }:
value — поточне значення;
done: true — ітерація скінчена.
Ітерабельний об’єкт — це об’єкт, у якого є метод [Symbol.iterator](), що повертає ітератор. Саме через це працюють for...of, spread ..., Array.from(), деструктуризація масивів тощо.
*/

const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    const to = this.to;
    return {
      next() {
        if (current <= to) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
};

for (const n of range) {
  console.log(n);
}

console.log([...range]);

const [a, b] = range;
console.log(a, b);

const arr = [10, 20, 30];
const arrIterator = arr[Symbol.iterator]();
console.log(arrIterator.next());
console.log(arrIterator.next());
console.log(arrIterator.next());
console.log(arrIterator.next());

const str = "hi";
const strIterator = str[Symbol.iterator]();
console.log(strIterator.next());
console.log(strIterator.next());
console.log(strIterator.next());

const map = new Map([
  ["a", 1],
  ["b", 2]
]);
for (const [key, val] of map) {
  console.log(key, val);
}

const customCollection = {
  items: ["x", "y", "z"],
  [Symbol.iterator]() {
    let i = 0;
    const items = this.items;
    return {
      next() {
        if (i < items.length) {
          return { value: items[i++], done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
};

for (const item of customCollection) {
  console.log(item);
}

console.log(Array.from(customCollection));

function* genRange(from, to) {
  for (let i = from; i <= to; i++) {
    yield i;
  }
}

const gen = genRange(1, 3);
console.log(gen.next());
console.log(gen.next());
console.log(gen.next());
console.log(gen.next());

for (const n of genRange(5, 7)) {
  console.log(n);
}

const infiniteSequence = {
  start: 0,
  [Symbol.iterator]() {
    let current = this.start;
    return {
      next() {
        return { value: current++, done: false };
      }
    };
  }
};

const limited = [...take(infiniteSequence, 5)];
console.log(limited);

function take(iterable, count) {
  return {
    [Symbol.iterator]() {
      const it = iterable[Symbol.iterator]();
      let remaining = count;
      return {
        next() {
          if (remaining <= 0) {
            return { value: undefined, done: true };
          }
          const result = it.next();
          if (result.done) {
            return result;
          }
          remaining--;
          return result;
        }
      };
    }
  };
}
