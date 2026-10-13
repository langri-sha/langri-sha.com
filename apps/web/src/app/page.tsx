import { Desk } from './lib/desk'
import { Wordmark } from './lib/header/wordmark'
import { Landing } from './lib/landing'

const Page = () => (
  <Landing wordmark={<Wordmark />}>
    <Desk />
  </Landing>
)

export default Page
