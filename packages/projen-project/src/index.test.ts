import { synthSnapshot } from 'projen/lib/util/synth'
import { describe, expect, test } from '@langri-sha/jest-test'

import { Project } from './index'
import { Husky } from '@langri-sha/projen-husky'
import { EditorConfig } from '@langri-sha/projen-editorconfig'
import { Renovate } from '@langri-sha/projen-renovate'
import { Codeowners } from '@langri-sha/projen-codeowners'
import { Beachball } from '@langri-sha/projen-beachball'
import { TypeScriptConfig } from '@langri-sha/projen-typescript-config'
import * as path from 'node:path'
import { License } from '@langri-sha/projen-license'
import { NodePackage, ProjenrcFile } from './lib'
import { IgnoreFile } from 'projen'
import { JestConfig } from '@langri-sha/projen-jest-config'
import { Prettier } from '@langri-sha/projen-prettier'
import { ESLint } from '@langri-sha/projen-eslint'
import { LintStaged } from '@langri-sha/projen-lint-staged'

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.beachball).toBeUndefined()
  expect(project.codeowners).toBeUndefined()
  expect(project.editorConfig).toBeUndefined()
  expect(project.eslint).toBeUndefined()
  expect(project.husky).toBeUndefined()
  expect(project.jestConfig).toBeUndefined()
  expect(project.license).toBeUndefined()
  expect(project.lintStaged).toBeUndefined()
  expect(project.npmIgnore).toBeUndefined()
  expect(project.package).toBeUndefined()
  expect(project.prettier).toBeUndefined()
  expect(project.projenrc).toBeInstanceOf(ProjenrcFile)
  expect(project.renovate).toBeUndefined()
  expect(project.typeScriptConfig).toBeUndefined()
})

