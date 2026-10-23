import styled from '@emotion/styled'
import * as React from 'react'

import type { Post } from '@/journal'
import { media, paper } from '@/styles'

import { long } from './dates'
import { columns, kicker } from './grid'
import { Plate } from './plate'
import { Sparkle } from './sparkle'

export const Featured: React.FC<{ post: Post }> = ({ post }) => (
  <Root aria-labelledby="featured">
    <Kicker>
      <Sparkle /> Featured essay
    </Kicker>
    <Headline id="featured">
      <a href={`/journal/${post.slug}`}>{post.title}</a>
    </Headline>
    <Dek>{post.dek}</Dek>
    <Byline>
      Filip Dupanović · <time dateTime={post.date}>{long(post.date)}</time> ·{' '}
      {post.minutes} min read
    </Byline>
    <Lead>
      {post.lead?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <More href={`/journal/${post.slug}`}>
        Continue reading <span aria-hidden="true">→</span>
      </More>
    </Lead>
    <Figure />
  </Root>
)

const Root = styled.article`
  ${columns};
  margin-top: clamp(4.8rem, 8vw, 9.6rem);
  row-gap: 2.4rem;
`

const Kicker = styled.p`
  ${kicker};
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1.6rem;
  border-top: 1px solid ${paper.tone.ink};
  color: ${paper.tone.ember};

  ${media.wide} {
    grid-column: 1 / -1;
  }
`

const Headline = styled.h3`
  margin: 0;
  font-size: clamp(4.4rem, 2.4rem + 4.4vw, 9.6rem);
  font-weight: 400;
  letter-spacing: -0.025em;
  line-height: 0.98;
  text-wrap: balance;

  a {
    color: inherit;
    text-decoration: none;
  }

  a:focus-visible {
    outline: 2px solid ${paper.tone.ember};
    outline-offset: 0.4rem;
  }

  ${media.wide} {
    grid-column: 1 / 9;
  }
`

const Figure = styled(Plate)`
  ${media.wide} {
    grid-column: 9 / -1;
    grid-row: 2 / span 4;
    align-self: start;
    margin-top: 1.2rem;
  }
`

const Dek = styled.p`
  margin: 0;
  max-width: 34em;
  color: ${paper.tone.muted};
  font-size: clamp(2rem, 1.6rem + 0.7vw, 2.6rem);
  font-style: italic;
  line-height: 1.35;

  ${media.wide} {
    grid-column: 1 / 8;
  }
`

const Byline = styled.p`
  ${kicker};
  color: ${paper.tone.muted};
  font-size: 1.2rem;

  ${media.wide} {
    grid-column: 1 / 8;
  }
`

const Lead = styled.div`
  max-width: 36em;
  font-size: 1.9rem;
  line-height: 1.6;

  p {
    margin: 0 0 1.2em;
  }

  p:first-of-type::first-letter {
    float: left;
    margin: 0.08em 0.1em 0 0;
    color: ${paper.tone.ember};
    font-size: 3.4em;
    line-height: 0.82;
  }

  ${media.wide} {
    grid-column: 1 / 8;
    font-size: 2rem;
  }
`

const More = styled.a`
  color: ${paper.tone.ember};
  font-style: italic;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.25em;

  &:focus-visible {
    outline: 2px solid ${paper.tone.ember};
    outline-offset: 0.3rem;
  }
`
