/**
 * @type {import('beachball').BeachballConfig}
 */
module.exports = {
  branch: 'origin/main',
  gitTags: false,
  ignorePatterns: [
    '*.test.ts',
    '*.test.tsx',
    '.*/**',
    '__snapshots__/',
    'dist/',
    'node_modules/',
  ],
}
