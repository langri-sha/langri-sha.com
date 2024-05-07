import path from 'node:path'
import langrisha from '@langri-sha/eslint-config'

export default [
  {
    ignores: ['.*', '!.projenrc.mts', 'apps/*/lib/', 'packages/*/lib/'],
  },
  {
    settings: {
      resolvePluginsRelativeTo: path.dirname(
        import.meta.resolve('@langri-sha/eslint-config'),
      ),
    },
  },
  ...langrisha,
]
