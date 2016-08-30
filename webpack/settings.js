import HtmlWebpackPlugin from 'html-webpack-plugin'
import minimist from 'minimist'

import {resolve, ours} from './helpers'

const {d: debug} = minimist(process.argv)

class DevelopmentPlugin {
  apply (compiler) {
    if (!debug) return

    // TODO: Resolve options from compilation
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
    extensions: ['', '.js'],
    packageMains: ['web', 'main']
  },
  module: {
    preLoaders: [],
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      include: ours
    }]
  }
})
