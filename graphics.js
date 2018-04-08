function initScreen(canvas) {
  const width = 64
  const height = 32
  const cellSize = 10
  const bgColor = '#ccc'
  const fgColor = '#a00'

  const ctx = canvas.getContext('2d')

  canvas.width = width * cellSize
  canvas.height = height * cellSize

  return function renderScreen(gfx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pix = gfx[x + width * y]
        ctx.fillStyle = [bgColor, fgColor][pix]
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }
}
