# @langri-sha/voice

The throat-sung voice, as a Web Audio graph.

A small Klatt-style formant synthesiser — a subharmonic sawtooth pair driven
through parallel formant filters that walk a syllable table — plus the chant
that table spells out: »Snovi su poruke iz dubine«. Everything is synthesised at
runtime; nothing is sampled.

The package is framework-free: it needs an `AudioContext` and nothing else.

## Consuming

```ts
import { Voice } from '@langri-sha/voice'

const voice = new Voice(context, destination)
voice.start(context.currentTime + 0.05)
// `voice.handoffAt` is the offset at which a caller should hand off.
voice.dispose()
```

The constructor takes an optional chant and character, both defaulting to the
`CHANT` and `CHARACTER` tables exported alongside it. `@langri-sha/voice-editor`
passes edited ones to audition them.
