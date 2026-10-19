import { Viewport } from 'next'

import { Wordmark } from './lib/header/wordmark'
import { Landing } from './lib/landing'

export const viewport: Viewport = {
  colorScheme: 'dark',
}

const Page = () => <Landing wordmark={<Wordmark />} />

export default Page
