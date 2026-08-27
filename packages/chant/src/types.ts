export interface ChantConfig {
  /** Number of filtered noise oscillators. */
  oscillatorCount: number
  /** Root MIDI note number (60 = middle C). */
  baseNote: number
  /** Scale degrees relative to baseNote. */
  scale: number[]
  /** Master gain, 0–1. */
  gain: number
  /** Bandpass filter Q value. Higher values produce narrower, more resonant tones. */
  filterQ: number
  /** Half-extent of the 3D panner cube in each axis. */
  pannerRange: number
  /** Milliseconds between panner drift ticks. */
  pannerDriftInterval: number
  /** Maximum position change per drift tick in each axis. */
  pannerDriftAmount: number
  /** Seed for deterministic replay. When omitted, Math.random is used. */
  seed?: number
}

export interface ChantPreset {
  readonly name: string
  readonly description: string
  readonly config: ChantConfig
}
