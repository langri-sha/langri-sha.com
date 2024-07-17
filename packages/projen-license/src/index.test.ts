import { expect, test } from '@langri-sha/vitest'
import { Project } from 'projen'
import { synthSnapshot } from 'projen/lib/util/synth'

import { License } from './index'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  new License(project, {
    copyrightHolder: 'Test <test@test.com> (https://test.com)',
    spdx: 'MIT',
    year: '2000',
  })

  project.synth()
  expect(synthSnapshot(project)).toMatchSnapshot()
})

test('with custom filename', () => {
  const project = new Project({
    name: 'test-project',
  })

  new License(project, {
    copyrightHolder: 'Test <test@test.com> (https://test.com)',
    filename: 'LICENSE',
    spdx: 'MIT',
    year: '2000',
  })

  project.synth()
  expect(synthSnapshot(project)).toMatchSnapshot()
})
