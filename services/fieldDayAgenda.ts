import type { SupabaseClient } from '@supabase/supabase-js'
import type { Garden, GardenTask } from '@/types'
import { translateTaskType } from '@/utils/taskTranslations'
import { buildTaskExecutionUrl } from './taskExecutionLaunchService'
import type { GardenPlant } from '@/types/individualPlant'
import { calculateSeasonalWindows, classifyGardenType } from './seasonalSunWindows'
import { findPlantingWindows, adjustForPlantingMethod } from './plantingWindowOptimizer'
import { readPlantPhotoReport } from '@/types/plantPhotoReport'
import { assessPlantingWeatherWindow } from '@/logic/plantingWeatherDecisionEngine'
import { getMasterSheetSync } from './plantMasterService'
import { calculatePhotoperiodHours } from './photoperiodService'
import { generateWeatherAlerts, getWeatherForecast, type WeatherForecast } from './weatherService'
import type { PredictionBundle } from './agronomicPredictionPipelineService'

type Photo = { plant_id: string; captured_at: string; ai_analysis: unknown }
type Satellite = { data_date: string; ndvi_value: number; previousValue?: number }
type TerrainZone = { name: string; slope_percentage: number | null }
export type FieldAction = { id: string; date: string; title: string; instruction: string; href: string }
const dayMs = 86_400_000
const day = (date: Date) => date.toLocaleDateString('sv-SE')
const offset = (date: string, n: number) => new Date(Date.parse(date) + n * dayMs).toISOString().slice(0, 10)

// Six hours is the existing summer fruit-crop planning threshold. A shaded site needs a field check.
function checkLight(garden: Garden, name: string, status: string, recommendation: string) {
  if (status !== 'GO' || getMasterSheetSync(name)?.nutrientCategory !== 'FRUITING') return recommendation
  const limited = garden.sunExposure === 'Shade' || (garden.dailySunHours != null && garden.dailySunHours < 6)
  if (!limited) return recommendation
  return 'Finestra termica compatibile. Prima di confermare verifica quante ore di sole diretto raggiungono il filare in questa stagione: l’esposizione registrata indica luce limitata.'
}

