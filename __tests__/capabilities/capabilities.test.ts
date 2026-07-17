import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  CAPABILITIES,
  DEFAULT_CAPABILITY_ACCESS,
  getCapabilityBadge,
  getSearchResultRoute,
  getVisibleCapabilities,
  TECHNICAL_ROUTES,
} from '@/config/capabilities'

const root = process.cwd()
const features = new Set(CAPABILITIES.flatMap(item => item.featureFlag ? [item.featureFlag] : []))
const userAccess = { ...DEFAULT_CAPABILITY_ACCESS, tier: 'PRO' as const }

function pagePath(route: string) {
  return join(root, 'app', route, 'page.tsx')
}

test('every visible application link resolves to a page', () => {
  for (const capability of CAPABILITIES.filter(item => item.route)) {
    assert.equal(existsSync(pagePath(capability.route!)), true, `${capability.route} has no page`)
  }
})

test('desktop and mobile expose the same capability routes', () => {
  const desktop = getVisibleCapabilities(userAccess, 'desktop', features).flatMap(item => item.route ?? []).sort()
  const mobile = getVisibleCapabilities(userAccess, 'mobile', features).flatMap(item => item.route ?? []).sort()
  assert.deepEqual(mobile, desktop)
})

test('admin capabilities are role-based, never tier-based', () => {
  const nonAdmin = getVisibleCapabilities(userAccess, 'desktop', features).map(item => item.id)
  assert.equal(nonAdmin.includes('admin'), false)
  assert.equal(nonAdmin.includes('satellite-config'), false)
  const admin = getVisibleCapabilities({ ...userAccess, role: 'admin' }, 'desktop', features).map(item => item.id)
  assert.equal(admin.includes('admin'), true)
  assert.equal(admin.includes('satellite-config'), true)
})

test('beta and simulation capabilities always have a maturity badge', () => {
  for (const capability of CAPABILITIES.filter(item => item.maturity !== 'stable')) {
    assert.ok(getCapabilityBadge(capability), `${capability.id} has no badge`)
  }
})

test('every Help link points to an existing manual chapter', () => {
  for (const capability of CAPABILITIES.filter(item => item.helpHref)) {
    const slug = capability.helpHref!.replace('/docs/manual/', '')
    assert.equal(existsSync(join(root, 'docs', 'manual', `${slug}.md`)), true, capability.helpHref)
  }
  const serialized = JSON.stringify(CAPABILITIES)
  for (const removed of ['challenges-gamification', 'social-sharing', 'badge-system']) {
    assert.equal(serialized.includes(removed), false)
  }
})

test('search result destinations are canonical existing pages', () => {
  for (const type of ['task', 'harvest', 'seed', 'garden', 'treatment', 'mechanical']) {
    const route = getSearchResultRoute(type)
    assert.equal(existsSync(pagePath(route)), true, `${type} -> ${route}`)
  }
})

test('legacy technical routes redirect to their classified canonical entry', () => {
  for (const item of TECHNICAL_ROUTES.filter(item => item.classification !== 'contextual')) {
    const source = readFileSync(pagePath(item.route), 'utf8')
    assert.match(source, new RegExp(`redirect\\(['\"]${item.canonicalEntry.replaceAll('/', '\\/')}['\"]\\)`))
  }
})
