'use client'

import type { CaptureOptions, Properties } from 'posthog-js'
import * as React from 'react'

import { options } from './options'

/*
 * Initializes PostHog against the first-party proxy at `/psthg`, which forwards
 * to PostHog EU Cloud. Same-origin requests keep analytics working for visitors
 * whose blockers drop `posthog.com`, and keep their addresses off a third-party
 * domain.
 *
 * The project token is public by design, and is built into deployed bundles
 * only. Importing the SDK behind it keeps a build without one — anything built
 * locally — from loading it at all.
 *
 * @see https://posthog.com/docs/advanced/proxy
 */
export const Analytics: React.FC = () => {
  React.useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN

    if (!key) {
      return
    }

    void import('posthog-js').then(({ posthog }) => {
      posthog.init(key, options)
    })
  }, [])

  return null
}

export const capture = (
  event: string,
  properties?: Properties,
  options?: CaptureOptions,
) => {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
    return
  }

  void import('posthog-js').then(({ posthog }) => {
    posthog.capture(event, properties, options)
  })
}
