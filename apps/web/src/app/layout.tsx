import { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  description: 'Welcome to my abode!',
  keywords: ['langri-sha', 'langrisha', 'langri', 'sha'],
  themeColor: '#333',
  title: 'Langri-Sha',
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
      <body>{children}</body>
    </html>
  )
}
