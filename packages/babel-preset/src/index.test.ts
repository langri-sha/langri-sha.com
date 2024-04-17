import { test, expect } from '@langri-sha/jest-test'

import { loadPresetPlugins } from '@langri-sha/babel-test'

test('default preset plugins', async () => {
  for (const environment of ['development', 'production']) {
    const plugins = await loadPresetPlugins(
      environment,
      '@langri-sha/babel-preset',
    )

    expect(plugins).toMatchSnapshot(`${environment} environment`)
  }
})
