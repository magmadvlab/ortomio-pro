/**
 * Feature Flags Configuration
 * 
 * Sistema centralizzato per attivare/disattivare moduli dell'applicazione.
 * Ogni modulo può essere controllato singolarmente per:
 * - Testing isolato
 * - Deploy graduale
 * - Rollback immediato
 * - A/B testing
 */

export const FEATURES = {
  // ============================================
  // MODULI CRITICI - Fase 1
  // ============================================
  
  /**
   * AI Predictions - Predizioni malattie e resa
   * Servizio: aiPredictiveEngine.ts
   * Route: /app/ai-predictions
   */
  // P5: migrazione applicata e registrata, cron health-check smoke-testato su
  // dati reali (6/6 orti, 0 errori, idempotenza confermata), persistenza meteo
  // corretta e verificata (22/07/2026). Attivato deliberatamente pur con storico
  // meteo ancora scarso: mostrerà "dati insufficienti" finché non si accumula
  // storico multi-giorno, comportamento onesto per design, non un bug.
  AI_PREDICTIONS: true,
  
  /**
   * Diario Operativo - Timeline attività
   * Componente: UnifiedTimelineDiary.tsx
   * Route: /app/diary (/app/journal reindirizza qui)
   */
  JOURNAL: true, // ✅ IMPLEMENTATO
  
  /**
   * Piante Individuali - Gestione piante singole
   * Componente: SmartPlantManager.tsx
   * Route: /app/plants
   */
  INDIVIDUAL_PLANTS: true, // ✅ IMPLEMENTATO
  
  /**
   * Frutteto - Gestione completa frutteto
   * Route: /app/orchard
   */
  ORCHARD: true, // ✅ IMPLEMENTATO
  
  /**
   * Vigneto - Gestione completa vigneto
   * Route: /app/vineyard
   */
  VINEYARD: true, // ✅ IMPLEMENTATO
  
  /**
   * Oliveto - Gestione completa oliveto
   * Route: /app/olives
   */
  OLIVE_GROVE: true, // ✅ IMPLEMENTATO
  
  // ============================================
  // MODULI ALTI - Fase 2
  // ============================================
  
  /**
   * Irrigazione - Gestione zone irrigazione
   * Componente: IrrigationZoneManager.tsx
   * Route: /app/irrigation (tab "zones")
   */
  IRRIGATION_ZONES: true, // ✅ IMPLEMENTATO - montato senza gate in app/app/irrigation/page.tsx, il flag era disallineato dalla realtà

  // ============================================
  // FUNZIONALITÀ ESISTENTI (sempre attive)
  // ============================================
  
  /**
   * Dashboard professionale
   */
  PROFESSIONAL_DASHBOARD: true,
  
  /**
   * Sistema AI collaborativo
   */
  COLLABORATIVE_AI: true,
  
  /**
   * Planner modulare base
   */
  PLANNER_BASE: true,
  
  /**
   * Analytics avanzati
   */
  ANALYTICS: true,
  
  /**
   * Sistema certificazioni base
   */
  CERTIFICATIONS_BASE: true,
  
  /**
   * Irrigazione base
   */
  IRRIGATION_BASE: true,
  
  /**
   * Nutrizione base
   */
  NUTRITION_BASE: true,
  
  /**
   * Lavori meccanici base
   */
  MECHANICAL_WORK_BASE: true,
  
  /**
   * Consigli AI base
   */
  ADVICE_BASE: true,
} as const

/**
 * Type helper per feature flags
 */
export type FeatureFlag = keyof typeof FEATURES

/**
 * Controlla se una feature è attiva
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  // Controlla prima environment variable (override)
  const envKey = `NEXT_PUBLIC_FEATURE_${feature}`
  const envValue = process.env[envKey]
  
  if (envValue !== undefined) {
    return envValue === 'true'
  }
  
  // Altrimenti usa configurazione
  return FEATURES[feature]
}

/**
 * Ottieni tutte le feature attive
 */
export function getEnabledFeatures(): FeatureFlag[] {
  return Object.keys(FEATURES).filter(
    (key) => isFeatureEnabled(key as FeatureFlag)
  ) as FeatureFlag[]
}

/**
 * Ottieni tutte le feature per fase
 */
export const FEATURES_BY_PHASE = {
  PHASE_1_CRITICAL: [
    'AI_PREDICTIONS',
    'JOURNAL',
    'INDIVIDUAL_PLANTS',
    'ORCHARD',
    'VINEYARD',
    'OLIVE_GROVE',
  ] as FeatureFlag[],
  
  PHASE_2_HIGH: [
    'IRRIGATION_ZONES',
  ] as FeatureFlag[],
} as const
