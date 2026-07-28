import type { GardenTask, HarvestLogData } from '@/types'

export type AnalyticsTimeRange = 'month' | 'quarter' | 'year'

export interface OperationalAnalyticsStats {
  totalTasks: number
  completedTasks: number
  plantsGrown: number
  harvestWeight: number
  waterSaved: number | null
  co2Offset: number | null
  efficiency: number | null
  costSavings: number | null
  roi: number | null
  laborHours: number | null
}

const getRangeStart = (range: AnalyticsTimeRange, now: Date): Date => {
  const start = new Date(now)
  if (range === 'month') start.setMonth(start.getMonth() - 1)
  if (range === 'quarter') start.setMonth(start.getMonth() - 3)
  if (range === 'year') start.setFullYear(start.getFullYear() - 1)
  return start
}

const isWithinRange = (
  value: string | undefined,
  range: AnalyticsTimeRange,
  now: Date
): boolean => {
  if (!value) return false
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) && date >= getRangeStart(range, now) && date <= now
}

export function buildOperationalAnalytics(
  tasks: GardenTask[],
  harvests: HarvestLogData[],
  range: AnalyticsTimeRange,
  now = new Date()
): {
  periodTasks: GardenTask[]
  periodHarvests: HarvestLogData[]
  stats: OperationalAnalyticsStats
} {
  const periodTasks = tasks.filter(task => isWithinRange(task.date, range, now))
  const periodHarvests = harvests.filter(harvest => isWithinRange(harvest.date, range, now))
  const completedTasks = periodTasks.filter(task => task.completed)
  const recordedDurations = completedTasks.filter(task => typeof task.durationMinutes === 'number')
  const harvestWeight = periodHarvests.reduce((sum, harvest) => {
    return sum + (harvest.unit === 'g' ? harvest.quantity / 1000 : harvest.quantity)
  }, 0)

  return {
    periodTasks,
    periodHarvests,
    stats: {
      totalTasks: periodTasks.length,
      completedTasks: completedTasks.length,
      plantsGrown: completedTasks.filter(task =>
        task.taskType === 'Transplant' || task.taskType === 'Sowing'
      ).length,
      harvestWeight: Number(harvestWeight.toFixed(2)),
      waterSaved: null,
      co2Offset: null,
      efficiency: periodTasks.length > 0
        ? Math.round((completedTasks.length / periodTasks.length) * 100)
        : null,
      costSavings: null,
      roi: null,
      laborHours: recordedDurations.length > 0
        ? Number((recordedDurations.reduce((sum, task) => {
            return sum + (task.durationMinutes || 0)
          }, 0) / 60).toFixed(1))
        : null,
    },
  }
}
