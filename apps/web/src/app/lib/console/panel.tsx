import { type SerializedStyles, css } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { colors, fonts } from '@/styles'

import type { Section as SectionContent } from './content'

export const micro: SerializedStyles = css`
  font-family: ${fonts.mono};
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  line-height: 1.4;
  text-transform: uppercase;
`

export const Micro = styled.span`
  ${micro};
  color: ${colors.readoutMuted};
`

export const chamfered: SerializedStyles = css`
  --chamfer: 1.6rem;
  position: relative;
  border: 1px solid ${colors.hairline};
  background: ${colors.panel};
  clip-path: polygon(
    0 0,
    calc(100% - var(--chamfer)) 0,
    100% var(--chamfer),
    100% 100%,
    0 100%
  );

  &::after {
    position: absolute;
    top: -1px;
    right: -1px;
    width: var(--chamfer);
    height: var(--chamfer);
    background: linear-gradient(
      to top right,
      transparent calc(50% - 1px),
      ${colors.accent} calc(50% - 1px) calc(50% + 1px),
      transparent calc(50% + 1px)
    );
    content: '';
    pointer-events: none;
  }
`

export const Panel = styled.div`
  ${chamfered};
  container-type: inline-size;
`

export interface SectionProps {
  section: SectionContent
  meta?: React.ReactNode
  children: React.ReactNode
}

export const Section: React.FC<SectionProps> = ({
  section,
  meta,
  children,
}) => (
  <Root id={section.id} aria-labelledby={`${section.id}-title`}>
    <Heading>
      <Part>{section.part}</Part>
      <Rule aria-hidden="true" />
      {meta ? <Micro>{meta}</Micro> : null}
      <Title id={`${section.id}-title`}>{section.title}</Title>
    </Heading>
    {children}
  </Root>
)

const Root = styled.section`
  scroll-margin-top: 4.8rem;

  & + & {
    margin-top: clamp(6.4rem, 12vw, 12rem);
  }
`

const Heading = styled.div`
  display: grid;
  grid-template-columns: auto minmax(2.4rem, 1fr) auto;
  align-items: center;
  gap: 1.2rem 1.6rem;
  margin-bottom: 2.4rem;
`

const Part = styled.span`
  ${micro};
  color: ${colors.accent};
`

const Rule = styled.span`
  height: 1px;
  background: linear-gradient(to right, ${colors.hairline}, transparent);
`

const Title = styled.h2`
  grid-column: 1 / -1;
  margin: 0;
  color: ${colors.readout};
  font-family: ${fonts.sans};
  font-size: clamp(2.8rem, 4.4vw, 4.8rem);
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1;
`
