import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { animations, colors, fonts, layers, media } from '@/styles'

import { Docker, Github, Keybase, Npm, Stackoverflow } from './icons'

export const Header: React.FC = () => (
  <Root>
    <Title>Langri-Sha</Title>
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
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
`

// The masthead's steady, lit state — a tight magenta bloom with a cooler mist rim.
const neonGlow = `
  0 0 0.4rem rgba(255, 217, 249, 0.9),
  0 0 1.2rem rgba(228, 56, 220, 0.85),
  0 0 2.4rem rgba(228, 56, 220, 0.6),
  0 0 4.6rem rgba(228, 56, 220, 0.35),
  0 0 6.4rem rgba(121, 172, 187, 0.32)
`

// Power-on: a couple of stutters, then the sign holds.
const powerOn = keyframes`
  0%, 8% { opacity: 0; }
  9% { opacity: 0.85; }
  10% { opacity: 0.1; }
  12% { opacity: 0.9; }
  14% { opacity: 0.15; }
  22% { opacity: 1; }
  24% { opacity: 0.35; }
  26% { opacity: 1; }
  30% { opacity: 0.55; }
  32%, 100% { opacity: 1; }
`

const Title = styled.h1`
  ${fonts.heading};
  color: ${colors.neonCore};
  font-size: 6rem;
  letter-spacing: -0.03em;
  margin-top: 0;
  margin-bottom: 0;
  user-select: none;
  text-shadow: ${neonGlow};
  animation: ${powerOn} 2.2s linear both;

  ${media.medium} {
    font-size: 8rem;
  }

  ${media.large} {
    font-size: 10rem;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Nav = styled.nav`
  ${animations.booming};
  display: flex;
  width: 100%;
  left: 0;
  margin-top: 3rem;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  animation-delay: 0.6s;
  animation-fill-mode: backwards;

  ${media.medium} {
    margin-top: 4rem;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Link = styled.a`
  display: inline-flex;
  color: ${colors.mist};
  font-size: 3.2rem;
  text-decoration: none;
  margin: 1rem;
  border-radius: 0.4rem;
  opacity: 0.4;
  filter: saturate(0.7);
  transition:
    opacity 250ms ease-out,
    transform 250ms ease-out,
    filter 250ms ease-out,
    color 250ms ease-out;

  &:hover {
    color: ${colors.neonCore};
    opacity: 1;
    transform: scale(1.14);
    filter: saturate(1) drop-shadow(0 0 0.6rem ${colors.magenta})
      drop-shadow(0 0 1.4rem rgba(228, 56, 220, 0.7));
  }

  &:focus-visible {
    color: ${colors.neonCore};
    opacity: 1;
    outline: 2px solid ${colors.magenta};
    outline-offset: 6px;
    filter: saturate(1) drop-shadow(0 0 0.7rem ${colors.magenta});
  }

  ${media.medium} {
    font-size: 4.8rem;
  }

  ${media.large} {
    font-size: 6.4rem;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`
