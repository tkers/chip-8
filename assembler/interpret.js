const { formatStack } = require('./utils')

const output = []
let outputPointer = 0

const INTERPRET_MODE = 'INTERPRET_MODE'
const COMPILE_MODE = 'COMPILE_MODE'
let mode = INTERPRET_MODE
let dictPointer = null

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

const immediate = {
  ';': () => {
    // const fns = dictionary[dictPointer]
    // dictionary[dictPointer] = (_s, _c) => fns.forEach(fn => fn(_s, _c))
    mode = INTERPRET_MODE
    dictPointer = null
  },
  '(': (stack, consume) => {
    consumeUntil(')', consume)
  },
  '[': () => {
    mode = INTERPRET_MODE
  },
  'DOES>': () => {
    // @TODO no f'ing clue ??
    // add RET to DP + mark run-time start
  }
}

const dictionary = {
  ']': () => {
    mode = COMPILE_MODE
  },
  '\'': (stack, consume) => {
    const name = consume()
    stack.push(immediate[name] || dictionary[name])
  },
  'execute': (stack, consume) => {
    const fn = stack.pop()
    if (!(fn instanceof Function))
      throw new Error(`Invalid xt: ${fn}`)
    fn(stack, consume)
  },
  emit: (stack) => {
    const top = stack.pop()
    output[outputPointer] = top
    outputPointer++
  },
  load: (stack) => {
    stack.push(output[outputPointer])
  },
  '.s': (stack) => {
    console.log(formatStack(stack))
  },
  offset: (stack) => {
    stack.push(outputPointer)
  },
  seek: (stack) => {
    outputPointer = stack.pop()
  },
  see: (stack, consume) => {
    const name = consume()
    const def = immediate[name] || dictionary[name]
    console.log(':', name, def instanceof Function ? `[core:${name}]` : def.map(x => x.name).join(' '), ';')
  },
  create: (stack, consume) => {
    dictPointer = consume()
    mode = COMPILE_MODE
    dictionary[dictPointer] = []
  },
  define: (stack, consume) => {
    dictPointer = consume()
    mode = COMPILE_MODE
    if (dictPointer in dictionary) {
      console.warn(`[!] Redefining word: ${name}`)
    }
    dictionary[dictPointer] = []
  },
  define2: (stack, consume) => {
    const name = consume()
    if (name in dictionary) {
      console.warn(`[!] Redefining word: ${name}`)
    }
    const body = consumeUntil(';', consume)
    const fns = body.map(x => {
      if (typeof x === 'number') {
        const bla = { [`push_${x}`]: (stack) => stack.push(x) }
        return bla[Object.keys(bla)[0]]
      }
      else {
        return dictionary[x]
      }
    })
    console.log(name, fns.map(f => f && f.name || f))
    dictionary[name] = (stack, consume) => fns.forEach(f => f(stack, consume))
  },
  defineold: (stack, consume) => {
    const name = consume()
    const body = consumeUntil(';', consume)
    if (name in dictionary) {
      console.warn(`[!] Redefining word: ${name}`)
    }
    dictionary[name] = (stack) => interpret(body, stack)
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
  '>>': op2((a, b) => a >> b),
  '<<': op2((a, b) => a << b),
  '+': op2((a, b) => a + b),
  '-': op2((a, b) => a - b),
  '&': op2((a, b) => a & b),
  '|': op2((a, b) => a | b)
}

const execute = (def, input, stack) => {}

let _stack = []
const interpret = (_words, stack = _stack) => {
  const words = _words.slice(0)
  const consume = () => words.shift()
  while (words.length > 0) {
    const word = consume()
    if (mode === INTERPRET_MODE) {
      if (typeof word === 'number') {
        stack.push(word)
      }
      else if (word in immediate || word in dictionary) {
        const def = immediate[word] || dictionary[word]
        if (def instanceof Function)
          def(stack, consume)
        else {
          def.forEach(fn => fn(stack, consume))
          // interpret(def, stack)
        }
      }
      else {
        // console.warn(`[!] Ignoring undefined word: ${word}`)
        throw new Error(`Unexpected word: ${word}`)
      }
    }
    // compile mode
    else {
      if (word in immediate) {
        immediate[word](stack, consume)
      }
      // else {
      //   dictionary[dictPointer].push(word)
      // }
      else if (typeof word === 'number') {
        dictionary[dictPointer].push(makePush(word))
      }
      else {
        dictionary[dictPointer].push(dictionary[word])
      }
    }
  }
  _stack = stack
  return output
}

const makePush = x => {
  const fn = stack => stack.push(x)
  fn.name = `push_${x}`
  return fn
}

module.exports = interpret
