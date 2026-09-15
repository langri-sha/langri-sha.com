import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

export type Instrument = React.FC<{ className?: string }>

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

// Hairlines keep a fixed pixel weight across the range of instrument sizes,
// while the banded ring scales with the box so its pattern holds.
const Frame = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  fill: none;
  pointer-events: none;
  filter: drop-shadow(
    0 0 0.45rem rgba(110, 220, 255, calc(0.6 * var(--instrument-engaged)))
  );
  transition: filter 0.4s ease;

  [data-line],
  [data-soft],
  [data-accent-line] {
    stroke-linecap: square;
    vector-effect: non-scaling-stroke;
  }

  [data-line],
  [data-band] {
    stroke: var(--instrument-line);
  }

  [data-line] {
    stroke-width: 1.25px;
  }

  [data-soft] {
    stroke: var(--instrument-soft);
    stroke-width: 1px;
  }

  [data-band] {
    stroke-width: 3.6;
  }

  [data-node] {
    fill: var(--instrument-line);
  }

  [data-accent] {
    fill: var(--instrument-accent);
  }

  [data-accent-line] {
    stroke: var(--instrument-accent);
    stroke-width: 1px;
  }

  [data-accent],
  [data-accent-line] {
    filter: drop-shadow(0 0 0.25rem var(--instrument-accent-glow));
  }

  [data-line],
  [data-soft],
  [data-band],
  [data-node] {
    transition:
      stroke 0.35s ease,
      fill 0.35s ease;
  }

  [data-spin] {
    transform-origin: 50px 50px;
    animation: ${spin} 24s linear infinite;
    animation-play-state: var(--instrument-motion);
  }

  [data-turn] {
    transform: rotate(calc(45deg * var(--instrument-engaged)));
    transform-origin: 50px 50px;
    transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    [data-spin] {
      animation: none;
    }

    [data-turn] {
      transform: none;
      transition: none;
    }
  }
`

export const Lattice: Instrument = (props) => (
  <Frame viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
    <polygon data-line points="50,4 96,50 50,96 4,50" />
    <polygon data-soft data-turn points="50,17 83,50 50,83 17,50" />
    <path data-soft d="M50 4v13M96 50h-13M50 96v-13M4 50h13" />
    <g data-node>
      <circle cx="96" cy="50" r="2" />
      <circle cx="50" cy="96" r="2" />
      <circle cx="4" cy="50" r="2" />
      <circle cx="73" cy="27" r="1.3" />
      <circle cx="73" cy="73" r="1.3" />
      <circle cx="27" cy="73" r="1.3" />
      <circle cx="27" cy="27" r="1.3" />
    </g>
    <circle data-accent cx="50" cy="4" r="2.4" />
  </Frame>
)

export const Dial: Instrument = (props) => (
  <Frame viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
    <circle
      data-band
      data-spin
      cx="50"
      cy="50"
      r="42"
      pathLength="100"
      strokeDasharray="9.5 3"
      strokeDashoffset="1.5"
    />
    <circle data-accent-line cx="50" cy="50" r="37.5" opacity="0.6" />
    <circle data-soft cx="50" cy="50" r="34" />
    <g data-accent>
      <polygon points="46.6,1 53.4,1 50,6" />
      <polygon points="46.6,1 53.4,1 50,6" transform="rotate(120 50 50)" />
      <polygon points="46.6,1 53.4,1 50,6" transform="rotate(240 50 50)" />
    </g>
  </Frame>
)
