import { EmotionRegistry } from '@langri-sha/next'
import { Metadata } from 'next'

import { Analytics } from './lib/analytics'

export const metadata: Metadata = {
  description: 'Welcome to my abode!',
  keywords: ['langri-sha', 'langrisha', 'langri', 'sha'],
  title: 'Langri-Sha',
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
