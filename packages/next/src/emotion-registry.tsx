'use client'

import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { useServerInsertedHTML } from 'next/navigation'
import * as React from 'react'

/*
 * Collects Emotion styles during SSR and flushes them into the document head
 * via `useServerInsertedHTML`. Without it, Emotion renders inline `<style>`
 * tags throughout the prerendered body which the client render doesn't
 * produce, failing React 19 hydration.
 *
 * @see https://nextjs.org/docs/app/guides/css-in-js
 */
export const EmotionRegistry: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [{ cache, flush }] = React.useState(() => {
    const cache = createCache({ key: 'css' })
    cache.compat = true

    const prevInsert = cache.insert
    let inserted: string[] = []
    cache.insert = (...args) => {
      const serialized = args[1]
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name)
      }
      return prevInsert(...args)
    }

    const flush = () => {
      const prevInserted = inserted
      inserted = []
      return prevInserted
    }

    return { cache, flush }
  })

  useServerInsertedHTML(() => {
    const names = flush()

    if (names.length === 0) {
      return null
    }

    return (
      <style
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: names.map((name) => cache.inserted[name]).join(''),
        }}
      />
    )
  })

  return <CacheProvider value={cache}>{children}</CacheProvider>
}
