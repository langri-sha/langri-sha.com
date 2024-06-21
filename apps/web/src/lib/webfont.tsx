import WebFont from 'webfontloader'

const defaults = {
  classes: false,
  events: false,
}

export const webfont: (options: {
  families: string[]
  text?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) => any = (options) => WebFont.load({ ...defaults, google: options })
