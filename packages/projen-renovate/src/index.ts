import { Component, JsonFile, type Project } from 'projen'

import { type JSONSchemaForRenovateConfigFilesHttpsRenovatebotCom } from './renovate'

/**
 * Renovate configuration options.
 */
export interface RenovateOptions
  extends JSONSchemaForRenovateConfigFilesHttpsRenovatebotCom {}

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
