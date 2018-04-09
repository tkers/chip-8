function initInput(handlePress, handleRelease) {

  const getKeyIndex = event => parseInt(event.key, 16)
  const isValidKeyIndex = index => !isNaN(index) && index >= 0 && index <= 16

  document.addEventListener('keydown', event => {
    const index = getKeyIndex(event)
    isValidKeyIndex(index) && handlePress && handlePress(index)
  })
  document.addEventListener('keyup', event => {
    const index = getKeyIndex(event)
    isValidKeyIndex(index) && handleRelease && handleRelease(index)
  })
}
