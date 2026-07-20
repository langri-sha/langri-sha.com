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

/**
 * Print-shop reveal — restrained, single-shot entrances. Elements carry their
 * final (visible) state in their own rules; these keyframes hide them at 0s and
 * settle them in. Under reduced motion, callers drop the animation and the
 * element is simply shown.
 */

// Masthead / link cells fade up a hair.
export const revealUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(1.2rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`

// Hairline rules draw across, like a press pulling a line.
export const drawIn = keyframes`
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
`
