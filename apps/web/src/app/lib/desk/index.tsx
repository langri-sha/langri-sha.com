'use client'

import styled from '@emotion/styled'
import * as React from 'react'

import { paper } from '@/styles'

import { Masthead } from './masthead'

export const Desk: React.FC = () => (
  <Root aria-labelledby="desk">
    <Masthead />
  </Root>
)

const Root = styled.main`
  position: relative;
  padding-block: clamp(8rem, 14vh, 14rem) clamp(6.4rem, 10vh, 12rem);
  color: ${paper.tone.ink};

  &::before {
    position: absolute;
    inset: 0 0 auto;
    height: 56rem;
    background: radial-gradient(
      ellipse 60% 100% at 50% 0%,
      ${paper.tone.dawn},
      transparent 72%
    );
    content: '';
    pointer-events: none;
  }

  > * {
    position: relative;
  }
`
