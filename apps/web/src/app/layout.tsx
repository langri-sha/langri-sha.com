import { Metadata, Viewport } from 'next'
import Script from 'next/script'

import { EmotionRegistry } from '@/lib/emotion-registry'

export const metadata: Metadata = {
  description: 'Welcome to my abode!',
  keywords: ['langri-sha', 'langrisha', 'langri', 'sha'],
  title: 'Langri-Sha',
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
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-76SMPC2PGN"
          strategy="beforeInteractive"
        />
        <Script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag() { dataLayer.push(arguments); }
              gtag('js', new Date());

              gtag('config', 'G-76SMPC2PGN');
            `,
          }}
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <EmotionRegistry>{children}</EmotionRegistry>
      </body>
    </html>
  )
}
