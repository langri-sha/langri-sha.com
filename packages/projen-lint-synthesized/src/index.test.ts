import { directorySnapshot } from 'projen/lib/util/synth'
import { expect, tempy, test } from '@langri-sha/vitest'

import { promises as fs } from 'node:fs'
import path from 'node:path'

import { Project, TextFile } from 'projen'
import { LintSynthesized, type LintSynthesizedOptions } from './index'

const setup = (options?: LintSynthesizedOptions) => {
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

  new LintSynthesized(project, options)

  return { project }
}

test('defaults', () => {
  const { project } = setup()

  project.synth()
  expect(directorySnapshot(project.outdir)).toMatchSnapshot()
})

test('lints synthesized files', async () => {
  const { project } = setup({
    '*': 'prettier --ignore-unknown --write',
  })

  const project2 = new Project({
    name: 'test-project2',
    outdir: 'project2',
    parent: project,
  })

  let file, contents

  file = new TextFile(project, 'test1.js')
  file.addLine(`module.exports = ${JSON.stringify({ foo: 'bar' })}`)

  file = new TextFile(project, 'test2.js')
  file.addLine(`module.exports = ${JSON.stringify({ foo: 'bar' })}`)

  file = new TextFile(project2, 'test3.js')
  file.addLine(`module.exports = ${JSON.stringify({ foo: 'bar' })}`)

  project.synth()

  file = await fs.readFile(path.join(project.outdir, 'test1.js'))
  contents = file.toString('utf8')

  expect(contents).toEqual(`module.exports = { foo: "bar" };\n`)

  file = await fs.readFile(path.join(project.outdir, 'test2.js'))
  contents = file.toString('utf8')

  expect(contents).toEqual(`module.exports = { foo: "bar" };\n`)

  file = await fs.readFile(path.join(project.outdir, 'project2', 'test3.js'))
  contents = file.toString('utf8')
})

test('lints hidden synthesized files', async () => {
  const { project } = setup({
    '*': 'prettier --ignore-unknown --write',
  })

  let file

  file = new TextFile(project, '.test.js')
  file.addLine(`module.exports = ${JSON.stringify({ foo: 'bar' })}`)

  project.synth()

  file = await fs.readFile(path.join(project.outdir, '.test.js'))
  const contents = file.toString('utf8')

  expect(contents).toEqual(`module.exports = { foo: "bar" };\n`)
})

test('preserves file modes', async () => {
  const { project } = setup({
    '*': 'prettier --ignore-unknown',
  })

  new TextFile(project, 'test.sh', {
    executable: true,
    readonly: true,
  })

  project.synth()

  await expect(
    fs.stat(path.join(project.outdir, 'test.sh')),
  ).resolves.toHaveProperty('mode', 33_124)
})
