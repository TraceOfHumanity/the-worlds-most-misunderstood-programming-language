const groupBy = (arr, key) => {
  const grouped = new Map();
  for (const item of arr) {
    const group = item[key];
    if (!grouped.has(group)) {
      grouped.set(group, []);
    }
    grouped.get(group).push(item);
  }
  return grouped;
};

const data = [
  { name: "Alex", role: "admin" },
  { name: "John", role: "user" },
  { name: "Anna", role: "admin" }
];
console.log(groupBy(data, "role"));
// Map { 'admin' => [{name: 'Alex', role: 'admin'}, {name: 'Anna', role: 'admin'}], 'user' => [{name: 'John', role: 'user'}] }


// ------------------------------------------------------------

const groupBy2 = (arr, key) => {
  return arr.reduce((acc, item) => {
    acc[item[key]] = [...(acc[item[key]] || []), item];
    return acc;
  }, {});
};

console.log(groupBy2(data, "role"));

// ------------------------------------------------------------

const groupBy3 = (arr, key) =>
  arr.reduce((acc, item) => {
    const group = item[key];
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

console.log(groupBy3(data, "role"));