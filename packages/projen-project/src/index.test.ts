import { synthSnapshot } from 'projen/lib/util/synth'
import { expect, test } from '@langri-sha/jest-test'

import { Project } from './index'
import { Husky } from '@langri-sha/projen-husky'
import { EditorConfig } from '@langri-sha/projen-editorconfig'
import { Renovate } from '@langri-sha/projen-renovate'
import { Codeowners } from '@langri-sha/projen-codeowners'
import { Beachball } from '@langri-sha/projen-beachball'
import * as path from 'node:path'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.beachball).toBeUndefined()
  expect(project.codeowners).toBeUndefined()
  expect(project.editorConfig).toBeUndefined()
  expect(project.husky).toBeUndefined()
  expect(project.renovate).toBeUndefined()
})

test('add subproject', () => {
  const project = new Project({
    name: 'test-project',
  })

  project.addSubproject({
    name: '@someproject/test',
    outdir: path.join('someproject', '@some', 'test'),
    typeScriptConfigOptions: {},
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
})

test('find subproject', () => {
  const project = new Project({
    name: 'test-project',
  })

  const subproject = project.addSubproject({
    name: '@someproject/test',
    outdir: path.join('sub', '@some', 'test'),
    typeScriptConfigOptions: {},
  })

  subproject.addSubproject({
    name: '@someproject/test2',
    outdir: path.join('subsub', '@some', 'test2'),
    typeScriptConfigOptions: {},
  })

  expect(project.findSubproject('@someproject/test')).toBeInstanceOf(Project)
  expect(project.findSubproject('@someproject/test2')).toBeInstanceOf(Project)
  expect(() => project.findSubproject('non-existing')).toThrowError(
    'Cannot find subproject non-existing',
  )
})

test('with Beachball configuration', () => {
  const project = new Project({
    name: 'test-project',
    package: {},
    beachballOptions: {},
    typeScriptConfigOptions: {},
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.beachball).toBeInstanceOf(Beachball)
})

test('with code owners configured', () => {
  const project = new Project({
    name: 'test-project',
    codeownersOptions: {
      '*': '@admin',
    },
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.codeowners).toBeInstanceOf(Codeowners)
})

test('with EditorConfig options', () => {
  const project = new Project({
    name: 'test-project',
    editorConfigOptions: {},
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.editorConfig).toBeInstanceOf(EditorConfig)
})

test('with Husky options', () => {
  const project = new Project({
    name: 'test-project',
    package: {},
    huskyOptions: {
      'pre-commit': 'lint-staged',
    },
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.husky).toBeInstanceOf(Husky)
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
  expect(project.renovate).toBeInstanceOf(Renovate)
})

test('with TypeScript options', () => {
  const project = new Project({
    name: 'test-project',
    package: {},
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
