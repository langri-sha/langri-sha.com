# @langri-sha/projen-eslint

A [projen] component for configuring [ESLint].

## Usage

Install dependencies:

```sh
npm install -D eslint @langri-sha/projen-eslint
```

Then, create an `ESLint` component for your project:

```js
import { Project } from 'projen'
import { ESLint } from '@langri-sha/projen-eslint'

const project = new Project({
  name: 'my-project',
})

new ESLint(project, {
  ignorePatterns: ['.*'],
  extends: '@langri-sha/eslint-config'
  config: [
    {
      rules: {
        'unicorn/prefer-node-modules': 'error'
      }
    }
  ]
})
```

[eslint]: https://eslint.org/docs/latest/
[projen]: https://projen.io/
