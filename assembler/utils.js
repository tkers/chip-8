const padStart = (len, char, str) => {
  const diff = len - str.length
  if (diff <= 0)
    return str
  return Array(diff).fill(char) + str
}

const formatByte = x => `${padStart(2, '0', x.toString(16))}`
// const formatByte = x => `${x.toString(16).padStart(2, '0')}`
const formatByteArray = s => s.map(formatByte).join(' ')

const formatXt = fn => `[xt:${fn.name || '?'}]`
const formatWord = word => word.toUpperCase()

const formatStackElem = elem => isNumber(elem) ? formatByte(elem) : isExectutionToken(elem) ? formatXt(elem) : formatWord(elem)
const formatStack = stack => stack.map(formatStackElem).join(' ')

const isNumber = x => typeof x === 'number'
const isExectutionToken = x => x instanceof Function
const isWord = x => typeof x === 'string'

module.exports = {
  formatByteArray,
  formatStack
}
