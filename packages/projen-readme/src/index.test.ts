import { expect, test } from '@langri-sha/vitest'
import { Project } from 'projen'
import { synthSnapshot } from 'projen/lib/util/synth'

import { ReadmeFile } from '.'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  new ReadmeFile(project)

  expect(synthSnapshot(project)['README.md']).toMatchSnapshot()
})

test('custom filename', () => {
  const project = new Project({
    name: 'test-project',
  })

  new ReadmeFile(project, { filename: 'readme' })

  expect(synthSnapshot(project)['readme']).toMatchSnapshot()
})
