import type { ChantPreset } from './types.js'

/**
 * Ambient drone adopted from Matt Diamond's JS drone project.
 * @see http://matt-diamond.com/drone.html
 */
export const DRONE_PRESET: ChantPreset = {
  name: 'Drone',
  description: 'Warm ambient drone — filtered noise across a major scale',
  config: {
    oscillatorCount: 40,
    baseNote: 60,
    scale: [0, 2, 4, 6, 7, 9, 11, 12, 14],
    gain: 0.25,
    filterQ: 50,
    pannerRange: 20,
    pannerDriftInterval: 500,
    pannerDriftAmount: 0.1,
  },
}

export const PRESETS: readonly ChantPreset[] = [DRONE_PRESET]
