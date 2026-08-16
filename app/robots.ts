import type { MetadataRoute } from 'next'

const SITE_URL = 'https://www.ortomioapp.it'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/app/',
          '/auth/',
          '/dashboard/',
          '/farm/',
          '/accept-invitation',
          '/test',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
