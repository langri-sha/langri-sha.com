import serialize from 'serialize-javascript'
import type { TransformOptions } from '@babel/core'
import { FileBase, IResolver, Project } from 'projen'

/**
 * Options for configuring Babel.
 */
export interface BabelOptions {
  /**
   * Name of the Babel config module.
   *
   * @default 'babel.config.js'
   */
  filename?: string

  /**
   * Whether to output a config function, and the code to be executed.
   */
  configApiFunction?: string

  /**
   * Options for transforming Babel.
   */
  options?: TransformOptions
}

export class Babel extends FileBase {
  #configApiFunction: string | undefined
  options: TransformOptions

  constructor(project: Project, options: BabelOptions = {}) {
    const filename = options.filename ?? 'babel.config.js'

    super(project, filename, {
      readonly: true,
      marker: true,
    })

    this.#configApiFunction = options.configApiFunction
    this.options = options.options ?? {}
  }

  protected override synthesizeContent(_: IResolver): string | undefined {
    let lines

    if (this.#configApiFunction !== undefined) {
      lines = [
        `/** @type {import('@babel/core').ConfigFunction} */`,
        `const config = (api) => {`,
        this.#configApiFunction ? `${this.#configApiFunction}\n` : '',
        `return ${serialize(this.options, { space: 2, unsafe: true })}`,
        `}\n`,
        `module.exports = config\n`,
      ].filter(Boolean)
    } else {
      lines = [
        `/** @type {import('@babel/core').TransformOptions} */`,
        `const config = ${serialize(this.options, { space: 2, unsafe: true })}\n`,
        `module.exports = config\n`,
      ]
    }

    return lines.join('\n')
  }
}
