import { css, keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { colors, fonts, media } from '@/styles'

import { type Module as ModuleContent, modules, sections } from './content'
import { Micro, Section, chamfered, micro } from './panel'

const mounted = modules.filter(({ status }) => status !== 'prototype').length

export const Modules: React.FC = () => (
  <Section
    section={sections.modules}
    meta={`${mounted} mounted · ${modules.length - mounted} on the bench`}
  >
    <Bay>
      {modules.map((module, index) => (
        <Module
          key={module.name}
          module={module}
          part={`${sections.modules.part}.${index + 1}`}
        />
      ))}
    </Bay>
  </Section>
)

const Module: React.FC<{ module: ModuleContent; part: string }> = ({
  module: { name, kind, status, summary, readouts, trace, links },
  part,
}) => (
  <Card>
    <Plate>
      <Micro>{part}</Micro>
      <Status $status={status}>
        <Led $status={status} aria-hidden="true" />
        {status}
      </Status>
    </Plate>
    <Kind>{kind}</Kind>
    <Name>{name}</Name>
    <Summary>{summary}</Summary>
    <Readouts>
      {readouts.map(({ label, value }) => (
        <Readout key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </Readout>
      ))}
    </Readouts>
    {trace ? <Trace values={trace} label={`${name} weekly downloads`} /> : null}
    <Links>
      {links.map(({ label, href }) => (
        <li key={label}>
          <Jack href={href}>
            {label} <span aria-hidden="true">↗</span>
          </Jack>
        </li>
      ))}
    </Links>
  </Card>
)

const Trace: React.FC<{ values: number[]; label: string }> = ({
  values,
  label,
}) => {
  const id = React.useId()
  const min = Math.min(...values)
  const max = Math.max(...values)
  const points = values.map(
    (value, index) =>
      `${(index / (values.length - 1)) * 100},${22 - ((value - min) / (max - min || 1)) * 20}`,
  )

  return (
    <Scope viewBox="0 0 100 24" preserveAspectRatio="none" role="img">
      <title>{label}</title>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={colors.signal} stopOpacity="0.28" />
          <stop offset="1" stopColor={colors.signal} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,24 ${points.join(' ')} 100,24`}
        fill={`url(#${id})`}
      />
      <polyline points={points.join(' ')} />
    </Scope>
  )
}

const tones = {
  live: colors.signal,
  beta: colors.accent,
  prototype: colors.readoutMuted,
} as const

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
`

const Bay = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 32rem), 1fr));
  gap: 1.6rem;
`

const Card = styled.article`
  ${chamfered};
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 2rem;
`

const Plate = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid ${colors.hairline};
`

const Status = styled.span<{ $status: ModuleContent['status'] }>`
  ${micro};
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  margin-right: 1.2rem;
  color: ${({ $status }) => tones[$status]};
`

const Led = styled.span<{ $status: ModuleContent['status'] }>`
  width: 0.6rem;
  height: 0.6rem;
  border: 1px solid ${({ $status }) => tones[$status]};
  border-radius: 50%;
  background: ${({ $status }) =>
    $status === 'prototype' ? 'transparent' : tones[$status]};
  box-shadow: ${({ $status }) =>
    $status === 'prototype' ? 'none' : `0 0 0.6rem ${tones[$status]}`};

  ${media.motion} {
    ${({ $status }) =>
      $status === 'live'
        ? css`
            animation: ${blink} 2.4s ease-in-out infinite;
          `
        : null};
  }
`

const Kind = styled.span`
  ${micro};
  margin-top: 0.4rem;
  color: ${colors.readoutMuted};
`

const Name = styled.h3`
  margin: 0;
  overflow-wrap: anywhere;
  color: ${colors.readout};
  font-family: ${fonts.mono};
  font-size: 1.7rem;
  font-weight: 600;
  letter-spacing: -0.02em;
`

const Summary = styled.p`
  margin: 0;
  color: ${colors.readoutMuted};
  font-size: 1.5rem;
  line-height: 1.55;
`

const Readouts = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: auto 0 0;
  padding-top: 1.2rem;
  border-top: 1px solid ${colors.hairline};
`

const Readout = styled.div`
  & + & {
    padding-left: 1.6rem;
    border-left: 1px solid ${colors.hairline};
  }

  dt {
    ${micro};
    color: ${colors.readoutMuted};
  }

  dd {
    margin: 0.4rem 0 0;
    color: ${colors.readout};
    font-family: ${fonts.mono};
    font-size: 2rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }
`

const Scope = styled.svg`
  display: block;
  width: 100%;
  height: 3.2rem;
  overflow: visible;

  polyline {
    fill: none;
    stroke: ${colors.signal};
    stroke-width: 1.25px;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }
`

const Links = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin: 0;
  padding: 0;
  list-style: none;
`

const Jack = styled.a`
  ${micro};
  display: inline-block;
  padding: 0.6rem 1rem;
  border: 1px solid ${colors.hairline};
  color: ${colors.readout};
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    color 0.2s ease;

  &:focus-visible {
    outline: 2px solid ${colors.accent};
    outline-offset: 0.2rem;
  }

  &:focus-visible,
  &:active {
    border-color: ${colors.accent};
    color: ${colors.accent};
  }

  ${media.hover} {
    &:hover {
      border-color: ${colors.accent};
      color: ${colors.accent};
    }
  }
`
