import * as path from 'node:path'

import { type IResolver, Project, YamlFile, javascript } from 'projen'
import YAML from 'yaml'

/**
 * Options for maintaining a PNPM workspace.
 */
export interface PnpmWorkspaceOptions {
  /**
   * Name of the workspace configuration file.
   *
   * @default 'pnpm-workspace.yaml'
   */
  readonly filename?: string

  /**
   * List of package paths.
   */
  readonly packages?: string[]
}

export class PnpmWorkspace extends YamlFile {
  constructor(project: Project, options: PnpmWorkspaceOptions = {}) {
    const filename = options.filename ?? 'pnpm-workspace.yaml'

    super(project, filename, {
      readonly: true,
      marker: true,
      obj: {
        packages: [...(options.packages ?? [])],
      },
    })
  }

  override preSynthesize(): void {
    const packages = this.project.subprojects
      .map((project) =>
        project.node
          .findAll(1)
          .filter(
            (file): file is javascript.NodePackage =>
              file instanceof javascript.NodePackage,
          ),
      )
      .flat()
      .map((pkg) =>
        path.relative(this.project.outdir, path.dirname(pkg.file.absolutePath)),
      )

    for (const pkg of packages) {
      if (
        packages
          .filter((other) => other !== pkg)
          .some((other) => path.dirname(other) === path.dirname(pkg))
      ) {
        this.addPackages(path.join(path.dirname(pkg), '*'))
      } else {
        this.addPackages(pkg)
      }
    }
  }

  protected override synthesizeContent(
    resolver: IResolver,
  ): string | undefined {
    const yaml = super.synthesizeContent(resolver)

    if (!yaml) {
      return
    }

    const parsed: Writable<
      Required<Exclude<PnpmWorkspaceOptions, 'filename'>>
    > = YAML.parse(yaml)

    parsed.packages = [...new Set(parsed.packages)]
    parsed.packages.sort()

    return [
      ...(this.marker ? [`# ${this.marker}`, ''] : []),
      YAML.stringify(parsed, {
        indent: 2,
        lineWidth: this.lineWidth,
      }),
    ].join('\n')
  }

  addPackages(...packages: string[]): void {
    for (const pkg of packages) {
      this.addToArray('packages', pkg)
    }
  }
}

type Writable<T> = {
  -readonly [K in keyof T]: T[K]
}
