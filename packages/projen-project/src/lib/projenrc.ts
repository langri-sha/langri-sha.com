import { ProjenrcFile as BaseProjenrcFile, Project, SampleFile } from 'projen'

export interface ProjenrcOptions {
  /**
   * The name of the projenrc file.
   * @default ".projenrc.mts"
   */
  readonly filename?: string
}

export class ProjenrcFile extends BaseProjenrcFile {
  public override readonly filePath: string

  constructor(
    project: Project,
    { filename = '.projenrc.mts' }: ProjenrcOptions,
  ) {
    super(project)

    this.filePath = filename
    this.project.defaultTask?.exec(
      `node --loader ts-node/esm/transpile-only ${filename}`,
    )

    new SampleFile(project, filename, {
      contents: `import { Project } from '@langri-sha/projen-project'

      const project = new Project()

      project.synth()
      `,
    })
  }
}