export function fieldDayActions(garden: Garden, today: string, tasks: GardenTask[], plants: GardenPlant[],
  forecast: WeatherForecast[], photos: Photo[], satellite?: Satellite, prediction?: PredictionBundle, zones: TerrainZone[] = []): FieldAction[] {
  const actions: FieldAction[] = []
  const planner = '/app/planner?garden=' + encodeURIComponent(garden.id)
  const plantRoute = '/app/plants?garden=' + encodeURIComponent(garden.id)
  const weekEnd = offset(today, 6)
  const currentWeather = forecast.filter(f => f.date === today)
  const severe = generateWeatherAlerts(currentWeather).some(alert => alert.severity === 'HIGH')
  const fieldCheck = severe ? 'Rimanda il sopralluogo finché termina l’allerta meteo.' : 'Verifica sul posto prima di intervenire.'
  const crop = garden.primaryCrop?.canonicalPlantName
  const isActive = (t: GardenTask) => t.gardenId === garden.id && !t.finalHarvest && t.stage !== 'Harvested' &&
    t.lifecycleState !== 'Disposal' && t.operationalStatus !== 'cancelled'
  if (crop && garden.coordinates && !tasks.some(t => isActive(t) && ['Sowing','Transplant'].includes(t.taskType) && t.plantName?.toLowerCase() === crop.toLowerCase()) &&
      !plants.some(p => p.gardenId === garden.id && p.plantName?.toLowerCase() === crop.toLowerCase() && !['dead','harvested','transplanted'].includes(p.status))) {
    const {latitude,longitude} = garden.coordinates
    const obstacles = garden.obstacles ?? []
    const sheet = getMasterSheetSync(crop)
    let found = false
    for (const year of [Number(today.slice(0,4)), Number(today.slice(0,4))+1]) {
      const solar = calculateSeasonalWindows(latitude,longitude,obstacles,year)
      const window = findPlantingWindows(classifyGardenType(solar),solar,latitude,longitude,obstacles,year,garden.soilType,garden.altitudeMeters)
        .filter(w => day(w.endDate) >= today && w.recommendedPlants.some(name => name.toLowerCase() === crop.toLowerCase()))
        .sort((a,b) => a.startDate.getTime()-b.startDate.getTime())[0]
      if (!window) continue
      const seed = day(adjustForPlantingMethod(window,'Seed',sheet?.id).adjustedStartDate!)
      const field = day(window.startDate)
      const candidate = field < today ? today : field
      const direct = window.method === 'Seed' && !sheet?.requiredTools.seedTray
      const weather = assessPlantingWeatherWindow({operation:direct ? 'direct_sowing' : 'transplant',requestedDate:candidate,forecast,cropMinTemperature:direct ? sheet?.germination.minTemp : sheet?.transplanting.minTemp})
      actions.push({id:'start-'+crop,date:today,title:'Pianifica il primo impianto · '+crop,
        instruction:(garden.altitudeMeters == null ? 'Quota del terreno non registrata. ' : 'Quota del terreno '+garden.altitudeMeters+' m. ') + (garden.dailySunHours == null ? '' : 'Sole diretto registrato '+garden.dailySunHours+' ore. ') + 'Finestra stagionale stimata per il campo dal '+field+' al '+day(window.endDate)+'. ' +
          (sheet?.requiredTools.seedTray ? 'Da seme, avvio indicativo in semenzaio dal '+seed+'. ' : '') +
          (direct ? 'Da seme, controlla la temperatura del letto di semina. ' : 'Da vivaio, controlla lo sviluppo della piantina. ')+checkLight(garden,crop,weather.status,[weather.headline,...weather.reasons].join('. ')),href:planner})
      found = true
      break
    }
    if (!found) actions.push({id:'start-review',date:today,title:'Pianifica '+crop,instruction:'Il catalogo non fornisce una finestra locale per questa coltura. Registra il ciclo indicato per la varietà e scegli semina o trapianto nel planner.',href:planner})
  }
  const visibleWeather = forecast.filter(f => f.date >= today && f.date <= weekEnd)
  const rainDay = visibleWeather.find(f => f.rainMm > 0)
  for (const zone of zones) {
    if (Number(zone.slope_percentage) >= 12 && rainDay) {
      actions.push({id:'runoff-'+zone.name,date:today,title:'Verifica il deflusso · '+zone.name,
        instruction:'Pendenza registrata '+zone.slope_percentage+'%. Pioggia prevista il '+rainDay.date+' ('+rainDay.rainMm+' mm). Controlla ruscellamento a monte e ristagno a valle prima di irrigare o lavorare il suolo.',href:planner})
    }
  }
  for (const t of tasks) {
    if (!isActive(t)) continue
    const date = String(t.scheduledDate || t.date || '').slice(0, 10)
    if (!date || date > weekEnd) continue
    const start = t.taskType === 'Sowing' || t.taskType === 'Transplant'
    const sheet = start && t.plantName ? getMasterSheetSync(t.plantName) : null
    const label = t.taskType === 'Sowing' ? 'Semina' : 'Trapianto'
    let instruction: string
    let title: string
    if (t.completed) {
      if (!start || date > today || !sheet) continue
      const age = (Date.parse(today) - Date.parse(date)) / dayMs
      if (t.taskType === 'Sowing' && age >= sheet.germination.emergenceDays.min && age <= sheet.germination.emergenceDays.max && (!t.stage || t.stage === 'Germination')) {
        title = 'Controlla l’emergenza'
        instruction = 'Conta le piantine emerse e registra la fase. Semina registrata il ' + date + '.'
      } else if (t.taskType === 'Transplant' && age <= 3) {
        title = 'Controlla l’attecchimento'
        instruction = 'Verifica turgore e umidità vicino al pane di terra. Trapianto registrato il ' + date + '.'
      } else if (t.stage === 'ReadyToTransplant') {
        title = 'Prepara il trapianto'
        const window = assessPlantingWeatherWindow({operation:'transplant',requestedDate:today,forecast,cropMinTemperature:sheet.transplanting.minTemp})
        instruction = checkLight(garden,t.plantName,window.status,[sheet.seedlingCare.transplantWhen, window.headline, ...window.actions].join(' '))
      } else if (t.stage === 'Vegetative' && sheet.supportRequirements?.needsSupport) {
        title = 'Controlla i sostegni prima della fioritura'
        instruction = sheet.transplanting.finalPlanting?.supportInstallation?.instructions || 'Verifica i tutori e regola le legature lasciando spazio alla crescita.'
      } else if (t.stage === 'Flowering') {
        title = 'Controlla fioritura e allegagione'
        instruction = 'Registra la fase osservata e fotografa un campione di fiori e dei primi frutti.'
      } else if (t.stage === 'Fruiting') {
        title = 'Controlla la maturazione'
        const frost = forecast.find(f => f.date >= today && f.tempMin <= 0)
        const succession = t.rowId && tasks.find(next => isActive(next) && !next.completed && next.rowId === t.rowId &&
          ['Sowing','Transplant'].includes(next.taskType) && next.plantName !== t.plantName &&
          (next.scheduledDate || next.date) >= today && (next.scheduledDate || next.date) <= weekEnd)
        instruction = sheet.baseInstructions.harvestGuide + ' Fotografa la pianta intera e un frutto rappresentativo.'
        if (frost) instruction += ' Minima prevista '+frost.tempMin+' °C il '+frost.date+'. Verifica in anticipo cosa è raccoglibile e se proteggere la coltura.'
        else if (visibleWeather.length) instruction += ' Se la pianta continua a produrre, registra una raccolta parziale e mantieni il ciclo aperto.'
        if (succession) instruction += ' Sullo stesso filare è programmata la coltura successiva '+succession.plantName+'. Confronta il raccolto residuo con la data necessaria per liberare il filare.'
      } else continue
    } else if (start) {
      title = label + ' prevista il ' + date
      const protectedStart = ['Tray','Indoor','Greenhouse'].includes(t.locationType || '') || ['Indoor','Greenhouse'].includes(garden.gardenType || '')
      if (protectedStart) {
        const daylight = garden.coordinates && calculatePhotoperiodHours(garden.coordinates.latitude, new Date(date))
        instruction = 'Controlla temperatura del substrato e luce alla piantina.'
        if (sheet) instruction += ' Germinazione: ' + sheet.germination.idealTemp + '. ' + sheet.seedlingCare.lightNeeds
        if (typeof daylight === 'number' && sheet?.seedlingCare.lightHours) instruction += ' Luce naturale teorica ' + daylight.toFixed(1) + ' h, fabbisogno in vivaio ' + sheet.seedlingCare.lightHours + ' h. Verifica la luce effettiva sotto copertura.'
      } else {
        const assessment = assessPlantingWeatherWindow({operation:t.taskType === 'Sowing' ? 'direct_sowing' : 'transplant',
          requestedDate:date < today ? today : date, forecast, cropMinTemperature:t.taskType === 'Sowing' ? sheet?.germination.minTemp : sheet?.transplanting?.minTemp,
          cropMaxTemperature:sheet?.germination.maxTemp})
        instruction = checkLight(garden,t.plantName,assessment.status,[assessment.headline, ...assessment.reasons, ...assessment.actions].join(' '))
        if (t.taskType === 'Transplant' && sheet) instruction += ' Verifica la piantina: ' + sheet.seedlingCare.transplantWhen
      }
    } else {
      const operation = translateTaskType(t.taskType)
      title = operation + ' prevista il ' + date
      instruction = t.taskType === 'Harvest' ? 'Controlla i segni di maturità su più esemplari prima di raccogliere.' : 'Verifica il lavoro programmato e registra quantità ed esito dopo l’intervento.'
      const workDay = date < today ? today : date
      const weather = forecast.find(f => f.date === workDay)
      if (!weather) instruction += ' Meteo da verificare per il giorno del lavoro.'
      else if (generateWeatherAlerts([weather]).some(a => a.severity === 'HIGH')) instruction = 'Rimanda il lavoro all’aperto e rivaluta dopo l’allerta. ' + instruction
      else if (weather.rainMm > 0 && ['Irrigation','Treatment','Plowing','Tilling','Harrowing','Harvest'].includes(t.taskType)) {
        instruction += ' Pioggia prevista ('+weather.rainMm+' mm). Controlla la bagnatura e l’umidità del terreno e rivaluta il momento dell’intervento.'
      }
      if (t.notes) instruction += ' ' + t.notes
    }
    actions.push({id:t.id,date:date < today ? today : date,title:title + ' · ' + t.plantName,instruction:instruction + (severe && date <= today ? ' ' + fieldCheck : ''),href:(!t.completed && buildTaskExecutionUrl(t)) || planner})
  }
  const recent = photos.filter(p => p.captured_at.slice(0,10) >= offset(today,-3) && p.captured_at.slice(0,10) <= today)
  for (const plant of plants) {
    if (plant.gardenId !== garden.id || ['dead','harvested','transplanted'].includes(plant.status) || (plant.plantingDate && plant.plantingDate > today)) continue
    const latest = recent.find(p => p.plant_id === plant.id && readPlantPhotoReport(p.ai_analysis)?.maturity)
    const report = readPlantPhotoReport(latest?.ai_analysis)
    const due = plant.expectedHarvestDate && plant.expectedHarvestDate <= weekEnd && (!plant.plantingDate || plant.expectedHarvestDate >= plant.plantingDate)
    // NC State Extension gives 50 days after transplant as the early end for early-season tomatoes.
    // This opens a scouting window. The cultivar and the field observation determine harvest.
    const transplant = plant.transplantDate || ((plant.source === 'nursery' || plant.source === 'transplant' || plant.seedlingBatchId) && plant.plantingDate)
    const tomatoCheck = !plant.expectedHarvestDate && /^pomodor/i.test(plant.plantName) && transplant && transplant <= offset(weekEnd,-50)
    if (!due && !tomatoCheck && report?.maturity !== 'check_harvest') continue
    const href = plantRoute + '&plantId=' + encodeURIComponent(plant.id)
    const evidence = [plant.plantingDate && 'Impianto del ' + plant.plantingDate, due && 'raccolta prevista il ' + plant.expectedHarvestDate, tomatoCheck && 'verifica precoce dal trapianto del ' + transplant].filter(Boolean).join(', ')
    const instruction = report?.maturity === 'check_harvest'
      ? report.observation + ' ' + report.followUp + ' Conferma a mano la maturità dei singoli frutti prima della raccolta.'
      : report?.maturity === 'developing' ? report.observation + ' ' + report.followUp
      : 'Scatta una foto della pianta intera e un primo piano dell’organo da raccogliere. Analizza le foto nella scheda.'
    actions.push({id:'maturity-'+plant.id,date:today,title:'Verifica raccolta · '+plant.plantName+' · '+plant.plantCode,instruction:[evidence,instruction,fieldCheck].filter(Boolean).join('. '),href})
  }
  for (const risk of prediction?.diseasePredicitions ?? []) {
    const plant = plants.find(p => risk.id.startsWith(p.id + ':') && p.gardenId === garden.id && !['dead','harvested','transplanted'].includes(p.status))
    if (plant && ['HIGH','CRITICAL'].includes(risk.severity)) actions.push({id:risk.id,date:today,title:'Ispeziona '+plant.plantCode+' · rischio '+risk.disease,
      instruction:'Controlla questi segni: '+risk.symptoms.join(', ')+'. '+fieldCheck,href:plantRoute+'&plantId='+encodeURIComponent(plant.id)})
  }
  if (satellite && satellite.data_date >= offset(today,-14) && satellite.data_date <= today && (satellite.ndvi_value < 0.5 || (satellite.previousValue !== undefined && satellite.previousValue - satellite.ndvi_value > 0.05))) {
    actions.push({id:'satellite',date:today,title:'Controlla il vigore nell’area satellitare',instruction:'NDVI medio '+satellite.ndvi_value.toFixed(2)+' al '+satellite.data_date+(satellite.previousValue === undefined ? '' : ' (rilievo precedente '+satellite.previousValue.toFixed(2)+')')+'. Confronta copertura vegetale, suolo scoperto e fase colturale. '+fieldCheck,href:'/app/ndvi'})
  }
  return actions.sort((a,b) => a.date.localeCompare(b.date))
}

