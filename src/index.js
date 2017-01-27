import Inferno from 'inferno'

import {ga} from './lib/analytics'
import Main from './components/main'

import webfont from './lib/webfont'
import styles from './styles'

(() => {
  webfont({
    families: ['Cinzel Decorative:400'],
    text: 'Langri-Sha'
  })

  const container = document.createElement('div')
  container.className = styles.container
  document.body.appendChild(container)

  try {
    Inferno.render(<Main />, container)
  } catch (err) {
    ga('send', 'exception', {
      exDescription: err.message,
      exFatal: false
    })

    console.error(err)
  }
})()

if (module.hot) {
  module.hot.accept()
}
