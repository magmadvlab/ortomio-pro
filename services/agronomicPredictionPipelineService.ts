import { readPlantPhotoReport } from '@/types/plantPhotoReport'
import { createHash } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { GardenTask } from '@/types'
import type {
  DiseasePredicition,
  ResourceOptimization,
  YieldPrediction,
  WeatherData,
  SoilData,
  PlantHealthData,
} from '@/services/aiPredictiveEngine'
import { calculateAltitudeDelay } from '@/utils/altitudeUtils'
import type { PersistedForecastSnapshot } from '@/types/environmental'

export const PREDICTION_MODEL_VERSION = 'ortomio-deterministic-v3'
export const PREDICTION_RULE_VERSION = 'agronomic-rules-2026-11-19-operation-totals'

export type PredictionPlant = PlantHealthData & {
  plantingDate?: string
  expectedHarvestDate?: string
  // Only a validated crop-specific duration may be supplied. No universal 60 days.
  cycle?: { minDays: number; maxDays: number; ruleId: string }
}

export type WaterComparison = {
  startDate: string
  endDate: string
  actualLiters: number
  requiredLiters: number
  costPerLiter?: number
}

export type OperationTotal = {
  kind: 'watering' | 'work' | 'fertilizing' | 'treatment'
  field_row_id: string | null
  bed_row_id: string | null
  product: string | null
  unit: string | null
  executions: number
  total: number | null
}

export type PhotoFollowUp = { plantId: string; fieldRowId: string | null; plantCode: string; capturedAt: string; observation: string; followUp: string }
export type CanonicalPredictionInput = {
  photoFollowUps?: PhotoFollowUp[]
  recentOperations?: OperationTotal[]
  operationFeedback?: { measured_records: number; recorded_work_cost: number | null }
  gardenId: string
  asOf: string
  altitudeMeters?: number
  weather?: WeatherData
  soil?: SoilData
  plants: PredictionPlant[]
  tasks: GardenTask[]
  forecast?: PersistedForecastSnapshot[]
  waterComparison?: WaterComparison
  loadErrors?: string[]
  provenance: {
    weatherRecordedAt?: string
    soilRecordedAt?: string
    plantRecordedAt?: string
    sensorBacked: boolean
  }
}

export type PredictionBundle = {
  photoFollowUps?: PhotoFollowUp[]
  recentOperations?: OperationTotal[]
  operationFeedback?: { measured_records: number; recorded_work_cost: number | null }
  status: 'generated' | 'insufficient_data'
  missingSignals: string[]
  inputHash: string
  modelVersion: string
  ruleVersion: string
  sourceQuality: 'measured' | 'mixed' | 'estimated' | 'insufficient'
  confidence: number | null
  horizonDays: number
  validFrom: string
  validUntil: string
  diseasePredicitions: DiseasePredicition[]
  yieldPredictions: YieldPrediction[]
  resourceOptimizations: ResourceOptimization[]
}

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)])
    )
  }
  return value
}

export const hashPredictionInput = (input: CanonicalPredictionInput) =>
  createHash('sha256').update(JSON.stringify(canonicalize(input))).digest('hex')

const round = (value: number, digits = 2) => Number(value.toFixed(digits))
const isoDay = (date: Date) => date.toISOString().slice(0, 10)
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86_400_000)

const baseYield: Record<string, number> = {
  pomodoro: 8,
  lattuga: 2.5,
  carota: 3,
  zucchina: 6,
  peperone: 4,
  melanzana: 5,
  basilico: 1.5,
  prezzemolo: 1,
}

