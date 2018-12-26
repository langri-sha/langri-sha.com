// @flow
import { css, keyframes } from '@emotion/core'

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

export const booming = css`
  animation-duration: 3s;
  animation-name: ${boom};
`
