import * as fs from 'node:fs'

import { Project, javascript } from 'projen'

/**
 * Options for configuring Node.js packages.
 */
export interface NodePackageOptions extends javascript.NodePackageOptions {
  peerDependenciesMeta?: Record<string, { optional?: boolean }>
  type?: 'commonjs' | 'module'
}

/**
 * Custom Node.js package manager that preserves package.
 */
export class NodePackage extends javascript.NodePackage {
  constructor(project: Project, options?: NodePackageOptions) {
    super(project, options)

    this.addVersion(this.#getPackageJson()?.version ?? '0.0.0')

    if (options?.type) {
      this.addField('type', options.type)
    }

    if (options?.peerDependenciesMeta) {
      this.addField('peerDependenciesMeta', options.peerDependenciesMeta)
    }

    // Reset, so we can run `pnpx projen` on CI after Renovate upgrades.
    this.project.tasks
      .tryFind('install:ci')
      ?.reset(this.project.tasks.tryFind('install')?.steps[0]?.exec)
  }

  #getPackageJson() {
    try {
      return JSON.parse(fs.readFileSync(this.file.absolutePath, 'utf-8'))
    } catch (_) {
      return undefined
    }
  }

  override postSynthesize(): void {
    if (this.project.parent) {
      return
    }

    super.postSynthesize()
  }
}
