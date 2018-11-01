function divisors(integer) {
    const rtnArr = [];
    for (let i = 1; i < integer; i++) {
        if (integer % i === 0) {
            rtnArr.push(i);
        }
    }
    return rtnArr.length > 0 ? rtnArr : `${integer} is prime`;
}

console.log(divisors(12));
console.log(divisors(25));
console.log(divisors(13));
