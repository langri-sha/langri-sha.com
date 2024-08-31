import { fixupPluginRules } from '@eslint/compat'
import js from '@eslint/js'
import imprt from 'eslint-plugin-import'
import jsdoc from 'eslint-plugin-jsdoc'
import prettier from 'eslint-plugin-prettier/recommended'
import reactRuntime from 'eslint-plugin-react/configs/jsx-runtime.js'
import react from 'eslint-plugin-react/configs/recommended.js'
import reactHooks from 'eslint-plugin-react-hooks'
import unicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import ts from 'typescript-eslint'

export default [
  js.configs.recommended,
  react,
  reactRuntime,
  {
    settings: {
      react: {
        defaultVersion: '',
        version: 'detect',
      },
    },
  },
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
      'react-hooks': reactHooks,
      import: fixupPluginRules(imprt),
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

      'import/order': [
        'error',
        {
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
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
