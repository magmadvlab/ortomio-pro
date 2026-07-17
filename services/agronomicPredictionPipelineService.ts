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

export const PREDICTION_MODEL_VERSION = 'ortomio-deterministic-v2'
export const PREDICTION_RULE_VERSION = 'agronomic-rules-2026-07-17'

export type CanonicalPredictionInput = {
  gardenId: string
  asOf: string
  weather?: WeatherData
  soil?: SoilData
  plants: PlantHealthData[]
  tasks: GardenTask[]
  provenance: {
    weatherRecordedAt?: string
    soilRecordedAt?: string
    plantRecordedAt?: string
    sensorBacked: boolean
  }
}

export type PredictionBundle = {
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

const buildYieldPredictions = (input: CanonicalPredictionInput, confidence: number): YieldPrediction[] => {
  if (!input.weather || !input.soil) return []
  const groups = new Map<string, PlantHealthData[]>()
  for (const plant of input.plants) {
    const key = plant.plantName.trim()
    groups.set(key, [...(groups.get(key) ?? []), plant])
  }
  const reference = new Date(input.asOf)
  return Array.from(groups.entries()).flatMap(([plantName, plants]) => {
    const baseline = baseYield[plantName.toLocaleLowerCase('it-IT')]
    if (!baseline) return []
    const avgHealth = plants.reduce((sum, plant) => sum + plant.healthScore, 0) / plants.length
    const soilScore = Math.min(100, 50 + (input.soil!.ph >= 6 && input.soil!.ph <= 7 ? 20 : 10) + (input.soil!.nutrients.organicMatter > 3 ? 15 : 0))
    const weatherImpact = Math.max(-0.3, Math.min(0.3, -Math.abs(input.weather!.temperature.current - 22) * 0.01 + (input.weather!.humidity >= 60 && input.weather!.humidity <= 70 ? 0.1 : 0)))
    const healthImpact = (avgHealth - 75) / 100
    const soilImpact = (soilScore - 75) / 200
    const expectedYield = round(baseline * (1 + healthImpact) * (1 + soilImpact) * (1 + weatherImpact))
    const harvestDays = 60
    return [{
      id: `yield:${plantName}:${input.asOf.slice(0, 10)}`,
      plantName,
      variety: plants[0].variety || 'Non specificata',
      expectedYield,
      yieldRange: { min: round(expectedYield * 0.8), max: round(expectedYield * 1.2), confidence },
      harvestWindow: {
        start: isoDay(addDays(reference, harvestDays - 7)),
        optimal: isoDay(addDays(reference, harvestDays)),
        end: isoDay(addDays(reference, harvestDays + 7)),
      },
      qualityScore: Math.max(0, Math.min(100, Math.round(75 + (avgHealth - 75) * 0.3 + (soilScore - 75) * 0.2))),
      factors: [
        { factor: 'Salute piante', impact: round(healthImpact, 4), description: `Punteggio salute medio ${Math.round(avgHealth)}%`, controllable: true },
        { factor: 'Qualita suolo', impact: round(soilImpact, 4), description: `Qualita suolo ${Math.round(soilScore)}%`, controllable: true },
        { factor: 'Condizioni meteo', impact: round(weatherImpact, 4), description: 'Snapshot meteo persistito', controllable: false },
      ],
      recommendations: ['Confrontare la previsione con resa e qualita misurate a raccolta'],
    }]
  })
}

const buildResourceOptimizations = (input: CanonicalPredictionInput): ResourceOptimization[] => {
  if (!input.weather || !input.soil) return []
  const currentWater = input.tasks
    .filter(task => ['Watering', 'Irrigation', 'Irrigazione'].includes(task.taskType))
    .reduce((sum, task) => sum + (typeof task.quantity === 'number' ? task.quantity : 0), 0)
  const forecastRain = input.weather.precipitation.forecast15Days.reduce((sum, value) => sum + value, 0)
  const neededWater = input.plants.length * 2 * (1 + input.weather.temperature.current * 0.02)
  const optimizedWater = Math.max(0, neededWater - forecastRain * 0.8)
  if (!(currentWater > optimizedWater)) return []
  const saving = currentWater - optimizedWater
  return [{
    id: `water:${input.asOf.slice(0, 10)}`,
    type: 'WATER',
    currentUsage: round(currentWater),
    optimizedUsage: round(optimizedWater),
    savings: { amount: round(saving), percentage: round((saving / currentWater) * 100), cost: round(saving * 0.002) },
    schedule: [],
    recommendations: ['Validare il piano con misura locale e volume effettivamente erogato'],
  }]
}

export const buildPredictionBundle = (input: CanonicalPredictionInput): PredictionBundle => {
  const missingSignals: string[] = []
  if (!input.weather) missingSignals.push('persisted_weather')
  if (!input.soil) missingSignals.push('soil_analysis_and_moisture')
  if (input.plants.length === 0) missingSignals.push('observed_plant_health')
  const inputHash = hashPredictionInput(input)
  const validFrom = new Date(input.asOf)
  const validUntil = addDays(validFrom, 15)
  if (missingSignals.length > 0) {
    return {
      status: 'insufficient_data', missingSignals, inputHash,
      modelVersion: PREDICTION_MODEL_VERSION, ruleVersion: PREDICTION_RULE_VERSION,
      sourceQuality: 'insufficient', confidence: null, horizonDays: 15,
      validFrom: validFrom.toISOString(), validUntil: validUntil.toISOString(),
      diseasePredicitions: [], yieldPredictions: [], resourceOptimizations: [],
    }
  }

  const timestamps = [input.provenance.weatherRecordedAt, input.provenance.soilRecordedAt, input.provenance.plantRecordedAt]
    .filter((value): value is string => Boolean(value))
  const oldestAgeHours = timestamps.reduce((max, timestamp) => Math.max(max, (validFrom.getTime() - new Date(timestamp).getTime()) / 3_600_000), 0)
  const confidence = round(Math.max(0.45, Math.min(0.9, 0.9 - Math.max(0, oldestAgeHours - 24) * 0.002)), 4)
  return {
    status: 'generated', missingSignals, inputHash,
    modelVersion: PREDICTION_MODEL_VERSION, ruleVersion: PREDICTION_RULE_VERSION,
    sourceQuality: input.provenance.sensorBacked ? 'measured' : 'mixed', confidence,
    horizonDays: 15, validFrom: validFrom.toISOString(), validUntil: validUntil.toISOString(),
    diseasePredicitions: buildDiseasePredictions(input, confidence),
    yieldPredictions: buildYieldPredictions(input, confidence),
    resourceOptimizations: buildResourceOptimizations(input),
  }
}

const finite = (...values: unknown[]) => {
  for (const value of values) {
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

export async function loadCanonicalPredictionInput(
  supabase: SupabaseClient,
  gardenId: string,
  asOf = new Date()
): Promise<CanonicalPredictionInput> {
  const [tasksResult, weatherResult, soilResult, plantsResult, sensorsResult] = await Promise.all([
    supabase.from('garden_tasks').select('*').eq('garden_id', gardenId).order('date', { ascending: false }).limit(500),
    supabase.from('daily_weather_log').select('*').eq('garden_id', gardenId).order('log_date', { ascending: false }).limit(15),
    supabase.from('soil_analysis').select('*').eq('garden_id', gardenId).order('analysis_date', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('garden_plants').select('*').eq('garden_id', gardenId).neq('status', 'harvested').neq('status', 'dead').limit(1000),
    supabase.from('sensor_readings').select('*').eq('garden_id', gardenId).gte('recorded_at', new Date(asOf.getTime() - 48 * 3_600_000).toISOString()).order('recorded_at', { ascending: false }).limit(200),
  ])
  const tasks = (tasksResult.data ?? []).map((row: any) => ({
    id: row.id, gardenId: row.garden_id, plantName: row.plant_name, variety: row.variety,
    taskType: row.task_type, date: row.date, completed: Boolean(row.completed), quantity: finite(row.quantity), notes: row.notes,
  })) as GardenTask[]
  const weatherRows = weatherResult.data ?? []
  const latestWeather: any = weatherRows[0]
  const rawWeather = latestWeather?.raw_data
  const latestSensors = sensorsResult.data ?? []
  const sensor = (type: string) => latestSensors.find((row: any) => row.sensor_type === type)
  const humiditySensor: any = sensor('humidity')
  const moistureSensor: any = sensor('soil_moisture')
  const windSensor: any = sensor('wind_speed')
  const tempCurrent = finite(
    nested(rawWeather, ['snapshot', 'weather', 'temperatureCelsius']),
    latestWeather?.temperature_max !== undefined && latestWeather?.temperature_min !== undefined
      ? (Number(latestWeather.temperature_max) + Number(latestWeather.temperature_min)) / 2
      : undefined
  )
  const humidity = finite(humiditySensor?.value, nested(rawWeather, ['snapshot', 'weather', 'humidityPercentage']), nested(rawWeather, ['humidity']))
  const forecastTemps = weatherRows.map((row: any) => finite(row.temperature_max, row.temperature_min)).filter((value): value is number => value !== undefined)
  const forecastRain = weatherRows.map((row: any) => finite(row.precipitation_mm) ?? 0)
  const weather = tempCurrent !== undefined && humidity !== undefined ? {
    temperature: {
      current: tempCurrent,
      min: finite(latestWeather?.temperature_min, tempCurrent)!,
      max: finite(latestWeather?.temperature_max, tempCurrent)!,
      forecast15Days: forecastTemps,
    },
    humidity,
    precipitation: { current: finite(latestWeather?.precipitation_mm) ?? 0, forecast15Days: forecastRain },
    windSpeed: finite(windSensor?.value, nested(rawWeather, ['snapshot', 'weather', 'windSpeedKmh'])) ?? 0,
    pressure: finite(sensor('pressure')?.value) ?? 1013,
    uvIndex: finite(nested(rawWeather, ['uvIndex'])) ?? 0,
    soilTemperature: finite(sensor('temperature')?.value, tempCurrent)!,
  } satisfies WeatherData : undefined
  const soilRow: any = soilResult.data
  const soilMoisture = finite(moistureSensor?.value)
  const soil = soilRow && soilMoisture !== undefined ? {
    ph: finite(soilRow.ph_value) ?? 7,
    ec: finite(soilRow.electrical_conductivity) ?? 0,
    moisture: soilMoisture,
    temperature: finite(sensor('temperature')?.value, tempCurrent) ?? 20,
    nutrients: {
      nitrogen: finite(soilRow.nitrogen_ppm) ?? 0,
      phosphorus: finite(soilRow.phosphorus_ppm) ?? 0,
      potassium: finite(soilRow.potassium_ppm) ?? 0,
      organicMatter: finite(soilRow.organic_matter_percent) ?? 0,
    },
    compaction: 0,
    lastAnalysis: soilRow.analysis_date,
  } satisfies SoilData : undefined
  const plants = (plantsResult.data ?? []).map((row: any) => ({
    plantId: row.id, plantName: row.plant_name, variety: row.variety,
    healthScore: finite(row.health_score) ?? 0, growthStage: row.status || 'unknown',
    stressIndicators: [], diseases: row.status === 'diseased' ? ['observed_status_diseased'] : [], pests: [],
    nutritionalStatus: { nitrogen: 'ADEQUATE', phosphorus: 'ADEQUATE', potassium: 'ADEQUATE' },
    lastUpdate: row.updated_at || row.created_at,
  })) as PlantHealthData[]
  return {
    gardenId,
    asOf: asOf.toISOString(),
    weather,
    soil,
    plants,
    tasks,
    provenance: {
      weatherRecordedAt: latestWeather?.log_date ? `${latestWeather.log_date}T12:00:00.000Z` : undefined,
      soilRecordedAt: soilRow?.analysis_date ? `${soilRow.analysis_date}T12:00:00.000Z` : undefined,
      plantRecordedAt: plants.map(plant => plant.lastUpdate).sort().at(-1),
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
  const { data: existing } = await supabase.from('agronomic_predictions').select('*')
    .eq('garden_id', input.gardenId).eq('input_hash', bundle.inputHash)
    .eq('model_version', bundle.modelVersion).eq('rule_version', bundle.ruleVersion).maybeSingle()
  if (existing) return existing
  const { data, error } = await supabase.from('agronomic_predictions').insert({
    user_id: userId, garden_id: input.gardenId, status: bundle.status,
    input_hash: bundle.inputHash, input_snapshot: input, output_snapshot: bundle,
    missing_signals: bundle.missingSignals, model_version: bundle.modelVersion,
    rule_version: bundle.ruleVersion, source_quality: bundle.sourceQuality,
    confidence: bundle.confidence, horizon_days: bundle.horizonDays,
    valid_from: bundle.validFrom, valid_until: bundle.validUntil,
  }).select('*').single()
  if (error || !data) throw new Error(error?.message ?? 'prediction_persistence_failed')
  return data
}
