import { type SerializedStyles, css } from '@emotion/react'

import { cinzelDecorative } from '@/lib/fonts'

export const base: SerializedStyles = css`
  font-family: var(--font-default);
`

export const heading: SerializedStyles = css`
  font-family: ${cinzelDecorative.style.fontFamily}, serif;
`
