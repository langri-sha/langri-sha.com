import type { Config } from 'jest'
import defaults from '@langri-sha/jest-config'

const config: Config = {
  ...defaults,
  transformIgnorePatterns: [
    `node_modules/(?!(?:.pnpm/)?(${[
      'find-up',
      'locate-path',
      'p-limit',
      'p-locate',
      'path-exists',
      'unicorn-magic',
      'yocto-queue',
    ].join('|')}))`,
  ],
}

export default config
