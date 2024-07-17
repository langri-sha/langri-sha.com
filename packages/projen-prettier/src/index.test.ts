import { describe, expect, test } from '@langri-sha/vitest'
import { Project } from 'projen'
import { synthSnapshot } from 'projen/lib/util/synth'

import { Prettier } from './index'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  new Prettier(project)

  expect(synthSnapshot(project)).toMatchSnapshot()
})

test('with filename', () => {
  const project = new Project({
    name: 'test-project',
  })

  new Prettier(project, { filename: 'prettier.config.mjs' })

  expect(synthSnapshot(project)).toMatchSnapshot()
})

test('with ignore patterns', () => {
  const project = new Project({
    name: 'test-project',
  })

  new Prettier(project, {
    ignorePatterns: ['.*'],
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
})

test('with config', () => {
  const project = new Project({
    name: 'test-project',
  })

  new Prettier(project, { config: { endOfLine: 'lf' } })

  expect(synthSnapshot(project)).toMatchSnapshot()
})

describe('with extends', () => {
  test('with no config', () => {
    const project = new Project({
      name: 'test-project',
    })

    new Prettier(project, { extends: '@langri-sha/prettier' })

    expect(synthSnapshot(project)['prettier.config.js']).toMatchSnapshot()
  })

  test('with config', () => {
    const project = new Project({
      name: 'test-project',
    })

    new Prettier(project, {
      extends: '@langri-sha/prettier',
      config: { endOfLine: 'lf' },
    })

    expect(synthSnapshot(project)['prettier.config.js']).toMatchSnapshot()
  })
})
