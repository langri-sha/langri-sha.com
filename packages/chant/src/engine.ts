import { createPrng, seededRand } from './prng.js'
import type { ChantConfig } from './types.js'
import { NOISE_PROCESSOR_SOURCE } from './worklet.js'

const mtof = (m: number) => 2 ** ((m - 69) / 12) * 440

interface NoiseVoice {
  noise: AudioWorkletNode
  filter: BiquadFilterNode
  panner: PannerNode
  interval: ReturnType<typeof setInterval>
}

export class ChantEngine {
  private config: ChantConfig
  private context: AudioContext | null = null
  private gainNode: GainNode | null = null
  private voices: NoiseVoice[] = []
  private random: () => number
  private running = false
  private removeResumeListeners: (() => void) | null = null

  constructor(config: ChantConfig) {
    this.config = { ...config }
    this.random = config.seed != null ? createPrng(config.seed) : Math.random
  }

  get isRunning(): boolean {
    return this.running
  }

  get currentConfig(): Readonly<ChantConfig> {
    return this.config
  }

  async start(): Promise<void> {
    if (this.running) return
    this.running = true

    const context = new AudioContext()
    this.context = context

    const gainNode = context.createGain()
    gainNode.gain.value = this.config.gain
    gainNode.connect(context.destination)
    this.gainNode = gainNode

    this.attachResumeListeners()

    const workletUrl = URL.createObjectURL(
      new Blob([NOISE_PROCESSOR_SOURCE], { type: 'text/javascript' }),
    )

    try {
      await context.audioWorklet.addModule(workletUrl)
    } finally {
      URL.revokeObjectURL(workletUrl)
    }

    if (!this.running) return

    const {
      oscillatorCount,
      baseNote,
      scale,
      filterQ,
      pannerRange,
      pannerDriftInterval,
      pannerDriftAmount,
    } = this.config

    for (let i = 0; i < oscillatorCount; i++) {
      const degree = Math.floor(this.random() * scale.length)
      let frequency = mtof(baseNote + scale[degree])
      frequency += this.random() * 4 - 2

      this.createVoice(
        context,
        gainNode,
        frequency,
        filterQ,
        pannerRange,
        pannerDriftInterval,
        pannerDriftAmount,
      )
    }
  }

  stop(): void {
    if (!this.running) return
    this.running = false

    this.removeResumeListeners?.()
    this.removeResumeListeners = null

    for (const voice of this.voices) {
      clearInterval(voice.interval)
      voice.noise.disconnect()
      voice.filter.disconnect()
      voice.panner.disconnect()
    }
    this.voices = []

    this.gainNode?.disconnect()
    this.gainNode = null

    this.context?.close()
    this.context = null
  }

  setGain(value: number): void {
    this.config.gain = value
    if (this.gainNode) {
      this.gainNode.gain.value = value
    }
  }

  private attachResumeListeners(): void {
    if (!this.context || this.context.state !== 'suspended') return

    const resume = () => {
      this.context?.resume()
    }

    window.addEventListener('pointerdown', resume, { once: true })
    window.addEventListener('keydown', resume, { once: true })

    this.removeResumeListeners = () => {
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('keydown', resume)
    }
  }

  private createVoice(
    context: AudioContext,
    destination: AudioNode,
    frequency: number,
    filterQ: number,
    pannerRange: number,
    driftInterval: number,
    driftAmount: number,
  ): void {
    const panner = context.createPanner()
    let x = seededRand(this.random, -pannerRange, pannerRange)
    let y = seededRand(this.random, -pannerRange, pannerRange)
    let z = seededRand(this.random, -pannerRange, pannerRange)
    setPannerPosition(panner, x, y, z)
    panner.connect(destination)

    const filter = context.createBiquadFilter()
    filter.frequency.value = frequency
    filter.Q.value = filterQ
    filter.connect(panner)

    const noise = new AudioWorkletNode(context, 'noise-processor', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    })
    noise.connect(filter)

    const interval = setInterval(() => {
      x += seededRand(this.random, -driftAmount, driftAmount)
      y += seededRand(this.random, -driftAmount, driftAmount)
      z += seededRand(this.random, -driftAmount, driftAmount)
      setPannerPosition(panner, x, y, z)
    }, driftInterval)

    this.voices.push({ noise, filter, panner, interval })
  }
}

function setPannerPosition(
  panner: PannerNode,
  x: number,
  y: number,
  z: number,
): void {
  if (panner.positionX) {
    panner.positionX.value = x
    panner.positionY.value = y
    panner.positionZ.value = z
  } else {
    panner.setPosition(x, y, z)
  }
}
