import { beforeAll, tempy, test } from '@langri-sha/vitest'
import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import { compile } from './index.js'
import { program } from './cli.js'
import { expect, vi } from 'vitest'

vi.mock('./index', () => ({ compile: vi.fn(() => 'export {}') }))

beforeAll(async () => {
  vi.spyOn(process, 'cwd').mockReturnValue(tempy.directory())
  await fs.mkdir(process.cwd(), { recursive: true })

  return () => {
    vi.restoreAllMocks()
  }
})

test('compiles schema to TypeScript', async () => {
  await program.parseAsync(['node', 'cli.ts', 'swcrc'])

  expect(compile).toHaveBeenCalledWith('swcrc', true)
})

test('saves output to default definition module path when not specified', async () => {
  await program.parseAsync(['node', 'cli.ts', 'swcrc'])

  await expect(
    fs.stat(path.join(process.cwd(), 'swcrc.d.ts')),
  ).resolves.toBeTruthy()
})

test('saves compiled contents', async () => {
  await program.parseAsync(['node', 'cli.ts', 'swcrc'])

  expect(
    (await fs.readFile(path.join(process.cwd(), 'swcrc.d.ts'))).toString(),
  ).toMatchInlineSnapshot(`"export {}"`)
})

test('saves definition module to specified output path', async () => {
  const output = path.join(tempy.directory(), 'swcrc.d.ts')
  await program.parseAsync(['node', 'cli.ts', 'swcrc', output])

  await expect(fs.stat(output)).resolves.toBeTruthy()
})

test('disables cache with `--no-cache`', async () => {
  await program.parseAsync(['node', 'cli.ts', 'swcrc', '--no-cache'])

  expect(compile).toHaveBeenCalledWith('swcrc', false)
})
