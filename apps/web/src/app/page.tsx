import { posts } from '@/journal'

import { Desk } from './lib/desk'
import { Wordmark } from './lib/header/wordmark'
import { Landing } from './lib/landing'

const Page = () => (
  <Landing wordmark={<Wordmark />}>
    <Desk posts={posts} />
  </Landing>
)

export default Page
