import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const local = JSON.parse(execFileSync(
  'supabase', ['status', '--workdir', '/tmp/ortomio-audit-local', '-o', 'json'],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
))
assert.equal(local.API_URL, 'http://127.0.0.1:55421')
process.env.NEXT_PUBLIC_SUPABASE_URL = local.API_URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = local.ANON_KEY
process.env.NEXT_PUBLIC_BYPASS_AUTH = 'false'
const { getSupabaseClient } = await import('../../config/supabase')
const { SupabaseStorageProvider } = await import('../../packages/storage-cloud/SupabaseStorageProvider')
const { directorService } = await import('../../services/directorService')
const admin = createClient(local.API_URL, local.SERVICE_ROLE_KEY)
const credentials = { email: randomUUID() + '@example.test', password: randomUUID() + 'aZ9!' }
const account = await admin.auth.admin.createUser({...credentials, email_confirm: true})
assert.ifError(account.error)
const user = account.data.user!
const client = getSupabaseClient()!
try {
  assert.ifError((await client.auth.signInWithPassword(credentials)).error)
  const provider = new SupabaseStorageProvider()
  const first = await provider.createGarden({
    name: 'Onboarding A', sizeSqMeters: 100, sizeUnit: 'sqm', soilType: 'Clay', soilPh: 6.5,
    coordinates: {latitude: 0, longitude: 12}, dailySunHours: 5, aspectDirection: 'South', photoNorthOffset: 0,
    visualSunInput: {position: "campo", morningSun: 3, noonSun: 5, afternoonSun: 2, obstacles: ["albero"]},
    obstacles: [30, 90].map(azimuth => ({ azimuth, height: 3, distance: 6, widthDegrees: 15, type: 'Tree' })),
  })
  const second = await provider.createGarden({name:'Onboarding B', sizeSqMeters: 10, sizeUnit: 'sqm', gardenType:'Hydroponic'})
  assert.ifError((await client.auth.signOut()).error)
  assert.ifError((await client.auth.signInWithPassword(credentials)).error)
  const a = await provider.getGarden(first.id)
  assert.equal(a?.coordinates?.latitude, 0)
  assert.equal(a?.visualSunInput?.noonSun, 5)
  assert.equal(a?.soilPh, 6.5)
  assert.equal(a?.photoNorthOffset, 0)
  assert.equal(a?.aspectDirection, 'South')
  assert.equal(a?.dailySunHours, 5)
  assert.equal(a?.obstacles?.length, 2)
  const [keep, remove] = a!.obstacles!
  for (const garden of [second, first]) {
    const briefing = await directorService.getDailyBriefing(user.id, garden.id)
    assert.equal(briefing.gardenName, garden.name)
    assert.equal(briefing.stats.totalSuggestions, 0)
    if (garden.id === second.id) {
      assert.equal(briefing.agronomicInsights.photoperiod_hours, undefined)
      assert.ok(briefing.recommendations.some(message => message.includes('posizione')))
    } else {
      assert.ok((briefing.agronomicInsights.photoperiod_hours ?? 0) > 0)
      assert.ok(!briefing.recommendations.some(message => message.includes('Completa i dati')))
    }
  }
  const suggestion = await admin.from('ai_suggestions').insert({
    user_id: user.id, garden_id: first.id, suggestion_type: 'IRRIGATION',
    title: 'Controllo irriguo', description: 'Fixture', reasoning: 'Fixture',
    suggested_action: 'Controlla', confidence_score: 0.8, action_priority: 'HIGH',
  })
  assert.ifError(suggestion.error)
  const shadowCount = async () => {
    const briefing = await directorService.getDailyBriefing(user.id, first.id)
    return briefing.criticalActions[0]?.refinedContext?.siteOperationalProfile?.shadowObstaclesCount
  }
  assert.equal(await shadowCount(), 2)
  await provider.updateGarden(second.id, {removedObstacleIds: [keep.id!]})
  const edited = await provider.updateGarden(first.id, {obstacles: [keep], removedObstacleIds: [remove.id!]})
  assert.deepEqual(edited.obstacles?.map(item => item.id), [keep.id])
  assert.equal(await shadowCount(), 1)
  console.log('PASS: persisted inputs, obstacle removal, new login, two independent first briefings')
} finally {
  assert.ifError((await admin.auth.admin.deleteUser(user.id)).error)
}
