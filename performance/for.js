let sum = 0;
for (let i = 0; i < 1000000000; i++) {
    sum += i;
}

// ---

const sum2 = function(n) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
        sum += i;
    }
    return sum;
}

sum2(1000000000);

// ---

const sum3 = function(n) {
    return n * (n + 1) / 2;
}

sum3(1000000000);