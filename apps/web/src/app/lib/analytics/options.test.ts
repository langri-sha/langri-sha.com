import { expect, test } from 'vitest'

import { options } from './options'

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
