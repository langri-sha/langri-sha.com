import { synthSnapshot } from 'projen/lib/util/synth'
import { expect, test } from '@langri-sha/jest-test'

import { Project } from './index'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
})
