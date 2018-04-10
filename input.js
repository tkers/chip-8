function initInput(handlePress, handleRelease) {

  /*
    1 2 3 C
    4 5 6 D
    7 8 9 E
    A 0 B F
  */
  const keyMap = {
    '1': 0x1, '2': 0x2, '3': 0x3, '4': 0xc,
    'q': 0x4, 'w': 0x5, 'e': 0x6, 'r': 0xd,
    'a': 0x7, 's': 0x8, 'd': 0x9, 'f': 0xe,
    'z': 0xa, 'x': 0x0, 'c': 0xb, 'v': 0xf
  }

  const getKeyIndex = event => keyMap[event.key]
  const isValidKeyIndex = index => typeof index !== 'undefined'

  document.addEventListener('keydown', event => {
    const index = getKeyIndex(event)
    isValidKeyIndex(index) && handlePress && handlePress(index)
  })
  document.addEventListener('keyup', event => {
    const index = getKeyIndex(event)
    isValidKeyIndex(index) && handleRelease && handleRelease(index)
  })
}
