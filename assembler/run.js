const parse = require('./parse')
const interpret = require('./interpret')

const run = (input) => {
  const words = parse(input)
  return interpret(words)
}

module.exports = run
