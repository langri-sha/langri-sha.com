import { synthSnapshot } from 'projen/lib/util/synth'
import { expect, test } from '@langri-sha/jest-test'

import { Project } from 'projen'
import { Codeowners } from './index'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  new Codeowners(project)

  project.synth()
  expect(synthSnapshot(project)).toMatchSnapshot()
})

test(`with some entries`, () => {
  const project = new Project({
    name: 'test-project',
  })

  new Codeowners(project, {
    '*': '@admins',
    '*.js': ['@admins', '@frontend'],
  })

  project.synth()
  expect(synthSnapshot(project)).toMatchSnapshot()
})
