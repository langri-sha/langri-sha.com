import styled from '@emotion/styled'
import * as React from 'react'

import { colors, fonts } from '@/styles'

import { Log } from './log'
import { Modules } from './modules'
import { Micro, micro } from './panel'
import { Telemetry } from './telemetry'

export const Console: React.FC = () => (
  <Root>
    <Seam>
      <Micro>Console / 00</Micro>
      <Node aria-hidden="true" />
      <Status>
        <Led aria-hidden="true" /> Signal nominal
      </Status>
    </Seam>
    <Main>
      <Log />
      <Modules />
      <Telemetry />
    </Main>
  </Root>
)

const Root = styled.div`
  --gutter: clamp(1.6rem, 4vw, 4.8rem);
  position: relative;
  padding: 0 var(--gutter) 12rem;
  color: ${colors.readout};
  font-family: ${fonts.sans};
  background:
    radial-gradient(
        circle,
        rgba(147, 207, 255, 0.07) 0.1rem,
        transparent 0.15rem
      )
      0 0 / 2.4rem 2.4rem,
    radial-gradient(
        ellipse 50% 48rem at 8% 36rem,
        ${colors.ember},
        transparent 70%
      )
      no-repeat,
    radial-gradient(
        ellipse 50% 56rem at 96% 120rem,
        ${colors.tide},
        transparent 70%
      )
      no-repeat,
    linear-gradient(${colors.nightCore}, ${colors.nightDeep} 64rem);
`

const Seam = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1.6rem;
  max-width: 112rem;
  margin-inline: auto;
  padding-block: 2.4rem clamp(4.8rem, 8vw, 9.6rem);

  &::before {
    grid-area: 1 / 2;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      ${colors.hairline} 20%,
      ${colors.hairline} 80%,
      transparent
    );
    content: '';
  }
`

const Node = styled.span`
  grid-area: 1 / 2;
  justify-self: center;
  width: 0.8rem;
  height: 0.8rem;
  border: 1px solid ${colors.accent};
  background: ${colors.nightCore};
  transform: rotate(45deg);
`

const Status = styled.span`
  ${micro};
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: ${colors.readoutMuted};
`

const Led = styled.span`
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  background: ${colors.signal};
  box-shadow: 0 0 0.6rem ${colors.signal};
`

const Main = styled.main`
  max-width: 112rem;
  margin-inline: auto;
`
