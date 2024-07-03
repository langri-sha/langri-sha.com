/// <reference types="./eslint-config.d.ts" />
import js from '@eslint/js'
import ts from 'typescript-eslint'
import globals from 'globals'
import unicorn from 'eslint-plugin-unicorn'
import prettier from 'eslint-plugin-prettier/recommended'
import jsdoc from 'eslint-plugin-jsdoc'

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ['**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}'],
    languageOptions: {
      parserOptions: {
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        ga: 'writable',
      },
    },
    plugins: {
      jsdoc,
      unicorn,
    },
    rules: {
      // Built-ins.
      'no-duplicate-imports': 'error',
      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true,
          allowSeparatedGroups: true,
        },
      ],

      // Contributing.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      'unicorn/no-anonymous-default-export': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/prevent-abbreviations': 'off',
    },
  },
  prettier,
  {
    files: ['*.{js,cjs,mjs}'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
]
