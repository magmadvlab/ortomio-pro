import assert from 'node:assert/strict'
import test from 'node:test'

const SITE_URL = 'https://www.ortomioapp.it'

test('robots exposes the canonical sitemap and keeps private routes out of crawl', async () => {
  const module = await import('../../app/robots').catch(() => null)
  assert.ok(module, 'the public robots route must exist')
  const robots = module.default
  const policy = robots()
  const rules = Array.isArray(policy.rules) ? policy.rules : [policy.rules]
  const publicRule = rules.find((rule) => rule.userAgent === '*')

  assert.equal(policy.host, SITE_URL)
  assert.equal(policy.sitemap, `${SITE_URL}/sitemap.xml`)
  assert.equal(publicRule?.allow, '/')
  assert.deepEqual(publicRule?.disallow, [
    '/api/',
    '/app/',
    '/auth/',
    '/dashboard/',
    '/farm/',
    '/accept-invitation',
    '/test',
  ])
})

test('sitemap publishes only the canonical public marketing pages', async () => {
  const module = await import('../../app/sitemap').catch(() => null)
  assert.ok(module, 'the public sitemap route must exist')
  const sitemap = module.default
  const entries = sitemap()

  assert.deepEqual(
    entries.map(({ url, changeFrequency, priority }) => ({ url, changeFrequency, priority })),
    [
      { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
      { url: `${SITE_URL}/come-funziona`, changeFrequency: 'monthly', priority: 0.8 },
    ],
  )
  assert.ok(entries.every((entry) => entry.lastModified instanceof Date))
})
