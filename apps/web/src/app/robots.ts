import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const robots = (): MetadataRoute.Robots => ({
  rules: { userAgent: '*', allow: '/' },
})

export default robots
