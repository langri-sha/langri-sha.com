import { directorySnapshot } from 'projen/lib/util/synth'
import { expect, tempy, test } from '@langri-sha/jest-test'

import { Project } from 'projen'
import { LintSynthesized } from './index'

const setup = () => {
  const outdir = tempy.directory()

  const project = new Project({
    name: 'test-project',
    outdir,
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

  return { outdir, project }
}

test('defaults', () => {
  const { project } = setup()

  project.synth()
  expect(directorySnapshot(project.outdir)).toMatchSnapshot()
})
