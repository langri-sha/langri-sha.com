import type { NextConfig } from 'next'

const config: NextConfig = {
  distDir: 'dist',
  reactStrictMode: true,
  transpilePackages: ['@langri-sha/chant'],

  compiler: { emotion: true },
  experimental: {
    inlineCss: true,
  },
}

export default config
