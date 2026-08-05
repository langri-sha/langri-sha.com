/**
 * A fully synthesised invocation that opens the first listen: a deep,
 * guttural, kargyraa-style throat-sung chant over a faint sub pedal, with the
 * drone rising out of its reverb tail.
 *
 * The voice is a small Klatt-style formant synthesiser: a subharmonic
 * sawtooth pair — the octave-split growl of kargyraa — driven through
 * parallel formant filters that walk a syllable table. The chant is a
 * wordless vocalise: long held vowels whose slow formant sweeps ring the
 * source's overtones, the mouth-shaping gesture of khöömei. It means
 * nothing, in no language. Everything is synthesised at runtime; nothing is
 * sampled and no recording or score is reproduced.
 */

interface Syllable {
  /** Seconds the syllable holds. */
  dur: number
  /** Formant targets F1–F3, in Hz, scaled for a cavernous male tract. */
  f: [number, number, number]
  /** Formants drift here across the syllable — the overtone sweep. */
  to?: [number, number, number]
  /** Voiced-source level, 0–1. */
  voice: number
  /** Noise frication, as [centre Hz, level], for breathy onsets. */
  fric?: [number, number]
  /** Silent glottal closure before the syllable. */
  gap?: number
  /** Pitch target the syllable slides to, for the final dive. */
  dive?: number
}

interface Breath {
  /** Silence before the breath group. */
  pause: number
  /** Fundamental at the group's onset, in Hz. */
  pitch: number
  syllables: Syllable[]
}

/* Three breath groups of invented syllables, roughly "khöö-ga-mm,
 * oo–ee–oo, haa": open-vowel formant colours, breathy onsets, one glottal
 * catch, and long sweeps that carry the overtone gesture. */
const CHANT: Breath[] = [
  {
    pause: 0,
    pitch: 60,
    syllables: [
      { dur: 0.18, f: [450, 1100, 2300], voice: 0.3, fric: [1100, 0.05] },
      { dur: 1.2, f: [430, 950, 2250], to: [480, 1500, 2400], voice: 1 },
      { dur: 0.5, f: [680, 1030, 2300], voice: 1, gap: 0.05 },
      { dur: 0.4, f: [250, 900, 2200], voice: 0.55 },
    ],
  },
  {
    pause: 0.3,
    pitch: 56,
    syllables: [
      { dur: 1.5, f: [320, 700, 2100], to: [300, 1900, 2500], voice: 1.05 },
      { dur: 0.4, f: [300, 1900, 2500], to: [340, 850, 2100], voice: 0.9 },
    ],
  },
  {
    pause: 0.45,
    pitch: 54,
    syllables: [
      { dur: 0.15, f: [500, 1200, 2300], voice: 0.25, fric: [1200, 0.05] },
      {
        dur: 1.5,
        f: [640, 1000, 2150],
        to: [520, 800, 2050],
        voice: 1.15,
        dive: 42,
      },
    ],
  },
]

const chantDuration = CHANT.reduce(
  (total, breath) =>
    total +
    breath.pause +
    breath.syllables.reduce((sum, s) => sum + s.dur + (s.gap ?? 0), 0),
  0,
)

/* Timeline, in seconds relative to start(). The drone begins rising under
 * the final dive so the handoff is a crossfade, not a lull. */
const VOICE_START = 0.2
const VOICE_END = VOICE_START + chantDuration
const DRONE_ENTRY = VOICE_END - 1.5
const TAIL_END = VOICE_END + 7

export class Invocation {
  /** Offset after start() at which the drone should begin fading in. */
  static readonly droneEntry = DRONE_ENTRY

  context: AudioContext
  dryBus: GainNode
  wetBus: GainNode
  nodes: AudioNode[] = []
  noiseData: AudioBuffer
  disposeTimer: ReturnType<typeof setTimeout> | null = null
  started = false
  disposed = false

  constructor(context: AudioContext, destination: AudioNode) {
    this.context = context
    this.noiseData = this.createNoiseBuffer()

    this.dryBus = this.gain(1)
    this.dryBus.connect(destination)

    const convolver = this.own(context.createConvolver())
    convolver.buffer = this.createImpulseResponse()
    const wetOut = this.gain(0.85)
    convolver.connect(wetOut)
    wetOut.connect(destination)

    this.wetBus = this.gain(1)
    this.wetBus.connect(convolver)
  }

  start(when: number) {
    if (this.started || this.disposed) {
      return
    }
    this.started = true

    this.sub(when)
    this.voice(when)

    this.disposeTimer = setTimeout(
      () => this.dispose(),
      (when - this.context.currentTime + TAIL_END) * 1000,
    )
  }

