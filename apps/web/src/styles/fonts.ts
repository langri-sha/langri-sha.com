import { type SerializedStyles, css } from '@emotion/react'
import { cinzelDecorative } from '@langri-sha/fonts'

export const base: SerializedStyles = css`
  font-family: var(--font-default);
`

export const heading: SerializedStyles = css`
  font-family: '${cinzelDecorative.family}', serif;
`
