import React from 'react'
import ReactDOM from 'react-dom'
import 'normalize.css'

import {Header} from './header'
import Drone from './lib/drone'
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

  ReactDOM.render(<Header />, container)
  new Drone().generate()
})()
