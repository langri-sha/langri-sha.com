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
  expect(synthSnapshot(project)).toMatchSnapshot()
})
