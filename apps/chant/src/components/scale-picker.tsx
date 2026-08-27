import styled from '@emotion/styled'
import * as React from 'react'

import * as colors from '@/styles/colors'

const SCALES: Record<string, number[]> = {
  Major: [0, 2, 4, 5, 7, 9, 11, 12, 14],
  'Natural minor': [0, 2, 3, 5, 7, 8, 10, 12, 14],
  Pentatonic: [0, 2, 4, 7, 9, 12],
  'Whole tone': [0, 2, 4, 6, 8, 10, 12],
  Chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  Drone: [0, 2, 4, 6, 7, 9, 11, 12, 14],
}

interface ScalePickerProps {
  value: number[]
  onChange: (scale: number[]) => void
}

export const ScalePicker: React.FC<ScalePickerProps> = ({
  value,
  onChange,
}) => {
  const current =
    Object.entries(SCALES).find(
      ([, s]) => s.length === value.length && s.every((n, i) => n === value[i]),
    )?.[0] ?? 'Custom'

  return (
    <Root>
      <Label>Scale</Label>
      <Options role="radiogroup" aria-label="Scale">
        {Object.entries(SCALES).map(([name, scale]) => (
          <Option
            key={name}
            role="radio"
            aria-checked={current === name}
            data-active={current === name || undefined}
            onClick={() => onChange(scale)}
          >
            {name}
          </Option>
        ))}
      </Options>
    </Root>
  )
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`

const Label = styled.span`
  font-size: 1.2rem;
  color: ${colors.textMuted};
`

const Options = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`

const Option = styled.button`
  padding: 0.4rem 1rem;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  background: transparent;
  color: ${colors.textMuted};
  font-family: var(--font-default);
  font-size: 1.2rem;
  cursor: pointer;

  &:hover {
    border-color: ${colors.accent};
    color: ${colors.text};
  }

  &[data-active] {
    border-color: ${colors.accent};
    background: ${colors.accentGlow};
    color: ${colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${colors.accent};
    outline-offset: 2px;
  }
`
