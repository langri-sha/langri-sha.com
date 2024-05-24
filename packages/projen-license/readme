# @langri-sha/projen-license

A [projen] component for generating license files using [`license-o-matic`].

## Usage

Install dependencies:

```sh
npm install -D projen @langri-sha/projen-license
```

Then, create an `License` component for your projects:

```js
import { Project } from 'projen'
import { License } from '@langri-sha/license'

const project = new Project({
  name: 'my-project',
})

new License(project, {
  filename: 'license',
  spdx: 'MIT',
  copyrightHolder: 'John Smith <john.smith@example.com>',
  copyrightYear: '2000',
})
```

[license-o-matic]: https://www.npmjs.com/package/license-o-matic
[projen]: https://projen.io/
