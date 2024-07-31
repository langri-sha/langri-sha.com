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
    minNodeVersion: '20.12.0',
    repository: 'langri-sha/langri-sha.com',
    type: 'module',

    deps: [
      '@babel/core@7.25.2',
      '@babel/register@7.24.6',
      '@types/babel__core@7.20.5',
      'react-dom@18.3.1',
      'react@18.3.1',
      'webpack-cli@5.1.4',
      'webpack@5.93.0',
    ],
    devDeps: [
      '@langri-sha/babel-preset@workspace:*',
      '@langri-sha/eslint-config@workspace:*',
      '@langri-sha/jest-config@workspace:*',
      '@langri-sha/lint-staged@workspace:*',
      '@langri-sha/prettier@workspace:*',
      '@langri-sha/projen-project@workspace:*',
      '@langri-sha/schemastore-to-typescript@workspace:*',
      '@swc-node/register@1.10.9',
      '@swc/core@1.7.4',
      '@types/lint-staged@13.3.0',
      '@types/node@20.14.13',
      'eslint@9.8.0',
      'jest@29.7.0',
      'lint-staged@15.2.7',
      'prettier@3.3.3',
      'projen@0.84.8',
      'ts-node@10.9.2',
      'vitest@2.0.4',
    ],
  },
  babel: {},
  beachball: {},
  codeowners: {
    '*': '@langri-sha',
  },
  editorConfig: {},
  eslint: {
    ignorePatterns: ['**/renovate.d.ts', '**/swcrc.d.ts'],
  },
  husky: {
    'pre-commit': 'lint-staged',
  },
  lintStaged: {},
  lintSynthesized: {},
  prettier: {
    ignorePatterns: ['*.frag', 'renovate.d.ts', 'swcrc.d.ts'],
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
        matchPackagePrefixes: 'hashicorp/google',
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
project.package?.addField('packageManager', 'pnpm@9.6.0')
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

  if (project.name !== '@langri-sha/tsconfig') {
    project
      .tryFindObjectFile('package.json')
      ?.addOverride('devDependencies.@langri-sha/tsconfig', 'workspace:*')
  }
}

