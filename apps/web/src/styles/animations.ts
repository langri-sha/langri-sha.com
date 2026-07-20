import { type SerializedStyles, css, keyframes } from '@emotion/react'

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
`

const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`

export const rising: SerializedStyles = css`
  animation: ${rise} 1200ms cubic-bezier(0.22, 1, 0.36, 1) backwards;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`