  dispose() {
    if (this.disposed) {
      return
    }
    this.disposed = true

    if (this.disposeTimer !== null) {
      clearTimeout(this.disposeTimer)
      this.disposeTimer = null
    }

    // Every source has a scheduled stop, so disconnecting the graph both
    // silences an interrupted invocation and frees a finished one.
    this.nodes.forEach((node) => node.disconnect())
  }

  /** A faint pedal on C1 and C2 that ties the voice into the drone's key. */
  private sub(when: number) {
    const stop = when + TAIL_END - 2

    const drive = this.gain(0.55)
    this.oscillator(32.7, when, stop).connect(drive)
    const octave = this.gain(0.45)
    this.oscillator(65.4, when, stop).connect(octave)
    octave.connect(drive)

    const shaper = this.own(this.context.createWaveShaper())
    shaper.curve = saturationCurve(2.5)
    const lowpass = this.filter('lowpass', 120, 0.6)
    const level = this.gain(0)
    drive.connect(shaper)
    shaper.connect(lowpass)
    lowpass.connect(level)
    this.send(level, 1, 0.25)

    const wobble = this.oscillator(0.11, when, stop)
    const wobbleDepth = this.gain(0)
    wobble.connect(wobbleDepth)
    wobbleDepth.connect(level.gain)
    wobbleDepth.gain.setTargetAtTime(0.02, when + 2, 1.5)

    level.gain.setValueAtTime(0, when)
    level.gain.setTargetAtTime(0.09, when + 0.15, 0.9)
    // The deep answers the last word.
    level.gain.setTargetAtTime(0.13, when + VOICE_END - 1, 0.7)
    level.gain.setTargetAtTime(0.0001, when + DRONE_ENTRY + 1.2, 1)
  }

  /** The throat-sung voice: subharmonic saws through morphing formants. */
  private voice(when: number) {
    const stop = when + VOICE_END + 1

    // The glottal source and its undertone an octave below — the periodic
    // doubling that gives kargyraa its growl. Both ride the same formants.
    const glottis = this.oscillator(64, when, stop, 'sawtooth')
    const undertone = this.oscillator(32.1, when, stop, 'sawtooth')
    const undertoneLevel = this.gain(0.7)
    undertone.connect(undertoneLevel)

    const drive = this.gain(0.5)
    glottis.connect(drive)
    undertoneLevel.connect(drive)

    // A slow random wobble on the pitch keeps the voice organic.
    const jitter = this.noise(when, stop)
    const jitterFilter = this.filter('lowpass', 6, 0.7)
    jitter.connect(jitterFilter)
    const glottisJitter = this.gain(2.5)
    jitterFilter.connect(glottisJitter)
    glottisJitter.connect(glottis.frequency)
    const undertoneJitter = this.gain(1.3)
    jitterFilter.connect(undertoneJitter)
    undertoneJitter.connect(undertone.frequency)

    const shaper = this.own(this.context.createWaveShaper())
    shaper.curve = saturationCurve(2.2)
    drive.connect(shaper)

    const voiced = this.gain(0)
    shaper.connect(voiced)

    const aspiration = this.noise(when, stop)
    const aspirationFilter = this.filter('bandpass', 1400, 0.6)
    aspiration.connect(aspirationFilter)
    const aspirationLevel = this.gain(0)
    aspirationFilter.connect(aspirationLevel)

    const tract = this.gain(1)
    voiced.connect(tract)
    aspirationLevel.connect(tract)

    const voiceBus = this.gain(1)
    const weights = [1, 0.62, 0.3, 0.16]
    const qs = [9, 11, 13, 13]
    const formants = weights.map((weight, i) => {
      const formant = this.filter('bandpass', [500, 1500, 2500, 2900][i], qs[i])
      const level = this.gain(weight)
      tract.connect(formant)
      formant.connect(level)
      level.connect(voiceBus)
      return formant
    })

    const frication = this.noise(when, stop)
    const fricationFilter = this.filter('bandpass', 4000, 1.4)
    frication.connect(fricationFilter)
    const fricationLevel = this.gain(0)
    fricationFilter.connect(fricationLevel)
    fricationLevel.connect(voiceBus)

    // An old, dark voice: everything above the third formant falls away.
    const patina = this.filter('lowpass', 6500, 0.6)
    const level = this.gain(0.55)
    voiceBus.connect(patina)
    patina.connect(level)
    this.send(level, 0.85, 1.05)

    const voice = voiced.gain
    voice.setValueAtTime(0, when)

    let at = when + VOICE_START
    for (const breath of CHANT) {
      at += breath.pause

      glottis.frequency.setTargetAtTime(breath.pitch, at, 0.08)
      undertone.frequency.setTargetAtTime((breath.pitch / 2) * 1.004, at, 0.08)
      aspirationLevel.gain.setTargetAtTime(0.03, at, 0.06)

      for (const syllable of breath.syllables) {
        if (syllable.gap) {
          voice.setTargetAtTime(0.0001, at, 0.012)
          fricationLevel.gain.setTargetAtTime(0.0001, at, 0.015)
          at += syllable.gap
        }

        syllable.f.forEach((frequency, i) => {
          formants[i].frequency.setTargetAtTime(frequency, at, 0.045)
        })

        // Sweeping syllables narrow the second formant until single overtones
        // of the source ring through it as it moves.
        formants[1].Q.setTargetAtTime(syllable.to ? 18 : 11, at, 0.1)
        if (syllable.to) {
          const steps = 5
          for (let step = 1; step <= steps; step++) {
            const mix = step / steps
            const from = at + (syllable.dur * (step - 1)) / steps
            syllable.f.forEach((frequency, i) => {
              formants[i].frequency.setTargetAtTime(
                frequency + (syllable.to![i] - frequency) * mix,
                from,
                syllable.dur / steps / 1.2,
              )
            })
          }
        }

        voice.setTargetAtTime(0.5 * syllable.voice, at, 0.03)

        if (syllable.fric) {
          fricationFilter.frequency.setTargetAtTime(syllable.fric[0], at, 0.02)
          fricationLevel.gain.setTargetAtTime(syllable.fric[1], at, 0.015)
        } else {
          fricationLevel.gain.setTargetAtTime(0.0001, at, 0.02)
        }

        if (syllable.dive) {
          glottis.frequency.setValueAtTime(breath.pitch, at + 0.05)
          glottis.frequency.exponentialRampToValueAtTime(
            syllable.dive,
            at + syllable.dur,
          )
          undertone.frequency.setValueAtTime(
            (breath.pitch / 2) * 1.004,
            at + 0.05,
          )
          undertone.frequency.exponentialRampToValueAtTime(
            (syllable.dive / 2) * 1.004,
            at + syllable.dur,
          )
        }

        at += syllable.dur
      }

      voice.setTargetAtTime(0.0001, at, 0.05)
      fricationLevel.gain.setTargetAtTime(0.0001, at, 0.02)
      aspirationLevel.gain.setTargetAtTime(0.0001, at, 0.08)
    }
  }

