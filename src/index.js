import React from 'react'
import ReactDOM from 'react-dom'
import 'normalize.css'

import {Analytics} from './lib/analytics'
import {Header} from './header'
import Drone from './lib/drone'
import webfont from './lib/webfont'
import styles from './styles'

const Main = () => {
  return (
    <div>
      <Header />
      <Analytics id={'UA-86127521-1'} />
    </div>
  )
}

(() => {
  webfont({
    families: ['Cinzel Decorative:400'],
    text: 'Langri-Sha'
  })

  const container = document.createElement('div')
  container.className = styles.container
  document.body.appendChild(container)

  ReactDOM.render(<Main />, container)
  new Drone().generate()
})()