const buildDiseasePredictions = (input: CanonicalPredictionInput, confidence: number): DiseasePredicition[] => {
  if (!input.weather || !input.soil) return []
  const result: DiseasePredicition[] = []
  for (const plant of input.plants) {
    const rules = [
      { disease: 'Peronospora', humidity: 80, min: 15, max: 25, leadTime: 7, impact: 3, ruleConfidence: 0.85 },
      { disease: 'Oidio', humidity: 70, min: 20, max: 30, leadTime: 5, impact: 2, ruleConfidence: 0.75 },
    ]
    for (const rule of rules) {
      let probability = 0.1
      if (input.weather.humidity > rule.humidity) probability += 0.4
      if (input.weather.temperature.current >= rule.min && input.weather.temperature.current <= rule.max) probability += 0.3
      if (plant.healthScore < 70) probability += 0.2
      if (input.soil.moisture > 80) probability += 0.1
      probability = Math.min(1, probability)
      if (probability <= 0.3) continue
      const weighted = probability * rule.impact
      const severity = weighted >= 2.5 ? 'CRITICAL' : weighted >= 2 ? 'HIGH' : weighted >= 1.5 ? 'MEDIUM' : 'LOW'
      result.push({
        id: `${plant.plantId}:${rule.disease}:${input.asOf.slice(0, 10)}`,
        plantName: plant.plantName,
        disease: rule.disease,
        probability: round(probability, 4),
        severity,
        leadTime: rule.leadTime,
        symptoms: rule.disease === 'Peronospora' ? ['Macchie gialle su foglie', 'Muffa bianca sotto foglie'] : ['Polvere bianca su foglie', 'Deformazione foglie'],
        preventiveMeasures: ['Migliorare ventilazione', 'Evitare bagnature fogliari non necessarie'],
        treatments: ['Verificare diagnosi, disponibilita prodotto, meteo e intervallo di carenza prima di applicare'],
        confidence: round(Math.min(confidence, rule.ruleConfidence), 4),
        weatherFactors: [
          { factor: 'Umidita', impact: input.weather.humidity > rule.humidity ? 'NEGATIVE' : 'POSITIVE', weight: 0.4, description: `Umidita ${input.weather.humidity}%` },
          { factor: 'Temperatura', impact: input.weather.temperature.current >= rule.min && input.weather.temperature.current <= rule.max ? 'NEGATIVE' : 'POSITIVE', weight: 0.3, description: `Temperatura ${input.weather.temperature.current} C` },
        ],
        riskFactors: [
          { factor: 'Salute osservata', riskLevel: plant.healthScore < 70 ? 'HIGH' : plant.healthScore < 85 ? 'MEDIUM' : 'LOW', mitigation: ['Confermare i sintomi sul campo'] },
          { factor: 'Umidita suolo', riskLevel: input.soil.moisture > 80 ? 'HIGH' : 'LOW', mitigation: ['Verificare drenaggio e misura locale'] },
        ],
      })
    }
  }
  return result.sort((left, right) => right.probability - left.probability)
}

export function resolveHarvestWindow(plant: PredictionPlant, altitudeMeters = 0): YieldPrediction['harvestWindow'] | null {
  const parseDay = (value?: string) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value ? new Date(value) : null
  const planted = parseDay(plant.plantingDate)
  const expected = parseDay(plant.expectedHarvestDate)
  if (expected && (!planted || expected >= planted)) {
    // An explicitly recorded expected date already includes local adjustments.
    const date = isoDay(expected)
    return { start: date, optimal: date, end: date }
  }
  const cycle = plant.cycle
  if (!planted || !cycle?.ruleId || !Number.isFinite(cycle.minDays) || !Number.isFinite(cycle.maxDays) ||
      cycle.minDays <= 0 || cycle.maxDays < cycle.minDays) return null
  const delay = calculateAltitudeDelay(altitudeMeters)
  return {
    start: isoDay(addDays(planted, cycle.minDays + delay)),
    optimal: isoDay(addDays(planted, Math.round((cycle.minDays + cycle.maxDays) / 2) + delay)),
    end: isoDay(addDays(planted, cycle.maxDays + delay)),
  }
}

