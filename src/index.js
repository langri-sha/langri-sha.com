// @flow
import * as React from 'react'
import ReactDOM from 'react-dom'

import Main from 'components'

import styles from './styles'
import webfont from './lib/webfont'

;(() => {
  webfont({
    families: ['Cinzel Decorative:400'],
    text: 'Langri-Sha'
  })

  const container = document.getElementById('app')

  if (container) {
    ReactDOM.render(<Main />, container)
  }
})()
