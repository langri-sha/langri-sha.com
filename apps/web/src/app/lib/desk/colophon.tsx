import styled from '@emotion/styled'
import * as React from 'react'

import { colors, media } from '@/styles'

import { columns, kicker } from './grid'
import { Sparkle } from './sparkle'

export const Colophon: React.FC = () => (
  <Root>
    <Inner>
      <Name>Langri-Sha</Name>
      <Note>
        Set in Georgia. The night is a single fragment shader; the desk is cream
        and ink.
      </Note>
      <Aside>
        <Top href="#">
          Back to the night <Sparkle />
        </Top>
        <Small>© 2016–2026 Filip Dupanović</Small>
      </Aside>
    </Inner>
  </Root>
)

const light = '#ece6f4'
const dim = '#a7a1b8'

const Root = styled.footer`
  position: relative;
  padding-block: clamp(6.4rem, 10vw, 12rem);
  background:
    radial-gradient(ellipse 50% 70% at 30% 0%, ${colors.ember}, transparent 70%)
      no-repeat,
    radial-gradient(ellipse 50% 70% at 70% 0%, ${colors.tide}, transparent 70%)
      no-repeat,
    ${colors.nightDeep};
  color: ${light};

  &::before {
    position: absolute;
    inset: 0 0 auto;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      ${colors.accentGlow} 35%,
      rgba(64, 140, 255, 0.65) 65%,
      transparent
    );
    content: '';
  }
`

const Inner = styled.div`
  ${columns};
  row-gap: 2.4rem;
  align-items: baseline;
`

const Name = styled.p`
  margin: 0;
  font-size: 2.2rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;

  ${media.wide} {
    grid-column: 1 / 4;
  }
`

const Note = styled.p`
  max-width: 32em;
  margin: 0;
  color: ${dim};
  font-size: 1.7rem;
  font-style: italic;
  line-height: 1.5;

  ${media.wide} {
    grid-column: 4 / 9;
  }
`

const Aside = styled.div`
  display: grid;
  gap: 0.8rem;

  ${media.wide} {
    grid-column: 9 / -1;
    justify-items: end;
  }
`

const Top = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: ${colors.accent};
  font-size: 1.8rem;
  font-style: italic;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${colors.accent};
    outline-offset: 0.3rem;
  }

  svg {
    font-size: 0.8em;
  }
`

const Small = styled.p`
  ${kicker};
  color: ${dim};
  font-size: 1.2rem;
`