const buildYieldPredictions = (input: CanonicalPredictionInput, confidence: number): YieldPrediction[] => {
  if (!input.weather || !input.soil) return []
  const groups = new Map<string, PredictionPlant[]>()
  for (const plant of input.plants) {
    // Separate cycles/varieties: a younger plant must not inherit another's date.
    const window = resolveHarvestWindow(plant, input.altitudeMeters)
    if (!window) continue
    const key = JSON.stringify([plant.plantName.trim(), plant.variety, window])
    groups.set(key, [...(groups.get(key) ?? []), plant])
  }
  return Array.from(groups.entries()).flatMap(([key, plants]) => {
    const plantName = plants[0].plantName.trim()
    const baseline = baseYield[plantName.toLocaleLowerCase('it-IT')]
    if (!baseline) return []
    const avgHealth = plants.reduce((sum, plant) => sum + plant.healthScore, 0) / plants.length
    const soilScore = Math.min(100, 50 + (input.soil!.ph >= 6 && input.soil!.ph <= 7 ? 20 : 10) + (input.soil!.nutrients.organicMatter > 3 ? 15 : 0))
    const weatherImpact = Math.max(-0.3, Math.min(0.3, -Math.abs(input.weather!.temperature.current - 22) * 0.01 + (input.weather!.humidity >= 60 && input.weather!.humidity <= 70 ? 0.1 : 0)))
    const healthImpact = (avgHealth - 75) / 100
    const soilImpact = (soilScore - 75) / 200
    const expectedYield = round(baseline * (1 + healthImpact) * (1 + soilImpact) * (1 + weatherImpact))
    return [{
      id: `yield:${createHash('sha256').update(key).digest('hex').slice(0, 16)}:${input.asOf.slice(0, 10)}`,
      plantName,
      variety: plants[0].variety || 'Non specificata',
      expectedYield,
      yieldRange: { min: round(expectedYield * 0.8), max: round(expectedYield * 1.2), confidence },
      harvestWindow: resolveHarvestWindow(plants[0], input.altitudeMeters)!,
      qualityScore: Math.max(0, Math.min(100, Math.round(75 + (avgHealth - 75) * 0.3 + (soilScore - 75) * 0.2))),
      factors: [
        { factor: 'Salute piante', impact: round(healthImpact, 4), description: `Punteggio salute medio ${Math.round(avgHealth)}%`, controllable: true },
        { factor: 'Qualita suolo', impact: round(soilImpact, 4), description: `Qualita suolo ${Math.round(soilScore)}%`, controllable: true },
        { factor: 'Condizioni meteo', impact: round(weatherImpact, 4), description: 'Snapshot meteo persistito', controllable: false },
      ],
      recommendations: ['Stima sperimentale: confrontare con resa e qualità misurate a raccolta',
        plants[0].expectedHarvestDate ? 'Data attesa registrata per questa coltivazione; confermare sul campo' : `Finestra ancorata all’impianto, regola ${plants[0].cycle?.ruleId}`],
    }]
  })
}

const buildResourceOptimizations = (input: CanonicalPredictionInput): ResourceOptimization[] => {
  const comparison = input.waterComparison
  if (!comparison || !Number.isFinite(comparison.actualLiters) || !Number.isFinite(comparison.requiredLiters) ||
      comparison.actualLiters < 0 || comparison.requiredLiters < 0 ||
      comparison.startDate > comparison.endDate || comparison.endDate > input.asOf.slice(0, 10)) return []
  const currentWater = comparison.actualLiters
  const optimizedWater = comparison.requiredLiters
  if (!(currentWater > optimizedWater)) return []
  const saving = currentWater - optimizedWater
  return [{
    id: `water:${input.asOf.slice(0, 10)}`,
    type: 'WATER',
    comparisonKind: 'historical_requirement',
    period: { start: comparison.startDate, end: comparison.endDate },
    currentUsage: round(currentWater),
    optimizedUsage: round(optimizedWater),
    savings: { amount: round(saving), percentage: round((saving / currentWater) * 100),
      cost: comparison.costPerLiter !== undefined && Number.isFinite(comparison.costPerLiter) && comparison.costPerLiter >= 0 ? round(saving * comparison.costPerLiter) : null },
    schedule: [],
    recommendations: ['Confronto retrospettivo tra litri erogati e fabbisogni persistiti per le stesse zone e date; non è un risparmio futuro garantito',
      'Verificare sul campo la causa dello scostamento prima di cambiare il piano irriguo'],
  }]
}

