import type { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from '@schemastore/tsconfig'
import { IResolver, JsonFile, Project } from 'projen'

export interface TypeScriptConfigOptions {
  readonly fileName?: string

  readonly config?: JSONSchemaForTheTypeScriptCompilerSConfigurationFile & {
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

    if (config.references) {
      config.references.sort((a, b) => a.path.localeCompare(b.path))

      const deduped = Object.values(
        config.references.reduce(
          (acc, item) => {
            acc[item.path] = item
            return acc
          },
          {} as Record<string, { path: string }>,
        ),
      )

      config.references = deduped
    }

    if (Array.isArray(config.files)) {
      config.files.sort()
      config.files = [...new Set(config.files)]
    }

    const json = JSON.stringify(config, null, 2)

    return content.replace(pattern, json)
  }

  /**
   * Appends to the list of filenames and patterns to exclude in the program.
   */
  addExclude(...fileNamesOrPatterns: string[]): void {
    this.addToArray('exclude', ...fileNamesOrPatterns)
  }

  /**
   * Appends to the list of filenames and patterns to include in the program.
   */
  addInclude(...fileNamesOrPatterns: string[]): void {
    this.addToArray('include', ...fileNamesOrPatterns)
  }

  /**
   * Appends to the list of filenames to include in the program.
   */
  addFile(...fileNames: string[]): void {
    this.addToArray('files', ...fileNames)
  }

  /**
   * Adds a reference project.
   */
  addReference(...paths: string[]): void {
    this.addToArray(
      'references',
      ...paths.map((path) => ({
        path,
      })),
    )
  }
}
