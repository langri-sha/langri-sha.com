import { Viewport } from 'next'

import * as colors from '@/styles/colors'

import { Wordmark } from './lib/header/wordmark'
import { Landing } from './lib/landing'

export const viewport: Viewport = {
  themeColor: colors.nightCore,
}

const Page = () => <Landing wordmark={<Wordmark />} />

export default Page
