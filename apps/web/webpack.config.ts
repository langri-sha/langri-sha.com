/// <reference types="./src/web.d.ts" />
import path from 'node:path'

import {
  CleanPlugin,
  type Configuration,
  CopyPlugin,
  EnvironmentPlugin,
  HtmlPlugin,
  TerserPlugin,
  resolve,
  resolveLoader,
} from '@langri-sha/webpack'

type Options = {
  development?: boolean
  production?: boolean
  publicPath?: string
}

const env =
  (options: (config: Options) => Configuration) =>
  ({ production = false, publicPath = 'auto' }: Options = {}) =>
    options({ development: !production, production, publicPath })

export default env(({ development, production, publicPath }) => ({
  target: 'web',
  mode: production ? 'production' : 'development',
  entry: './src/index.tsx',
  optimization: {
    nodeEnv: false,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: {
          condition: 'some',
          filename: (filename) => `${filename}.LICENSE.txt`,
        },
      }),
    ],
  },
  resolve,
  resolveLoader,
  output: {
    filename: path.join(
      'assets',
      'sripts',
      `[name]${production ? '.[chunkhash].min' : ''}.js`,
    ),
    path: path.resolve(__dirname, 'dist'),
    publicPath,
    hashFunction: 'xxhash64',
  },
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        include: path.resolve(__dirname, 'src'),
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
      },
      {
        test: /\.css$/,
        type: 'asset/source',
      },
      {
        test: /\.(eot|woff|ttf)$/,
        include: path.resolve(__dirname, 'src'),
        type: 'asset',
      },
      {
        test: /\.(vert|frag|glsl)$/,
        type: 'asset/source',
      },
    ],
  },
  plugins: [
    new CleanPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: 'share/CNAME',
        },
        {
          from: 'share/google17a76c1d58d67a30.html',
        },
        {
          from: 'share/keybase.txt',
        },
        {
          from: 'share/robots.txt',
        },
        {
          from: 'license',
        },
      ],
    }),
    new HtmlPlugin({
      title: 'Langri-Sha',
      template: require.resolve('./src/index.ejs'),
    }),
    new EnvironmentPlugin({
      NODE_ENV: development ? 'development' : 'production',
      EXPERIMENTAL_SCENE: null,
    } satisfies WebEnv),
  ],
}))
