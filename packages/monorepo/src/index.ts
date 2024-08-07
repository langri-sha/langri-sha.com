import path from 'node:path'

import { findUpSync } from 'find-up'

let root: string | undefined

export default {
  /**
   * Resolves paths relative to the monorepo root directory, which is resolved by
   * looking upwards for package manager lockfiles.
   *
   * The operation is synchronous and will throw if the root cannot be resolved.
   * @param pathSegments
   * @returns
   */
  resolve: (...pathSegments: string[]): string =>
    path.resolve(findRoot(), ...pathSegments),

  get root(): string {
    if (!root) {
      return findRoot()
    }

    return root
  },

  set root(newRoot: string | undefined) {
    root = newRoot
  },
}

const findRoot = (): string => {
  const result = findUpSync([
    'bun.lockb',
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
  ])

  if (!result) {
    throw new Error(
      'Could not resolve the root directory of the monorepo. Make sure you have a lockfile generated first.',
    )
  }

  return path.dirname(result)
}
