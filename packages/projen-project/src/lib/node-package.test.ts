import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { describe, expect, tempy, test } from '@langri-sha/jest-test'
import { synthSnapshot } from 'projen/lib/util/synth'

import { NodePackage } from './node-package'
import { Project } from 'projen'

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
