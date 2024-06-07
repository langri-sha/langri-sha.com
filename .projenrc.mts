import { Project, TypeScriptConfig } from '@langri-sha/projen-project'
import { SampleFile } from 'projen'
import * as path from 'path'

const pkg = {
  authorEmail: 'filip.dupanovic@gmail.com',
  authorName: 'Filip Dupanović',
  authorOrganization: false,
  authorUrl: 'https://langri-sha.com',
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
    repository: 'langri-sha/langri-sha.com',
    bugsUrl: 'https://github.com/langri-sha/langri-sha.com/issues',
    homepage: 'https://langri-sha.com',
    minNodeVersion: '20.12.0',
    deps: [
      '@babel/core@7.24.7',
      '@babel/register@7.24.6',
      '@types/babel__core@7.20.5',
      'react-dom@18.3.1',
      'react@18.3.1',
      'webpack-cli@5.1.4',
      'webpack@5.91.0',
    ],
    devDeps: [
      '@langri-sha/babel-preset@workspace:*',
      '@langri-sha/eslint-config@workspace:*',
      '@langri-sha/jest-config@workspace:*',
      '@langri-sha/lint-staged@workspace:*',
      '@langri-sha/prettier@workspace:*',
      '@langri-sha/projen-project@workspace:*',
      '@types/lint-staged@13.3.0',
      'eslint@9.4.0',
      'jest@29.7.0',
      'lint-staged@15.2.5',
      'prettier@3.3.1',
      'projen@0.82.4',
    ],
  },
  babel: {},
  beachball: {},
  codeowners: {
    '*': '@langri-sha',
  },
  editorConfig: {},
  eslint: {},
  husky: {
    'pre-commit': 'pnpm -q lint-staged',
  },
  jestConfig: {
    extends: '@langri-sha/jest-config',
    config: {
      transformIgnorePatterns: [
        `node_modules/(?!(?:.pnpm/)?(${[
          'execa',
          'find-up',
          'get-stream',
          'human-signals',
          'is-stream',
          'locate-path',
          'mimic-fn',
          'npm-run-path',
          'onetime',
          'p-limit',
          'p-locate',
          'path-exists',
          'path-key',
          'strip-final-newline',
          'unicorn-magic',
          'yocto-queue',
        ].join('|')}))`,
      ],
    },
  },
  lintStaged: {},
  lintSynthesized: {},
  prettier: {
    ignorePatterns: ['*.frag'],
  },
  pnpmWorkspace: {
    packages: ['apps/*', 'packages/*'],
  },
  renovate: {},
  typeScriptConfig: {
    config: {
      files: ['babel.config.js'],
      references: [{ path: './apps/web' }],
    },
  },
  withTerraform: true,
})

project.package?.addField('private', true)
project.package?.addField('packageManager', 'pnpm@9.2.0')
project.package?.addEngine('pnpm', '>=9.0.0')

project.package?.setScript('build', 'pnpm run --filter @langri-sha/web build')
project.package?.setScript('start', 'pnpm run --filter @langri-sha/web start')
project.package?.setScript('test', 'pnpm run --filter @langri-sha/web test')

const subproject = (project: Project) => {
  new SampleFile(project, project.package?.entrypoint ?? 'src/index.ts', {
    contents: 'export {}',
  })

  new SampleFile(project, 'readme', {
    contents: `# ${project.name}\n`,
  })

  project.tryRemoveFile('.gitignore')
}

const test = (project: Project) => {
  project.npmIgnore?.exclude('*.test.*', '__snapshots__/')
  project.package?.addDevDeps('@langri-sha/jest-test@workspace:*')
}

const publish = (project: Project) => {
  project.package?.addField('publishConfig', {
    access: 'public',
    main: 'lib/index.js',
    types: 'lib/index.d.ts',
  })

  new TypeScriptConfig(project, {
    fileName: 'tsconfig.build.json',
    config: {
      extends: '@langri-sha/tsconfig/build.json',
      compilerOptions: {
        baseUrl: '.',
        outDir: 'lib',
      },
    },
  })

  project.package?.setScript(
    'prepublishOnly',
    'rm -rf lib; tsc --project tsconfig.build.json',
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
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2021',
      entrypoint: 'src/index.js',
      deps: [
        '@babel/plugin-proposal-export-default-from@7.24.7',
        '@babel/preset-env@7.24.7',
        '@babel/preset-react@7.24.7',
        '@babel/preset-typescript@7.24.7',
        '@babel/register@7.24.6',
        '@emotion/babel-plugin@11.11.0',
      ],
      devDeps: ['@langri-sha/babel-test@workspace:*', '@types/node@20.14.2'],
      peerDeps: ['@babel/core@^7.8.0'],
    },
  },
  subproject,
  test,
  publishRaw,
)

