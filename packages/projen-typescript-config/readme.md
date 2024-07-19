# @langri-sha/typescript-config

A [projen] component for managing [TSConfig] files for [TypeScript] projects.

Offers full support for configuring TypeScript via [`@schemastore/tsconfig`], as
well as a handful of helpers that make it easy to maintain several TypeScript
projects inside a monorepo.

## Usage

Install required dependencies:

```sh
npm install projen @langri-sha/typescript-config
```

Create a TypeScript configuration for your project:

```sh
import { Project } from 'projen'
import { TypeScriptConfig } from '@langri-sha/typescript-config'

const project = new Project({
  name: 'test',
})

const tsconfig = new TypeScriptConfig(project)

const tsconfigBuild = new TypeScriptConfig(project, {
  fileName: 'tsconfig.build.json',
  config: {
    extends: ['tsconfig.json'],
    compilerOptions: {
      target: 'es2020',
    },
  }
})

project.synth()
```

[@schemastore/tsconfig]: https://github.com/schemastore/tsconfig
[projen]: https://projen.io/
[tsconfig]: https://www.typescriptlang.org/tsconfig.
[typescript]: https://www.typescriptlang.org/
