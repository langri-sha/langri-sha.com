import type { NextConfig } from 'next'

const config: NextConfig = {
  agentRules: false,
  basePath: process.env.BASE_PATH,
  distDir: 'dist',
  output: 'export',
  reactStrictMode: true,

  compiler: { emotion: true },
}

export default config
