import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { colors, fonts, media } from '@/styles'

import { activity, readings, sections } from './content'
import { Micro, Panel, Section, micro } from './panel'

export const Telemetry: React.FC = () => (
  <Section section={sections.telemetry} meta="Placeholder readings">
    <Panel>
      <Readings>
        {readings.map(({ label, value, window, delta, source }) => (
          <Reading key={label}>
            <Micro as="dt">{label}</Micro>
            <Value>{value}</Value>
            <Footnote>
              <Delta $falling={delta.startsWith('−')}>{delta}</Delta> / {window}
            </Footnote>
            <Footnote>src / {source}</Footnote>
          </Reading>
        ))}
      </Readings>
      <Activity>
        <Micro>Commits per week</Micro>
        <Bars
          role="img"
          aria-label={`Commits per week over the last ${activity.length} weeks, between ${Math.min(...activity)} and ${Math.max(...activity)}`}
        >
          {activity.map((count, index) => (
            <span
              key={index}
              style={
                {
                  '--bar-height': `${(count / Math.max(...activity)) * 100}%`,
                } as React.CSSProperties
              }
            />
          ))}
        </Bars>
        <Axis aria-hidden="true">
          <span>{activity.length} weeks ago</span>
          <span>Now</span>
        </Axis>
      </Activity>
    </Panel>
  </Section>
)

const rise = keyframes`
  from { transform: scaleY(0.2); opacity: 0.4; }
  to { transform: scaleY(1); opacity: 1; }
`

const Readings = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  margin: 0;
`

const Reading = styled.div`
  display: grid;
  align-content: start;
  gap: 0.4rem;
  padding: 2.4rem 2rem;
  border-bottom: 1px solid ${colors.hairline};
  box-shadow: 1px 0 0 ${colors.hairline};
`

const Value = styled.dd`
  margin: 0.4rem 0;
  color: ${colors.readout};
  font-family: ${fonts.mono};
  font-size: clamp(3.2rem, 4vw, 4.4rem);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.04em;
  line-height: 1;
`

const Footnote = styled.dd`
  ${micro};
  margin: 0;
  color: ${colors.readoutMuted};
`

const Delta = styled.span<{ $falling: boolean }>`
  color: ${({ $falling }) => ($falling ? colors.accent : colors.signal)};
`

const Activity = styled.div`
  display: grid;
  gap: 1.2rem;
  padding: 2.4rem 2rem 2rem;
`

const Bars = styled.div`
  display: flex;
  align-items: flex-end;
  gap: clamp(2px, 0.4vw, 6px);
  height: 9.6rem;
  filter: drop-shadow(0 0 6px rgba(69, 151, 255, 0.35));

  span {
    flex: 1;
    height: var(--bar-height);
    border-radius: 2px;
    background: linear-gradient(#e8fcff, #99dbff 40%, #438ee0 80%, #7275d5);
    transform-origin: bottom;
  }

  ${media.motion} {
    @supports (animation-timeline: view()) {
      span {
        animation: ${rise} linear both;
        animation-range: entry 0% cover 35%;
        animation-timeline: view();
      }
    }
  }
`

const Axis = styled(Micro)`
  display: flex;
  justify-content: space-between;
`
