import { Global, css } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { colors, fonts, media } from '@/styles'

import { Contents } from './contents'
import { Log } from './log'
import { Modules } from './modules'
import { Micro, micro } from './panel'
import { Telemetry } from './telemetry'

export const Console: React.FC = () => (
  <Root>
    <Global styles={scrolling} />
    <Seam>
      <Micro>Console / 00</Micro>
      <Node aria-hidden="true" />
      <Status>
        <Led aria-hidden="true" /> Signal nominal
      </Status>
    </Seam>
    <Layout>
      <Contents />
      <Main>
        <Log />
        <Modules />
        <Telemetry />
      </Main>
    </Layout>
    <Colophon>
      <Micro>End of transmission</Micro>
      <Micro>© Filip Dupanović</Micro>
      <Controls>
        <li>
          <Control href="https://github.com/langri-sha/langri-sha.com">
            Source <span aria-hidden="true">↗</span>
          </Control>
        </li>
        <li>
          <Control href="#">
            Top <span aria-hidden="true">↑</span>
          </Control>
        </li>
      </Controls>
    </Colophon>
  </Root>
)

const width = '130.8rem'

const scrolling = css`
  ${media.motion} {
    html {
      scroll-behavior: smooth;
    }
  }
`

const Root = styled.div`
  --gutter: clamp(1.6rem, 4vw, 4.8rem);
  position: relative;
  padding: 0 var(--gutter) 4.8rem;
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
  max-width: ${width};
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

const Layout = styled.div`
  max-width: ${width};
  margin-inline: auto;

  ${media.wide} {
    display: grid;
    grid-template-columns: 14rem minmax(0, 1fr);
    column-gap: 4.8rem;
  }
`

const Main = styled.main`
  padding-top: 3.2rem;

  ${media.wide} {
    padding-top: 0;
  }
`

const Colophon = styled.footer`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 1.6rem 3.2rem;
  max-width: ${width};
  margin: clamp(6.4rem, 12vw, 12rem) auto 0;
  padding-top: 2.4rem;
  border-top: 1px solid ${colors.hairline};
`

const Controls = styled.ul`
  display: flex;
  gap: 2.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
`

const Control = styled.a`
  ${micro};
  color: ${colors.readout};
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${colors.accent};
    outline-offset: 0.4rem;
  }

  ${media.hover} {
    &:hover {
      color: ${colors.accent};
    }
  }
`
