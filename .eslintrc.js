const path = require('path')

module.exports = {
  settings: {
    resolvePluginsRelativeTo: path.dirname(
      require.resolve('@langri-sha/eslint-config'),
    ),
  },
  extends: ['@langri-sha/eslint-config'],
}
