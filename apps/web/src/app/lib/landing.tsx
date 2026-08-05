/** @jsxImportSource @emotion/react */
'use client'

import { Global, css } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { Drone, Play, Scene } from '@/components'
import { global } from '@/styles'

import { Header } from './header'

export const Landing: React.FC = () => {
  const [playing, setPlaying] = React.useState(false)
  const audioLevelRef = React.useRef(0)

  return (
    <React.Fragment>
      <Global styles={[global, backdrop]} />
      <Root>
        <Root>
          {/* The scene paints first so the header, which follows it in the
              flow, sits on top without an isolating z-index. */}
          <Scene audioLevelRef={audioLevelRef} starOnly />
          <Header />
          {playing ? <Drone audioLevelRef={audioLevelRef} /> : null}
          <Play
            playing={playing}
            onToggle={() => setPlaying((current) => !current)}
          />
        </Root>
      </Root>
    </React.Fragment>
  )
}

// A static approximation of the shader's deep-space background. It paints the
// very first frame — before the bundle loads and the WebGL scene mounts — so
// the rift appears to kick in instantly, and it remains the fallback wherever
// WebGL is unavailable.
const backdrop = css`
  body {
    background:
      radial-gradient(
          ellipse 70% 28% at 50% 30%,
          rgba(90, 8, 36, 0.35),
          transparent 70%
        )
        no-repeat,
      radial-gradient(
          ellipse 80% 34% at 50% 66%,
          rgba(18, 60, 165, 0.3),
          transparent 70%
        )
        no-repeat,
      radial-gradient(
          ellipse 130% 100% at 50% 48%,
          #070d22 0%,
          #030614 55%,
          #010208 100%
        )
        no-repeat;
  }
`

const Root = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
`
