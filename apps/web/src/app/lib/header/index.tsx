import styled from '@emotion/styled'
import * as React from 'react'

import { motion } from '@/styles'

import { capture } from '../analytics'

import { Docker, Github, Npm, Pause, Play, Stackoverflow } from './icons'
import {
  Glyph,
  Gradients,
  Link,
  Toggle,
  ToggleGlyph,
  dimensions,
} from './instrument'
import { Dial, Lattice } from './sigils'

export interface HeaderProps {
  playing: boolean
  onToggle: () => void
  wordmark: React.ReactNode
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

export const Header: React.FC<HeaderProps> = ({
  playing,
  onToggle,
  wordmark,
}) => (
  <Root>
    <Title>{wordmark}</Title>
    <Nav>
      <Gradients />
      {profiles.slice(0, 2).map((profile) => (
        <Profile key={profile.name} {...profile} />
      ))}
      <Toggle
        type="button"
        aria-pressed={playing}
        aria-label={
          playing ? 'Pause the ambient drone' : 'Play the ambient drone'
        }
        onClick={() => {
          onToggle()
          capture(playing ? 'drone_paused' : 'drone_played')
        }}
      >
        <Dial playing={playing} />
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
  name,
  href,
  title,
  icon: Icon,
  glyph,
}) => (
  <Link
    href={href}
    title={title}
    onClick={() => capture('social_link_clicked', { platform: name })}
  >
    <Lattice />
    <Glyph $scale={glyph} aria-hidden="true">
      <Icon />
    </Glyph>
    <Label>{title}</Label>
  </Link>
)

const Root = styled.header`
  position: relative;
`

const Title = styled.h1`
  ${motion.booming};
  width: min(80vw, 60rem);
  margin-top: 0;
  margin-inline: auto;
  user-select: none;

  > svg {
    display: block;
    width: 100%;
    height: auto;
  }
`

const Nav = styled.nav`
  ${motion.booming};
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  gap: ${dimensions.gap};
  margin-top: clamp(0.4rem, 1.6vh, 1.6rem);
  padding-block: ${dimensions.step};
`

const Label = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`
