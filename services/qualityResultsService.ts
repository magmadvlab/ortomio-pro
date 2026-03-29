import type { IStorageProvider } from '@/packages/core/storage/interface'
import type { QualityResult } from '@/types'

export interface QualityScopeHistoryPoint {
  recordedAt: string
  qualityScore?: number
  brix?: number
  marketableYieldKg?: number
  defectIncidencePercentage?: number
}

export interface QualityScopeSummary {
  scopeType: QualityResult['scopeType']
  scopeId: string
  scopeLabel: string
  latestRecordedAt: string
  latestQualityScore?: number
  latestBrix?: number
  averageQualityScore?: number
  totalMarketableYieldKg: number
  trend: 'improving' | 'stable' | 'declining'
  points: QualityScopeHistoryPoint[]
}

export interface QualityOverview {
  totalResults: number
  averageQualityScore?: number
  averageBrix?: number
  totalMarketableYieldKg: number
  byScope: QualityScopeSummary[]
}

type QualityFilters = {
  cropContextId?: QualityResult['cropContextId']
  scopeType?: QualityResult['scopeType']
  scopeId?: string
  zoneId?: string
  fieldRowId?: string
  treeId?: string
  plantId?: string
  lotCode?: string
}

const getScopeLabel = (result: QualityResult): string => {
  if (result.plantId) return `pianta ${result.plantId}`
  if (result.treeId) return `albero ${result.treeId}`
  if (result.fieldRowId) return `filare ${result.fieldRowId}`
  if (result.zoneId) return `zona ${result.zoneId}`
  if (result.scopeId) return `${result.scopeType} ${result.scopeId}`
  return 'giardino'
}

const average = (values: number[]) => {
  if (values.length === 0) return undefined
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2))
}

const resolveTrend = (scores: number[]): QualityScopeSummary['trend'] => {
  if (scores.length < 3) return 'stable' as const

  const midpoint = Math.floor(scores.length / 2)
  const early = average(scores.slice(midpoint))
  const recent = average(scores.slice(0, midpoint))

  if (early === undefined || recent === undefined) return 'stable'
  if (recent >= early + 4) return 'improving'
  if (recent <= early - 4) return 'declining'
  return 'stable'
}

export async function getQualityOverview(
  storageProvider: Pick<IStorageProvider, 'getQualityResults'> | null | undefined,
  gardenId: string,
  filters: QualityFilters = {}
): Promise<QualityOverview> {
  if (!storageProvider?.getQualityResults) {
    return {
      totalResults: 0,
      totalMarketableYieldKg: 0,
      byScope: [],
    }
  }

  const results = await storageProvider.getQualityResults(gardenId, filters)
  const qualityScores = results
    .map((result) => result.qualityScore)
    .filter((value): value is number => typeof value === 'number')
  const brixValues = results
    .map((result) => result.brix)
    .filter((value): value is number => typeof value === 'number')

  const grouped = new Map<string, QualityResult[]>()
  for (const result of results) {
    const key = `${result.scopeType}:${result.scopeId || result.plantId || result.treeId || result.fieldRowId || result.zoneId || result.gardenId}`
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)?.push(result)
  }

  const byScope = Array.from(grouped.values())
    .map((scopeResults) => {
      const ordered = [...scopeResults].sort(
        (left, right) => new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime()
      )
      const latest = ordered[0]
      if (!latest) {
        return null
      }
      const scopeScores = ordered
        .map((result) => result.qualityScore)
        .filter((value): value is number => typeof value === 'number')

      return {
        scopeType: latest.scopeType,
        scopeId:
          latest.scopeId ||
          latest.plantId ||
          latest.treeId ||
          latest.fieldRowId ||
          latest.zoneId ||
          latest.gardenId,
        scopeLabel: getScopeLabel(latest),
        latestRecordedAt: latest.recordedAt,
        latestQualityScore: latest.qualityScore,
        latestBrix: latest.brix,
        averageQualityScore: average(scopeScores),
        totalMarketableYieldKg: Number(
          ordered.reduce((sum, result) => sum + (result.marketableYieldKg || 0), 0).toFixed(2)
        ),
        trend: resolveTrend(scopeScores),
        points: ordered
          .slice(0, 12)
          .map((result) => ({
            recordedAt: result.recordedAt,
            qualityScore: result.qualityScore,
            brix: result.brix,
            marketableYieldKg: result.marketableYieldKg,
            defectIncidencePercentage: result.defectIncidencePercentage,
          })),
      }
    })
    .filter((scope): scope is NonNullable<typeof scope> => Boolean(scope))
    .sort((left, right) => new Date(right.latestRecordedAt).getTime() - new Date(left.latestRecordedAt).getTime())

  return {
    totalResults: results.length,
    averageQualityScore: average(qualityScores),
    averageBrix: average(brixValues),
    totalMarketableYieldKg: Number(
      results.reduce((sum, result) => sum + (result.marketableYieldKg || 0), 0).toFixed(2)
    ),
    byScope,
  }
}
