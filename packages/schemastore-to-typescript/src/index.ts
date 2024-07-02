import * as path from 'node:path'
import got, { HTTPError } from 'got'
import {
  type JSONSchema,
  compile as compileSource,
} from 'json-schema-to-typescript'
import envPaths from 'env-paths'
import Keyv from 'keyv'
import { KeyvFile } from 'keyv-file'
import createDebug from 'debug'

const debug = createDebug('schema-store-to-typescript')
const paths = envPaths('schemastore-to-typescript')

const keyv = new Keyv({
  store: new KeyvFile({
    filename: path.join(paths.cache, 'requests.json'),
    writeDelay: 0,
  }),
})

export const compile = async (
  name: string,
  cache: boolean = true,
): Promise<string> => {
  let schema

  const url = new URL(name, 'https://json.schemastore.org').toString()

  try {
    schema = await got(url, {
      cache: cache ? keyv : undefined,
      headers: {
        accept: '*/*',
      },
    }).json<JSONSchema>()
  } catch (e) {
    debug(e)

    if (e instanceof HTTPError) {
      if (e.response.statusCode === 404) {
        throw new Error(
          `Couldn't find schema ${name} at ${url}. Are you sure it exists?`,
        )
      }

      throw new Error(`Couldn't retrieve schema from ${url}. [${e.code}]`)
    }

    throw e
  }

  return compileSource(schema, name)
}
