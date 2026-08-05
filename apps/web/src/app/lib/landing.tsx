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
              flow, can blend against it without an isolating z-index. */}
          <Scene audioLevelRef={audioLevelRef} starOnly />
          <Header />
          {playing ? <Drone audioLevelRef={audioLevelRef} /> : null}
          <Play
            playing={playing}
            onToggle={() => setPlaying((current) => !current)}
          />
          <Frame aria-hidden="true">
            <Cross />
            <Cross />
            <Cross />
            <Cross />
          </Frame>
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

// A static instrument-style overlay: it gives the scene a deliberate frame
// without ever becoming part of the animated canvas or intercepting controls.
const Frame = styled.div`
  --frame-line: rgba(171, 205, 255, 0.42);
  --frame-accent: rgba(255, 126, 163, 0.8);
  position: fixed;
  z-index: 3;
  inset: clamp(1rem, 2.4vw, 3.2rem);
  box-sizing: border-box;
  border: 1px solid var(--frame-line);
  box-shadow:
    inset 0 0 0 0.7rem rgba(4, 8, 25, 0.12),
    0 0 2.4rem rgba(86, 142, 255, 0.08);
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    inset: 0.7rem;
    border: 1px solid rgba(171, 205, 255, 0.16);
    background:
      linear-gradient(var(--frame-accent), var(--frame-accent)) left top / 2rem
        1px no-repeat,
      linear-gradient(var(--frame-accent), var(--frame-accent)) left top / 1px
        2rem no-repeat,
      linear-gradient(var(--frame-accent), var(--frame-accent)) right top / 2rem
        1px no-repeat,
      linear-gradient(var(--frame-accent), var(--frame-accent)) right top / 1px
        2rem no-repeat,
      linear-gradient(var(--frame-accent), var(--frame-accent)) left bottom /
        2rem 1px no-repeat,
      linear-gradient(var(--frame-accent), var(--frame-accent)) left bottom /
        1px 2rem no-repeat,
      linear-gradient(var(--frame-accent), var(--frame-accent)) right bottom /
        2rem 1px no-repeat,
      linear-gradient(var(--frame-accent), var(--frame-accent)) right bottom /
        1px 2rem no-repeat;
  }
`

const Cross = styled.span`
  position: absolute;
  width: 1.2rem;
  height: 1.2rem;
  transform: translate(-50%, -50%);

  &::before,
  &::after {
    position: absolute;
    content: '';
    background: var(--frame-accent);
    box-shadow: 0 0 0.8rem rgba(255, 126, 163, 0.35);
  }

  &::before {
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
  }

  &::after {
    top: 0;
    left: 50%;
    width: 1px;
    height: 100%;
  }

  &:nth-of-type(1) {
    top: 0;
    left: 0;
  }

  &:nth-of-type(2) {
    top: 0;
    left: 100%;
  }

  &:nth-of-type(3) {
    top: 100%;
    left: 0;
  }

  &:nth-of-type(4) {
    top: 100%;
    left: 100%;
  }
`
