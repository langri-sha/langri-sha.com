import styled from '@emotion/styled'
import { type ChantConfig, type ChantPreset, PRESETS } from '@langri-sha/chant'
import * as React from 'react'

import * as colors from '@/styles/colors'

interface PresetPickerProps {
  config: ChantConfig
  onSelect: (config: ChantConfig) => void
}

export const PresetPicker: React.FC<PresetPickerProps> = ({
  config,
  onSelect,
}) => {
  const isActive = (preset: ChantPreset) =>
    preset.config.baseNote === config.baseNote &&
    preset.config.oscillatorCount === config.oscillatorCount &&
    preset.config.scale.length === config.scale.length &&
    preset.config.scale.every((n, i) => n === config.scale[i])

  return (
    <Root>
      {PRESETS.map((preset) => (
        <PresetButton
          key={preset.name}
          data-active={isActive(preset) || undefined}
          onClick={() => onSelect({ ...preset.config })}
          aria-label={`Load ${preset.name} preset`}
        >
          <PresetName>{preset.name}</PresetName>
          <PresetDescription>{preset.description}</PresetDescription>
        </PresetButton>
      ))}
    </Root>
  )
}

const Root = styled.div`
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
`

const PresetButton = styled.button`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 1rem 1.4rem;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s;

  &:hover {
    border-color: ${colors.accent};
  }

  &[data-active] {
    border-color: ${colors.accent};
    background: ${colors.accentGlow};
  }

  &:focus-visible {
    outline: 2px solid ${colors.accent};
    outline-offset: 2px;
  }
`

const PresetName = styled.span`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${colors.text};
`

const PresetDescription = styled.span`
  font-size: 1.1rem;
  color: ${colors.textMuted};
`
