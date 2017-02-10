/* global requestAnimationFrame */
import classNames from 'classnames'
import Component from 'inferno-component'

import iconDefs from './icon-defs.svg'

export class IconDefinitions extends Component {
  componentDidMount () {
    const el = document.createElement('div')
    el.innerHTML = iconDefs

    requestAnimationFrame(() => {
      if (document.body != null && document.body.firstElementChild != null) {
        document.body.firstElementChild.before(el.children[0])
      }
    })
  }

  render () {
    return null
  }
}

export const Icon = ({symbol, inline}: {symbol: string, inline:string}) => (
  <svg className={classNames('icon', {[`icon-${symbol}`]: inline})}>
    <use xlink:href={`#icon-${symbol}`} />
  </svg>
)
