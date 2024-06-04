import { synthSnapshot } from 'projen/lib/util/synth'
import { expect, test } from '@langri-sha/jest-test'

import { Project } from 'projen'
import { Babel } from './index'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  new Babel(project)

  expect(synthSnapshot(project)['babel.config.js']).toMatchSnapshot()
})

test('with filename', () => {
  const project = new Project({
    name: 'test-project',
  })

  new Babel(project, { filename: 'babel.config.cjs' })

  expect(synthSnapshot(project)['babel.config.cjs']).toMatchSnapshot()
})

test('with config API function', () => {
  const project = new Project({
    name: 'test-project',
  })

  new Babel(project, { configApiFunction: 'api.cache(true)' })

  expect(synthSnapshot(project)['babel.config.js']).toMatchSnapshot()
})

test('with blank config API function', () => {
  const project = new Project({
    name: 'test-project',
  })

  new Babel(project, { configApiFunction: '' })

  expect(synthSnapshot(project)['babel.config.js']).toMatchSnapshot()
})

test('with transform options', () => {
  const project = new Project({
    name: 'test-project',
  })

  new Babel(project, { options: { presets: ['@babel/preset-env'] } })

  expect(synthSnapshot(project)['babel.config.js']).toMatchSnapshot()
})

test('with config API function and transform options', () => {
  const project = new Project({
    name: 'test-project',
  })

  new Babel(project, {
    configApiFunction: 'api.cache(true)',
    options: { presets: ['@babel/preset-env'] },
  })

  expect(synthSnapshot(project)['babel.config.js']).toMatchSnapshot()
})
