import styled from '@emotion/styled'
import * as React from 'react'

import * as colors from '@/styles/colors'
import { medium } from '@/styles/media'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}) => (
  <Root>
    <Label>
      <span>{label}</span>
      <Value>
        {Number.isInteger(step) ? value : value.toFixed(2)}
        {unit ? ` ${unit}` : ''}
      </Value>
    </Label>
    <Input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={label}
    />
  </Root>
)

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`

const Label = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 1.2rem;
  color: ${colors.textMuted};

  ${medium} {
    font-size: 1.3rem;
  }
`

const Value = styled.span`
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: ${colors.text};
`

const Input = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: ${colors.border};
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${colors.accent};
    cursor: pointer;
    box-shadow: 0 0 8px ${colors.accentGlow};
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border: none;
    border-radius: 50%;
    background: ${colors.accent};
    cursor: pointer;
    box-shadow: 0 0 8px ${colors.accentGlow};
  }

  &:focus-visible {
    outline: 2px solid ${colors.accent};
    outline-offset: 4px;
  }
`
