/** @jsxImportSource @emotion/react */
'use client'

import { Global } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { Drone, Play, Scene } from '@/components'
import { animations, colors, global, media } from '@/styles'

import { Header } from './header'

export const Landing: React.FC = () => {
  const [playing, setPlaying] = React.useState(false)

  return (
    <React.Fragment>
      <Global styles={global} />
      <Sheet>
        <Header />
        {process.env.EXPERIMENTAL_SCENE ? <Scene /> : null}
        {playing ? <Drone /> : null}
        <Folio>
          <FolioRule />
          <Play
            playing={playing}
            onToggle={() => setPlaying((current) => !current)}
          />
        </Folio>
      </Sheet>
    </React.Fragment>
  )
}

const Sheet = styled.div`
  position: relative;
  display: flex;
  min-height: 100vh;
  width: 100%;
  flex-flow: column nowrap;
  box-sizing: border-box;
  padding: 2.4rem 2rem;
  background: ${colors.background};
  color: ${colors.text};

  ${media.medium} {
    padding: 4rem;
  }

  ${media.large} {
    padding: 6rem;
  }
`

// Closing folio: a rule that runs the width of the sheet with the ambient-audio
// control set at its right end.
const Folio = styled.footer`
  display: flex;
  align-items: center;
  gap: 1.6rem;
  margin-top: auto;
  padding-top: 3.2rem;
`

const FolioRule = styled.div`
  flex: 1 1 auto;
  height: 0.1rem;
  background: ${colors.text};
  transform-origin: left center;
  animation: ${animations.drawIn} 0.6s ease-out 0.8s both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`
