# @langri-sha/vitest

Provides some useful helpers that are commonly used for authoring tests.

## Usage

Install the required dependencies:

```sh
npm install -D vitest @langri-sha/vitest
```

Then import your Vitest dependencies from here:

```js
// some.test.js
import { expect, test, tempy } from '@langri-sha/vitest'

test(/*...*/)
```

## See

- [`@jest/globals`]
- [`tempy`]

[`@jest/globals`]: https://jestjs.io/docs/api
[`tempy`]: https://github.com/sindresorhus/tempy
