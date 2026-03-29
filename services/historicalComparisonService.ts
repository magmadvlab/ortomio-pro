/**
 * Historical Comparison Service
 * Confronto storico reale tra strategie prescrittive basato su ledger operativo
 */

import {
  getPrescriptionExecutionEfficacySummary,
  getPrescriptionExecutionOutcomeSummary,
  getPrescriptionExecutionVarianceSummary,
  type PrescriptionExecutionEfficacySummary,
  type PrescriptionExecutionOutcomeSummary,
  type PrescriptionExecutionVarianceSummary,
} from './prescriptionExecutionService'
import { buildPrescriptionAgronomicIntelligenceSummary } from './prescriptionAgronomicIntelligenceService'
import type { IStorageProvider } from '../packages/core/storage/interface'
import type {
  HistoricalComparisonRequest,
  HistoricalComparisonResult,
  PrescriptionMap,
  TrendAnalysis,
} from '../types/prescriptionMaps'

export interface SeasonalOptimizationSuggestion {
  season: string
  mapType: string
  suggestedChanges: {
    zoneId: string
    currentRate: number
    suggestedRate: number
    reasoning: string
    expectedImprovement: number
    confidence: number
  }[]
  estimatedBenefits: {
    costSavings: number
    yieldIncrease: number
    environmentalImpact: number
  }
}

interface HistoricalMapSnapshot {
  map: PrescriptionMap
  varianceSummary: PrescriptionExecutionVarianceSummary
  outcomeSummary: PrescriptionExecutionOutcomeSummary
  efficacySummary: PrescriptionExecutionEfficacySummary
  averageApplicationRate: number
  averageExpectedOutcome: number
  averageYieldKg?: number
  latestOutcomeAt?: string
}

type HistoricalComparisonStorage = Pick<
  IStorageProvider,
  'getGarden' | 'getPrescriptionMap' | 'getPrescriptionMaps' | 'getPrescriptionExecutionRecords' | 'getQualityResults'
>

const METRIC_FALLBACKS = ['application_rate', 'quality', 'cost'] as const

const SEVERITY_SCORE: Record<'urgent' | 'high' | 'medium' | 'low', number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
}

const getSeasonKey = (
  dateString: string
): HistoricalComparisonResult['seasonalPatterns'][number]['season'] => {
  const month = new Date(dateString).getUTCMonth() + 1
  if (month === 12 || month <= 2) return 'winter'
  if (month <= 5) return 'spring'
  if (month <= 8) return 'summer'
  return 'autumn'
}

const average = (values: number[]) => (
  values.length > 0
    ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2))
    : 0
)

const stdDeviation = (values: number[]) => {
  if (values.length <= 1) {
    return 0
  }

  const avg = average(values)
  const variance = values.reduce((sum, value) => sum + ((value - avg) ** 2), 0) / values.length
  return Number(Math.sqrt(variance).toFixed(2))
}

const clamp = (value: number, min: number, max: number) => (
  Math.min(Math.max(value, min), max)
)

const normalizedZoneKey = (zoneName: string, zoneNumber?: number) => (
  `${String(zoneNumber || '').trim()}::${zoneName.trim().toLowerCase()}`
)

const getMetricValue = (snapshot: HistoricalMapSnapshot, metric: string) => {
  switch (metric) {
    case 'application_rate':
      return snapshot.averageApplicationRate
    case 'yield':
      return snapshot.averageYieldKg ?? snapshot.outcomeSummary.averageOutcomeScore
    case 'cost':
      return snapshot.map.costSavings || 0
    case 'quality':
      return snapshot.outcomeSummary.averageOutcomeScore || snapshot.map.qualityScore || 0
    case 'environmental':
      return snapshot.map.inputReduction || 0
    default:
      return snapshot.efficacySummary.averageEfficacyScore
  }
}

const calculateChangeRate = (values: number[]) => {
  if (values.length < 2) {
    return 0
  }

  const first = values[0] ?? 0
  const last = values[values.length - 1] ?? 0

  if (first === 0) {
    return Number(last.toFixed(2))
  }

  return Number((((last - first) / Math.abs(first)) * 100).toFixed(2))
}

