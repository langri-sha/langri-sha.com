'use client'
import * as React from 'react'

export const Drone: React.FC<Record<string, never>> = () => {
  React.useEffect(() => {
    if (!window.AudioContext) {
      return
    }

    const processor = new Processor()

    processor.generate().catch(() => {
      // AudioWorklet failed to load (e.g. unsupported browser); nothing to play.
    })

    return () => {
      processor.destroy()
    }
  }, [])

  return null
}

/**
 * Adopted from @mattdiamond's JS drone project.
 * @preserve
 * @see http://matt-diamond.com/drone.html
 */
class Processor {
  oscilatorsSize: number
  baseNote: number
  context: AudioContext
  gainNode: GainNode
  scale: number[] = [0, 2, 4, 6, 7, 9, 11, 12, 14]
  noiseNodes: AudioWorkletNode[] = []
  pannerNodes: PannerNode[] = []
  panIntervals: Array<number | NodeJS.Timeout> = []
  destroyed = false
  removeResumeListeners: (() => void) | null = null

  constructor(oscilatorsSize: number = 40, baseNote: number = 60) {
    const context = new AudioContext()
    this.context = context

    const gainNode = context.createGain()
    gainNode.gain.value = 0.25
    gainNode.connect(context.destination)
    this.gainNode = gainNode

    this.oscilatorsSize = oscilatorsSize
    this.baseNote = baseNote

    this.attachResumeListeners()
  }

  attachResumeListeners() {
    if (this.context.state !== 'suspended') {
      return
    }

    const resume = () => {
      this.context.resume()
    }

    window.addEventListener('pointerdown', resume, { once: true })
    window.addEventListener('keydown', resume, { once: true })

    this.removeResumeListeners = () => {
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('keydown', resume)
    }
  }

  async generate() {
    const workletUrl = URL.createObjectURL(
      new Blob([noiseProcessorSource], { type: 'text/javascript' }),
    )

    try {
      await this.context.audioWorklet.addModule(workletUrl)
    } finally {
      URL.revokeObjectURL(workletUrl)
    }

    if (this.destroyed) {
      return
    }

    for (let i = 0; i < this.oscilatorsSize; i++) {
      const degree = Math.floor(Math.random() * this.scale.length)
      let frequency = mtof(this.baseNote + this.scale[degree])
      frequency += Math.random() * 4 - 2
      this.createNoiseGenerator(frequency)
    }
  }

  createNoiseGenerator(frequency: number) {
    if (this.destroyed) {
      return
    }

    const pannerNode = this.context.createPanner()
    const min = -20
    const max = 20
    let x = rand(min, max)
    let y = rand(min, max)
    let z = rand(min, max)

    setPannerPosition(pannerNode, x, y, z)
    pannerNode.connect(this.gainNode)

    const filter = this.context.createBiquadFilter()
    filter.frequency.value = frequency
    filter.Q.value = 50
    filter.connect(pannerNode)

    const noiseSource = new AudioWorkletNode(this.context, 'noise-processor', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    })

    noiseSource.connect(filter)
    this.noiseNodes.push(noiseSource)
    this.pannerNodes.push(pannerNode)

    this.panIntervals.push(
      setInterval(() => {
        x += rand(-0.1, 0.1)
        y += rand(-0.1, 0.1)
        z += rand(-0.1, 0.1)
        setPannerPosition(pannerNode, x, y, z)
      }, 500),
    )
  }

  destroy() {
    this.destroyed = true

    this.removeResumeListeners?.()
    this.panIntervals.forEach((interval) => clearInterval(interval))
    this.noiseNodes.forEach((node) => node.disconnect())
    this.pannerNodes.forEach((node) => node.disconnect())
    this.gainNode.disconnect()
    this.context.close()
  }
}

const setPannerPosition = (
  panner: PannerNode,
  x: number,
  y: number,
  z: number,
) => {
  if (panner.positionX) {
    panner.positionX.value = x
    panner.positionY.value = y
    panner.positionZ.value = z
  } else {
    panner.setPosition(x, y, z)
  }
}

const mtof = (m: number) => 2 ** ((m - 69) / 12) * 440
const rand = (min: number, max: number) => Math.random() * (max - min) + min

/**
 * White-noise generator, run off the main thread via AudioWorklet.
 * Loaded from a blob URL built from this inline source so it needs no
 * separate static asset or build-pipeline wiring.
 */
const noiseProcessorSource = `
class NoiseProcessor extends AudioWorkletProcessor {
  process(_inputs, outputs) {
    const output = outputs[0]
    const frames = output[0]?.length ?? 0
    for (let i = 0; i < frames; i++) {
      const sample = Math.random() * 2 - 1
      for (let channel = 0; channel < output.length; channel++) {
        output[channel][i] = sample
      }
    }
    return true
  }
}

registerProcessor('noise-processor', NoiseProcessor)
`
