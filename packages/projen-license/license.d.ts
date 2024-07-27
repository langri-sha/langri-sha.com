declare module 'license-o-matic' {
  export type Spdx =
    | 'mit'
    | 'apache-2.0'
    | 'gpl-3.0-only'
    | 'mpl-2.0'
    | 'unlicense'
    | 'lgpl-3.0-only'
    | 'isc'
    | 'abstyles-license'
    | 'academic-free-license-v3'
    | 'apple-public-source-license-2.0'
    | 'attribution-assurance-license'
    | 'bsd-zero-clause-license'
    | 'eclipse-public-license-version-2.0'
    | 'educational-community-license-v-2.0(ecl-2.0).js'
    | 'mozilla-public-license-2.0(mpl-2.0)'
    | 'open-software-license-3.0(osl-3.0)'
    | 'sun-public-license-version-1.0(spl-1.0)'

  const _default: {
    getIdentifiers(): Spdx[]
    getLicense(
      spdx: Spdx | string,
    ): ({ copyrightHolder: string, year: string }) => string
  }

  export = _default
}
