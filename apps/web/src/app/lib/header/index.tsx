import { css } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { animations } from '@/styles'

import { Docker, Github, Npm, Pause, Play, Stackoverflow } from './icons'
import { Dial, Lattice } from './instruments'
import { Wordmark } from './wordmark'

export interface HeaderProps {
  playing: boolean
  onToggle: () => void
}

interface ProfileProps {
  name: string
  href: string
  title: string
  icon: React.FC<{ className?: string }>
  glyph: number
}

const profiles: ProfileProps[] = [
  {
    name: 'Stack Overflow',
    href: 'https://stackoverflow.com/users/44041/filip-dupanovi%C4%87?tab=profile',
    title: 'StackOverflow profile #SOreadytohelp 💓',
    icon: Stackoverflow,
    glyph: 0.34,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/langri-sha',
    title: 'GitHub profile',
    icon: Github,
    glyph: 0.38,
  },
  {
    name: 'NPM',
    href: 'https://www.npmjs.com/~langri-sha',
    title: 'NPM profile',
    icon: Npm,
    glyph: 0.3,
  },
  {
    name: 'Docker',
    href: 'https://hub.docker.com/u/langrisha/',
    title: 'Docker Hub profile',
    icon: Docker,
    glyph: 0.34,
  },
]

export const Header: React.FC<HeaderProps> = ({ playing, onToggle }) => (
  <Root>
    <Title>
      <Wordmark />
    </Title>
    <Nav>
      {profiles.slice(0, 2).map((profile) => (
        <Profile key={profile.name} {...profile} />
      ))}
      <Toggle
        type="button"
        aria-pressed={playing}
        aria-label={
          playing ? 'Pause the ambient drone' : 'Play the ambient drone'
        }
        onClick={onToggle}
        style={{ '--instrument-glyph-scale': 0.42 } as React.CSSProperties}
      >
        <Dial />
        <ToggleGlyph aria-hidden="true">
          {playing ? <Pause /> : <Play />}
        </ToggleGlyph>
      </Toggle>
      {profiles.slice(2).map((profile) => (
        <Profile key={profile.name} {...profile} />
      ))}
    </Nav>
  </Root>
)

const Profile: React.FC<ProfileProps> = ({
  href,
  title,
  icon: Icon,
  glyph,
}) => (
  <Link
    href={href}
    title={title}
    style={{ '--instrument-glyph-scale': glyph } as React.CSSProperties}
  >
    <Lattice />
    <Glyph aria-hidden="true">
      <Icon />
    </Glyph>
    <Label>{title}</Label>
  </Link>
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

const instrument = css`
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

const Link = styled.a`
  ${instrument};
  text-decoration: none;
`

const Toggle = styled.button`
  ${instrument};
  width: calc(var(--instrument-size) * 1.18);
  height: calc(var(--instrument-size) * 1.18);
  margin-inline: calc(var(--instrument-gap) * 0.08);
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  cursor: pointer;

  &::before {
    position: absolute;
    inset: 22%;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(255, 126, 163, 0.2),
      rgba(67, 180, 255, 0.08) 52%,
      transparent 72%
    );
    box-shadow:
      0 0 1.4rem rgba(255, 126, 163, 0.16),
      inset 0 0 1.2rem rgba(110, 220, 255, 0.12);
    content: '';
    opacity: calc(0.5 + 0.5 * var(--instrument-engaged));
    transition:
      box-shadow 0.4s ease,
      opacity 0.4s ease;
  }

  &[aria-pressed='true'] {
    ${engaged};
    --instrument-accent: rgb(255, 150, 182);
    --instrument-accent-glow: rgba(255, 126, 163, 0.85);

    &::before {
      box-shadow:
        0 0 2rem rgba(255, 126, 163, 0.3),
        inset 0 0 1.4rem rgba(110, 220, 255, 0.2);
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

const ToggleGlyph = styled(Glyph)`
  color: var(--instrument-accent);
  filter: drop-shadow(0 0 0.28rem var(--instrument-accent-glow))
    drop-shadow(
      0 0 0.6rem rgba(255, 126, 163, calc(0.45 * var(--instrument-engaged)))
    );
`

const Label = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`
