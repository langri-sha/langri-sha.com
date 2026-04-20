import * as path from 'node:path'

import { Babel, BabelOptions } from '@langri-sha/projen-babel'
import { Beachball, BeachballOptions } from '@langri-sha/projen-beachball'
import {
  Codeowners,
  type CodeownersOptions,
} from '@langri-sha/projen-codeowners'
import {
  EditorConfig,
  type EditorConfigOptions,
} from '@langri-sha/projen-editorconfig'
import { ESLint, ESLintOptions } from '@langri-sha/projen-eslint'
import { Husky, type HuskyOptions } from '@langri-sha/projen-husky'
import { JestConfig, JestConfigOptions } from '@langri-sha/projen-jest-config'
import { License } from '@langri-sha/projen-license'
import { LintStaged, LintStagedOptions } from '@langri-sha/projen-lint-staged'
import {
  LintSynthesized,
  type LintSynthesizedOptions,
} from '@langri-sha/projen-lint-synthesized'
import {
  PnpmWorkspace,
  PnpmWorkspaceOptions,
} from '@langri-sha/projen-pnpm-workspace'
import { Prettier, PrettierOptions } from '@langri-sha/projen-prettier'
import { ReadmeFile, type ReadmeFileOptions } from '@langri-sha/projen-readme'
import { Renovate, type RenovateOptions } from '@langri-sha/projen-renovate'
import { SWCConfig, type SWCConfigOptions } from '@langri-sha/projen-swcrc'
import {
  TypeScriptConfig,
  type TypeScriptConfigOptions,
} from '@langri-sha/projen-typescript-config'
import {
  Project as BaseProject,
  type ProjectOptions as BaseProjectOptions,
  IgnoreFile,
  IgnoreFileOptions,
  javascript,
} from 'projen'
import * as R from 'ramda'

import { GitAttributesFile } from './lib/gitattributes.js'
import { NodePackage, NodePackageOptions, ProjenrcFile } from './lib/index.js'

export * from '@langri-sha/projen-typescript-config'

export interface ProjectOptions
  extends Omit<BaseProjectOptions, 'renovatebot' | 'renovatebotOptions'> {
  /*
   * Pass in to set up Beachball.
   */
  babel?: BabelOptions

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

  /*
   * PNPM workspaces to generate, if provided.
   */
  pnpmWorkspace?: PnpmWorkspaceOptions

  /**
   * Pass in to configure Prettier.
   */
  prettier?: PrettierOptions

  /**
   * Pass in to configure NPM ignore options.
   */
  npmIgnore?: IgnoreFileOptions

  /*
   * Add a sample `README`.
   */
  readme?: ReadmeFileOptions

  /*
   * Pass in to configure Renovate.
   */
  renovate?: RenovateOptions

  /*
   * Pass in to configure SWC.
   */
  swcrc?: SWCConfigOptions

  /**
   * TypeScript configuration options.
   */
  typeScriptConfig?: TypeScriptConfigOptions

  /*
   * Whether to use Terrafom.
   */
  withTerraform?: boolean
}

export class Project extends BaseProject {
  babel?: Babel
  beachball?: Beachball
  codeowners?: Codeowners
  editorConfig?: EditorConfig
  eslint?: ESLint
  husky?: Husky
  jestConfig?: JestConfig
  license?: License
  lintStaged?: LintStaged
  npmIgnore?: IgnoreFile
  override readonly gitattributes: GitAttributesFile
  package?: NodePackage
  pnpmWorkspace?: PnpmWorkspace
  prettier?: Prettier
  projenrc?: ProjenrcFile
  readme?: ReadmeFile
  renovate?: Renovate
  swcrc?: SWCConfig
  typeScriptConfig?: TypeScriptConfig

  constructor(options: ProjectOptions) {
    super({
      ...options,
      gitIgnoreOptions: getGitIgnoreOptions(options),
    })

    this.tryRemoveFile('.gitattributes')
    this.gitattributes = new GitAttributesFile(this)

    // Clean up tasks not required at top-level.
    this.tasks.removeTask('build')
    this.tasks.removeTask('compile')
    this.tasks.removeTask('eject')
    this.tasks.removeTask('package')
    this.tasks.removeTask('post-compile')
    this.tasks.removeTask('pre-compile')
    this.tasks.removeTask('watch')

    this.#configurePackage(options)
    this.#configureTypeScript(options)
    this.#configureSWC(options)
    this.#configureProjenrc(options)

    if (this.parent) {
      this.tryRemoveFile('.gitattributes')
      this.tasks.tryFind('default')?.reset()
      this.tasks.tryFind('install')?.reset()
      this.tasks.tryFind('install:ci')?.reset()
    }

    this.#configureESLint(options)
    this.#configurePrettier(options)

    this.#configureBabel(options)
    this.#configureBeachball(options)
    this.#configureCodeowners(options)
    this.#configureEditorConfig(options)
    this.#configureGitAttributes()
    this.#configureHusky(options)
    this.#configureJestConfig(options)
    this.#configureLicense(options)
    this.#configureLintStaged(options)
    this.#configureLintSynthesized(options)
    this.#configureNpmIgnore(options)
    this.#configurePnpmWorkspace(options)
    this.#configureReadme(options)
    this.#configureRenovate(options)
  }

