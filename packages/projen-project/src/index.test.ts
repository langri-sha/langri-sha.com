import * as path from 'node:path'

import { Babel } from '@langri-sha/projen-babel'
import { Beachball } from '@langri-sha/projen-beachball'
import { Codeowners } from '@langri-sha/projen-codeowners'
import { EditorConfig } from '@langri-sha/projen-editorconfig'
import { ESLint } from '@langri-sha/projen-eslint'
import { Husky } from '@langri-sha/projen-husky'
import { JestConfig } from '@langri-sha/projen-jest-config'
import { License } from '@langri-sha/projen-license'
import { LintStaged } from '@langri-sha/projen-lint-staged'
import { LintSynthesized } from '@langri-sha/projen-lint-synthesized'
import { PnpmWorkspace } from '@langri-sha/projen-pnpm-workspace'
import { Prettier } from '@langri-sha/projen-prettier'
import { ReadmeFile } from '@langri-sha/projen-readme'
import { Renovate } from '@langri-sha/projen-renovate'
import { SWCConfig } from '@langri-sha/projen-swcrc'
import { TypeScriptConfig } from '@langri-sha/projen-typescript-config'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
} from '@langri-sha/vitest'
import { Project as BaseProject, IgnoreFile } from 'projen'
import { synthSnapshot } from 'projen/lib/util/synth'
import { vi } from 'vitest'

import { NodePackage, ProjenrcFile } from './lib'
import { GitAttributesFile } from './lib/gitattributes'

import { Project } from './index'

vi.mock('@langri-sha/projen-lint-synthesized', () => ({
  LintSynthesized: vi.fn(),
}))

// Mock system time to January 1, 2024 for consistent test snapshots
beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2024-01-01'))
})

afterAll(() => {
  vi.useRealTimers()
})

afterEach(() => {
  vi.resetAllMocks()
})

