import styled from '@emotion/styled'
import * as React from 'react'

import * as colors from '@/styles/colors'

interface PlayerProps {
  playing: boolean
  seed: number | undefined
  onPlay: () => void
  onStop: () => void
  onSeedChange: (seed: number | undefined) => void
}

export const Player: React.FC<PlayerProps> = ({
  playing,
  seed,
  onPlay,
  onStop,
  onSeedChange,
}) => (
  <Root>
    <Controls>
      {playing ? (
        <ActionButton onClick={onStop} aria-label="Stop chant">
          ■
        </ActionButton>
      ) : (
        <ActionButton onClick={onPlay} aria-label="Play chant">
          ▶
        </ActionButton>
      )}
    </Controls>
    <SeedRow>
      <SeedLabel htmlFor="seed-input">Seed</SeedLabel>
      <SeedInput
        id="seed-input"
        type="number"
        placeholder="Random"
        value={seed ?? ''}
        onChange={(e) => {
          const v = e.target.value
          onSeedChange(v === '' ? undefined : Number(v))
        }}
        aria-label="Replay seed for deterministic playback"
      />
    </SeedRow>
  </Root>
)

const Root = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
`

const Controls = styled.div`
  display: flex;
  gap: 0.8rem;
`

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5.6rem;
  height: 5.6rem;
  border: 2px solid ${colors.accent};
  border-radius: 50%;
  background: transparent;
  color: ${colors.accent};
  font-size: 2rem;
  cursor: pointer;
  transition:
    background 0.15s,
    box-shadow 0.15s;

  &:hover {
    background: ${colors.accentGlow};
    box-shadow: 0 0 20px ${colors.accentGlow};
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid ${colors.accent};
    outline-offset: 4px;
  }
`

const SeedRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`

const SeedLabel = styled.label`
  font-size: 1.2rem;
  color: ${colors.textMuted};
`

const SeedInput = styled.input`
  width: 10rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  background: ${colors.surface};
  color: ${colors.text};
  font-family: var(--font-mono);
  font-size: 1.2rem;

  &::placeholder {
    color: ${colors.textMuted};
  }

  &:focus {
    border-color: ${colors.accent};
    outline: none;
  }
`