const calculateTrendDirection = (
  values: number[]
): HistoricalComparisonResult['temporalTrends'][number]['trend'] => {
  if (values.length < 2) {
    return 'stable'
  }

  const deltas = values.slice(1).map((value, index) => value - values[index]!)
  const positives = deltas.filter((delta) => delta > 0.5).length
  const negatives = deltas.filter((delta) => delta < -0.5).length
  const range = Math.max(...values) - Math.min(...values)

  if (positives > 0 && negatives > 0 && range >= 5) {
    return 'cyclical'
  }

  const changeRate = calculateChangeRate(values)
  if (changeRate >= 5) {
    return 'increasing'
  }
  if (changeRate <= -5) {
    return 'decreasing'
  }

  return 'stable'
}

const calculateTrendConfidence = (values: number[], sourceScores: number[]) => {
  if (values.length === 0) {
    return 0
  }

  const coverage = Math.min(1, values.length / 4)
  const spread = Math.min(1, Math.abs(calculateChangeRate(values)) / 40)
  const quality = Math.min(1, average(sourceScores) / 100)
  return Number(clamp((coverage * 0.35) + (spread * 0.2) + (quality * 0.45), 0.45, 0.97).toFixed(2))
}

const pearsonCorrelation = (pairs: Array<{ x: number; y: number }>) => {
  if (pairs.length < 2) {
    return 0
  }

  const meanX = average(pairs.map((pair) => pair.x))
  const meanY = average(pairs.map((pair) => pair.y))

  const numerator = pairs.reduce((sum, pair) => (
    sum + ((pair.x - meanX) * (pair.y - meanY))
  ), 0)
  const denominatorX = Math.sqrt(pairs.reduce((sum, pair) => sum + ((pair.x - meanX) ** 2), 0))
  const denominatorY = Math.sqrt(pairs.reduce((sum, pair) => sum + ((pair.y - meanY) ** 2), 0))

  if (denominatorX === 0 || denominatorY === 0) {
    return 0
  }

  return Number((numerator / (denominatorX * denominatorY)).toFixed(2))
}

const getDaysBetween = (start: string, end?: string) => {
  if (!end) {
    return undefined
  }

  const delta = new Date(end).getTime() - new Date(start).getTime()
  if (Number.isNaN(delta) || delta < 0) {
    return undefined
  }

  return Number((delta / (1000 * 60 * 60 * 24)).toFixed(1))
}

export class HistoricalComparisonService {
  private storageProvider: HistoricalComparisonStorage

  constructor(storageProvider: HistoricalComparisonStorage) {
    this.storageProvider = storageProvider
  }

  async performHistoricalComparison(
    request: HistoricalComparisonRequest
  ): Promise<HistoricalComparisonResult> {
    const snapshots = await this.loadHistoricalSnapshots(request)

    if (snapshots.length < 2) {
      throw new Error('Servono almeno 2 mappe storiche nello stesso periodo per il confronto')
    }

    const temporalTrends = this.buildTemporalTrends(
      snapshots,
      request.analysisMetrics.length > 0 ? request.analysisMetrics : [...METRIC_FALLBACKS]
    )
    const zoneEvolution = this.buildZoneEvolution(snapshots)
    const seasonalPatterns = this.buildSeasonalPatterns(snapshots)
    const treatmentResponse = this.buildTreatmentResponse(snapshots)
    const yieldCorrelation = this.buildYieldCorrelation(snapshots)
    const insights = this.buildInsights(
      request.comparisonType,
      snapshots,
      temporalTrends,
      zoneEvolution,
      seasonalPatterns,
      treatmentResponse,
      yieldCorrelation
    )
    const quality = this.buildQualityMetrics(request, snapshots)

    return {
      success: true,
      comparisonId: crypto.randomUUID(),
      temporalTrends,
      zoneEvolution,
      seasonalPatterns,
      treatmentResponse,
      yieldCorrelation,
      insights,
      quality,
    }
  }

