import { Component } from 'projen'
import { debug as createDebug } from 'debug'

const debug = createDebug('projen-lint-synthesized')

export class LintSynthesized extends Component {
  constructor(scope: ConstructorParameters<typeof Component>[0]) {
    super(scope, 'lint-synthesized')

    debug('Initialized')
  }

  override postSynthesize(): void {
    super.postSynthesize()

    debug('Commencing lints on synthesized files')
  }
}
