import type { PostHogConfig } from 'posthog-js'

export const options: Partial<PostHogConfig> = {
  api_host: '/psthg',

  ui_host: 'https://eu.posthog.com',

  defaults: '2026-06-25',

  autocapture: false,
  capture_exceptions: false,
  capture_heatmaps: false,
  capture_performance: { web_vitals: true },
  disable_session_recording: true,
  disable_surveys: true,
  person_profiles: 'identified_only',
  respect_dnt: true,
}
