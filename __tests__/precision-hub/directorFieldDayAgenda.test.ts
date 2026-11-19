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

test('la finestra estiva si apre più tardi in quota a parità di luce e data', () => {
  const start = (altitudeMeters:number) => fieldDayActions({...garden,altitudeMeters,primaryCrop:{archetypeId:'MIX',label:'Pomodoro',canonicalPlantName:'Pomodoro'}},'2026-05-01',[],[],[],[])[0].instruction
  const windowStart = (s:string) => s.match(/campo dal (\d{4}-\d{2}-\d{2})/)?.[1]
  assert.ok(windowStart(start(950))! > windowStart(start(50))!)
})

test('pioggia sul pendio e calo di vigore generano sopralluoghi distinti', () => {
  const wet = [{...forecast[0],rainMm:8}]
  const actions = fieldDayActions(garden,today,[],[],wet,[],{data_date:today,ndvi_value:0.59,previousValue:0.72},undefined,[{name:'Pendio',slope_percentage:15},{name:'Piano',slope_percentage:0}])
  assert.deepEqual(actions.map(a=>a.id),['runoff-Pendio','satellite'])
})

test('a novembre una coltura in fruttificazione resta aperta e la successione interessa solo il filare pianificato', () => {
  const date = '2026-11-19'
  const crop = {id:'tom',gardenId:'g',plantName:'Pomodoro',taskType:'Transplant',completed:true,date:'2026-05-10',rowId:'F1',stage:'Fruiting'} as GardenTask
  const next = {...crop,id:'next',plantName:'Fava',taskType:'Sowing',completed:false,date:'2026-11-23'} as GardenTask
  const run = (rowId:string) => fieldDayActions(garden,date,[crop,{...next,rowId}],[],[{...forecast[0],date,tempMin:13}],[]).find(a=>a.id==='tom')!.instruction
  assert.match(run('F1'),/parziale.*Fava/)
  assert.doesNotMatch(run('F2'),/Fava/)
})

test('il settimo giorno è valutato con i due giorni successivi senza mostrare le attività della settimana dopo', () => {
  const weather = Array.from({length:10},(_,i)=>({...forecast[0],date:'2026-06-'+(17+i),tempMin:18}))
  weather[7].tempMin = -1
  const task = {id:'last',gardenId:'g',taskType:'Transplant',plantName:'Pomodoro',date:'2026-06-23'} as GardenTask
  const actions = fieldDayActions(garden,today,[task,{...task,id:'next',date:'2026-06-24'}],[],weather,[])
  assert.deepEqual(actions.map(a=>a.id),['last'])
  assert.match(actions[0].instruction,/Rimanda/)
  const shaded = fieldDayActions({...garden,dailySunHours:3,sunExposure:'Shade'},today,[{...task,date:today}],[],weather,[])
  assert.match(shaded[0].instruction,/luce limitata/)
})
