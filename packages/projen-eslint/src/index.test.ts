import { describe, expect, test } from '@langri-sha/vitest'
import { Project } from 'projen'
import { synthSnapshot } from 'projen/lib/util/synth'

import { ESLint } from './index'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  new ESLint(project)

  expect(synthSnapshot(project)['eslint.config.js']).toMatchSnapshot()
})

test('with filename', () => {
  const project = new Project({
    name: 'test-project',
  })

  new ESLint(project, { filename: 'eslint.config.mjs' })

  expect(synthSnapshot(project)['eslint.config.mjs']).toMatchSnapshot()
})

test('with ignore patterns', () => {
  const project = new Project({
    name: 'test-project',
  })

  new ESLint(project, { ignorePatterns: ['.*'] })

  expect(synthSnapshot(project)['eslint.config.js']).toMatchSnapshot()
})

test('with config', () => {
  const project = new Project({
    name: 'test-project',
  })

  new ESLint(project, {
    config: [
      {
        rules: {
          'unicorn/no-null': 'off',
        },
      },
    ],
  })

  expect(synthSnapshot(project)['eslint.config.js']).toMatchSnapshot()
})

describe('with extends', () => {
  test('without config provided', () => {
    const project = new Project({
      name: 'test-project',
    })

    new ESLint(project, {
      extends: '@langri-sha/eslint-config',
    })

    expect(synthSnapshot(project)['eslint.config.js']).toMatchSnapshot()
  })

  test('with config provided', () => {
    const project = new Project({
      name: 'test-project',
    })

    new ESLint(project, {
      extends: '@langri-sha/eslint-config',
      config: [
        {
          rules: {
            'unicorn/no-null': 'off',
          },
        },
      ],
    })

    expect(synthSnapshot(project)['eslint.config.js']).toMatchSnapshot()
  })
})
