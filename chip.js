// current opcode (2 bytes)
let opcode = 0x0000

// memory (4096 bytes)
// 0x000 ... 0x1FF: interpreter
// 0x050 ... 0x0A0: font set
// 0x200 ... 0xFFF: program ROM and work RAM
let memory = Array(4096).fill(0x00)

// CPU registers (V0..V15 - 1 byte each)
let V = Array(16).fill(0x00)

// index register
let I = 0x200 // @TODO sometimes breaks at 0x000

// program counter
let pc = 0x200

// stack and stack pointer
let stack = Array(16).fill(0x000)
let sp = 0x0

// draw flag indicates when redraw needs to happen
let drawFlag = 0x0

// timer registers (60 Hz)
let DT = 0x00
let ST = 0x00

// @TODO extract display logic elsewhere
let gfx = Array(64 * 32).fill(0x0)

// @TODO extract input logic elsewhere
let keys = Array(16).fill(0x0)

const setKeyPressed = x => {
  keys[x] = 0x1
}

const setKeyReleased = x => {
  keys[x] = 0x0
}

// load data into the memory
const load = (data, offset = 0x0) => {
  const len = data.length
  for (let i = 0; i < len; i++) {
    memory[offset + i] = data[i]
  }
}

const MEM_OFFSET_BIOS = 0x0
const MEM_OFFSET_FONT = 0x050
const MEM_OFFSET_ROM = 0x200

// helper load functions with preset offsets
const loadRom = rom => load(rom, MEM_OFFSET_ROM)
const loadFont = font => load(font, MEM_OFFSET_FONT)
const loadBios = data => load(data, MEM_OFFSET_BIOS)

loadFont([
  0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
  0x20, 0x60, 0x20, 0x20, 0x70, // 1
  0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
  0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
  0x90, 0x90, 0xF0, 0x10, 0x10, // 4
  0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
  0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
  0xF0, 0x10, 0x20, 0x40, 0x40, // 7
  0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
  0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
  0xF0, 0x90, 0xF0, 0x90, 0x90, // A
  0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
  0xF0, 0x80, 0x80, 0x80, 0xF0, // C
  0xE0, 0x90, 0x90, 0x90, 0xE0, // D
  0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
  0xF0, 0x80, 0xF0, 0x80, 0x80  // F
])

// run 1 cycle
const cycle = (drawCb, audioCb) => {

  const prevPc = pc

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
    if (ST === 0) {
      audioCb && audioCb()
    }
  }

  if (drawFlag) {
    drawCb && drawCb(gfx)
    drawFlag = 0x0
  }

  // console.log(`${pc}: 0x${opcode.toString(16)}`)
  if (pc === prevPc)
    throw new Error(`Infinite loop: Stuck at instruction ${pc} (opcode 0x${opcode.toString(16)})`)
}

// operation definitions

const nop = () => {}

const todo = (msg) => {
  throw new Error(`Not implemented: opcode 0x${opcode.toString(16)}${msg ? ` (${msg})` : ''}`)
}

// CLS
const cls = () => {
  for (let i = 0; i < 64 * 32; i++)
    gfx[i] = 0x0
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
  if (V[x] === V[y])
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
const or = () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  V[x] |= V[y]
}

// AND Vx, Vy
const and = () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  V[x] &= V[y]
}

// XOR Vx, Vy
const xor = () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  V[x] ^= V[y]
}

// ADD Vx, Vy
const add2 = () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  V[x] += V[y]
  V[0xf] = V[x] > 255 ? 1 : 0
}

// SUB Vx, Vy
const sub = () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  V[0xf] = V[x] > V[y] ? 1 : 0
  V[x] -= V[y]
}

// SHR Vx {, Vy}
const shr = () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  V[0xf] = V[x] % 2
  V[x] = Math.floor(V[x] / 2)
}

// SUBN Vx, Vy
const subn = () => {
  const x = (opcode & 0x0f00) >> 8
  const y = (opcode & 0x00f0) >> 4
  V[0xf] = V[y] > V[x] ? 1 : 0
  V[x] -= V[y]
}

// SHL Vx {, Vy}
const shl = () => {
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
const ld3 = () => {
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

// LD Vx, K
const kld = () => {
  const x = (opcode & 0x0f00) >> 8
  // WAIT FOR KEYPRESS + STORE VALUE in Vx
  todo('Wait for keypress')
}

// LD F, Vx
const fld = () => {
  const x = (opcode & 0x0f00) >> 8
  I = MEM_OFFSET_FONT + V[x] * 5
}

// LD B, Vx
const bld = () => {
  const x = (opcode & 0x0f00) >> 8
  memory[I] = Math.floor(V[x] / 100)
  memory[I + 1] = Math.floor((V[x] / 10) % 10)
  memory[I + 2] = Math.floor((V[x] % 100) % 10)
}

// LD [I], Vx
const ild = () => {
  const x = (opcode & 0x0f00) >> 8
  for (let i = 0; i <= x; i++)
    memory[I + i] = V[i]
}

// LD Vx, [I]
const ild2 = () => {
  const x = (opcode & 0x0f00) >> 8
  for (let i = 0; i <= x; i++)
    V[i] = memory[I + i]
}

const xzero = () => {
  const op = zeroOpTable[opcode]
  op ? op() : todo() // ignore SYS (0x0NNN)
}

const zeroOpTable = {
  0x0000: nop,
  0x00e0: cls,
  0x00ee: ret
}

const xaret = () => {
  const op = arethmicOpTable[opcode & 0x000f]
  op ? op() : todo()
}

const arethmicOpTable = [
  ld2, or, and, xor, add2, sub, shr, subn,
  nop, nop, nop, nop, nop, nop, shl, nop
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
  op ? op() : todo()
}

const fOpTable = {
  0x07: lddt,
  0x0a: kld,
  0x15: lddt2,
  0x18: ldst,
  0x1e: fadd,
  0x29: fld,
  0x33: bld,
  0x55: ild,
  0x65: ild2
}

const opTable = [
  xzero, jp,  call, se,  sne, se2, ld, add,
  xaret, sne2, ld3, jp2, rnd, drw, xkey, xfff
]
