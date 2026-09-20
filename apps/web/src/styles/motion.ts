import { type SerializedStyles, css, keyframes } from '@emotion/react'

import * as media from './media'

export const easing: string = 'cubic-bezier(0.2, 0.8, 0.2, 1)'

const boom = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`

export const booming: SerializedStyles = css`
  animation-duration: 3s;
  animation-name: ${boom};

  ${media.reducedMotion} {
    animation: none;
  }
`
