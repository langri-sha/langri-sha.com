import * as React from 'react'
import styled from '@emotion/styled'
import { Global } from '@emotion/react'

import { global } from '../styles'
import { Drone, Header, Scene } from '../components'

export const Landing = () => (
  <React.Fragment>
    <Global styles={global} />
    <Root>
      <Root>
        <Header />
        <Scene />
        <Drone />
      </Root>
    </Root>
  </React.Fragment>
)

const Root = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    top: -20%;
    left: 0;
    width: 100vw;
    height: 100vh;
    mix-blend-mode: color-dodge;
    background:
      radial-gradient(
          circle farthest-corner at 0 0,
          #3d1b6d 30%,
          #e438dc 65%,
          #404b8c 80%,
          #79acbb 110%
        )
        no-repeat,
      radial-gradient(closest-side at 60% 50%, #7f4dad 20%, #000 100%) no-repeat,
      radial-gradient(
          circle farthest-corner at 0 0,
          #3d1b6d 30%,
          #e438dc 65%,
          #404b8c 80%,
          #79acbb 110%
        )
        no-repeat,
      radial-gradient(closest-side at 60% 50%, #7f4dad 20%, #000 100%) no-repeat;
  }
`
