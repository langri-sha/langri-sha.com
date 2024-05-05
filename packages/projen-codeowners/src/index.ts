import { Component, type Project, TextFile } from 'projen'

/**
 * Codeowners options.
 */
export interface CodeownersOptions {
  [pattern: string]: string | string[]
}

/**
 * A component for maintaining the CODEOWNERS file.
 */
export class Codeowners extends Component {
  constructor(project: Project, options?: CodeownersOptions) {
    super(project)

    new TextFile(project, 'CODEOWNERS', {
      marker: true,
      readonly: true,
      lines: Object.entries(options ?? {})
        .map(
          ([pattern, owners]) =>
            [pattern, Array.isArray(owners) ? owners : [owners]] as const,
        )
        .map(([pattern, owners]) => `${pattern} ${owners.join(' ')}`),
    })
  }
}
