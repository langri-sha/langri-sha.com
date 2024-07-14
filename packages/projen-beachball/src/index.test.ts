import { synthSnapshot } from 'projen/lib/util/synth'
import { expect, test } from '@langri-sha/vitest'

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

test('with filename', () => {
  const project = new Project({
    name: 'test-project',
  })

  new Beachball(project, {
    filename: 'beachball.config.cjs',
  })

  project.synth()
  expect(synthSnapshot(project)['beachball.config.cjs']).toBeTruthy()
})

test('with some options', () => {
  const project = new Project({
    name: 'test-project',
  })

  new Beachball(project, {
    config: {
      branch: 'main',
    },
  })

  project.synth()
  expect(synthSnapshot(project)).toMatchSnapshot()
})
