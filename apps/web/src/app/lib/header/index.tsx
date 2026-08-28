import styled from '@emotion/styled'
import * as React from 'react'

import { animations, colors, media } from '@/styles'

import { Docker, Github, Keybase, Npm, Stackoverflow } from './icons'
import { Wordmark } from './wordmark'

export const Header: React.FC = () => (
  <Root>
    <Title>
      <Wordmark />
    </Title>
    <Nav>
      {(
        [
          [
            'Stack Overflow',
            'https://stackoverflow.com/users/44041/filip-dupanovi%C4%87?tab=profile',
            'StackOverflow profile #SOreadytohelp 💓',
            <Stackoverflow key={'stackoverflow'} />,
          ],
          [
            'GitHub',
            'https://github.com/langri-sha',
            'GitHub profile',
            <Github key={'github'} />,
          ],
          [
            'Docker',
            'https://hub.docker.com/u/langrisha/',
            'Docker Hub profile',
            <Docker key={'docker'} />,
          ],
          [
            'NPM',
            'https://www.npmjs.com/~langri-sha',
            'NPM profile',
            <Npm key={'npm'} />,
          ],
          [
            'Keybase',
            'https://keybase.io/langrisha',
            'Identity details on Keybase.io',
            <Keybase key={'keybase'} />,
          ],
        ] as const
      ).map(([name, href, title, icon]) => (
        <Link key={name} href={href} title={title}>
          {icon}
        </Link>
      ))}
    </Nav>
  </Root>
)

// The entrance animation lives on the children rather than here: an animated
// transform and opacity form a stacking context for as long as they run, which
// would isolate everything inside the header from the scene painted behind it.
const Root = styled.header`
  position: relative;
`

const Title = styled.h1`
  width: min(80vw, 60rem);
  margin-top: 0;
  user-select: none;
`

const Nav = styled.nav`
  ${animations.booming};
  display: flex;
  width: 100%;
  left: 0;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
`

const Link = styled.a`
  color: ${colors.text};
  font-size: 3.2rem;
  text-decoration: none;
  margin: 1rem;

  ${media.medium} {
    font-size: 4.8rem;
  }

  ${media.large} {
    font-size: 6.4rem;
  }
`
