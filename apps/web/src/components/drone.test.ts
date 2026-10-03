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

test('the first play skips the voice and starts the drone at its normal level', async () => {
  const { Processor } = await import('./drone')
  const processor = new Processor({ current: 0 })
  await processor.generate().catch(() => {})

  expect(processor.droneBus.gain.value).toBe(0.25)
  expect(voiceStart).not.toHaveBeenCalled()
})

test('the second play carries the voice and starts the drone near silent', async () => {
  const { Processor } = await import('./drone')
  await new Processor({ current: 0 }).generate().catch(() => {})

  const second = new Processor({ current: 0 })
  expect(second.droneBus.gain.value).toBe(0.0001)
  await second.generate().catch(() => {})
  expect(voiceStart).toHaveBeenCalledOnce()
})

test('once the voice has played, later plays skip it', async () => {
  const { Processor } = await import('./drone')
  await new Processor({ current: 0 }).generate().catch(() => {})
  await new Processor({ current: 0 }).generate().catch(() => {})

  const third = new Processor({ current: 0 })
  expect(third.droneBus.gain.value).toBe(0.25)
  await third.generate().catch(() => {})
  expect(voiceStart).toHaveBeenCalledOnce()
})
