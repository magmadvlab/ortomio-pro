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
  AI_PREDICTIONS: true, // ✅ IMPLEMENTATO
  
  /**
   * Diario Operativo - Timeline attività
   * Componente: OperationalDiary.tsx
   * Route: /app/journal
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
   */
  IRRIGATION_ZONES: false, // TODO: Attivare dopo implementazione
  
  /**
   * Irrigazione - Programmazione automatica
   * Componente: AutomaticScheduler.tsx
   */
  IRRIGATION_SCHEDULING: false, // TODO: Attivare dopo implementazione
  
  /**
   * Irrigazione - Analytics consumo acqua
   * Componente: WaterConsumptionAnalytics.tsx
   */
  IRRIGATION_ANALYTICS: false, // TODO: Attivare dopo implementazione
  
  /**
   * Nutrizione - Inventario prodotti
   * Componente: ProductInventoryManager.tsx
   */
  NUTRITION_INVENTORY: false, // TODO: Attivare dopo implementazione
  
  /**
   * Nutrizione - Calcolo dosi per zona
   * Componente: DoseCalculator.tsx
   */
  NUTRITION_DOSE_CALCULATOR: false, // TODO: Attivare dopo implementazione
  
  /**
   * Nutrizione - Compatibilità prodotti
   * Componente: ProductCompatibilityChecker.tsx
   */
  NUTRITION_COMPATIBILITY: false, // TODO: Attivare dopo implementazione
  
  // ============================================
  // MODULI MEDI - Fase 3
  // ============================================
  
  /**
   * Lavori Meccanici - Gestione attrezzature
   * Componente: EquipmentManager.tsx
   */
  EQUIPMENT_MANAGEMENT: false, // TODO: Attivare dopo implementazione
  
  /**
   * Lavori Meccanici - Calendario manutenzioni
   * Componente: MaintenanceScheduler.tsx
   */
  MAINTENANCE_SCHEDULER: false, // TODO: Attivare dopo implementazione
  
  /**
   * Lavori Meccanici - Costi operativi
   * Componente: OperationalCostsTracker.tsx
   */
  OPERATIONAL_COSTS: false, // TODO: Attivare dopo implementazione
  
  /**
   * Certificazioni - Gestione documenti avanzata
   * Componente: AdvancedDocumentManager.tsx
   */
  ADVANCED_CERTIFICATIONS: false, // TODO: Attivare dopo implementazione
  
  /**
   * Consigli - Consigli stagionali base
   * Componente: SeasonalAdvice.tsx
   */
  SEASONAL_ADVICE: false, // TODO: Attivare dopo implementazione
  
  /**
   * Planner - Wizard piantagione esteso
   * Componente: ExtendedPlannerWizard.tsx
   */
  PLANNER_WIZARD_EXTENDED: false, // TODO: Attivare dopo implementazione
  
  /**
   * Planner - Selezione materiale (seme/piantina/alberello)
   * Componente: MaterialSelector.tsx
   */
  PLANNER_MATERIAL_SELECTOR: false, // TODO: Attivare dopo implementazione
  
  /**
   * Planner - Collegamento banca semi
   * Componente: SeedBankConnector.tsx
   */
  PLANNER_SEED_BANK: false, // TODO: Attivare dopo implementazione
  
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
    'IRRIGATION_SCHEDULING',
    'IRRIGATION_ANALYTICS',
    'NUTRITION_INVENTORY',
    'NUTRITION_DOSE_CALCULATOR',
    'NUTRITION_COMPATIBILITY',
  ] as FeatureFlag[],
  
  PHASE_3_MEDIUM: [
    'EQUIPMENT_MANAGEMENT',
    'MAINTENANCE_SCHEDULER',
    'OPERATIONAL_COSTS',
    'ADVANCED_CERTIFICATIONS',
    'SEASONAL_ADVICE',
    'PLANNER_WIZARD_EXTENDED',
    'PLANNER_MATERIAL_SELECTOR',
    'PLANNER_SEED_BANK',
  ] as FeatureFlag[],
} as const
