import type { Metadata } from 'next'

import { ChantTuner } from './tuner'

export const metadata: Metadata = {
  title: 'Chant tuner',
}

const Page = () => <ChantTuner />

export default Page
