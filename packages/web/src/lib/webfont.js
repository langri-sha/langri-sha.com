// @flow
import WebFont from 'webfontloader'

const defaults = {
  classes: false,
  events: false
}

export default (options: { families: string[], text: ?string }): Promise<$FlowFixMe> =>
  WebFont.load({ ...defaults, google: options })
