import { expect, test } from '@langri-sha/vitest'

import { loadPresetPlugins } from './'

test.skip('resolves configured Babel preset plugins', async () => {
  const plugins = await loadPresetPlugins(
    'development',
    new URL('./fixtures/babel-preset-test.ts', import.meta.url).href,
  )

  expect(plugins).toMatchInlineSnapshot(`
    [
      [
        "<WORKSPACE>/packages/babel-test/src/fixtures/babel-plugin-test.ts",
        {
          "foobar": "quuxnorf",
        },
      ],
    ]
  `)
})

test.skip('resolves configured Babel preset with options', async () => {
  const plugins = await loadPresetPlugins('development', [
    new URL('./fixtures/babel-preset-test.ts', import.meta.url).href,
    { test: 'TEST_OPTIONS' },
  ])

  expect(plugins).toMatchInlineSnapshot(`
    [
      [
        "<WORKSPACE>/packages/babel-test/src/fixtures/babel-plugin-test.ts",
        {
          "foobar": "quuxnorf",
          "test": "TEST_OPTIONS",
        },
      ],
    ]
  `)
})

test.skip('replaces Node.js versions in preset options with the current Node.js version', async () => {
  const plugins = await loadPresetPlugins('development', [
    new URL('./fixtures/babel-preset-test.ts', import.meta.url).href,
    { targets: { node: process.version.slice(1) } },
  ])

  expect(plugins).toMatchInlineSnapshot(`
    [
      [
        "<WORKSPACE>/packages/babel-test/src/fixtures/babel-plugin-test.ts",
        {
          "foobar": "quuxnorf",
          "targets": {
            "node": "%NODE_CURRENT%",
          },
        },
      ],
    ]
  `)
})
