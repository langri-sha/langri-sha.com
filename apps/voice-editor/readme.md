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
