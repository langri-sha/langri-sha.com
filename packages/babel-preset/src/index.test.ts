import { loadPresetPlugins } from '@langri-sha/babel-test'
import { expect, test } from '@langri-sha/vitest'

test.skip('default preset plugins', async () => {
  for (const environment of ['development', 'production']) {
    const plugins = await loadPresetPlugins(
      environment,
      '@langri-sha/babel-preset',
    )

    expect(plugins).toMatchSnapshot(`${environment} environment`)
  }
})
