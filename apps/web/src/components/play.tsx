'use client'

import styled from '@emotion/styled'
import * as React from 'react'

import { colors, layers, media } from '@/styles'

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
  ${layers.foreground};
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  display: flex;
  box-sizing: border-box;
  width: 3.2rem;
  height: 3.2rem;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 2px solid ${colors.text};
  border-radius: 0;
  background: transparent;
  box-shadow: 4px 4px 0 ${colors.text};
  color: ${colors.text};
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;

  &:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 ${colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${colors.text};
    outline-offset: 4px;
  }

  ${media.medium} {
    width: 3.6rem;
    height: 3.6rem;
  }
`
