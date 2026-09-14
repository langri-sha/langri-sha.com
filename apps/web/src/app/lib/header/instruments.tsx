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
// while the dashed and banded rings scale with the box so their patterns hold.
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
  [data-bold],
  [data-accent-line] {
    stroke-linecap: square;
    vector-effect: non-scaling-stroke;
  }

  [data-line],
  [data-bold],
  [data-band] {
    stroke: var(--instrument-line);
  }

  [data-line] {
    stroke-width: 1.25px;
  }

  [data-bold] {
    stroke-width: 2px;
  }

  [data-soft],
  [data-dash] {
    stroke: var(--instrument-soft);
  }

  [data-soft] {
    stroke-width: 1px;
  }

  [data-dash] {
    stroke-width: 1.5;
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
  [data-bold],
  [data-dash],
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

  [data-turn],
  [data-grow] {
    transform-origin: 50px 50px;
    transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  [data-turn='45'] {
    transform: rotate(calc(45deg * var(--instrument-engaged)));
  }

  [data-turn='30'] {
    transform: rotate(calc(30deg * var(--instrument-engaged)));
  }

  [data-grow] {
    transform: scale(calc(1 + 0.05 * var(--instrument-engaged)));
  }

  @media (prefers-reduced-motion: reduce) {
    [data-spin] {
      animation: none;
    }

    [data-turn],
    [data-grow] {
      transform: none;
      transition: none;
    }
  }
`

export const Orbital: Instrument = (props) => (
  <Frame viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
    <circle data-line cx="50" cy="50" r="43" />
    <circle
      data-dash
      data-spin
      cx="50"
      cy="50"
      r="35"
      pathLength="100"
      strokeDasharray="3 4"
    />
    <path data-line d="M50 1v7M50 92v7M1 50h7M92 50h7" />
    <path
      data-soft
      d="M80.4 19.6l-2.8 2.8M80.4 80.4l-2.8-2.8M19.6 80.4l2.8-2.8M19.6 19.6l2.8 2.8"
    />
    <circle data-accent data-spin cx="50" cy="7" r="1.9" />
  </Frame>
)

export const Lattice: Instrument = (props) => (
  <Frame viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
    <polygon data-line points="50,4 96,50 50,96 4,50" />
    <polygon data-soft data-turn="45" points="50,17 83,50 50,83 17,50" />
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

export const Reticle: Instrument = (props) => (
  <Frame viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
    <rect data-soft x="12" y="12" width="76" height="76" />
    <path
      data-bold
      data-grow
      d="M3 22V3h19M78 3h19v19M97 78v19H78M22 97H3V78"
    />
    <path data-line d="M50 12v6M50 88v-6M12 50h6M88 50h-6" />
    <path data-accent-line d="M50 1v5M50 94v5" />
  </Frame>
)

export const Hexagon: Instrument = (props) => (
  <Frame viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
    <polygon data-line points="50,4 89.8,27 89.8,73 50,96 10.2,73 10.2,27" />
    <polygon
      data-soft
      data-turn="30"
      points="50,15 80.3,32.5 80.3,67.5 50,85 19.7,67.5 19.7,32.5"
    />
    <path data-soft d="M50 4v11M50 96v-11" />
    <g data-node>
      <circle cx="50" cy="4" r="1.6" />
      <circle cx="89.8" cy="27" r="1.6" />
      <circle cx="89.8" cy="73" r="1.6" />
      <circle cx="10.2" cy="73" r="1.6" />
      <circle cx="10.2" cy="27" r="1.6" />
    </g>
    <circle data-accent cx="50" cy="96" r="2.2" />
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
