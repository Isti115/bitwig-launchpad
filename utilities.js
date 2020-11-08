const range = length => Array.apply(null, { length }).map((_, i) => i)

const clamp128 = n => Math.max(0, Math.min(127, n))

const forAllPositions = f => range(8).forEach(y => range(8).forEach(x => f(y, x)))

const log = function () { println(JSON.stringify(arguments)) }
