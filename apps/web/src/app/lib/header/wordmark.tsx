import type * as React from 'react'

// Wordmark hand-traced from the "Cinzel Decorative" typeface
// by Natanael Gama, under the SIL Open Font License 1.1.
import svg from './wordmark.svg'

const src = `data:image/svg+xml,${svg.replace(/[\n#<>%]/g, encodeURIComponent)}`

export const Wordmark: React.FC = () => (
  <img
    src={src}
    alt="Langri-Sha"
    width={1363}
    height={220}
    fetchPriority="high"
  />
)
