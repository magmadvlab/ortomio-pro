import { GardenTask } from '@/types'

const NUTRITION_TASK_TYPES = new Set(['Treatment', 'Fertilize'])
const IRRIGATION_TASK_TYPES = new Set(['Irrigation', 'Watering', 'Irrigazione', 'Annaffiatura'])
const HARVEST_TASK_TYPES = new Set(['Harvest'])
const MECHANICAL_TASK_TYPES = new Set([
  'Plowing',
  'Subsoiling',
  'Harrowing',
  'Tilling',
  'Rolling',
  'Hoeing',
  'EarthingUp',
  'Mulching',
  'PostSowingRolling',
  'Clearing',
  'Stumping',
  'StoneRemoval',
  'Leveling',
  'DeepSubsoiling',
  'Digging',
  'DeepHarrowing',
  'Crumbling',
  'Scraping',
  'SurfaceLeveling',
  'MinimumTillage',
  'StripTillage',
  'NoTill',
  'FormativePruning',
  'MaintenancePruning',
  'RejuvenationPruning',
  'SummerPruning',
  'WinterPruning',
  'Thinning',
  'Suckering',
  'Defoliation',
  'Tying',
  'OliveShredding',
  'RunnerManagement',
  'StrawberryMulching',
  'StrawberryCleaning',
  'CaneRemoval',
  'TipPruning',
  'RaspberryTying',
  'SuckerThinning',
  'FruitBagging',
  'ExoticThinning',
  'Shredding',
  'Topping',
  'Pruning',
])

export interface TaskExecutionContext {
  route: 'nutrition' | 'irrigation' | 'mechanical-work' | 'harvest'
  sourceTaskId: string
  taskType: string
  plantName?: string
  zoneId?: string
  rowId?: string
  rowNumber?: string
  date?: string
}

export const canLaunchNutritionExecution = (task: GardenTask): boolean => {
  return !task.completed && NUTRITION_TASK_TYPES.has(task.taskType)
}

export const canLaunchIrrigationExecution = (task: GardenTask): boolean => {
  return !task.completed && IRRIGATION_TASK_TYPES.has(task.taskType)
}

export const canLaunchHarvestExecution = (task: GardenTask): boolean => {
  return !task.completed && HARVEST_TASK_TYPES.has(task.taskType)
}

export const canLaunchMechanicalExecution = (task: GardenTask): boolean => {
  return !task.completed && MECHANICAL_TASK_TYPES.has(task.taskType)
}

export const canLaunchTaskExecution = (task: GardenTask): boolean => {
  return canLaunchNutritionExecution(task) || canLaunchIrrigationExecution(task) || canLaunchHarvestExecution(task) || canLaunchMechanicalExecution(task)
}

export const buildNutritionExecutionUrl = (task: GardenTask): string | null => {
  if (!canLaunchNutritionExecution(task)) {
    return null
  }

  const params = new URLSearchParams({
    sourceTaskId: task.id,
    taskType: task.taskType,
    plantName: task.plantName,
    date: task.nextDueDate || task.date,
  })

  if (task.zoneId) {
    params.set('zoneId', task.zoneId)
  }
  if (task.rowId) {
    params.set('rowId', task.rowId)
  }
  if (typeof task.rowNumber === 'number') {
    params.set('rowNumber', String(task.rowNumber))
  }

  return `/app/nutrition?${params.toString()}`
}

export const buildIrrigationExecutionUrl = (task: GardenTask): string | null => {
  if (!canLaunchIrrigationExecution(task)) {
    return null
  }

  const params = new URLSearchParams({
    sourceTaskId: task.id,
    taskType: task.taskType,
    plantName: task.plantName,
    date: task.nextDueDate || task.date,
  })

  if (task.zoneId) {
    params.set('zoneId', task.zoneId)
  }
  if (task.rowId) {
    params.set('rowId', task.rowId)
  }
  if (typeof task.rowNumber === 'number') {
    params.set('rowNumber', String(task.rowNumber))
  }

  return `/app/irrigation?${params.toString()}`
}

export const buildMechanicalExecutionUrl = (task: GardenTask): string | null => {
  if (!canLaunchMechanicalExecution(task)) {
    return null
  }

  const params = new URLSearchParams({
    sourceTaskId: task.id,
    taskType: task.taskType,
    plantName: task.plantName,
    date: task.nextDueDate || task.date,
  })

  if (task.zoneId) {
    params.set('zoneId', task.zoneId)
  }
  if (task.rowId) {
    params.set('rowId', task.rowId)
  }
  if (typeof task.rowNumber === 'number') {
    params.set('rowNumber', String(task.rowNumber))
  }

  return `/app/mechanical-work?${params.toString()}`
}

export const buildHarvestExecutionUrl = (task: GardenTask): string | null => {
  if (!canLaunchHarvestExecution(task)) {
    return null
  }

  const params = new URLSearchParams({
    sourceTaskId: task.id,
    taskType: task.taskType,
    plantName: task.plantName,
    date: task.nextDueDate || task.date,
  })

  if (task.zoneId) {
    params.set('zoneId', task.zoneId)
  }
  if (task.rowId) {
    params.set('rowId', task.rowId)
  }
  if (typeof task.rowNumber === 'number') {
    params.set('rowNumber', String(task.rowNumber))
  }

  return `/app/harvest?${params.toString()}`
}

export const buildTaskExecutionUrl = (task: GardenTask): string | null => {
  if (canLaunchNutritionExecution(task)) {
    return buildNutritionExecutionUrl(task)
  }
  if (canLaunchIrrigationExecution(task)) {
    return buildIrrigationExecutionUrl(task)
  }
  if (canLaunchHarvestExecution(task)) {
    return buildHarvestExecutionUrl(task)
  }
  if (canLaunchMechanicalExecution(task)) {
    return buildMechanicalExecutionUrl(task)
  }
  return null
}
