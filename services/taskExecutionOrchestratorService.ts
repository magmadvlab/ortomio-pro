import type { HarvestLaunchRequest } from '@/components/harvest/HarvestRegistrationModal'
import type { TreatmentPlannerLaunchRequest } from '@/components/nutrition/TreatmentPlanner'
import type { MechanicalWorkLog } from '@/services/mechanicalWorkService'
import type { TaskExecutionContext } from '@/services/taskExecutionLaunchService'

interface SearchParamsReader {
  get(name: string): string | null
}

export interface WateringTaskExecutionLaunchState {
  activeTab: 'dashboard'
  sourceTaskId: string
  zoneId?: string
  date: string
  notes?: string
  selectedZoneId: string
  showForm: true
}

export interface NutritionTaskExecutionBootstrapState {
  activeTab: 'treatments'
  plannerLaunchRequest: TreatmentPlannerLaunchRequest
}

export interface HarvestTaskExecutionBootstrapState {
  launchRequest: HarvestLaunchRequest
}

export interface MechanicalTaskExecutionBootstrapState {
  activeTab: 'operations'
  showExecutionForm: true
  initialData: Partial<MechanicalWorkLog>
}

const getTaskExecutionDate = (context?: TaskExecutionContext | null): string => {
  return context?.date || new Date().toISOString().split('T')[0]
}

export const parseTaskExecutionContext = (
  searchParams: SearchParamsReader,
  route: TaskExecutionContext['route'],
  fallbackTaskType: string
): TaskExecutionContext | null => {
  const sourceTaskId = searchParams.get('sourceTaskId')
  if (!sourceTaskId) {
    return null
  }

  return {
    route,
    sourceTaskId,
    taskType: searchParams.get('taskType') || fallbackTaskType,
    plantName: searchParams.get('plantName') || undefined,
    zoneId: searchParams.get('zoneId') || undefined,
    rowId: searchParams.get('rowId') || undefined,
    rowNumber: searchParams.get('rowNumber') || undefined,
    date: searchParams.get('date') || getTaskExecutionDate(),
  }
}

export const buildTaskExecutionNotes = (context?: TaskExecutionContext | null): string | undefined => {
  if (!context) {
    return undefined
  }

  const note = [
    context.plantName ? `Task sorgente per ${context.plantName}` : null,
    context.zoneId ? `Zona ${context.zoneId}` : null,
    context.rowNumber ? `Fila ${context.rowNumber}` : context.rowId ? `Riga ${context.rowId}` : null,
  ].filter(Boolean).join(' • ')

  return note || undefined
}

export const buildNutritionPlannerLaunchRequest = (
  context: TaskExecutionContext,
  gardenId: string
): Omit<TreatmentPlannerLaunchRequest, 'key'> => {
  return {
    viewMode: 'treatments',
    sourceTaskId: context.sourceTaskId,
    initialData: {
      gardenId,
      sourceTaskId: context.sourceTaskId,
      zoneId: context.zoneId,
      scheduledDate: getTaskExecutionDate(context),
      treatmentType: context.taskType === 'Fertilize' ? 'fertilization' : 'disease_control',
      productName: '',
      notes: buildTaskExecutionNotes(context),
      status: 'planned',
    },
  }
}

export const buildNutritionExecutionBootstrapState = (
  context: TaskExecutionContext,
  gardenId: string
): NutritionTaskExecutionBootstrapState => {
  return {
    activeTab: 'treatments',
    plannerLaunchRequest: {
      key: Date.now(),
      ...buildNutritionPlannerLaunchRequest(context, gardenId),
    },
  }
}

export const buildHarvestLaunchRequest = (
  context: TaskExecutionContext
): Omit<HarvestLaunchRequest, 'key'> => {
  return {
    sourceTaskId: context.sourceTaskId,
    plantName: context.plantName,
    date: getTaskExecutionDate(context),
    zoneId: context.zoneId,
    rowId: context.rowId,
    rowNumber: context.rowNumber,
  }
}

export const buildHarvestExecutionBootstrapState = (
  context: TaskExecutionContext
): HarvestTaskExecutionBootstrapState => {
  return {
    launchRequest: {
      key: Date.now(),
      ...buildHarvestLaunchRequest(context),
    },
  }
}

export const buildWateringExecutionLaunchState = (
  context: TaskExecutionContext
): WateringTaskExecutionLaunchState => {
  return {
    activeTab: 'dashboard',
    sourceTaskId: context.sourceTaskId,
    zoneId: context.zoneId,
    date: getTaskExecutionDate(context),
    notes: buildTaskExecutionNotes(context),
    selectedZoneId: context.zoneId || 'all',
    showForm: true,
  }
}

export const buildMechanicalExecutionInitialData = (
  context: TaskExecutionContext,
  gardenId: string
): Partial<MechanicalWorkLog> => {
  return {
    gardenId,
    zoneId: context.zoneId,
    rowIds: context.rowId ? [context.rowId] : undefined,
    workType: context.taskType as MechanicalWorkLog['workType'],
    workDate: getTaskExecutionDate(context),
    notes: buildTaskExecutionNotes(context),
    completed: true,
  }
}

export const buildMechanicalExecutionBootstrapState = (
  context: TaskExecutionContext,
  gardenId: string
): MechanicalTaskExecutionBootstrapState => {
  return {
    activeTab: 'operations',
    showExecutionForm: true,
    initialData: buildMechanicalExecutionInitialData(context, gardenId),
  }
}
