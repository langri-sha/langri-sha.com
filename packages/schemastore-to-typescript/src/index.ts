import * as path from 'node:path'

import createDebug from 'debug'
import envPaths from 'env-paths'
import got, { HTTPError } from 'got'
import {
  type JSONSchema,
  compile as compileSource,
} from 'json-schema-to-typescript'
import Keyv from 'keyv'
import { KeyvFile } from 'keyv-file'

const debug = createDebug('schema-store-to-typescript')
const paths = envPaths('schemastore-to-typescript')

// @ts-expect-error: Error with `keyv-file` package.
const keyv = new Keyv({
  store: new KeyvFile({
    filename: path.join(paths.cache, 'requests.json'),
    writeDelay: 0,
  }),
})

interface CatalogSchema {
  name: string
  description: string
  fileMatch?: string[]
  url: string
}

interface Catalog {
  $schema: string
  version: number
  schemas: CatalogSchema[]
}

export const compile = async (
  name: string,
  cache: boolean = true,
): Promise<string> => {
  const catalogUrl = 'https://www.schemastore.org/api/json/catalog.json'

  let catalog: Catalog
  let schema: JSONSchema

  const fetchWithRetry = async <T>(
    url: string,
    retryOnCacheError: boolean = true,
  ): Promise<T> => {
    try {
      return await got(url, {
        cache: cache ? keyv : undefined,
        headers: {
          accept: 'application/json',
        },
        decompress: true,
      }).json<T>()
    } catch (e) {
      debug(`Error fetching ${url}:`, e)

      if (
        retryOnCacheError &&
        cache &&
        e instanceof Error &&
        (e.message.includes('Unexpected token') ||
          e.message.includes('is not valid JSON'))
      ) {
        debug(`Clearing cache for ${url} and retrying...`)
        try {
          await keyv.delete(`GET:${url}`)
        } catch (clearError) {
          debug(`Failed to clear cache:`, clearError)
        }

        return fetchWithRetry<T>(url, false)
      }

      throw e
    }
  }

  try {
    // First, fetch the catalog
    catalog = await fetchWithRetry<Catalog>(catalogUrl)
  } catch (e) {
    debug(e)

    if (e instanceof HTTPError) {
      throw new Error(
        `Couldn't retrieve catalog from ${catalogUrl}. [${e.code}]`,
      )
    }

    throw e
  }

  const schemaMap = new Map<string, CatalogSchema>()
  for (const schema of catalog.schemas) {
    schemaMap.set(schema.name.toLowerCase(), schema)
  }

  const catalogSchema = schemaMap.get(name.toLowerCase())

  if (!catalogSchema) {
    throw new Error(
      `Couldn't find schema ${name} in the catalog. Are you sure it exists?`,
    )
  }

  try {
    // Fetch the actual schema from the found URL
    debug(`Fetching schema from: ${catalogSchema.url}`)

    schema = await fetchWithRetry<JSONSchema>(catalogSchema.url)
  } catch (e) {
    debug(e)

    if (e instanceof HTTPError) {
      if (e.response.statusCode === 404) {
        throw new Error(
          `Couldn't find schema ${name} at ${catalogSchema.url}. Are you sure it exists?`,
        )
      }

      throw new Error(
        `Couldn't retrieve schema from ${catalogSchema.url}. [${e.code}] Status: ${e.response.statusCode}`,
      )
    }

    if (e instanceof Error && e.message.includes('is not valid JSON')) {
      throw new Error(
        `Failed to parse JSON from ${catalogSchema.url}. The server might be returning invalid or compressed content. Error: ${e.message}`,
      )
    }

    throw e
  }

  return compileSource(schema, name)
}
