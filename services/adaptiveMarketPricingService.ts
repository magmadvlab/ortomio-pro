import type { IStorageProvider } from '@/packages/core/storage/interface'
import { createStorageProvider } from '@/packages/core/storage/factory'
import {
  buildAgronomicQualityLearningAdjustment,
  getAgronomicProfileLearningSnapshots,
} from '@/services/agronomicProfileLearningService'

export interface AdaptiveQualityPricingBenchmark {
  qualityTargetScore: number
  qualityAlertFloorScore: number
  brixTarget: number
  notes: string[]
}

export interface AdaptiveQualityPriceResult {
  adjustedPrice: number
  qualityMultiplier: number
  premiumRate: number
  benchmarkGap: number | null
  status: 'above_target' | 'watch' | 'below_target' | 'no_data'
  rationale: string[]
}

const roundMetric = (value: number, digits: number = 2) =>
  Number(value.toFixed(digits))

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export async function resolveAdaptiveQualityPricingBenchmark(
  storageProvider: Pick<IStorageProvider, 'getUserPreference'> | null | undefined,
  gardenId: string,
  options: {
    plantName?: string | null
    zoneId?: string | null
    profileId?: string | null
  } = {}
): Promise<AdaptiveQualityPricingBenchmark> {
  const snapshots = await getAgronomicProfileLearningSnapshots(storageProvider, gardenId)
  const adjustment = buildAgronomicQualityLearningAdjustment(snapshots, options)

  return {
    qualityTargetScore: Math.round(adjustment.qualityTargetRating * 20),
    qualityAlertFloorScore: Math.round(adjustment.qualityAlertFloorRating * 20),
    brixTarget: adjustment.brixTarget,
    notes: adjustment.notes,
  }
}

export async function resolveAdaptiveQualityPricingBenchmarkForGarden(
  gardenId: string,
  options: {
    plantName?: string | null
    zoneId?: string | null
    profileId?: string | null
  } = {}
): Promise<AdaptiveQualityPricingBenchmark> {
  try {
    // Forced to 'cloud': NeonStorageProvider does not implement the domains
    // this pricing benchmark draws from yet.
    const storageProvider = createStorageProvider('cloud')
    return await resolveAdaptiveQualityPricingBenchmark(storageProvider, gardenId, options)
  } catch (error) {
    console.error('Error resolving adaptive quality pricing benchmark:', error)
    return {
      qualityTargetScore: 80,
      qualityAlertFloorScore: 60,
      brixTarget: 12,
      notes: [],
    }
  }
}

export function calculateAdaptiveQualityPrice(
  basePrice: number,
  options: {
    qualityScore?: number | null
    benchmark: AdaptiveQualityPricingBenchmark
    maxPremiumRate?: number
    watchPremiumRate?: number
    lowQualityDiscountRate?: number
  }
): AdaptiveQualityPriceResult {
  const {
    qualityScore,
    benchmark,
    maxPremiumRate = 0.3,
    watchPremiumRate = 0.08,
    lowQualityDiscountRate = 0.2,
  } = options

  if (typeof qualityScore !== 'number' || !Number.isFinite(qualityScore)) {
    return {
      adjustedPrice: roundMetric(basePrice),
      qualityMultiplier: 1,
      premiumRate: 0,
      benchmarkGap: null,
      status: 'no_data',
      rationale: [
        `Prezzo base mantenuto: benchmark sito ${benchmark.qualityTargetScore}% non ancora confrontabile senza score qualità.`,
      ],
    }
  }

  const benchmarkGap = roundMetric(qualityScore - benchmark.qualityTargetScore, 1)

  if (qualityScore >= benchmark.qualityTargetScore) {
    const premiumRate = clamp(0.1 + (benchmarkGap / 100), 0.1, maxPremiumRate)
    const qualityMultiplier = roundMetric(1 + premiumRate, 3)

    return {
      adjustedPrice: roundMetric(basePrice * qualityMultiplier),
      qualityMultiplier,
      premiumRate: roundMetric(premiumRate, 3),
      benchmarkGap,
      status: 'above_target',
      rationale: [
        `Qualità sopra target sito (+${benchmarkGap.toFixed(1)} punti).`,
        `Premium applicato sul benchmark ${benchmark.qualityTargetScore}% con riferimento Brix ${benchmark.brixTarget}°.`,
        ...benchmark.notes.slice(0, 2),
      ],
    }
  }

  if (qualityScore >= benchmark.qualityAlertFloorScore) {
    const interval = Math.max(1, benchmark.qualityTargetScore - benchmark.qualityAlertFloorScore)
    const premiumRate = clamp(
      ((qualityScore - benchmark.qualityAlertFloorScore) / interval) * watchPremiumRate,
      0,
      watchPremiumRate
    )
    const qualityMultiplier = roundMetric(1 + premiumRate, 3)

    return {
      adjustedPrice: roundMetric(basePrice * qualityMultiplier),
      qualityMultiplier,
      premiumRate: roundMetric(premiumRate, 3),
      benchmarkGap,
      status: 'watch',
      rationale: [
        `Qualità in fascia osservazione: ${Math.abs(benchmarkGap).toFixed(1)} punti sotto target ma sopra soglia ${benchmark.qualityAlertFloorScore}%.`,
        `Premium prudente applicato in attesa di riallineamento al benchmark sito.`,
        ...benchmark.notes.slice(0, 2),
      ],
    }
  }

  const discountRate = clamp(
    0.08 + ((benchmark.qualityAlertFloorScore - qualityScore) / 100),
    0.08,
    lowQualityDiscountRate
  )
  const qualityMultiplier = roundMetric(1 - discountRate, 3)

  return {
    adjustedPrice: roundMetric(basePrice * qualityMultiplier),
    qualityMultiplier,
    premiumRate: roundMetric(-discountRate, 3),
    benchmarkGap,
    status: 'below_target',
    rationale: [
      `Qualità sotto soglia sito (${benchmark.qualityAlertFloorScore}%) di ${Math.abs(benchmarkGap).toFixed(1)} punti rispetto al target.`,
      'Applicato pricing difensivo per evitare sovrastima commerciale del lotto.',
      ...benchmark.notes.slice(0, 2),
    ],
  }
}
