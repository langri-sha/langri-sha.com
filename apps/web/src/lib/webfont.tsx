import WebFont from 'webfontloader'

const defaults = {
  classes: false,
  events: false,
}

export default (options: { families: string[]; text?: string }) =>
  WebFont.load({ ...defaults, google: options })
