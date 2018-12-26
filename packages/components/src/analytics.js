// @flow
import * as React from 'react'

declare function ga(...any[]): void

window.ga =
  window.ga ||
  function(...args) {
    ga.q = ga.q || []
    ga.q.push(args)
  }

type Props = {|
  id: string
|}

export default class Analytics extends React.PureComponent<Props> {
  insertScript() {
    const script = document.createElement('script')
    script.src = 'https://www.google-analytics.com/analytics.js'
    script.async = true

    if (process.env.NODE_ENV === 'development') {
      script.src = script.src.replace(/\/analytics/, '$&_debug')
    }

    if (document.body !== null) {
      document.body.appendChild(script)
    }
  }

  componentDidMount() {
    const scriptExists = document.querySelector('script[src$="analytics.js"]')

    if (scriptExists) {
      return
    }

    this.insertScript()
  }

  render() {
    ga.l = Number(new Date())

    ga('create', this.props.id, 'auto')
    ga('send', 'pageview')

    return null
  }
}
