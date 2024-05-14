import { synthSnapshot } from 'projen/lib/util/synth'
import { expect, test } from '@langri-sha/jest-test'

import { Project } from './index'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
})

test('with Beachball configuration', () => {
  const project = new Project({
    name: 'test-project',
    beachballConfig: {},
    typeScriptConfigOptions: {},
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
})

test('with code owners configured', () => {
  const project = new Project({
    name: 'test-project',
    codeownersOptions: {
      '*': '@admin',
    },
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
})

test('with EditorConfig options', () => {
  const project = new Project({
    name: 'test-project',
    editorConfigOptions: {},
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
})

test('with Husky options', () => {
  const project = new Project({
    name: 'test-project',
    huskyOptions: {
      'pre-commit': 'lint-staged',
    },
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
})

test('with Terraform enabled', () => {
  const project = new Project({
    name: 'test-project',
    withTerraform: true,
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
})

test('with Renovate options', () => {
  const project = new Project({
    name: 'test-project',
    renovateOptions: {},
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
})

test('with TypeScript options', () => {
  const project = new Project({
    name: 'test-project',
    typeScriptConfigOptions: {},
  })

  project.typeScriptConfig?.addFile('foo.js', 'bar.js')

  expect(synthSnapshot(project)).toMatchSnapshot()
})

test('with workspaces', () => {
  const project = new Project({
    name: 'test-project',
    workspaces: ['packages/*'],
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
})
