import {
  Project as BaseProject,
  type ProjectOptions as BaseProjectOptions,
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
}

export class Project extends BaseProject {
  constructor(options: ProjectOptions) {
    super({
      ...options,
      gitIgnoreOptions: getGitIgnoreOptions(options),
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
