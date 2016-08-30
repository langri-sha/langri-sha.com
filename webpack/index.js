require('babel-register')({
  plugins: ['transform-es2015-modules-commonjs']
})

module.exports = require('./settings')
