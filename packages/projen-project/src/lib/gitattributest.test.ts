import { expect, test } from '@langri-sha/vitest'
import { GitAttributesFile, Project } from 'projen'
import { synthSnapshot } from 'projen/lib/util/synth'

test('sorts content', () => {
  const project = new Project({
    name: 'test-project',
  })

  project.tryRemoveFile('.gitattributes')

  const attrs = new GitAttributesFile(project)

  attrs.addAttributes('/foo')
  attrs.addAttributes('/bar')

  expect(synthSnapshot(project)['.gitattributes']).toMatchSnapshot()
})