project.addSubproject(
  {
    name: '@langri-sha/babel-test',
    outdir: path.join('packages', 'babel-test'),
    typeScriptConfig: {},
    npmIgnore: {
      ignorePatterns: ['fixtures/'],
    },
    package: {
      ...pkg,
      copyrightYear: '2024',
      deps: ['ramda@0.30.1'],
      devDeps: [
        '@langri-sha/monorepo@workspace:*',
        '@types/babel__core@^7.8.0',
        '@types/node@20.14.2',
        '@types/ramda@0.30.0',
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
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2021',
      type: 'module',
      entrypoint: 'src/index.js',
      deps: [
        '@eslint/js@9.4.0',
        'eslint-plugin-jsdoc@48.2.9',
        'eslint-plugin-prettier@5.1.3',
        'eslint-plugin-unicorn@53.0.0',
        'globals@15.4.0',
        'typescript-eslint@7.12.0',
      ],
      devDeps: ['@types/eslint__js@8.42.3'],
      peerDeps: ['eslint@^9.0.0'],
    },
  },
  subproject,
  publishRaw,
)

project.addSubproject(
  {
    name: '@langri-sha/jest-config',
    outdir: path.join('packages', 'jest-config'),
    typeScriptConfig: {},
    npmIgnore: {},
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
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['@jest/globals@29.7.0', 'tempy@1.0.1'],
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
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2021',
      type: 'module',
      entrypoint: 'src/index.js',
      devDeps: ['@types/lint-staged@13.3.0'],
      peerDeps: ['eslint@^9.0.0', 'lint-staged@^15.0.0', 'prettier@^3.0.0'],
    },
  },
  subproject,
  publishRaw,
)

project.addSubproject(
  {
    name: '@langri-sha/monorepo',
    outdir: path.join('packages', 'monorepo'),
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['find-up@7.0.0'],
      devDeps: ['@types/node@20.14.2'],
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
  publishRaw,
)

project.addSubproject(
  {
    name: '@langri-sha/projen-codeowners',
    outdir: path.join('packages', 'projen-codeowners'),
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      peerDeps: ['projen@^0.82.0'],
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
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['serialize-javascript@6.0.2'],
      devDeps: ['@types/serialize-javascript@5.0.4'],
      peerDeps: [
        '@babel/core@^7.8.0',
        '@types/babel__core@^7.8.0',
        'projen@^0.82.0',
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
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      peerDeps: ['beachball@^2.0.0', 'projen@^0.82.0'],
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
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      peerDeps: ['projen@^0.82.0'],
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
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['serialize-javascript@6.0.2'],
      devDeps: ['@types/serialize-javascript@5.0.4'],
      peerDeps: ['eslint@^9.0.0', 'projen@^0.82.0'],
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
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      type: 'module',
      copyrightYear: '2024',
      devDeps: ['@types/node@20.14.2'],
      peerDeps: ['husky@^9.0.1', 'projen@^0.82.0'],
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
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['serialize-javascript@6.0.2'],
      devDeps: ['@types/serialize-javascript@5.0.4'],
      peerDeps: ['jest@^28.00 || ^29.00', 'projen@^0.82.0'],
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
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['debug@4.3.5', 'execa@8.0.1', 'minimatch@9.0.4'],
      devDeps: ['@types/debug@4.1.12', 'prettier@3.3.1', 'projen@0.82.4'],
      peerDeps: ['projen@^0.82.0'],
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
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['serialize-javascript@6.0.2'],
      devDeps: ['@types/serialize-javascript@5.0.4'],
      peerDeps: ['lint-staged@^15.0.0', 'projen@^0.82.0'],
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
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['license-o-matic@^1.2.0'],
      peerDeps: ['projen@^0.82.0'],
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
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['serialize-javascript@6.0.2'],
      devDeps: ['@types/serialize-javascript@5.0.4'],
      peerDeps: ['prettier@^3.0.0', 'projen@^0.82.0'],
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
    typeScriptConfig: {},
    npmIgnore: {},
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
        '@langri-sha/projen-renovate@workspace:*',
        '@langri-sha/projen-typescript-config@workspace:*',
        'ramda@0.30.1',
      ],
      devDeps: ['@types/ramda@0.30.0'],
      peerDeps: ['projen@^0.82.0'],
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
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['renovate@^37.342.1'],
      peerDeps: ['projen@^0.82.0'],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/projen-typescript-config',
    outdir: path.join('packages', 'projen-typescript-config'),
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['@schemastore/tsconfig@0.0.11'],
      devDeps: ['@types/node@20.14.2'],
      peerDeps: ['projen@^0.82.0'],
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
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['yaml@2.4.3'],
      peerDeps: ['projen@^0.82.0'],
    },
  },
  subproject,
  test,
  publish,
)

project.addSubproject(
  {
    name: '@langri-sha/tsconfig',
    outdir: path.join('packages', 'tsconfig'),
    npmIgnore: {},
    typeScriptConfig: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      entrypoint: 'base.json',
      peerDeps: ['typescript@^5.0.0'],
    },
  },
  subproject,
  publishRaw,
)

project.addSubproject(
  {
    name: '@langri-sha/webpack',
    outdir: path.join('packages', 'webpack'),
    typeScriptConfig: {},
    npmIgnore: {},
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
      ],
      devDeps: ['@langri-sha/babel-preset@workspace:*', '@types/node@20.14.2'],
      peerDeps: ['@babel/register@^7.0.0', 'webpack@^5.0.0'],
    },
  },
  subproject,
  publish,
)

project.synth()
