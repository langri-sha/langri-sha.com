module.exports = {
  parser: '@typescript-eslint/parser',
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
    'plugin:@typescript-eslint/recommended',
    'plugin:promise/recommended',
    'plugin:react/jsx-runtime',
    'plugin:unicorn/recommended',

    // NB: Prettier rules must come last.
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', '@emotion', 'promise', 'react', 'unicorn'],
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
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
}
