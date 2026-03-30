import type {
  IrrigationSystem,
  IrrigationWaterQualityProfile,
  IrrigationWaterQualityReading,
  IrrigationWaterSource,
} from '@/types/irrigation'
import {
  getLatestSensorReading,
  type SensorReading,
} from '@/services/sensorDataService'

interface ResolveIrrigationWaterQualityProfileInput {
  gardenId: string
  zoneId: string
  systems?: IrrigationSystem[]
  maxAgeHours?: number
}

const WATER_SOURCE_LABELS: Record<IrrigationWaterSource, string> = {
  Municipal: 'rete / acquedotto',
  Well: 'pozzo',
  Consortium: 'consorzio irriguo',
  Rainwater: 'acqua piovana',
  River: 'fiume o canale',
  Pond: 'laghetto o invaso',
  Tank: 'serbatoio',
}

const buildMetric = (
  reading: SensorReading | null,
  fallbackUnit: string
): IrrigationWaterQualityReading | undefined => {
  if (!reading) {
    return undefined
  }

  return {
    value: Number(reading.value.toFixed(2)),
    unit: reading.unit || fallbackUnit,
    measuredAt: reading.reading_date,
    source: 'sensor',
    sensorType: reading.sensor_type,
  }
}

const pickWaterSource = (systems?: IrrigationSystem[]): IrrigationWaterSource | undefined => {
  const sources = systems?.map((system) => system.waterSource).filter(Boolean) as IrrigationWaterSource[] | undefined
  if (!sources || sources.length === 0) {
    return undefined
  }

  const counts = new Map<IrrigationWaterSource, number>()
  sources.forEach((source) => {
    counts.set(source, (counts.get(source) || 0) + 1)
  })

  return Array.from(counts.entries()).sort((left, right) => right[1] - left[1])[0]?.[0]
}

export async function resolveIrrigationWaterQualityProfile(
  input: ResolveIrrigationWaterQualityProfileInput
): Promise<IrrigationWaterQualityProfile | null> {
  const maxAgeHours = input.maxAgeHours ?? 168

  const [
    waterSalinity,
    fallbackSalinity,
    waterPh,
    fallbackPh,
    bicarbonates,
  ] = await Promise.all([
    getLatestSensorReading(input.gardenId, 'water_salinity', input.zoneId, maxAgeHours),
    getLatestSensorReading(input.gardenId, 'salinity', input.zoneId, maxAgeHours),
    getLatestSensorReading(input.gardenId, 'water_ph', input.zoneId, maxAgeHours),
    getLatestSensorReading(input.gardenId, 'ph', input.zoneId, maxAgeHours),
    getLatestSensorReading(input.gardenId, 'water_bicarbonates', input.zoneId, maxAgeHours),
  ])

  const salinityMetric = buildMetric(waterSalinity || fallbackSalinity, 'ppt')
  const phMetric = buildMetric(waterPh || fallbackPh, 'pH')
  const bicarbonatesMetric = buildMetric(bicarbonates, 'mg/L')
  const waterSource = pickWaterSource(input.systems)

  if (!salinityMetric && !phMetric && !bicarbonatesMetric && !waterSource) {
    return null
  }

  let qualityScore = 100
  const riskFlags: string[] = []
  const recommendations: string[] = []
  const notes: string[] = []
  let leachingFractionPercent: number | undefined

  if (salinityMetric) {
    if (salinityMetric.value > 2.2) {
      qualityScore -= 32
      leachingFractionPercent = 15
      riskFlags.push('salinita elevata')
      recommendations.push('Valuta una frazione di lisciviazione e controlli EC/salinita piu frequenti.')
    } else if (salinityMetric.value > 1.2) {
      qualityScore -= 16
      leachingFractionPercent = 8
      riskFlags.push('salinita moderata')
      recommendations.push('Monitora accumulo salino e risposta idrica, soprattutto in suoli pesanti o sensibili.')
    }

    notes.push(`Salinita acqua ${salinityMetric.value} ${salinityMetric.unit}.`)
  }

  if (phMetric) {
    if (phMetric.value < 5.5 || phMetric.value > 8.4) {
      qualityScore -= 22
      riskFlags.push('pH fuori range irriguo')
      recommendations.push('Verifica compatibilita con fertirrigazione e rischio di squilibri nutrizionali.')
    } else if (phMetric.value < 6 || phMetric.value > 7.8) {
      qualityScore -= 10
      riskFlags.push('pH da monitorare')
    }

    notes.push(`pH acqua ${phMetric.value}.`)
  }

  if (bicarbonatesMetric) {
    if (bicarbonatesMetric.value > 400) {
      qualityScore -= 24
      riskFlags.push('bicarbonati elevati')
      recommendations.push('Controlla rischio di precipitazioni, intasamenti e deriva del pH in fertirrigazione.')
    } else if (bicarbonatesMetric.value > 180) {
      qualityScore -= 10
      riskFlags.push('bicarbonati moderati')
    }

    notes.push(`Bicarbonati ${bicarbonatesMetric.value} ${bicarbonatesMetric.unit}.`)
  }

  if (waterSource) {
    switch (waterSource) {
      case 'Well':
        recommendations.push('Su acqua di pozzo conviene mantenere storico stagionale di salinita e bicarbonati.')
        break
      case 'Consortium':
      case 'River':
      case 'Pond':
        recommendations.push('Fonte superficiale o consortile: verifica variazioni stagionali e torbidita prima dei picchi irrigui.')
        break
      case 'Rainwater':
        recommendations.push('Acqua piovana: controlla pH e stabilita del serbatoio dopo eventi intensi o lunghi stoccaggi.')
        break
      default:
        break
    }
  }

  qualityScore = Math.max(35, Math.min(100, Math.round(qualityScore)))

  const qualityBand: IrrigationWaterQualityProfile['qualityBand'] =
    qualityScore >= 88
      ? 'optimal'
      : qualityScore >= 72
        ? 'acceptable'
        : qualityScore >= 55
          ? 'caution'
          : 'critical'

  return {
    waterSource,
    sourceLabel: waterSource ? WATER_SOURCE_LABELS[waterSource] : undefined,
    salinity: salinityMetric,
    ph: phMetric,
    bicarbonates: bicarbonatesMetric,
    qualityBand,
    qualityScore,
    leachingFractionPercent,
    riskFlags,
    recommendations: Array.from(new Set(recommendations)),
    notes,
  }
}
