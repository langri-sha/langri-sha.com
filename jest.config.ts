import type { Config } from 'jest'
import defaults from '@langri-sha/jest-config'

const config: Config = {
  ...defaults,
  transformIgnorePatterns: [
    'node_modules/(?!(?:.pnpm/)?(execa|find-up|get-stream|human-signals|is-stream|locate-path|mimic-fn|npm-run-path|onetime|p-limit|p-locate|path-exists|path-key|strip-final-newline|unicorn-magic|yocto-queue))',
  ],
}

export default config
