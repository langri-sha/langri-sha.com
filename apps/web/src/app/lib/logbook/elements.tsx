'use client'

import { css } from '@emotion/react'
import styled from '@emotion/styled'

import { colors, media } from '@/styles'

const spine = 'clamp(2.8rem, 4vw, 4.8rem)'

const star = css`
  clip-path: polygon(
    50% 0,
    61% 39%,
    100% 50%,
    61% 61%,
    50% 100%,
    39% 61%,
    0 50%,
    39% 39%
  );
  background: linear-gradient(
    135deg,
    #fff1df,
    #ffaf9f 40%,
    #ed789f 75%,
    #b3a1fa
  );
`

const link = css`
  color: inherit;
  text-decoration: none;
  text-underline-offset: 0.24em;
  text-decoration-thickness: 1px;
  transition: color 0.3s ease;

  &:focus-visible {
    outline: 2px solid ${colors.accent};
    outline-offset: 0.4rem;
    color: ${colors.accent};
    text-decoration-line: underline;
  }

  ${media.hover} {
    &:hover {
      color: ${colors.accent};
      text-decoration-line: underline;
    }
  }
`

export const Main = styled.main`
  position: relative;
  padding: 0 clamp(2rem, 5vw, 6rem) clamp(8rem, 14vh, 16rem);
  background: linear-gradient(to bottom, transparent, ${colors.scrim} 60vh);
  color: ${colors.moonlight};
  font-size: 1.8rem;
  line-height: 1.6;
`

export const Threshold = styled.div`
  display: grid;
  justify-items: center;
  margin-top: -14vh;
  padding-bottom: clamp(4.8rem, 9vh, 9.6rem);
  text-align: center;

  &::before {
    width: 1px;
    height: 22vh;
    margin-bottom: 2.4rem;
    background: linear-gradient(
      to bottom,
      transparent,
      ${colors.accentGlow} 70%,
      ${colors.accent}
    );
    content: '';
  }
`

export const Heading = styled.h2`
  margin: 0;
  color: ${colors.starlight};
  font-size: clamp(3.2rem, 5vw, 5.6rem);
  font-variant-caps: all-small-caps;
  font-weight: normal;
  letter-spacing: 0.24em;
  line-height: 1;
`

export const Deck = styled.p`
  max-width: 46rem;
  margin: 1.6rem 0 0;
  color: ${colors.haze};
  font-style: italic;
`

export const Stream = styled.ol`
  position: relative;
  display: grid;
  gap: clamp(4.8rem, 7vh, 7.2rem);
  max-width: 68rem;
  margin: 0 auto;
  padding: 0 0 0 ${spine};
  list-style: none;

  &::before {
    position: absolute;
    top: 0.8rem;
    bottom: 0;
    left: 0.6rem;
    width: 1px;
    background: linear-gradient(
      to bottom,
      ${colors.accentGlow},
      ${colors.hairline} 24rem,
      ${colors.hairline} calc(100% - 12rem),
      transparent
    );
    content: '';
  }
`

export const Item = styled.li`
  position: relative;

  &::before {
    ${star};
    position: absolute;
    top: 0.5rem;
    left: calc(-1 * ${spine});
    width: 1.2rem;
    height: 1.2rem;
    content: '';
  }

  &:first-of-type::before {
    top: 0.2rem;
    left: calc(-1 * ${spine} - 0.4rem);
    width: 2rem;
    height: 2rem;
    filter: drop-shadow(0 0 0.6rem ${colors.accentGlow});
  }
`

export const Meta = styled.p`
  margin: 0 0 0.8rem;
  color: ${colors.haze};
  font-size: 1.6rem;
  font-variant-caps: all-small-caps;
  letter-spacing: 0.1em;
  line-height: 1.2;
`

export const Title = styled.h3`
  margin: 0;
  color: ${colors.starlight};
  font-size: clamp(2.4rem, 3vw, 3rem);
  font-weight: normal;
  line-height: 1.2;
  text-wrap: balance;

  a {
    ${link};
  }
`

export const Lead = styled(Title)`
  color: ${colors.accent};
  font-size: clamp(3rem, 4.4vw, 4.4rem);
  line-height: 1.12;
`

export const Summary = styled.p`
  margin: 1.2rem 0 0;
`

export const Tags = styled.p`
  margin: 0.8rem 0 0;
  color: ${colors.haze};
  font-size: 1.5rem;
  font-style: italic;
`

export const Prose = styled.div`
  margin-top: 2.4rem;
  font-size: clamp(1.8rem, 1.5vw, 2rem);
  line-height: 1.7;

  p {
    margin: 0 0 1.4em;
  }

  p:first-of-type::first-letter {
    float: left;
    margin: 0.06em 0.12em 0 0;
    color: ${colors.accent};
    font-size: 3.4em;
    line-height: 0.86;
  }
`

export const More = styled.a`
  ${link};
  color: ${colors.accent};
  font-style: italic;
`

export const Archive = styled.p`
  max-width: 68rem;
  margin: clamp(4.8rem, 7vh, 7.2rem) auto 0;
  padding-left: ${spine};
  color: ${colors.haze};
  font-style: italic;

  a {
    ${link};
    color: ${colors.starlight};
  }
`
