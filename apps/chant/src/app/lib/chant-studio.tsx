/** @jsxImportSource @emotion/react */
'use client'

import { Global, css, keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { type ChantConfig, ChantEngine, DRONE_PRESET } from '@langri-sha/chant'
import * as React from 'react'

import { Player } from '@/components/player'
import { PresetPicker } from '@/components/preset-picker'
import { Tuner } from '@/components/tuner'
import { colors, global } from '@/styles'

export const ChantStudio: React.FC = () => {
  const [config, setConfig] = React.useState<ChantConfig>({
    ...DRONE_PRESET.config,
  })
  const [playing, setPlaying] = React.useState(false)
  const [seed, setSeed] = React.useState<number | undefined>(undefined)
  const engineRef = React.useRef<ChantEngine | null>(null)

  const handlePlay = React.useCallback(() => {
    if (engineRef.current?.isRunning) return

    const engine = new ChantEngine({ ...config, seed })
    engineRef.current = engine
    engine.start().catch(() => {
      setPlaying(false)
    })
    setPlaying(true)
  }, [config, seed])

  const handleStop = React.useCallback(() => {
    engineRef.current?.stop()
    engineRef.current = null
    setPlaying(false)
  }, [])

  const handleConfigChange = React.useCallback((next: ChantConfig) => {
    setConfig(next)
    if (engineRef.current?.isRunning) {
      engineRef.current.setGain(next.gain)
    }
  }, [])

  React.useEffect(() => {
    return () => {
      engineRef.current?.stop()
      engineRef.current = null
    }
  }, [])

  return (
    <React.Fragment>
      <Global styles={[global, gradientProperties]} />
      <Backdrop data-playing={playing || undefined} />
      <Root>
        <Header>
          <Title>Chant</Title>
          <Subtitle>Create and tune ambient soundscapes</Subtitle>
        </Header>

        <Main>
          <PresetPicker config={config} onSelect={handleConfigChange} />

          <Player
            playing={playing}
            seed={seed}
            onPlay={handlePlay}
            onStop={handleStop}
            onSeedChange={setSeed}
          />

          <Tuner config={config} onChange={handleConfigChange} />
        </Main>
      </Root>
    </React.Fragment>
  )
}

const gradientProperties = css`
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

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.3;
  transition: opacity 2s ease;
  pointer-events: none;

  &[data-playing] {
    opacity: 0.6;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    mix-blend-mode: screen;
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
        no-repeat;
    animation: ${drift} 48s ease-in-out infinite alternate;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
    }
  }
`

const Root = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 3.2rem 1.6rem 4rem;
  box-sizing: border-box;

  @media (min-width: 34em) {
    padding: 4rem 2.4rem 6rem;
  }
`

const Header = styled.header`
  text-align: center;
  margin-bottom: 3.2rem;
`

const Title = styled.h1`
  margin: 0;
  font-size: 3.6rem;
  font-weight: 400;
  letter-spacing: 0.15em;
  color: ${colors.text};

  @media (min-width: 34em) {
    font-size: 4.8rem;
  }
`

const Subtitle = styled.p`
  margin: 0.4rem 0 0;
  font-size: 1.4rem;
  color: ${colors.textMuted};
`

const Main = styled.main`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  width: 100%;
  max-width: 48rem;
`
