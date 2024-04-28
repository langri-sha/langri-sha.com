import { Component, type Project } from 'projen'
import { debug as createDebug } from 'debug'

const debug = createDebug('projen-lint-synthesized')

export class LintSynthesized extends Component {
  constructor(parent: Project) {
    super(parent, 'lint-synthesized')

    debug('Initialized')
  }

  override postSynthesize(): void {
    super.postSynthesize()

    debug('Commencing lints on synthesized files')
  }
}
