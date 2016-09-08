import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import minimist from 'minimist'
import cssnext from 'postcss-cssnext'
import importer from 'postcss-import'
import reporter from 'postcss-reporter'

import {resolve, ours, theirs, debug} from './helpers'

const postcss = (compiler) => {
  const dev = debug(compiler)

  const stylelint = () => (
    require('stylelint')({
      extends: 'stylelint-config-standard',
      rules: []
    })
  )

  conf[0].plugins.push(stylelint())
  conf.unshift(stylelint())

  return conf
}

class DevelopmentPlugin {
  apply (compiler) {
    if (!debug(compiler)) return

    compiler.options.module.preLoaders.unshift({
      test: /\.js?$/,
      loader: 'standard',
      include: ours
    })
  }
}

export default ({
  target: 'web',
  entry: './src/index',
  output: {
    path: resolve('srv'),
    filename: 'index.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['', '.js', '.css'],
    packageMains: ['main']
  },
  postcss,
  module: {
    preLoaders: [],
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      include: ours
    }, {
      test: /\.css$/,
      loaders: 'style!css?modules!postcss',
      include: ours
    }, {
      test: /\.css$/,
      loaders: 'style!css',
      include: theirs
    }]
  },
  plugins: [
    new DevelopmentPlugin(),
    new CopyWebpackPlugin([{
      from: 'share/CNAME'
    }, {
      from: 'share/keybase.txt'
    }, {
      from: 'share/robots.txt'
    }]),
    new HtmlWebpackPlugin({
      title: 'Langri-Sha'
    })
  ],
})