  /**
   * Annotate generated files on root projects.
   */
  override annotateGenerated(glob: string): void {
    if (this.parent) {
      if (path.isAbsolute(glob)) {
        this.root.gitattributes.addAttributes(
          `/${path.relative(this.root.outdir, path.join(this.outdir, glob))}`,
          'linguist-generated',
        )
      }

      return
    }

    this.gitattributes.addAttributes(glob, 'linguist-generated')
  }

  override preSynthesize(): void {
    super.preSynthesize()

    this.#populateTypeScriptProjectReferencesFromDependencies()
  }

  get allSubprojects(): BaseProject[] {
    return this.root.node
      .findAll(0)
      .filter((node) => node !== this.root)
      .filter((node): node is BaseProject => node instanceof BaseProject)
  }

  get allSubprojectsKind(): Project[] {
    return this.allSubprojects.filter(
      (project): project is Project => project instanceof Project,
    )
  }

  /**
   * Add a subproject.
   */
  addSubproject(
    projectOptions: ProjectOptions,
    ...compose: Array<(project: Project) => void>
  ): Project {
    const project = new Project({
      parent: this,
      ...projectOptions,
    })

    for (const callback of compose) {
      callback(project)
    }

    return project
  }

  /**
   * Find a project by it's name, e.g. `@acme/some`.
   */
  findSubproject(name: string): Project | undefined {
    return this.allSubprojectsKind.find((project) => project.name === name)
  }

  #configureBabel({ babel, package: pkg }: ProjectOptions) {
    if (!babel) {
      return
    }

    const defaults: BabelOptions = {
      filename: pkg?.type === 'module' ? 'babel.config.js' : 'babel.config.mjs',
      options: {
        presets: ['@langri-sha/babel-preset'],
      },
    }

    this.babel = new Babel(this, deepMerge(defaults, babel))

