import minimist from 'minimist'
import path from 'path'

const argv = minimist(process.argv)

export const resolve = (...args) => (
  path.resolve(process.cwd(), ...args)
)

export const ours = (absolute) => (
  absolute.startsWith(resolve('src'))
)

export const theirs = (absolute) => (
  !ours(absolute)
)

export const debug = (compiler) => (
  compiler.debug || argv.debug || argv.d
)

export const kb = (n) => 2 ** (10 + n - 1)
