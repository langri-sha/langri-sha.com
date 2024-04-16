import { test, expect } from '@langri-sha/jest-test'

import { loadPresetPlugins } from './'

test('resolves configured Babel preset plugins', async () => {
  const plugins = await loadPresetPlugins(
    'development',
    require.resolve('./fixtures/babel-preset-test')
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

test('resolves configured Babel preset with options', async () => {
  const plugins = await loadPresetPlugins('development', [
    require.resolve('./fixtures/babel-preset-test'),
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

test('replaces Node.js versions in preset options with the current Node.js version', async () => {
  const plugins = await loadPresetPlugins('development', [
    require.resolve('./fixtures/babel-preset-test'),
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
