/*
 * Registry of the display fonts that `apps/web` self-hosts. Each entry names a
 * `@fontsource` source file, the committed subset output (relative to this
 * package root), and the exact `text` the subset must cover.
 *
 * The subset is the deliverable: `apps/web` references the output woff2 from
 * `next/font/local`. Regenerate and commit the result with
 * `pnpm --filter @langri-sha/fonts generate-font` whenever the source version
 * or the covered `text` changes.
 */
export const fonts = {
  cinzelDecorative: {
    source: {
      package: '@fontsource/cinzel-decorative',
      file: 'files/cinzel-decorative-latin-400-normal.woff2',
    },
    output: 'files/cinzel-decorative-langri-sha.woff2',
    text: 'Langri-Sha',
  },
} as const
