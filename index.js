// current opcode (2 bytes)
let opcode = 0x0000

// memory (4096 bytes)
// 0x000 ... 0x1FF: interpreter
// 0x050 ... 0x0A0: font set
// 0x200 ... 0xFFF: program ROM and work RAM
let memory = Array(4096).fill(0x00)

// CPU registers (V0..V15 - 1 byte each)
let V = Array(16).fill(0x00)
// let V0 = 0x00
// let V1 = 0x00
// let V2 = 0x00
// let V3 = 0x00
// let V4 = 0x00
// let V5 = 0x00
// let V6 = 0x00
// let V7 = 0x00
// let V8 = 0x00
// let V9 = 0x00
// let VA = 0x00
// let VB = 0x00
// let VC = 0x00
// let VD = 0x00
// let VE = 0x00
// let VF = 0x00

// index register
let I = 0x000

// program counter
let pc = 0x200

// stack and stack pointer
let stack = Array(16).fill(0x000)
let sp = 0x0

let drawFlag = 0x0

// timer registers (60 Hz)
let DT = 0x00
let ST = 0x00

// @TODO extract display logic elsewhere
let gfx = Array(64).fill(Array(32).fill(0x0))

// @TODO extract input logic elsewhere
let keys = Array(16).fill(0x0)

const load = rom => {
  const len = rom.length
  for (let i = 0; i < len; i++) {
    memory[0x200 + i] = rom[i]
  }
}

const cycle = () => {

  const co = memory[pc++]
  const de = memory[pc++]
  opcode = co << 8 | de

  const op = opTable[(opcode & 0xf000) >> 12]
  op()

  if (DT > 0) {
    DT--
  }

  if (ST > 0) {
    ST--
    if (ST === 0)
      console.log('BUZZ')
  }

}

// operations

const nop = () => {}

const todo = () => {
  throw new Error('Not implemented')
}

// CLS
const cls = () => {
  todo()
}

// RET
const ret = () => {
  sp--
  pc = stack[sp]
}

// JP addr
const jp = () => {
  pc = opcode & 0x0fff
}

// CALL addr
const call = () => {
  stack[sp] = pc
  sp++
  pc = opcode & 0x0fff
}

// SE Vx, byte
const se = () => {
  const x = (opcode & 0x0f00) >> 8
  const kk = opcode & 0x00ff
  if (V[x] === kk)
    pc += 2
}

// SNE Vx, byte
const sne = () => {
  const x = (opcode & 0x0f00) >> 8
  const kk = opcode & 0x00ff
  if (V[x] !== kk)
    pc += 2
}

// SE Vx, Vy
const se2 = () => {
  const x = (opcode & 0x0f00) >> 8
  const y = opcode & 0x00f0
  if (V[x] === kk)
    pc += 2
}

// LD Vx, byte
const ld = () => {
  const x = (opcode & 0x0f00) >> 8
  const kk = opcode & 0x00ff
  V[x] = kk
}

// ADD Vx, bute
const add = () => {
  const x = (opcode & 0x0f00) >> 8
  const kk = opcode & 0x00ff
  V[x] += kk
}

// LD Vx, Vy
const ld2 = () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  V[x] = V[y]
}

// OR Vx, Vy
const or => () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  V[x] |= V[y]
}

// AND Vx, Vy
const and => () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  V[x] &= V[y]
}

// XOR Vx, Vy
const xor => () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  V[x] ^= V[y]
}

// ADD Vx, Vy
const add2 => () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  V[x] += V[y]
  V[0xf] = V[x] > 255 ? 1 : 0
}

// SUB Vx, Vy
const sub => () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  V[0xf] = V[x] > V[y] ? 1 : 0
  V[x] -= V[y]
}

// SHR Vx {, Vy}
const shr => () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  V[0xf] = V[x] % 2
  V[x] = Math.floor(V[x] / 2)
}

// SUBN Vx, Vy
const subn => () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  V[0xf] = V[y] > V[x] ? 1 : 0
  V[x] -= V[y]
}

// SHL Vx {, Vy}
const shl => () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  V[0xf] = V[x] % 2
  V[x] *= 2
}

// SNE Vx, Vy
const sne2 = () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  if (V[x] !== V[y])
    pc += 2
}

// LD I, addr
const ld2 = () => {
  I = opcode & 0x0fff
}

// JP V0, addr
const jp2 = () => {
  const nnn = opcode & 0x0fff
  pc = nnn + V[0]
}

// RND Vx, byte
const rnd = () => {
  const x = (opcode & 0x0f00) >> 8
  const kk = opcode & 0x00ff
  V[x] = Math.floor(Math.random() * 256) & kk
}


// DRW Vx, Vy, nibble
const drw = () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  const n = opcode & 0x000f
  V[0xF] = 0

  for (let yline = 0; yline < n; yline++) {
    const pixel = memory[I + yline]
    for (let xline = 0; xline < 8; xline++) {
      if ((pixel & (0x80 >> xline)) !== 0) {
        if (gfx[(V[x] + xline + ((V[y] + yline) * 64))] === 1) {
          V[0xF] = 1
        }
        gfx[V[x] + xline + ((V[y] + yline) * 64)] ^= 1
      }
    }
  }
  drawFlag = 0x1
  pc += 2
}

// SKP Vx
const skp = () => {
  const x = (opcode & 0x0f00) >> 8
  if (keys[V[x]] === 1)
    pc += 2
}

// SKNP Vx
const sknp = () => {
  const x = (opcode & 0x0f00) >> 8
  if (keys[V[x]] !== 1)
    pc += 2
}

// LD Vx, DT
const lddt = () => {
  const x = (opcode & 0x0f00) >> 8
  V[x] = DT
}

// LD Vx, K

// LD DT, Vx
const lddt2 = () => {
  const x = (opcode & 0x0f00) >> 8
  DT = V[x]
}

// LD ST, Vx
const ldst = () => {
  const x = (opcode & 0x0f00) >> 8
  ST = V[x]
}

// ADD I, Vx
const fadd = () => {
  const x = (opcode & 0x0f00) >> 8
  I += V[x]
}

// LD F, Vx
const fld = todo

// LD B, Vx

// LD [I], Vx

// LD Vx, [I]

const opTable = [
  xzero, jp,  call, se,  sne, se2, ld, add,
  xaret, sne2, ld2, jp2, rnd, drw, xkey, xfff
]

const xzero = () => {
  const op = zeroOpTable[opcode]
  op && op() // ignore SYS (0x0NNN)
}

const zeroOpTable = {
  0x00e0: cls
  0x00ee: ret
}

const xaret = () => {
  const op = arethmicOpTable[opcode & 0x000f]
  op()
}

const arethmicOpTable = [
  ld2, or, and, xor, add2, sub, shr,
  subn, nop, nop, nop, nop, shl, nop
]

const xkey = () => {
  const a = opcode & 0x00ff
  if (a === 0x009e)
    skp()
  else if (a === 0x00a1)
    sknp()
}

const xfff = () => {
  const op = fOpTable[opcode & 0x00ff]
  op && op()
}

const fOpTable = {
  0x07: lddt,
  0x0a: todo,
  0x15: lddt2,
  0x18: ldst,
  0x1e: fadd,
  0x29: todo,
  0x33: todo,
  0x55: todo,
  0x65: todo
}
