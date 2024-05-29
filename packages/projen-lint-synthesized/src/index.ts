import { Component, Project } from 'projen'
import * as path from 'node:path'
import createDebug from 'debug'

import * as fs from 'node:fs'

import { execaSync } from 'execa'
import { minimatch } from 'minimatch'

const debug = createDebug('projen-lint-synthesized')

export interface LintSynthesizedOptions {
  [pattern: string]: string | ((files: string[]) => string)
}

/**
 * A component that lints synthesized files.
 */
export class LintSynthesized extends Component {
  #options?: LintSynthesizedOptions

  constructor(
    scope: ConstructorParameters<typeof Component>[0],
    options?: LintSynthesizedOptions,
  ) {
    super(scope, 'lint-synthesized')

    this.#options = options

    debug('Initialized')
  }

  override postSynthesize(): void {
    super.postSynthesize()

    debug('Commencing lints on synthesized files')

    const fileInfo = getAllFiles(this.project)
    const paths = Object.keys(fileInfo)

    debug(`Found ${paths.length} synthesized files`)

    const tasks = Object.entries(this.#options || {})
      .map(([pattern, command]) => ({
        pattern,
        command,
        files: minimatch.match(paths, pattern, {
          dot: true,
          matchBase: !pattern.includes('/'),
        }),
      }))
      .filter(({ files }) => files.length)

    for (const { files } of tasks) {
      for (const file of files) {
        fs.chmodSync(fileInfo[file].absolutePath, 0o755)
      }
    }

    for (const { pattern, command, files } of tasks) {
      debug(`Running command ${files.length} files matching pattern ${pattern}`)

      try {
        this.#run(files, command)
      } catch {
        // Let `execa` log errors.
      }
    }

    for (const { files } of tasks) {
      for (const file of files) {
        const { absolutePath, mode } = fileInfo[file]

        fs.chmodSync(absolutePath, mode)
      }
    }
  }

  #run(files: string[], command: string | ((files: string[]) => string)) {
    const task =
      typeof command === 'string'
        ? `${command} ${files.join(' ')}`
        : command(files)

    debug(`Running command ${task}`)

    execaSync(task, {
      shell: true,
      stdio: 'inherit',
      cwd: this.project.outdir,
    })
  }
}

const getAllFiles = (root: Project) => {
  const projects = getProjects(root)
  const files = []

  for (const project of projects) {
    const current = project.files
      .filter((file) => fs.existsSync(file.absolutePath))
      .map(
        (file) =>
          [
            path.relative(root.outdir, file.absolutePath),
            {
              file,
              absolutePath: file.absolutePath,
              mode: fs.statSync(file.absolutePath).mode,
            },
          ] as const,
      )

    files.push(...current)
  }

  return Object.fromEntries(files)
}

const getProjects = (root: Project) => {
  const projects: Project[] = []
  const processing = [root]

  while (processing.length) {
    const project = processing.pop()

    if (!project) {
      break
    }

    projects.push(project)
    processing.push(...(project?.subprojects ?? []))
  }

  return projects
}
