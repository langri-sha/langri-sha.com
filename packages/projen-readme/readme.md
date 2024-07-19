# @langri-sha/readme

A [projen] component for creating sample [`README` files].

## Usage

Install dependencies:

```sh
npm install -D @langri-sha/readme
```

Then, create a `README` component for your projects:

```js
import { Project } from 'projen'
import { ReadmeFile } from '@langri-sha/readme'

const project = new Project({
  name: 'my-project',
})

new ReadmeFile(project)
```

[readme files]:
  https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes
[projen]: https://projen.io/
