'use client'

import { Global, css } from '@emotion/react'
import styled from '@emotion/styled'
import NextLink from 'next/link'
import * as React from 'react'

import { Scene, SceneScript } from '@/components'
import { colors, global, motion } from '@/styles'

import { Star } from './header/icons'
import {
  Glyph,
  Gradients,
  Link,
  dimensions,
  whenEngagedWithin,
} from './header/instrument'
import { Lattice } from './header/sigils'
import { Root, backdrop } from './landing'

export interface NotFoundProps {
  wordmark: React.ReactNode
}

export const NotFound: React.FC<NotFoundProps> = ({ wordmark }) => (
  <React.Fragment>
    <Global styles={[global, backdrop]} />
    <Root>
      {/* As on the landing page, the scene paints first so what follows it
          can blend against it. */}
      <Scene />
      <Main>
        <Wordmark>{wordmark}</Wordmark>
        <Heading>Nothing dwells here</Heading>
        <Message>This page could not be found.</Message>
        <Gradients />
        {/* `next/link` puts a preview's base path in front of `/`. */}
        <Home as={NextLink} href="/">
          <Lattice />
          <Glyph $scale={0.34} aria-hidden="true">
            <Star />
          </Glyph>
          <Caption>Return to the abode</Caption>
        </Home>
      </Main>
      <SceneScript />
    </Root>
  </React.Fragment>
)

const silver = 'rgba(199, 234, 255, 0.8)'

const Main = styled.main`
  ${motion.booming};
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  padding-inline: 1.6rem;
  text-align: center;
`

const Wordmark = styled.div`
  width: min(60vw, 40rem);
  user-select: none;

  > img {
    display: block;
    width: 100%;
    height: auto;
  }
`

const Heading = styled.h1`
  margin: clamp(2.4rem, 6vh, 4.8rem) 0 0;
  color: ${colors.accent};
  font-size: clamp(2.4rem, 6vw, 4.2rem);
  font-weight: normal;
  letter-spacing: 0.06em;
  text-shadow: 0 0 1.6rem ${colors.accentGlow};
`

const Message = styled.p`
  margin: 1.2rem 0 0;
  color: ${silver};
  font-size: clamp(1.5rem, 2.4vw, 1.8rem);
`

const Home = styled(Link)`
  margin-top: clamp(3.2rem, 8vh, 6.4rem);
`

const Caption = styled.span`
  position: absolute;
  top: calc(100% + ${dimensions.step});
  color: ${silver};
  font-size: 1.3rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  white-space: nowrap;
  transition: color 0.35s ease;

  ${whenEngagedWithin(css`
    color: ${colors.accent};
  `)}
`
