const range = length => Array.apply(null, { length }).map((_, i) => i)

const forAllPositions = f => range(8).forEach(y => range(8).forEach(x => f(y, x)))

const log = function () { println(JSON.stringify(arguments)) }
