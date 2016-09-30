/* global AudioContext */

export default class Drone {
  bufferSize = 4096
  scale = [0.0, 2.0, 4.0, 6.0, 7.0, 9.0, 11.0, 12.0, 14.0]
  noiseNodes = []

  constructor (oscilatorsSize = 5, baseNote = 60) {
    const context = this.context = new AudioContext()

    this.oscilatorsSize = oscilatorsSize
    this.baseNote = baseNote

    const gainNode = this.gainNode = context.createGain()
    gainNode.gain.value = 0.25
    gainNode.connect(context.destination)
  }

  generate () {
    for (let i = 0; i < this.oscilatorsSize; i++) {
      const degree = Math.floor(Math.random() * this.scale.length)
      let frequency = mtof(this.baseNote + this.scale[degree])
      frequency += Math.random() * 4 - 2
      this.createNoiseGenerator(frequency)
    }
  }

  createNoiseGenerator (frequency) {
    const pannerNode = this.context.createPanner()
    const min = -20
    const max = 20
    let x = rand(min, max)
    let y = rand(min, max)
    let z = rand(min, max)

    pannerNode.setPosition(x, y, z)
    pannerNode.connect(this.gainNode)

    const filter = this.context.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = frequency
    filter.Q.value = 50
    filter.connect(pannerNode)

    const noiseSource = this.context.createScriptProcessor(this.bufferSize, 1, 2)
    noiseSource.onaudioprocess = (e) => {
      const bufferL = e.outputBuffer.getChannelData(0)
      const bufferR = e.outputBuffer.getChannelData(1)
      for (let i = 0; i < this.bufferSize; i++) {
        bufferL[i] = bufferR[i] = Math.random() * 2 - 1
      }
    }

    noiseSource.connect(filter)
    this.noiseNodes.push(noiseSource)

    setInterval(() => {
      x += rand(-0.1, 0.1)
      y += rand(-0.1, 0.1)
      z += rand(-0.1, 0.1)
      pannerNode.setPosition(x, y, z)
    }, 500)
  }
}

function mtof (m) {
  return (2 ** ((m - 69) / 12)) * 440
}

function rand (min, max) {
  return Math.random() * (max - min) + min
}
