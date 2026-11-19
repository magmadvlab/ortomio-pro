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
    return briefing
  }
  await observe('onboarding')
  const crop = await provider.createTask({
    gardenId: garden.id, plantName: 'Pomodoro', taskType: 'Sowing', stage: 'Germination',
    date: sowingDay, completed: true, quantity: 5,
  })
  const companion = await provider.createTask({
    gardenId: garden.id, plantName: 'Peperone', taskType: 'Transplant', stage: 'Vegetative',
    date: sowingDay, completed: true, quantity: 3,
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
  const irrigated = await observe('irrigazione')
  const irrigationAction = irrigated.transversalQueue.find(action => action.source === 'irrigation')
  assert.equal(irrigationAction?.scopeLabel, 'Pomodori')
  assert.equal(irrigationAction.metadata?.recordedLiters, 20)
  assert.equal(irrigationAction.metadata?.averageEfficiency, undefined)
  const measurement = {
    user_id: user.id, garden_id: garden.id, zones_irrigated: [zoneId],
    irrigation_date: new Date().toISOString(), duration_minutes: 10,
    planned_volume_liters: 10, actual_volume_liters: 8, volume_source: 'meter',
    lifecycle_status: 'measured', measurement_recorded_at: new Date().toISOString(),
  }
  assert.ifError((await admin.from('irrigation_logs').insert(measurement)).error)
  const measured = await observe('misura con piano')
  assert.equal(measured.transversalQueue.find(row => row.source === 'irrigation')?.metadata?.averageEfficiency, 80)
  const registration = await dailyDiaryService.runDailyRegistration(user.id, day)
  console.log('DIARY', JSON.stringify({
    weather: Boolean(registration.weatherLog), tracked: registration.cultivationsUpdated,
    errors: registration.errors,
  }))
  assert.deepEqual(registration.errors, [])
  assert.equal(registration.cultivationsUpdated, 2)
  const retry = await dailyDiaryService.runDailyRegistration(user.id, day)
  assert.deepEqual(retry.errors, [])
  const entry = await dailyDiaryService.getDailyEntry(garden.id, day)
  assert.equal(entry.tracking.length, 2)
  assert.equal(entry.tracking.find(row => row.cultivation_id === crop.id)?.phenological_stage, 'Flowering')
  assert.equal(entry.tracking.find(row => row.cultivation_id === companion.id)?.phenological_stage, 'Vegetative')
  await observe('dopo diario')
  await provider.createHarvestLog({
    gardenId: garden.id, taskId: crop.id, plantName: 'Pomodoro', quantity: 3, unit: 'kg',
    rating: 4, date: day,
  })
  assert.equal((await provider.getHarvestLogs(garden.id))[0]?.quantity, 3)
  const partial = await observe('raccolto parziale')
  assert.ok(partial.transversalQueue.some(row => row.source === 'health' && row.title.includes('Pomodoro')))
  await provider.updateTask(crop.id, { stage: 'Harvested' })
  assert.equal((await provider.getTasks(garden.id)).find(task => task.id === crop.id)?.stage, 'Harvested')
  const closed = await observe('raccolto finale')
  assert.equal(closed.agronomicInsights.cultivationCount, 1)
  assert.ok(!closed.transversalQueue.some(row => row.source === 'health' && row.title.includes('Pomodoro')))
  assert.ok(closed.transversalQueue.some(row => row.source === 'health' && row.title.includes('Peperone')))
  const afterHarvest = await dailyDiaryService.runDailyRegistration(user.id, day)
  assert.deepEqual(afterHarvest.errors, [])
  assert.equal(afterHarvest.cultivationsUpdated, 1)
  const other = await provider.createGarden({
    name: 'Terreno indipendente', sizeSqMeters: 10, sizeUnit: 'sqm',
  })
  assert.ifError((await admin.from('daily_weather_log').insert({
    user_id: user.id, garden_id: other.id, log_date: day, temp_min: 5, temp_max: 12,
    temp_avg: 8, precipitation_mm: 0,
  })).error)
  const independent = await provider.createTask({
    gardenId: other.id, plantName: 'Spinacio', taskType: 'Sowing', stage: 'Germination',
    date: sowingDay, completed: true,
  })
  const twoGardens = await dailyDiaryService.runDailyRegistration(user.id, day)
  assert.deepEqual(twoGardens.errors, [])
  assert.equal(twoGardens.cultivationsUpdated, 2)
  const otherEntry = await dailyDiaryService.getDailyEntry(other.id, day, true)
  assert.deepEqual(otherEntry.tracking.map(row => row.cultivation_id), [independent.id])
  assert.equal(otherEntry.weather?.temp_min, 5)
  // The authenticated client limits this cron run to the fixture user's gardens.
  const { DailyDiaryService } = await import('../../services/dailyDiaryService')
  class FailedTrackingDiary extends DailyDiaryService {
    override async updateCultivationTracking(...args: Parameters<typeof dailyDiaryService.updateCultivationTracking>) {
      if (args[1].id === companion.id) throw new Error('Fixture: tracking unavailable')
      return super.updateCultivationTracking(...args)
    }
  }
  const failure = await new FailedTrackingDiary().recordDailyEntries(day)
  assert.equal(failure.failedUsers, 1)
  assert.equal(failure.succeededUsers, 0)
  assert.match(failure.errors.join(' '), /tracking unavailable/)
  console.log('PASS: daily crop stages, retry, irrigation, partial harvest and independent cycle closure')
} finally {
  assert.ifError((await admin.auth.admin.deleteUser(user.id)).error)
}
