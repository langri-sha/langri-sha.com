import {
  Project as BaseProject,
  type ProjectOptions as BaseProjectOptions,
  IgnoreFile,
  IgnoreFileOptions,
  YamlFile,
  javascript,
} from 'projen'

import * as R from 'ramda'

import {
  LintSynthesized,
  type LintSynthesizedOptions,
} from '@langri-sha/projen-lint-synthesized'
import {
  EditorConfig,
  type EditorConfigOptions,
} from '@langri-sha/projen-editorconfig'
import {
  Codeowners,
  type CodeownersOptions,
} from '@langri-sha/projen-codeowners'
import { Renovate, type RenovateOptions } from '@langri-sha/projen-renovate'
import { Husky, type HuskyOptions } from '@langri-sha/projen-husky'
import {
  TypeScriptConfig,
  type TypeScriptConfigOptions,
} from '@langri-sha/projen-typescript-config'
import { Beachball, BeachballOptions } from '@langri-sha/projen-beachball'
import { License } from '@langri-sha/projen-license'

import { NodePackage, NodePackageOptions, ProjenrcFile } from './lib/index.js'
import { JestConfig, JestConfigOptions } from '@langri-sha/projen-jest-config'
import { Prettier, PrettierOptions } from '@langri-sha/projen-prettier'
import { ESLint, ESLintOptions } from '@langri-sha/projen-eslint'
import { LintStaged, LintStagedOptions } from '@langri-sha/projen-lint-staged'

export * from '@langri-sha/projen-typescript-config'

export interface ProjectOptions
  extends Omit<BaseProjectOptions, 'renovatebot' | 'renovatebotOptions'> {
  /*
   * Pass in to set up Beachball.
   */
  beachball?: BeachballOptions

  /*
   * Pass in to set up Beachball.
   */
  codeowners?: CodeownersOptions

  /**
   * EditorConfig options.
   */
  editorConfig?: EditorConfigOptions

  /**
   * Pass in to configure ESLint.
   */
  eslint?: ESLintOptions

  /**
   * Husky options.
   */
  husky?: HuskyOptions

  /**
   * Configures Jest, when provided.
   */
  jestConfig?: JestConfigOptions

  /**
   * Configures `lint-staged`, when provided.
   */
  lintStaged?: LintStagedOptions

  /*
   * Options for the linting synthesized files.
   */
  lintSynthesized?: LintSynthesizedOptions

  /**
   * Package configuration options.
   */
  package?: {
    /**
     * License copyright year.
     *
     * @default "Current full year"
     */
    copyrightYear?: string
  } & NodePackageOptions

  /**
   * Pass in to configure Prettier.
   */
  prettier?: PrettierOptions

  /**
   * Pass in to configure NPM ignore options.
   */
  npmIgnore?: IgnoreFileOptions

  /*
   * Pass in to configure Renovate.
   */
  renovate?: RenovateOptions

  /**
   * TypeScript configuration options.
   */
  typeScriptConfig?: TypeScriptConfigOptions

  /*
   * Whether to use Terrafom.
   */
  withTerraform?: boolean

  /*
   * PNPM workspaces to generate.
   */
  workspaces?: string[]
}

export class Project extends BaseProject {
  beachball?: Beachball
  codeowners?: Codeowners
  editorConfig?: EditorConfig
  eslint?: ESLint
  husky?: Husky
  jestConfig?: JestConfig
  license?: License
  lintStaged?: LintStaged
  npmIgnore?: IgnoreFile
  package?: NodePackage
  prettier?: Prettier
  projenrc?: ProjenrcFile
  renovate?: Renovate
  typeScriptConfig?: TypeScriptConfig

