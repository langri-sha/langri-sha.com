import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import { Project } from '@langri-sha/projen-project'
import { SampleFile } from 'projen'

const pkg = {
  authorEmail: 'filip.dupanovic@gmail.com',
  authorName: 'Filip Dupanović',
  authorOrganization: false,
  authorUrl: 'https://langri-sha.com',
  bugsUrl: 'https://github.com/langri-sha/langri-sha.com/issues',
  license: 'MIT',
  licensed: true,
  peerDependencyOptions: {
    pinnedDevDependency: false,
  },
}

const project = new Project({
  name: 'langri-sha.com',
  package: {
    ...pkg,
    copyrightYear: '2016',
    homepage: 'https://langri-sha.com',
    minNodeVersion: '24.16.0',
    repository: 'langri-sha/langri-sha.com',
    type: 'module',

    deps: ['react-dom@19.3.0', 'react@19.3.0'],
    devDeps: [
      '@langri-sha/eslint-config@^0.9.0',
      '@langri-sha/lint-staged@^0.9.1',
      '@langri-sha/prettier@^0.4.1',
      '@types/node@26.1.1',
      'vitest@5.0.3',
    ],
  },
  cargo: {
    toolchain: {
      components: ['clippy', 'rustfmt'],
      profile: 'minimal',
    },
  },
  codeowners: {
    '*': '@langri-sha',
  },
  dagger: {},
  editorConfig: {},
  eslint: {
    ignorePatterns: ['**/next-env.d.ts', '**/renovate.d.ts', '**/swcrc.d.ts'],
    config: [
      {
        rules: {
          'react/no-unknown-property': ['error', { ignore: ['css'] }],
        },
      },
    ],
  },
  husky: {
    'pre-commit': 'lint-staged',
  },
  lintStaged: {},
  lintSynthesized: {},
  prettier: {
    ignorePatterns: ['*.frag', 'next-env.d.ts', 'renovate.d.ts', 'swcrc.d.ts'],
  },
  pnpmWorkspace: {
    packages: ['apps/*', 'packages/*'],
    minimumReleaseAgeExclude: ['@langri-sha/*'],
    allowBuilds: {
      'core-js': false,
      sharp: true,
    },
  },
  readme: {
    filename: 'readme.md',
  },
  renovate: {
    packageRules: [
      {
        description: 'Google Terraform Providers',
        groupName: 'Google Providers',
        groupSlug: 'terraform-google',
        matchDatasources: ['terraform-provider'],
        matchPackageNames: ['hashicorp/google*'],
      },
      {
        description: 'Update our own packages together',
        groupName: 'langri-sha projen toolchain',
        groupSlug: 'langri-sha-projen',
        matchPackageNames: ['@langri-sha/**'],
      },
      {
        description: 'Install our own packages without waiting them out',
        matchPackageNames: ['@langri-sha/**'],
        minimumReleaseAge: null,
      },
      {
        description:
          'Install our own GitHub Actions and Terraform modules without waiting them out',
        matchPackageNames: ['langri-sha/**'],
        minimumReleaseAge: null,
      },
    ],
    customManagers: [
      {
        // Keep the React version pinned in the shared ESLint flat config
        // (`settings.react.version` in packages/eslint-config/src/index.js) in
        // lockstep with the `react` dependency. We pin instead of using
        // `version: 'detect'` because eslint-plugin-react's version-detection
        // path calls the context.getFilename() removed in ESLint 10 and only
        // survives via the @eslint/compat shim; pinning sidesteps that fragile
        // path, and this manager bumps the pin whenever `react` is updated.
        customType: 'regex',
        datasourceTemplate: 'npm',
        depNameTemplate: 'react',
        managerFilePatterns: ['/^packages/eslint-config/src/index\\.js$/'],
        matchStrings: ["react:\\s*\\{\\s*version:\\s*'(?<currentValue>[^']+)'"],
      },
    ],
  },
  swcrc: {},
  typeScriptConfig: {
    config: {
      references: [{ path: './apps/voice-editor' }, { path: './apps/web' }],
    },
  },
  withTerraform: true,
  worktrunk: {
    config: {
      'pre-start': [
        {
          sync: '{% if base == default_branch %}git fetch {{ remote }} {{ default_branch }} && git merge --ff-only --quiet {{ remote }}/{{ default_branch }}{% endif %}',
        },
        {
          env: 'git ls-files -- ":(glob)**/.env.example" | while read -r example; do target=${example%.example}; [ -e "$target" ] || cp "$example" "$target"; done',
          install: 'pnpm install --frozen-lockfile',
        },
      ],
    },
  },
})

