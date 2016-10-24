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
    require('postcss-reporter')(),
    require('postcss-browser-reporter')()
  ]
}

class DevelopmentPlugin {
  apply (compiler) {
    if (!debug(compiler)) return

    compiler.options.module.rules.unshift({
      enforce: 'pre',
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
    extensions: ['.js', '.css']
  },
  module: {
    rules: [{
      test: /\.js$/,
      include: ours,
      use: 'babel'
    }, {
      test: /\.css$/,
      include: ours,
      use: [
        'style',
        {
          loader: 'css',
          options: {
            modules: 1
          }
        }, {
          loader: 'postcss',
          options: {
            postcss
          }
        }
      ]
    }, {
      test: /\.css$/,
      include: theirs,
      loaders: 'style!css'
    }, {
      test: /\.(eot|woff|ttf)$/,
      include: ours,
      loader: 'url'
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
