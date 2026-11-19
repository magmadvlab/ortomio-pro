import sharp from 'sharp'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const local = JSON.parse(execFileSync('supabase', ['status','--workdir','/tmp/ortomio-audit-local','-o','json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}))
assert.equal(local.API_URL,'http://127.0.0.1:55421')
process.env.NEXT_PUBLIC_SUPABASE_URL = local.API_URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = local.ANON_KEY
const {getSupabaseClient} = await import('../../config/supabase')
const {cropRotationService} = await import('../../services/cropRotationService')
const {assessPlantImage, listPlantObservations,savePlantObservation,savePlantReport} = await import('../../services/plantPhotoObservationService')
const {loadCanonicalPredictionInput,buildPredictionBundle} = await import('../../services/agronomicPredictionPipelineService')
const admin = createClient(local.API_URL,local.SERVICE_ROLE_KEY)
const db = getSupabaseClient()!
const credentials = { email:randomUUID()+'@example.test',password:randomUUID()+'Aa8!' }
const account = await admin.auth.admin.createUser({...credentials,email_confirm:true})
assert.ifError(account.error)
const owner = account.data.user!.id
try {
  assert.ifError((await db.auth.signInWithPassword(credentials)).error)
  const garden = randomUUID(), first = randomUUID(), second = randomUUID(), plant = randomUUID(), neighbor = randomUUID()
  const date = new Date().toISOString().slice(0,10)
  assert.ifError((await admin.from('gardens').insert({id:garden,user_id:owner,name:'Audit rotazione',soil_ph:6.3})).error)
  assert.ifError((await admin.from('field_rows').insert([first,second].map((id,i)=>({id,garden_id:garden,name:'Filare '+(i+1),row_number:i+1,length_meters:30})))).error)
  assert.ifError((await admin.from('garden_plants').insert([plant,neighbor].map((id,i)=>({id,garden_id:garden,field_row_id:i?second:first,position_in_row:10,plant_code:'F'+(i+1)+'-P10',plant_name:i?'Fagiolo':'Pomodoro',status:'healthy',health_score:85,planting_date:date})))).error)
  const plans = await cropRotationService.getPlans(garden,'SUGGESTED')
  assert.equal(plans.length,2)
  assert.equal(plans.find(p=>p.fieldRowId===first)?.currentFamily,'Solanaceae')
  const beanPlan = plans.find(p=>p.fieldRowId===second)!
  assert.equal(beanPlan.currentFamily,'Leguminose')
  assert.ok(beanPlan.suggestedNextCrops.some(c=>c.plantName==='Pomodoro'))
  assert.ifError((await admin.from('gardens').update({soil_ph:8.5}).eq('id',garden)).error)
  const alkaline = (await cropRotationService.getPlans(garden,'SUGGESTED')).find(p=>p.fieldRowId===second)!
  assert.ok(!alkaline.suggestedNextCrops.some(c=>c.plantName==='Pomodoro'))
  const prior = new Date()
  prior.setUTCFullYear(prior.getUTCFullYear()-1)
  await cropRotationService.addToHistory({gardenId:garden,fieldRowId:first,plantName:'Fagiolo',plantFamily:'Leguminose',plantedDate:prior.toISOString().slice(0,10),year:prior.getUTCFullYear(),season:'Estate'})
  const updated = (await cropRotationService.getPlans(garden,'SUGGESTED')).find(p=>p.fieldRowId===first)!
  assert.ok(updated.suggestedNextCrops.every(c=>c.plantFamily!=='Leguminose'))
  const pixels = await sharp({create:{width:8,height:8,channels:3,background:'#a9ad4b'}}).jpeg().toBuffer()
  const encoded = pixels.toString('base64')
  const jpeg = 'data:image/jpeg;base64,' + encoded
  await savePlantObservation(garden,plant,jpeg)
  assert.ifError((await db.rpc('record_plant_health_observation',{p_plant:plant,p_score:71,p_notes:'controllo'})).error)
  const savedPlant = await db.from('garden_plants').select('health_score,field_row_id').eq('id',plant).single()
  assert.deepEqual(savedPlant.data,{health_score:71,field_row_id:first})
  const [photo] = await listPlantObservations(garden,plant)
  assert.equal(photo.url,jpeg)
  assert.equal((await listPlantObservations(garden,neighbor)).length,0)
  const location = await db.from('plant_photos').select('plant_code,field_row_id,position_in_row').eq('id',photo.id).single()
  assert.deepEqual(location.data,{plant_code:'F1-P10',field_row_id:first,position_in_row:10})
  const sample = {observation:'Foglia gialla (fixture)',hypotheses:[{cause:'Possibile carenza',category:'nutrizione',check:'Verificare il suolo',action:'Correggere se confermata',substance:'Azoto'}],followUp:'Ricontrollare la stessa pianta'}
  const originalFetch = globalThis.fetch
  try {
    globalThis.fetch = async (_url,init) => {
      const body = JSON.parse(String(init?.body))
      assert.deepEqual(body.contents[1].inlineData,{data:encoded,mimeType:'image/jpeg'})
      return Response.json({text:JSON.stringify(sample)})
    }
    const report = await assessPlantImage(jpeg,'Pomodoro')
    globalThis.fetch = originalFetch
    await savePlantReport(garden,plant,photo.id,report)
    globalThis.fetch = async () => Response.json({text:'risposta non valida'})
    await assert.rejects(assessPlantImage(jpeg,'Pomodoro'))
  } finally {globalThis.fetch=originalFetch}
  assert.equal((await listPlantObservations(garden,plant))[0].ai_analysis != null,true)
  const {SupabaseStorageProvider} = await import('../../packages/storage-cloud/SupabaseStorageProvider')
  const {loadFieldAgenda} = await import('../../services/fieldDayAgenda')
  const storage = new SupabaseStorageProvider()
  const saved = await storage.createIndividualPlant({gardenId:garden, plantCode:'F1-P11', plantName:'Pomodoro',
    plantingDate:prior.toISOString().slice(0,10), source:'nursery', expectedHarvestDate:date, healthScore:88,
    fieldRowId:first, positionInRow:11, status:'healthy',photos:[]})
  await storage.updateIndividualPlant(saved.id,{healthScore:85})
  const individual = await storage.getIndividualPlants(garden)
  assert.equal(individual.find(p => p.id === saved.id)?.source,'nursery')
  assert.equal(individual.find(p => p.id === saved.id)?.fieldRowId,first)
  const context = await storage.updateGarden(garden,{primaryCrop:{canonicalPlantName:'Pomodoro',label:'Pomodoro',archetypeId:'MIX'}})
  const agenda = await loadFieldAgenda(db,context,new Date(),[],individual)
  assert.ok(agenda.actions.some(a => a.id === 'maturity-'+saved.id && a.href.includes(saved.id)))
  assert.ok(agenda.missing.includes('rilievo satellitare recente'))
  const input = await loadCanonicalPredictionInput(admin,garden)
  assert.equal(buildPredictionBundle(input).photoFollowUps?.[0]?.plantId,plant)
  console.log('OK: due filari isolati, effetto pH, foto pianta 10 persistita, pixel trasmessi, errore modello gestito, controllo predittivo collegato.')
} finally {
  assert.ifError((await admin.from('gardens').delete().eq('user_id',owner)).error)
  assert.ifError((await admin.auth.admin.deleteUser(owner)).error)
}
