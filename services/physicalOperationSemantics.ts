export type PhysicalOperationStage = 'need' | 'planned' | 'commanded' | 'executing' | 'measured' | 'failed' | 'cancelled'
export type VolumeSource = 'sensor' | 'meter' | 'operator' | 'estimated_no_sensor'

export const buildIrrigationVolumeEvidence = (input: {
  plannedVolumeLiters: number
  measuredVolumeLiters?: number
  measurementSource?: VolumeSource
  measuredAt?: string
}) => {
  if (!Number.isFinite(input.plannedVolumeLiters) || input.plannedVolumeLiters < 0) {
    throw new Error('invalid_planned_irrigation_volume')
  }
  if (input.measuredVolumeLiters === undefined) {
    return {
      plannedVolumeLiters: input.plannedVolumeLiters,
      measuredVolumeLiters: undefined,
      lifecycleStatus: 'planned' as PhysicalOperationStage,
      measurementSource: 'estimated_no_sensor' as VolumeSource,
      estimated: true,
    }
  }
  if (!Number.isFinite(input.measuredVolumeLiters) || input.measuredVolumeLiters < 0) {
    throw new Error('invalid_measured_irrigation_volume')
  }
  if (!input.measuredAt || !input.measurementSource || input.measurementSource === 'estimated_no_sensor') {
    throw new Error('measured_irrigation_requires_evidence')
  }
  return {
    plannedVolumeLiters: input.plannedVolumeLiters,
    measuredVolumeLiters: input.measuredVolumeLiters,
    lifecycleStatus: 'measured' as PhysicalOperationStage,
    measurementSource: input.measurementSource,
    measuredAt: input.measuredAt,
    estimated: false,
  }
}

export const projectNutritionStock = (input: {
  currentStock: number
  quantity: number
  event: 'suggestion' | 'plan' | 'application_confirmed'
}) => {
  if (input.event !== 'application_confirmed') return input.currentStock
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) throw new Error('invalid_nutrition_quantity')
  if (input.quantity > input.currentStock) throw new Error('insufficient_nutrition_stock')
  return input.currentStock - input.quantity
}
