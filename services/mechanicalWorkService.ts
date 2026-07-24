/**
 * Shared mechanical-work view models.
 *
 * Runtime reads and writes are intentionally owned by IStorageProvider
 * (`getMechanicalWorks`, `createMechanicalWork`, `updateMechanicalWork`,
 * `deleteMechanicalWork`) so this module cannot report simulated persistence.
 */

import type { WorkType, EquipmentType } from '../logic/mechanicalWorkEngine'

export interface MechanicalWorkLog {
  id?: string
  gardenId: string
  workType: WorkType
  description?: string
  zoneId?: string
  rowIds?: string[]
  bedIds?: string[]
  areaCoveredSqm?: number
  workDate: string
  scheduledDate?: string
  equipmentType: EquipmentType
  equipmentAttachment?: string
  depthCm?: number
  durationMinutes?: number
  operatorName?: string
  cost?: number
  weatherConditions?: {
    temperature?: number
    rainMm?: number
    soilMoisture?: 'dry' | 'optimal' | 'wet'
  }
  photos?: string[]
  notes?: string
  completed: boolean
  workMetadata?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export interface MechanicalWorkSequence {
  id?: string
  name: string
  description?: string
  gardenType?: string
  season?: 'Spring' | 'Summer' | 'Autumn' | 'Winter'
  steps: MechanicalWorkStep[]
}

export interface MechanicalWorkStep {
  order: number
  workType: WorkType
  name: string
  timing: string
  instructions: string[]
  depthCm?: number
  equipment?: EquipmentType
}

export interface MechanicalWorkStats {
  totalWorks: number
  totalAreaWorked: number
  totalCost: number
  totalHours: number
  workTypeBreakdown: Record<WorkType, number>
  mostCommonWork: WorkType | null
  busiestMonth: number | null
}