project.package?.addField('private', true)
project.package?.addField('packageManager', 'pnpm@12.9.1')
project.package?.addEngine('pnpm', '>= 11.0.0')

project.package?.setScript('build', 'pnpm run --filter @langri-sha/web build')
project.package?.setScript('start', 'pnpm run --filter @langri-sha/web start')
project.package?.setScript('test', 'pnpm exec vitest --passWithNoTests')

project.gitignore.addPatterns('next-env.d.ts')

project.gitattributes.addAttributes(
  'readme',
  'text=auto',
  'linguist-language=Markdown',
)

const subproject = (project: Project) => {
  new SampleFile(project, project.package?.entrypoint ?? 'src/index.ts', {
    contents: 'export {}',
  })

  project.package?.addField('repository', {
    type: 'git',
    url: 'git+https://github.com/langri-sha/langri-sha.com.git',
    directory: path.relative(
      path.dirname(fileURLToPath(import.meta.url)),
      project.outdir,
    ),
  })
}

project.addSubproject(
  {
    name: '@langri-sha/fonts',
    outdir: path.join('packages', 'fonts'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {
      config: {
        compilerOptions: { outDir: '.tsbuild' },
        include: ['src'],
      },
    },
    package: {
      ...pkg,
      copyrightYear: '2026',
      type: 'module',
      devDeps: [
        '@fontsource/cinzel-decorative@5.3.0',
        '@types/node@26.1.1',
        'subset-font@2.9.0',
      ],
    },
  },
  subproject,
  (project) => {
    project.package?.addField('private', true)
    project.package?.addField('version', '0.1.0')
    project.package?.addField('main', 'dist/index.js')
    project.package?.addField('types', 'dist/index.d.ts')
    project.package?.setScript('generate-font', 'node scripts/generate.mjs')
    project.package?.setScript('build', 'node scripts/build.mjs')
    project.package?.setScript('prepare', 'pnpm run build')
    project.gitignore.addPatterns('/dist/', '/.tsbuild/')
  },
)

project.addSubproject(
  {
    name: '@langri-sha/next',
    outdir: path.join('packages', 'next'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {
      config: {
        extends: [
          '@langri-sha/tsconfig/project.json',
          '@langri-sha/tsconfig/react.json',
        ],
        compilerOptions: {
          outDir: '.tsbuild',
        },
        include: ['src'],
      },
    },
    package: {
      ...pkg,
      copyrightYear: '2026',
      type: 'module',
      peerDeps: [
        '@emotion/cache@^11.14.0',
        '@emotion/react@^11.14.0',
        'next@^16.0.0',
        'react@^19.0.0',
      ],
      devDeps: ['@types/react@19.3.0', 'next@16.3.8'],
    },
  },
  subproject,
  (project) => {
    project.package?.addField('private', true)
    project.package?.addField('version', '0.1.0')
    project.package?.addField('sideEffects', false)
    project.package?.addField('main', 'src/index.ts')
    project.package?.addField('types', 'src/index.ts')
    project.package?.addField('exports', {
      '.': './src/index.ts',
      './emotion-registry': './src/emotion-registry.tsx',
    })
    project.package?.addField('peerDependenciesMeta', {
      next: { optional: true },
    })
    project.gitignore.addPatterns('/.tsbuild/')
  },
)

project.addSubproject(
  {
    name: '@langri-sha/glsl-loader',
    outdir: path.join('packages', 'glsl-loader'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {
      config: {
        compilerOptions: {
          erasableSyntaxOnly: true,
          outDir: '.tsbuild',
        },
        include: ['src'],
      },
    },
    package: {
      ...pkg,
      copyrightYear: '2026',
      type: 'module',
    },
  },
  subproject,
  (project) => {
    project.package?.addField('private', true)
    project.package?.addField('version', '0.1.0')
    project.package?.addField('main', 'src/index.ts')
    project.package?.addField('types', 'src/index.ts')
    project.gitignore.addPatterns('/.tsbuild/')
  },
)

project.addSubproject(
  {
    name: '@langri-sha/voice',
    outdir: path.join('packages', 'voice'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {
      config: {
        compilerOptions: {
          lib: ['DOM', 'ESNext'],
          outDir: '.tsbuild',
        },
        include: ['src'],
      },
    },
    package: {
      ...pkg,
      copyrightYear: '2026',
      type: 'module',
    },
  },
  subproject,
  (project) => {
    project.package?.addField('private', true)
    project.package?.addField('version', '0.1.0')
    project.package?.addField('main', 'src/index.ts')
    project.package?.addField('types', 'src/index.ts')
    project.gitignore.addPatterns('/.tsbuild/')
  },
)

project.addSubproject({
  name: 'telemetry',
  outdir: path.join('packages', 'telemetry'),
  cargo: {
    package: {
      description:
        'What the Rust jobs share: a retrying HTTP layer, the GitHub App, the npm registry, and PostHog capture',
      publish: false,
    },
    dependencies: {
      anyhow: '1.0.104',
      base64: '0.23.1',
      jiff: '0.2.37',
      ring: '0.17.14',
      'rustls-pki-types': '1.15.1',
      serde: { version: '1.0.229', features: ['derive'] },
      serde_json: '1.0.151',
      ureq: { version: '3.4.2', features: ['json'] },
    },
    sampleCode: false,
  },
})

project.addSubproject({
  name: 'npm-downloads',
  outdir: path.join('apps', 'npm-downloads'),
  cargo: {
    package: {
      description: 'Publishes daily npm package downloads to PostHog',
      publish: false,
    },
    dependencies: {
      anyhow: '1.0.104',
      clap: { version: '4.6.7', features: ['derive', 'env'] },
      jiff: { version: '0.2.37', features: ['serde'] },
      serde: { version: '1.0.229', features: ['derive'] },
      serde_json: '1.0.151',
      telemetry: { path: '../../packages/telemetry' },
      ureq: { version: '3.4.2', features: ['json'] },
      uuid: { version: '1.26.1', features: ['serde', 'v5'] },
    },
  },
})

project.addSubproject({
  name: 'npm-releases',
  outdir: path.join('apps', 'npm-releases'),
  cargo: {
    package: {
      description:
        'Publishes npm package releases, pending and published, to PostHog',
      publish: false,
    },
    dependencies: {
      anyhow: '1.0.104',
      clap: { version: '4.6.7', features: ['derive', 'env'] },
      jiff: { version: '0.2.37', features: ['serde'] },
      semver: { version: '1.0.28', features: ['serde'] },
      serde: { version: '1.0.229', features: ['derive'] },
      serde_json: '1.0.151',
      telemetry: { path: '../../packages/telemetry' },
      ureq: { version: '3.4.2', features: ['json'] },
      uuid: { version: '1.26.1', features: ['serde', 'v5'] },
    },
  },
})

project.addSubproject({
  name: 'github-repositories',
  outdir: path.join('apps', 'github-repositories'),
  cargo: {
    package: {
      description: 'Publishes daily GitHub repository traffic to PostHog',
      publish: false,
    },
    dependencies: {
      anyhow: '1.0.104',
      clap: { version: '4.6.7', features: ['derive', 'env'] },
      jiff: { version: '0.2.37', features: ['serde'] },
      serde: { version: '1.0.229', features: ['derive'] },
      serde_json: '1.0.151',
      telemetry: { path: '../../packages/telemetry' },
      ureq: { version: '3.4.2', features: ['json'] },
      uuid: { version: '1.26.1', features: ['serde', 'v5'] },
    },
  },
})

project.synth()
