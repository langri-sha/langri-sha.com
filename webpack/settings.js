import HtmlWebpackPlugin from 'html-webpack-plugin'
import minimist from 'minimist'

import {resolve, ours, theirs, debug} from './helpers'

class DevelopmentPlugin {
  apply (compiler) {
    if (!debug(compiler)) return

    compiler.options.module.preLoaders.unshift(
      {
        test: /\.js?$/,
        loader: 'standard',
        include: ours
      }
    )
  }
}

export default ({
  target: 'web',
  entry: './src/index',
  output: {
    path: resolve('local'),
    filename: 'index.js',
    publicPath: '/'
  },
  plugins: [
    new DevelopmentPlugin(),
    new HtmlWebpackPlugin({
      title: 'Langri-Sha'
    })
  ],
  resolve: {
    extensions: ['', '.js', '.css'],
    packageMains: ['main']
  },
  module: {
    preLoaders: [],
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      include: ours
    }, {
      test: /\.css$/,
      loaders: 'style!css',
      include: theirs
    }]
  }
})
