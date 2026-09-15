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
  [data-accent-line],
  [data-waveform] {
    stroke-linecap: square;
    vector-effect: non-scaling-stroke;
  }

  [data-line],
  [data-band],
  [data-waveform] {
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
    stroke-width: 2.4;
    stroke-linecap: round;
  }

  [data-waveform] {
    stroke-width: 1.35px;
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
  [data-node],
  [data-waveform] {
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
    <g data-waveform>
      <path d="M-9 46v8M-4 40v20M1 34v32M6 27v46M11 37v26" />
      <path d="M89 37v26M94 27v46M99 34v32M104 40v20M109 46v8" />
    </g>
    <circle
      data-band
      data-spin
      cx="50"
      cy="50"
      r="43"
      pathLength="100"
      strokeDasharray="0.8 3.2"
      strokeDashoffset="0.4"
    />
    <circle
      data-accent-line
      data-spin
      cx="50"
      cy="50"
      r="38"
      pathLength="100"
      strokeDasharray="15 35"
      opacity="0.9"
    />
    <circle data-soft cx="50" cy="50" r="32.5" />
    <g data-node>
      <circle cx="50" cy="7" r="1.8" />
      <circle cx="93" cy="50" r="1.5" />
      <circle cx="50" cy="93" r="1.8" />
      <circle cx="7" cy="50" r="1.5" />
    </g>
    <g data-accent>
      <polygon points="46.6,0 53.4,0 50,5.5" />
      <polygon points="46.6,100 53.4,100 50,94.5" />
    </g>
  </Frame>
)
