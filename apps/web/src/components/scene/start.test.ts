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

beforeEach(() => {
  vi.stubGlobal('window', {
    devicePixelRatio: 2,
    matchMedia: () => ({ matches: false }),
  })
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
