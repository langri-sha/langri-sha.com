import {
  Project as BaseProject,
  type ProjectOptions as BaseProjectOptions,
  TextFile,
  YamlFile,
  javascript,
} from 'projen'

import * as R from 'ramda'
import { type BeachballConfig } from 'beachball'

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

export interface ProjectOptions
  extends Omit<BaseProjectOptions, 'renovatebot' | 'renovatebotOptions'> {
  /*
   * Pass in to set up Beachball.
   */
  beachballConfig?: BeachballConfig

  /*
   * Pass in to set up Beachball.
   */
  codeownersOptions?: CodeownersOptions

  /**
   * EditorConfig options.
   */
  editorConfigOptions?: EditorConfigOptions

  /**
   * Husky options.
   */
  huskyOptions?: HuskyOptions

  /*
   * Pass in to configure Renovate.
   */
  renovateOptions?: RenovateOptions

  /*
   * Options for the linting synthesized files.
   */
  lintSynthesizedOptions?: LintSynthesizedOptions

  /**
   * Package configuration options.
   */
  package?: javascript.NodePackageOptions

  /**
   * TypeScript configuration options.
   */
  typeScriptConfigOptions?: TypeScriptConfigOptions

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
  editorConfig?: EditorConfig
  husky?: Husky
  package?: javascript.NodePackage
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

    this.#configurePackage(options)
    this.#configureTypeScript(options)

    this.#configureBeachball(options)
    this.#configureCodeowners(options)
    this.#configureDefaultTask()
    this.#configureEditorConfig(options)
    this.#configureHusky(options)
    this.#configureLintSynthesized(options)
    this.#configureRenovate(options)
    this.#createPnpmWorkspaces(options)
  }

  #configureBeachball({ beachballConfig }: ProjectOptions) {
    if (!beachballConfig) {
      return
    }

    const options = deepMerge(beachballConfig, {
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

    const file = new TextFile(this, 'beachball.config.js', {
      readonly: true,
      marker: true,
    })

    for (const line of [
      `/** @type {import('beachball').BeachballConfig} */`,
      `module.exports = ${JSON.stringify(options, null, 2)}`,
    ]) {
      file.addLine(line)
    }

    this.package?.addDevDeps('beachball@2.43.1')
    this.typeScriptConfig?.addFile('beachball.config.js')
  }

  #configureCodeowners({ codeownersOptions }: ProjectOptions) {
    if (!codeownersOptions) {
      return
    }

    new Codeowners(this, codeownersOptions)
  }

  #configureDefaultTask() {
    this.tasks
      .tryFind('default')
      ?.exec(`node --loader ts-node/esm .projenrc.mts`)
  }

  #configureEditorConfig({ editorConfigOptions }: ProjectOptions) {
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
  }

  #configureHusky({ huskyOptions }: ProjectOptions) {
    if (!huskyOptions || this.parent) {
      return
    }

    this.husky = new Husky(this, huskyOptions)

    this.package?.addDevDeps('husky@9.0.11')
    this.package?.setScript('prepare', 'husky')
    this.tryFindObjectFile('package.json')?.addDeletionOverride('pnpm')
  }

  #configureLintSynthesized({ lintSynthesizedOptions }: ProjectOptions) {
    new LintSynthesized(
      this,
      lintSynthesizedOptions ?? {
        '*.{js,jsx,ts,tsx}': 'pnpm eslint --fix',
        '*.json': 'pnpx sort-package-json',
        '*': 'pnpm prettier --write --ignore-unknown',
      },
    )
  }

  #configurePackage({ package: pkg }: ProjectOptions) {
    if (!pkg) {
      return
    }

    const defaults: javascript.NodePackageOptions = {
      entrypoint: 'src/index.ts',
      packageManager: javascript.NodePackageManager.PNPM,
      minNodeVersion: '20.12.0',
    }

    this.package = new javascript.NodePackage(this, deepMerge(defaults, pkg))

    if (!this.parent) {
      this.package.addDevDeps('@langri-sha/projen-project@*')
      this.package.addDevDeps('projen@0.81.11')
    }
  }

  #configureRenovate({ renovateOptions }: ProjectOptions) {
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
          fileMatch: ['projen.*.(js|cjs|mjs|ts|mts|cts)$'],
          matchStrings: [
            "\\.add[\\w]*Deps\\('(?<depName>[a-zA-Z0-9-]+)@(?<currentValue>[^']+)'\\)",
          ],
        },
      ],
    }

    this.renovate = new Renovate(this, deepMerge(defaults, renovateOptions))
  }

  #configureTypeScript({ typeScriptConfigOptions }: ProjectOptions) {
    if (!typeScriptConfigOptions) {
      return
    }

    const defaults: TypeScriptConfigOptions = {
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
  }
}

const getGitIgnoreOptions = ({
  huskyOptions,
  typeScriptConfigOptions,
  withTerraform,
  ...options
}: ProjectOptions): ProjectOptions['gitIgnoreOptions'] => ({
  ...options.gitIgnoreOptions,
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
    !.projenrc*
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
    ...(options.gitIgnoreOptions?.ignorePatterns ?? []),
  ],
})

const deepMerge = R.mergeDeepWith(R.concat)
