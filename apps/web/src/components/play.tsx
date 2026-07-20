'use client'

import styled from '@emotion/styled'
import * as React from 'react'

import { animations, colors, media } from '@/styles'

export interface PlayProps {
  playing: boolean
  onToggle: () => void
}

export const Play: React.FC<PlayProps> = ({ playing, onToggle }) => (
  <Root
    aria-pressed={playing}
    aria-label={playing ? 'Pause the ambient drone' : 'Play the ambient drone'}
    onClick={onToggle}
  >
    {playing ? '❚❚' : '▶'}
  </Root>
)

const Root = styled.button`
  display: flex;
  box-sizing: border-box;
  width: 3.2rem;
  height: 3.2rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0.2rem solid ${colors.text};
  border-radius: 0;
  background: ${(props) =>
    props['aria-pressed'] ? colors.accent : 'transparent'};
  box-shadow: 0.4rem 0.4rem 0 ${colors.text};
  color: ${(props) =>
    props['aria-pressed'] ? colors.background : colors.text};
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    transform 90ms ease,
    box-shadow 90ms ease;
  animation: ${animations.revealUp} 0.5s ease-out 0.85s both;

  &:hover {
    background: ${colors.text};
    color: ${colors.background};
  }

  &:active {
    transform: translate(0.4rem, 0.4rem);
    box-shadow: 0 0 0 ${colors.text};
  }

  &:focus-visible {
    outline: 0.2rem solid ${colors.accent};
    outline-offset: 0.4rem;
  }

  ${media.medium} {
    width: 3.6rem;
    height: 3.6rem;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`
