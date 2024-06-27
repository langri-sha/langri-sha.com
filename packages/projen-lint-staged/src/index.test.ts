import { synthSnapshot } from 'projen/lib/util/synth'
import { describe, expect, test } from '@langri-sha/vitest'

import { Project } from 'projen'
import { LintStaged } from './index'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  new LintStaged(project)

  expect(synthSnapshot(project)['lint-staged.config.js']).toMatchSnapshot()
})

test('with filename', () => {
  const project = new Project({
    name: 'test-project',
  })

  new LintStaged(project, { filename: 'lint-staged.config.mjs' })

  expect(synthSnapshot(project)['lint-staged.config.mjs']).toMatchSnapshot()
})

test('with config', () => {
  const project = new Project({
    name: 'test-project',
  })

  new LintStaged(project, { config: { '*': 'prettier' } })

  expect(synthSnapshot(project)['lint-staged.config.js']).toMatchSnapshot()
})

describe('with extends', () => {
  test('with no config', () => {
    const project = new Project({
      name: 'test-project',
    })

    new LintStaged(project, { extends: '@langri-sha/lint-staged' })

    expect(synthSnapshot(project)['lint-staged.config.js']).toMatchSnapshot()
  })

  test('with config', () => {
    const project = new Project({
      name: 'test-project',
    })

    new LintStaged(project, {
      extends: '@langri-sha/lint-staged',
      config: { '*': 'prettier' },
    })

    expect(synthSnapshot(project)['lint-staged.config.js']).toMatchSnapshot()
  })
})
