'use client'
import {
  CHANT,
  CHARACTER,
  Voice,
  type VoiceBuffers,
  prepareVoiceBuffers,
} from '@langri-sha/voice'
import * as React from 'react'

import noiseProcessorSource from './noise-processor.worklet'

let voicePlayed = false

/* Most output devices run at 48 kHz; a context at another rate re-renders. */
const PRELOAD_SAMPLE_RATE = 48000

let preloadedVoiceBuffers: Promise<VoiceBuffers> | null = null

/**
 * Render the voice's buffers once the page has loaded, so the first play
 * doesn't wait on them. Each render is used at most once.
 */
export const preloadDrone = () => {
  if (!window.AudioContext || voicePlayed) {
    return
  }

  const preload = () => {
    preloadedVoiceBuffers ??= prepareVoiceBuffers(PRELOAD_SAMPLE_RATE)
  }

  if (document.readyState === 'complete') {
    preload()
    return
  }

  window.addEventListener('load', preload, { once: true })
  return () => window.removeEventListener('load', preload)
}

const takeVoiceBuffers = async (sampleRate: number) => {
  const preloaded = preloadedVoiceBuffers
  preloadedVoiceBuffers = null

  const buffers = await (preloaded ?? prepareVoiceBuffers(sampleRate))
  return buffers.sampleRate === sampleRate
    ? buffers
    : prepareVoiceBuffers(sampleRate)
}

export interface DroneProps {
  audioLevelRef: React.MutableRefObject<number>
}

export const Drone: React.FC<DroneProps> = ({ audioLevelRef }) => {
  React.useEffect(() => {
    if (!window.AudioContext) {
      return
    }

    const processor = new Processor(audioLevelRef)

    processor.generate().catch(() => {
      // AudioWorklet failed to load (e.g. unsupported browser); nothing to play.
    })

    return () => {
      processor.destroy()
    }
  }, [audioLevelRef])

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
  droneBus: GainNode
  voice: Voice | null = null
  analyserNode: AnalyserNode
  audioLevelRef: React.MutableRefObject<number>
  frequencyData: Uint8Array<ArrayBuffer>
  scale: number[] = [0, 2, 4, 6, 7, 9, 11, 12, 14]
  noiseNodes: AudioWorkletNode[] = []
  pannerNodes: PannerNode[] = []
  panIntervals: Array<number | NodeJS.Timeout> = []
  destroyed = false
  removeResumeListeners: (() => void) | null = null
  meterFrame = 0

  constructor(
    audioLevelRef: React.MutableRefObject<number>,
    oscilatorsSize: number = 40,
    baseNote: number = 60,
  ) {
    const context = new AudioContext()
    this.context = context
    this.audioLevelRef = audioLevelRef

    const gainNode = context.createGain()
    gainNode.gain.value = 1
    const analyserNode = context.createAnalyser()
    analyserNode.fftSize = 256
    analyserNode.smoothingTimeConstant = 0.78
    const limiter = context.createDynamicsCompressor()
    limiter.threshold.value = -1
    limiter.knee.value = 0
    limiter.ratio.value = 20
    limiter.attack.value = 0.003
    limiter.release.value = 0.25

    gainNode.connect(analyserNode)
    analyserNode.connect(limiter)
    limiter.connect(context.destination)
    this.gainNode = gainNode
    this.analyserNode = analyserNode
    this.frequencyData = new Uint8Array(analyserNode.frequencyBinCount)

    const droneBus = context.createGain()
    droneBus.gain.value = voicePlayed ? 0.25 : 0.0001
    droneBus.connect(gainNode)
    this.droneBus = droneBus

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
    const voiceBuffers = voicePlayed
      ? null
      : takeVoiceBuffers(this.context.sampleRate)

    await this.context.resume()
    await nextFrame()

    if (this.destroyed) {
      return
    }

    if (voiceBuffers) {
      const buffers = await voiceBuffers

      if (this.destroyed) {
        return
      }

      voicePlayed = true
      this.voice = new Voice(
        this.context,
        this.gainNode,
        CHANT,
        CHARACTER,
        buffers,
      )
      const start = this.context.currentTime + 0.05
      this.voice.start(start)
      this.droneBus.gain.setTargetAtTime(
        0.25,
        start + this.voice.handoffAt,
        1.8,
      )
    }

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

    this.measureAudio()
  }

  measureAudio = () => {
    if (this.destroyed) {
      return
    }

    this.analyserNode.getByteFrequencyData(this.frequencyData)

    // Weight the lower bins: the drone's fundamental motion is more useful as
    // a visual pulse than the fine hiss in the upper frequencies.
    let energy = 0
    const bins = 20
    for (let i = 1; i <= bins; i++) {
      energy += this.frequencyData[i]
    }

    const target = Math.min(1, (energy / bins / 255) * 4.5)
    this.audioLevelRef.current += (target - this.audioLevelRef.current) * 0.18
    this.meterFrame = requestAnimationFrame(this.measureAudio)
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
    pannerNode.connect(this.droneBus)

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
    cancelAnimationFrame(this.meterFrame)
    this.audioLevelRef.current = 0

    this.removeResumeListeners?.()
    this.voice?.dispose()
    this.panIntervals.forEach((interval) => clearInterval(interval))
    this.noiseNodes.forEach((node) => node.disconnect())
    this.pannerNodes.forEach((node) => node.disconnect())
    this.droneBus.disconnect()
    this.gainNode.disconnect()
    this.analyserNode.disconnect()
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

/**
 * `resume()` settles as a microtask when the context is already running, so
 * without this the graph is built inside the click task, before the toggle's
 * pressed state paints.
 */
const nextFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 0)
    })
  })

const mtof = (m: number) => 2 ** ((m - 69) / 12) * 440
const rand = (min: number, max: number) => Math.random() * (max - min) + min