export async function loadFieldAgenda(db: SupabaseClient, garden: Garden, date: Date, tasks: GardenTask[], plants: GardenPlant[]) {
  const today = day(date)
  const satelliteHistory = () => db.from('ndvi_data_cache').select('data_date,ndvi_value,bbox,algorithm_version').eq('garden_id',garden.id).eq('source_kind','real').eq('quality_status','accepted')
      .gte('data_date',offset(today,-14)).lte('data_date',today).order('data_date',{ascending:false}).limit(30)
  const [satellite, photos, bundle, forecast, zones] = await Promise.all([
    satelliteHistory(),
    db.from('plant_photos').select('plant_id,captured_at,ai_analysis').eq('garden_id',garden.id).gte('captured_at',offset(today,-3)).lte('captured_at',date.toISOString())
      .not('ai_analysis','is',null).order('captured_at',{ascending:false}),
    db.from('agronomic_predictions').select('output_snapshot').eq('garden_id',garden.id).eq('status','generated')
      .lte('valid_from',date.toISOString()).gte('valid_until',date.toISOString()).order('valid_from',{ascending:false}).limit(1).maybeSingle(),
    garden.coordinates ? getWeatherForecast(garden.coordinates.latitude,garden.coordinates.longitude,10,garden.altitudeMeters) : Promise.resolve([]),
    db.from('irrigation_zones').select('name,slope_percentage').eq('garden_id',garden.id),
  ])
  const compareReadings = (rows: typeof satellite.data): Satellite | undefined => {
    const latest = rows?.[0]
    if (!latest) return undefined
    const previous = latest.bbox && rows?.find(row => row.data_date < latest.data_date &&
      row.algorithm_version === latest.algorithm_version && JSON.stringify(row.bbox) === JSON.stringify(latest.bbox))
    return {...latest,previousValue:previous?.ndvi_value}
  }
  let reading = compareReadings(satellite.data)
  if (!satellite.error && garden.coordinates && typeof window !== 'undefined' && (!reading || reading.data_date < offset(today,-5))) {
    const { NDVISatelliteService } = await import('./ndviSatelliteService')
    const refreshed = await NDVISatelliteService.getLatestNDVI(garden)
    if (refreshed?.quality_status === 'accepted') {
      const {data} = await satelliteHistory()
      reading = compareReadings(data) ?? reading
    }
  }
  const missing = [zones.error && 'pendenze delle zone', !reading && 'rilievo satellitare recente', photos.error && 'foto', bundle.error && 'previsioni agronomiche', !forecast.length && 'meteo'].filter(Boolean)
  return {actions:fieldDayActions(garden,today,tasks,plants,forecast,photos.data ?? [],reading,bundle.data?.output_snapshot,zones.data ?? []),missing}
}
