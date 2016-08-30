import path from 'path'

export const resolve = (...args) => (
  path.resolve(process.cwd(), ...args)
)

export const ours = (absolute) => (
  absolute.startsWith(resolve('src'))
)

export const theirs = (absolute) => (
  !ours(absolute)
)

export const kb = (n) => 2 ** (10 + n - 1)
