import path from 'node:path'
import { Component, type Project, TextFile } from 'projen'

type Hooks =
  | 'pre-commit'
  | 'applypatch-msg'
  | 'pre-applypatch'
  | 'post-applypatch'
  | 'pre-commit'
  | 'pre-merge-commit'
  | 'prepare-commit-msg'
  | 'commit-msg'
  | 'post-commit'
  | 'pre-rebase'
  | 'post-checkout'
  | 'post-merge'
  | 'pre-push'

/**
 * Husky options.
 */
export type HuskyOptions = {
  [hook in Hooks]?: string | string[]
}

/**
 * A component for maintaining Git hooks with Husky.
 */
export class Husky extends Component {
  constructor(project: Project, options?: HuskyOptions) {
    super(project)

    for (const [hook, commands] of Object.entries(options ?? {}).map(
      ([hook, commands]) =>
        [hook, Array.isArray(commands) ? commands : [commands]] as const,
    )) {
      const file = new TextFile(project, path.join('.husky', hook), {
        editGitignore: false,
        marker: true,
        readonly: true,
      })

      if (!project.ejected) {
        file.addLine(`# ${file.marker}`)
      }

      for (const command of commands) {
        file.addLine(command)
      }

      file.addLine('')
    }
  }
}
