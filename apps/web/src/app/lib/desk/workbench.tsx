import { css } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { media, motion, paper } from '@/styles'

import { columns, kicker } from './grid'

interface Item {
  name: string
  note: string
  href: string
}

const shelves: { title: string; items: Item[] }[] = [
  {
    title: 'Projects',
    items: [
      {
        name: 'langri-sha/dagger',
        note: 'Reusable Dagger modules for checks, Terraform and CI.',
        href: 'https://github.com/langri-sha/dagger',
      },
      {
        name: 'langri-sha/github',
        note: 'Workflows and composite actions for CI, releases and cloud auth.',
        href: 'https://github.com/langri-sha/github',
      },
      {
        name: 'langri-sha/projen',
        note: 'Packages that scaffold, configure and maintain repositories.',
        href: 'https://github.com/langri-sha/projen',
      },
      {
        name: 'langri-sha/langri-sha.com',
        note: 'The source of this page, the night and the paper both.',
        href: 'https://github.com/langri-sha/langri-sha.com',
      },
    ],
  },
  {
    title: 'Packages',
    items: [
      {
        name: '@langri-sha/projen-project',
        note: 'Projen templates for monorepos and workspace projects.',
        href: 'https://www.npmjs.com/package/@langri-sha/projen-project',
      },
      {
        name: '@langri-sha/eslint-config',
        note: 'A shared ESLint flat config.',
        href: 'https://www.npmjs.com/package/@langri-sha/eslint-config',
      },
      {
        name: '@langri-sha/tsconfig',
        note: 'TypeScript configs that type-check JavaScript and TypeScript alike.',
        href: 'https://www.npmjs.com/package/@langri-sha/tsconfig',
      },
      {
        name: '@langri-sha/prettier',
        note: 'An opinionated Prettier config for readable code.',
        href: 'https://www.npmjs.com/package/@langri-sha/prettier',
      },
    ],
  },
  {
    title: 'Elsewhere',
    items: [
      {
        name: 'GitHub',
        note: 'langri-sha',
        href: 'https://github.com/langri-sha',
      },
      {
        name: 'npm',
        note: '~langri-sha',
        href: 'https://www.npmjs.com/~langri-sha',
      },
      {
        name: 'Docker Hub',
        note: 'langrisha',
        href: 'https://hub.docker.com/u/langrisha/',
      },
      {
        name: 'Stack Overflow',
        note: 'Filip Dupanović',
        href: 'https://stackoverflow.com/users/44041/filip-dupanovi%C4%87?tab=profile',
      },
    ],
  },
]

export const Workbench: React.FC = () => (
  <Root aria-labelledby="workbench">
    <Inner>
      <Header>
        <Heading id="workbench">Workbench</Heading>
        <Intro>
          What I build and maintain between essays, and where else to find me.
        </Intro>
      </Header>
      {shelves.map(({ title, items }) => (
        <Shelf key={title} aria-label={title}>
          <ShelfTitle>{title}</ShelfTitle>
          <Items>
            {items.map(({ name, note, href }) => (
              <li key={name}>
                <Tile href={href}>
                  <Diamond />
                  <Name>{name}</Name>
                  <Note>{note}</Note>
                  <Arrow aria-hidden="true">↗</Arrow>
                </Tile>
              </li>
            ))}
          </Items>
        </Shelf>
      ))}
    </Inner>
  </Root>
)

const Diamond: React.FC = () => (
  <Mark viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <polygon points="50,6 94,50 50,94 6,50" />
    <polygon points="50,24 76,50 50,76 24,50" />
    <circle cx="50" cy="6" r="7" />
  </Mark>
)

const Root = styled.section`
  margin-top: clamp(8rem, 12vw, 16rem);
  padding-block: clamp(4.8rem, 8vw, 9.6rem);
  border-block: 1px solid ${paper.tone.rule};
  background-color: ${paper.tone.shade};
  background-image: radial-gradient(${paper.tone.rule} 1px, transparent 1.2px);
  background-size: 1.2rem 1.2rem;
`

const Inner = styled.div`
  ${columns};
  row-gap: 4rem;
`

const Header = styled.header`
  display: grid;
  gap: 1.2rem;

  ${media.wide} {
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    align-items: baseline;
  }
`

const Heading = styled.h2`
  margin: 0;
  font-size: clamp(4rem, 2.8rem + 2.4vw, 6.4rem);
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1;

  ${media.wide} {
    grid-column: 1 / 6;
  }
`

const Intro = styled.p`
  max-width: 32em;
  margin: 0;
  color: ${paper.tone.muted};
  font-size: 1.9rem;
  font-style: italic;
  line-height: 1.45;

  ${media.wide} {
    grid-column: 6 / -1;
  }
`

const Shelf = styled.section`
  ${media.wide} {
    grid-column: span 4;
  }
`

const ShelfTitle = styled.h3`
  ${kicker};
  padding-bottom: 1.2rem;
  border-bottom: 1px solid ${paper.tone.ink};
  color: ${paper.tone.ember};
`

const Items = styled.ul`
  display: grid;
  gap: 1.2rem;
  margin: 1.6rem 0 0;
  padding: 0;
  list-style: none;
`

const engaged = css`
  border-color: ${paper.tone.ink};
`

const Arrow = styled.span`
  grid-area: 1 / 3;
  color: ${paper.tone.muted};

  ${media.motion} {
    transition: transform 0.3s ${motion.easing};
  }
`

const Tile = styled.a`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  column-gap: 1.2rem;
  row-gap: 0.4rem;
  align-items: baseline;
  padding: 1.6rem 1.6rem 1.8rem;
  border: 1px solid ${paper.tone.rule};
  border-radius: 2px;
  background: ${paper.tone.ground};
  color: inherit;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${paper.tone.ember};
    outline-offset: 0.2rem;
    ${engaged};
  }

  ${media.hover} {
    &:hover {
      ${engaged};
    }

    ${media.motion} {
      &:hover ${Arrow} {
        transform: translate(0.2rem, -0.2rem);
      }
    }
  }
`

const Mark = styled.svg`
  grid-area: 1 / 1;
  width: 1.2rem;
  height: 1.2rem;
  fill: none;
  stroke: ${paper.tone.tide};
  stroke-width: 5;

  circle {
    fill: ${paper.tone.ember};
    stroke: none;
  }
`

const Name = styled.span`
  grid-area: 1 / 2;
  font-size: 2rem;
  line-height: 1.25;
  overflow-wrap: anywhere;
`

const Note = styled.span`
  grid-area: 2 / 2 / 3 / 4;
  color: ${paper.tone.muted};
  font-size: 1.5rem;
  line-height: 1.45;
`