const test = (project: Project) => {
  project.npmIgnore?.exclude('*.test.*', '__snapshots__/')
  project.package?.addDevDeps('@langri-sha/vitest@workspace:*')
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

const publishRaw = (project: Project) => {
  project.package?.addField('publishConfig', {
    access: 'public',
  })
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
        '@babel/plugin-proposal-export-default-from@7.24.7',
        '@babel/preset-env@7.25.2',
        '@babel/preset-react@7.24.7',
        '@babel/preset-typescript@7.24.7',
        '@babel/register@7.24.6',
        '@emotion/babel-plugin@11.12.0',
      ],
      devDeps: ['@langri-sha/babel-test@workspace:*', '@types/node@20.14.13'],
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
      deps: ['ramda@0.30.1'],
      devDeps: [
        '@langri-sha/monorepo@workspace:*',
        '@types/babel__core@^7.8.0',
        '@types/node@20.14.13',
        '@types/ramda@0.30.1',
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
    name: '@langri-sha/eslint-config',
    outdir: path.join('packages', 'eslint-config'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2021',
      type: 'module',
      entrypoint: 'src/index.js',
      deps: [
        '@eslint/compat@1.1.1',
        '@eslint/js@9.8.0',
        'eslint-config-prettier@9.1.0',
        'eslint-plugin-import@2.29.1',
        'eslint-plugin-jsdoc@48.10.2',
        'eslint-plugin-prettier@5.2.1',
        'eslint-plugin-react@7.35.0',
        'eslint-plugin-unicorn@55.0.0',
        'globals@15.8.0',
        'typescript-eslint@7.18.0',
      ],
      devDeps: ['@types/eslint__js@8.42.3'],
      peerDeps: ['eslint@^9.0.0'],
    },
  },
  subproject,
  publish,
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
      deps: ['@jest/globals@29.7.0', 'nock@13.5.4', 'tempy@1.0.1'],
      peerDeps: ['jest@^29.0.0'],
    },
  },
  subproject,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/lint-staged',
    outdir: path.join('packages', 'lint-staged'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2021',
      type: 'module',
      entrypoint: 'src/index.js',
      devDeps: ['@types/lint-staged@13.3.0'],
      peerDeps: ['eslint@^9.0.0', 'lint-staged@^15.0.0', 'prettier@^3.0.0'],
      peerDependenciesMeta: {
        eslint: {
          optional: true,
        },
        prettier: {
          optional: true,
        },
      },
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
      devDeps: ['@types/node@20.14.13'],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/prettier',
    outdir: path.join('packages', 'prettier'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      entrypoint: 'src/index.js',
      deps: ['prettier-plugin-ini@1.2.0'],
      peerDeps: ['prettier@^3.0.0'],
    },
  },
  subproject,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/projen-codeowners',
    outdir: path.join('packages', 'projen-codeowners'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      peerDeps: ['projen@^0.84.0'],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/projen-babel',
    outdir: path.join('packages', 'projen-babel'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['serialize-javascript@6.0.2'],
      devDeps: ['@types/serialize-javascript@5.0.4'],
      peerDeps: [
        '@babel/core@^7.8.0',
        '@types/babel__core@^7.8.0',
        'projen@^0.84.0',
      ],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/projen-beachball',
    outdir: path.join('packages', 'projen-beachball'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      peerDeps: ['beachball@^2.0.0', 'projen@^0.84.0'],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/projen-editorconfig',
    outdir: path.join('packages', 'projen-editorconfig'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      peerDeps: ['projen@^0.84.0'],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/projen-eslint',
    outdir: path.join('packages', 'projen-eslint'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['serialize-javascript@6.0.2'],
      devDeps: ['@types/serialize-javascript@5.0.4'],
      peerDeps: ['eslint@^9.0.0', 'projen@^0.84.0'],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/projen-husky',
    outdir: path.join('packages', 'projen-husky'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      type: 'module',
      copyrightYear: '2024',
      devDeps: ['@types/node@20.14.13'],
      peerDeps: ['husky@^9.0.1', 'projen@^0.84.0'],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/projen-jest-config',
    outdir: path.join('packages', 'projen-jest-config'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['serialize-javascript@6.0.2'],
      devDeps: ['@types/serialize-javascript@5.0.4'],
      peerDeps: ['jest@^28.00 || ^29.00', 'projen@^0.84.0'],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/projen-lint-synthesized',
    outdir: path.join('packages', 'projen-lint-synthesized'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['debug@4.3.6', 'execa@8.0.1', 'minimatch@10.0.1'],
      devDeps: ['@types/debug@4.1.12', 'prettier@3.3.3', 'projen@0.84.8'],
      peerDeps: ['projen@^0.84.0'],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/projen-lint-staged',
    outdir: path.join('packages', 'projen-lint-staged'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['serialize-javascript@6.0.2'],
      devDeps: ['@types/serialize-javascript@5.0.4'],
      peerDeps: ['lint-staged@^15.0.0', 'projen@^0.84.0'],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/projen-license',
    outdir: path.join('packages', 'projen-license'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['license-o-matic@^1.2.0'],
      peerDeps: ['projen@^0.84.0'],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/projen-pnpm-workspace',
    outdir: path.join('packages', 'projen-pnpm-workspace'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['yaml@2.5.0'],
      peerDeps: ['projen@^0.84.0'],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/projen-prettier',
    outdir: path.join('packages', 'projen-prettier'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['serialize-javascript@6.0.2'],
      devDeps: ['@types/serialize-javascript@5.0.4'],
      peerDeps: ['prettier@^3.0.0', 'projen@^0.84.0'],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/projen-project',
    outdir: path.join('packages', 'projen-project'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: [
        '@langri-sha/projen-babel@workspace:*',
        '@langri-sha/projen-beachball@workspace:*',
        '@langri-sha/projen-codeowners@workspace:*',
        '@langri-sha/projen-editorconfig@workspace:*',
        '@langri-sha/projen-eslint@workspace:*',
        '@langri-sha/projen-husky@workspace:*',
        '@langri-sha/projen-jest-config@workspace:*',
        '@langri-sha/projen-license@workspace:*',
        '@langri-sha/projen-lint-staged@workspace:*',
        '@langri-sha/projen-lint-synthesized@workspace:*',
        '@langri-sha/projen-pnpm-workspace@workspace:*',
        '@langri-sha/projen-prettier@workspace:*',
        '@langri-sha/projen-readme@workspace:*',
        '@langri-sha/projen-renovate@workspace:*',
        '@langri-sha/projen-swcrc@workspace:*',
        '@langri-sha/projen-typescript-config@workspace:*',
        'ramda@0.30.1',
      ],
      devDeps: ['@types/ramda@0.30.1'],
      peerDeps: [
        '@babel/core@^7.8.0',
        '@swc-node/register@^1.0.0',
        '@swc/core@^1.6.0',
        '@types/babel__core@^7.8.0',
        'beachball@^2.0.0',
        'eslint@^9.0.0',
        'husky@^9.0.1',
        'jest@^28.0.0 || ^29.0.0',
        'lint-staged@^15.0.0',
        'prettier@^3.0.0',
        'projen@^0.84.0',
        'ts-node@^10.0.0',
        'typescript@^5.5.0',
      ],
      peerDependenciesMeta: {
        '@babel/core': {
          optional: true,
        },
        '@swc-node/register': {
          optional: true,
        },
        '@swc/core': {
          optional: true,
        },
        '@types/babel__core': {
          optional: true,
        },
        beachball: {
          optional: true,
        },
        eslint: {
          optional: true,
        },
        husky: {
          optional: true,
        },
        jest: {
          optional: true,
        },
        'lint-staged': {
          optional: true,
        },
        prettier: {
          optional: true,
        },
        'ts-node': {
          optional: true,
        },
      },
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/projen-readme',
    outdir: path.join('packages', 'projen-readme'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      peerDeps: ['projen@^0.84.0'],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/projen-renovate',
    outdir: path.join('packages', 'projen-renovate'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      devDeps: ['@langri-sha/schemastore-to-typescript@workspace:*'],
      peerDeps: ['projen@^0.84.0'],
    },
  },
  subproject,
  test,
  publish,
  (project) => {
    project.addGitIgnore('renovate.d.ts')

    project.package?.setScript(
      'prepare',
      'NODE_OPTIONS="--loader ts-node/esm/transpile-only" schemastore-to-typescript renovate src/renovate.d.ts',
    )
  },
)

project.addSubproject(
  {
    name: '@langri-sha/projen-swcrc',
    outdir: path.join('packages', 'projen-swcrc'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      devDeps: ['@langri-sha/schemastore-to-typescript@workspace:*'],
      peerDeps: ['projen@^0.84.0', '@swc/core@^1.6.0'],
    },
  },
  subproject,
  test,
  publish,
  (project) => {
    project.addGitIgnore('swcrc.d.ts')

    project.package?.setScript(
      'prepare',
      'NODE_OPTIONS="--loader ts-node/esm/transpile-only" schemastore-to-typescript swcrc src/swcrc.d.ts',
    )
  },
)

project.addSubproject(
  {
    name: '@langri-sha/projen-typescript-config',
    outdir: path.join('packages', 'projen-typescript-config'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['@schemastore/tsconfig@0.0.11'],
      devDeps: ['@types/node@20.14.13'],
      peerDeps: ['projen@^0.84.0'],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/schemastore-to-typescript',
    outdir: path.join('packages', 'schemastore-to-typescript'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      bin: {
        'schemastore-to-typescript': 'src/cli.ts',
      },
      deps: [
        'commander@12.1.0',
        'debug@4.3.6',
        'env-paths@3.0.0',
        'es-main@1.3.0',
        'got@14.4.2',
        'json-schema-to-typescript@15.0.0',
        'keyv-file@0.3.1',
        'keyv@4.5.4',
      ],
      devDeps: ['@types/debug@4.1.12'],
      peerDeps: ['projen@^0.84.0'],
    },
  },
  subproject,
  test,
  publish,
  (project) => {
    project
      .tryFindObjectFile('package.json')
      ?.addOverride(
        'publishConfig.bin.schemastore-to-typescript',
        'dist/cli.js',
      )
  },
)

project.addSubproject(
  {
    name: '@langri-sha/tsconfig',
    outdir: path.join('packages', 'tsconfig'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      entrypoint: 'base.json',
      peerDeps: ['typescript@^5.5.0'],
    },
  },
  subproject,
  publishRaw,
)

project.addSubproject(
  {
    name: '@langri-sha/vitest',
    outdir: path.join('packages', 'vitest'),
    npmIgnore: {},
    readme: {
      filename: 'readme.md',
    },
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['nock@13.5.4', 'tempy@1.0.1'],
      peerDeps: ['vitest@^2.0.0'],
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
        'babel-loader@9.1.3',
        'clean-webpack-plugin@4.0.0',
        'copy-webpack-plugin@12.0.2',
        'html-webpack-plugin@5.6.0',
        'terser-webpack-plugin@5.3.10',
        'webpack-bundle-analyzer@4.10.2',
        'webpack-dev-server@5.0.4',
        'webpack-subresource-integrity@5.2.0-rc.1',
      ],
      devDeps: ['@langri-sha/babel-preset@workspace:*', '@types/node@20.14.13'],
      peerDeps: ['@babel/register@^7.0.0', 'webpack@^5.0.0'],
    },
  },
  subproject,
  publish,
)

project.synth()
