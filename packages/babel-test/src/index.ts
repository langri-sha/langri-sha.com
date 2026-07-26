import type { InputOptions, PluginItem, PresetItem } from '@babel/core'
import * as babel from '@babel/core'
import monorepo from '@langri-sha/monorepo'
import * as R from 'ramda'

export type Preset = {
  plugins: PluginItem[]
  presets: PresetItem[]
}

/*
 * For a given preset, returns the list of loaded plugins, transformed in a way
 * that they can be serialized across different environments.
 */
export const loadPresetPlugins = async (
  envName: string,
  preset: PresetItem,
): Promise<Array<[name: string, options: Record<string, unknown>]>> => {
  const resolved = await babel.loadOptionsAsync(options(envName, preset))

  // @ts-expect-error: `any[][]` is not assignable to returned tuple.
  return R.pipe(
    R.map(transformPaths),
    R.map(R.map(R.when(R.is(Object), transformNodeVersion))),
  )(resolved?.plugins ?? [])
}

const options = (envName: string, preset: PresetItem): InputOptions => ({
  babelrc: false,
  configFile: false,
  filename: module?.parent?.filename,
  envName,
  presets: [preset],
})

/*
 * `@babel/core` keeps the class backing resolved plugins internal, so we derive
 * its shape from the options loader instead.
 */
type ResolvedPlugin = NonNullable<
  Awaited<ReturnType<typeof babel.loadOptionsAsync>>
>['plugins'][number]

const transformPaths = ({
  key,
  options,
}: ResolvedPlugin): [string, Record<string, unknown>] => [
  (key ?? '').replace(monorepo.root, '<WORKSPACE>'),
  options as Record<string, unknown>,
]

const transformNodeVersion = R.evolve({
  targets: R.evolve({
    node: R.when(
      R.equals(process.version.slice(1)),
      R.always('%NODE_CURRENT%'),
    ),
  }),
})
