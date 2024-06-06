import { type IResolver, Project, YamlFile } from 'projen'
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
  filename?: string

  /**
   * List of package paths.
   */
  packages?: string[]
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

  protected override synthesizeContent(
    resolver: IResolver,
  ): string | undefined {
    const yaml = super.synthesizeContent(resolver)

    if (!yaml) {
      return
    }

    const parsed: Required<Exclude<PnpmWorkspaceOptions, 'filename'>> =
      YAML.parse(yaml)

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

  addPackages(...packages: string[]) {
    for (const pkg of packages) {
      this.addToArray('packages', pkg)
    }
  }
}
