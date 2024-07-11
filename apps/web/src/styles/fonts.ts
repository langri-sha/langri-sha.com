import { type SerializedStyles, css } from '@emotion/react'
import { cinzel } from '@/lib/fonts'

export const base: SerializedStyles = css`
  font-family: serif;
`

export const heading: SerializedStyles = css`
  font-family: ${cinzel.style.fontFamily}, serif;
`