  async generateSeasonalOptimizations(
    gardenId: string,
    mapType: string,
    seasons: string[]
  ): Promise<SeasonalOptimizationSuggestion[]> {
    if (!this.storageProvider?.getPrescriptionMaps) {
      return []
    }

    const maps: PrescriptionMap[] = await this.storageProvider.getPrescriptionMaps(gardenId)
    const relevantMaps = maps.filter((map) => map.mapType === mapType)
    const snapshots = await Promise.all(relevantMaps.map((map) => this.buildHistoricalSnapshot(map)))

    return seasons.map((season) => {
      const seasonalSnapshots = snapshots.filter((snapshot) => getSeasonKey(snapshot.map.generationDate) === season)
      const avgRate = average(seasonalSnapshots.map((snapshot) => snapshot.averageApplicationRate))
      const avgEfficacy = average(seasonalSnapshots.map((snapshot) => snapshot.efficacySummary.averageEfficacyScore))
      const weakestMap = [...seasonalSnapshots].sort(
        (left, right) => left.efficacySummary.averageEfficacyScore - right.efficacySummary.averageEfficacyScore
      )[0]

      return {
        season,
        mapType,
        suggestedChanges: weakestMap?.map.zones.slice(0, 3).map((zone) => ({
          zoneId: zone.id,
          currentRate: zone.prescription.applicationRate,
          suggestedRate: Number((zone.prescription.applicationRate * (avgEfficacy < 60 ? 0.92 : 1.03)).toFixed(2)),
          reasoning: avgEfficacy < 60
            ? 'La stagione mostra efficacia debole: conviene rientrare verso una dose piu prudente e controllabile.'
            : 'La stagione risponde bene: si puo consolidare la dose performante come riferimento operativo.',
          expectedImprovement: Number(Math.abs(avgEfficacy - 70).toFixed(1)),
          confidence: Number(clamp(avgEfficacy / 100, 0.45, 0.92).toFixed(2)),
        })) || [],
        estimatedBenefits: {
          costSavings: Number((avgRate * 0.08).toFixed(2)),
          yieldIncrease: Number((avgEfficacy * 0.12).toFixed(2)),
          environmentalImpact: Number(clamp(100 - avgRate / 2, 20, 90).toFixed(2)),
        },
      }
    })
  }

  async analyzeTrends(
    gardenId: string,
    metrics: string[],
    timeframe: string
  ): Promise<TrendAnalysis[]> {
    if (!this.storageProvider?.getPrescriptionMaps) {
      return []
    }

    const maps: PrescriptionMap[] = await this.storageProvider.getPrescriptionMaps(gardenId)
    const snapshots = await Promise.all(maps.map((map) => this.buildHistoricalSnapshot(map)))
    const sortedSnapshots = snapshots.sort(
      (left, right) => new Date(left.map.generationDate).getTime() - new Date(right.map.generationDate).getTime()
    )

    return metrics.map((metric) => {
      const values = sortedSnapshots.map((snapshot) => getMetricValue(snapshot, metric))
      const direction = calculateTrendDirection(values)
      const magnitude = Math.abs(calculateChangeRate(values))
      const lastValue = values[values.length - 1] ?? 0
      const nextPeriod = Number((lastValue * (1 + (magnitude / 100))).toFixed(2))

      return {
        metric,
        timeframe,
        trend: {
          direction: direction === 'increasing' ? 'up' : direction === 'decreasing' ? 'down' : 'stable',
          magnitude: Number(magnitude.toFixed(2)),
          acceleration: Number((magnitude / Math.max(values.length, 1)).toFixed(2)),
          seasonality: direction === 'cyclical',
        },
        forecast: {
          nextPeriod,
          confidence: calculateTrendConfidence(
            values,
            sortedSnapshots.map((snapshot) => snapshot.map.qualityScore)
          ),
          range: {
            min: Number((nextPeriod * 0.92).toFixed(2)),
            max: Number((nextPeriod * 1.08).toFixed(2)),
          },
        },
        drivers: [
          {
            factor: 'efficacia_esecuzione',
            impact: Number((average(sortedSnapshots.map((snapshot) => snapshot.efficacySummary.averageEfficacyScore)) / 100).toFixed(2)),
            confidence: 0.82,
          },
          {
            factor: 'coerenza_operativa',
            impact: Number((average(sortedSnapshots.map((snapshot) => snapshot.varianceSummary.averageAdherenceScore)) / 100).toFixed(2)),
            confidence: 0.79,
          },
        ],
      }
    })
  }

