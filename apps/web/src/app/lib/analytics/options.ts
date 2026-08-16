import type { PostHogConfig } from 'posthog-js'

export const options: Partial<PostHogConfig> = {
  api_host: '/psthg',

  ui_host: 'https://eu.posthog.com',

  defaults: '2026-06-25',

  autocapture: false,
  capture_exceptions: false,
  capture_heatmaps: false,
  disable_session_recording: true,
  person_profiles: 'identified_only',
  respect_dnt: true,
}
