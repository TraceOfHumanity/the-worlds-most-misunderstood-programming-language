let process = {name: "John", age: 20}

Object.defineProperty(process, "name", {
    writable: false,
    configurable: false,
    enumerable: false,
    value: "John"
})

process.name = "Jane"

console.log(process)