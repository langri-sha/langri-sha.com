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
      '@babel/core@7.29.7',
      '@babel/register@7.29.7',
      '@types/babel__core@7.20.5',
      'react-dom@19.2.7',
      'react@19.2.7',
      'webpack-cli@5.1.4',
      'webpack@5.107.2',
    ],
    devDeps: [
      '@langri-sha/babel-preset@workspace:*',
      '@langri-sha/eslint-config@^0.9.0',
      '@langri-sha/jest-config@workspace:*',
      '@langri-sha/lint-staged@^0.9.1',
      '@langri-sha/prettier@^0.4.1',
      '@langri-sha/projen-project@0.17.2',
      '@langri-sha/schemastore-to-typescript@^0.2.1',
      '@swc-node/register@1.11.1',
      '@swc/core@1.15.40',
      '@types/lint-staged@13.3.0',
      '@types/node@24.13.2',
      'eslint@10.4.1',
      'jest@29.7.0',
      'lint-staged@15.5.2',
      'prettier@3.8.3',
      'projen@0.86.5',
      'tsx@4.22.4',
      'vitest@2.1.9',
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
      {
        // Keep the Terraform CI workflow pin in lockstep with `required_version`.
        // The `langri-sha/github` terraform action installs latest when version
        // auto-detection fails, so `terraform-version` must track the configured
        // Terraform release. Matching depName/datasource/versioning to the built-in
        // `required_version` manager lands this on the same Renovate branch as the
        // Dockerfile and `versions.tf` bumps.
        customType: 'regex',
        datasourceTemplate: 'github-releases',
        depNameTemplate: 'hashicorp/terraform',
        versioningTemplate: 'hashicorp',
        managerFilePatterns: ['/^\\.github/workflows/terraform\\.yml$/'],
        matchStrings: ['terraform-version:\\s*(?<currentValue>\\S+)'],
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
project.package?.addField('packageManager', 'pnpm@9.15.9')
project.package?.addEngine('pnpm', '>=9.0.0')

project.package?.setScript('build', 'pnpm run --filter @langri-sha/web build')
project.package?.setScript('start', 'pnpm run --filter @langri-sha/web start')
project.package?.setScript('test', 'pnpm run --filter @langri-sha/web test')

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
    ?.addOverride('devDependencies.@langri-sha/tsconfig', '^0.10.2')
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
        '@babel/plugin-proposal-export-default-from@7.29.7',
        '@babel/preset-env@7.29.7',
        '@babel/preset-react@7.29.7',
        '@babel/preset-typescript@7.29.7',
        '@babel/register@7.29.7',
        '@emotion/babel-plugin@11.13.5',
      ],
      devDeps: ['@langri-sha/babel-test@workspace:*', '@types/node@24.13.2'],
      peerDeps: ['@babel/core@^7.8.0'],
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
        '@langri-sha/monorepo@workspace:*',
        '@types/babel__core@^7.8.0',
        '@types/node@24.13.2',
        '@types/ramda@0.31.1',
      ],
      peerDeps: ['@babel/core@^7.8.0'],
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
        '@fontsource/cinzel-decorative@5.2.8',
        '@types/node@24.13.2',
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
      peerDeps: ['jest@^28.0.0 || ^29.0.0'],
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
      deps: ['@jest/globals@29.7.0', 'nock@13.5.5', 'tempy@1.0.1'],
      peerDeps: ['jest@^29.0.0'],
    },
  },
  subproject,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/monorepo',
    outdir: path.join('packages', 'monorepo'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['find-up@7.0.0'],
      devDeps: ['@types/node@24.13.2'],
    },
  },
  subproject,
  test,
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
        'babel-loader@9.2.1',
        'clean-webpack-plugin@4.0.0',
        'copy-webpack-plugin@12.0.2',
        'html-webpack-plugin@5.6.7',
        'terser-webpack-plugin@5.3.10',
        'webpack-bundle-analyzer@4.10.2',
        'webpack-dev-server@5.2.4',
        'webpack-subresource-integrity@5.2.0-rc.1',
      ],
      devDeps: ['@langri-sha/babel-preset@workspace:*', '@types/node@24.13.2'],
      peerDeps: ['@babel/register@^7.0.0', 'webpack@^5.0.0'],
    },
  },
  subproject,
  publish,
)

project.synth()
