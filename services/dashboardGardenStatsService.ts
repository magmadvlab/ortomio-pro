import type { GardenTask } from '@/types'

export interface DashboardGardenStats {
  plantsCount: number | null
  tasksToday: number
  tasksOverdue: number
  openIrrigationTasks: number
  openHarvestTasks: number
  healthScore: number | null
}

function getScheduledDate(task: GardenTask): Date | null {
  const rawDate = task.nextDueDate || task.date
  if (!rawDate) return null

  const date = new Date(rawDate)
  return Number.isNaN(date.getTime()) ? null : date
}

function isSameLocalDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
}

export function calculateDashboardGardenStats(
  tasks: GardenTask[],
  now: Date = new Date(),
): DashboardGardenStats {
  const openTasks = tasks.filter(task => !task.completed)
  const tasksToday = openTasks.filter(task => {
    const scheduledDate = getScheduledDate(task)
    return scheduledDate ? isSameLocalDay(scheduledDate, now) : false
  }).length
  const tasksOverdue = openTasks.filter(task => {
    const scheduledDate = getScheduledDate(task)
    return scheduledDate ? scheduledDate.getTime() < now.getTime() && !isSameLocalDay(scheduledDate, now) : false
  }).length

  return {
    // Tasks are operations, not an authoritative plant inventory.
    plantsCount: null,
    tasksToday,
    tasksOverdue,
    openIrrigationTasks: openTasks.filter(task => task.taskType === 'Irrigation').length,
    openHarvestTasks: openTasks.filter(task => task.taskType === 'Harvest').length,
    // No measured garden-wide health contract is currently supplied to the dashboard.
    healthScore: null,
  }
}
