import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import subsetFont from 'subset-font'

import { fonts } from '../src/index.ts'

const require = createRequire(import.meta.url)
const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

for (const { source, output, text } of Object.values(fonts)) {
  const sourcePath = path.join(
    path.dirname(require.resolve(`${source.package}/package.json`)),
    source.file,
  )
  const outputPath = path.join(root, output)

  const original = await readFile(sourcePath)
  const subset = await subsetFont(original, text, { targetFormat: 'woff2' })

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, subset)

  const saved = (
    ((original.length - subset.length) / original.length) *
    100
  ).toFixed(1)
  console.log(
    `${output}: ${original.length} → ${subset.length} bytes ` +
      `(-${saved}%) for "${text}"`,
  )
}
