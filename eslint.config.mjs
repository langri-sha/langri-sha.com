import defaults from '@langri-sha/eslint-config'

export default [
  ...defaults,
  { ignores: ['.*', 'dist/', 'renovate.d.ts', '!.projenrc.mts'] },
]
