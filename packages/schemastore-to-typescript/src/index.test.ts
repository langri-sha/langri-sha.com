import { afterEach, expect, nock, test } from '@langri-sha/vitest'
import { compile } from './index.js'

afterEach(() => {
  nock.cleanAll()
})

test('compiles to TypeScript', async () => {
  nock('https://json.schemastore.org')
    .get('/foobar')
    .reply(200, {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Foobar Schema',
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The unique identifier for a foobar item.',
        },
      },
      required: ['id'],
    })

  const ts = await compile('foobar')

  expect(ts).toMatchSnapshot()
})

test('handles missing schemas', async () => {
  nock('https://json.schemastore.org').get('/foobar').reply(404)

  expect(compile('foobar')).rejects.toThrow(/Couldn't find schema foobar/)
})

test('handles spurious schema errors', async () => {
  nock('https://json.schemastore.org')
    .get('/foobar')
    .reply(500, {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Foobar Schema',
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The unique identifier for a foobar item.',
        },
      },
      required: ['id'],
    })

  expect(compile('foobar')).rejects.toThrow(/Couldn't retrieve schema/)
})
