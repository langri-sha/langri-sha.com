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
  experimental: {
    inlineCss: true,
  },

  turbopack: {
    rules: {
      '*.{vert,frag,glsl}': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
}

module.exports = config
