# @langri-sha/babel-test

Provides convenience helpers for inspecting and testing your [Babel] preset.

## Features

- load Babel presets with options, and produce a serializable, cross-platform
  output of all the loaded plugins and their settings

## Usage

Install related dependencies:

```sh
npm install -D @babel/core @langri-sha/babel-test
```

Then load the preset plugins:

```js
// Load preset plugins.
await loadPresetPlugins(
  // Set Babel API environment.
  'development',
  [
    // Preset to load.
    '@babel/preset-env',
    // Configure related preset options.
    { test: 'TEST_OPTIONS' },
  ]
)

/*
[
  [
    "<WORKSPACE>/node_modules/@babel/preset-env/index.js",
    {
      "foobar": "quuxnorf",
    },
  ],
]
```

[babel]: https://babeljs.io/docs/config-files
