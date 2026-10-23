import { css } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import type { Post } from '@/journal'
import { media, motion, paper } from '@/styles'

import { short } from './dates'
import { columns, kicker } from './grid'
import { Sparkle } from './sparkle'

const byYear = (posts: Post[]) =>
  [...posts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .reduce<[string, Post[]][]>((years, post) => {
      const year = post.date.slice(0, 4)
      const last = years.at(-1)
      if (last?.[0] === year) last[1].push(post)
      else years.push([year, [post]])
      return years
    }, [])

export const Contents: React.FC<{ posts: Post[] }> = ({ posts }) => (
  <Root aria-labelledby="contents">
    <Header>
      <Heading id="contents">Index</Heading>
      <Count>{posts.length} entries, newest first</Count>
    </Header>
    {byYear(posts).map(([year, entries]) => (
      <Year key={year} aria-labelledby={`year-${year}`}>
        <YearHeading id={`year-${year}`}>{year}</YearHeading>
        <Entries>
          {entries.map((post) => (
            <Entry key={post.slug}>
              <Meta>
                <time dateTime={post.date}>{short(post.date)}</time>
                <Topic>{post.topic}</Topic>
                <span>{post.minutes} min</span>
              </Meta>
              <Title>
                <a href={`/journal/${post.slug}`}>{post.title}</a>
                {post.featured ? <Featured aria-label="Featured" /> : null}
              </Title>
              <Dek>{post.dek}</Dek>
            </Entry>
          ))}
        </Entries>
      </Year>
    ))}
  </Root>
)

const Root = styled.section`
  ${columns};
  margin-top: clamp(8rem, 12vw, 16rem);
`

const Header = styled.header`
  display: flex;
  flex-flow: row wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.8rem 2.4rem;
  padding-bottom: 1.6rem;
  border-bottom: 1px solid ${paper.tone.ink};

  ${media.wide} {
    grid-column: 1 / -1;
  }
`

const Heading = styled.h2`
  margin: 0;
  font-size: clamp(4rem, 2.8rem + 2.4vw, 6.4rem);
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1;
`

const Count = styled.p`
  ${kicker};
  color: ${paper.tone.muted};
`

const Year = styled.section`
  display: grid;
  grid-template-columns: subgrid;
  padding-top: 2.4rem;

  ${media.wide} {
    grid-column: 1 / -1;
    padding-top: 3.2rem;
  }

  & + & {
    border-top: 1px solid ${paper.tone.rule};
  }
`

const YearHeading = styled.h3`
  margin: 0 0 0.8rem;
  color: ${paper.tone.tide};
  font-size: clamp(3.2rem, 2.4rem + 2vw, 5.6rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1;

  ${media.wide} {
    position: sticky;
    top: 3.2rem;
    align-self: start;
    grid-column: 1 / 3;
  }
`

const Entries = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.wide} {
    grid-column: 3 / -1;
  }
`

const engaged = css`
  background-size: 100% 0.36em;
`

const Entry = styled.li`
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: 0.4rem;
  padding-block: 1.6rem 2rem;

  & + & {
    border-top: 1px solid ${paper.tone.rule};
  }

  ${media.wide} {
    grid-template-columns: 12rem minmax(0, 1fr);
    column-gap: 2.4rem;
    padding-block: 2rem 2.4rem;
  }

  ${media.hover} {
    &:hover a {
      ${engaged};
    }
  }

  &:focus-within a {
    ${engaged};
  }
`

const Meta = styled.p`
  display: flex;
  flex-flow: row wrap;
  align-items: baseline;
  gap: 0.4rem 1.2rem;
  margin: 0;
  color: ${paper.tone.muted};
  font-size: 1.4rem;
  line-height: 1.4;

  time {
    ${kicker};
    color: ${paper.tone.ink};
    font-size: 1.2rem;
  }

  ${media.wide} {
    grid-row: 1 / span 2;
    flex-direction: column;
    padding-top: 0.6rem;
  }
`

const Topic = styled.span`
  color: ${paper.tone.tide};
  font-style: italic;
`

const Title = styled.h4`
  margin: 0;
  font-size: clamp(2.4rem, 1.9rem + 1vw, 3.4rem);
  font-weight: 400;
  letter-spacing: -0.01em;
  line-height: 1.15;
  text-wrap: balance;

  a {
    background: linear-gradient(
        ${paper.tone.highlight},
        ${paper.tone.highlight}
      )
      no-repeat 0 88% / 0 0.36em;
    color: inherit;
    text-decoration: none;

    &::after {
      position: absolute;
      inset: 0;
      content: '';
    }

    &:focus-visible {
      outline: 2px solid ${paper.tone.ember};
      outline-offset: 0.3rem;
    }

    ${media.motion} {
      transition: background-size 0.5s ${motion.easing};
    }
  }
`

const Featured = styled(Sparkle)`
  margin-left: 0.4em;
  color: ${paper.tone.ember};
  font-size: 0.5em;
  vertical-align: 0.6em;
`

const Dek = styled.p`
  margin: 0;
  max-width: 40em;
  color: ${paper.tone.muted};
  font-size: 1.7rem;
  line-height: 1.5;

  ${media.wide} {
    grid-column: 2;
  }
`
