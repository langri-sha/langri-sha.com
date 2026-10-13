'use client'

import { Global, css, keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { Drone, type Playback, Scene, SceneScript } from '@/components'
import { colors, global, media, paper } from '@/styles'

import { capture } from './analytics'
import { dronePaused, droneToggled } from './analytics/drone'
import { Header } from './header'

export interface LandingProps {
  wordmark: React.ReactNode
  children?: React.ReactNode
}

export const Landing: React.FC<LandingProps> = ({ wordmark, children }) => {
  const [playing, setPlaying] = React.useState(false)
  const audioLevelRef = React.useRef(0)
  const playbackRef = React.useRef<Playback | null>(null)
  const playCountRef = React.useRef(0)

  React.useEffect(() => {
    if (!playing) {
      return
    }

    const onPageHide = () => {
      // posthog-js flushes its batch queue from a `pagehide` listener of its
      // own, which may run before this one. A beacon skips the queue.
      capture(
        ...dronePaused(playbackRef.current, playCountRef.current, 'pagehide'),
        {
          transport: 'sendBeacon',
        },
      )
      setPlaying(false)
    }

    window.addEventListener('pagehide', onPageHide)
    return () => window.removeEventListener('pagehide', onPageHide)
  }, [playing])

  return (
    <React.Fragment>
      <Global styles={[global, backdrop]} />
      <Hero>
        {/* The scene paints first so the header, which follows it in the
            flow, can blend against it without an isolating z-index. */}
        <Scene audioLevelRef={audioLevelRef} />
        <Header
          wordmark={wordmark}
          playing={playing}
          onToggle={() => {
            if (!playing) {
              playCountRef.current += 1
            }

            capture(
              ...droneToggled(
                playing,
                playbackRef.current,
                playCountRef.current,
              ),
            )
            setPlaying(!playing)
          }}
        />
        {/* After the header: starting the scene ahead of it delays the
            wordmark, which is the largest contentful paint. */}
        <SceneScript />
        {playing ? (
          <Drone audioLevelRef={audioLevelRef} playbackRef={playbackRef} />
        ) : null}
      </Hero>
      {children}
    </React.Fragment>
  )
}

const scrollDriven = '@supports (animation-timeline: view())'

const card = {
  inset: 'clamp(0.8rem, 1.2vw, 1.6rem)',
  radius: 'clamp(1.6rem, 2.4vw, 3.2rem)',
}

const dawn = keyframes`
  from {
    background-color: ${colors.nightDeep};
  }

  40% {
    background-color: ${colors.dusk};
  }

  to {
    background-color: ${paper.tone.ground};
  }
`

const settle = keyframes`
  from {
    clip-path: inset(0 round 0);
  }

  to {
    clip-path: inset(${card.inset} round ${card.radius});
  }
`

const backdrop = css`
  :root {
    ${paper.surface};
  }

  body {
    background: ${paper.tone.ground};

    ${media.motion} {
      ${scrollDriven} {
        timeline-scope: --hero;
        animation: ${dawn} linear both;
        animation-timeline: --hero;
        animation-range: exit 0% exit 45%;
      }
    }
  }
`

const Hero = styled.div`
  position: relative;
  display: flex;
  height: 100svh;
  width: 100%;
  overflow: clip;
  clip-path: inset(${card.inset} round ${card.radius});
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(
        ellipse 70% 28% at 50% 30%,
        ${colors.ember},
        transparent 70%
      )
      no-repeat,
    radial-gradient(ellipse 80% 34% at 50% 66%, ${colors.tide}, transparent 70%)
      no-repeat,
    radial-gradient(
        ellipse 130% 100% at 50% 48%,
        ${colors.nightRim} 0%,
        ${colors.nightCore} 55%,
        ${colors.nightDeep} 100%
      )
      no-repeat;

  ${media.motion} {
    ${scrollDriven} {
      view-timeline: --hero block;
      animation: ${settle} linear both;
      animation-timeline: --hero;
      animation-range: exit 0% exit 45%;
    }
  }
`
