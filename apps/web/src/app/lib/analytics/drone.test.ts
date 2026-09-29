import { expect, test } from 'vitest'

import { dronePaused, droneToggled } from './drone'

test('playing the drone carries no properties', () => {
  expect(droneToggled(false, null)).toEqual(['drone_played'])
})

test('pausing reports the audio clock in whole milliseconds', () => {
  expect(droneToggled(true, { currentTime: 12.3456 })).toEqual([
    'drone_paused',
    { duration_ms: 12346, trigger: 'toggle' },
  ])
})

test('pausing a drone the browser could not play reports none', () => {
  expect(droneToggled(true, null)).toEqual([
    'drone_paused',
    { duration_ms: 0, trigger: 'toggle' },
  ])
})

test('hiding the page mid-play reports the audio clock', () => {
  expect(dronePaused({ currentTime: 754.2 }, 'pagehide')).toEqual([
    'drone_paused',
    { duration_ms: 754200, trigger: 'pagehide' },
  ])
})

test('hiding the page on a drone the browser could not play reports none', () => {
  expect(dronePaused(null, 'pagehide')).toEqual([
    'drone_paused',
    { duration_ms: 0, trigger: 'pagehide' },
  ])
})
