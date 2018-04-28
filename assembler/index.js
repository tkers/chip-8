const fs = require('fs')
const run = require('./run')
const { formatByteArray } = require('./utils')

const runFile = (fname, outname) => {
  fs.readFile(fname, 'utf8', (err, data) => {
    if (err)
      throw new Error(err)
    const output = run(data)
    console.log(formatByteArray(output))
    fs.writeFile(outname, Buffer.from(output), (err2) => {
      if (err2)
        throw new Error(err2)
      console.log(`Wrote output to ${outname}`)
    })
  })
}

// runFile('program.src', 'output.bin')
runFile('beepbeep.src', 'beepbeep.bin')
// runFile('test.src', 'test.bin')
