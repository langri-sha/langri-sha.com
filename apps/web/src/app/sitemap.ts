import type { MetadataRoute } from 'next'

import * as site from './lib/site'

export const dynamic = 'force-static'

const sitemap = (): MetadataRoute.Sitemap => [{ url: `${site.url}/` }]

export default sitemap
