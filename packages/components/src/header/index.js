// @flow
import * as React from 'react'
import styled from '@emotion/styled'

import { animations, colors, fonts, layers, media } from '@langri-sha/styles'
import Link from '../link'
import { Docker, Npm, Keybase, Github, Stackoverflow } from './icons'

export default (): React.Element<typeof Header> => (
  <Header>
    <Title>Langri-Sha</Title>
    <Nav>
      {[
        [
          'Stack Overflow',
          'https://stackoverflow.com/users/44041/filip-dupanovi%C4%87?tab=profile',
          'StackOverflow profile #SOreadytohelp 💓',
          <Stackoverflow />
        ],
        [
          'Keybase',
          'https://keybase.io/langrisha',
          'Identity details on Keybase.io',
          <Keybase />
        ],
        [
          'GitHub',
          'https://github.com/langri-sha',
          'GitHub profile',
          <Github />
        ],
        [
          'Docker',
          'https://hub.docker.com/u/langrisha/',
          'Docker Hub profile',
          <Docker />
        ],
        ['NPM', 'https://www.npmjs.com/~langri-sha', 'NPM profile', <Npm />]
      ].map(([name, href, title, icon]) => (
        <EnhancedLink
          key={name}
          href={href}
          title={title}
          target="_blank"
          category="Social Links"
          action="click"
          label={name}
        >
          {icon}
        </EnhancedLink>
      ))}
    </Nav>
  </Header>
)

const Header: React.AbstractComponent<
  React.ElementConfig<'header'>,
  HTMLElement
> = styled.header`
  ${animations.booming};
  ${layers.foreground};
  position: relative;
`

const Title = styled.h1`
  ${fonts.heading};
  color: ${colors.text};
  font-size: 6rem;
  letter-spacing: -0.03em;
  user-select: none;

  ${media.medium} {
    font-size: 8rem;
  }

  ${media.large} {
    font-size: 10rem;
  }
`

const Nav = styled.nav`
  position: absolute;
  display: flex;
  width: 100%;
  left: 0;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
`

const EnhancedLink = styled(Link)`
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
