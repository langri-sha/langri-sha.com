import { type SerializedStyles, css } from '@emotion/react'
import normalize from 'normalize.css'

import * as colors from './colors'
import * as fonts from './fonts'

const global: SerializedStyles = css`
  ${normalize};

  html {
    font-size: 62.5%;
  }

  body {
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    color: ${colors.ink};
    font-family: ${fonts.body};
    font-size: 1.6rem;
  }

  canvas {
    display: block;
  }
`

export default global
