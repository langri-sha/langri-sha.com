'use client'

import styled from '@emotion/styled'
import * as React from 'react'

import type { Post } from '@/journal'
import { paper } from '@/styles'

import { Contents } from './contents'
import { Featured } from './featured'
import { Masthead } from './masthead'
import { Workbench } from './workbench'

export interface DeskProps {
  posts: Post[]
}

export const Desk: React.FC<DeskProps> = ({ posts }) => {
  const featured = posts.find((post) => post.featured)

  return (
    <Root aria-labelledby="desk">
      <Masthead />
      {featured ? <Featured post={featured} /> : null}
      <Contents posts={posts} />
      <Workbench />
    </Root>
  )
}

const Root = styled.main`
  position: relative;
  padding-block: clamp(8rem, 14vh, 14rem) clamp(6.4rem, 10vh, 12rem);
  color: ${paper.tone.ink};

  &::before {
    position: absolute;
    inset: 0 0 auto;
    height: 56rem;
    background: radial-gradient(
      ellipse 60% 100% at 50% 0%,
      ${paper.tone.dawn},
      transparent 72%
    );
    content: '';
    pointer-events: none;
  }

  > * {
    position: relative;
  }
`
