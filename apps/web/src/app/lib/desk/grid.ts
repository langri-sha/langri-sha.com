import { type SerializedStyles, css } from '@emotion/react'

import { media } from '@/styles'

export const gutter = 'clamp(1.6rem, 4vw, 6.4rem)'

export const columns: SerializedStyles = css`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  column-gap: clamp(1.6rem, 2.4vw, 3.2rem);
  width: min(100%, 128rem);
  margin-inline: auto;
  padding-inline: ${gutter};
  box-sizing: border-box;

  ${media.wide} {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
`

export const kicker: SerializedStyles = css`
  margin: 0;
  font-size: 1.3rem;
  font-weight: 400;
  letter-spacing: 0.18em;
  line-height: 1.4;
  text-transform: uppercase;
`
