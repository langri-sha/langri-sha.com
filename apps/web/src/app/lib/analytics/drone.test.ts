import { expect, test } from 'vitest'

import { dronePaused, droneToggled } from './drone'

test('playing the drone reports which play it is', () => {
  expect(droneToggled(false, null, 2)).toEqual([
    'drone_played',
    { play_count: 2 },
  ])
})

test('pausing reports the audio clock in whole milliseconds', () => {
  expect(
    droneToggled(true, { currentTime: 12.3456, voicePlayed: false }, 1),
  ).toEqual([
    'drone_paused',
    {
      duration_ms: 12346,
      trigger: 'toggle',
      play_count: 1,
      voice_played: false,
    },
  ])
})

test('pausing a play that opened with the voice says so', () => {
  expect(droneToggled(true, { currentTime: 40, voicePlayed: true }, 2)).toEqual(
    [
      'drone_paused',
      {
        duration_ms: 40000,
        trigger: 'toggle',
        play_count: 2,
        voice_played: true,
      },
    ],
  )
})

test('pausing a drone the browser could not play reports none', () => {
  expect(droneToggled(true, null, 1)).toEqual([
    'drone_paused',
    { duration_ms: 0, trigger: 'toggle', play_count: 1, voice_played: false },
  ])
})

test('hiding the page mid-play reports the audio clock', () => {
  expect(
    dronePaused({ currentTime: 754.2, voicePlayed: true }, 3, 'pagehide'),
  ).toEqual([
    'drone_paused',
    {
      duration_ms: 754200,
      trigger: 'pagehide',
      play_count: 3,
      voice_played: true,
    },
  ])
})

test('hiding the page on a drone the browser could not play reports none', () => {
  expect(dronePaused(null, 1, 'pagehide')).toEqual([
    'drone_paused',
    { duration_ms: 0, trigger: 'pagehide', play_count: 1, voice_played: false },
  ])
})
