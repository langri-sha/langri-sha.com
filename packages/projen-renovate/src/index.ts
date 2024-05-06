import { type RenovateConfig } from 'renovate/dist/config/types'

import { Component, JsonFile, type Project } from 'projen'

/**
 * Renovate configuration options.
 */
export interface RenovateOptions extends RenovateConfig {}

/**
 * A component for managing Renovate configurations.
 */
export class Renovate extends Component {
  constructor(project: Project, options?: RenovateOptions) {
    super(project)

    new JsonFile(project, 'renovate.json5', {
      obj: {
        $schema: 'https://docs.renovatebot.com/renovate-schema.json',
        ...options,
      },
    })
  }
}
