import { type SerializedStyles, css } from '@emotion/react'

import * as colors from './colors'
import * as media from './media'

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
  color-scheme: light;

  ${media.dark} {
    --paper-ground: ${colors.lamplight};
    --paper-shade: ${colors.lamplightShade};
    --paper-ink: ${colors.lamplightInk};
    --paper-muted: ${colors.lamplightMuted};
    --paper-rule: ${colors.lamplightRule};
    --paper-ember: ${colors.emberLamp};
    --paper-tide: ${colors.tideLamp};
    --paper-highlight: ${colors.lampHighlight};
    --paper-dawn: ${colors.lampGlow};
    color-scheme: dark;
  }
`
