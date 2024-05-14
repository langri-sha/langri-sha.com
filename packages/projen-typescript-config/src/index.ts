import type { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from '@schemastore/tsconfig'
import { Component, JsonFile, Project } from 'projen'

export interface TypeScriptConfigOptions {
  config?: JSONSchemaForTheTypeScriptCompilerSConfigurationFile & {
    /**
     * Referenced projects. Requires TypeScript version 3.0 or later.
     */
    references?: {
      /**
       * Path to referenced tsconfig or to folder containing tsconfig.
       */
      path: string
    }[]
  }
  fileName?: string
}

export class TypeScriptConfig extends Component {
  #file: JsonFile
  #options: Required<TypeScriptConfigOptions>

  constructor(project: Project, options: TypeScriptConfigOptions) {
    const fileName = options.fileName ?? 'tsconfig.json'

    super(project, fileName)

    this.#options = {
      config: options.config ?? {},
      fileName,
    }

    this.#file = new JsonFile(this, 'tsconfig.json', {
      allowComments: true,
      obj: {
        $schema: 'http://json.schemastore.org/tsconfig',
        ...this.#options.config,
      },
    })
  }

  /**
   * Appends to the list of filenames and patterns to exclude in the program.
   */
  addExclude(...fileNamesOrPatterns: string[]) {
    this.#file.addToArray('exclude', ...fileNamesOrPatterns)
  }

  /**
   * Appends to the list of filenames and patterns to include in the program.
   */
  addInclude(...fileNamesOrPatterns: string[]) {
    this.#file.addToArray('include', ...fileNamesOrPatterns)
  }

  /**
   * Appends to the list of filenames to include in the program.
   */
  addFile(...fileNames: string[]) {
    this.#file.addToArray('files', ...fileNames)
  }

  /**
   * Adds a reference project.
   */
  addReference(...paths: string[]) {
    this.#file.addToArray(
      'references',
      ...paths.map((path) => ({
        path,
      })),
    )
  }
}
