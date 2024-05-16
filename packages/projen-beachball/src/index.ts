import { type BeachballConfig } from 'beachball'
import { Component, Project, TextFile } from 'projen'

/**
 * Options for configuring Beachball.
 */
export interface BeachballOptions extends BeachballConfig {}

export class Beachball extends Component {
  constructor(project: Project, options?: BeachballOptions) {
    super(project)

    const file = new TextFile(this, 'beachball.config.js', {
      readonly: true,
      marker: true,
    })

    for (const line of [
      `/** @type {import('beachball').BeachballConfig} */`,
      `module.exports = ${JSON.stringify(options ?? {}, null, 2)}`,
    ]) {
      file.addLine(line)
    }
  }
}
