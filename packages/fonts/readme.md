# @langri-sha/fonts

Self-hosted, subsetted display fonts for `@langri-sha/web`.

Each font in [`src/index.ts`](src/index.ts) is subsetted to only the glyphs it
renders, re-encoded as woff2, and bundled into a self-contained `dist/`. This is
the modern, self-hosted replacement for the Google Fonts `&text=` endpoint the
app used to load at runtime via `webfontloader` — but with nothing to serve and
no font request: the woff2 is inlined as a base64 data URI inside an
`@font-face` rule.

## Consuming

The main module exports, per font, its `family` and a ready-to-inject
`@font-face`, plus a `fontFaces` aggregate:

```ts
import { cinzelDecorative, fontFaces } from '@langri-sha/fonts'

// Inject `fontFaces` once (e.g. into an Emotion `Global`), then reference:
const heading = css`
  font-family: ${cinzelDecorative.family}, serif;
`
```

`dist/` is generated (gitignored) and rebuilt on install via `prepare`.

## Pipelines

| Script          | When                              | Output                                   |
| --------------- | --------------------------------- | ---------------------------------------- |
| `generate-font` | source version or `text` changes  | the committed subset under `files/`      |
| `build`         | install (`prepare`), or on demand | the self-contained `dist/` from `files/` |

```sh
pnpm --filter @langri-sha/fonts generate-font   # re-subset, then commit files/
pnpm --filter @langri-sha/fonts build           # rebuild dist/
```

Currently `Cinzel Decorative` (400) subsetted to `Langri-Sha` — ~14 KB down to
~1.4 KB.