  private async loadHistoricalSnapshots(
    request: HistoricalComparisonRequest
  ): Promise<HistoricalMapSnapshot[]> {
    const maps = await this.loadHistoricalMaps(request.mapIds)
    const filteredMaps = maps
      .filter((map) => {
        const timestamp = new Date(map.generationDate).getTime()
        return (
          timestamp >= new Date(request.timeRange.startDate).getTime()
          && timestamp <= new Date(request.timeRange.endDate).getTime()
        )
      })
      .sort((left, right) => new Date(left.generationDate).getTime() - new Date(right.generationDate).getTime())

    return Promise.all(filteredMaps.map((map) => this.buildHistoricalSnapshot(map)))
  }

  private async loadHistoricalMaps(mapIds: string[]): Promise<PrescriptionMap[]> {
    const getPrescriptionMap = this.storageProvider?.getPrescriptionMap
    if (!getPrescriptionMap) {
      throw new Error('Storage provider non supporta getPrescriptionMap')
    }

    const maps = await Promise.all(
      mapIds.map((mapId: string) => getPrescriptionMap(mapId))
    )
    return maps.filter((map: PrescriptionMap | null): map is PrescriptionMap => Boolean(map))
  }

  private async buildHistoricalSnapshot(map: PrescriptionMap): Promise<HistoricalMapSnapshot> {
    const [varianceSummary, outcomeSummary, efficacySummary] = await Promise.all([
      getPrescriptionExecutionVarianceSummary(this.storageProvider, map),
      getPrescriptionExecutionOutcomeSummary(this.storageProvider, map),
      getPrescriptionExecutionEfficacySummary(this.storageProvider, map),
    ])

    const averageApplicationRate = average(
      map.zones.map((zone) => zone.prescription.applicationRate)
    )
    const averageExpectedOutcome = average(
      map.zones
        .map((zone) => zone.prescription.expectedOutcome?.yieldIncrease ?? zone.prescription.expectedOutcome?.costReduction)
        .filter((value): value is number => typeof value === 'number')
    )
    const yieldValues = outcomeSummary.zoneOutcomes
      .map((zone) => zone.latestQualityResult?.marketableYieldKg)
      .filter((value): value is number => typeof value === 'number')
    const latestOutcomeAt = outcomeSummary.zoneOutcomes
      .map((zone) => zone.outcomeRecordedAt)
      .filter((value): value is string => Boolean(value))
      .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0]

