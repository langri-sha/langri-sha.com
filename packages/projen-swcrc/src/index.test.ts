import { synthSnapshot } from 'projen/lib/util/synth'
import { expect, test } from '@langri-sha/vitest'

import { Project } from 'projen'
import { SWCConfig } from './index'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  new SWCConfig(project, {})

  project.synth()
  expect(synthSnapshot(project)).toMatchSnapshot()
})
