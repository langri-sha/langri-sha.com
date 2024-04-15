import { expect, test } from '@langri-sha/jest-test'
import path from 'node:path'
import monorepo from './index'

test('resolves the monorepo root correctly', () => {
  expect(monorepo.resolve()).toBe(path.resolve(__dirname, '..', '..', '..'))
})
