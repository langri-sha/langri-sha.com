// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const config = {
  assetPrefix: process.env.ASSETS_URL,
  distDir: 'dist',
  output: 'export',
  reactStrictMode: true,

  compiler: { emotion: true },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.(vert|frag|glsl)$/,
      type: 'asset/source',
    })

    return config
  },
}

module.exports = config
