import Inferno from 'inferno'

import {ga} from './lib/analytics'
import Main from './components'

import webfont from './lib/webfont'
import styles from './styles'

const container = document.createElement('div')
container.className = styles.container

;(() => {
  webfont({
    families: ['Cinzel Decorative:400'],
    text: 'Langri-Sha'
  })

  document.body.appendChild(container)
  render(<Main />)
})()

function render (node) {
  try {
    Inferno.render(node, container)
  } catch (err) {
    ga('send', 'exception', {
      exDescription: err.message,
      exFatal: false
    })

    console.error(err)
  }
}

if (DEVELOPMENT) {
  if (module.hot) {
    module.hot.accept('./components/index', () => {
      const Main = require('./components').default
      render(<Main />)
    })
  }
}
