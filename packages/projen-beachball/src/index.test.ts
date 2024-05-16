import { synthSnapshot } from 'projen/lib/util/synth'
import { expect, test } from '@langri-sha/jest-test'

import { Project } from 'projen'
import { Beachball } from './index'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  new Beachball(project)

  project.synth()
  expect(synthSnapshot(project)).toMatchSnapshot()
})

test('with some options', () => {
  const project = new Project({
    name: 'test-project',
  })

  new Beachball(project, {
    branch: 'main',
  })

  project.synth()
  expect(synthSnapshot(project)).toMatchSnapshot()
})
