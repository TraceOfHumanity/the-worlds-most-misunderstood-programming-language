const target = {
  value: "target value",
  name: "target name",
};

const proxy = new Proxy(target, {
  get: function (target, prop, receiver) {
    if (prop === "value") {
      console.log("reading value field...");
      // return target[prop]
    }
    return Reflect.get(...arguments);
  },
  set: function (target, prop, value) {
    if (prop === "value") {
      if (value.length > 5) {
        throw new TypeError("value is too long");
      }
    }
    target[prop] = value;
    return true;
  },
});

console.log(proxy.value);
console.log(proxy.name);

proxy.value = "newValue";