test('defaults', () => {
  const project = new Project({
    name: 'test-project',
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.babel).toBeUndefined()
  expect(project.beachball).toBeUndefined()
  expect(project.codeowners).toBeUndefined()
  expect(project.editorConfig).toBeUndefined()
  expect(project.eslint).toBeUndefined()
  expect(project.gitattributes).toBeInstanceOf(GitAttributesFile)
  expect(project.husky).toBeUndefined()
  expect(project.jestConfig).toBeUndefined()
  expect(project.license).toBeUndefined()
  expect(project.lintStaged).toBeUndefined()
  expect(project.npmIgnore).toBeUndefined()
  expect(project.package).toBeUndefined()
  expect(project.pnpmWorkspace).toBeUndefined()
  expect(project.prettier).toBeUndefined()
  expect(project.projenrc).toBeInstanceOf(ProjenrcFile)
  expect(project.readme).toBeUndefined()
  expect(project.renovate).toBeUndefined()
  expect(project.swcrc).toBeUndefined()
  expect(project.typeScriptConfig).toBeUndefined()
})

test('get all subprojects', () => {
  const project = new Project({
    name: 'test-project',
  })

  const subproject = project.addSubproject({
    name: '@someproject/test',
    outdir: path.join('sub', '@some', 'test'),
    typeScriptConfig: {},
  })

  subproject.addSubproject({
    name: '@someproject/test2',
    outdir: path.join('subsub', '@some', 'test2'),
    typeScriptConfig: {},
  })

  expect(project.allSubprojects).toHaveLength(2)
})

test('get all subprojects kind', () => {
  const project = new Project({
    name: 'test-project',
  })

  new BaseProject({
    name: 'project-a',
    parent: project,
    outdir: 'project-a',
  })

  new Project({
    name: 'project-b',
    parent: project,
    outdir: 'project-b',
  })

  expect(project.allSubprojectsKind).toHaveLength(1)
  expect(project.allSubprojectsKind[0]).toBeInstanceOf(Project)
  expect(project.allSubprojectsKind[0].name).toBe('project-b')
})

describe('add subproject', () => {
  test('with options', () => {
    const project = new Project({
      name: 'test-project',
    })

    const sub = project.addSubproject({
      name: '@someproject/test',
      outdir: path.join('someproject', '@some', 'test'),
      typeScriptConfig: {},
    })

    expect(synthSnapshot(project)).toMatchSnapshot()
    expect(sub.projenrc).toBeInstanceOf(ProjenrcFile)
  })

  test('with callback', () =>
    new Promise((resolve) => {
      expect.assertions(2)

      const project = new Project({
        name: 'test-project',
      })

      project.addSubproject(
        {
          name: '@someproject/test',
          outdir: path.join('someproject', '@some', 'test'),
          typeScriptConfig: {},
        },
        (p) => {
          expect(p).toBeInstanceOf(Project)
          expect(p.name).toBe('@someproject/test')

          resolve(undefined)
        },
      )
    }))
})

test('find subproject', () => {
  const project = new Project({
    name: 'test-project',
  })

  const subproject = project.addSubproject({
    name: '@someproject/test',
    outdir: path.join('sub', '@some', 'test'),
    typeScriptConfig: {},
  })

  subproject.addSubproject({
    name: '@someproject/test2',
    outdir: path.join('subsub', '@some', 'test2'),
    typeScriptConfig: {},
  })

  expect(project.findSubproject('@someproject/test')).toBeInstanceOf(Project)
  expect(project.findSubproject('@someproject/test2')).toBeInstanceOf(Project)
  expect(project.findSubproject('non-existing')).toBeUndefined()
})

describe('creates `.projenrc` Projen project configuration', () => {
  test('with defaults', () => {
    const project = new Project({
      name: 'test-project',
    })

    expect(synthSnapshot(project)).toMatchSnapshot()
  })

  test('with ESM package', () => {
    const project = new Project({
      name: 'test-project',
      package: {
        type: 'module',
      },
    })

    expect(synthSnapshot(project)).toMatchSnapshot()
  })
})

describe('with Babel configuration', () => {
  test('defaults', () => {
    const project = new Project({
      name: 'test-project',
      babel: {},
      typeScriptConfig: {},
    })

    expect(synthSnapshot(project)).toMatchSnapshot()
    expect(project.babel).toBeInstanceOf(Babel)
  })

  test('with ESM package', () => {
    const project = new Project({
      name: 'test-project',
      package: {
        type: 'module',
      },
      babel: {},
      typeScriptConfig: {},
    })

    expect(synthSnapshot(project)).toMatchSnapshot()
  })
})

describe('with Beachball configuration', () => {
  test('defaults', () => {
    const project = new Project({
      name: 'test-project',
      package: {},
      beachball: {},
      prettier: {},
      typeScriptConfig: {},
    })

    expect(synthSnapshot(project)).toMatchSnapshot()
    expect(project.beachball).toBeInstanceOf(Beachball)
  })

  test('with ESM package', () => {
    const project = new Project({
      name: 'test-project',
      package: {
        type: 'module',
      },
      beachball: {},
      prettier: {},
      typeScriptConfig: {},
    })

    expect(synthSnapshot(project)).toMatchSnapshot()
  })
})

test('with code owners configured', () => {
  const project = new Project({
    name: 'test-project',
    codeowners: {
      '*': '@admin',
    },
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.codeowners).toBeInstanceOf(Codeowners)
})

test('with EditorConfig options', () => {
  const project = new Project({
    name: 'test-project',
    editorConfig: {},
    prettier: {},
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.editorConfig).toBeInstanceOf(EditorConfig)
})

describe('with ESLint options', () => {
  test('default', () => {
    const project = new Project({
      name: 'test-project',
      package: {},
      eslint: {},
      typeScriptConfig: {},
    })

    expect(synthSnapshot(project)).toMatchSnapshot()
    expect(project.eslint).toBeInstanceOf(ESLint)
  })

  test('with ESM package', () => {
    const project = new Project({
      name: 'test-project',
      package: {
        type: 'module',
      },
      eslint: {},
    })

    expect(synthSnapshot(project)).toMatchSnapshot()
  })
})

test('with Husky options', () => {
  const project = new Project({
    name: 'test-project',
    package: {},
    husky: {
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
      jestConfig: {},
    })

    expect(project.jestConfig).toBeInstanceOf(JestConfig)
  })

  test('defaults', () => {
    const project = new Project({
      name: 'test-project',
      npmIgnore: {},
      jestConfig: {},
      typeScriptConfig: {},
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

describe('with `lint-staged`', () => {
  test('defaults', () => {
    const project = new Project({
      name: 'test-project',
      lintStaged: {},
      typeScriptConfig: {},
    })

    expect(synthSnapshot(project)).toMatchSnapshot()
    expect(project.lintStaged).toBeInstanceOf(LintStaged)
  })

  test('with ESM package', () => {
    const project = new Project({
      name: 'test-project',
      lintStaged: {},
      package: {
        type: 'module',
      },
      typeScriptConfig: {},
    })

    expect(synthSnapshot(project)).toMatchSnapshot()
    expect(project.lintStaged).toBeInstanceOf(LintStaged)
  })
})

describe('with `lint-synthesized`', () => {
  test('defaults', () => {
    const project = new Project({
      name: 'test-project',
      lintSynthesized: {},
    })

    synthSnapshot(project)
    expect(LintSynthesized).toHaveBeenCalledWith(project, {
      'package.json': 'pnpx sort-package-json',
    })
  })

  test('with ESLint', () => {
    const project = new Project({
      name: 'test-project',
      eslint: {},
      lintSynthesized: {},
    })

    synthSnapshot(project)
    expect(LintSynthesized).toHaveBeenCalledWith(project, {
      'package.json': 'pnpx sort-package-json',
      '*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}': 'pnpm eslint --fix',
    })
  })

  test('with Prettier', () => {
    const project = new Project({
      name: 'test-project',
      lintSynthesized: {},
      prettier: {},
    })

    synthSnapshot(project)
    expect(LintSynthesized).toHaveBeenCalledWith(project, {
      'package.json': 'pnpx sort-package-json',
      '*': 'pnpm prettier --write --ignore-unknown',
    })
  })
})

describe('with NPM ignore', () => {
  test('assigns npmIgnore property', () => {
    const project = new Project({
      name: 'test-project',
      npmIgnore: {},
    })

    expect(project.npmIgnore).toBeInstanceOf(IgnoreFile)
  })

  test('defaults', () => {
    const project = new Project({
      name: 'test-project',
      npmIgnore: {},
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

test('with PNPM workspace', () => {
  const project = new Project({
    name: 'test-project',
    eslint: {},
    prettier: {},
    pnpmWorkspace: {
      packages: ['packages/*'],
    },
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.pnpmWorkspace).toBeInstanceOf(PnpmWorkspace)
})

describe('with Prettier options', () => {
  test('defaults', () => {
    const project = new Project({
      name: 'test-project',
      prettier: {},
      typeScriptConfig: {},
    })

    expect(synthSnapshot(project)).toMatchSnapshot()
    expect(project.prettier).toBeInstanceOf(Prettier)
  })

  test('with ESM package', () => {
    const project = new Project({
      name: 'test-project',
      prettier: {},
      package: {
        type: 'module',
      },
    })

    expect(synthSnapshot(project)).toMatchSnapshot()
    expect(project.prettier).toBeInstanceOf(Prettier)
  })
})

test('With README options', () => {
  const project = new Project({
    name: 'test-project',
    readme: {},
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.readme).toBeInstanceOf(ReadmeFile)
})

test('with Renovate options', () => {
  const project = new Project({
    name: 'test-project',
    renovate: {},
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
  expect(project.renovate).toBeInstanceOf(Renovate)
})

describe('with SWC options', () => {
  test('defaults', () => {
    const project = new Project({
      name: 'test-project',
      package: {},
      swcrc: {},
    })

    expect(synthSnapshot(project)['.swcrc']).toMatchSnapshot()
    expect(project.swcrc).toBeInstanceOf(SWCConfig)
  })

  test('with TypeScript', () => {
    const project = new Project({
      name: 'test-project',
      package: {},
      swcrc: {},
      typeScriptConfig: {},
    })

    expect(synthSnapshot(project)['.swcrc']).toMatchSnapshot()
  })
})

test('with Terraform enabled', () => {
  const project = new Project({
    name: 'test-project',
    withTerraform: true,
  })

  expect(synthSnapshot(project)).toMatchSnapshot()
})

describe('with TypeScript options', () => {
  test('defaults', () => {
    const project = new Project({
      name: 'test-project',
      package: {},
      typeScriptConfig: {},
    })

    project.typeScriptConfig?.addFile('foo.js', 'bar.js')

    expect(synthSnapshot(project)).toMatchSnapshot()
    expect(project.typeScriptConfig).toBeInstanceOf(TypeScriptConfig)
  })

  test('with SWC', () => {
    const project = new Project({
      name: 'test-project',
      package: {},
      typeScriptConfig: {},
      swcrc: {},
    })

    expect(synthSnapshot(project)).toMatchSnapshot()
  })

  test('configures project references between subprojects', () => {
    const project = new Project({
      name: 'test-project',
      package: {},
      typeScriptConfig: {},
    })

    new Project({
      name: 'sub-project-a',
      parent: project,
      outdir: 'sub-project-a',
      package: {
        deps: ['sub-project-b@workspace:*'],
      },
      typeScriptConfig: {},
    })

    new Project({
      name: 'sub-project-b',
      outdir: 'sub-project-b',
      parent: project,
      package: {
        deps: ['sub-project-a@workspace:*'],
      },
      typeScriptConfig: {},
    })

    expect(synthSnapshot(project)).toMatchSnapshot()
  })
})

test('removes .gitattributes for subprojects', () => {
  const project = new Project({
    name: 'test-project',
    package: {},
    typeScriptConfig: {},
  })

  new Project({
    name: 'sub-project-a',
    parent: project,
    outdir: 'sub-project-a',
    typeScriptConfig: {},
  })

  expect(synthSnapshot(project)['sub-project-a/.gitattributes']).toBeUndefined()
})
