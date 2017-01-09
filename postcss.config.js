const stylelint = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-css-modules'
  ],
  rules: {
    'property-no-unknown': [ true, {
      ignoreProperties: [
        'composes',
        'font-smoothing'
      ]
    }]
  }
}

module.exports = (ctx) => ({
  plugins: {
    'postcss-import': {
      plugins: [
        require('stylelint')(stylelint)
      ]
    },
    'postcss-cssnext': null,
    'postcss-font-smoothing': null,
    'cssnano': prod ? null : false,
    'postcss-reporter': dev ? null : false,
    'postcss-browser-reporter': dev ? null : false
  }
})
