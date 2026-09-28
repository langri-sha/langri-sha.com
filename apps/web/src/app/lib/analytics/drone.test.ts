import { expect, test } from 'vitest'

import { droneToggled } from './drone'

test('playing the drone carries no properties', () => {
  expect(droneToggled(false, null)).toEqual(['drone_played'])
})

test('pausing reports the audio clock in whole milliseconds', () => {
  expect(droneToggled(true, { currentTime: 12.3456 })).toEqual([
    'drone_paused',
    { duration_ms: 12346 },
  ])
})

test('pausing a drone the browser could not play reports none', () => {
  expect(droneToggled(true, null)).toEqual(['drone_paused', { duration_ms: 0 }])
})
