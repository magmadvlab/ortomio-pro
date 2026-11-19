import test from 'node:test'
import assert from 'node:assert/strict'
import { fieldDayActions } from '@/services/fieldDayAgenda'
import type { Garden, GardenTask } from '@/types'
import type { GardenPlant } from '@/types/individualPlant'
import type { WeatherForecast } from '@/services/weatherService'

const today = '2026-06-17'
const garden = {id:'g', name:'Campo',coordinates:{latitude:44,longitude:11}} as Garden
const plant = {gardenId:'g',id:'p',plantCode:'F1-P10',plantName:'Pomodoro',status:'healthy',source:'nursery',plantingDate:'2026-04-01'} as GardenPlant
const forecast = Array.from({length:5},(_,i)=>({date:'2026-06-'+(17+i),tempMin:i===1 ? -1 : 18,tempMax:26,windSpeed:8,rainMm:0} as WeatherForecast))
test('il diario distingue il primo controllo sul pomodoro da vivaio dalla semina e dalla raccolta conclusa', () => {
  const result = fieldDayActions(garden,today,[],[plant,{...plant,id:'s',source:'seed'},{...plant,id:'h',status:'harvested'}],[],[])
  assert.deepEqual(result.map(x => x.id), ['maturity-p'])
  assert.match(result[0].instruction,/primo piano/)
  const report = {observation:'Invaiatura visibile',hypotheses:[],followUp:'Confronta il colore tipico della varietà',maturity:'developing'}
  const photos = [{plant_id:'p',captured_at:today,ai_analysis:report}]
  assert.match(fieldDayActions(garden,today,[],[plant],[],photos)[0].instruction,/Invaiatura/)
})
test('il trapianto slitta prima della gelata, un NDVI vecchio non guida le lavorazioni', () => {
  const task = {id:'t',gardenId:'g',taskType:'Transplant',date:today,plantName:'Pomodoro'} as GardenTask
  const result = fieldDayActions(garden,today,[task,{...task,id:'c',operationalStatus:'cancelled'}],[],forecast,[],{data_date:'2026-05-01',ndvi_value:0.2})
  assert.equal(result.length,1)
  assert.match(result[0].instruction,/Rimanda/)
  const ndvi = fieldDayActions(garden,today,[],[],forecast,[],{data_date:today,ndvi_value:0.2})
  assert.match(ndvi[0].instruction,/copertura vegetale/)
})

test('per un nuovo terreno il Director anticipa semenzaio e vivaio prima di avere task', () => {
  const first = fieldDayActions({...garden,primaryCrop:{archetypeId:'MIX',label:'Pomodoro',canonicalPlantName:'Pomodoro'}},'2026-02-03',[],[],[],[])
  assert.match(first[0].instruction,/semenzaio/)
  assert.match(first[0].instruction,/vivaio/)
  assert.doesNotMatch(first[0].instruction,/favorevole per la messa/)
})
