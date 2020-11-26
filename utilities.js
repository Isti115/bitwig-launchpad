const range = length => Array.apply(null, { length }).map((_, i) => i)

const clamp = (min, max) => n => Math.max(min, Math.min(max, n))
const clamp128 = clamp(0, 127)

const forAllPositions = f => range(8).forEach(y => range(8).forEach(x => f(y, x)))

const log = function () { println(JSON.stringify(arguments)) }
