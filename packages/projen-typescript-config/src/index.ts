import type { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from '@schemastore/tsconfig'
import { Component, JsonFile, Project } from 'projen'

export interface TypeScriptConfigOptions {
  config?: JSONSchemaForTheTypeScriptCompilerSConfigurationFile
  fileName?: string
}

export class TypeScriptConfig extends Component {
  #options: Required<TypeScriptConfigOptions>

  constructor(project: Project, options: TypeScriptConfigOptions) {
    const fileName = options.fileName ?? 'tsconfig.json'

    super(project, fileName)

    this.#options = {
      config: options.config ?? {},
      fileName,
    }

    new JsonFile(this, 'tsconfig.json', {
      allowComments: true,
      obj: {
        $schema: 'http://json.schemastore.org/tsconfig',
        ...this.#options.config,
      },
    })
  }
}
