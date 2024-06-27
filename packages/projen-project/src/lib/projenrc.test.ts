import { Project } from 'projen'
import { synthSnapshot } from 'projen/lib/util/synth'
import { expect, test } from '@langri-sha/vitest'
import { ProjenrcFile } from './projenrc'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  new ProjenrcFile(project, {})

  expect(synthSnapshot(project)).toMatchSnapshot()
})

test('custom filename', () => {
  const project = new Project({
    name: 'test-project',
  })

  new ProjenrcFile(project, {
    filename: '.projerc.ts',
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
})
