import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { motion } from '@/styles'

const orbit = keyframes`
  to { transform: rotate(360deg); }
`

const breathe = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`

const waveform = keyframes`
  0%, 100% { transform: scaleY(0.45); opacity: 0.55; }
  35% { transform: scaleY(1); opacity: 1; }
  65% { transform: scaleY(0.7); opacity: 0.8; }
`

const Frame = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  fill: none;
  pointer-events: none;
  filter: drop-shadow(0 0 2px rgba(97, 192, 255, 0.55))
    drop-shadow(0 0 7px rgba(66, 142, 255, 0.3))
    brightness(calc(1 + 0.2 * var(--instrument-engaged)));
  transition: filter 0.4s ease;

  [data-line],
  [data-soft],
  [data-accent-line] {
    vector-effect: non-scaling-stroke;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  [data-line],
  [data-band] {
    stroke: url(#instrument-line);
  }

  [data-line] {
    stroke-width: 1.35px;
  }
  [data-soft] {
    stroke: #93cfff;
    stroke-width: 0.65px;
    opacity: 0.3;
  }
  [data-band] {
    stroke-width: 1.65;
    stroke-linecap: round;
  }
  [data-node] {
    fill: #dcf7ff;
  }
  [data-accent] {
    fill: var(--instrument-accent);
  }
  [data-accent-line] {
    stroke: url(#instrument-warm);
    stroke-width: 1.3px;
  }
  [data-accent],
  [data-accent-line] {
    filter: drop-shadow(0 0 3px rgba(255, 144, 171, 0.8));
  }
  [data-glimmer] {
    animation: ${breathe} 5s ease-in-out infinite;
    animation-play-state: var(--instrument-motion);
  }
`

const Orbit = styled.span`
  pointer-events: none;
  position: absolute;
  inset: 0;
  animation: ${orbit} 48s linear infinite;
  animation-play-state: var(--instrument-motion);
`

const Waveform = styled.span`
  pointer-events: none;
  position: absolute;
  inset-block: 16%;
  display: flex;
  align-items: center;
  gap: clamp(1px, 0.2vw, 3px);
  width: 22%;
  filter: drop-shadow(0 0 3px #6bbdff)
    drop-shadow(0 0 8px rgba(69, 151, 255, 0.5));

  &[data-side='left'] {
    right: 91%;
  }
  &[data-side='right'] {
    left: 91%;
    transform: scaleX(-1);
  }

  span {
    flex: 1;
    height: var(--bar-height);
    border-radius: 2px;
    background: linear-gradient(#80beff, #e8fcff 42%, #99dbff 60%, #7275d5);
    animation: ${waveform} var(--instrument-tempo, 3.4s) ease-in-out infinite;
    animation-delay: var(--bar-delay);
    animation-play-state: var(--instrument-motion);
  }
`

const Turn = styled.span`
  pointer-events: none;
  position: absolute;
  inset: 0;
  transform: rotate(calc(45deg * var(--instrument-engaged)));
  transition: transform 0.6s ${motion.easing};

  @media (prefers-reduced-motion: reduce) {
    transform: none;
    transition: none;
  }
`

export const Lattice: React.FC = () => (
  <React.Fragment>
    <Frame viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <polygon data-line points="50,4 96,50 50,96 4,50" />
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
    <Turn aria-hidden="true">
      <Frame viewBox="0 0 100 100" focusable="false">
        <polygon data-line points="50,17 83,50 50,83 17,50" opacity="0.5" />
      </Frame>
    </Turn>
  </React.Fragment>
)

const bars = [12, 32, 58, 88, 66, 36]

export const Dial: React.FC<{ playing: boolean }> = ({ playing }) => (
  <React.Fragment>
    <Frame viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <circle data-soft cx="50" cy="50" r="46" />
      <circle
        data-band
        cx="50"
        cy="50"
        r="42"
        pathLength="100"
        strokeDasharray="0.25 1.55"
      />
      <circle
        data-soft
        cx="50"
        cy="50"
        r="35.5"
        pathLength="100"
        strokeDasharray="21 4"
      />
      <path data-accent-line d="M50 -8V3M50 97v11" />
      <g data-accent>
        <circle cx="50" cy="8" r="1.9" />
        <circle cx="50" cy="92" r="1.9" />
      </g>
      {!playing ? (
        <path data-node data-glimmer d="m50 47 1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
      ) : null}
    </Frame>
    <Orbit aria-hidden="true">
      <Frame viewBox="0 0 100 100">
        <circle
          data-line
          cx="50"
          cy="50"
          r="46"
          pathLength="100"
          strokeDasharray="12 38"
        />
        <circle
          data-accent-line
          cx="50"
          cy="50"
          r="38"
          pathLength="100"
          strokeDasharray="9 41"
          strokeDashoffset="-16"
        />
        <g data-node>
          <circle cx="50" cy="4" r="1.3" />
          <circle cx="50" cy="96" r="1.3" />
        </g>
      </Frame>
    </Orbit>
    {(['left', 'right'] as const).map((side) => (
      <Waveform key={side} data-side={side} aria-hidden="true">
        {bars.map((height, index) => (
          <span
            key={height}
            style={
              {
                '--bar-height': `${height}%`,
                '--bar-delay': `${index * -0.37 - (side === 'right' ? 0.6 : 0)}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </Waveform>
    ))}
  </React.Fragment>
)
