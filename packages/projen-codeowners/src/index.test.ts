import { expect, test } from '@langri-sha/vitest'
import { Project } from 'projen'
import { synthSnapshot } from 'projen/lib/util/synth'

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
