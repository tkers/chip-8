const fs = require('fs')
const run = require('./run')
const { formatByteArray } = require('./utils')

const runFile = (fname, outname, cb) => {

  if (outname instanceof Function) {
    cb = outname
    outname = null
  }

  if (!cb) {
    cb = () => {}
  }

  fs.readFile(fname, 'utf8', (err, data) => {
    if (err) {
      return cb(err)
    }

    const output = run(data)

    if (!outname) {
      return cb(null, output)
    }

    fs.writeFile(outname, Buffer.from(output), (err2) => {
      if (err2) {
        return cb(err2)
      }
      cb(null, output)
    })
  })
}

module.exports = runFile
