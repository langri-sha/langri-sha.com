import { synthSnapshot } from 'projen/lib/util/synth'
import { expect, test } from '@langri-sha/vitest'

import { Project } from 'projen'
import { JestConfig } from './index'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  new JestConfig(project)

  project.synth()
  expect(synthSnapshot(project)['jest.config.ts']).toMatchSnapshot()
})

test('with filename', () => {
  const project = new Project({
    name: 'test-project',
  })

  new JestConfig(project, { filename: 'jest.config.mts' })

  project.synth()
  expect(synthSnapshot(project)['jest.config.mts']).toMatchSnapshot()
})

test('with extends', () => {
  const project = new Project({
    name: 'test-project',
  })

  new JestConfig(project, { extends: '@langri-sha/jest-config' })

  project.synth()
  expect(synthSnapshot(project)['jest.config.ts']).toMatchSnapshot()
})

test('with config', () => {
  const project = new Project({
    name: 'test-project',
  })

  new JestConfig(project, { config: { testEnvironment: 'node' } })

  project.synth()
  expect(synthSnapshot(project)['jest.config.ts']).toMatchSnapshot()
})
