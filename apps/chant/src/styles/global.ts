import { type SerializedStyles, css } from '@emotion/react'
import normalize from 'normalize.css'

import * as colors from './colors'

const global: SerializedStyles = css`
  ${normalize};

  html {
    font-size: 62.5%;
    --font-default: Georgia, Cambria, 'Times New Roman', Times, serif;
    --font-mono: 'Menlo', 'Consolas', 'Monaco', monospace;
  }

  body {
    position: relative;
    font-size: 1.6rem;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    color: ${colors.text};
    background: ${colors.background};
    font-family: var(--font-default);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`

export default global
