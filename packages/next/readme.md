# @langri-sha/next

The Next glue that would otherwise live in one app's `src` tree and be copied
into the next app that needs it.

Consumed as source: the apps that import it already transpile TypeScript, so the
package has no build step and `next` is an optional peer — nothing here needs it
until a module that imports it is pulled in.

## EmotionRegistry

Collects Emotion styles during SSR and flushes them into the document head, so
the prerendered markup matches what the client renders and React 19 hydration
does not fail.

```tsx
import { EmotionRegistry } from '@langri-sha/next'

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
```

It is a `'use client'` component, and also reachable at
`@langri-sha/next/emotion-registry` for when it should not travel through the
barrel.
