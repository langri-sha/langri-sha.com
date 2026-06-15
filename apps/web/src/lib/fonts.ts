import localFont from 'next/font/local'

/*
 * Self-hosted display font. The woff2 is a ~1.4 KB subset of Cinzel Decorative
 * (400) covering only the "Langri-Sha" title glyphs, produced by
 * `@langri-sha/fonts` (see packages/fonts). next/font/local inlines the
 * @font-face and preloads the file, so there is no render-blocking Google
 * Fonts request and no client-side font loader.
 */
export const cinzelDecorative = localFont({
  src: '../../../../packages/fonts/files/cinzel-decorative-langri-sha.woff2',
  display: 'swap',
  weight: '400',
  style: 'normal',
})
