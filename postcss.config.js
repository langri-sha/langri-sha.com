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
  map: dev && true,
  plugins: {
    'stylelint': dev ? stylelint : false,
    'postcss-import': {
      plugins: [
        require('stylelint')(stylelint)
      ]
    },
    'postcss-cssnext': dev ? null : {
      warnForDuplicates: false
    },
    'postcss-font-smoothing': null,
    'cssnano': prod ? null : false,
    'postcss-reporter': dev ? null : false,
    'postcss-browser-reporter': dev ? null : false
  }
})
