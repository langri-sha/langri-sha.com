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
        "<WORKSPACE>/packages/babel-helpers/src/fixtures/babel-plugin-test.ts",
        {
          "foobar": "quuxnorf",
        },
      ],
    ]
  `)
})

test('resolves configured Babel preset plugins with options', async () => {
  const plugins = await loadPresetPlugins('development', [
    require.resolve('./fixtures/babel-preset-test'),
    { test: 'TEST_OPTIONS' },
  ])

  expect(plugins).toMatchInlineSnapshot(`
    [
      [
        "<WORKSPACE>/packages/babel-helpers/src/fixtures/babel-plugin-test.ts",
        {
          "foobar": "quuxnorf",
          "test": "TEST_OPTIONS",
        },
      ],
    ]
  `)
})
