import type { PluginItem, TransformOptions } from '@babel/core'
import * as babel from '@babel/core'
import monorepo from '@langri-sha/monorepo'
import * as R from 'ramda'

export type Preset = {
  plugins: PluginItem[]
  presets: PluginItem[]
}

/*
 * For a given preset, returns the list of loaded plugins, transformed in a way
 * that they can be serialized across different environments.
 */
export const loadPresetPlugins = async (
  envName: string,
  preset: PluginItem,
): Promise<Array<[name: string, options: Record<string, unknown>]>> => {
  // @ts-expect-error: Missing `babel.loadOptionsAsync`.
  const { plugins } = await babel.loadOptionsAsync(options(envName, preset))

  // @ts-expect-error: `any[][]` is not assignable to returned tuple.
  return R.pipe(
    R.map(transformPaths),
    R.map(R.map(R.when(R.is(Object), transformNodeVersion))),
  )(plugins)
}

const options = (envName: string, preset: PluginItem): TransformOptions => ({
  babelrc: false,
  configFile: false,
  filename: module?.parent?.filename,
  envName,
  presets: [preset],
})

const transformPaths = ({
  key,
  options,
}: {
  key: string
  options: Record<string, unknown>
}): [string, Record<string, unknown>] => [
  key.replace(monorepo.root, '<WORKSPACE>'),
  options,
]

const transformNodeVersion = R.evolve({
  targets: R.evolve({
    node: R.when(
      R.equals(process.version.slice(1)),
      R.always('%NODE_CURRENT%'),
    ),
  }),
})
