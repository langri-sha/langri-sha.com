import { type BeachballConfig } from 'beachball'
import { Project, TextFile } from 'projen'

/**
 * Options for configuring Beachball.
 */
export interface BeachballOptions {
  filename?: string
  config?: BeachballConfig
}

export class Beachball extends TextFile {
  constructor(
    project: Project,
    { filename = 'beachball.config.cjs', config }: BeachballOptions = {},
  ) {
    super(project, filename, {
      readonly: true,
      marker: true,
    })

    for (const line of [
      `/** @type {import('beachball').BeachballConfig} */`,
      `module.exports = ${JSON.stringify(config ?? {}, null, 2)}`,
    ]) {
      this.addLine(line)
    }

    project.addTask('change', {
      description: 'Generate Beachball change files',
      exec: 'beachball change',
    })
  }
}
