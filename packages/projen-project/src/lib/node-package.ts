import * as fs from 'node:fs'
import { Project, javascript } from 'projen'

/**
 * Options for configuring Node.js packages.
 */
export interface NodePackageOptions extends javascript.NodePackageOptions {}

/**
 * Custom Node.js package manager that preserves package.
 */
export class NodePackage extends javascript.NodePackage {
  constructor(project: Project, options?: NodePackageOptions) {
    super(project, options)

    this.addVersion(this.#getPackageJson().version)
  }

  #getPackageJson() {
    try {
      return JSON.parse(fs.readFileSync(this.file.absolutePath, 'utf-8'))
    } catch (_) {
      return '0.0.0'
    }
  }
}
