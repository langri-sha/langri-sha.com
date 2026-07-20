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

const bob = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-6px);
  }
`

const Root = styled.header`
  ${layers.foreground};
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  text-align: center;
`

const Title = styled.h1`
  ${fonts.heading};
  ${animations.rising};
  color: ${colors.text};
  margin: 0 0 3.6rem;
  font-size: 4.4rem;
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: 0.08em;
  text-indent: 0.08em;
  user-select: none;

  ${media.medium} {
    margin-bottom: 4.8rem;
    font-size: 6.4rem;
  }

  ${media.large} {
    font-size: 8rem;
  }
`

const Nav = styled.nav`
  ${animations.rising};
  animation-delay: 180ms;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  gap: 1.4rem;

  ${media.medium} {
    gap: 2rem;
  }
`

const Link = styled.a`
  position: relative;
  top: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5.2rem;
  height: 5.2rem;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  box-shadow:
    0 1px 2px rgba(40, 50, 74, 0.06),
    0 10px 28px rgba(40, 50, 74, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
  color: ${colors.text};
  font-size: 2.4rem;
  text-decoration: none;
  transition:
    top 250ms ease,
    box-shadow 250ms ease,
    background-color 250ms ease,
    border-color 250ms ease;
  animation: ${bob} 8s ease-in-out infinite alternate;

  &:nth-of-type(2) {
    animation-delay: -1.6s;
  }
  &:nth-of-type(3) {
    animation-delay: -3.2s;
  }
  &:nth-of-type(4) {
    animation-delay: -4.8s;
  }
  &:nth-of-type(5) {
    animation-delay: -6.4s;
  }

  &:hover {
    top: -2px;
    border-color: rgba(255, 255, 255, 0.9);
    background-color: rgba(255, 255, 255, 0.72);
    box-shadow:
      0 2px 6px rgba(40, 50, 74, 0.08),
      0 18px 42px rgba(40, 50, 74, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.95);
  }

  &:focus-visible {
    top: -2px;
    outline: none;
    border-color: rgba(255, 255, 255, 0.9);
    background-color: rgba(255, 255, 255, 0.72);
    box-shadow:
      0 18px 42px rgba(40, 50, 74, 0.14),
      0 0 0 3px rgba(40, 50, 74, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.95);
  }

  ${media.medium} {
    width: 6.4rem;
    height: 6.4rem;
    font-size: 2.8rem;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
  }
`