    this.typeScriptConfig?.addFile(this.babel.path)
  }

  #configureBeachball({ beachball, package: pkg }: ProjectOptions) {
    if (!beachball || this.parent) {
      return
    }

    const defaults: BeachballOptions = {
      filename:
        pkg?.type === 'module' ? 'beachball.config.cjs' : 'beachball.config.js',
      config: {
        branch: 'origin/main',
        gitTags: false,
        ignorePatterns: [
          '*.test.*',
          '.*/**',
          '__snapshots__/',
          'dist/',
          'node_modules/',
        ],
      },
    }

    this.beachball = new Beachball(this, deepMerge(defaults, beachball))

    this.prettier?.ignore.addPatterns('CHANGELOG.md')
    this.package?.addDevDeps('beachball@2.45.0')
    this.typeScriptConfig?.addFile(this.beachball!.path)
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

  #configureGitAttributes() {
    this.annotateGenerated('/.gitignore')
    this.annotateGenerated('/.projen/**')
    this.annotateGenerated(`/${this.gitattributes.path}`)
  }

  #configureESLint({ eslint, package: pkg }: ProjectOptions) {
    if (!eslint) {
      return
    }

    const defaults: ESLintOptions = {
      filename:
        pkg?.type === 'module' ? 'eslint.config.js' : 'eslint.config.mjs',
      ignorePatterns: ['**/.*', '**/dist/'],
      extends: '@langri-sha/eslint-config',
    }

    this.eslint = new ESLint(this, deepMerge(defaults, eslint))

    if (this.projenrc?.filePath) {
      this.eslint.ignorePatterns.push(`!${this.projenrc.filePath}`)
    }

    this.typeScriptConfig?.addFile(this.eslint.path)
  }

  #configureHusky({ husky: huskyOptions }: ProjectOptions) {
    if (!huskyOptions || this.parent) {
      return
    }

    this.husky = new Husky(this, huskyOptions)

    this.package?.addDevDeps('husky@9.1.7')
    this.package?.setScript('prepare', 'husky')
    this.tryFindObjectFile('package.json')?.addDeletionOverride('pnpm')
  }

  #configureJestConfig({ jestConfig: jestConfigOptions }: ProjectOptions) {
    if (!jestConfigOptions || this.parent) {
      return
    }

    this.jestConfig = new JestConfig(this, jestConfigOptions)

    this.typeScriptConfig?.addFile(this.jestConfig.path)
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

  #configureLintStaged({ lintStaged, package: pkg }: ProjectOptions) {
    if (!lintStaged) {
      return
    }

    const defaults: LintStagedOptions = {
      filename:
        pkg?.type === 'module'
          ? 'lint-staged.config.js'
          : 'lint-staged.config.mjs',
      extends: '@langri-sha/lint-staged',
    }

    this.lintStaged = new LintStaged(this, deepMerge(defaults, lintStaged))

    this.typeScriptConfig?.addFile(this.lintStaged!.path)
  }

  #configureLintSynthesized({
    eslint,
    lintSynthesized,
    prettier,
  }: ProjectOptions) {
    if (!lintSynthesized) {
      return
    }

    const defaults: LintSynthesizedOptions = {
      'package.json': 'pnpx sort-package-json',
      ...(eslint && {
        '*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}': 'pnpm eslint --fix',
      }),
      ...(prettier && { '*': 'pnpm prettier --write --ignore-unknown' }),
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
      this.package.addDevDeps('projen@0.99.8')
    }

    this.package.removeScript('start')
    this.package.removeScript('test')

    if (this.parent) {
      this.package.removeScript('default')
    }
  }

  #configurePnpmWorkspace({ pnpmWorkspace }: ProjectOptions) {
    if (!pnpmWorkspace) {
      return
    }

    this.pnpmWorkspace = new PnpmWorkspace(this, pnpmWorkspace)
  }

  #configurePrettier({ prettier, package: pkg }: ProjectOptions) {
    if (!prettier || this.parent) {
      return
    }

    const defaults: PrettierOptions = {
      filename:
        pkg?.type === 'module' ? 'prettier.config.js' : 'prettier.config.mjs',
      extends: '@langri-sha/prettier',
      ignorePatterns: ['.*', 'dist/'],
    }

    this.prettier = new Prettier(this, deepMerge(defaults, prettier))

    if (this.projenrc?.filePath) {
      this.prettier.ignore.include(this.projenrc.filePath)
    }

    if (this.package?.packageManager === javascript.NodePackageManager.PNPM) {
      this.prettier.ignore.addPatterns('pnpm-lock.yaml')
    }

    this.typeScriptConfig?.addFile(this.prettier!.path)
  }

  #configureProjenrc({ package: pkg }: ProjectOptions) {
    this.projenrc = new ProjenrcFile(this, {
      filename: pkg?.type === 'module' ? '.projenrc.ts' : '.projenrc.mts',
    })

    if (!this.parent) {
      this.typeScriptConfig?.addFile(this.projenrc.filePath)
    }
  }

  #configureReadme({ readme }: ProjectOptions) {
    if (!readme) {
      return
    }

    this.readme = new ReadmeFile(this, readme)
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
      lockFileMaintenance: {
        enabled: true,
      },
      packageRules: [
        {
          description: 'Prioritize updates in Projen configurations',
          matchFileNames: ['/\\.?projen.*\\.(js|cjs|mjs|ts|mts|cts)$/'],
          enabled: true,
        },
      ],
      customManagers: [
        {
          customType: 'regex',
          datasourceTemplate: 'node',
          depNameTemplate: 'node',
          versioningTemplate: 'node',
          currentValueTemplate: '>= {{currentValue}}',
          managerFilePatterns: ['/\\.?projen.*.(js|cjs|mjs|ts|mts|cts)$/'],
          matchStrings: ["minNodeVersion:\\s*'(?<currentValue>[^']+)'"],
        },
        {
          customType: 'regex',
          datasourceTemplate: 'npm',
          managerFilePatterns: ['/\\.?projen.*.(js|cjs|mjs|ts|mts|cts)$/'],
          matchStringsStrategy: 'recursive',
          matchStrings: [
            '\\.(?<depType>addDeps|addDevDeps|addPeerDeps)\\([^)]*\\)',
            "'(?<depName>@?[\\w-\\/]+)@(?<currentValue>[^']+)'",
          ],
          depTypeTemplate:
            "{{#if (equals depType 'addDeps')}}dependencies{{else if (equals depType 'addDevDeps')}}devDependencies{{else}}peerDependencies{{/if}}",
        },
        {
          customType: 'regex',
          datasourceTemplate: 'npm',
          managerFilePatterns: ['/\\.?projen.*.(js|cjs|mjs|ts|mts|cts)$/'],
          matchStringsStrategy: 'recursive',
          matchStrings: [
            '(?<depType>deps|devDeps|peerDeps):\\s*\\[[^\\]]*\\]',
            "'(?<depName>@?[\\w-\\/]+)@(?<currentValue>[^']+)'",
          ],
          depTypeTemplate:
            "{{#if (equals depType 'deps')}}dependencies{{else if (equals depType 'devDeps')}}devDependencies{{else}}peerDependencies{{/if}}",
        },
        {
          customType: 'regex',
          datasourceTemplate: 'npm',
          managerFilePatterns: ['/\\.?projen.*.(js|cjs|mjs|ts|mts|cts)$/'],
          matchStrings: ["pnpm@(?<currentValue>[^']+)"],
          depNameTemplate: 'pnpm',
          depTypeTemplate: 'dependencies',
        },
        {
          customType: 'regex',
          datasourceTemplate: 'npm',
          managerFilePatterns: ['/\\.(js|cjs|mjs|ts|mts|cts|ya?ml)$/'],
          matchStrings: [
            '(bun|p?np)x (?<depName>[\\w\\-\\/]+)@(?<currentValue>[^s]+)',
          ],
          depNameTemplate: 'pnpm',
          depTypeTemplate: 'dependencies',
        },
      ],
    }

    this.addTask('renovate', {
      description: 'Run Renovate locally for debugging',
      exec: 'pnpx renovate --platform=local --repository-cache=reset --dry-run=full',
    })

    this.renovate = new Renovate(this, deepMerge(defaults, renovateOptions))
  }

  #configureSWC({ swcrc, typeScriptConfig }: ProjectOptions) {
    if (!swcrc) {
      return
    }

    if (!this.parent) {
      this.package?.addDevDeps('@swc/core@1.13.3')
      this.package?.addDevDeps('@swc-node/register@1.10.10')
    }

    const defaults: SWCConfigOptions = {
      $schema: 'https://json.schemastore.org/swcrc',
      ...(typeScriptConfig
        ? {
            jsc: {
              parser: {
                syntax: 'typescript',
              },
            },
          }
        : {}),
      env: {
        targets: {
          node: 'current',
        },
      },
    }

    this.swcrc = new SWCConfig(this, deepMerge(defaults, swcrc))
  }

  #configureTypeScript({ parent, typeScriptConfig, swcrc }: ProjectOptions) {
    if (!typeScriptConfig) {
      return
    }

    const defaults: TypeScriptConfigOptions = parent
      ? {
          config: {
            extends: '@langri-sha/tsconfig/project',
          },
        }
      : {
          config: {
            extends: '@langri-sha/tsconfig',
          },
        }

    this.typeScriptConfig = new TypeScriptConfig(
      this,
      deepMerge(defaults, typeScriptConfig),
    )

    if (!this.parent) {
      this.package?.addDevDeps('typescript@5.5.4')

      if (!swcrc) {
        this.package?.addDevDeps('ts-node@10.9.2')
      }
    }

    if (this.name !== '@langri-sha/tsconfig') {
      this.package?.addDevDeps('@langri-sha/tsconfig@*')
    }
  }

  #populateTypeScriptProjectReferencesFromDependencies() {
    if (this.parent || !this.package || !this.typeScriptConfig) {
      return
    }

    const subprojects = this.allSubprojectsKind.filter(
      (project) => project.package && project.typeScriptConfig,
    )

    const root = path.dirname(this.package!.file.absolutePath)

    for (const project of subprojects) {
      const from = path.dirname(project.package!.file.absolutePath)

      if (project.name !== '@langri-sha/tsconfig') {
        this.typeScriptConfig!.addReference(path.relative(root, from))
      }

      for (const dep of project.deps.all) {
        const reference = subprojects.find(({ name }) => name === dep.name)

        if (!reference) {
          continue
        }

        const to = path.dirname(reference.package!.file.absolutePath)

        project.typeScriptConfig!.addReference(path.relative(from, to))
      }
    }
  }
}

const getGitIgnoreOptions = ({
  gitIgnoreOptions,
  husky: huskyOptions,
  parent,
  typeScriptConfig: typeScriptConfigOptions,
  withTerraform,
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
    dist/
    node_modules/
    `
            .split('\n')
            .map((pattern) => pattern.trim())
            .filter((pattern) => pattern.length > 0),
          ...(gitIgnoreOptions?.ignorePatterns ?? []),
        ],
      }

const deepMerge = R.mergeDeepWith(
  R.cond([
    // When both arguments are strings, use the right string.
    [R.allPass([R.is(String), R.is(String)]), R.nthArg(1)],
    // Otherwise, concatenate.
    [R.T, R.concat],
  ]),
)
