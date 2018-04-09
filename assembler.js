const output = []
let pointer = 0

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
    output[pointer] = top
    pointer++
  },
  load: (stack) => {
    stack.push(output[pointer])
  },
  '.s': (stack) => {
    console.log(stack)
  },
  offset: (stack) => {
    stack.push(pointer)
  },
  seek: (stack) => {
    pointer = stack.pop()
  },
  define: (stack, consume) => {
    const name = consume()
    const body = consumeUntil(';', consume)
    dictionary[name] = (stack) => runWords(body, stack)
  },
  'label:' : (stack, consume) => {
    const label = consume()
    const addr = output.length
    dictionary[label] = () => stack.push(addr)
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
  const consume = () => words.shift()
  while (words.length > 0) {
    const word = consume()
    if (typeof word === 'number') {
      stack.push(word)
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
  const words = input
    .trim()
    .split(/[\s\n]+/)
    .map(x => {
      return (x[0] === '$') ? parseInt(x.slice(1), 16) : x.toLowerCase()
    })
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
