import styled from '@emotion/styled'
import * as React from 'react'

import { media, paper } from '@/styles'

import { columns, kicker } from './grid'
import { Sparkle } from './sparkle'

export const Masthead: React.FC = () => (
  <Root>
    <Title id="desk">From the desk</Title>
    <Rule aria-hidden="true">
      <Sparkle />
    </Rule>
    <Issue>Vol. XI · Autumn 2026</Issue>
  </Root>
)

const Root = styled.div`
  ${columns};
  align-items: baseline;
  row-gap: 0.8rem;

  ${media.wide} {
    grid-template-columns: auto 1fr auto;
  }
`

const Title = styled.h2`
  margin: 0;
  font-size: clamp(2.6rem, 2rem + 1.2vw, 3.6rem);
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.01em;
`

const Rule = styled.span`
  display: none;

  ${media.wide} {
    display: flex;
    align-items: center;
    gap: 1.6rem;
    color: ${paper.tone.ember};
    font-size: 1.4rem;

    &::before,
    &::after {
      flex: 1;
      height: 1px;
      background: ${paper.tone.rule};
      content: '';
    }
  }
`

const Issue = styled.p`
  ${kicker};
  color: ${paper.tone.muted};
`
