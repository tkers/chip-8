const readline = require('readline')
const run = require('./run')
const { formatByteArray } = require('./utils')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const repl = () => {
  rl.question('> ', input => {
    try {
      const output = run(input)
      console.log(output && formatByteArray(output))
    }
    catch (err) {
      console.error(err.message || err)
    }
    setTimeout(repl, 0)
    // rl.close();
  })
}

repl()
