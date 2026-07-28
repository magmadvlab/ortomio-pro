import type { FertilizerInventoryItemDB, TreatmentRecordDB } from '@/types'

export interface NutritionEvidenceStats {
  treatments: {
    total: number
    organic: number
    conventional: number
    integrated: number
    organicPercentage: number | null
  }
  fertilizers: {
    total: number
    organic: number
    mineral: number
    corrective: number
    microelement: number
    organicPercentage: number | null
  }
}

export function calculateNutritionEvidenceStats(
  treatments: TreatmentRecordDB[],
  fertilizers: FertilizerInventoryItemDB[],
): NutritionEvidenceStats {
  const organicTreatments = treatments.filter(
    (treatment) => treatment.treatment_type === 'organic' || treatment.organic_approved === true,
  ).length
  const conventionalTreatments = treatments.filter(
    (treatment) =>
      treatment.treatment_type === 'conventional' ||
      (!treatment.treatment_type && treatment.organic_approved !== true),
  ).length
  const integratedTreatments = treatments.filter(
    (treatment) => treatment.treatment_type === 'integrated',
  ).length
  const organicFertilizers = fertilizers.filter(
    (fertilizer) => fertilizer.product_type === 'organic',
  ).length

  return {
    treatments: {
      total: treatments.length,
      organic: organicTreatments,
      conventional: conventionalTreatments,
      integrated: integratedTreatments,
      organicPercentage: treatments.length > 0
        ? Math.round((organicTreatments / treatments.length) * 100)
        : null,
    },
    fertilizers: {
      total: fertilizers.length,
      organic: organicFertilizers,
      mineral: fertilizers.filter((fertilizer) => fertilizer.product_type === 'mineral').length,
      corrective: fertilizers.filter((fertilizer) => fertilizer.product_type === 'corrective').length,
      microelement: fertilizers.filter((fertilizer) => fertilizer.product_type === 'microelement').length,
      organicPercentage: fertilizers.length > 0
        ? Math.round((organicFertilizers / fertilizers.length) * 100)
        : null,
    },
  }
}
