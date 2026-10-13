import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { type SceneCanvas, start } from './start'

type Mock = ReturnType<typeof vi.fn>

const methods = new Map<PropertyKey, Mock>()
const gl = new Proxy({} as Record<string, Mock>, {
  get: (_, name) => {
    if (!methods.has(name))
      methods.set(
        name,
        vi.fn(() => ({})),
      )
    return methods.get(name)
  },
})

const canvas = {
  clientWidth: 320,
  clientHeight: 180,
  width: 300,
  height: 150,
  style: {},
  getContext: () => gl,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
} as unknown as SceneCanvas

const stubWindow = (overrides: Record<string, unknown> = {}) =>
  vi.stubGlobal('window', {
    devicePixelRatio: 2,
    innerHeight: 180,
    scrollY: 0,
    matchMedia: () => ({ matches: false }),
    ...overrides,
  })

const scrollUniform = () => {
  const index = gl.getUniformLocation.mock.calls.findIndex(
    ([, name]) => name === 'u_scroll',
  )
  const location = gl.getUniformLocation.mock.results[index]?.value

  return gl.uniform1f.mock.calls.find(([target]) => target === location)?.[1]
}

beforeEach(() => {
  stubWindow()
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn(() => 1),
  )
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

afterEach(() => {
  methods.clear()
  vi.unstubAllGlobals()
})

test('runs from its serialized source alone', () => {
  const serialized = new Function(
    `return ${start.toString()}`,
  )() as typeof start

  const scene = serialized(canvas, '', '')

  expect(gl.drawArrays).toHaveBeenCalledOnce()
  expect([canvas.width, canvas.height]).toEqual([640, 360])
  expect(canvas.__scene).toBe(scene)

  scene?.dispose()

  expect(cancelAnimationFrame).toHaveBeenCalledWith(1)
  expect(canvas.__scene).toBeUndefined()
})

test('passes the scroll in viewport heights to the shader', () => {
  stubWindow({ scrollY: 270 })

  start(canvas, '', '')?.dispose()

  expect(scrollUniform()).toBe(1.5)
})

test('keeps the scene still under reduced motion', () => {
  stubWindow({ scrollY: 270, matchMedia: () => ({ matches: true }) })

  start(canvas, '', '')?.dispose()

  expect(scrollUniform()).toBe(0)
})

test('renders at half resolution once the hero is out of view', () => {
  stubWindow({ scrollY: 270 })

  start(canvas, '', '')?.dispose()

  expect([canvas.width, canvas.height]).toEqual([320, 180])
})
