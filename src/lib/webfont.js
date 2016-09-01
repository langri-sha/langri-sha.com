import WebFont from 'webfontloader'

const defaults = {
  classes: false,
  events: false
}

export default function (options) {
  return WebFont.load(Object.assign({}, defaults, {google: options}))
}
