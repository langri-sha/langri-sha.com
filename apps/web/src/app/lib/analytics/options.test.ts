import type { CaptureResult, PostHogConfig } from 'posthog-js'
import { describe, expect, test } from 'vitest'

import { createOptions, options, resolveClientEnvironment } from './options'

const event: CaptureResult = {
  uuid: 'event-id',
  event: 'test_event',
  properties: { client_environment: 'untrusted', source: 'test' },
}

const applyBeforeSend = (
  config: Partial<PostHogConfig>,
  capture: CaptureResult,
) => {
  const beforeSend = config.before_send

  expect(beforeSend).toEqual(expect.any(Function))

  if (typeof beforeSend !== 'function') {
    throw new TypeError('Expected one before_send function')
  }

  return beforeSend(capture)
}

describe.each([
  ['production', 'production'],
  ['preview', 'preview'],
  ['local', 'local'],
  ['unknown', 'local'],
  [undefined, 'local'],
] as const)('client environment %s', (configured, expected) => {
  test(`resolves to ${expected}`, () => {
    expect(resolveClientEnvironment(configured)).toBe(expected)
  })

  test(`adds ${expected} to events`, () => {
    expect(
      applyBeforeSend(createOptions(configured), event)?.properties,
    ).toEqual({
      client_environment: expected,
      source: 'test',
    })
  })
})

test('analytics are sent to the first-party path', () => {
  expect(options.api_host).toBe('/psthg')
})

test('no option reaches for a PostHog host outside the EU', () => {
  const hosts = Object.values(options).filter(
    (value) => typeof value === 'string' && value.includes('posthog.com'),
  )

  expect(hosts).toEqual(['https://eu.posthog.com'])
})

test('broad and sensitive capture is off', () => {
  expect(options.autocapture).toBe(false)
  expect(options.capture_exceptions).toBe(false)
  expect(options.capture_heatmaps).toBe(false)
  expect(options.disable_session_recording).toBe(true)
  expect(options.person_profiles).toBe('identified_only')
  expect(options.respect_dnt).toBe(true)
})
