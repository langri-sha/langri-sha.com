'use client'

import { Global, css } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { Drone, Scene } from '@/components'
import { colors, global } from '@/styles'

import { capture } from './analytics'
import { dronePaused, droneToggled } from './analytics/drone'
import { Header } from './header'

export interface LandingProps {
  wordmark: React.ReactNode
}

export const Landing: React.FC<LandingProps> = ({ wordmark }) => {
  const [playing, setPlaying] = React.useState(false)
  const audioLevelRef = React.useRef(0)
  const clockRef = React.useRef<AudioContext | null>(null)

  React.useEffect(() => {
    if (!playing) {
      return
    }

    const onPageHide = () => {
      // posthog-js flushes its batch queue from a `pagehide` listener of its
      // own, which may run before this one. A beacon skips the queue.
      capture(...dronePaused(clockRef.current, 'pagehide'), {
        transport: 'sendBeacon',
      })
      setPlaying(false)
    }

    window.addEventListener('pagehide', onPageHide)
    return () => window.removeEventListener('pagehide', onPageHide)
  }, [playing])

  return (
    <React.Fragment>
      <Global styles={[global, backdrop]} />
      <Root>
        {/* The scene paints first so the header, which follows it in the
            flow, can blend against it without an isolating z-index. */}
        <Scene audioLevelRef={audioLevelRef} />
        <Header
          wordmark={wordmark}
          playing={playing}
          onToggle={() => {
            capture(...droneToggled(playing, clockRef.current))
            setPlaying(!playing)
          }}
        />
        {playing ? (
          <Drone audioLevelRef={audioLevelRef} clockRef={clockRef} />
        ) : null}
      </Root>
    </React.Fragment>
  )
}

const backdrop = css`
  body {
    background:
      radial-gradient(
          ellipse 70% 28% at 50% 30%,
          ${colors.ember},
          transparent 70%
        )
        no-repeat,
      radial-gradient(
          ellipse 80% 34% at 50% 66%,
          ${colors.tide},
          transparent 70%
        )
        no-repeat,
      radial-gradient(
          ellipse 130% 100% at 50% 48%,
          ${colors.nightRim} 0%,
          ${colors.nightCore} 55%,
          ${colors.nightDeep} 100%
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
