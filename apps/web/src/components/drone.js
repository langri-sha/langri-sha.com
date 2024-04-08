// @flow
import * as React from 'react'

export class Drone extends React.PureComponent<{}> {
  processor: Processor = new Processor()

  componentDidMount() {
    this.processor.generate()
  }

  componentWillUnmount() {
    this.processor.destroy()
  }

  render(): null {
    return null
  }
}

/**
 * Adopted from @mattdiamond's JS drone project.
 * @see http://matt-diamond.com/drone.html
 */
class Processor {
  oscilatorsSize: number

  baseNote: number

  context: AudioContext

  gainNode: GainNode

  bufferSize: number = 4096

  scale: number[] = [0, 2, 4, 6, 7, 9, 11, 12, 14]

  noiseNodes: ScriptProcessorNode[] = []

  panIntervals: IntervalID[] = []

  constructor(oscilatorsSize: number = 40, baseNote: number = 60) {
    const context = new AudioContext()
    this.context = context

    const gainNode = context.createGain()
    gainNode.gain.value = 0.25
    gainNode.connect(context.destination)
    this.gainNode = gainNode

    this.oscilatorsSize = oscilatorsSize
    this.baseNote = baseNote
  }

  generate() {
    for (let i = 0; i < this.oscilatorsSize; i++) {
      const degree = Math.floor(Math.random() * this.scale.length)
      let frequency = mtof(this.baseNote + this.scale[degree])
      frequency += Math.random() * 4 - 2
      this.createNoiseGenerator(frequency)
    }
  }

  createNoiseGenerator(frequency: number) {
    const pannerNode = this.context.createPanner()
    const min = -20
    const max = 20
    let x = rand(min, max)
    let y = rand(min, max)
    let z = rand(min, max)

    pannerNode.setPosition(x, y, z)
    pannerNode.connect(this.gainNode)

    const filter = this.context.createBiquadFilter()
    filter.frequency.value = frequency
    filter.Q.value = 50
    filter.connect(pannerNode)

    const noiseSource = this.context.createScriptProcessor(
      this.bufferSize,
      1,
      2
    )
    noiseSource.onaudioprocess = (e) => {
      const bufferL = e.outputBuffer.getChannelData(0)
      const bufferR = e.outputBuffer.getChannelData(1)
      for (let i = 0; i < this.bufferSize; i++) {
        const noise = Math.random() * 2 - 1
        bufferR[i] = noise
        bufferL[i] = noise
      }
    }

    noiseSource.connect(filter)
    this.noiseNodes.push(noiseSource)

    this.panIntervals.push(
      setInterval(() => {
        x += rand(-0.1, 0.1)
        y += rand(-0.1, 0.1)
        z += rand(-0.1, 0.1)
        pannerNode.setPosition(x, y, z)
      }, 500)
    )
  }

  destroy() {
    this.panIntervals.map(window.clearInterval)
  }
}

function mtof(m) {
  return 2 ** ((m - 69) / 12) * 440
}

function rand(min, max) {
  return Math.random() * (max - min) + min
}
