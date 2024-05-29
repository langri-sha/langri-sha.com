import {
  Project,
  ProjectOptions,
  TypeScriptConfig,
} from '@langri-sha/projen-project'
import { SampleFile } from 'projen'
import * as path from 'path'

const pkg = {
  authorEmail: 'filip.dupanovic@gmail.com',
  authorName: 'Filip Dupanović',
  authorOrganization: false,
  authorUrl: 'https://langri-sha.com',
  license: 'MIT',
  licensed: true,
}

const project = new Project({
  name: 'langri-sha.com',
  package: {
    ...pkg,
    copyrightYear: '2016',
    repository: 'langri-sha/langri-sha.com',
    bugsUrl: 'https://github.com/langri-sha/langri-sha.com/issues',
    homepage: 'https://langri-sha.com',
  },
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
  renovate: {},
  typeScriptConfig: {
    config: {
      files: [
        'babel.config.js',
        'eslint.config.mjs',
        'jest.config.ts',
        'lint-staged.config.mjs',
        'prettier.config.mjs',
      ],
      references: [
        { path: './apps/web' },
        { path: './packages/babel-preset' },
        { path: './packages/babel-test' },
        { path: './packages/eslint-config' },
        { path: './packages/jest-config' },
        { path: './packages/jest-test' },
        { path: './packages/lint-staged' },
        { path: './packages/monorepo' },
        { path: './packages/prettier' },
        { path: './packages/projen-codeowners' },
        { path: './packages/projen-editorconfig' },
        { path: './packages/projen-lint-synthesized' },
        { path: './packages/projen-project' },
        { path: './packages/projen-typescript-config' },
        { path: './packages/tsconfig' },
      ],
    },
  },
  withTerraform: true,
  workspaces: ['apps/*', 'packages/*'],
})

project.package?.setScript('build', 'pnpm run --filter @langri-sha/web build')
project.package?.setScript('start', 'pnpm run --filter @langri-sha/web start')
project.package?.setScript('test', 'pnpm run --filter @langri-sha/web test')

project.package?.addDeps(
  '@babel/core@7.24.5',
  '@babel/register@7.23.7',
  'react-dom@18.3.1',
  'react@18.3.1',
  'webpack-cli@5.1.4',
  'webpack@5.91.0',
)

project.package?.addDevDeps(
  '@langri-sha/babel-preset@workspace:*',
  '@langri-sha/eslint-config@workspace:*',
  '@langri-sha/jest-config@workspace:*',
  '@langri-sha/lint-staged@workspace:*',
  '@langri-sha/prettier@workspace:*',
  '@langri-sha/projen-project@workspace:*',
  '@langri-sha/tsconfig@workspace:*',
  '@types/lint-staged@13.3.0',
  'eslint@9.3.0',
  'jest@29.7.0',
  'lint-staged@15.2.5',
  'prettier@3.2.5',
  'projen@0.81.15',
)

project.package?.addField('private', true)
project.package?.addField('packageManager', 'pnpm@9.1.3')
project.package?.addEngine('pnpm', '>=9.0.0')

const subprojectOptions: ProjectOptions[] = [
  {
    name: '@langri-sha/projen-beachball',
    outdir: path.join('packages', 'projen-beachball'),
    typeScriptConfig: {},
    jestConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      peerDeps: ['beachball@^2.0.0', 'projen@^0.81.15'],
    },
  },
  {
    name: '@langri-sha/projen-eslint',
    outdir: path.join('packages', 'projen-eslint'),
    typeScriptConfig: {},
    jestConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['serialize-javascript@6.0.2'],
      devDeps: ['@types/serialize-javascript@5.0.4'],
      peerDeps: ['eslint@^9.0.0', 'projen@^0.81.15'],
    },
  },
  {
    name: '@langri-sha/projen-husky',
    outdir: path.join('packages', 'projen-husky'),
    typeScriptConfig: {},
    jestConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      type: 'module',
      copyrightYear: '2024',
      devDeps: ['@types/node@20.12.12'],
      peerDeps: ['husky@^9.0.1', 'projen@^0.81.15'],
    },
  },
  {
    name: '@langri-sha/projen-jest-config',
    outdir: path.join('packages', 'projen-jest-config'),
    typeScriptConfig: {},
    jestConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['serialize-javascript@6.0.2'],
      devDeps: ['@types/serialize-javascript@5.0.4'],
      peerDeps: ['jest@^28.00 || ^29.00', 'projen@^0.81.15'],
    },
  },
  {
    name: '@langri-sha/projen-lint-staged',
    outdir: path.join('packages', 'projen-lint-staged'),
    jestConfig: {},
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['serialize-javascript@6.0.2'],
      devDeps: ['@types/serialize-javascript@5.0.4'],
      peerDeps: ['lint-staged@^15.0.0', 'projen@^0.81.15'],
    },
  },
  {
    name: '@langri-sha/projen-license',
    outdir: path.join('packages', 'projen-license'),
    jestConfig: {},
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['license-o-matic@^1.2.0'],
      peerDeps: ['projen@^0.81.15'],
    },
  },
  {
    name: '@langri-sha/projen-prettier',
    outdir: path.join('packages', 'projen-prettier'),
    jestConfig: {},
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['serialize-javascript@6.0.2'],
      devDeps: ['@types/serialize-javascript@5.0.4'],
      peerDeps: ['prettier@^3.0.0', 'projen@^0.81.15'],
    },
  },
  {
    name: '@langri-sha/projen-renovate',
    outdir: path.join('packages', 'projen-renovate'),
    jestConfig: {},
    typeScriptConfig: {},
    npmIgnore: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      type: 'module',
      deps: ['renovate@^37.342.1'],
      peerDeps: ['projen@^0.81.15'],
    },
  },
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
      devDeps: ['@langri-sha/babel-preset@workspace:*', '@types/node@20.12.12'],
      peerDeps: ['@babel/register@^7.0.0', 'webpack@^5.0.0'],
      peerDependencyOptions: {
        pinnedDevDependency: false,
      },
    },
  },
]

for (const options of subprojectOptions) {
  const subproject = project.addSubproject(options)

  new SampleFile(subproject, subproject.package?.entrypoint ?? 'src/index.ts', {
    contents: 'export {}',
  })

  new SampleFile(subproject, 'readme', {
    contents: `# ${subproject.name}\n`,
  })

  subproject.tryRemoveFile('.gitignore')

  subproject.package?.addField('publishConfig', {
    access: 'public',
    main: 'lib/index.js',
    types: 'lib/index.d.ts',
  })

  if (options.jestConfig) {
    subproject.package?.addDevDeps('@langri-sha/jest-test@workspace:*')
  }

  if (subproject.typeScriptConfig) {
    project.typeScriptConfig?.addReference(
      path.relative(project.outdir, subproject.outdir),
    )

    subproject.package?.addDevDeps('@langri-sha/tsconfig@workspace:*')

    if (options.jestConfig) {
      subproject.typeScriptConfig.addReference('../jest-test')
    }

    subproject.typeScriptConfig.addReference('../tsconfig')

    new TypeScriptConfig(subproject, {
      fileName: 'tsconfig.build.json',
      config: {
        extends: '@langri-sha/tsconfig/build.json',
        compilerOptions: {
          baseUrl: '.',
          outDir: 'lib',
        },
      },
    })

    subproject.package?.setScript(
      'prepublishOnly',
      'rm -rf lib; tsc --project tsconfig.build.json',
    )
  }
}

project.synth()
