import styled from '@emotion/styled'
import * as React from 'react'

import { animations, colors, fonts, layers, media } from '@/styles'

import { Docker, Github, Keybase, Npm, Stackoverflow } from './icons'

export const Header: React.FC = () => (
  <Root>
    <TopRule />
    <Title>Langri-Sha</Title>
    <Rules>
      <Thick />
      <Thin />
    </Rules>
    <Nav>
      {(
        [
          [
            'Stack Overflow',
            'https://stackoverflow.com/users/44041/filip-dupanovi%C4%87?tab=profile',
            'StackOverflow profile #SOreadytohelp 💓',
            <Stackoverflow key={'stackoverflow'} />,
          ],
          [
            'GitHub',
            'https://github.com/langri-sha',
            'GitHub profile',
            <Github key={'github'} />,
          ],
          [
            'Docker',
            'https://hub.docker.com/u/langrisha/',
            'Docker Hub profile',
            <Docker key={'docker'} />,
          ],
          [
            'NPM',
            'https://www.npmjs.com/~langri-sha',
            'NPM profile',
            <Npm key={'npm'} />,
          ],
          [
            'Keybase',
            'https://keybase.io/langrisha',
            'Identity details on Keybase.io',
            <Keybase key={'keybase'} />,
          ],
        ] as const
      ).map(([name, href, title, icon]) => (
        <Link key={name} href={href} title={title}>
          {icon}
        </Link>
      ))}
    </Nav>
  </Root>
)

const Root = styled.header`
  ${layers.foreground};
  position: relative;
  width: 100%;
`

// A vermilion color bar across the top of the sheet — the one accent.
const TopRule = styled.div`
  width: 100%;
  height: 0.2rem;
  background: ${colors.accent};
  transform-origin: left center;
  animation: ${animations.drawIn} 0.55s ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Title = styled.h1`
  ${fonts.heading};
  margin: 0;
  color: ${colors.text};
  font-size: 4.2rem;
  line-height: 0.98;
  letter-spacing: -0.03em;
  white-space: nowrap;
  user-select: none;
  padding: 2.6rem 0 2rem;
  animation: ${animations.revealUp} 0.6s ease-out 0.1s both;

  ${media.medium} {
    font-size: 9rem;
    padding: 4rem 0 3rem;
  }

  ${media.large} {
    font-size: 15rem;
    letter-spacing: -0.04em;
    padding: 5rem 0 3.6rem;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

// Thick-thin double rule under the masthead — classic front-page divider.
const Rules = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 0.3rem;
`

const rule = `
  width: 100%;
  background: ${colors.text};
  transform-origin: left center;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Thick = styled.div`
  ${rule};
  height: 0.4rem;
  animation: ${animations.drawIn} 0.6s ease-out 0.3s both;
`

const Thin = styled.div`
  ${rule};
  height: 0.1rem;
  animation: ${animations.drawIn} 0.6s ease-out 0.38s both;
`

const Nav = styled.nav`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  width: 100%;
  border-bottom: 0.1rem solid ${colors.text};
`

const Link = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.8rem 0.8rem;
  color: ${colors.text};
  font-size: 2.8rem;
  text-decoration: none;
  transition:
    background-color 150ms ease,
    color 150ms ease;
  animation: ${animations.revealUp} 0.5s ease-out both;

  & + & {
    border-left: 0.1rem solid ${colors.text};
  }

  &:hover,
  &:focus-visible {
    background: ${colors.text};
    color: ${colors.background};
    outline: none;
  }

  &:nth-of-type(1) {
    animation-delay: 0.5s;
  }
  &:nth-of-type(2) {
    animation-delay: 0.57s;
  }
  &:nth-of-type(3) {
    animation-delay: 0.64s;
  }
  &:nth-of-type(4) {
    animation-delay: 0.71s;
  }
  &:nth-of-type(5) {
    animation-delay: 0.78s;
  }

  ${media.medium} {
    padding: 2.6rem 1rem;
    font-size: 3.6rem;
  }

  ${media.large} {
    padding: 3.2rem 1rem;
    font-size: 4rem;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`
