function initAudio() {
  const audioCtx = window.AudioContext && new AudioContext || window.webkitAudioContext && new webkitAudioContext

  return function buzz() {
    if (!audioCtx) {
      return
    }
    const osc = audioCtx.createOscillator()
    osc.connect(audioCtx.destination)
    osc.type = "triangle"
    osc.start()
    setTimeout(() => osc.stop(), 100)
  }
}
