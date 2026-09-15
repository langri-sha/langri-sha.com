import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

export type Instrument = React.FC<{ className?: string }>

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
  }

  @media (prefers-reduced-motion: reduce) {
    [data-glimmer] {
      animation: none;
    }
  }
`

const Orbit = styled.span`
  pointer-events: none;
  position: absolute;
  inset: 0;
  animation: ${orbit} 48s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
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
  }

  @media (prefers-reduced-motion: reduce) {
    span {
      animation: none;
    }
  }
`

export const Meridian: Instrument = (props) => (
  <Frame viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
    <circle data-soft cx="50" cy="50" r="39" />
    <circle
      data-line
      cx="50"
      cy="50"
      r="44"
      pathLength="100"
      strokeDasharray="23 2"
      strokeDashoffset="-1"
    />
    <path data-soft d="M50 -6v22M50 84v22M-6 50h22M84 50h22" />
    <path data-line d="M50 -3v6M50 97v6M-3 50h6M97 50h6" />
    <path data-accent-line d="M12 28a44 44 0 0 1 19-18" />
    <g data-node>
      <circle cx="50" cy="6" r="1.7" />
      <circle cx="94" cy="50" r="1.7" />
      <circle cx="50" cy="94" r="1.7" />
      <circle cx="6" cy="50" r="1.7" />
    </g>
    <path data-node data-glimmer d="m50-10 1.5 3-1.5 3-1.5-3z" />
  </Frame>
)

export const Lattice: Instrument = (props) => (
  <Frame viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
    <polygon data-line points="50,4 96,50 50,96 4,50" />
    <path
      data-soft
      d="m50 13 37 37-37 37-37-37zM50 -5v18M87 50h18M50 87v18M-5 50h18"
    />
    <path data-accent-line d="m7 42 10-10M68 83l-10 10" />
    <g data-node>
      <circle cx="50" cy="4" r="2" />
      <circle cx="96" cy="50" r="2" />
      <circle cx="50" cy="96" r="2" />
      <circle cx="4" cy="50" r="2" />
      <circle cx="-3" cy="50" r="0.8" />
      <circle cx="103" cy="50" r="0.8" />
    </g>
    <path data-node data-glimmer d="m50-7 1.5 3-1.5 3-1.5-3z" />
  </Frame>
)

export const Hexagon: Instrument = (props) => (
  <Frame viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
    <polygon data-line points="50,7 87,28.5 87,71.5 50,93 13,71.5 13,28.5" />
    <path
      data-soft
      d="m50 14 31 18v36L50 86 19 68V32zM50 -3v17M50 86v17M5 50h15M80 50h15"
    />
    <path data-accent-line d="m13 65v6.5l12 7M75 21l12 7.5V35" />
    <g data-node>
      <circle cx="50" cy="7" r="2" />
      <circle cx="87" cy="28.5" r="1.5" />
      <circle cx="87" cy="71.5" r="1.5" />
      <circle cx="50" cy="93" r="2" />
      <circle cx="13" cy="71.5" r="1.5" />
      <circle cx="13" cy="28.5" r="1.5" />
    </g>
    <path data-node data-glimmer d="m50-6 1.5 3-1.5 3-1.5-3z" />
  </Frame>
)

export const Aperture: Instrument = (props) => (
  <Frame viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
    <path data-soft d="M12 12h76v76H12zM50 2v18M50 80v18M2 50h18M80 50h18" />
    <path data-line d="M35 12H12v23M65 12h23v23M88 65v23H65M35 88H12V65" />
    <path data-soft d="M20 31V20h11M69 20h11v11M80 69v11H69M31 80H20V69" />
    <path data-accent-line d="M44 12h12M44 88h12" />
    <g data-node>
      <circle cx="12" cy="50" r="1.5" />
      <circle cx="88" cy="50" r="1.5" />
    </g>
    <path data-node data-glimmer d="m50 2 1.5 3L50 8l-1.5-3z" />
  </Frame>
)

const bars = [12, 32, 58, 88, 66, 36]

export const Dial: Instrument = (props) => (
  <React.Fragment>
    <Frame
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
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
      <path data-node data-glimmer d="m50 47 1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
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
