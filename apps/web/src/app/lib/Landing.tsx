/** @jsxImportSource @emotion/react */
'use client'

import { Global } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { Drone, Header, Scene } from '@/components'
import { global } from '@/styles'

export const Landing: React.FC = () => (
  <React.Fragment>
    <Global styles={global} />
    <Root>
      <Root>
        <Header />
        {process.env.EXPERIMENTAL_SCENE ? <Scene /> : null}
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