    return {
      map,
      varianceSummary,
      outcomeSummary,
      efficacySummary,
      averageApplicationRate,
      averageExpectedOutcome,
      averageYieldKg: yieldValues.length > 0 ? average(yieldValues) : undefined,
      latestOutcomeAt,
    }
  }

  private buildTemporalTrends(
    snapshots: HistoricalMapSnapshot[],
    metrics: string[]
  ): HistoricalComparisonResult['temporalTrends'] {
    return metrics.map((metric) => {
      const dataPoints = snapshots.map((snapshot) => ({
        date: snapshot.map.generationDate,
        value: getMetricValue(snapshot, metric),
        mapId: snapshot.map.id,
      }))
      const values = dataPoints.map((point) => point.value)

      return {
        metric,
        trend: calculateTrendDirection(values),
        changeRate: calculateChangeRate(values),
        confidence: calculateTrendConfidence(
          values,
          snapshots.map((snapshot) => snapshot.map.qualityScore)
        ),
        dataPoints,
      }
    })
  }

  private buildZoneEvolution(
    snapshots: HistoricalMapSnapshot[]
  ): HistoricalComparisonResult['zoneEvolution'] {
    const groupedZones = new Map<string, Array<{
      zoneId: string
      zoneName: string
      zoneNumber: number
      map: PrescriptionMap
      variance?: PrescriptionExecutionVarianceSummary['zoneVariances'][number]
      outcome?: PrescriptionExecutionOutcomeSummary['zoneOutcomes'][number]
      efficacy?: PrescriptionExecutionEfficacySummary['zoneScores'][number]
      zoneDataQuality: number
      applicationRate: number
      expectedOutcome: number
    }>>()

    snapshots.forEach((snapshot) => {
      snapshot.map.zones.forEach((zone) => {
        const key = normalizedZoneKey(zone.zoneName, zone.zoneNumber)
        const current = groupedZones.get(key) || []
        current.push({
          zoneId: zone.id,
          zoneName: zone.zoneName,
          zoneNumber: zone.zoneNumber,
          map: snapshot.map,
          variance: snapshot.varianceSummary.zoneVariances.find((item) => item.zoneId === zone.id),
          outcome: snapshot.outcomeSummary.zoneOutcomes.find((item) => item.zoneId === zone.id),
          efficacy: snapshot.efficacySummary.zoneScores.find((item) => item.zoneId === zone.id),
          zoneDataQuality: zone.dataQuality,
          applicationRate: zone.prescription.applicationRate,
          expectedOutcome: zone.prescription.expectedOutcome?.yieldIncrease
            ?? zone.prescription.expectedOutcome?.costReduction
            ?? snapshot.map.qualityScore,
        })
        groupedZones.set(key, current)
      })
    })

    return [...groupedZones.values()]
      .map((group) => {
        const evolution = group
          .sort((left, right) => new Date(left.map.generationDate).getTime() - new Date(right.map.generationDate).getTime())
          .map((entry) => ({
            date: entry.map.generationDate,
            mapId: entry.map.id,
            applicationRate: entry.applicationRate,
            dataQuality: entry.zoneDataQuality,
            expectedOutcome: Number(entry.expectedOutcome.toFixed(2)),
            actualOutcome: entry.outcome?.outcomeScore,
          }))

        const actualScores = evolution
          .map((entry) => entry.actualOutcome)
          .filter((value): value is number => typeof value === 'number')
        const performanceScore = actualScores.length > 0
          ? average(actualScores)
          : average(group.map((entry) => entry.variance?.adherenceScore || 0))

        const recommendations: string[] = []
        const latest = group[group.length - 1]
        const oldest = group[0]

        if (performanceScore < 55) {
          recommendations.push('Zona storicamente debole: conviene ritarare dose e copertura prima del prossimo ciclo.')
        }
        if ((latest?.variance?.varianceStatus === 'off_target' || latest?.variance?.varianceStatus === 'partial')) {
          recommendations.push('L’aderenza esecutiva recente non e sufficiente: verificare macchina, operatore o regola automatica.')
        }
        if ((latest?.efficacy?.efficacyScore || 0) >= ((oldest?.efficacy?.efficacyScore || 0) + 12)) {
          recommendations.push('La zona sta migliorando: usare questa configurazione come benchmark interno.')
        } else if ((latest?.efficacy?.efficacyScore || 0) <= ((oldest?.efficacy?.efficacyScore || 0) - 12)) {
          recommendations.push('La zona mostra peggioramento nel tempo: confrontare microclima e risposta del suolo rispetto alle mappe migliori.')
        }

        return {
          zoneId: latest?.zoneId || group[0]?.zoneId || crypto.randomUUID(),
          zoneName: latest?.zoneName || group[0]?.zoneName || 'Zona',
          evolution,
          performanceScore: Number(performanceScore.toFixed(2)),
          recommendations: recommendations.slice(0, 3),
        }
      })
      .sort((left, right) => left.performanceScore - right.performanceScore)
  }

  private buildSeasonalPatterns(
    snapshots: HistoricalMapSnapshot[]
  ): HistoricalComparisonResult['seasonalPatterns'] {
    const seasonalGroups = new Map<
      HistoricalComparisonResult['seasonalPatterns'][number]['season'],
      HistoricalMapSnapshot[]
    >()

    snapshots.forEach((snapshot) => {
      const season = getSeasonKey(snapshot.map.generationDate)
      const current = seasonalGroups.get(season) || []
      current.push(snapshot)
      seasonalGroups.set(season, current)
    })

    const order: HistoricalComparisonResult['seasonalPatterns'][number]['season'][] = ['spring', 'summer', 'autumn', 'winter']

    return order
      .filter((season) => seasonalGroups.has(season))
      .map((season) => {
        const seasonalSnapshots = seasonalGroups.get(season) || []
        const rates = seasonalSnapshots.map((snapshot) => snapshot.averageApplicationRate)
        const effectiveness = average(
          seasonalSnapshots.map((snapshot) => snapshot.efficacySummary.averageEfficacyScore)
        )
        const recommendations: string[] = []

        if (effectiveness >= 75) {
          recommendations.push('Stagione storicamente solida: utile come riferimento per le finestre operative future.')
        } else if (effectiveness < 55) {
          recommendations.push('Stagione debole: anticipare verifica aderenza e stress microclimatico prima dell’esecuzione.')
        }

        const avgYield = average(
          seasonalSnapshots
            .map((snapshot) => snapshot.averageYieldKg)
            .filter((value): value is number => typeof value === 'number')
        )
        if (avgYield > 0) {
          recommendations.push(`La stagione mostra resa media ${avgYield.toFixed(1)} kg: utile per calibrare il target atteso.`)
        }

        return {
          season,
          averageApplicationRate: average(rates),
          variability: Number((rates.length > 1
            ? (stdDeviation(rates) / Math.max(average(rates), 1)) * 100
            : 0).toFixed(2)),
          effectiveness,
          recommendations: recommendations.slice(0, 3),
        }
      })
  }

  private buildTreatmentResponse(
    snapshots: HistoricalMapSnapshot[]
  ): HistoricalComparisonResult['treatmentResponse'] {
    const typeGroups = new Map<PrescriptionMap['mapType'], HistoricalMapSnapshot[]>()

    snapshots.forEach((snapshot) => {
      const current = typeGroups.get(snapshot.map.mapType) || []
      current.push(snapshot)
      typeGroups.set(snapshot.map.mapType, current)
    })

    return [...typeGroups.entries()].map(([treatmentType, groupedSnapshots]) => {
      const responseTimes = groupedSnapshots
        .map((snapshot) => getDaysBetween(snapshot.map.generationDate, snapshot.latestOutcomeAt))
        .filter((value): value is number => typeof value === 'number')
      const effectivenessScore = average(
        groupedSnapshots.map((snapshot) => snapshot.efficacySummary.averageEfficacyScore)
      )
      const topSnapshots = [...groupedSnapshots]
        .sort((left, right) => right.efficacySummary.averageEfficacyScore - left.efficacySummary.averageEfficacyScore)
        .slice(0, Math.max(1, Math.ceil(groupedSnapshots.length / 2)))
      const optimalDosage = average(topSnapshots.map((snapshot) => snapshot.averageApplicationRate))
      const costEffectiveness = average(
        groupedSnapshots.map((snapshot) => {
          const perHa = snapshot.map.areaHectares > 0
            ? snapshot.map.costSavings / snapshot.map.areaHectares
            : snapshot.map.costSavings
          return perHa * (snapshot.efficacySummary.averageEfficacyScore / 100)
        })
      )

      const sideEffects: string[] = []
      if (average(groupedSnapshots.map((snapshot) => snapshot.efficacySummary.averageMicroclimateScore)) < 45) {
        sideEffects.push('stress microclimatico elevato dopo l’intervento')
      }
      if (average(groupedSnapshots.map((snapshot) => snapshot.varianceSummary.averageAdherenceScore)) < 60) {
        sideEffects.push('aderenza operativa insufficiente rispetto alla prescrizione')
      }

      return {
        treatmentType,
        responseTime: average(responseTimes),
        effectivenessScore,
        optimalDosage,
        costEffectiveness: Number(costEffectiveness.toFixed(2)),
        sideEffects,
      }
    })
  }

  private buildYieldCorrelation(
    snapshots: HistoricalMapSnapshot[]
  ): HistoricalComparisonResult['yieldCorrelation'] {
    const pairs = snapshots
      .map((snapshot) => ({
        x: snapshot.averageApplicationRate,
        y: snapshot.averageYieldKg ?? snapshot.outcomeSummary.averageOutcomeScore,
      }))
      .filter((pair) => Number.isFinite(pair.x) && Number.isFinite(pair.y))

    const correlationCoefficient = pearsonCorrelation(pairs)
    const topPairs = [...pairs]
      .sort((left, right) => right.y - left.y)
      .slice(0, Math.max(1, Math.ceil(pairs.length / 2)))
    const optimalRates = topPairs.map((pair) => pair.x)
    const unit = snapshots[0]?.map.applicationRate.unit || 'unit'

    return {
      correlationCoefficient,
      significanceLevel: Number(clamp(0.45 + (Math.abs(correlationCoefficient) * 0.35) + (pairs.length * 0.04), 0.5, 0.99).toFixed(2)),
      predictiveAccuracy: Number((Math.abs(correlationCoefficient) * 100).toFixed(2)),
      optimalRateRange: {
        min: optimalRates.length > 0 ? Number(Math.min(...optimalRates).toFixed(2)) : 0,
        max: optimalRates.length > 0 ? Number(Math.max(...optimalRates).toFixed(2)) : 0,
        unit,
      },
      yieldImpactAnalysis: snapshots.map((snapshot) => ({
        applicationRate: snapshot.averageApplicationRate,
        expectedYield: snapshot.averageExpectedOutcome,
        actualYield: snapshot.averageYieldKg ?? snapshot.outcomeSummary.averageOutcomeScore,
        variance: Number((
          (snapshot.averageYieldKg ?? snapshot.outcomeSummary.averageOutcomeScore)
          - snapshot.averageExpectedOutcome
        ).toFixed(2)),
      })),
    }
  }

  private buildInsights(
    comparisonType: HistoricalComparisonRequest['comparisonType'],
    snapshots: HistoricalMapSnapshot[],
    temporalTrends: HistoricalComparisonResult['temporalTrends'],
    zoneEvolution: HistoricalComparisonResult['zoneEvolution'],
    seasonalPatterns: HistoricalComparisonResult['seasonalPatterns'],
    treatmentResponse: HistoricalComparisonResult['treatmentResponse'],
    yieldCorrelation: HistoricalComparisonResult['yieldCorrelation']
  ): HistoricalComparisonResult['insights'] {
    const intelligenceEntries = snapshots.map((snapshot) => ({
      map: snapshot.map,
      intelligence: buildPrescriptionAgronomicIntelligenceSummary(
        snapshot.map,
        snapshot.efficacySummary,
        snapshot.varianceSummary,
        snapshot.outcomeSummary
      ),
    }))

    const bestMap = [...snapshots].sort(
      (left, right) => right.efficacySummary.averageEfficacyScore - left.efficacySummary.averageEfficacyScore
    )[0]
    const weakestMap = [...snapshots].sort(
      (left, right) => left.efficacySummary.averageEfficacyScore - right.efficacySummary.averageEfficacyScore
    )[0]
    const bestSeason = [...seasonalPatterns].sort((left, right) => right.effectiveness - left.effectiveness)[0]
    const weakestZones = zoneEvolution.filter((zone) => zone.performanceScore < 55).slice(0, 3)
    const highestSeverityRecommendation = intelligenceEntries
      .flatMap((entry) => entry.intelligence.recommendations)
      .sort((left, right) => SEVERITY_SCORE[right.severity] - SEVERITY_SCORE[left.severity])[0]

    const keyFindings: string[] = []
    const recommendations: string[] = []
    const riskFactors: string[] = []
    const opportunities: string[] = []
    const nextActions: string[] = []

    const applicationTrend = temporalTrends.find((trend) => trend.metric === 'application_rate')
    if (applicationTrend) {
      keyFindings.push(
        `La dose media storica e ${applicationTrend.trend} con variazione ${applicationTrend.changeRate >= 0 ? '+' : ''}${applicationTrend.changeRate.toFixed(1)}%.`
      )
    }

    if (bestMap) {
      keyFindings.push(
        `La strategia migliore e "${bestMap.map.name}" con efficacia media ${bestMap.efficacySummary.averageEfficacyScore.toFixed(0)}.`
      )
      opportunities.push(
        `Usare "${bestMap.map.name}" come benchmark operativo per dose, copertura e timing.`
      )
    }

    if (bestSeason) {
      keyFindings.push(
        `La stagione con risposta migliore e ${bestSeason.season} con efficacia ${bestSeason.effectiveness.toFixed(0)}.`
      )
    }

    if (weakestMap && weakestMap !== bestMap) {
      riskFactors.push(
        `La strategia "${weakestMap.map.name}" resta la piu fragile con efficacia ${weakestMap.efficacySummary.averageEfficacyScore.toFixed(0)}.`
      )
    }

    weakestZones.forEach((zone) => {
      riskFactors.push(`La zona ${zone.zoneName} resta sotto soglia storica con performance ${zone.performanceScore.toFixed(0)}.`)
    })

    if (yieldCorrelation.correlationCoefficient >= 0.45) {
      opportunities.push(
        `La relazione dose-risultato e leggibile (r=${yieldCorrelation.correlationCoefficient.toFixed(2)}): si puo ottimizzare il range ${yieldCorrelation.optimalRateRange.min}-${yieldCorrelation.optimalRateRange.max} ${yieldCorrelation.optimalRateRange.unit}.`
      )
    } else {
      riskFactors.push(
        'La relazione dose-risultato e ancora debole: serve piu disciplina esecutiva o piu dati outcome per distinguere le strategie.'
      )
    }

    if (highestSeverityRecommendation) {
      recommendations.push(highestSeverityRecommendation.message)
    }

    const weakestTreatment = [...treatmentResponse].sort(
      (left, right) => left.effectivenessScore - right.effectivenessScore
    )[0]
    if (weakestTreatment) {
      recommendations.push(
        `Per il tipo ${weakestTreatment.treatmentType} conviene convergere verso dose ottimale ${weakestTreatment.optimalDosage.toFixed(1)} e ridurre le esecuzioni fuori soglia.`
      )
    }

    if (comparisonType === 'seasonal' && bestSeason) {
      nextActions.push(`Allinea il prossimo piano stagionale alla finestra ${bestSeason.season} che oggi risulta la piu efficiente.`)
    }
    if (comparisonType === 'yield_correlation') {
      nextActions.push('Conferma il range ottimale su una nuova mappa pilota e misura resa commerciale per zona.')
    }
    if (comparisonType === 'treatment_response') {
      nextActions.push('Controlla i tempi tra applicazione e primo outcome registrato per eliminare risposte lente o incoerenti.')
    }

    if (weakestZones.length > 0) {
      nextActions.push(`Rivedi subito ${weakestZones[0]!.zoneName} confrontando aderenza, outcome e stress post-intervento.`)
    }
    if (bestMap) {
      nextActions.push(`Replica gli elementi vincenti di "${bestMap.map.name}" sulle aree che oggi performano peggio.`)
    }

    return {
      keyFindings: keyFindings.slice(0, 5),
      recommendations: recommendations.slice(0, 5),
      riskFactors: riskFactors.slice(0, 5),
      opportunities: opportunities.slice(0, 5),
      nextActions: nextActions.slice(0, 5),
    }
  }

  private buildQualityMetrics(
    request: HistoricalComparisonRequest,
    snapshots: HistoricalMapSnapshot[]
  ): HistoricalComparisonResult['quality'] {
    const dataCompleteness = average(snapshots.map((snapshot) => snapshot.map.dataCompleteness))
    const spatialAccuracy = average(snapshots.map((snapshot) => snapshot.map.qualityScore))
    const timeStart = new Date(request.timeRange.startDate).getTime()
    const timeEnd = new Date(request.timeRange.endDate).getTime()
    const requestedSpanDays = Math.max(1, (timeEnd - timeStart) / (1000 * 60 * 60 * 24))
    const actualSpanDays = snapshots.length > 1
      ? (
        new Date(snapshots[snapshots.length - 1]!.map.generationDate).getTime()
        - new Date(snapshots[0]!.map.generationDate).getTime()
      ) / (1000 * 60 * 60 * 24)
      : 0
    const temporalCoverage = Number(clamp((actualSpanDays / requestedSpanDays) * 100, 20, 100).toFixed(2))
    const confidenceScore = Number(average([dataCompleteness, spatialAccuracy, temporalCoverage]).toFixed(2))

    return {
      dataCompleteness,
      temporalCoverage,
      spatialAccuracy,
      confidenceScore,
    }
  }
}

export const createHistoricalComparisonService = (storageProvider: HistoricalComparisonStorage) => (
  new HistoricalComparisonService(storageProvider)
)

export default HistoricalComparisonService
