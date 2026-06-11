import defaults from '@langri-sha/eslint-config'

export default [
  ...defaults,
  {
    ignores: [
      '**/.*',
      '**/dist/',
      '**/next-env.d.ts',
      '**/renovate.d.ts',
      '**/swcrc.d.ts',
      '!.projenrc.ts',
    ],
  },
]
