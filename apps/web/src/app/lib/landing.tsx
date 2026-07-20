/** @jsxImportSource @emotion/react */
'use client'

import { Global, css, keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { Drone, Play, Scene } from '@/components'
import { colors, global } from '@/styles'

import { Header } from './header'

export const Landing: React.FC = () => {
  const [playing, setPlaying] = React.useState(false)

  return (
    <React.Fragment>
      <Global styles={[global, nebulaProperties]} />
      <Ground data-playing={playing}>
        <Header />
        {process.env.EXPERIMENTAL_SCENE ? <Scene /> : null}
        {playing ? <Drone /> : null}
        <Play
          playing={playing}
          onToggle={() => setPlaying((current) => !current)}
        />
      </Ground>
    </React.Fragment>
  )
}

// Registered custom props let the nebula's colour and position tween smoothly.
const nebulaProperties = css`
  @property --neb-x {
    syntax: '<percentage>';
    inherits: true;
    initial-value: 32%;
  }

  @property --neb-y {
    syntax: '<percentage>';
    inherits: true;
    initial-value: 30%;
  }

  @property --pool-x {
    syntax: '<percentage>';
    inherits: true;
    initial-value: 70%;
  }

  @property --pool-y {
    syntax: '<percentage>';
    inherits: true;
    initial-value: 68%;
  }

  @property --nebula-violet {
    syntax: '<color>';
    inherits: true;
    initial-value: #3d1b6d;
  }

  @property --nebula-magenta {
    syntax: '<color>';
    inherits: true;
    initial-value: #e438dc;
  }
`

// A very slow, sleepy drift — the room is alive but barely.
const drift = keyframes`
  0% {
    --neb-x: 32%;
    --neb-y: 30%;
    --pool-x: 70%;
    --pool-y: 68%;
    --nebula-violet: #3d1b6d;
    --nebula-magenta: #e438dc;
  }

  50% {
    --neb-x: 40%;
    --neb-y: 24%;
    --pool-x: 62%;
    --pool-y: 74%;
    --nebula-violet: #45228c;
    --nebula-magenta: #c433ff;
  }

  100% {
    --neb-x: 28%;
    --neb-y: 34%;
    --pool-x: 74%;
    --pool-y: 62%;
    --nebula-violet: #33206e;
    --nebula-magenta: #e438dc;
  }
`

// While the drone plays, the room breathes a touch deeper — a gentle swell, not a flood.
const breathe = keyframes`
  from {
    opacity: 0.18;
  }

  to {
    opacity: 0.34;
  }
`

const Ground = styled.div`
  position: relative;
  display: flex;
  overflow: hidden;
  height: 100vh;
  width: 100vw;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(
      ellipse 90% 70% at 50% 38%,
      rgba(61, 27, 109, 0.22),
      transparent 68%
    ),
    radial-gradient(
      ellipse 130% 120% at 50% 50%,
      transparent 48%,
      rgba(0, 0, 0, 0.62) 100%
    ),
    ${colors.noir};

  /* Nebula: whisper-opacity glows drifting over the dark. */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    mix-blend-mode: screen;
    background:
      radial-gradient(
          ellipse 55% 50% at var(--neb-x) var(--neb-y),
          var(--nebula-magenta),
          transparent 62%
        )
        no-repeat,
      radial-gradient(
          ellipse 60% 65% at var(--pool-x) var(--pool-y),
          var(--nebula-violet),
          transparent 66%
        )
        no-repeat,
      radial-gradient(
          ellipse 80% 55% at 84% 20%,
          rgba(121, 172, 187, 0.5),
          transparent 60%
        )
        no-repeat;
    opacity: 0.16;
    animation: ${drift} 78s ease-in-out infinite alternate;
  }

  &[data-playing='true']::before {
    animation:
      ${drift} 78s ease-in-out infinite alternate,
      ${breathe} 11s ease-in-out infinite alternate;
  }

  /* Grain: an extremely subtle film over the ground, beneath the signage. */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='160'%20height='160'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.9'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 160px 160px;
    mix-blend-mode: overlay;
    opacity: 0.05;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before,
    &[data-playing='true']::before {
      animation: none;
    }
  }
`
