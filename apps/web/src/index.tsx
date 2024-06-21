import { createRoot } from 'react-dom/client'

import { Landing } from './pages'
import { webfont } from './lib/webfont'
;(() => {
  webfont({
    families: ['Cinzel Decorative:400&display=swap'],
    text: 'Langri-Sha',
  })

  if (document) {
    const container = document.querySelector('#app')

    if (!container) {
      throw new Error('App container not found')
    }

    const root = createRoot(container)

    root.render(<Landing />)
  }
})()
