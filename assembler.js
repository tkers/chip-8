const output = []

const op2 = (fn) => (stack) => {
  const top = stack.pop()
  const snd = stack.pop()
  stack.push(fn(snd, top))
}

const consumeUntil = (token, consume) => {
  const body = []
  let word = consume()
  while (word !== token) {
    body.push(word)
    word = consume()
  }
  return body
}

const dictionary = {
  emit: (stack) => {
    const top = stack.pop()
    output.push(top)
  },
  '.s': (stack) => {
    console.log(stack)
  },
  define: (stack, consume) => {
    const name = consume()
    const body = consumeUntil(';', consume)
    dictionary[name] = (stack) => runWords(body, stack)
  },
  '(': (stack, consume) => {
    consumeUntil(')', consume)
  },
  swap: (stack) => {
    const top = stack.pop()
    const snd = stack.pop()
    stack.push(top, snd)
  },
  rot: (stack) => {
    const c = stack.pop()
    const b = stack.pop()
    const a = stack.pop()
    stack.push(b, c, a)
  },
  dup: (stack) => {
    const top = stack.pop()
    stack.push(top)
    stack.push(top)
  },
  '*': op2((a, b) => a * b),
  '+': op2((a, b) => a + b),
  '-': op2((a, b) => a - b),
  '&': op2((a, b) => a & b),
  '|': op2((a, b) => a | b)
}

const runWords = (_words, stack = []) => {
  const words = _words.slice(0)
  const consume = () => words.shift().toLowerCase()
  while (words.length > 0) {
    const word = consume()
    if (word[0] === '$') {
      stack.push(parseInt(word.slice(1), 16))
    }
    else if (word in dictionary) {
      dictionary[word](stack, consume)
    }
    else {
      throw new Error(`Unexpected word: ${word}`)
    }
  }
  return output
}

const run = (input) => {
  const words = input.trim().split(/[\s\n]+/)
  return runWords(words)
}

const fs = require('fs')
const main = (fname) => {
  fs.readFile(fname, 'utf8', (err, data) => {
    if (err)
      throw new Error(err)
    const output = run(data)
    console.log(output.map(x => `$${x.toString(16)}`))
  })
}

main('program.src')
