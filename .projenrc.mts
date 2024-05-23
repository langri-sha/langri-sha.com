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
  beachballOptions: {},
  codeownersOptions: {
    '*': '@langri-sha',
  },
  editorConfigOptions: {},
  huskyOptions: {
    'pre-commit': 'pnpm -q lint-staged',
  },
  renovateOptions: {},
  typeScriptConfigOptions: {
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
        { path: './packages/projen-beachball' },
        { path: './packages/projen-codeowners' },
        { path: './packages/projen-editorconfig' },
        { path: './packages/projen-husky' },
        { path: './packages/projen-lint-synthesized' },
        { path: './packages/projen-typescript-config' },
        { path: './packages/projen-project' },
        { path: './packages/projen-renovate' },
        { path: './packages/tsconfig' },
        { path: './packages/webpack' },
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
  'eslint@9.3.0',
  'jest@29.7.0',
  'lint-staged@15.2.4',
  'prettier@3.2.5',
  'projen@0.81.15',
)

project.package?.addField('private', true)
project.package?.addField('packageManager', 'pnpm@9.1.2')
project.package?.addEngine('pnpm', '>=9.0.0')

const subprojectOptions: ProjectOptions[] = [
  {
    name: '@langri-sha/projen-jest-config',
    outdir: path.join('packages', 'projen-jest-config'),
    typeScriptConfigOptions: {},
    npmIgnoreOptions: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      peerDeps: ['jest@^28.00 || ^29.00', 'projen@^0.81.15'],
    },
  },
  {
    name: '@langri-sha/projen-license',
    outdir: path.join('packages', 'projen-license'),
    typeScriptConfigOptions: {},
    npmIgnoreOptions: {},
    package: {
      ...pkg,
      copyrightYear: '2024',
      deps: ['license-o-matic@^1.2.0'],
      peerDeps: ['projen@^0.81.15'],
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

  subproject.package?.addField('type', 'module')
  subproject.package?.addField('publishConfig', {
    access: 'public',
    main: 'lib/index.js',
    types: 'lib/index.d.ts',
  })

  subproject.package?.addDevDeps('@langri-sha/jest-test@workspace:*')

  if (subproject.typeScriptConfig) {
    project.typeScriptConfig?.addReference(
      path.relative(project.outdir, subproject.outdir),
    )

    subproject.package?.addDevDeps('@langri-sha/tsconfig@workspace:*')

    subproject.typeScriptConfig?.addReference('../jest-test')
    subproject.typeScriptConfig?.addReference('../tsconfig')

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
