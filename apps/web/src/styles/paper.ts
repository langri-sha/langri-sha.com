import { type SerializedStyles, css } from '@emotion/react'

import * as colors from './colors'

export const tone = {
  ground: 'var(--paper-ground)',
  shade: 'var(--paper-shade)',
  ink: 'var(--paper-ink)',
  muted: 'var(--paper-muted)',
  rule: 'var(--paper-rule)',
  ember: 'var(--paper-ember)',
  tide: 'var(--paper-tide)',
  highlight: 'var(--paper-highlight)',
  dawn: 'var(--paper-dawn)',
} as const

export const surface: SerializedStyles = css`
  --paper-ground: ${colors.paper};
  --paper-shade: ${colors.paperShade};
  --paper-ink: ${colors.paperInk};
  --paper-muted: ${colors.paperMuted};
  --paper-rule: ${colors.paperRule};
  --paper-ember: ${colors.emberInk};
  --paper-tide: ${colors.tideInk};
  --paper-highlight: ${colors.accent};
  --paper-dawn: ${colors.dawn};
`
