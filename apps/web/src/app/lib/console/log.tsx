import { css } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { colors, fonts, media, motion } from '@/styles'

import { type Transmission, sections, transmissions } from './content'
import { Micro, Panel, Section, micro } from './panel'

export const Log: React.FC = () => (
  <Section
    section={sections.log}
    meta={`${transmissions.length} received · last ${transmissions[0]?.date}`}
  >
    <Panel>
      <Columns aria-hidden="true">
        <span>Received</span>
        <span>TX</span>
        <span>Subject</span>
        <span>Channel</span>
        <span>Length</span>
      </Columns>
      <Entries>
        {transmissions.map((transmission, index) => (
          <Entry
            key={transmission.slug}
            transmission={transmission}
            number={transmissions.length - index}
          />
        ))}
      </Entries>
    </Panel>
  </Section>
)

const Entry: React.FC<{ transmission: Transmission; number: number }> = ({
  transmission: { slug, date, title, channel, minutes, excerpt },
  number,
}) => (
  <li>
    <Details>
      <Summary>
        <Received dateTime={date}>{date}</Received>
        <Tx>TX-{String(number).padStart(3, '0')}</Tx>
        <Subject>{title}</Subject>
        <Channel>{channel}</Channel>
        <Length>{minutes} min</Length>
      </Summary>
      <Drawer>
        <Excerpt>{excerpt}</Excerpt>
        <Open href={`/log/${slug}/`}>
          Open transmission <span aria-hidden="true">→</span>
        </Open>
      </Drawer>
    </Details>
  </li>
)

const row = css`
  display: grid;
  grid-template-areas:
    'date number length marker'
    'subject subject subject subject'
    'channel channel channel channel';
  grid-template-columns: auto auto 1fr auto;
  align-items: baseline;
  gap: 0.4rem 1.6rem;
  padding: 1.4rem 2rem;

  @container (min-width: 720px) {
    grid-template-areas: 'date number subject channel length marker';
    grid-template-columns: 9.6rem 6.4rem minmax(0, 1fr) 8.8rem 6.4rem 1.2rem;
    gap: 2.4rem;
  }
`

const Columns = styled(Micro)`
  ${row};
  display: none;
  border-bottom: 1px solid ${colors.hairline};
  padding-block: 1.2rem;

  @container (min-width: 720px) {
    display: grid;
  }

  > span:last-of-type {
    text-align: right;
  }
`

const Entries = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;

  > li + li {
    border-top: 1px solid ${colors.hairline};
  }
`

const Details = styled.details`
  ${media.motion} {
    interpolate-size: allow-keywords;

    &::details-content {
      height: 0;
      overflow: clip;
      transition:
        height 0.35s ${motion.easing},
        content-visibility 0.35s allow-discrete;
    }

    &[open]::details-content {
      height: auto;
    }
  }
`

const Summary = styled.summary`
  ${row};
  position: relative;
  cursor: pointer;
  list-style: none;
  transition: background-color 0.2s ease;

  &::-webkit-details-marker {
    display: none;
  }

  &::after {
    grid-area: marker;
    align-self: center;
    justify-self: end;
    width: 0.7rem;
    height: 0.7rem;
    border: 1px solid ${colors.signal};
    content: '';
    transform: rotate(45deg);
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;
  }

  &:is([open] > *)::after {
    border-color: ${colors.accent};
    background: ${colors.accent};
  }

  &:focus-visible {
    outline: 2px solid ${colors.accent};
    outline-offset: -2px;
  }

  &:focus-visible,
  &:is([open] > *) {
    background: rgba(161, 229, 255, 0.05);
  }

  ${media.hover} {
    &:hover {
      background: rgba(161, 229, 255, 0.05);
    }
  }
`

const readout = css`
  ${micro};
  color: ${colors.readoutMuted};
  white-space: nowrap;
`

const Received = styled.time`
  ${readout};
  grid-area: date;
`

const Tx = styled.span`
  ${readout};
  grid-area: number;
  color: ${colors.signal};

  &:is([open] > summary > *) {
    color: ${colors.accent};
  }
`

const Subject = styled.span`
  grid-area: subject;
  color: ${colors.readout};
  font-family: ${fonts.sans};
  font-size: 1.6rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.35;
`

const Channel = styled.span`
  ${readout};
  grid-area: channel;
`

const Length = styled.span`
  ${readout};
  grid-area: length;
  text-align: right;
`

const Drawer = styled.div`
  display: grid;
  gap: 1.6rem;
  justify-items: start;
  padding: 0.4rem 2rem 2.4rem;

  @container (min-width: 720px) {
    padding-left: calc(2rem + 9.6rem + 6.4rem + 4.8rem);
  }
`

const Excerpt = styled.p`
  max-width: 62ch;
  margin: 0;
  color: ${colors.readoutMuted};
  font-family: ${fonts.sans};
  font-size: 1.5rem;
  line-height: 1.6;
`

const Open = styled.a`
  ${micro};
  color: ${colors.accent};
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${colors.accent};
    outline-offset: 0.4rem;
  }

  ${media.hover} {
    &:hover {
      text-decoration: underline;
      text-underline-offset: 0.4rem;
    }
  }
`
