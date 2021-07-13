// @flow
import * as React from 'react'
import styled from '@emotion/styled'
import { Global } from '@emotion/react'

import { colors, global } from '@langri-sha/styles'
import { Analytics, Drone, Header, Scene } from '@langri-sha/components'

export const Landing = (): React.Element<typeof React.Fragment> => (
  <React.Fragment>
    <Global styles={global} />
    <Root>
      <Header />
      <Scene />
      <Drone />
      <Analytics id="UA-86127521-1" />
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
