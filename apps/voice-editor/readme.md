# @langri-sha/voice-editor

A tuning console for `@langri-sha/voice`: the chant's syllable table exposed as
a timeline, lines and knobs, with live playback and a copy-back of the edits in
the source file's own shape.

```sh
pnpm --filter @langri-sha/voice-editor start
```

It serves the tuner at the root. Nothing here ships with the site — tune, copy
the table, and paste it over `CHANT` and `CHARACTER` in
[`packages/voice/src/index.ts`](../../packages/voice/src/index.ts).

## Previews

`main` is served behind IAP at
[`preview.langri-sha.com/voice-editor/`](https://preview.langri-sha.com/voice-editor/)
and redeployed whenever the editor or a workspace package changes, from an
origin service of its own — see [`apps/preview`](../preview/readme.md) for why
it is not a traffic tag on the site's.

The export reads `BASE_PATH`, which the preview build sets to `/voice-editor`.
The router strips that prefix before it proxies, so the image serves from its
own root and only the asset URLs carry it. Those assets are baked into the image
rather than published to the preview assets bucket, which is public: everything
the editor ships stays behind IAP.
