import {Component, PropTypes} from 'react'

export const ga = window.ga = window.ga || function () {
  (ga.q = ga.q || []).push(arguments)
}

export class Analytics extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  };

  componentDidMount () {
    const script = document.createElement('script')
    script.src = 'https://www.google-analytics.com/analytics.js'
    script.async = true

    document.body.appendChild(script)
  }

  render () {
    ga.l = +new Date()

    ga('create', this.props.id, 'auto')
    ga('send', 'pageview')

    return null
  }
}
