import styled from '@emotion/styled'

import { animations, colors, fonts, layers, media } from '../../styles'
import { Link } from '../link'
import { Docker, Github, Keybase, Npm, Stackoverflow } from './icons'

export const Header = () => (
  <Root>
    <Title>Langri-Sha</Title>
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
        <EnhancedLink
          key={name}
          href={href}
          title={title}
          target="_blank"
          eventCategory="Social Links"
          eventAction="click"
          eventLabel={name}
        >
          {icon}
        </EnhancedLink>
      ))}
    </Nav>
  </Root>
)

const Root = styled.header`
  ${animations.booming};
  ${layers.foreground};
  position: relative;
`

const Title = styled.h1`
  ${fonts.heading};
  color: ${colors.text};
  font-size: 6rem;
  letter-spacing: -0.03em;
  margin-top: 0;
  user-select: none;

  ${media.medium} {
    font-size: 8rem;
  }

  ${media.large} {
    font-size: 10rem;
  }
`

const Nav = styled.nav`
  display: flex;
  width: 100%;
  left: 0;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
`

const EnhancedLink: typeof Link = styled(Link)`
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
