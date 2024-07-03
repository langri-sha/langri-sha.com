#!/usr/bin/env node
import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import esMain from 'es-main'
import { Command } from 'commander'
import { compile } from './index.js'
import createDebug from 'debug'

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
  await program.parseAsync(process.argv)
}
