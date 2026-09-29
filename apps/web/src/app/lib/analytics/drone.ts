import type { Properties } from 'posthog-js'

/** An `AudioContext`, whose time stands still while it is suspended. */
export interface PlaybackClock {
  readonly currentTime: number
}

/**
 * `drone_paused` carries `duration_ms`: how long the paused drone's audio
 * context was rendering, or 0 when the browser could not play it. `trigger`
 * tells a press of the toggle from a page that went away mid-play.
 */
export const dronePaused = (
  clock: PlaybackClock | null,
  trigger: 'toggle' | 'pagehide',
): [event: string, properties: Properties] => [
  'drone_paused',
  { duration_ms: clock ? Math.round(clock.currentTime * 1000) : 0, trigger },
]

export const droneToggled = (
  playing: boolean,
  clock: PlaybackClock | null,
): [event: string, properties?: Properties] =>
  playing ? dronePaused(clock, 'toggle') : ['drone_played']
