import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const prepareVoiceBuffers = vi.fn(async (sampleRate: number) => ({
  sampleRate,
}))
const voiceStart = vi.fn()

vi.mock('@langri-sha/voice', () => ({
  CHANT: {},
  CHARACTER: {},
  prepareVoiceBuffers,
  Voice: class {
    handoffAt = 2
    start = voiceStart
    dispose() {}
  },
}))
vi.mock('./noise-processor.worklet', () => ({ default: '' }))

const droneBus = { gain: { value: 0, setTargetAtTime: vi.fn() } }

class FakeAudioContext {
  sampleRate = 48000
  currentTime = 0
  state = 'running'
  destination = {}
  audioWorklet = { addModule: vi.fn(async () => {}) }
  resume = async () => {}
  close = () => {}
  createGain() {
    const node = {
      gain: { value: 1, setTargetAtTime: vi.fn() },
      connect() {},
      disconnect() {},
    }
    droneBus.gain = node.gain
    return node
  }
  createAnalyser() {
    return {
      frequencyBinCount: 1,
      connect() {},
      disconnect() {},
      getByteFrequencyData() {},
    }
  }
  createDynamicsCompressor() {
    const param = { value: 0 }
    return {
      threshold: param,
      knee: param,
      ratio: param,
      attack: param,
      release: param,
      connect() {},
    }
  }
}

beforeEach(() => {
  vi.resetModules()
  vi.stubGlobal('window', {
    AudioContext: FakeAudioContext,
    addEventListener() {},
    removeEventListener() {},
  })
  vi.stubGlobal('AudioContext', FakeAudioContext)
  vi.stubGlobal('document', { readyState: 'complete' })
  vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
    callback()
    return 0
  })
  vi.stubGlobal('cancelAnimationFrame', () => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  prepareVoiceBuffers.mockClear()
  voiceStart.mockClear()
})

const run = async (roll: number) => {
  vi.spyOn(Math, 'random').mockReturnValue(roll)
  const { Processor, preloadDrone } = await import('./drone')

  preloadDrone()
  const processor = new Processor({ current: 0 })
  const gainAtStart = processor.droneBus.gain.value
  await processor.generate().catch(() => {})

  return { gainAtStart, processor }
}

test('a hit plays the voice and starts the drone near silent', async () => {
  const { gainAtStart } = await run(0.04)

  expect(voiceStart).toHaveBeenCalledOnce()
  expect(prepareVoiceBuffers).toHaveBeenCalled()
  expect(gainAtStart).toBe(0.0001)
})

test('a miss skips the voice and starts the drone at its normal level', async () => {
  const { gainAtStart } = await run(0.05)

  expect(voiceStart).not.toHaveBeenCalled()
  expect(prepareVoiceBuffers).not.toHaveBeenCalled()
  expect(gainAtStart).toBe(0.25)
})
