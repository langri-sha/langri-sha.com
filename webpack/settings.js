import CopyWebpackPlugin from 'copy-webpack-plugin'
import cssnano from 'cssnano'
import cssnext from 'postcss-cssnext'
import fontSmoothing from 'postcss-font-smoothing'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import importer from 'postcss-import'

import {resolve, ours, theirs, debug} from './helpers'

const postcss = (compiler) => {
  if (!debug(compiler)) {
    return [
      importer({
        addDependencyTo: compiler,
        plugins: []
      }),
      cssnext(),
      fontSmoothing(),
      cssnano()
    ]
  }

  const stylelint = () => (
    require('stylelint')({
      extends: 'stylelint-config-standard',
      rules: []
    })
  )

  return [
    stylelint(),
    importer({
      addDependencyTo: compiler,
      plugins: [stylelint()]
    }),
    cssnext(),
    fontSmoothing(),
    cssnano(),
    require('postcss-reporter')
  ]
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

class BailOnWarningsPlugin {
  apply (compiler) {
    if (!compiler.options.bail) return

    compiler.plugin('done', (stats) => {
      if (stats.compilation.warnings && stats.compilation.warnings.length) {
        setTimeout(process.exit.bind(process, 1), 0)
      }
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
    }, {
      test: /\.(eot|woff|ttf)$/,
      loaders: 'url',
      include: ours
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
    }, {
      from: 'README.md'
    }, {
      from: 'LICENSE.md'
    }]),
    new HtmlWebpackPlugin({
      title: 'Langri-Sha'
    }),
    new BailOnWarningsPlugin()
  ]
})
