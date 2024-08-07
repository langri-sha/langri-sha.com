# @langri-sha/projen-jest-config

A [projen] component for authoring [Jest] configurations. This component is
suitable for monorepos and offers support for extending from an existing Jest
configuration.

## Usage

Install required dependencies:

```sh
npm install -D jest @langri-sha/projen-jest-config
```

Configure Jest for your project:

```ts
// .projenrc.ts
import { Project } from 'projen'
import { JestConfig } from '@langri-sha/projen-jest-config'

const project = new Project({
  name: 'my-project',
})

new JestConfig(project, {
  // Configure the desired Jest configuration module. Optional.
  filename: 'jest.config.ts',
  // Choose a desired Jest configuration module. Optional.
  extends: '@langri-sha/jest-config',
  // Inline your preferred configuration overrides.
  config: {
    testEnvironment: 'node',
  },
})
```

This should produce the following output:

```ts
// jest.config.ts
import type { Config } from 'jest'
import defaults from '@langri-sha/jest-config'

const config: Config = {
  ...defaults,
  testEnvironment: 'node',
}

export default config
```

[projen]: https://projen.io/
[jest]: https://jestjs.io/docs/
