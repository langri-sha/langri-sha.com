import styled from '@emotion/styled'
import type { ChantConfig } from '@langri-sha/chant'
import * as React from 'react'

import * as colors from '@/styles/colors'
import { medium } from '@/styles/media'

import { midiToName } from './note-display'
import { ScalePicker } from './scale-picker'
import { Slider } from './slider'

interface TunerProps {
  config: ChantConfig
  onChange: (config: ChantConfig) => void
}

export const Tuner: React.FC<TunerProps> = ({ config, onChange }) => {
  const update = <K extends keyof ChantConfig>(
    key: K,
    value: ChantConfig[K],
  ) => {
    onChange({ ...config, [key]: value })
  }

  return (
    <Root>
      <Section>
        <SectionTitle>Tone</SectionTitle>
        <Slider
          label={`Base note — ${midiToName(config.baseNote)}`}
          value={config.baseNote}
          min={24}
          max={96}
          onChange={(v) => update('baseNote', v)}
        />
        <ScalePicker
          value={config.scale}
          onChange={(v) => update('scale', v)}
        />
      </Section>

      <Section>
        <SectionTitle>Texture</SectionTitle>
        <Slider
          label="Voices"
          value={config.oscillatorCount}
          min={1}
          max={80}
          onChange={(v) => update('oscillatorCount', v)}
        />
        <Slider
          label="Resonance"
          value={config.filterQ}
          min={1}
          max={100}
          onChange={(v) => update('filterQ', v)}
        />
        <Slider
          label="Volume"
          value={config.gain}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => update('gain', v)}
        />
      </Section>

      <Section>
        <SectionTitle>Space</SectionTitle>
        <Slider
          label="Panner range"
          value={config.pannerRange}
          min={1}
          max={50}
          onChange={(v) => update('pannerRange', v)}
        />
        <Slider
          label="Drift interval"
          value={config.pannerDriftInterval}
          min={100}
          max={2000}
          step={50}
          unit="ms"
          onChange={(v) => update('pannerDriftInterval', v)}
        />
        <Slider
          label="Drift amount"
          value={config.pannerDriftAmount}
          min={0.01}
          max={1}
          step={0.01}
          onChange={(v) => update('pannerDriftAmount', v)}
        />
      </Section>
    </Root>
  )
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  width: 100%;
`

const Section = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  margin: 0;
  padding: 1.6rem;
  border: 1px solid ${colors.border};
  border-radius: 8px;

  ${medium} {
    padding: 2rem;
  }
`

const SectionTitle = styled.legend`
  padding: 0 0.6rem;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${colors.accent};
`
