const tokenise = input =>
  input
    .trim()
    .split(/[\s\n]+/)

const parseWord = token => token.toLowerCase()
const parseNumber = token => parseInt(token.slice(1), 16)
const parseToken = token =>
  token[0] === '$' ?
    parseNumber(token) :
    parseWord(token)

const parse = (input) =>
  tokenise(input).map(parseToken)

module.exports = parse
