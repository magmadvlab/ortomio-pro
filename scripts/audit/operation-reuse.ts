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
const admin = createClient(local.API_URL, local.SERVICE_ROLE_KEY)
const credentials = { email: randomUUID() + '@example.test', password: randomUUID() + 'aZ9!' }
const account = await admin.auth.admin.createUser({...credentials, email_confirm: true})
assert.ifError(account.error)
const user = account.data.user!
const client = getSupabaseClient()!
try {
  assert.ifError((await client.auth.signInWithPassword(credentials)).error)
  const provider = new SupabaseStorageProvider()
  const { UnifiedOperationsService } = await import('../../services/unifiedOperationsService')
  const { loadCanonicalPredictionInput, buildPredictionBundle } = await import('../../services/agronomicPredictionPipelineService')
  const service = new UnifiedOperationsService(provider)
  const asOf = new Date()
  const date = new Date(asOf.getTime() - 86400000).toISOString().slice(0,10)
  const garden = await provider.createGarden({ name: 'Audit operazioni', sizeSqMeters: 50, sizeUnit: 'sqm' })
  await provider.createTask({ gardenId: garden.id, plantName: 'Pomodoro', date, completed: true, taskType: 'Sowing' })
  const fieldRowId = randomUUID()
  assert.ifError((await admin.from('field_rows').insert({id: fieldRowId, garden_id: garden.id, name:'A', row_number:1, length_meters:10})).error)
  const plantId = randomUUID()
  const common = { garden_id: garden.id, user_id: user.id }
  assert.ifError((await admin.from('daily_weather_log').insert({ ...common, log_date: date, temp_min: 16, temp_max: 25, humidity_avg: 55 })).error)
  assert.ifError((await admin.from('soil_analysis').insert({ ...common, analysis_date: date })).error)
  assert.ifError((await admin.from('sensor_readings').insert({ ...common, sensor_type:'moisture', unit:'%', value:45, is_simulated:false, recorded_at:asOf.toISOString() })).error)
  assert.ifError((await admin.from('garden_plants').insert({id:plantId, garden_id:garden.id, field_row_id:fieldRowId, plant_code:'audit-1', position_in_row:1, plant_name:'Pomodoro', health_score:85,status:'healthy'})).error)
  const input = () => loadCanonicalPredictionInput(client, garden.id, asOf)
  for (const operationType of ['watering', 'work', 'treatment', 'fertilizing'] as const) {
    const before = await input()
    const result = await service.executeUnifiedOperation({
      level:'row', gardenId:garden.id, fieldRowId, operationDate:date, operationType,
      quantity:20, areaSqm:50, productName: operationType === 'work' ? 'weeding' : 'Fixture', propagateToPlants:false,
    })
    assert.equal(result.success, true, operationType + ': ' + result.errors?.join(', '))
    if (operationType === 'work') {
      const registered = await client.from('mechanical_work_register')
        .select('work_type,area_m2').eq('id', result.rowOperationIds[0]).single()
      assert.ifError(registered.error)
      assert.deepEqual(registered.data, {work_type:'Weeding', area_m2:50})
      console.log('AUDIT work register', JSON.stringify(registered.data))
    }
    const after = await input()
    assert.notDeepEqual(before.recentOperations, after.recentOperations)
    assert.equal(after.recentOperations?.find(row => row.kind === operationType && row.field_row_id === fieldRowId)?.total, operationType === 'work' ? 50 : 20)
    console.log('AUDIT', JSON.stringify({ operationType, saved:result.success, records:result.operationsCreated,
      errors:result.errors, predictionInputChanged:JSON.stringify(before)!==JSON.stringify(after) }))
  }
  const { finalizeTaskExecutionPostAction } = await import('../../services/taskExecutionPostActionService')
  const { buildMechanicalMeasuredFeedback, getAgronomicMeasuredFeedbackRecords } = await import('../../services/agronomicMeasuredFeedbackService')
  const measuredFeedback = buildMechanicalMeasuredFeedback({
    gardenId: garden.id, workDate: date, workType: 'Tilling',
    equipmentType: 'Manual', durationMinutes: 30, areaCoveredSqm: 50, cost: 12,
  })
  assert.ok(measuredFeedback)
  const beforeFeedback = await input()
  await finalizeTaskExecutionPostAction({ storageProvider: provider, gardenId: garden.id, measuredFeedback })
  const reread = await getAgronomicMeasuredFeedbackRecords(provider, garden.id)
  assert.ok(reread.some(record => record.id === measuredFeedback.id))
  assert.equal((await input()).operationFeedback?.recorded_work_cost, 12)
  console.log('AUDIT mechanical feedback', JSON.stringify({
    persisted: reread.some(record => record.id === measuredFeedback.id),
    predictionInputChanged: JSON.stringify(beforeFeedback) !== JSON.stringify(await input()),
  }))
  const { executeNutritionTreatmentThroughUnifiedService } = await import('../../services/operationExecutionBridgeService')
  const plan = {
    id: randomUUID(), gardenId: garden.id, productId: 'test', productName: 'Planner',
    scheduledDate: date, treatmentType: 'pest_control', dosage: 3, dosageUnit: 'L',
    applicationMethod: 'spray', actualCoverage: 50, calibrationCheck: false,
    followUpRequired: false, organicCompliant: false, status: 'completed', createdAt: date, updatedAt: date,
  } as const
  await Promise.all([1, 2].map(() => executeNutritionTreatmentThroughUnifiedService(provider, plan)))
  const planned = (await input()).recentOperations?.find(row => row.product === 'Planner')
  assert.equal(planned?.executions, 1)
  assert.equal(planned?.total, 3)
  const plantPlan = { ...plan, id: randomUUID(), plantIds: [plantId], productName: 'Planner pianta' }
  await executeNutritionTreatmentThroughUnifiedService(provider, plantPlan)
  await executeNutritionTreatmentThroughUnifiedService(provider, plantPlan)
  assert.equal((await input()).recentOperations?.find(row => row.product === plantPlan.productName)?.total, 3)
  const { advancedNutritionService } = await import('../../services/advancedNutritionService')
  const productId = randomUUID()
  assert.ifError((await admin.from('product_inventory').insert({
    product_id: productId, product_name: 'Concime planner', product_type: 'fertilizer',
    garden_id: garden.id, stock_unit: 'g', current_stock: 10,
  })).error)
  const scheduled = await advancedNutritionService.createNutritionTreatment({
    ...plan, treatmentType: 'fertilization', status: 'planned', productId, productName: 'Concime planner',
    dosageUnit: 'g', applicationMethod: 'foliar', fieldRowId,
  })
  await advancedNutritionService.updateNutritionTreatment(scheduled.id, {status: 'in_progress'})
  await executeNutritionTreatmentThroughUnifiedService(provider, scheduled)
  await advancedNutritionService.updateNutritionTreatment(scheduled.id, {status:'completed', actualApplicationDate: date})
  const inventory = await client.from('product_inventory').select('current_stock').eq('product_id', productId).single()
  assert.equal(inventory.data?.current_stock, 7)
  const completed = await client.from('nutrition_treatments').select('status,product_type').eq('id', scheduled.id).single()
  assert.deepEqual(completed.data, {status:'completed', product_type:'fertilizer'})
  const totals = (await input()).recentOperations?.filter(row => row.product === 'Concime planner')
  assert.equal(totals?.reduce((sum, row) => sum + (row.total ?? 0), 0), 3)
  const privilegedInput = await loadCanonicalPredictionInput(admin, garden.id, asOf)
  assert.equal(privilegedInput.operationFeedback?.recorded_work_cost, 12)
  const systemId = randomUUID()
  const zoneId = randomUUID()
  assert.ifError((await admin.from('irrigation_systems').insert({id:systemId, user_id:user.id, garden_id:garden.id,name:'Manuale'})).error)
  assert.ifError((await admin.from('irrigation_zones').insert({id:zoneId,system_id:systemId,garden_id:garden.id,name:'A',area_sqm:50,method:'Manual',flow_rate_lph:60})).error)
  assert.ifError((await admin.from('water_requirements').insert({zone_id:zoneId,calculation_date:date,et0_mm:2,kc_coefficient:1,etc_mm:2,irrigation_need_mm:2,recommended_volume_liters:15,calculation_method:'fixture'})).error)
  await provider.logWatering({gardenId:garden.id,zoneId,date,wateredAt:date+'T12:00:00Z',durationMinutes:20,litersApplied:20,method:'Manual',completed:true})
  const canonical = await input()
  assert.equal(canonical.waterComparison?.actualLiters,20)
  assert.equal(canonical.waterComparison.requiredLiters,15)
  const bundle = buildPredictionBundle(canonical)
  assert.equal(bundle.status, 'generated')
  if (process.env.AUDIT_LOCAL_HTTP === '1') {
    const session = await client.auth.getSession()
    const response = await fetch('http://127.0.0.1:3004/api/ai/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: 'sb-access-token=' + session.data.session!.access_token },
      body: JSON.stringify({ gardenId: garden.id }),
    })
    const prediction = await response.json()
    assert.equal(response.status, 200, prediction.message)
    assert.ok(prediction.predictionId)
    assert.equal(prediction.data.operationFeedback.recorded_work_cost, 12)
    assert.equal(prediction.data.recentOperations.find((row: {product: string | null}) => row.product === 'Planner').total, 3)
    console.log('AUDIT authenticated predictions: HTTP 200, persisted quantities and cost')
  }
  console.log('AUDIT zone',JSON.stringify({comparison:canonical.waterComparison,status:bundle.status,results:bundle.resourceOptimizations}))
} finally {
  // Local auth's deletion trigger lacks rights on field-row dependants.
  assert.match(user.id, /^[a-f0-9-]{36}$/)
  execFileSync('docker',['exec','supabase_db_ortomio-audit-local','psql','-U','postgres','-v','ON_ERROR_STOP=1','-c',
    `begin; delete from public.nutrition_treatments where operator_id in (select id from auth.users where id='${user.id}' and email like '%@example.test'); delete from auth.users where id='${user.id}' and email like '%@example.test'; commit`])
}
