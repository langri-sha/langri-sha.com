# @langri-sha/glsl-loader

A webpack loader, which Turbopack also runs, that imports GLSL sources as
strings with comments, indentation and blank lines stripped.

Node loads `src/index.ts` as is, using its built-in type stripping, so the
source sticks to erasable syntax, which `erasableSyntaxOnly` enforces.

## Consuming

```ts
// next.config.ts
const config: NextConfig = {
  turbopack: {
    rules: {
      '*.{vert,frag,glsl}': {
        loaders: ['@langri-sha/glsl-loader'],
        as: '*.js',
      },
    },
  },
}
```

```ts
import fragmentShaderSource from './default.frag'
```
