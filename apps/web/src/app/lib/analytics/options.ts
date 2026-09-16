import type { PostHogConfig } from 'posthog-js'

export type ClientEnvironment = 'production' | 'preview' | 'local'

export const resolveClientEnvironment = (
  value: string | undefined,
): ClientEnvironment => {
  switch (value) {
    case 'production':
    case 'preview':
    case 'local':
      return value
    default:
      return 'local'
  }
}

export const createOptions = (
  environment: string | undefined,
): Partial<PostHogConfig> => {
  const clientEnvironment = resolveClientEnvironment(environment)

  return {
    api_host: '/psthg',

    ui_host: 'https://eu.posthog.com',

    defaults: '2026-06-25',

    autocapture: false,
    before_send: (event) =>
      event === null
        ? null
        : {
            ...event,
            properties: {
              ...event.properties,
              client_environment: clientEnvironment,
            },
          },
    capture_exceptions: false,
    capture_heatmaps: false,
    disable_session_recording: true,
    person_profiles: 'identified_only',
    respect_dnt: true,
  }
}

export const options = createOptions(
  process.env.NEXT_PUBLIC_POSTHOG_CLIENT_ENVIRONMENT,
)
