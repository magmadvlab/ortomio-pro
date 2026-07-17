import { createHash } from 'node:crypto'

export const NDVI_ALGORITHM_VERSION = 'sentinel-statistics-ndvi-v1'

export type NDVIStats = {
  mean: number
  min: number
  max: number
  stDev: number
  sampleCount: number
  noDataCount: number
}

export type SentinelInterval = {
  interval?: { from?: string; to?: string }
  outputs?: { ndvi?: { bands?: { B0?: { stats?: Partial<NDVIStats> } } } }
}

const finite = (value: unknown) => typeof value === 'number' && Number.isFinite(value)

export const parseLatestSentinelNDVI = (payload: { data?: SentinelInterval[] }) => {
  const valid = (payload.data ?? []).flatMap((entry) => {
    const stats = entry.outputs?.ndvi?.bands?.B0?.stats
    if (!stats || !finite(stats.mean) || !finite(stats.min) || !finite(stats.max)) return []
    const sampleCount = finite(stats.sampleCount) ? Number(stats.sampleCount) : 0
    const noDataCount = finite(stats.noDataCount) ? Number(stats.noDataCount) : 0
    const usableCount = Math.max(0, sampleCount - noDataCount)
    if (usableCount === 0) return []
    return [{
      from: String(entry.interval?.from || ''),
      to: String(entry.interval?.to || ''),
      stats: {
        mean: Number(stats.mean), min: Number(stats.min), max: Number(stats.max),
        stDev: finite(stats.stDev) ? Number(stats.stDev) : 0,
        sampleCount, noDataCount,
      } satisfies NDVIStats,
      validPixelPercent: Number(((usableCount / Math.max(1, sampleCount)) * 100).toFixed(2)),
    }]
  }).sort((left, right) => right.to.localeCompare(left.to))
  return valid[0] ?? null
}

export const validateNDVIBounds = (value: unknown) => {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const north = Number(row.north); const south = Number(row.south)
  const east = Number(row.east); const west = Number(row.west)
  if (![north, south, east, west].every(Number.isFinite)) return null
  if (north <= south || east <= west || north > 90 || south < -90 || east > 180 || west < -180) return null
  if (north - south > 1 || east - west > 1) return null
  return { north, south, east, west }
}

export const hashNDVIRequest = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex')
