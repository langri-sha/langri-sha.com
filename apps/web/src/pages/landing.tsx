import * as React from 'react'
import styled from '@emotion/styled'
import { Global } from '@emotion/react'

import { colors, global } from '../styles'
import { Drone, Header, Scene } from '../components'

export const Landing = () => (
  <React.Fragment>
    <Global styles={global} />
    <Root>
      <Header />
      <Scene />
      <Drone />
    </Root>
  </React.Fragment>
)

const Root = styled.div`
  display: flex;
  background: ${colors.background};
  height: 100vh;
  width: 100vw;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
`
