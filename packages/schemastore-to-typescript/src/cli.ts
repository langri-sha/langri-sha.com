#!/usr/bin/env node
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { Command } from 'commander'
import createDebug from 'debug'
import esMain from 'es-main'

import { compile } from './index.js'

const debug = createDebug('schema-store-to-typescript')

export const program: Command = new Command()
  .name('schemastore-to-typescript')
  .description('Compile a JSON schema store schema to TypeScript definitions')
  .argument('<schema>', 'JSON schema store schema')
  .argument('[output]', 'Path to output the TypeScript definition')
  .option('-n, --no-cache', 'Skip caching requests')
  .showHelpAfterError()
  .action(async (schema, output, { cache }) => {
    output ??= `${schema}.d.ts`

    const compiled = await compile(schema, cache)
    await fs.writeFile(
      // Using `process.cwd()` as escape hatch for `process.chdir()` not being
      // available in workers. See: https://github.com/vitest-dev/vitest/issues/1436.
      path.resolve(process.cwd(), output),
      compiled,
    )
  })

if (esMain(import.meta)) {
  debug('Parsing arguments', process.argv)
  // Avoid top-level `await`: under tsx the cache layer can leave the request
  // promise pending while the event loop drains, which Node reports as an
  // unsettled top-level await (exit code 13) and hangs `prepare` in CI. Driving
  // the parse through `.then`/`.catch` and forcing the exit keeps termination
  // deterministic regardless of any lingering handle.
  program
    .parseAsync(process.argv)
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
