function initScreen(canvas) {
  const width = 64
  const height = 32
  const cellSize = 10
  const bgColor = '#B6C6C4'
  const fgColor = '#222825'

  const ctx = canvas.getContext('2d')

  canvas.width = width * cellSize
  canvas.height = height * cellSize

  const renderScreen = gfx => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pix = gfx[x + width * y]
        ctx.fillStyle = pix ? fgColor : bgColor
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }

  renderScreen([])

  return renderScreen
}
