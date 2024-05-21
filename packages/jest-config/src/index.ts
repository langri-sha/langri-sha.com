import type { Config } from 'jest'

const config: Config = {
  moduleNameMapper: {
    '^(\\.\\.?\\/.+)\\.jsx?$': '$1',
  },
}

export default config
