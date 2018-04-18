function initScreen(canvas) {
  const width = 64
  const height = 32

  const bgColor = 0xFFC4C6B6
  const fgColor = 0xFF252822
  const palette = [bgColor, fgColor]

  const ctx = canvas.getContext('2d')

  canvas.width = width
  canvas.height = height

  const imageData = new ImageData(width, height)
  const buff = new Uint32Array(imageData.data.buffer)

  const renderScreen = gfx => {
   const len = gfx.length
   for (let i = 0; i < len; i++) {
     buff[i] = palette[gfx[i]]
   }
    ctx.putImageData(imageData, 0, 0)
  }

  renderScreen([])

  return renderScreen
}
