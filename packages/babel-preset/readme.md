# @langri-sha/babel-preset

This is Babel preset that suitable for targetting modern browsers and runtimes,
with support for [TypeScript], [Emotion] and [React].

## Usage

Install the preset and it's realted dependencies:

```sh
npm install -D @babel/core @langri-sha/babel-preset
```

Add a root Babel configuration:

```js
// babel.config.js
module.exports = {
  presets: ['@langri-sha/babel-preset'],
}
```

For usage with [Webpack] and [`babel-loader`]:

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(c|m)?(t|j)sx?$/,
        loader: 'babel-loader',
      },
    ],
  },
}
```

## See

- [Using Babel]

[`babel-loader`]: https://www.npmjs.com/package/babel-loader
[emotion]: https://emotion.sh/docs/babel
[react]: https://react.dev/learn
[typescript]:
  https://www.typescriptlang.org/docs/handbook/babel-with-typescript.html
[using babel]: https://babeljs.io/setup
[webpack]: https://webpack.js.org/loaders/babel-loader/
