import React from 'react'
import ReactDOM from 'react-dom'
import 'normalize.css'

import {Main} from './components'
import webfont from './lib/webfont'
import './styles';

(() => {
  webfont({
    families: ['Cinzel:400'],
    text: 'Langri-Sha'
  })

  const container = document.createElement('div')
  document.body.appendChild(container)

  ReactDOM.render(<Main />, container)
})()
