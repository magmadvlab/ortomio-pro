import { type ReactNode } from 'react'
import { isFeatureEnabled, type FeatureFlag } from '@/config/features'

interface FeatureGateProps {
  /**
   * Feature flag da controllare
   */
  feature: FeatureFlag
  
  /**
   * Contenuto da mostrare se feature è attiva
   */
  children: ReactNode
  
  /**
   * Contenuto da mostrare se feature è disattivata (opzionale)
   */
  fallback?: ReactNode
}

/**
 * Componente per mostrare contenuto condizionalmente basato su feature flag
 * 
 * @example
 * ```tsx
 * <FeatureGate feature="AI_PREDICTIONS">
 *   <AIPredictionsDashboard />
 * </FeatureGate>
 * ```
 * 
 * @example Con fallback
 * ```tsx
 * <FeatureGate 
 *   feature="AI_PREDICTIONS"
 *   fallback={<div>Funzionalità non disponibile</div>}
 * >
 *   <AIPredictionsDashboard />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  if (!isFeatureEnabled(feature)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

interface MultiFeatureGateProps {
  /**
   * Lista di feature flags da controllare
   */
  features: FeatureFlag[]
  
  /**
   * Modalità di controllo:
   * - 'all': tutte le features devono essere attive
   * - 'any': almeno una feature deve essere attiva
   */
  mode?: 'all' | 'any'
  
  /**
   * Contenuto da mostrare se condizione è soddisfatta
   */
  children: ReactNode
  
  /**
   * Contenuto da mostrare se condizione non è soddisfatta (opzionale)
   */
  fallback?: ReactNode
}

/**
 * Componente per mostrare contenuto condizionalmente basato su multiple feature flags
 * 
 * @example Tutte le features devono essere attive
 * ```tsx
 * <MultiFeatureGate features={['IRRIGATION_ZONES', 'IRRIGATION_SCHEDULING']} mode="all">
 *   <FullIrrigationDashboard />
 * </MultiFeatureGate>
 * ```
 * 
 * @example Almeno una feature deve essere attiva
 * ```tsx
 * <MultiFeatureGate features={['ORCHARD', 'VINEYARD', 'OLIVE_GROVE']} mode="any">
 *   <OrchardSection />
 * </MultiFeatureGate>
 * ```
 */
export function MultiFeatureGate({ 
  features, 
  mode = 'all', 
  children, 
  fallback = null 
}: MultiFeatureGateProps) {
  const isEnabled = mode === 'all'
    ? features.every((feature) => isFeatureEnabled(feature))
    : features.some((feature) => isFeatureEnabled(feature))
  
  if (!isEnabled) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}
