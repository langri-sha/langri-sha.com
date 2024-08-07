import type { Config } from 'prettier'
import { FileBase, IResolver, IgnoreFile, Project } from 'projen'
import serialize from 'serialize-javascript'

/**
 * Options for configuring Prettier.
 */
export interface PrettierOptions {
  /**
   * Name of the Prettier config module.
   *
   * @default 'prettier.config.js'
   */
  readonly filename?: string

  /**
   * Name of the Prettier configuration package to extend from.
   */
  readonly extends?: string

  /**
   * Ignore patterns.
   */
  readonly ignorePatterns?: string[]

  /**
   * Prettier configuration object.
   */
  readonly config?: Config
}

export class Prettier extends FileBase {
  #extends?: string
  ignore: IgnoreFile
  config: Config

  constructor(project: Project, options: PrettierOptions = {}) {
    const filename = options.filename ?? 'prettier.config.js'

    super(project, filename, {
      readonly: true,
      marker: true,
    })

    this.#extends = options.extends
    this.config = options.config ?? {}
    this.ignore = new IgnoreFile(project, '.prettierignore', {
      ignorePatterns: options.ignorePatterns,
    })
  }

  protected override synthesizeContent(_: IResolver): string | undefined {
    const config: Config = {
      ...this.config,
    }

    const serialized = serialize(config, {
      unsafe: true,
    })

    return `${
      this.#extends ? `import defaults from '${this.#extends}'\n\n` : ''
    }/** @type {import("prettier").Config} */
    const config = {
      ${this.#extends ? `...defaults,` : ''}
      ${serialized.slice(1)}

    export default config
    `
  }
}
