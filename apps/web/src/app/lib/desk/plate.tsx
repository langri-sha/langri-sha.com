import styled from '@emotion/styled'
import * as React from 'react'

import { paper } from '@/styles'

const radius = [0.3, 0.44]
const sharpness = 0.64
const steps = 96

const lip = (from: number, to: number) => {
  const points = Array.from({ length: steps + 1 }, (_, index) => {
    const t = from + ((to - from) * index) / steps
    const [cos, sin] = [Math.cos(t), Math.sin(t)]
    const x = radius[0] * Math.sign(cos) * Math.abs(cos) ** (2 / sharpness)
    const y = radius[1] * Math.sign(sin) * Math.abs(sin) ** (2 / sharpness)
    return `${x.toFixed(4)} ${(-y).toFixed(4)}`
  })
  return `M${points.join('L')}`
}

const left = lip(Math.PI / 2, (3 * Math.PI) / 2)
const right = lip(-Math.PI / 2, Math.PI / 2)

const bands = [
  { r: 0.43, tone: paper.tone.ember, dash: '6 5' },
  { r: 0.62, tone: paper.tone.tide, dash: '1.5 5' },
]

const stars = [
  [-0.71, -0.47],
  [-0.52, 0.41],
  [-0.33, -0.18],
  [0.29, -0.51],
  [0.48, 0.12],
  [0.66, 0.44],
  [0.74, -0.27],
  [-0.78, 0.08],
]

export const Plate: React.FC<{ className?: string }> = ({ className }) => (
  <Figure className={className}>
    <Svg viewBox="-0.84 -0.6 1.68 1.2" role="img" aria-labelledby="plate">
      <path d="M-0.84 0H0.84M0 -0.6V0.6" style={{ stroke: paper.tone.rule }} />
      {bands.map(({ r, tone, dash }) => (
        <ellipse
          key={r}
          rx={(r / 0.82).toFixed(4)}
          ry={(r / 1.18).toFixed(4)}
          style={{ stroke: tone, strokeDasharray: dash }}
        />
      ))}
      <path
        d={`${left}${right.replace('M', 'L')}Z`}
        style={{ fill: paper.tone.ink }}
      />
      <Lip d={left} style={{ stroke: paper.tone.ember }} />
      <Lip d={right} style={{ stroke: paper.tone.tide }} />
      {stars.map(([x, y]) => (
        <circle
          key={`${x}${y}`}
          cx={x}
          cy={y}
          r={0.006}
          style={{ fill: paper.tone.muted }}
        />
      ))}
    </Svg>
    <Caption id="plate">
      <i>Fig. 1</i> — The star at the centre of the rift,{' '}
      <span>
        |x/0.30|<sup>0.64</sup> + |y/0.44|<sup>0.64</sup> = 1
      </span>
      , drawn from the shader&apos;s own constants.
    </Caption>
  </Figure>
)

const Figure = styled.figure`
  margin: 0;
  padding: 1.6rem;
  border: 1px solid ${paper.tone.rule};
  border-radius: 2px;
`

const Svg = styled.svg`
  display: block;
  width: 100%;
  height: auto;
  fill: none;
  stroke-width: 1px;

  * {
    vector-effect: non-scaling-stroke;
  }
`

const Lip = styled.path`
  stroke-width: 1.8px;
  stroke-linejoin: round;
`

const Caption = styled.figcaption`
  margin-top: 1.2rem;
  color: ${paper.tone.muted};
  font-size: 1.4rem;
  line-height: 1.5;

  span {
    white-space: nowrap;
  }
`
