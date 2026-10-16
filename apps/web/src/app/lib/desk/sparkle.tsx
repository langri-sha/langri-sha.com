import styled from '@emotion/styled'
import * as React from 'react'

export const Sparkle: React.FC<{ className?: string }> = ({ className }) => (
  <Svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M12 0C12.9 7.5 16.5 11.1 24 12 16.5 12.9 12.9 16.5 12 24 11.1 16.5 7.5 12.9 0 12 7.5 11.1 11.1 7.5 12 0Z" />
  </Svg>
)

const Svg = styled.svg`
  display: inline-block;
  flex: none;
  width: 1em;
  height: 1em;
  fill: currentColor;
`
