import type { CaptureResult, PostHogConfig } from 'posthog-js'
import { expect, test, vi } from 'vitest'

import { initializePostHog } from '.'

test('client initializes with the event property hook', () => {
  const init = vi.fn(
    (_key: string, _options: Partial<PostHogConfig>): undefined => undefined,
  )

  initializePostHog({ init }, 'phc_test')

  expect(init).toHaveBeenCalledOnce()
  expect(init.mock.calls[0]?.[0]).toBe('phc_test')

  const beforeSend = init.mock.calls[0]?.[1].before_send

  expect(beforeSend).toEqual(expect.any(Function))

  if (typeof beforeSend !== 'function') {
    throw new TypeError('Expected one before_send function')
  }

  const event: CaptureResult = {
    uuid: 'event-id',
    event: '$pageview',
    properties: {},
  }

  expect(beforeSend(event)?.properties.client_environment).toBe('local')
})
