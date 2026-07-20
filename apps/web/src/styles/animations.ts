import { type SerializedStyles, css, keyframes } from '@emotion/react'

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
