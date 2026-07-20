'use client'

import { css, keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { colors, layers, media } from '@/styles'

export interface PlayProps {
  playing: boolean
  onToggle: () => void
}

export const Play: React.FC<PlayProps> = ({ playing, onToggle }) => (
  <Root
    playing={playing}
    aria-pressed={playing}
    aria-label={playing ? 'Pause the ambient drone' : 'Play the ambient drone'}
    onClick={onToggle}
  >
    {playing ? '❚❚' : '▶'}
  </Root>
)

// A slow neon breath while the drone is playing.
const pulse = keyframes`
  from {
    box-shadow:
      0 0 0.4rem rgba(228, 56, 220, 0.55),
      inset 0 0 0.4rem rgba(228, 56, 220, 0.3);
  }

  to {
    box-shadow:
      0 0 1rem rgba(228, 56, 220, 0.95),
      0 0 2.4rem rgba(228, 56, 220, 0.5),
      inset 0 0 0.8rem rgba(228, 56, 220, 0.55);
  }
`

const Root = styled.button<{ playing: boolean }>`
  ${layers.foreground};
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  display: flex;
  box-sizing: border-box;
  width: 4rem;
  height: 4rem;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1.5px solid ${colors.magenta};
  border-radius: 50%;
  background: rgba(228, 56, 220, 0.06);
  box-shadow:
    0 0 0.5rem rgba(228, 56, 220, 0.5),
    inset 0 0 0.4rem rgba(228, 56, 220, 0.3);
  color: ${colors.neonCore};
  font-size: 1.4rem;
  line-height: 1;
  text-shadow: 0 0 0.6rem ${colors.magenta};
  cursor: pointer;
  opacity: ${({ playing }) => (playing ? 1 : 0.6)};
  transition:
    opacity 250ms ease-out,
    box-shadow 250ms ease-out,
    transform 120ms ease-out;

  ${({ playing }) =>
    playing &&
    css`
      animation: ${pulse} 2.6s ease-in-out infinite alternate;
    `}

  &:hover {
    opacity: 1;
    box-shadow:
      0 0 0.9rem ${colors.magenta},
      0 0 2rem rgba(228, 56, 220, 0.7),
      inset 0 0 0.6rem rgba(228, 56, 220, 0.5);
  }

  &:active {
    transform: scale(0.94);
  }

  &:focus-visible {
    outline: 2px solid ${colors.magenta};
    outline-offset: 4px;
  }

  ${media.medium} {
    width: 4.4rem;
    height: 4.4rem;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;

    &:active {
      transform: none;
    }
  }
`
