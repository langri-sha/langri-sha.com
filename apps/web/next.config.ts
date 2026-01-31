import type { NextConfig } from 'next'

const config: NextConfig = {
  assetPrefix: process.env.ASSETS_URL,
  distDir: 'dist',
  output: 'export',
  reactStrictMode: true,

  compiler: { emotion: true },

  turbopack: {
    rules: {
      '*.vert': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.frag': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.glsl': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.(vert|frag|glsl)$/,
      type: 'asset/source',
    })

    return config
  },
}

export default config
