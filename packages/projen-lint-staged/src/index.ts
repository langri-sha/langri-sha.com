import type { Config } from 'prettier'
import { FileBase, IResolver, Project } from 'projen'
import serialize from 'serialize-javascript'

/**
 * Options for configuring Prettier.
 */
export interface LintStagedOptions {
  /**
   * Name of the Prettier config module.
   *
   * @default 'lint-staged.config.js'
   */
  filename?: string

  /**
   * Name of the `lint-staged` configuration package to extend from.
   */
  extends?: string

  /**
   * `lint-staged` configuration.
   */
  config?: Config
}

export class LintStaged extends FileBase {
  #extends?: string
  config: Config

  constructor(project: Project, options: LintStagedOptions = {}) {
    const filename = options.filename ?? 'lint-staged.config.js'

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

    return `${
      this.#extends ? `import defaults from '${this.#extends}'\n\n` : ''
    }/** @type {import('lint-staged').Config} */
    const config = {
      ${this.#extends ? `...defaults,` : ''}
      ${serialized.slice(1)}

    export default config
    `
  }
}
