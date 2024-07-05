import { type SwcConfigurationSchema } from './swcrc'
import { JsonFile, type Project } from 'projen'

/**
 * SWC configuration options.
 */
export type SWCConfigOptions = SwcConfigurationSchema

/**
 * A component for managing Renovate configurations.
 */
export class SWCConfig extends JsonFile {
  constructor(project: Project, options?: SWCConfigOptions) {
    super(project, '.swcrc', {
      // NB: SWC errs on unknown property `//`.
      marker: false,

      obj: {
        $schema: 'https://swc.rs/schema.json',
        ...options,
      },
    })
  }
}
