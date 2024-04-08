// @flow
import * as React from 'react'
import ReactDOM from 'react-dom'

import { Landing } from './pages'
import webfont from './lib/webfont'
;(() => {
  webfont({
    families: ['Cinzel Decorative:400'],
    text: 'Langri-Sha',
  })

  if (document) {
    const container = document.querySelector('#app')

    if (container) {
      ReactDOM.render(<Landing />, container)
    }
  }
})()
