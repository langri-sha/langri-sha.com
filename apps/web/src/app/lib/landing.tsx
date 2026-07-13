/** @jsxImportSource @emotion/react */
'use client'

import { Global, css, keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { Drone, Scene } from '@/components'
import { colors, global, layers, media } from '@/styles'

import { Header } from './header'

export const Landing: React.FC = () => {
  const [playing, setPlaying] = React.useState(false)

  return (
    <React.Fragment>
      <Global styles={[global, gradientProperties]} />
      <Root>
        <Root>
          <Header />
          {process.env.EXPERIMENTAL_SCENE ? <Scene /> : null}
          {playing ? <Drone /> : null}
          <PlayButton
            aria-pressed={playing}
            aria-label={
              playing ? 'Pause the ambient drone' : 'Play the ambient drone'
            }
            onClick={() => setPlaying((current) => !current)}
          >
            {playing ? '❚❚' : '▶'}
          </PlayButton>
        </Root>
      </Root>
    </React.Fragment>
  )
}

const gradientProperties = css`
  /* Aurora */
  @property --aurora-x {
    syntax: '<percentage>';
    inherits: true;
    initial-value: 0%;
  }

  @property --aurora-y {
    syntax: '<percentage>';
    inherits: true;
    initial-value: 0%;
  }

  @property --aurora-rx {
    syntax: '<percentage>';
    inherits: true;
    initial-value: 140%;
  }

  @property --aurora-ry {
    syntax: '<percentage>';
    inherits: true;
    initial-value: 140%;
  }

  /* Pool */
  @property --pool-x {
    syntax: '<percentage>';
    inherits: true;
    initial-value: 60%;
  }

  @property --pool-y {
    syntax: '<percentage>';
    inherits: true;
    initial-value: 50%;
  }

  @property --pool-stop {
    syntax: '<percentage>';
    inherits: true;
    initial-value: 20%;
  }

  /* Palette */
  @property --violet {
    syntax: '<color>';
    inherits: true;
    initial-value: #3d1b6d;
  }

  @property --magenta {
    syntax: '<color>';
    inherits: true;
    initial-value: #e438dc;
  }

  @property --indigo {
    syntax: '<color>';
    inherits: true;
    initial-value: #404b8c;
  }

  @property --mist {
    syntax: '<color>';
    inherits: true;
    initial-value: #79acbb;
  }

  @property --pool {
    syntax: '<color>';
    inherits: true;
    initial-value: #7f4dad;
  }
`

const drift = keyframes`
  0% {
    --aurora-x: 0%;
    --aurora-y: 0%;
    --aurora-rx: 140%;
    --aurora-ry: 140%;
    --pool-x: 60%;
    --pool-y: 50%;
    --pool-stop: 20%;
    --violet: #3d1b6d;
    --magenta: #e438dc;
    --indigo: #404b8c;
    --mist: #79acbb;
    --pool: #7f4dad;
  }

  33% {
    --aurora-x: 12%;
    --aurora-y: 8%;
    --aurora-rx: 165%;
    --aurora-ry: 120%;
    --pool-x: 50%;
    --pool-y: 42%;
    --pool-stop: 32%;
    --violet: #4a1a86;
    --magenta: #ff2f92;
    --indigo: #3d5bb0;
    --mist: #4dd7e8;
    --pool: #9a3df0;
  }

  66% {
    --aurora-x: 4%;
    --aurora-y: 18%;
    --aurora-rx: 120%;
    --aurora-ry: 170%;
    --pool-x: 66%;
    --pool-y: 58%;
    --pool-stop: 26%;
    --violet: #33206e;
    --magenta: #c433ff;
    --indigo: #4a3f9e;
    --mist: #62b8d9;
    --pool: #b03ddb;
  }

  100% {
    --aurora-x: 16%;
    --aurora-y: 4%;
    --aurora-rx: 150%;
    --aurora-ry: 135%;
    --pool-x: 56%;
    --pool-y: 48%;
    --pool-stop: 22%;
    --violet: #3d1b6d;
    --magenta: #f038c8;
    --indigo: #404b8c;
    --mist: #79acbb;
    --pool: #8748c4;
  }
`

const Root = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    width: 100vw;
    height: 100vh;
    mix-blend-mode: color-dodge;
    background:
      radial-gradient(
          ellipse var(--aurora-rx) var(--aurora-ry) at var(--aurora-x)
            var(--aurora-y),
          var(--violet) 30%,
          var(--magenta) 65%,
          var(--indigo) 80%,
          var(--mist) 110%
        )
        no-repeat,
      radial-gradient(
          closest-side at var(--pool-x) var(--pool-y),
          var(--pool) var(--pool-stop),
          #000 100%
        )
        no-repeat,
      radial-gradient(
          ellipse var(--aurora-rx) var(--aurora-ry) at var(--aurora-x)
            var(--aurora-y),
          var(--violet) 30%,
          var(--magenta) 65%,
          var(--indigo) 80%,
          var(--mist) 110%
        )
        no-repeat,
      radial-gradient(
          closest-side at var(--pool-x) var(--pool-y),
          var(--pool) var(--pool-stop),
          #000 100%
        )
        no-repeat;
    animation: ${drift} 48s ease-in-out infinite alternate;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
    }
  }
`

const PlayButton = styled.button`
  ${layers.foreground};
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  display: flex;
  box-sizing: border-box;
  width: 3.2rem;
  height: 3.2rem;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 2px solid ${colors.text};
  border-radius: 0;
  background: transparent;
  box-shadow: 4px 4px 0 ${colors.text};
  color: ${colors.text};
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;

  &:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 ${colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${colors.text};
    outline-offset: 4px;
  }

  ${media.medium} {
    width: 3.6rem;
    height: 3.6rem;
  }
`
