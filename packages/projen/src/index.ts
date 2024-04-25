import {
  Project as BaseProject,
  type ProjectOptions as BaseProjectOptions,
} from 'projen'

export interface ProjectOptions extends BaseProjectOptions {}

export class Project extends BaseProject {
  constructor(options: ProjectOptions) {
    super(options)
  }
}
