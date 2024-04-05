// @flow
module.exports = {
  parser: '@babel/eslint-parser',
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  parserOptions: {
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:flowtype/recommended',
    'plugin:promise/recommended',
    'plugin:react/recommended',
    'plugin:unicorn/recommended',

    // NB: Prettier rules must come last.
    'plugin:prettier/recommended',
  ],
  plugins: ['@emotion', 'flowtype', 'promise', 'react', 'unicorn'],
  globals: {
    ga: 'writable',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Built-ins.
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true,
        allowSeparatedGroups: true,
      },
    ],

    // Contributing.
    '@emotion/pkg-renaming': 'error',
    'unicorn/no-anonymous-default-export': 'off',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-null': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/prefer-node-protocol': 'off',
    'unicorn/prevent-abbreviations': 'off',
  },
}
