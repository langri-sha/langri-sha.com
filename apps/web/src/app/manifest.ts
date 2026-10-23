import { MetadataRoute } from 'next'

import * as colors from '@/styles/colors'

export const dynamic = 'force-static'

/*
 * The URLs are relative to the manifest's own, so they resolve under a
 * preview's base path as well as at the root.
 */
const manifest = (): MetadataRoute.Manifest => ({
  name: 'Langri-Sha',
  short_name: 'Langri-Sha',
  start_url: '.',
  scope: '.',
  display: 'standalone',
  background_color: colors.nightCore,
  theme_color: colors.nightCore,
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    {
      src: 'icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
})

export default manifest
