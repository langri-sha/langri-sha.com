import { synthSnapshot } from 'projen/lib/util/synth'
import { expect, test } from '@langri-sha/vitest'

import { Project } from 'projen'
import { EditorConfig } from './index'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  new EditorConfig(project, {
    '*': {
      trim_trailing_whitespace: true,
    },
  })

  project.synth()
  expect(synthSnapshot(project)).toMatchSnapshot()
})

test(`doesn't configure root for subprojects`, () => {
  const project = new Project({
    name: 'test-project',
  })

  const project2 = new Project({
    name: 'test-project2',
    parent: project,
    outdir: 'test-project2',
  })

  new EditorConfig(project2, {
    '*': {
      trim_trailing_whitespace: true,
    },
  })

  project.synth()
  expect(synthSnapshot(project)).toMatchSnapshot()
})