  constructor(options: ProjectOptions) {
    super({
      ...options,
      gitIgnoreOptions: getGitIgnoreOptions(options),
    })

    // Clean up tasks not required at top-level.
    this.tasks.removeTask('build')
    this.tasks.removeTask('compile')
    this.tasks.removeTask('eject')
    this.tasks.removeTask('package')
    this.tasks.removeTask('post-compile')
    this.tasks.removeTask('pre-compile')
    this.tasks.removeTask('watch')

    this.#configureProjenrc()
    this.#configurePackage(options)
    this.#configureTypeScript(options)

    if (this.parent) {
      this.tasks.tryFind('default')?.reset()
      this.tasks.tryFind('install')?.reset()
      this.tasks.tryFind('install:ci')?.reset()
    }

    this.#configureESLint(options)
    this.#configurePrettier(options)

    this.#configureBeachball(options)
    this.#configureCodeowners(options)
    this.#configureEditorConfig(options)
    this.#configureHusky(options)
    this.#configureJestConfig(options)
    this.#configureLicense(options)
    this.#configureLintStaged(options)
    this.#configureLintSynthesized(options)
    this.#configureNpmIgnore(options)
    this.#configureRenovate(options)
    this.#createPnpmWorkspaces(options)
  }

  /**
   * Add a subproject.
   */
  addSubproject(projectOptions: ProjectOptions) {
    return new Project({
      parent: this,
      ...projectOptions,
    })
  }

  /**
   * Find a project by it's name, e.g. `@acme/some`.
   */
  findSubproject(name: string): Project {
    const subprojects: Array<BaseProject> = []

    const addSubproject = (project: BaseProject) => {
      for (const subproject of project.subprojects) {
        subprojects.push(subproject)

        if (subproject.subprojects.length) {
          addSubproject(subproject)
        }
      }
    }

    addSubproject(this.root)

    const result = subprojects.find((subproject) => subproject.name === name)

    if (result instanceof Project) {
      return result
    }

    throw new Error(`Cannot find subproject ${name}`)
  }

  #configureBeachball({ beachball }: ProjectOptions) {
    if (!beachball || this.parent) {
      return
    }

    const options = deepMerge(beachball, {
      branch: 'origin/main',
      gitTags: false,
      ignorePatterns: [
        '*.test.*',
        '.*/**',
        '__snapshots__/',
        'dist/',
        'node_modules/',
      ],
    })

    this.beachball = new Beachball(this, options)

