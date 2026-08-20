import type { MetadataRoute } from 'next'

const SITE_URL = 'https://www.ortomioapp.it'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
