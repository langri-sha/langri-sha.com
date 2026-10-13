import { Wordmark } from './lib/header/wordmark'
import { Landing } from './lib/landing'
import { Logbook } from './lib/logbook'

const Page = () => (
  <Landing wordmark={<Wordmark />}>
    <Logbook />
  </Landing>
)

export default Page
