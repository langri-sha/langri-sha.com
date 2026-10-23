export interface Entry {
  slug: string
  number: number
  title: string
  date: string
  minutes: number
  summary: string
  tags: string[]
  body?: string[]
}

export const entries: Entry[] = [
  {
    slug: 'starting-the-scene-before-hydration',
    number: 12,
    title: 'Starting the scene before hydration',
    date: '2026-10-06',
    minutes: 6,
    summary:
      'The night sky used to wait for React. Now it starts from an inline script while the document is still parsing.',
    tags: ['WebGL', 'performance'],
    body: [
      'The landing page is one fragment shader and a wordmark. For a long time the shader waited for React: the bundle had to load, hydrate and run an effect before the first frame of the sky appeared, so on a slow phone the page sat as a flat gradient for the better part of a second.',
      'The scene now starts from an inline script placed right after the header. Its body is the same start function the component uses, serialized with toString, so it may not reach for anything outside itself, and a test rebuilds it from its own source to keep it that way. When hydration arrives, the component finds the running scene on the canvas and adopts it instead of starting a second one.',
      'Order turned out to matter more than speed. Starting the script ahead of the header delayed the wordmark, which is the largest contentful paint, so the sky now lights a moment after the name is on screen rather than before it.',
    ],
  },
  {
    slug: 'giving-a-shader-an-lcp-candidate',
    number: 11,
    title: 'Giving a page that is mostly shader an LCP candidate',
    date: '2026-09-24',
    minutes: 4,
    summary:
      'Canvas pixels never count as contentful. Shipping the wordmark as a high-priority image gave the page something to measure, and a budget to defend.',
    tags: ['performance'],
  },
  {
    slug: 'the-drone-off-the-click-task',
    number: 10,
    title: 'Building the drone off the click task',
    date: '2026-09-19',
    minutes: 5,
    summary:
      'The first note of the ambient drone used to cost a long task on the click that started it. Deferring the audio graph keeps the toggle responsive.',
    tags: ['audio', 'interaction'],
  },
  {
    slug: 'moving-the-sky-to-webgl-2',
    number: 9,
    title: 'Moving the sky to WebGL 2',
    date: '2026-09-12',
    minutes: 7,
    summary:
      'GLSL ES 3.00, a single triangle in place of a quad, and the handful of shader outputs that changed on the way.',
    tags: ['WebGL'],
  },
  {
    slug: 'previews-behind-identity-aware-proxy',
    number: 8,
    title: 'Previews behind Identity-Aware Proxy',
    date: '2026-08-30',
    minutes: 8,
    summary:
      'Every pull request gets its own preview on Cloud Run, reachable by people only, which made checking them from scripts an interesting problem.',
    tags: ['infrastructure'],
  },
  {
    slug: 'counting-npm-downloads-once',
    number: 7,
    title: 'Counting npm downloads once a day',
    date: '2026-08-16',
    minutes: 5,
    summary:
      'A small Rust job reports package downloads to PostHog, and learns to leave alone the days npm has not finished counting.',
    tags: ['telemetry', 'Rust'],
  },
]
