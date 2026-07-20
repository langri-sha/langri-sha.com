import { type SerializedStyles, css } from '@emotion/react'
import { fontFaces } from '@langri-sha/fonts'
import normalize from 'normalize.css'

import * as colors from './colors'

const global: SerializedStyles = css`
  ${fontFaces};
  ${normalize};

  html {
    font-size: 62.5%;
    overflow-x: hidden;

    --font-default:
      'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia,
      'Times New Roman', Times, serif;
    --color-text: ${colors.text};
  }

  body {
    position: relative;
    font-size: 1.6rem;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background: ${colors.background};
    color: var(--color-text);
    font-family: var(--font-default);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  #app {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  canvas {
    display: block;
  }
`

export default global
