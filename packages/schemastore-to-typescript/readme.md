# @langri-sha/schemastore-to-typescript

Fetch [JSON Schema] from the [JSON Schema Store] catalog and compile [TypeScript
typings].

The tool first fetches the schema catalog from the JSON Schema Store API,
searches for the requested schema by name (case-insensitive), and then downloads
and compiles the schema to TypeScript definitions.

## Features

- uses [`json-schema-to-typescript`] for TypeScript generation
- fetches schemas from the [JSON Schema Store catalog API]
- case-insensitive schema name matching
- offline cache using [`got`] for both catalog and schema requests

[got]: https://www.npmjs.com/package/got
[json schema store]: https://www.schemastore.org/
[json schema store catalog api]:
  https://www.schemastore.org/api/json/catalog.json
[json schema]: https://json-schema.org/
[json-schema-to-typescript]:
  https://www.npmjs.com/package/json-schema-to-typescript
[typescript typings]:
  https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html
