import { FileBase, IResolver, Project } from 'projen'
import serialize from 'serialize-javascript'

/**
 * Options for configuring ESLint.
 */
export interface ESLintOptions {
  /**
   * Name of the ESLint config module.
   *
   * @default 'eslint.config.js'
   */
  readonly filename?: string

  /**
   * Name of the ESLint configuration package to extend from.
   */
  readonly extends?: string

  /**
   * Ignore patterns.
   */
  readonly ignorePatterns?: string[]

  /**
   * Prettier configuration object.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly config?: any[]
}

export class ESLint extends FileBase {
  #extends?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any[]
  ignorePatterns: string[]

  constructor(project: Project, options: ESLintOptions = {}) {
    const filename = options.filename ?? 'eslint.config.js'

    super(project, filename, {
      readonly: true,
      marker: true,
    })

    this.#extends = options.extends
    this.config = options.config ?? []
    this.ignorePatterns = options.ignorePatterns ?? []
  }

  protected override synthesizeContent(_: IResolver): string | undefined {
    const config = [
      ...(this.ignorePatterns.length
        ? [
            {
              ignores: this.ignorePatterns,
            },
          ]
        : []),
      ...this.config,
    ]

    const serialized = serialize(config, {
      unsafe: true,
    })

    return `${this.#extends ? `import defaults from '${this.#extends}'\n\n` : ''}export default ${this.#extends ? '[...defaults, ' : '['}${serialized.slice(1)}`
  }
}
