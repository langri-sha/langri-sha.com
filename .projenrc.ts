import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import { Project, TypeScriptConfig } from '@langri-sha/projen-project'
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
      'webpack-cli@7.2.2',
      'webpack@5.109.2',
    ],
    devDeps: [
      '@langri-sha/babel-preset@workspace:*',
      '@langri-sha/eslint-config@^0.9.0',
      '@langri-sha/jest-config@workspace:*',
      '@langri-sha/lint-staged@^0.9.1',
      '@langri-sha/prettier@^0.4.1',
      '@langri-sha/projen-project@0.24.0',
      '@langri-sha/schemastore-to-typescript@^0.2.1',
      '@swc-node/register@1.12.1',
      '@swc/core@1.15.46',
      '@types/node@26.1.1',
      'eslint@10.8.0',
      'jest@30.4.2',
      'lint-staged@17.2.0',
      'prettier@3.9.6',
      'projen@0.86.5',
      'tsx@4.23.1',
      'vitest@4.1.10',
    ],
  },
  babel: {},
  beachball: {},
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
      '@swc/core': true,
      esbuild: true,
      sharp: true,
      'unrs-resolver': true,
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
      references: [{ path: './apps/web' }],
    },
  },
  withTerraform: true,
})

project.package?.addField('private', true)
project.package?.addField('packageManager', 'pnpm@11.18.0')
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

  project
    .tryFindObjectFile('package.json')
    ?.addOverride('devDependencies.@langri-sha/tsconfig', '^0.11.0')
}

const test = (project: Project) => {
  project.npmIgnore?.exclude('*.test.*', '__snapshots__/')
  project.package?.addDevDeps('@langri-sha/vitest@^0.1.2')
}

const publish = (project: Project) => {
  project.package?.addField('publishConfig', {
    access: 'public',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
  })

  new TypeScriptConfig(project, {
    fileName: 'tsconfig.build.json',
    config: {
      extends: '@langri-sha/tsconfig/build',
      exclude: ['**/*.test.*'],
    },
  })

  project.package?.setScript(
    'prepublishOnly',
    'rm -rf dist; tsc --project tsconfig.build.json',
  )
}

project.addSubproject(
  {
    name: '@langri-sha/babel-preset',
    outdir: path.join('packages', 'babel-preset'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2021',
      entrypoint: 'src/index.js',
      deps: [
        '@babel/plugin-proposal-export-default-from@8.0.1',
        '@babel/preset-env@8.0.2',
        '@babel/preset-react@8.0.1',
        '@babel/preset-typescript@8.0.1',
        '@babel/register@8.0.1',
        '@emotion/babel-plugin@11.13.5',
      ],
      devDeps: ['@langri-sha/babel-test@workspace:*', '@types/node@26.1.1'],
      peerDeps: ['@babel/core@^8.0.0'],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/babel-test',
    outdir: path.join('packages', 'babel-test'),
    npmIgnore: {
      ignorePatterns: ['fixtures/'],
    },
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['ramda@0.32.0'],
      devDeps: [
        '@langri-sha/monorepo@^0.5.7',
        '@types/node@26.1.1',
        '@types/ramda@0.32.0',
      ],
      peerDeps: ['@babel/core@^8.0.0'],
    },
  },
  subproject,
  test,
  publish,
)

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
    name: '@langri-sha/jest-config',
    outdir: path.join('packages', 'jest-config'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      peerDeps: ['jest@^30.0.0'],
    },
  },
  subproject,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/jest-test',
    outdir: path.join('packages', 'jest-test'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['@jest/globals@30.4.1', 'nock@14.0.16', 'tempy@3.2.0'],
      peerDeps: ['jest@^30.0.0'],
    },
  },
  subproject,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/webpack',
    outdir: path.join('packages', 'webpack'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      deps: [
        'babel-loader@10.1.1',
        'clean-webpack-plugin@4.0.0',
        'copy-webpack-plugin@14.0.0',
        'html-webpack-plugin@5.6.8',
        'terser-webpack-plugin@5.6.1',
        'webpack-bundle-analyzer@5.3.1',
        'webpack-dev-server@6.0.0',
        'webpack-subresource-integrity@5.2.0-rc.1',
      ],
      devDeps: ['@langri-sha/babel-preset@workspace:*', '@types/node@26.1.1'],
      peerDeps: ['@babel/register@^8.0.0', 'webpack@^5.0.0'],
    },
  },
  subproject,
  publish,
)

project.synth()
