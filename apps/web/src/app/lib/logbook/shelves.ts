export interface Shelf {
  title: string
  inline?: boolean
  items: {
    name: string
    href: string
    description?: string
  }[]
}

export const shelves: Shelf[] = [
  {
    title: 'Projects',
    items: [
      {
        name: 'langri-sha.com',
        href: 'https://github.com/langri-sha/langri-sha.com',
        description: 'This site, its night sky and the drone.',
      },
      {
        name: 'projen',
        href: 'https://github.com/langri-sha/projen',
        description: 'Packages that scaffold and maintain my repositories.',
      },
      {
        name: 'dagger',
        href: 'https://github.com/langri-sha/dagger',
        description: 'Reusable Dagger modules for CI checks.',
      },
    ],
  },
  {
    title: 'Packages',
    items: [
      {
        name: '@langri-sha/eslint-config',
        href: 'https://www.npmjs.com/package/@langri-sha/eslint-config',
        description: 'Shared ESLint flat config.',
      },
      {
        name: '@langri-sha/tsconfig',
        href: 'https://www.npmjs.com/package/@langri-sha/tsconfig',
        description: 'Shared TypeScript configurations.',
      },
      {
        name: '@langri-sha/prettier',
        href: 'https://www.npmjs.com/package/@langri-sha/prettier',
        description: 'An opinionated Prettier config.',
      },
    ],
  },
  {
    title: 'Tools',
    items: [
      {
        name: 'github',
        href: 'https://github.com/langri-sha/github',
        description: 'Reusable workflows and composite actions.',
      },
      {
        name: 'terraform-google-cloud-platform',
        href: 'https://github.com/langri-sha/terraform-google-cloud-platform',
        description: 'Terraform modules for Google Cloud.',
      },
    ],
  },
  {
    title: 'Elsewhere',
    inline: true,
    items: [
      { name: 'GitHub', href: 'https://github.com/langri-sha' },
      {
        name: 'Stack Overflow',
        href: 'https://stackoverflow.com/users/44041/filip-dupanovi%C4%87?tab=profile',
      },
      { name: 'npm', href: 'https://www.npmjs.com/~langri-sha' },
      { name: 'Docker Hub', href: 'https://hub.docker.com/u/langrisha/' },
      { name: 'Keybase', href: 'https://keybase.io/langrisha' },
    ],
  },
]