export const buildPredictionBundle = (input: CanonicalPredictionInput): PredictionBundle => {
  const missingSignals: string[] = []
  if (!input.weather) missingSignals.push('persisted_weather')
  if (!input.soil) missingSignals.push('soil_analysis_and_moisture')
  if (input.plants.length === 0) missingSignals.push('observed_plant_health')
  missingSignals.push(...(input.loadErrors ?? []))
  const inputHash = hashPredictionInput(input)
  const validFrom = new Date(input.asOf)
  if (!Number.isFinite(validFrom.getTime())) throw new Error('invalid_prediction_date')
  const validUntil = addDays(validFrom, 15)
  if (missingSignals.length > 0) {
    return {
      photoFollowUps: input.photoFollowUps, recentOperations: input.recentOperations, operationFeedback: input.operationFeedback,
      status: 'insufficient_data', missingSignals, inputHash,
      modelVersion: PREDICTION_MODEL_VERSION, ruleVersion: PREDICTION_RULE_VERSION,
      sourceQuality: 'insufficient', confidence: null, horizonDays: 15,
      validFrom: validFrom.toISOString(), validUntil: validUntil.toISOString(),
      diseasePredicitions: [], yieldPredictions: [], resourceOptimizations: [],
    }
  }

  const allTimestamps = [input.provenance.weatherRecordedAt, input.provenance.soilRecordedAt, input.provenance.plantRecordedAt]
  const timestamps = allTimestamps.filter((value): value is string => Boolean(value) && Number.isFinite(Date.parse(value!)) && Date.parse(value!) <= validFrom.getTime())
  if (timestamps.length < allTimestamps.length) missingSignals.push('source_timestamps')
  if (!input.forecast?.length) missingSignals.push('dated_weather_forecast')
  for (const plant of input.plants) {
    if (!resolveHarvestWindow(plant, input.altitudeMeters)) missingSignals.push(`harvest_cycle:${plant.plantId}`)
  }
  if (!input.waterComparison) missingSignals.push('comparable_irrigation_volumes')
  const oldestAgeHours = timestamps.reduce((max, timestamp) => Math.max(max, (validFrom.getTime() - new Date(timestamp).getTime()) / 3_600_000), 0)
  const confidence = round(Math.max(0, Math.min(timestamps.length === 3 ? 0.9 : 0.35, 0.9 - Math.max(0, oldestAgeHours - 24) * 0.002)), 4)
  return {
    photoFollowUps: input.photoFollowUps, recentOperations: input.recentOperations, operationFeedback: input.operationFeedback,
    status: 'generated', missingSignals, inputHash,
    modelVersion: PREDICTION_MODEL_VERSION, ruleVersion: PREDICTION_RULE_VERSION,
    sourceQuality: timestamps.length < 3 ? 'estimated' : 'mixed', confidence,
    horizonDays: 15, validFrom: validFrom.toISOString(), validUntil: validUntil.toISOString(),
    diseasePredicitions: buildDiseasePredictions(input, confidence),
    yieldPredictions: buildYieldPredictions(input, confidence),
    resourceOptimizations: buildResourceOptimizations(input),
  }
}

const finite = (...values: unknown[]) => {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue
    const number = typeof value === 'string' ? Number(value) : value
    if (typeof number === 'number' && Number.isFinite(number)) return number
  }
  return undefined
}

