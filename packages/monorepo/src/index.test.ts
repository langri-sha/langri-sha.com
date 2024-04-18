import { beforeEach, expect, tempy, test } from '@langri-sha/jest-test'
import path from 'node:path'
import monorepo from './index'

beforeEach(() => {
  monorepo.root = undefined
})

test('root points to the monorepo root correctly', () => {
  expect(monorepo.root).toBe(path.resolve(__dirname, '..', '..', '..'))
})

test('root can be updated correctly', () => {
  const newRoot = tempy.directory()
  monorepo.root = newRoot

  expect(monorepo.root).toBe(newRoot)

  monorepo.root = undefined
  expect(monorepo.root).toBe(path.resolve(__dirname, '..', '..', '..'))
})

test('resolves the monorepo root correctly', () => {
  expect(monorepo.resolve()).toBe(path.resolve(__dirname, '..', '..', '..'))
})
