import { Metadata } from 'next'

import { Wordmark } from './lib/header/wordmark'
import { NotFound } from './lib/not-found'

export const metadata: Metadata = {
  title: 'Not found · Langri-Sha',
}

const NotFoundPage = () => <NotFound wordmark={<Wordmark />} />

export default NotFoundPage
