import { Project, SampleFile } from 'projen'

/**
 * Initial `README` for new packages.
 */
export interface ReadmeFileOptions {
  readonly filename?: string
}

/**
 * Initial `README` for new packages.
 */
export class ReadmeFile extends SampleFile {
  constructor(
    project: Project,
    { filename = 'README.md' }: ReadmeFileOptions = {},
  ) {
    super(project, filename, {
      contents: `# ${project.name}\n`,
    })
  }
}
