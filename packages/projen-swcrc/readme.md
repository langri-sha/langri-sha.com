# @langri-sha/projen-swcrc

A [projen] component for [configuring] [SWC].

## Usage

```sh
npm install -D projen @langri-sha/projen-swcrc
```

Add the SWC configuration:

```js
import { Project } from 'projen'
import { SWCConfiguration } from '@langri-sha/projen-swcrc'

const project = new Project({
  name: 'test',
})

new SWCConfiguration(project, {
  jsc: {
    parser: {
      syntax: 'ecmascript',
    },
  },
})

project.synth()
```

[configuring]: https://swc.rs/docs/configuration/swcrc
[projen]: https://projen.io/
[swc]: https://swc.rs/
