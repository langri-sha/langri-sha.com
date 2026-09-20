import { css, keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { colors, motion } from '@/styles'

export const gradients = {
  line: 'instrument-line',
  warm: 'instrument-warm',
  glyph: 'instrument-glyph',
  glyphWarm: 'instrument-glyph-warm',
} as const

export const Gradients: React.FC = () => (
  <Defs width="0" height="0" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient
        id={gradients.line}
        gradientUnits="userSpaceOnUse"
        x1="18"
        y1="8"
        x2="78"
        y2="96"
      >
        <stop stopColor="#f0fcff" />
        <stop offset="0.28" stopColor="#a1e5ff" />
        <stop offset="0.52" stopColor="#438ee0" />
        <stop offset="0.72" stopColor="#a493e6" />
        <stop offset="1" stopColor="#c5f3ff" />
      </linearGradient>
      <linearGradient
        id={gradients.warm}
        gradientUnits="userSpaceOnUse"
        x1="25"
        y1="5"
        x2="75"
        y2="95"
      >
        <stop stopColor="#fff1df" />
        <stop offset="0.4" stopColor="#ffaf9f" />
        <stop offset="0.75" stopColor="#ed789f" />
        <stop offset="1" stopColor="#b3a1fa" />
      </linearGradient>
      <linearGradient id={gradients.glyph} x1="0" y1="0" x2="0.8" y2="1">
        <stop stopColor="#f1fcff" />
        <stop offset="0.42" stopColor="#b1e9ff" />
        <stop offset="0.78" stopColor="#6daee9" />
        <stop offset="1" stopColor="#c1b5f0" />
      </linearGradient>
      <linearGradient id={gradients.glyphWarm} x1="0" y1="0" x2="0.8" y2="1">
        <stop stopColor="#fff3dc" />
        <stop offset="0.42" stopColor="#ffb7a0" />
        <stop offset="0.78" stopColor="#f382ad" />
        <stop offset="1" stopColor="#d2a1f5" />
      </linearGradient>
    </defs>
  </Defs>
)

const Defs = styled.svg`
  position: absolute;
`

const radiate = keyframes`
  0%, 100% { opacity: 0.55; transform: scale(0.94); }
  50% { opacity: 0.9; transform: scale(1.08); }
`

const engaged = css`
  --instrument-engaged: 1;

  @media (prefers-reduced-motion: no-preference) {
    --instrument-motion: running;
  }
`

const instrument = css`
  --instrument-engaged: 0;
  --instrument-motion: paused;
  --instrument-accent: ${colors.accent};
  --instrument-accent-glow: ${colors.accentGlow};
  position: relative;
  display: grid;
  flex: none;
  width: var(--instrument-size);
  height: var(--instrument-size);
  place-items: center;
  border-radius: 50%;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.45s ${motion.easing};

  &::before {
    position: absolute;
    inset: 4%;
    border-radius: 50%;
    background: radial-gradient(
      ellipse at 38% 30%,
      rgba(117, 197, 255, 0.12),
      rgba(53, 99, 207, 0.07) 42%,
      transparent 70%
    );
    content: '';
    pointer-events: none;
    opacity: calc(0.65 + 0.35 * var(--instrument-engaged));
    transition: opacity 0.4s ease;
  }

  &:focus-visible {
    ${engaged};
    outline: 2px solid var(--instrument-accent);
    outline-offset: 0.5rem;
  }

  &:active {
    ${engaged};
  }

  @media (hover: hover) {
    &:hover {
      ${engaged};
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    transform: scale(calc(1 + 0.04 * var(--instrument-engaged)));

    &:active {
      transform: scale(0.97);
    }
  }
`

export const Link = styled.a`
  ${instrument};
  text-decoration: none;

  &:first-of-type,
  &:last-of-type {
    top: calc(-1 * var(--instrument-step));
  }
`

export const Toggle = styled.button`
  ${instrument};
  top: var(--instrument-step);
  width: calc(var(--instrument-size) * 1.28);
  height: calc(var(--instrument-size) * 1.28);
  margin-inline: calc(var(--instrument-gap) * 0.08);
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  cursor: pointer;

  &::before {
    inset: 2%;
    background: radial-gradient(
      ellipse at 42% 38%,
      rgba(255, 170, 143, 0.2),
      rgba(147, 99, 205, 0.1) 36%,
      rgba(51, 143, 255, 0.08) 55%,
      transparent 72%
    );
    box-shadow:
      0 0 2.8rem rgba(72, 151, 255, 0.13),
      inset 0 0 2rem rgba(101, 179, 255, 0.09);
    transition: box-shadow 0.4s ease;
    animation: ${radiate} 5s ease-in-out infinite;
    animation-play-state: var(--instrument-motion);
  }

  &[aria-pressed='true'] {
    ${engaged};
    --instrument-tempo: 1.15s;
    --instrument-accent: ${colors.accentLive};
    --instrument-accent-glow: ${colors.accentLiveGlow};

    &::before {
      box-shadow:
        0 0 2rem rgba(255, 126, 163, 0.3),
        inset 0 0 1.4rem rgba(110, 220, 255, 0.2);
    }
  }
`

export const Glyph = styled.span`
  position: relative;
  display: grid;
  place-items: center;
  font-size: calc(var(--instrument-size) * var(--instrument-glyph-scale));
  line-height: 1;
  filter: drop-shadow(0 0 2px rgba(139, 219, 255, 0.6))
    drop-shadow(0 0 9px rgba(61, 143, 255, 0.45))
    brightness(calc(1 + 0.2 * var(--instrument-engaged)));
  transition: filter 0.35s ease;

  svg {
    fill: url(#${gradients.glyph});
  }
`

export const ToggleGlyph = styled(Glyph)`
  filter: drop-shadow(0 0 2px rgba(255, 203, 166, 0.8))
    drop-shadow(0 0 7px var(--instrument-accent-glow))
    drop-shadow(0 0 16px rgba(242, 116, 167, 0.35));

  svg {
    fill: none;
    stroke: url(#${gradients.glyphWarm});
    stroke-width: 1.6;
    stroke-linejoin: round;
  }
`