    this.prettier?.ignore.addPatterns('CHANGELOG.md')
    this.package?.addDevDeps('beachball@2.43.1')
    this.typeScriptConfig?.addFile('beachball.config.js')
  }

  #configureCodeowners({ codeowners: codeownersOptions }: ProjectOptions) {
    if (!codeownersOptions) {
      return
    }

    this.codeowners = new Codeowners(this, codeownersOptions)
  }

  #configureEditorConfig({
    editorConfig: editorConfigOptions,
  }: ProjectOptions) {
    if (!editorConfigOptions || this.parent) {
      return
    }

    const defaults: EditorConfigOptions = {
      '*': {
        charset: 'utf-8',
        end_of_line: 'lf',
        indent_style: 'space',
        indent_size: 2,
        insert_final_newline: true,
        trim_trailing_whitespace: true,
      },
      Dockerfile: {
        indent_style: 'tab',
      },
    }

    this.editorConfig = new EditorConfig(
      this,
      deepMerge(editorConfigOptions ?? {}, defaults),
    )

    this.prettier?.ignore.addPatterns('!.editorconfig')
  }

  #configureESLint({ eslint: eslintOptions }: ProjectOptions) {
    if (!eslintOptions) {
      return
    }

    const defaults: ESLintOptions = {
      filename: 'eslint.config.mjs',
      ignorePatterns: ['.*'],
      extends: '@langri-sha/eslint-config',
    }

    this.eslint = new ESLint(this, deepMerge(defaults, eslintOptions))

    if (this.projenrc?.filePath) {
      this.eslint.ignorePatterns.push(this.projenrc.filePath)
    }
  }

  #configureHusky({ husky: huskyOptions }: ProjectOptions) {
    if (!huskyOptions || this.parent) {
      return
    }

    this.husky = new Husky(this, huskyOptions)

    this.package?.addDevDeps('husky@9.0.11')
    this.package?.setScript('prepare', 'husky')
    this.tryFindObjectFile('package.json')?.addDeletionOverride('pnpm')
  }

  #configureJestConfig({ jestConfig: jestConfigOptions }: ProjectOptions) {
    if (!jestConfigOptions || this.parent) {
      return
    }

    this.jestConfig = new JestConfig(this, jestConfigOptions)
  }

  #configureLicense({ package: pkg }: ProjectOptions) {
    if (!pkg?.license) {
      return
    }

    if (!pkg.authorName) {
      throw new Error(
        'Missing package author name. Set `package.authorName` in the project',
      )
    }

    this.license = new License(this, {
      spdx: pkg.license,
      copyrightHolder: [
        pkg.authorName,
        pkg.authorEmail ? `<${pkg.authorEmail}>` : undefined,
        pkg.authorUrl ? `(${pkg.authorUrl})` : undefined,
      ]
        .filter(Boolean)
        .join(' '),
      year: pkg.copyrightYear ?? new Date().getFullYear().toString(),
    })
  }

  #configureLintStaged({ lintStaged: lintStagedOptions }: ProjectOptions) {
    if (!lintStagedOptions) {
      return
    }

    const defaults: LintStagedOptions = {
      filename: 'lint-staged.config.mjs',
      extends: '@langri-sha/lint-staged',
    }

    this.lintStaged = new LintStaged(
      this,
      deepMerge(defaults, lintStagedOptions),
    )
  }

  #configureLintSynthesized({ lintSynthesized }: ProjectOptions) {
    if (!lintSynthesized) {
      return
    }

    const defaults: LintSynthesizedOptions = {
      'package.json': 'pnpx sort-package-json',
      '*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}': 'pnpm eslint --fix',
      '*': 'pnpm prettier --write --ignore-unknown',
    }

    new LintSynthesized(this, deepMerge(defaults, lintSynthesized))
  }

  #configureNpmIgnore({
    typeScriptConfig,
    jestConfig,
    npmIgnore,
  }: ProjectOptions) {
    if (!npmIgnore) {
      return
    }

    const defaults: IgnoreFileOptions = {
      ignorePatterns: [
        '.*',
        ...(jestConfig ? ['*.test.*', '__snapshots__/'] : []),
        ...(typeScriptConfig ? ['tsconfig*.json'] : []),
      ],
    }

    this.npmIgnore = new IgnoreFile(
      this,
      '.npmignore',
      deepMerge(defaults, npmIgnore),
    )
  }

  #configurePackage({ package: pkg }: ProjectOptions) {
    if (!pkg) {
      return
    }

    const defaults: NodePackageOptions = {
      entrypoint: 'src/index.ts',
      packageManager: javascript.NodePackageManager.PNPM,
    }

    this.package = new NodePackage(this, deepMerge(defaults, pkg))

    if (!this.parent) {
      this.package.addDevDeps('@langri-sha/projen-project@*')
      this.package.addDevDeps('projen@0.81.15')
    }

    this.package.removeScript('start')
    this.package.removeScript('test')

    if (this.parent) {
      this.package.removeScript('default')
    }
  }

  #configurePrettier({ prettier: prettierOptions }: ProjectOptions) {
    if (!prettierOptions || this.parent) {
      return
    }

    const defaults: PrettierOptions = {
      filename: 'prettier.config.mjs',
      extends: '@langri-sha/prettier',
      ignorePatterns: ['.*'],
    }

    this.prettier = new Prettier(this, deepMerge(defaults, prettierOptions))

    if (this.projenrc?.filePath) {
      this.prettier.ignore.include(this.projenrc.filePath)
    }

    if (this.package?.packageManager === javascript.NodePackageManager.PNPM) {
      this.prettier.ignore.addPatterns('pnpm-lock.yaml')
    }
  }

  #configureProjenrc() {
    this.projenrc = new ProjenrcFile(this, {})
  }

  #configureRenovate({ renovate: renovateOptions }: ProjectOptions) {
    if (!renovateOptions || this.parent) {
      return
    }

    const defaults: RenovateOptions = {
      configMigration: true,
      extends: ['config:recommended'],
      labels: ['dependencies'],
      reviewersFromCodeOwners: true,
      customManagers: [
        {
          customType: 'regex',
          datasourceTemplate: 'npm',
          fileMatch: ['\\.?projen.*.(js|cjs|mjs|ts|mts|cts)$'],
          matchStringsStrategy: 'recursive',
          matchStrings: [
            '\\.(?<depType>addDeps|addDevDeps|addPeerDeps)\\([^)]*\\)',
            "'(?<depName>[a-zA-Z0-9-]+)@(?<currentValue>[^']+)'",
          ],
          depTypeTemplate:
            "{{#if (equals depType 'addDeps')}}dependencies{{else if (equals depType 'addDevDeps')}}devDependencies{{else}}peerDependencies{{/if}}",
        },
        {
          customType: 'regex',
          datasourceTemplate: 'npm',
          fileMatch: ['\\.?projen.*.(js|cjs|mjs|ts|mts|cts)$'],
          matchStringsStrategy: 'recursive',
          matchStrings: [
            '(?<depType>deps|devDeps|peerDeps):\\s*\\[[^\\]]*\\]',
            "'(?<depName>[a-zA-Z0-9-]+)@(?<currentValue>[^']+)'",
          ],
          depTypeTemplate:
            "{{#if (equals depType 'deps')}}dependencies{{else if (equals depType 'devDeps')}}devDependencies{{else}}peerDependencies{{/if}}",
        },
        {
          customType: 'regex',
          datasourceTemplate: 'npm',
          fileMatch: ['\\.?projen.*.(js|cjs|mjs|ts|mts|cts)$'],
          matchStrings: ["pnpm@(?<currentValue>[^']+)"],
          depNameTemplate: 'pnpm',
          depTypeTemplate: 'dependencies',
        },
      ],
    }

    this.renovate = new Renovate(this, deepMerge(defaults, renovateOptions))
  }

  #configureTypeScript({
    parent,
    typeScriptConfig: typeScriptConfigOptions,
  }: ProjectOptions) {
    if (!typeScriptConfigOptions) {
      return
    }

    const defaults: TypeScriptConfigOptions = parent
      ? {
          config: {
            extends: '@langri-sha/tsconfig/project.json',
            compilerOptions: {
              baseUrl: '.',
              outDir: '.tsbuild',
            },
          },
        }
      : {
          config: {
            extends: '@langri-sha/tsconfig',
          },
        }

    this.typeScriptConfig = new TypeScriptConfig(
      this,
      deepMerge(defaults, typeScriptConfigOptions),
    )

    if (!this.parent) {
      this.package?.addDevDeps('typescript@5.4.5')
      this.package?.addDevDeps('ts-node@10.9.2')
    }

    this.package?.addDevDeps('@langri-sha/tsconfig@*')
  }

  #createPnpmWorkspaces({ workspaces }: ProjectOptions) {
    if (!workspaces) {
      return
    }

    new YamlFile(this, 'pnpm-workspace.yaml', {
      readonly: true,
      marker: true,
      obj: {
        packages: workspaces,
      },
    })

    for (const workspace of workspaces) {
      this.prettier?.ignore.exclude(`${workspace}/lib/`)
      this.eslint?.ignorePatterns.push(`${workspace}/lib/`)
    }
  }
}

const getGitIgnoreOptions = ({
  gitIgnoreOptions,
  husky: huskyOptions,
  parent,
  typeScriptConfig: typeScriptConfigOptions,
  withTerraform,
  ...options
}: ProjectOptions): ProjectOptions['gitIgnoreOptions'] =>
  parent
    ? gitIgnoreOptions
    : {
        ignorePatterns: [
          ...`
    .*
    !.babelrc
    !.dockerignore
    !.editorconfig
    !.gitattributes
    !.gitignore
    !.gitkeep
    !.npmignore
    !.openssl
    !.prettierignore
    ${withTerraform ? '!.terraform.lock.hcl' : ''}
    *.db
    *.log
    ${typeScriptConfigOptions ? '*.tsbuildinfo' : ''}

    !.github/
    ${huskyOptions ? '!.husky/' : ''}
    !.projen/
    ${options.workspaces?.map((workspace) => `${workspace}/lib/`).join('\n') ?? ''}
    node_modules/
    `
            .split('\n')
            .map((pattern) => pattern.trim())
            .filter((pattern) => pattern.length > 0),
          ...(gitIgnoreOptions?.ignorePatterns ?? []),
        ],
      }

const deepMerge = R.mergeDeepWith(R.concat)
