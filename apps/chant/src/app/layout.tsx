import { Metadata, Viewport } from 'next'

import { EmotionRegistry } from './lib/emotion-registry'

export const metadata: Metadata = {
  description: 'Create and tune ambient chant soundscapes',
  title: 'Chant',
}

export const viewport: Viewport = {
  themeColor: '#0a0a12',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <EmotionRegistry>{children}</EmotionRegistry>
      </body>
    </html>
  )
}
