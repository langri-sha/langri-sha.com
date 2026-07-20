/** @jsxImportSource @emotion/react */
'use client'

import { Global, css, keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { Drone, Play, Scene } from '@/components'
import { colors, global, layers } from '@/styles'

import { Header } from './header'

export const Landing: React.FC = () => {
  const [playing, setPlaying] = React.useState(false)

  return (
    <React.Fragment>
      <Global styles={global} />
      <Root>
        <Aether aria-hidden="true">
          <Blob css={lilacBlob} />
          <Blob css={blushBlob} />
          <Blob css={skyBlob} />
          <Blob css={periwinkleBlob} />
        </Aether>
        <Header />
        {process.env.EXPERIMENTAL_SCENE ? <Scene /> : null}
        {playing ? <Drone /> : null}
        <Play
          playing={playing}
          onToggle={() => setPlaying((current) => !current)}
        />
      </Root>
    </React.Fragment>
  )
}

const driftOne = keyframes`
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(5vmax, 4vmax, 0) scale(1.14);
  }
`

const driftTwo = keyframes`
  from {
    transform: translate3d(0, 0, 0) scale(1.08);
  }
  to {
    transform: translate3d(-6vmax, 3vmax, 0) scale(0.96);
  }
`

const driftThree = keyframes`
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(4vmax, -5vmax, 0) scale(1.12);
  }
`

const driftFour = keyframes`
  from {
    transform: translate3d(0, 0, 0) scale(1.05);
  }
  to {
    transform: translate3d(-4vmax, -4vmax, 0) scale(1);
  }
`

const lilacBlob = css`
  top: -22vmax;
  left: -16vmax;
  width: 64vmax;
  height: 64vmax;
  background: radial-gradient(
    circle at center,
    ${colors.lilac} 0%,
    transparent 68%
  );
  opacity: 0.6;
  animation: ${driftOne} 78s ease-in-out infinite alternate;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const blushBlob = css`
  top: -12vmax;
  right: -20vmax;
  width: 56vmax;
  height: 56vmax;
  background: radial-gradient(
    circle at center,
    ${colors.blush} 0%,
    transparent 68%
  );
  opacity: 0.55;
  animation: ${driftTwo} 88s ease-in-out infinite alternate;
  animation-delay: -12s;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const skyBlob = css`
  bottom: -26vmax;
  left: 2vmax;
  width: 60vmax;
  height: 60vmax;
  background: radial-gradient(
    circle at center,
    ${colors.sky} 0%,
    transparent 68%
  );
  opacity: 0.6;
  animation: ${driftThree} 82s ease-in-out infinite alternate;
  animation-delay: -30s;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const periwinkleBlob = css`
  bottom: -20vmax;
  right: -12vmax;
  width: 58vmax;
  height: 58vmax;
  background: radial-gradient(
    circle at center,
    ${colors.periwinkle} 0%,
    transparent 68%
  );
  opacity: 0.5;
  animation: ${driftFour} 74s ease-in-out infinite alternate;
  animation-delay: -48s;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Root = styled.div`
  position: relative;
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: ${colors.background};
`

const Aether = styled.div`
  ${layers.background};
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
`

const Blob = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  mix-blend-mode: multiply;
  will-change: transform;
`
