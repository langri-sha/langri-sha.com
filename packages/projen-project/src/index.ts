import {
  Project as BaseProject,
  type ProjectOptions as BaseProjectOptions,
  YamlFile,
} from 'projen'

export interface ProjectOptions extends BaseProjectOptions {
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

    this.#createPnpmWorkspaces(options)
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
