'use client'

import styled from '@emotion/styled'
import * as React from 'react'

import { animations, colors, layers, media } from '@/styles'

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
  ${animations.rising};
  ${layers.foreground};
  position: fixed;
  right: 2.4rem;
  bottom: 2.4rem;
  display: flex;
  box-sizing: border-box;
  width: 4.8rem;
  height: 4.8rem;
  align-items: center;
  justify-content: center;
  padding: 0;
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
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 250ms ease,
    box-shadow 250ms ease,
    background-color 250ms ease,
    border-color 250ms ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.9);
    background-color: rgba(255, 255, 255, 0.72);
    box-shadow:
      0 2px 6px rgba(40, 50, 74, 0.08),
      0 18px 42px rgba(40, 50, 74, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.95);
  }

  &:active {
    transform: translateY(0);
    box-shadow:
      0 1px 2px rgba(40, 50, 74, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.7);
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 10px 28px rgba(40, 50, 74, 0.12),
      0 0 0 3px rgba(40, 50, 74, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  ${media.medium} {
    width: 5.2rem;
    height: 5.2rem;
    font-size: 1.8rem;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`
