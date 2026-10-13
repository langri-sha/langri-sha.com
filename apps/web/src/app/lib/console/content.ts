export interface Section {
  id: string
  part: string
  label: string
  title: string
}

export const sections = {
  log: { id: 'log', part: 'LOG / 01', label: 'Log', title: 'Transmission log' },
  modules: {
    id: 'modules',
    part: 'MOD / 02',
    label: 'Modules',
    title: 'Module bay',
  },
} as const satisfies Record<string, Section>

export interface Transmission {
  slug: string
  date: string
  title: string
  channel: string
  minutes: number
  excerpt: string
}

export const transmissions: Transmission[] = [
  {
    slug: 'freezing-a-webgl-rift-for-screenshots',
    date: '2026-10-02',
    title: 'Freezing a WebGL rift for screenshots',
    channel: 'WebGL',
    minutes: 7,
    excerpt:
      'Headless Chrome renders the landing scene on SwiftShader. Light shaders survive it, heavy ones go white. Pinning u_time and reading the canvas back gives repeatable captures without a GPU.',
  },
  {
    slug: 'a-first-party-posthog-proxy-behind-cloud-cdn',
    date: '2026-09-24',
    title: 'A first-party PostHog proxy behind Cloud CDN',
    channel: 'Infra',
    minutes: 9,
    excerpt:
      'Analytics that survive blockers without handing visitor addresses to a third party: an nginx origin on Cloud Run, a CDN in front, and what to cache when the payload is a script.',
  },
  {
    slug: 'building-the-drone-audio-graph-off-the-click-task',
    date: '2026-09-15',
    title: 'Building the drone audio graph off the click task',
    channel: 'Audio',
    minutes: 6,
    excerpt:
      'The ambient drone used to stall the first click while its worklet compiled. Moving graph construction out of the event handler kept INP under budget.',
  },
  {
    slug: 'why-every-projen-preset-owns-its-declarations',
    date: '2026-09-03',
    title: 'Why every projen preset owns its declarations',
    channel: 'Projen',
    minutes: 8,
    excerpt:
      'Presets that patch a consumer’s dependencies make Renovate PRs immortal. Letting each preset own what it declares, and nothing else, ended the churn.',
  },
  {
    slug: 'dagger-checks-on-github-actions',
    date: '2026-08-21',
    title: 'Dagger checks on GitHub Actions',
    channel: 'Dagger',
    minutes: 5,
    excerpt:
      'Lint, format, synth and tests as one Dagger workspace, with the workflow reduced to a call and a trace link on the commit status.',
  },
  {
    slug: 'porting-npm-lazy-to-rust',
    date: '2026-08-09',
    title: 'Porting npm_lazy to Rust with a minimum release age',
    channel: 'Rust',
    minutes: 11,
    excerpt:
      'A caching registry proxy that refuses versions younger than a week turns a supply-chain policy into a network boundary.',
  },
  {
    slug: 'previews-behind-iap',
    date: '2026-07-28',
    title: 'Previews behind IAP, one route per pull request',
    channel: 'Infra',
    minutes: 7,
    excerpt:
      'Every pull request gets an image and a path on a single preview router, and only signed-in reviewers get through.',
  },
  {
    slug: 'hand-tracing-a-wordmark',
    date: '2026-07-14',
    title: 'Hand-tracing a wordmark from Cinzel Decorative',
    channel: 'Type',
    minutes: 4,
    excerpt:
      'One path instead of a webfont: tracing the wordmark, rounding it to a decimal, and shipping it once as the largest contentful paint.',
  },
]

export interface Module {
  name: string
  kind: string
  status: 'live' | 'beta' | 'prototype'
  summary: string
  readouts: { label: string; value: string }[]
  trace?: number[]
  links: { label: string; href: string }[]
}

export const modules: Module[] = [
  {
    name: '@langri-sha/projen-project',
    kind: 'Package',
    status: 'live',
    summary:
      'The projen preset behind every langri-sha repository: Node and pnpm baselines, lint, format and release.',
    readouts: [
      { label: 'Weekly', value: '1,284' },
      { label: 'Version', value: '0.38.1' },
    ],
    trace: [612, 701, 688, 845, 790, 932, 1010, 968, 1102, 1188, 1150, 1284],
    links: [
      {
        label: 'npm',
        href: 'https://www.npmjs.com/package/@langri-sha/projen-project',
      },
      {
        label: 'Source',
        href: 'https://github.com/langri-sha/projen',
      },
    ],
  },
  {
    name: '@langri-sha/tsconfig',
    kind: 'Package',
    status: 'live',
    summary:
      'Strict TypeScript bases for projects, libraries and React, shared across the fleet.',
    readouts: [
      { label: 'Weekly', value: '2,917' },
      { label: 'Version', value: '1.1.1' },
    ],
    trace: [
      2210, 2380, 2290, 2460, 2530, 2490, 2680, 2610, 2770, 2840, 2795, 2917,
    ],
    links: [
      {
        label: 'npm',
        href: 'https://www.npmjs.com/package/@langri-sha/tsconfig',
      },
      { label: 'Source', href: 'https://github.com/langri-sha/projen' },
    ],
  },
  {
    name: 'langri-sha/dagger',
    kind: 'Modules',
    status: 'beta',
    summary:
      'Dagger modules for CI and Terraform checks, called from every workspace instead of copied YAML.',
    readouts: [
      { label: 'Release', value: 'ci/v0.1.0' },
      { label: 'Consumers', value: '7' },
    ],
    links: [{ label: 'Source', href: 'https://github.com/langri-sha/dagger' }],
  },
  {
    name: 'lazaretum',
    kind: 'Tool',
    status: 'prototype',
    summary:
      'A Rust port of npm_lazy with supply-chain gates, starting with a minimum release age.',
    readouts: [
      { label: 'Language', value: 'Rust' },
      { label: 'Gate', value: '7 days' },
    ],
    links: [
      { label: 'Source', href: 'https://github.com/langri-sha/lazaretum' },
    ],
  },
  {
    name: 'github-repos',
    kind: 'Infrastructure',
    status: 'live',
    summary:
      'Terraform that governs the repository fleet: settings, rulesets, apps and secrets.',
    readouts: [
      { label: 'Repositories', value: '31' },
      { label: 'Drift', value: '0' },
    ],
    links: [
      { label: 'Source', href: 'https://github.com/langri-sha/github-repos' },
    ],
  },
  {
    name: 'terraform-google-cloud-platform',
    kind: 'Modules',
    status: 'live',
    summary:
      'Reusable Google Cloud modules for Cloud Run services, the edge and Secret Manager.',
    readouts: [
      { label: 'Modules', value: '9' },
      { label: 'Release', value: 'v2.4.0' },
    ],
    links: [
      {
        label: 'Source',
        href: 'https://github.com/langri-sha/terraform-google-cloud-platform',
      },
    ],
  },
]
