import {
  Project as BaseProject,
  type ProjectOptions as BaseProjectOptions,
  TextFile,
  YamlFile,
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

export interface ProjectOptions extends BaseProjectOptions {
  /*
   * Pass in to set up Beachball.
   */
  beachballConfig?: BeachballConfig

  /**
   * EditorConfig options.
   */
  editorConfigOptions?: EditorConfigOptions

  /*
   * Options for the linting synthesized files.
   */
  lintSynthesizedOptions?: LintSynthesizedOptions
  /*
   * Whether to use Terrafom.
   */
  withTerraform?: boolean

  /*
   * Whether to use TypeScript.
   */
  withTypeScript?: boolean

  /*
   * PNPM workspaces to generate.
   */
  workspaces?: string[]
}

export class Project extends BaseProject {
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

    this.#configureBeachball(options)
    this.#configureDefaultTask()
    this.#configureEditorConfig(options)
    this.#configureLintSynthesized(options)
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
  }

  #configureDefaultTask() {
    this.tasks
      .tryFind('default')
      ?.exec(`node --loader ts-node/esm .projenrc.mts`)
  }

  #configureLintSynthesized({ lintSynthesizedOptions }: ProjectOptions) {
    new LintSynthesized(
      this,
      lintSynthesizedOptions ?? {
        '*.{js,jsx,ts,tsx}': 'pnpm eslint --fix',
        '*': 'pnpm prettier --write --ignore-unknown',
      },
    )
  }

  #configureEditorConfig({ editorConfigOptions }: ProjectOptions) {
    if (!editorConfigOptions) {
      return
    }

    const defaults: EditorConfigOptions = {
      '*': {
        // eslint-disable-next-line unicorn/text-encoding-identifier-case
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

    new EditorConfig(this, deepMerge(editorConfigOptions ?? {}, defaults))
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
  withTerraform,
  withTypeScript,
  ...options
}: ProjectOptions): ProjectOptions['gitIgnoreOptions'] => ({
  ...options.gitIgnoreOptions,
  ignorePatterns: [
    ...`
    .*
    !.babelrc
    !.dockerignore
    !.editorconfig
    !.eslintignore
    !.eslintrc.js
    !.gitattributes
    !.gitignore
    !.gitkeep
    !.husky
    !.npmignore
    !.openssl
    !.prettierignore
    !.projenrc*
    ${withTerraform ? '!.terraform.lock.hcl' : ''}
    *.db
    *.log
    ${withTypeScript ? '*.tsbuildinfo' : ''}

    !.github/
    !.husky/
    !.projen/
    dist/
    local/
    node_modules/
    `
      .split('\n')
      .map((pattern) => pattern.trim())
      .filter((pattern) => pattern.length > 0),
    ...(options.gitIgnoreOptions?.ignorePatterns ?? []),
  ],
})

const deepMerge = R.mergeDeepWith(R.concat)
