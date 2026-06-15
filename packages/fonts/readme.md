# @langri-sha/fonts

Self-hosted, subsetted display fonts for `@langri-sha/web`.

Each font listed in [`src/index.ts`](src/index.ts) is subsetted down to only the
glyphs it actually renders and re-encoded as woff2. This is the modern,
self-hosted replacement for the Google Fonts `&text=` endpoint the app used to
load at runtime via `webfontloader`: `apps/web` references the committed output
through
[`next/font/local`](https://nextjs.org/docs/app/api-reference/components/font),
so the font is preloaded with no render-blocking request and no client-side JS.

## Regenerating

The committed woff2 files are the deliverable. Regenerate and commit them
whenever a source font version or its covered `text` changes:

```sh
pnpm --filter @langri-sha/fonts generate-font
```

Currently `Cinzel Decorative` (400) subsetted to `Langri-Sha` — ~14 KB down to
~1.4 KB.
