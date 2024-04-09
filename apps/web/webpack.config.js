// @flow
require('@babel/register')({
  // $FlowExpectedError[incompatible-call]: Regular expressions are allowed.
  only: [/(packages|web)\/[\w-]+\/src/],
})

const path = require('path')

const {
  CleanPlugin,
  CopyPlugin,
  EnvironmentPlugin,
  HtmlPlugin,
  TerserPlugin,
  resolveLoader,
} = require('@langri-sha/webpack')

/* ::
import type { WebpackOptions } from '@langri-sha/webpack'

type Config = {
	development: boolean,
	production: boolean
}
*/

const env =
  (options /* :: : (Config) => Object */) =>
  ({ development = true, production = false } /* :: : Config */ = {}) =>
    options({ development, production })

module.exports = (env(({ development, production }) => ({
  target: 'web',
  mode: production ? 'production' : 'development',
  entry: './src/index.js',
  optimization: {
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
  resolveLoader,
  module: {
    rules: [
      {
        test: /\.js$/,
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
          from: 'LICENSE.md',
        },
      ],
    }),
    new HtmlPlugin({
      title: 'Langri-Sha',
      template: require.resolve('@langri-sha/web/src/index.ejs'),
    }),
    new EnvironmentPlugin({
      NODE_ENV: development ? 'development' : 'production',
    }),
  ],
})) /*: WebpackOptions */)
