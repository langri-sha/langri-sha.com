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

    deps: [
      '@babel/core@8.0.1',
      '@babel/register@8.0.1',
      'react-dom@19.2.8',
      'react@19.2.8',
    ],
    devDeps: [
      '@langri-sha/babel-preset@^0.6.3',
      '@langri-sha/eslint-config@^0.9.0',
      '@langri-sha/jest-config@^0.8.6',
      '@langri-sha/lint-staged@^0.9.1',
      '@langri-sha/prettier@^0.4.1',
      '@langri-sha/projen-project@*',
      '@langri-sha/schemastore-to-typescript@^0.2.1',
      '@types/node@26.1.1',
      'eslint@10.9.0',
      'jest@30.4.2',
      'lint-staged@17.3.0',
      'prettier@3.9.6',
      'tsx@4.23.12',
      'vitest@4.1.11',
    ],
  },
  babel: {},
  codeowners: {
    '*': '@langri-sha',
  },
  editorConfig: {},
  eslint: {
    ignorePatterns: ['**/next-env.d.ts', '**/renovate.d.ts', '**/swcrc.d.ts'],
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
        description: 'Packages published from the langri-sha/projen monorepo',
        groupName: 'langri-sha projen toolchain',
        groupSlug: 'langri-sha-projen',
        matchSourceUrls: ['https://github.com/langri-sha/projen'],
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
      references: [{ path: './apps/web' }, { path: './packages/chant' }],
    },
  },
  withTerraform: true,
})

project.package?.addField('private', true)
project.package?.addField('packageManager', 'pnpm@11.23.0')
project.package?.addEngine('pnpm', '>= 11.0.0')

project.package?.setScript('build', 'pnpm run --filter @langri-sha/web build')
project.package?.setScript('start', 'pnpm run --filter @langri-sha/web start')
project.package?.setScript('test', 'pnpm exec vitest --passWithNoTests')

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
        'subset-font@2.5.0',
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
    name: '@langri-sha/chant',
    outdir: path.join('packages', 'chant'),
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
      devDeps: ['@types/node@26.1.1'],
    },
  },
  subproject,
  (project) => {
    project.package?.addField('private', true)
    project.package?.addField('version', '0.1.0')
    project.package?.addField('main', 'dist/index.js')
    project.package?.addField('types', 'dist/index.d.ts')
    project.package?.setScript('build', 'tsc -p tsconfig.build.json')
    project.package?.setScript('prepare', 'pnpm run build')
    project.gitignore.addPatterns('/dist/', '/.tsbuild/')
  },
)

project.synth()
