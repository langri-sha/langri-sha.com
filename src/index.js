import React from 'react'
import ReactDOM from 'react-dom'

import {Main} from './components'

(() => {
  const container = document.createElement('div')
  document.body.appendChild(container)

  ReactDOM.render(<Main />, container)
})()
