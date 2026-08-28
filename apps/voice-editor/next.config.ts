import type { NextConfig } from 'next'

const config: NextConfig = {
  agentRules: false,
  distDir: 'dist',
  output: 'export',
  reactStrictMode: true,

  compiler: { emotion: true },
}

export default config
