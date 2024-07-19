# @langri-sha/webpack

A package that aggregates [Webpack] dependencies, making it easier to use
Webpack for your builds in monorepos.

## Features

- provides a resolve loader, so you can build in the monorepo without having to
  install dependencies in each package
- supports resolving TypeScript modules out of the box

## Usage

Install the dependencies:

```sh
npm install -D wepback webpack-cli
```

Then configure your Webpack configuration:

```js
// webpack.config.js
import { type Configuration, resolve, resolveLoader } from '@langri-sha/webpack'

export default {
  resolve,
  resolveLoader
} as Configuration
```

[webpack]: https://webpack.js.org/
