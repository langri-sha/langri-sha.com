'use client'

import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { useServerInsertedHTML } from 'next/navigation'
import * as React from 'react'

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
