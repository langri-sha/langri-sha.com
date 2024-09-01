/** @type {import('beachball').BeachballConfig} */
module.exports = {
  "branch": "origin/main",
  "gitTags": false,
  "ignorePatterns": [
    "*.test.*",
    ".*/**",
    "__snapshots__/",
    "dist/",
    "node_modules/"
  ]
}