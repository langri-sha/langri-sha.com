const os = require('os')
const path = require('path')
const R = require('ramda')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {DefinePlugin, NamedModulesPlugin} = require('webpack')

class DevelopmentPlugin {
  constructor ({skip}) {
    this.skip = skip
  }

  apply (compiler) {
    if (this.skip) return

    compiler.apply(new NamedModulesPlugin())

    compiler.options.module.rules.unshift({
      enforce: 'pre',
      test: /\.js?$/,
      loader: 'standard-loader',
      include: ours
    })
  }
}

class ServerUrlPlugin {
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
    const watch = compiler.options.watch
    const devServer = compiler.options.entry.includes('webpack/hot/dev-server')

    if (watch && devServer) {
      const urls = this.urls(os.networkInterfaces())
      console.log(`Server available at ${urls.join(', ')}.`)
    }
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

module.exports = ({dev = false, prod = false}) => Object.assign(global, {dev, prod}) && {
  target: 'web',
  entry: './src/index',
  output: {
    path: resolve('dist'),
    filename: prod && '[name].[hash].bundle.js' || '[name].bundle.js',
    publicPath: '/'
  },
  performance: {
    hints: prod && 'warning'
  },
  resolve: {
    extensions: ['.js', '.css'],
    modules: ['node_modules', resolve('src')]
  },
  module: {
    rules: [{
      test: /\.js$/,
      include: ours,
      use: 'babel-loader'
    }, {
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: 1,
            localIdentName: dev && '[local]__[hash:base64:3]',
            sourceMap: dev && true
          }
        }, {
          loader: 'postcss-loader'
        }
      ]
    }, {
      test: /\.(eot|woff|ttf)$/,
      include: ours,
      loader: 'url-loader'
    }, {
      test: /defs\.svg$/,
      loader: 'raw-loader'
    }, {
      test: /\.(vert|frag|glsl)$/,
      loader: 'raw-loader'
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
    new BailOnWarningsPlugin(),
    new ServerUrlPlugin(),
    new DefinePlugin({
      DEVELOPMENT: JSON.stringify(dev),
      PRODUCTION: JSON.stringify(prod)
    })
  ]
}

const resolve = (...args) => (
  path.resolve(process.cwd(), ...args)
)

const ours = (absolute) => (
  absolute.startsWith(resolve('src'))
)

const theirs = (absolute) => (
  !ours(absolute)
)
