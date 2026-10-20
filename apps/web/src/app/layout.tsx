import { EmotionRegistry } from '@langri-sha/next'
import { Metadata, Viewport } from 'next'

import { Analytics } from './lib/analytics'
import * as site from './lib/site'

export const metadata: Metadata = {
  description: site.description,
  keywords: ['langri-sha', 'langrisha', 'langri', 'sha'],
  metadataBase: new URL(site.url),
  title: site.name,
}

export const viewport: Viewport = {
  themeColor: '#333',
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
