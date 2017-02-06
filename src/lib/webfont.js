// @flow
import WebFont from 'webfontloader'

const defaults = {
  classes: false,
  events: false
}

export default function (options: {families: string[], text: ?string}) {
  return WebFont.load(Object.assign({}, defaults, {google: options}))
}