test('add subproject', () => {
  const project = new Project({
    name: 'test-project',
  })

  const sub = project.addSubproject({
    name: '@someproject/test',
    outdir: path.join('someproject', '@some', 'test'),
    typeScriptConfigOptions: {},
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(sub.projenrc).toBeInstanceOf(ProjenrcFile)
})

test('find subproject', () => {
  const project = new Project({
    name: 'test-project',
  })

  const subproject = project.addSubproject({
    name: '@someproject/test',
    outdir: path.join('sub', '@some', 'test'),
    typeScriptConfigOptions: {},
  })

  subproject.addSubproject({
    name: '@someproject/test2',
    outdir: path.join('subsub', '@some', 'test2'),
    typeScriptConfigOptions: {},
  })

  expect(project.findSubproject('@someproject/test')).toBeInstanceOf(Project)
  expect(project.findSubproject('@someproject/test2')).toBeInstanceOf(Project)
  expect(() => project.findSubproject('non-existing')).toThrowError(
    'Cannot find subproject non-existing',
  )
})

test('with Beachball configuration', () => {
  const project = new Project({
    name: 'test-project',
    package: {},
    beachballOptions: {},
    prettierOptions: {},
    typeScriptConfigOptions: {},
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.beachball).toBeInstanceOf(Beachball)
})

test('with code owners configured', () => {
  const project = new Project({
    name: 'test-project',
    codeownersOptions: {
      '*': '@admin',
    },
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.codeowners).toBeInstanceOf(Codeowners)
})

test('with EditorConfig options', () => {
  const project = new Project({
    name: 'test-project',
    editorConfigOptions: {},
    prettierOptions: {},
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.editorConfig).toBeInstanceOf(EditorConfig)
})

test('with ESLint options', () => {
  const project = new Project({
    name: 'test-project',
    package: {},
    eslintOptions: {},
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.eslint).toBeInstanceOf(ESLint)
})

test('with Husky options', () => {
  const project = new Project({
    name: 'test-project',
    package: {},
    huskyOptions: {
      'pre-commit': 'lint-staged',
    },
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.husky).toBeInstanceOf(Husky)
})

describe('with Jest configuration', () => {
  test('assigns jestConfig property', () => {
    const project = new Project({
      name: 'test-project',
      jestConfigOptions: {},
    })

    expect(project.jestConfig).toBeInstanceOf(JestConfig)
  })

  test('defaults', () => {
    const project = new Project({
      name: 'test-project',
      npmIgnoreOptions: {},
      jestConfigOptions: {},
    })

    expect(synthSnapshot(project)).toMatchSnapshot()
  })
})

describe('with license', () => {
  test('without author name', () => {
    expect(
      () =>
        new Project({
          name: 'test-project',
          package: {
            license: 'MIT',
          },
        }),
    ).toThrowError(/Missing package author name/)
  })

  test('assigns license property', () => {
    const project = new Project({
      name: 'test-project',
      package: {
        authorName: 'John Smith',
        license: 'MIT',
      },
    })

    expect(project.license).toBeInstanceOf(License)
  })

  test('with author name', () => {
    const project = new Project({
      name: 'test-project',
      package: {
        authorName: 'John Smith',
        license: 'MIT',
      },
    })

    expect(synthSnapshot(project)['license']).toMatchSnapshot()
  })

  test('with copyright year', () => {
    const project = new Project({
      name: 'test-project',
      package: {
        authorName: 'John Smith',
        copyrightYear: '2000',
        license: 'MIT',
      },
    })

    expect(synthSnapshot(project)['license']).toMatchSnapshot()
  })

  test('with author email', () => {
    const project = new Project({
      name: 'test-project',
      package: {
        authorEmail: 'john@example.com',
        authorName: 'John Smith',
        license: 'MIT',
      },
    })

    expect(synthSnapshot(project)['license']).toMatchSnapshot()
  })

  test('with author URL', () => {
    const project = new Project({
      name: 'test-project',
      package: {
        authorEmail: 'john@example.com',
        authorName: 'John Smith',
        authorUrl: 'https://example.com',
        license: 'MIT',
      },
    })

    expect(synthSnapshot(project)['license']).toMatchSnapshot()
  })
})

test('with `lint-staged`', () => {
  const project = new Project({
    name: 'test-project',
    lintStagedOptions: {},
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.lintStaged).toBeInstanceOf(LintStaged)
})

describe('with NPM ignore', () => {
  test('assigns npmIgnore property', () => {
    const project = new Project({
      name: 'test-project',
      npmIgnoreOptions: {},
    })

    expect(project.npmIgnore).toBeInstanceOf(IgnoreFile)
  })

  test('defaults', () => {
    const project = new Project({
      name: 'test-project',
      npmIgnoreOptions: {},
    })

    expect(synthSnapshot(project)['.npmignore']).toMatchSnapshot()
  })
})

describe('with package', () => {
  test('assigns package property', () => {
    const project = new Project({
      name: 'test-project',
      package: {},
    })

    expect(project.package).toBeInstanceOf(NodePackage)
  })

  test('defaults', () => {
    const project = new Project({
      name: 'test-project',
      package: {},
    })

    expect(synthSnapshot(project)['package.json']).toMatchSnapshot()
  })
})

test('with Prettier options', () => {
  const project = new Project({
    name: 'test-project',
    prettierOptions: {},
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.prettier).toBeInstanceOf(Prettier)
})

test('with Renovate options', () => {
  const project = new Project({
    name: 'test-project',
    renovateOptions: {},
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.renovate).toBeInstanceOf(Renovate)
})

test('with Terraform enabled', () => {
  const project = new Project({
    name: 'test-project',
    withTerraform: true,
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
})

test('with TypeScript options', () => {
  const project = new Project({
    name: 'test-project',
    package: {},
    typeScriptConfigOptions: {},
  })

  project.typeScriptConfig?.addFile('foo.js', 'bar.js')

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.typeScriptConfig).toBeInstanceOf(TypeScriptConfig)
})

test('with workspaces', () => {
  const project = new Project({
    name: 'test-project',
    eslintOptions: {},
    prettierOptions: {},
    workspaces: ['packages/*'],
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
})
