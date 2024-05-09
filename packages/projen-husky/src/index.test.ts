import { synthSnapshot } from 'projen/lib/util/synth'
import { expect, test } from '@langri-sha/jest-test'

import { Project } from 'projen'
import { Husky } from './index'

test('no hooks', () => {
  const project = new Project({
    name: 'test-project',
  })

  new Husky(project)

  project.synth()
  expect(synthSnapshot(project)).toMatchSnapshot()
})

test(`with hooks`, () => {
  const project = new Project({
    name: 'test-project',
  })

  new Husky(project, {
    'pre-commit': 'npm run lint',
    'pre-push': ['npm run test', 'npm run build'],
  })

  project.synth()
  expect(synthSnapshot(project)).toMatchSnapshot()
})
