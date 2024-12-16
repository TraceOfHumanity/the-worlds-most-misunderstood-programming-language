console.log('Processing data...')

console.time('Processing time')
let counter = 0
for (let i = 0; i < 10000000; i++) {
    counter++
}

console.log(`Processing ${counter} entries finished.`)
console.timeEnd('Processing time')