import { synthSnapshot } from 'projen/lib/util/synth'
import { expect, test } from '@langri-sha/vitest'

import { Project } from 'projen'
import { PnpmWorkspace } from './index'
import { NodePackage } from 'projen/lib/javascript'

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

test('adds packages from subproject NodePackages', () => {
  const project = new Project({
    name: 'test-project',
  })

  new PnpmWorkspace(project)

  const subprojectA = new Project({
    name: 'subproject-a',
    outdir: 'subprojects/subproject-a',
    parent: project,
  })

  const subprojectB = new Project({
    name: 'subproject-b',
    outdir: 'subprojects/subproject-b',
    parent: project,
  })

  const subsubproject = new Project({
    name: 'subproject-b-subproject',
    outdir: 'subprojects/subproject-b/subproject',
    parent: project,
  })

  const standalone = new Project({
    name: 'standalone',
    outdir: 'some/where/standalone',
    parent: project,
  })

  new NodePackage(project)
  new NodePackage(subprojectA)
  new NodePackage(subprojectB)
  new NodePackage(subsubproject)
  new NodePackage(standalone)

  expect(synthSnapshot(project)['pnpm-workspace.yaml']).toMatchSnapshot()
})
