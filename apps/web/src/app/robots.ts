import type { MetadataRoute } from 'next'

import * as site from './lib/site'

export const dynamic = 'force-static'

const robots = (): MetadataRoute.Robots => ({
  rules: { userAgent: '*', allow: '/' },
  sitemap: `${site.url}/sitemap.xml`,
})

export default robots
