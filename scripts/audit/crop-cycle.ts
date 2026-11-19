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
  const { dailyDiaryService } = await import('../../services/dailyDiaryService')
  const garden = await provider.createGarden({
    name: 'Ciclo pomodoro', gardenType: 'OpenField', sizeSqMeters: 100, sizeUnit: 'sqm',
    coordinates: { latitude: 44, longitude: 12 }, soilType: 'Clay', soilPh: 6.5, dailySunHours: 5,
  })
  const day = new Date().toISOString().slice(0, 10)
  const sowingDay = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10)
  // Fixed local weather isolates the diary calculation from external weather providers.
  assert.ifError((await admin.from('daily_weather_log').insert({
    user_id: user.id, garden_id: garden.id, log_date: day, temp_min: 16, temp_max: 25,
    temp_avg: 20, precipitation_mm: 0,
  })).error)
  const systemId = randomUUID()
  const zoneId = randomUUID()
  assert.ifError((await admin.from('irrigation_systems').insert({
    id: systemId, user_id: user.id, garden_id: garden.id, name: 'Manuale',
  })).error)
  assert.ifError((await admin.from('irrigation_zones').insert({
    id: zoneId, system_id: systemId, garden_id: garden.id, name: 'Pomodori',
    area_sqm: 10, method: 'Manual', flow_rate_lph: 60,
  })).error)
  async function observe(step: string) {
    const briefing = await directorService.getDailyBriefing(user.id, garden.id)
    assert.equal(briefing.gardenId, garden.id)
    console.log('AUDIT', JSON.stringify({
      step, suggestions: briefing.stats.totalSuggestions, summary: briefing.summary,
      recommendations: briefing.recommendations, insights: briefing.agronomicInsights,
      queue: briefing.transversalQueue?.map(action => [action.source, action.title, action.priorityScore]),
    }))
  }
  await observe('onboarding')
  const crop = await provider.createTask({
    gardenId: garden.id, plantName: 'Pomodoro', taskType: 'Sowing', stage: 'Germination',
    date: sowingDay, completed: true, quantity: 5,
  })
  await observe('semina')
  await provider.updateTask(crop.id, { stage: 'Flowering' })
  assert.equal((await provider.getTasks(garden.id)).find(task => task.id === crop.id)?.stage, 'Flowering')
  await observe('fioritura')
  const water = await provider.logWatering({
    gardenId: garden.id, taskId: crop.id, zoneId, date: day,
    durationMinutes: 20, litersApplied: 20, method: 'Manual', completed: true,
  })
  assert.equal((await provider.getWateringLog(water.id))?.litersApplied, 20)
  await observe('irrigazione')
  const registration = await dailyDiaryService.runDailyRegistration(user.id, day)
  console.log('DIARY', JSON.stringify({
    weather: Boolean(registration.weatherLog), tracked: registration.cultivationsUpdated,
    errors: registration.errors,
  }))
  await observe('dopo diario')
  await provider.createHarvestLog({
    gardenId: garden.id, taskId: crop.id, plantName: 'Pomodoro', quantity: 3, unit: 'kg',
    rating: 4, date: day,
  })
  assert.equal((await provider.getHarvestLogs(garden.id))[0]?.quantity, 3)
  await provider.updateTask(crop.id, { stage: 'Harvested' })
  assert.equal((await provider.getTasks(garden.id)).find(task => task.id === crop.id)?.stage, 'Harvested')
  await observe('raccolto')
} finally {
  assert.ifError((await admin.auth.admin.deleteUser(user.id)).error)
}
