/* global ga, DEVELOPMENT */
import Component from 'inferno-component'

window.ga = window.ga || function () {
  (ga.q = ga.q || []).push(arguments)
}

export class Analytics extends Component {
  insertScript () {
    const script = document.createElement('script')
    script.src = 'https://www.google-analytics.com/analytics.js'
    script.async = true

    if (DEVELOPMENT) {
      script.src = script.src.replace(/\/analytics/, '$&_debug')
    }

    document.body.appendChild(script)
  }

  componentDidMount () {
    const scriptExists = document.querySelector('script[src$="analytics.js"]')

    if (scriptExists) {
      return
    }

    this.insertScript()
  }

  render () {
    ga.l = +new Date()

    ga('create', this.props.id, 'auto')
    ga('send', 'pageview')

    return null
  }
}

export class OutboundLink extends Component {
  track (eventCategory, eventAction, eventLabel) {
    ga('send', {
      hitType: 'event',
      eventCategory,
      eventAction,
      eventLabel
    })
  }

  render () {
    const {href, category, action, label, children, ...props} = this.props
    const track = this.track.bind(this, category, action, label)

    return (
      <a href={href} onClick={track} {...props}>
        {children}
      </a>
    )
  }
}