  private own<Node extends AudioNode>(node: Node): Node {
    this.nodes.push(node)
    return node
  }

  private gain(value: number): GainNode {
    const node = this.own(this.context.createGain())
    node.gain.value = value
    return node
  }

  private filter(
    type: BiquadFilterType,
    frequency: number,
    q: number,
  ): BiquadFilterNode {
    const node = this.own(this.context.createBiquadFilter())
    node.type = type
    node.frequency.value = frequency
    node.Q.value = q
    return node
  }

  private noise(start: number, stop: number): AudioBufferSourceNode {
    const node = this.own(this.context.createBufferSource())
    node.buffer = this.noiseData
    node.loop = true
    node.start(start, rand(0, this.noiseData.duration))
    node.stop(stop)
    return node
  }

  private oscillator(
    frequency: number,
    start: number,
    stop: number,
    type: OscillatorType = 'sine',
  ): OscillatorNode {
    const node = this.own(this.context.createOscillator())
    node.type = type
    node.frequency.value = frequency
    node.start(start)
    node.stop(stop)
    return node
  }

  /** Fan a voice out to the dry bus and the reverb send, panned in place. */
  private send(node: AudioNode, dry: number, wet: number, pan = 0) {
    const panner = this.own(this.context.createStereoPanner())
    panner.pan.value = pan
    node.connect(panner)

    if (dry > 0) {
      const level = this.gain(dry)
      panner.connect(level)
      level.connect(this.dryBus)
    }
    if (wet > 0) {
      const level = this.gain(wet)
      panner.connect(level)
      level.connect(this.wetBus)
    }
  }

  private createNoiseBuffer(): AudioBuffer {
    const rate = this.context.sampleRate
    const buffer = this.context.createBuffer(1, Math.ceil(rate * 3), rate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1
    }
    return buffer
  }

  /**
   * A cavernous stereo impulse response: exponentially decaying noise that a
   * deepening one-pole lowpass darkens as it fades.
   */
  private createImpulseResponse(): AudioBuffer {
    const rate = this.context.sampleRate
    const length = Math.ceil(rate * 5.5)
    const buffer = this.context.createBuffer(2, length, rate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)
      let smoothed = 0
      for (let i = 0; i < length; i++) {
        const brightness = 0.55 - 0.5 * (i / length)
        smoothed += (Math.random() * 2 - 1 - smoothed) * brightness
        data[i] = smoothed * Math.exp(-i / (rate * 1.7))
      }
    }

    return buffer
  }
}

const saturationCurve = (amount: number) => {
  const curve = new Float32Array(257)
  for (let i = 0; i < curve.length; i++) {
    curve[i] = Math.tanh(amount * (i / 128 - 1))
  }
  return curve
}

const rand = (min: number, max: number) => Math.random() * (max - min) + min
