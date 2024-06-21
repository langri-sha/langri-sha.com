/// <reference types="./src/web.d.ts" />
import path from 'node:path'

import {
  CleanPlugin,
  type Configuration,
  CopyPlugin,
  EnvironmentPlugin,
  HtmlPlugin,
  SubresourceIntegrityPlugin,
  TerserPlugin,
  resolve,
  resolveLoader,
} from '@langri-sha/webpack'

type Options = {
  development?: boolean
  environment?: 'development' | 'production'
  production?: boolean
  publicPath?: string
}

const env =
  (options: (config: Required<Options>) => Configuration) =>
  ({ production = false, publicPath = 'auto' }: Options = {}) =>
    options({
      development: !production,
      environment: production ? 'production' : 'development',
      production,
      publicPath,
    })

const configuration: (options: Options) => Configuration = env(
  ({ development, environment, production, publicPath }) => ({
    target: 'web',
    mode: environment,
    entry: './src/index.tsx',
    devtool: development ? 'eval-cheap-module-source-map' : 'hidden-source-map',
    optimization: {
      nodeEnv: false,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          extractComments: {
            condition: 'some',
            filename: (filedata) => script(`${filedata.basename}.LICENSE.txt`),
            banner: (licenseFile) =>
              publicPath !== 'auto'
                ? new URL(licenseFile, publicPath).toString()
                : licenseFile,
          },
        }),
      ],
    },
    resolve,
    resolveLoader,
    output: {
      crossOriginLoading: 'anonymous',
      filename: script(`[name]${production ? '.[contenthash].min' : ''}.js`),
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
            babelrc: false,
            cacheDirectory: true,
            envName: environment,
            presets: ['@langri-sha'],
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
      new SubresourceIntegrityPlugin(),
      new HtmlPlugin({
        title: 'Langri-Sha',
        template: require.resolve('./src/index.ejs'),
      }),
      new EnvironmentPlugin({
        NODE_ENV: environment,
        EXPERIMENTAL_SCENE: null,
      } satisfies WebEnv),
    ],
  }),
)

export default configuration

const script = (name: string) => path.join('assets', 'scripts', name)
