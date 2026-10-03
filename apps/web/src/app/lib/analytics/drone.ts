import type { Properties } from 'posthog-js'

import type { Playback } from '@/components'

/**
 * `drone_paused` carries `duration_ms`: how long the paused drone's audio
 * context was rendering, or 0 when the browser could not play it. `trigger`
 * tells a press of the toggle from a page that went away mid-play.
 */
export const dronePaused = (
  playback: Playback | null,
  playCount: number,
  trigger: 'toggle' | 'pagehide',
): [event: string, properties: Properties] => [
  'drone_paused',
  {
    duration_ms: playback ? Math.round(playback.currentTime * 1000) : 0,
    trigger,
    play_count: playCount,
    voice_played: playback?.voicePlayed ?? false,
  },
]

export const droneToggled = (
  playing: boolean,
  playback: Playback | null,
  playCount: number,
): [event: string, properties: Properties] =>
  playing
    ? dronePaused(playback, playCount, 'toggle')
    : ['drone_played', { play_count: playCount }]
