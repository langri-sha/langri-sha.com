// A tuning console for the invocation's chant: the syllable table exposed
// as lines and knobs, with live playback and a copy-back of the edits.
import type { Metadata } from 'next'

import { ChantTuner } from './tuner'

export const metadata: Metadata = {
  title: 'Chant tuner',
}

const Page = () => <ChantTuner />

export default Page
