import { promises as fs } from 'node:fs'
import * as path from 'node:path'

import { describe, expect, tempy, test } from '@langri-sha/vitest'
import { Project } from 'projen'
import { synthSnapshot } from 'projen/lib/util/synth'

import { NodePackage } from './node-package'

describe('resolves version', () => {
  test('without a package set', () => {
    const project = new Project({
      name: 'test',
    })

    const pkg = new NodePackage(project)
    pkg.addVersion('1.0.0')

    expect(synthSnapshot(project)['package.json']).toMatchSnapshot()
  })

  test('with a package set', async () => {
    const outdir = tempy.directory()

    await fs.writeFile(
      path.join(outdir, 'package.json'),
      JSON.stringify({
        version: '1.0.0',
      }),
    )

    const project = new Project({
      name: 'test-project',
      outdir,
    })

    new NodePackage(project)

    expect(synthSnapshot(project)['package.json']).toMatchSnapshot()
  })
})

test('assigns `type` field', () => {
  const project = new Project({
    name: 'test',
  })

  new NodePackage(project, { type: 'module' })
  expect(synthSnapshot(project)['package.json']).toMatchSnapshot()
})

test('assigns `peerDependenciesMeta` field', () => {
  const project = new Project({
    name: 'test',
  })

  new NodePackage(project, {
    peerDeps: ['prettier@*'],
    peerDependenciesMeta: { prettier: { optional: true } },
  })
  expect(synthSnapshot(project)['package.json']).toMatchSnapshot()
})

test('skips install on subprojects', () => {
  const project1 = new Project({
    name: 'test',
  })

  const project2 = new Project({
    name: 'test',
    parent: project1,
    outdir: 'project2',
  })

  new NodePackage(project2)

  expect(synthSnapshot(project1)).toMatchSnapshot()
})
