/** @jsxImportSource @emotion/react */
'use client'

import { Global } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { Drone, Scene } from '@/components'
import { global, layers } from '@/styles'

import { Header } from './header'

export const Landing: React.FC = () => {
  const [playing, setPlaying] = React.useState(false)

  return (
    <React.Fragment>
      <Global styles={global} />
      <Root data-playing={playing}>
        <Root data-playing={playing}>
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
          circle farthest-corner at 0 0,
          #3d1b6d 30%,
          #e438dc 65%,
          #404b8c 80%,
          #79acbb 110%
        )
        no-repeat,
      radial-gradient(closest-side at 60% 50%, #7f4dad 20%, #000 100%) no-repeat,
      radial-gradient(
          circle farthest-corner at 0 0,
          #3d1b6d 30%,
          #e438dc 65%,
          #404b8c 80%,
          #79acbb 110%
        )
        no-repeat,
      radial-gradient(closest-side at 60% 50%, #7f4dad 20%, #000 100%) no-repeat;
  }
`

const PlayButton = styled.button`
  ${layers.foreground};
  position: absolute;
  bottom: 10vh;
  width: 5.6rem;
  height: 5.6rem;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 200ms ease,
    background 200ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.16);
    transform: scale(1.06);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.7);
    outline-offset: 3px;
  }
`
