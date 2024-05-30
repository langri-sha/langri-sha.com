import type { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from '@schemastore/tsconfig'
import { IResolver, JsonFile, Project } from 'projen'

export interface TypeScriptConfigOptions {
  fileName?: string

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
}

export class TypeScriptConfig extends JsonFile {
  constructor(project: Project, options: TypeScriptConfigOptions) {
    const fileName = options.fileName ?? 'tsconfig.json'

    super(project, fileName, {
      allowComments: true,
      obj: {
        $schema: 'https://json.schemastore.org/tsconfig',
        ...options?.config,
      },
    })
  }

  protected override synthesizeContent(
    resolver: IResolver,
  ): string | undefined {
    const content = super.synthesizeContent(resolver)

    if (!content) {
      return
    }

    const pattern = /{[\s\S]*}/

    const matched = content.match(pattern)?.[0]

    if (!matched) {
      return
    }

    const config = JSON.parse(
      matched,
    ) as Required<TypeScriptConfigOptions>['config']

    config.references?.sort((a, b) => a.path.localeCompare(b.path))

    const json = JSON.stringify(config, null, 2)

    return content.replace(pattern, json)
  }

  /**
   * Appends to the list of filenames and patterns to exclude in the program.
   */
  addExclude(...fileNamesOrPatterns: string[]) {
    this.addToArray('exclude', ...fileNamesOrPatterns)
  }

  /**
   * Appends to the list of filenames and patterns to include in the program.
   */
  addInclude(...fileNamesOrPatterns: string[]) {
    this.addToArray('include', ...fileNamesOrPatterns)
  }

  /**
   * Appends to the list of filenames to include in the program.
   */
  addFile(...fileNames: string[]) {
    this.addToArray('files', ...fileNames)
  }

  /**
   * Adds a reference project.
   */
  addReference(...paths: string[]) {
    this.addToArray(
      'references',
      ...paths.map((path) => ({
        path,
      })),
    )
  }
}
