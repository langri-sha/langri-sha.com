import defaults from '@langri-sha/eslint-config'

export default [
  ...defaults,
  {
    ignores: [
      '**/.*',
      '**/dist/',
      '**/renovate.d.ts',
      '**/swcrc.d.ts',
      '!.projenrc.ts',
    ],
  },
]
