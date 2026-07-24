import { useMemo } from 'react'
import { isFeatureEnabled, type FeatureFlag } from '@/config/features'

/**
 * Hook per controllare se una feature è attiva
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const hasAIPredictions = useFeature('AI_PREDICTIONS')
 *   
 *   return (
 *     <div>
 *       {hasAIPredictions && <AIPredictionsDashboard />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useFeature(feature: FeatureFlag): boolean {
  return useMemo(() => isFeatureEnabled(feature), [feature])
}

/**
 * Hook per controllare multiple features
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const features = useFeatures(['AI_PREDICTIONS', 'JOURNAL'])
 *   
 *   return (
 *     <div>
 *       {features.AI_PREDICTIONS && <AIPredictionsDashboard />}
 *       {features.JOURNAL && <JournalDashboard />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useFeatures<T extends FeatureFlag[]>(
  features: T
): Record<T[number], boolean> {
  return useMemo(() => {
    const result: Record<string, boolean> = {}
    features.forEach((feature) => {
      result[feature] = isFeatureEnabled(feature)
    })
    return result as Record<T[number], boolean>
  }, [features])
}

/**
 * Hook per controllare se TUTTE le features sono attive
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const allEnabled = useAllFeatures(['IRRIGATION_BASE', 'IRRIGATION_ZONES'])
 *   
 *   if (!allEnabled) {
 *     return <div>Alcune funzionalità non sono disponibili</div>
 *   }
 *   
 *   return <FullIrrigationDashboard />
 * }
 * ```
 */
export function useAllFeatures(features: FeatureFlag[]): boolean {
  return useMemo(
    () => features.every((feature) => isFeatureEnabled(feature)),
    [features]
  )
}

/**
 * Hook per controllare se ALMENO UNA feature è attiva
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const hasAnyOrchard = useAnyFeature(['ORCHARD', 'VINEYARD', 'OLIVE_GROVE'])
 *   
 *   return (
 *     <div>
 *       {hasAnyOrchard && <OrchardSection />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useAnyFeature(features: FeatureFlag[]): boolean {
  return useMemo(
    () => features.some((feature) => isFeatureEnabled(feature)),
    [features]
  )
}
