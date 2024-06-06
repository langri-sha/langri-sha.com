import { synthSnapshot } from 'projen/lib/util/synth'
import { expect, test } from '@langri-sha/jest-test'

import { Project } from 'projen'
import { PnpmWorkspace } from './index'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  new PnpmWorkspace(project)

  expect(synthSnapshot(project)['pnpm-workspace.yaml']).toMatchSnapshot()
})

test('with filename', () => {
  const project = new Project({
    name: 'test-project',
  })

  new PnpmWorkspace(project, { filename: 'pnpm-workspace.yml' })

  expect(synthSnapshot(project)['pnpm-workspace.yml']).toMatchSnapshot()
})

test('with packages', () => {
  const project = new Project({
    name: 'test-project',
  })

  new PnpmWorkspace(project, {
    packages: ['apple', 'banana'],
  })

  expect(synthSnapshot(project)['pnpm-workspace.yaml']).toMatchSnapshot()
})

test('sorts packages', () => {
  const project = new Project({
    name: 'test-project',
  })

  new PnpmWorkspace(project, {
    packages: ['b', 'a'],
  })

  expect(synthSnapshot(project)['pnpm-workspace.yaml']).toMatchSnapshot()
})

test('dedupes packages', () => {
  const project = new Project({
    name: 'test-project',
  })

  new PnpmWorkspace(project, {
    packages: ['a', 'a'],
  })

  expect(synthSnapshot(project)['pnpm-workspace.yaml']).toMatchSnapshot()
})
