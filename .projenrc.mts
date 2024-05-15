import { Project } from '@langri-sha/projen-project'

const project = new Project({
  name: 'langri-sha.com',
  beachballConfig: {},
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

project.synth()
