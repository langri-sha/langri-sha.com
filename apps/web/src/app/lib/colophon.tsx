import styled from '@emotion/styled'
import * as React from 'react'

import { colors, media } from '@/styles'

import { Instruments, row } from './header'

export interface ColophonProps {
  playing: boolean
  onToggle: () => void
}

export const Colophon: React.FC<ColophonProps> = ({ playing, onToggle }) => (
  <Root>
    <Signature aria-label="Profiles">
      <Instruments playing={playing} onToggle={onToggle} />
    </Signature>
    <SignOff>
      © 2026 Filip Dupanović. Set in Georgia, under a single fragment shader.
    </SignOff>
  </Root>
)

const Root = styled.footer`
  position: relative;
  display: grid;
  justify-items: center;
  gap: 2.4rem;
  padding: 0 2rem clamp(6rem, 12vh, 12rem);
  background: ${colors.scrim};
  color: ${colors.haze};
  font-size: 1.5rem;
  font-style: italic;
  text-align: center;

  &::before {
    width: 1px;
    height: 14vh;
    background: linear-gradient(
      to bottom,
      ${colors.hairline},
      ${colors.accentGlow} 70%,
      ${colors.accent}
    );
    content: '';
  }

  ${media.reducedMotion} {
    background: ${colors.scrimDeep};
  }
`

const Signature = styled.nav`
  ${row};
  --instrument-size: clamp(4rem, 10vw, 5.6rem);
  --instrument-gap: clamp(1rem, 3vw, 2rem);
  --instrument-step: 0.6rem;
`

const SignOff = styled.p`
  max-width: 46rem;
  margin: 0;
`
