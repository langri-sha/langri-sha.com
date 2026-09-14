import { css } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { animations } from '@/styles'

import { Docker, Github, Keybase, Npm, Stackoverflow } from './icons'
import { Dial, Hexagon, Lattice, Orbital, Reticle } from './instruments'
import { Wordmark } from './wordmark'

const links = [
  {
    name: 'Stack Overflow',
    href: 'https://stackoverflow.com/users/44041/filip-dupanovi%C4%87?tab=profile',
    title: 'StackOverflow profile #SOreadytohelp 💓',
    icon: Stackoverflow,
    instrument: Orbital,
    glyph: 0.4,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/langri-sha',
    title: 'GitHub profile',
    icon: Github,
    instrument: Lattice,
    glyph: 0.38,
  },
  {
    name: 'Docker',
    href: 'https://hub.docker.com/u/langrisha/',
    title: 'Docker Hub profile',
    icon: Docker,
    instrument: Reticle,
    glyph: 0.38,
  },
  {
    name: 'NPM',
    href: 'https://www.npmjs.com/~langri-sha',
    title: 'NPM profile',
    icon: Npm,
    instrument: Hexagon,
    glyph: 0.34,
  },
  {
    name: 'Keybase',
    href: 'https://keybase.io/langrisha',
    title: 'Identity details on Keybase.io',
    icon: Keybase,
    instrument: Dial,
    glyph: 0.38,
  },
]

export const Header: React.FC = () => (
  <Root>
    <Title>
      <Wordmark />
    </Title>
    <Nav>
      {links.map(
        ({ name, href, title, icon: Icon, instrument: Instrument, glyph }) => (
          <Link
            key={name}
            href={href}
            title={title}
            style={{ '--instrument-glyph-scale': glyph } as React.CSSProperties}
          >
            <Instrument />
            <Glyph aria-hidden="true">
              <Icon />
            </Glyph>
            <Readout aria-hidden="true">{name}</Readout>
            <Label>{title}</Label>
          </Link>
        ),
      )}
    </Nav>
  </Root>
)

const Root = styled.header`
  position: relative;
`

const Title = styled.h1`
  width: min(80vw, 60rem);
  margin-top: 0;
  user-select: none;
`

const Nav = styled.nav`
  ${animations.booming};
  --instrument-size: clamp(4.4rem, 14vw, 8.8rem);
  --instrument-gap: clamp(0.8rem, 1.8vw, 2rem);
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  gap: var(--instrument-gap);
  margin-top: clamp(0.4rem, 1.6vh, 1.6rem);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const engaged = css`
  --instrument-engaged: 1;
  --instrument-motion: running;
  --instrument-line: rgb(190, 242, 255);
  --instrument-soft: rgba(190, 242, 255, 0.72);
  --instrument-glyph: rgb(255, 255, 255);
`

const Link = styled.a`
  --instrument-engaged: 0;
  --instrument-motion: paused;
  --instrument-line: rgba(128, 222, 255, 0.78);
  --instrument-soft: rgba(128, 222, 255, 0.34);
  --instrument-accent: rgba(255, 126, 163, 0.92);
  --instrument-accent-glow: rgba(255, 126, 163, 0.55);
  --instrument-glyph: rgb(196, 230, 248);
  position: relative;
  display: grid;
  flex: none;
  width: var(--instrument-size);
  height: var(--instrument-size);
  place-items: center;
  border-radius: 50%;
  color: var(--instrument-glyph);
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    color 0.35s ease,
    transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);

  &:focus-visible {
    ${engaged};
    outline: 2px solid var(--instrument-accent);
    outline-offset: 0.5rem;
  }

  &:active {
    ${engaged};
  }

  @media (hover: hover) {
    &:hover {
      ${engaged};
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    transform: scale(calc(1 + 0.04 * var(--instrument-engaged)));

    &:active {
      transform: scale(0.97);
    }
  }
`

const Glyph = styled.span`
  position: relative;
  display: grid;
  place-items: center;
  font-size: calc(var(--instrument-size) * var(--instrument-glyph-scale));
  line-height: 1;
  filter: drop-shadow(
    0 0 0.35rem rgba(150, 232, 255, calc(0.7 * var(--instrument-engaged)))
  );
  transition: filter 0.35s ease;
`

const Readout = styled.span`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 50%;
  font-family: var(--font-default);
  font-size: 1.2rem;
  line-height: 1;
  letter-spacing: 0.28em;
  text-indent: 0.28em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--instrument-line);
  opacity: var(--instrument-engaged);
  transform: translate(-50%, calc(0.4rem * (1 - var(--instrument-engaged))));
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
  pointer-events: none;
`

const Label = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`
