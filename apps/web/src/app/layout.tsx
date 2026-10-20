import { EmotionRegistry } from '@langri-sha/next'
import { Metadata, Viewport } from 'next'

import * as colors from '@/styles/colors'

import { Analytics } from './lib/analytics'
import * as site from './lib/site'

export const metadata: Metadata = {
  description: site.description,
  keywords: ['langri-sha', 'langrisha', 'langri', 'sha'],
  metadataBase: new URL(site.url),
  title: site.name,
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: colors.nightCore,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Analytics />
        <EmotionRegistry>{children}</EmotionRegistry>
      </body>
    </html>
  )
}
