import { synthSnapshot } from 'projen/lib/util/synth'
import { expect, test } from '@langri-sha/jest-test'

import { Project } from 'projen'
import { TypeScriptConfig } from './index'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  new TypeScriptConfig(project, {})

  project.synth()
  expect(synthSnapshot(project)['tsconfig.json']).toMatchSnapshot()
})

test('with custom file name', () => {
  const project = new Project({
    name: 'test-project',
  })

  new TypeScriptConfig(project, {
    fileName: 'tsconfig.build.json',
  })

  project.synth()
  expect(synthSnapshot(project)['tsconfig.build.json']).toMatchSnapshot()
})

test('add exclude', () => {
  const project = new Project({
    name: 'test-project',
  })

  const conf = new TypeScriptConfig(project, {})
  conf.addExclude('**/*.test.ts')

  project.synth()
  expect(synthSnapshot(project)['tsconfig.json']).toMatchSnapshot()
})

test('add include', () => {
  const project = new Project({
    name: 'test-project',
  })

  const conf = new TypeScriptConfig(project, {})
  conf.addInclude('**/*.ts')

  project.synth()
  expect(synthSnapshot(project)['tsconfig.json']).toMatchSnapshot()
})

test('add file', () => {
  const project = new Project({
    name: 'test-project',
  })

  const conf = new TypeScriptConfig(project, {})
  conf.addFile('test.js')

  project.synth()
  expect(synthSnapshot(project)['tsconfig.json']).toMatchSnapshot()
})

test('add reference', () => {
  const project = new Project({
    name: 'test-project',
  })

  const conf = new TypeScriptConfig(project, {})
  conf.addReference('test')

  project.synth()
  expect(synthSnapshot(project)['tsconfig.json']).toMatchSnapshot()
})

test('sorts references', () => {
  const project = new Project({
    name: 'test-project',
  })

  const conf = new TypeScriptConfig(project, {})
  conf.addReference('b')
  conf.addReference('a')

  project.synth()
  expect(synthSnapshot(project)['tsconfig.json']).toMatchSnapshot()
})

test('dedupes references', () => {
  const project = new Project({
    name: 'test-project',
  })

  const conf = new TypeScriptConfig(project, {})
  conf.addReference('a')
  conf.addReference('a')
  conf.addReference('a')

  project.synth()
  expect(synthSnapshot(project)['tsconfig.json']).toMatchSnapshot()
})
