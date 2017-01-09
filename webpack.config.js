const os = require('os')
const path = require('path')
const R = require('ramda')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

class DevelopmentPlugin {
  constructor ({skip}) {
    this.skip = skip
  }

  urls (networkInterfaces) {
    const isInternal = address => address.internal
    const isIpv4 = address => address.family === 'IPv4'
    const isExternalIpv4 = R.both(R.complement(isInternal), isIpv4)

    return R.pipe(
      R.props(R.keys(networkInterfaces)),
      R.flatten(),
      R.filter(isExternalIpv4),
      R.map(R.prop('address')),
      R.map(address => `https://${address}`)
    )(networkInterfaces)
  }

  apply (compiler) {
    if (this.skip) return

    const urls = this.urls(os.networkInterfaces())
    console.log(`Server available at: ${urls.join(', ')}.`)

    compiler.options.module.rules.unshift({
      enforce: 'pre',
      test: /\.js?$/,
      loader: 'standard-loader',
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

module.exports = ({dev = false, prod = false}) => ({
  target: 'web',
  entry: './src/index',
  output: {
    path: resolve('srv'),
    filename: 'index.js',
    publicPath: '/'
  },
  performance: {
    hints: prod && 'warning'
  },
  resolve: {
    extensions: ['.js', '.css']
  },
  module: {
    rules: [{
      test: /\.js$/,
      include: ours,
      use: 'babel-loader'
    }, {
      test: /\.css$/,
      include: ours,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: 1
          }
        }, {
          loader: 'postcss-loader'
        }
      ]
    }, {
      test: /\.css$/,
      include: theirs,
      loaders: 'style-loader!css-loader'
    }, {
      test: /\.(eot|woff|ttf)$/,
      include: ours,
      loader: 'url-loader'
    }]
  },
  plugins: [
    new DevelopmentPlugin({skip: prod}),
    new CopyWebpackPlugin([{
      from: 'share/CNAME'
    }, {
      from: 'share/google17a76c1d58d67a30.html'
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

const resolve = (...args) => (
  path.resolve(process.cwd(), ...args)
)

const ours = (absolute) => (
  absolute.startsWith(resolve('src'))
)

const theirs = (absolute) => (
  !ours(absolute)
)
