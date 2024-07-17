import licenseOMatic, { type Spdx } from 'license-o-matic'
import { FileBase, type IResolver, Project } from 'projen'

export interface LicenseOptions {
  /**
   * Name of tile license file.
   *
   * @default "license"
   */
  readonly filename?: string

  /**
   * License identifier.
   */
  readonly spdx: Spdx | string

  /**
   * Copyright year.
   */
  readonly year: string

  /**
   * Copyright holder.
   */
  readonly copyrightHolder: string
}

export class License extends FileBase {
  #text: string

  constructor(
    project: Project,
    { copyrightHolder, filename = 'license', spdx, year }: LicenseOptions,
  ) {
    super(project, filename, {
      marker: false,
      committed: true,
    })

    this.#text = licenseOMatic.getLicense(spdx.toLowerCase())({
      copyrightHolder,
      year,
    })
  }

  protected synthesizeContent(_: IResolver): string | undefined {
    return this.#text
  }
}
