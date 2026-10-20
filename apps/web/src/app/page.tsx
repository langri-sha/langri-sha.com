import { Metadata } from 'next'

import { Wordmark } from './lib/header/wordmark'
import { Landing } from './lib/landing'
import * as site from './lib/site'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    description: site.description,
    siteName: site.name,
    title: site.name,
    type: 'website',
    url: '/',
  },
}

const Page = () => <Landing wordmark={<Wordmark />} />

export default Page
