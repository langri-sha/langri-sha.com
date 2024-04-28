import { synthSnapshot } from 'projen/lib/util/synth'
import { expect, test } from '@langri-sha/jest-test'

import { Project } from 'projen'
import { LintSynthesized } from './index'

const setup = () => {
  const project = new Project({
    name: 'test-project',
  })
  project.removeTask('build')
  project.removeTask('compile')
  project.removeTask('eject')
  project.removeTask('default')
  project.removeTask('package')
  project.removeTask('post-compile')
  project.removeTask('pre-compile')
  project.removeTask('test')

  new LintSynthesized(project)

  return { project }
}

test('defaults', () => {
  const { project } = setup()

  expect(synthSnapshot(project)).toMatchSnapshot()
})
