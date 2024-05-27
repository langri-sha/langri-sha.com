import { FileBase, IResolver, Project } from 'projen'
import { Config } from 'jest'
import serialize from 'serialize-javascript'

/**
 * Options for configuring Jest.
 */
export interface JestConfigOptions {
  /**
   * Name of the Jest config module.
   *
   * @default 'jest.config.ts'
   */
  filename?: string

  /**
   * Name of a Jest configuration package to extend from.
   */
  extends?: string

  /**
   * Jest configuration object.
   */
  config?: Config
}

export class JestConfig extends FileBase {
  #extends?: string
  config: Config

  constructor(project: Project, options: JestConfigOptions = {}) {
    const filename = options.filename ?? 'jest.config.ts'

    super(project, filename, {
      readonly: true,
      marker: true,
    })

    this.#extends = options.extends
    this.config = options.config ?? {}
  }

  protected override synthesizeContent(_: IResolver): string | undefined {
    const config: Config = {
      ...this.config,
    }

    const serialized = serialize(config, {
      unsafe: true,
    })

    return `import type { Config } from 'jest'${this.#extends ? `\nimport defaults from '${this.#extends}'` : ''}

    const config: Config = {
      ${this.#extends ? `...defaults,` : ''}
      ${serialized.slice(1)}

    export default config
    `
  }
}
