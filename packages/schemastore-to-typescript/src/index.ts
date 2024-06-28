import got, { HTTPError } from 'got'
import {
  type JSONSchema,
  compile as compileSource,
} from 'json-schema-to-typescript'

export const compile = async (name: string): Promise<string> => {
  let schema

  const url = new URL(name, 'https://json.schemastore.org').toString()

  try {
    schema = await got(url).json<JSONSchema>()
  } catch (e) {
    if (e instanceof HTTPError) {
      if (e.response.statusCode === 404) {
        throw new Error(
          `Couldn't find schema ${name} at ${url}. Are you sure it exists?`,
        )
      }

      throw new Error(`Couldn't retrieve schema from ${url}. [${e.code}]`)
    }

    if (e instanceof Error) {
      throw new Error(`${e.name} Couldn't retrieve schema from ${url}.]`)
    }

    throw e
  }

  return compileSource(schema, name)
}
