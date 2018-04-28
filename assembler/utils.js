const formatByte = x => `${x.toString(16).padStart(2, '0')}`
const formatByteArray = s => s.map(formatByte).join(' ')

module.exports = {
  formatByte,
  formatByteArray
}
