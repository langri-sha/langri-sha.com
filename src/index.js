import React from 'react'
import ReactDOM from 'react-dom'
import 'normalize.css'

import {ga, Analytics} from './lib/analytics'
import {Header} from './header'
import {Drone} from './lib/drone'
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
    ReactDOM.render((
      <div>
        <Header />
        <Analytics id={'UA-86127521-1'} />
        <Drone />
      </div>
    ), container)
  } catch (err) {
    ga('send', 'exception', {
      exDescription: err.message,
      exFatal: false
    })
  }
})()