const nested = (value: unknown, path: string[]) => {
  let current: unknown = value
  for (const key of path) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

interface TaskRow {
  id: string
  garden_id: string
  plant_name: string
  variety?: string | null
  task_type: string
  date: string
  completed: boolean
  quantity?: number | string | null
  notes?: string | null
}

interface WeatherLogRow {
  log_date: string
  raw_data?: unknown
  temp_max?: number | string | null
  temp_min?: number | string | null
  humidity_avg?: number | string | null
  temperature_max?: number | string | null
  temperature_min?: number | string | null
  precipitation_mm?: number | string | null
}

interface SensorRow {
  sensor_type: string
  value: number | string
  unit: string
  recorded_at: string
  is_simulated: boolean
}

interface SoilRow {
  ph_value?: number | string | null
  electrical_conductivity?: number | string | null
  nitrogen_ppm?: number | string | null
  phosphorus_ppm?: number | string | null
  potassium_ppm?: number | string | null
  organic_matter_percent?: number | string | null
  analysis_date: string
}

interface PlantRow {
  id: string
  plant_name: string
  variety?: string | null
  health_score?: number | string | null
  status?: string | null
  updated_at?: string | null
  created_at: string
  planting_date?: string | null
  expected_harvest_date?: string | null
}

export function selectDatedForecast(rows: WeatherLogRow[], asOf: Date): PersistedForecastSnapshot[] {
  const byDay = new Map<string, PersistedForecastSnapshot>()
  const today = asOf.toISOString().slice(0, 10)
  const lastDay = isoDay(addDays(asOf, 14))
  for (const row of rows) {
    const snapshots = nested(row.raw_data, ['forecastSnapshots'])
    if (!Array.isArray(snapshots)) continue
    for (const value of snapshots) {
      const entry = value as PersistedForecastSnapshot
      const generated = Date.parse(entry.generatedAt)
      if (entry.source !== 'open_meteo_forecast' || !Number.isFinite(generated) ||
          generated > asOf.getTime() || asOf.getTime() - generated > 48 * 3_600_000 ||
          !/^\d{4}-\d{2}-\d{2}$/.test(entry.forecastDate) ||
          entry.forecastDate < today || entry.forecastDate > lastDay ||
          !Number.isFinite(entry.precipitationMm) || entry.precipitationMm < 0 ||
          !Number.isFinite(entry.tempMin) || !Number.isFinite(entry.tempMax) || entry.tempMin > entry.tempMax) continue
      const previous = byDay.get(entry.forecastDate)
      if (!previous || generated > Date.parse(previous.generatedAt)) byDay.set(entry.forecastDate, entry)
    }
  }
  return [...byDay.values()].sort((a, b) => a.forecastDate.localeCompare(b.forecastDate))
}

type WaterLogRow = { id: string; zone_id: string; date: string; liters_applied: number | string; completed: boolean }
type RequirementRow = { zone_id: string; calculation_date: string; recommended_volume_liters: number | string; created_at: string }

export function compareRecordedWater(logs: WaterLogRow[], requirements: RequirementRow[], startDate: string, endDate: string): WaterComparison | undefined {
  const requirementsByDay = new Map<string, RequirementRow>()
  for (const row of requirements) {
    if (row.calculation_date < startDate || row.calculation_date > endDate || finite(row.recommended_volume_liters) === undefined || Number(row.recommended_volume_liters) < 0) continue
    const key = `${row.zone_id}:${row.calculation_date}`
    const previous = requirementsByDay.get(key)
    if (!previous || row.created_at > previous.created_at) requirementsByDay.set(key, row)
  }
  const actualByDay = new Map<string, number>()
  const seen = new Set<string>()
  for (const row of logs) {
    const liters = finite(row.liters_applied)
    if (!row.completed || seen.has(row.id) || row.date < startDate || row.date > endDate || liters === undefined || liters < 0) continue
    seen.add(row.id)
    const key = `${row.zone_id}:${row.date}`
    // Partial coverage cannot be presented as a whole-period comparison.
    if (!requirementsByDay.has(key)) return undefined
    actualByDay.set(key, (actualByDay.get(key) ?? 0) + liters)
  }
  if (!actualByDay.size) return undefined
  return { startDate, endDate,
    actualLiters: [...actualByDay.values()].reduce((sum, liters) => sum + liters, 0),
    requiredLiters: [...actualByDay.keys()].reduce((sum, key) => sum + Number(requirementsByDay.get(key)!.recommended_volume_liters), 0),
  }
}

async function loadWaterComparison(supabase: SupabaseClient, gardenId: string, asOf: Date): Promise<WaterComparison | undefined> {
  // Closed days only: today's partial execution is not a daily consumption.
  const endDate = isoDay(addDays(asOf, -1))
  const startDate = isoDay(addDays(asOf, -15))
  const logs: WaterLogRow[] = []
  const requirements: RequirementRow[] = []
  for (let offset = 0; ; offset += 1000) {
    const result = await supabase.from('watering_logs').select('id,zone_id,date,liters_applied,completed')
      .eq('garden_id', gardenId).not('zone_id', 'is', null).gte('date', startDate).lte('date', endDate).eq('completed', true).order('id').range(offset, offset + 999)
    if (result.error) return undefined
    logs.push(...(result.data ?? []))
    if ((result.data?.length ?? 0) < 1000) break
  }
  const zoneIds = [...new Set(logs.map(row => row.zone_id).filter(Boolean))]
  if (!zoneIds.length) return undefined
  for (let offset = 0; ; offset += 1000) {
    const result = await supabase.from('water_requirements').select('zone_id,calculation_date,recommended_volume_liters,created_at')
      .in('zone_id', zoneIds).gte('calculation_date', startDate).lte('calculation_date', endDate).order('id').range(offset, offset + 999)
    if (result.error) return undefined
    requirements.push(...(result.data ?? []))
    if ((result.data?.length ?? 0) < 1000) break
  }
  return compareRecordedWater(logs, requirements, startDate, endDate)
}

export async function loadCanonicalPredictionInput(
  supabase: SupabaseClient,
  gardenId: string,
  asOf = new Date()
): Promise<CanonicalPredictionInput> {
  const [tasksResult, weatherResult, soilResult, plantsResult, sensorsResult, gardenResult, waterComparison, operations, feedback, photos] = await Promise.all([
    supabase.from('garden_tasks').select('*').eq('garden_id', gardenId).order('date', { ascending: false }).limit(500),
    supabase.from('daily_weather_log').select('*').eq('garden_id', gardenId).lte('log_date', isoDay(asOf)).order('log_date', { ascending: false }).limit(15),
    supabase.from('soil_analysis').select('*').eq('garden_id', gardenId).order('analysis_date', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('garden_plants').select('*').eq('garden_id', gardenId).neq('status', 'harvested').neq('status', 'dead').limit(1000),
    supabase.from('sensor_readings').select('*').eq('garden_id', gardenId).eq('is_simulated', false).lte('recorded_at', asOf.toISOString()).gte('recorded_at', new Date(asOf.getTime() - 48 * 3_600_000).toISOString()).order('recorded_at', { ascending: false }).limit(200),
    supabase.from('gardens').select('altitude_meters').eq('id', gardenId).maybeSingle(),
    loadWaterComparison(supabase, gardenId, asOf),
    supabase.rpc('field_operation_totals', {
      p_garden: gardenId, p_start: isoDay(addDays(asOf, -14)), p_end: isoDay(asOf),
    }),
    supabase.rpc('field_feedback_summary', {
      p_garden: gardenId, p_start: isoDay(addDays(asOf, -14)), p_end: isoDay(asOf),
    }).single(),
    supabase.from('plant_photos').select('plant_id,field_row_id,plant_code,captured_at,ai_analysis')
      .eq('garden_id',gardenId).lte('ai_analysis->>analyzedAt',asOf.toISOString()).gte('captured_at',addDays(asOf,-14).toISOString())
      .lte('captured_at',asOf.toISOString()).order('captured_at',{ascending:false}).order('id').limit(500),
  ])
  const tasks = ((tasksResult.data ?? []) as TaskRow[]).map((row) => ({
    id: row.id, gardenId: row.garden_id, plantName: row.plant_name, variety: row.variety,
    taskType: row.task_type, date: row.date, completed: Boolean(row.completed), quantity: finite(row.quantity), notes: row.notes,
  })) as GardenTask[]
  const weatherRows = (weatherResult.data ?? []) as WeatherLogRow[]
  const latestWeather = weatherRows[0]
  const rawWeather = latestWeather?.raw_data
  const latestSensors = (sensorsResult.data ?? []) as SensorRow[]
  const sensor = (type: string, units: string[]) => latestSensors.find(row => row.sensor_type === type && row.is_simulated === false && units.includes(row.unit) && finite(row.value) !== undefined && Date.parse(row.recorded_at) <= asOf.getTime() && Date.parse(row.recorded_at) >= asOf.getTime() - 48 * 3600000)
  const humiditySensor = sensor('humidity_air', ['%'])
  const moistureSensor = sensor('moisture', ['%'])
  const windSensor = sensor('wind', ['km/h'])
  const tempCurrent = finite(
    nested(rawWeather, ['snapshot', 'weather', 'temperatureCelsius']),
    finite(latestWeather?.temp_max, latestWeather?.temperature_max) !== undefined && finite(latestWeather?.temp_min, latestWeather?.temperature_min) !== undefined
      ? (finite(latestWeather?.temp_max, latestWeather?.temperature_max)! + finite(latestWeather?.temp_min, latestWeather?.temperature_min)!) / 2
      : undefined
  )
  const humidity = finite(humiditySensor?.value, latestWeather?.humidity_avg, nested(rawWeather, ['snapshot', 'weather', 'humidityPercentage']), nested(rawWeather, ['humidity']))
  const forecast = selectDatedForecast(weatherRows, asOf)
  const forecastTemps = forecast.map(row => row.tempMax)
  const forecastRain = forecast.map(row => row.precipitationMm)
  const weather = tempCurrent !== undefined && humidity !== undefined ? {
    temperature: {
      current: tempCurrent,
      min: finite(latestWeather?.temp_min, latestWeather?.temperature_min, tempCurrent)!,
      max: finite(latestWeather?.temp_max, latestWeather?.temperature_max, tempCurrent)!,
      forecast15Days: forecastTemps,
    },
    humidity,
    precipitation: { current: finite(latestWeather?.precipitation_mm) ?? 0, forecast15Days: forecastRain },
    windSpeed: finite(windSensor?.value, nested(rawWeather, ['snapshot', 'weather', 'windSpeedKmh'])) ?? 0,
    pressure: finite(sensor('pressure', ['hPa'])?.value) ?? 1013,
    uvIndex: finite(nested(rawWeather, ['uvIndex'])) ?? 0,
    soilTemperature: finite(sensor('temperature_soil', ['°C', 'C'])?.value, tempCurrent)!,
  } satisfies WeatherData : undefined
  const soilRow = soilResult.data as SoilRow | null
  const soilMoisture = finite(moistureSensor?.value)
  const soil = soilRow && soilMoisture !== undefined ? {
    ph: finite(soilRow.ph_value) ?? 7,
    ec: finite(soilRow.electrical_conductivity) ?? 0,
    moisture: soilMoisture,
    temperature: finite(sensor('temperature_soil', ['°C', 'C'])?.value, tempCurrent) ?? 20,
    nutrients: {
      nitrogen: finite(soilRow.nitrogen_ppm) ?? 0,
      phosphorus: finite(soilRow.phosphorus_ppm) ?? 0,
      potassium: finite(soilRow.potassium_ppm) ?? 0,
      organicMatter: finite(soilRow.organic_matter_percent) ?? 0,
    },
    compaction: 0,
    lastAnalysis: soilRow.analysis_date,
  } satisfies SoilData : undefined
  const activePlants = (plantsResult.data ?? []) as PlantRow[]
  const activePlantIds = new Set(activePlants.map(plant => plant.id))
  const plants = activePlants.filter(row => finite(row.health_score) !== undefined).map((row) => ({
    plantId: row.id, plantName: row.plant_name, variety: row.variety,
    healthScore: finite(row.health_score) ?? 0, growthStage: row.status || 'unknown',
    stressIndicators: [], diseases: row.status === 'diseased' ? ['observed_status_diseased'] : [], pests: [],
    nutritionalStatus: { nitrogen: 'ADEQUATE', phosphorus: 'ADEQUATE', potassium: 'ADEQUATE' },
    lastUpdate: row.updated_at || row.created_at,
    plantingDate: row.planting_date || undefined,
    expectedHarvestDate: row.expected_harvest_date || undefined,
  })) as PredictionPlant[]
  return {
    gardenId,
    asOf: asOf.toISOString(),
    altitudeMeters: finite((gardenResult.data as { altitude_meters?: number | string | null } | null)?.altitude_meters),
    weather,
    soil,
    plants,
    tasks,
    forecast,
    waterComparison,
    recentOperations: operations.data ?? undefined,
    photoFollowUps: (photos.data ?? []).flatMap(photo => {
      const report = readPlantPhotoReport(photo.ai_analysis)
      return report && activePlantIds.has(photo.plant_id) ? [{
        plantId: photo.plant_id, fieldRowId: photo.field_row_id, plantCode: photo.plant_code ?? '',
        capturedAt: photo.captured_at, observation: report.observation, followUp: report.followUp,
      }] : []
    }),
    operationFeedback: feedback.data as CanonicalPredictionInput['operationFeedback'],
    loadErrors: [weatherResult, soilResult, plantsResult, sensorsResult, gardenResult, operations, feedback, photos]
      .flatMap((result, index) => result.error ? [`source_read_failed:${['weather', 'soil', 'plants', 'sensors', 'garden', 'operations', 'feedback', 'photos'][index]}`] : []),
    provenance: {
      weatherRecordedAt: latestWeather?.log_date ? `${latestWeather.log_date}T00:00:00.000Z` : undefined,
      soilRecordedAt: soilRow?.analysis_date ? new Date(soilRow.analysis_date).toISOString() : undefined,
      plantRecordedAt: plants.map(plant => plant.lastUpdate).sort().at(0),
      sensorBacked: Boolean(humiditySensor && moistureSensor),
    },
  }
}

export async function persistPredictionBundle(
  supabase: SupabaseClient,
  userId: string,
  input: CanonicalPredictionInput,
  bundle: PredictionBundle
) {
  const findExisting = () => supabase.from('agronomic_predictions').select('*')
    .eq('garden_id', input.gardenId).eq('input_hash', bundle.inputHash)
    .eq('model_version', bundle.modelVersion).eq('rule_version', bundle.ruleVersion).maybeSingle()
  const { data: existing } = await findExisting()
  if (existing) return existing
  const { data, error } = await supabase.from('agronomic_predictions').insert({
    user_id: userId, garden_id: input.gardenId, status: bundle.status,
    idempotency_key: [bundle.modelVersion, bundle.ruleVersion, bundle.inputHash].join(':'),
    input_hash: bundle.inputHash, input_snapshot: input, output_snapshot: bundle,
    missing_signals: bundle.missingSignals, model_version: bundle.modelVersion,
    rule_version: bundle.ruleVersion, source_quality: bundle.sourceQuality,
    confidence: bundle.confidence, horizon_days: bundle.horizonDays,
    valid_from: bundle.validFrom, valid_until: bundle.validUntil,
  }).select('*').single()
  if (error?.code === '23505') {
    const { data: concurrent } = await findExisting()
    if (concurrent) return concurrent
  }
  if (error || !data) throw new Error(error?.message ?? 'prediction_persistence_failed')
  return data
}
