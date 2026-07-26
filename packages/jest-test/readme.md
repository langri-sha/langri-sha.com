# @langri-sha/jest-test

Provides some useful helpers that are commonly used for authoring tests.

## Usage

Install the required dependencies:

```sh
npm install -D jest @langri-sha/jest-test
```

Then import your Jest test dependencies from here:

```js
// some.test.js
import { expect, test, temporaryDirectory } from '@langri-sha/jest-test'

test(/*...*/)
```

`tempy` is re-exported under its own named API (`temporaryFile`,
`temporaryDirectory`, `temporaryWrite`, …) rather than as a `tempy` namespace.

## See

- [`@jest/globals`]
- [`tempy`]

[`@jest/globals`]: https://jestjs.io/docs/api
[`tempy`]: https://github.com/sindresorhus/tempy
