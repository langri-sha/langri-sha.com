import { synthSnapshot } from 'projen/lib/util/synth'
import { expect, test } from '@langri-sha/jest-test'

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
