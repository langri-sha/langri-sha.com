export interface Post {
  slug: string
  title: string
  dek: string
  date: string
  topic: string
  minutes: number
  featured?: boolean
  lead?: string[]
}

export const posts: Post[] = [
  {
    slug: 'starting-the-scene-before-hydration',
    title: 'Starting the scene before hydration',
    dek: 'Serialising a function into an inline script, so the first frame of the night never waits for React.',
    date: '2026-09-30',
    topic: 'Web',
    minutes: 7,
  },
  {
    slug: 'a-rift-in-a-single-fragment-shader',
    title: 'A rift in a single fragment shader',
    dek: 'Why the night above is one triangle, a handful of exponents and no textures, and what it took to keep it legible at every resolution.',
    date: '2026-09-14',
    topic: 'Graphics',
    minutes: 12,
    featured: true,
    lead: [
      'The first version of the night was a ray-marched noise field. It looked wonderful at the size I designed it and like television static everywhere else: on a phone the tear dissolved into grain, and on a wide monitor it smeared into fog.',
      'What replaced it is almost embarrassingly small. A superellipse with an exponent below one draws the four-pointed star; two Gaussian bands curl behind it; a seam wavers on two sines and a sparse, deterministic glitch. Everything is analytic, so it is sharp at any size, and it fits in a single draw call.',
    ],
  },
  {
    slug: 'a-drone-in-an-audio-worklet',
    title: 'A drone in an AudioWorklet',
    dek: 'Building the ambient drone off the click task, and learning how long anyone actually listens.',
    date: '2026-08-22',
    topic: 'Audio',
    minutes: 9,
  },
  {
    slug: 'previews-behind-the-front-door',
    title: 'Previews behind the front door',
    dek: 'Pull-request previews on Cloud Run, gated by identity, with no public bucket left to forget about.',
    date: '2026-08-03',
    topic: 'Infrastructure',
    minutes: 11,
  },
  {
    slug: 'analytics-without-a-third-party',
    title: 'Analytics without a third party',
    dek: 'Proxying PostHog first-party through Cloud CDN, and what the cache taught me about my own headers.',
    date: '2026-07-18',
    topic: 'Web',
    minutes: 6,
  },
  {
    slug: 'a-preset-for-a-fleet',
    title: 'A preset for a fleet',
    dek: 'One projen preset, many repositories, and the pins it kept quietly overwriting.',
    date: '2026-06-02',
    topic: 'Tooling',
    minutes: 8,
  },
  {
    slug: 'a-minimum-age-for-dependencies',
    title: 'A minimum age for dependencies',
    dek: 'Letting a release sit for a few days before it reaches a lockfile is the cheapest supply-chain defence there is.',
    date: '2025-11-11',
    topic: 'Supply chain',
    minutes: 10,
  },
  {
    slug: 'letting-renovate-land-itself',
    title: 'Letting Renovate land itself',
    dek: 'Grouping, release-age gates and a queue that mostly merges on its own.',
    date: '2025-09-27',
    topic: 'Tooling',
    minutes: 5,
  },
  {
    slug: 'checks-that-run-the-same-everywhere',
    title: 'Checks that run the same everywhere',
    dek: 'Moving lint, format and tests into Dagger, so a laptop and CI finally agree.',
    date: '2025-05-09',
    topic: 'CI',
    minutes: 7,
  },
  {
    slug: 'notes-on-a-quiet-year',
    title: 'Notes on a quiet year',
    dek: 'Fewer commits, more reading, and a list of things I stopped automating.',
    date: '2024-12-16',
    topic: 'Notes',
    minutes: 4,
  },
  {
    slug: 'ten-pixels-to-the-rem',
    title: 'Ten pixels to the rem',
    dek: 'Why this site still sets the root font size to 62.5%, and when I would stop.',
    date: '2024-03-03',
    topic: 'Notes',
    minutes: 3,
  },
]
