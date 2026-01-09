/**
 * Sistema Archetipi 3 Livelli
 * Gestione nomi locali e varietà senza dataset infinito
 */

// Union type per tutti gli ID archetipi
export type ArchetypeId = 
  // Archetipi principali (A1-A12)
  | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8' | 'A9' | 'A10' | 'A11' | 'A12'
  // Archetipo generico (orto misto)
  | 'MIX'
  // Sub-griglia A12 → Colture legnose (L1/L2/L3)
  | 'L1' | 'L2' | 'L3'
  // Sub-griglia L3 → Alberi da frutto specifici
  | 'L3_CITRUS' | 'L3_STONE' | 'L3_POME' | 'L3_EXOTIC';

/**
 * Archetipo completo con informazioni per UI e logica
 */
export interface CropArchetype {
  id: ArchetypeId;
  label: string; // 'Solanacee da frutto'
  icon: string; // '🍅'
  botanicalFamily: string; // 'Solanaceae'
  defaultProfileId: string; // UUID del profilo default
  parentArchetypeId?: ArchetypeId; // Per sub-griglie (L1/L2/L3 sotto A12)
  examples?: string[]; // Esempi per UX ['pomodoro', 'peperone', 'melanzana']
}

/**
 * Profilo tecnico default per archetipo
 * Contiene i parametri necessari per calcoli irrigazione/fertilizzazione
 */
export interface CropProfile {
  id: string; // UUID
  archetypeId: ArchetypeId;
  
  // Profondità radici (cm)
  rootZoneDepthCmDefault: number; // Valore medio (es. 45 per range 30-60)
  rootZoneDepthCmMin?: number; // Min del range
  rootZoneDepthCmMax?: number; // Max del range
  
  // Coefficienti colturali (KC) per fasi irrigazione
  kcStages: {
    initial: number; // Fase iniziale
    development: number; // Fase sviluppo
    mid: number; // Fase piena produzione
    late: number; // Fase finale
  };
  
  // Stress depletion (p) - quanto stress accetti prima di irrigare
  stressDepletionPDefault: number; // 0.0-1.0
  
  // Piano nutrizionale base (NPK per 3 fasi)
  nutrientPlan?: {
    germination: { N: number; P: number; K: number };
    vegetative: { N: number; P: number; K: number };
    production: { N: number; P: number; K: number };
  };
  
  // Note pratiche per irrigazione
  irrigationNotes?: string;
}

/**
 * Alias per nomi locali → archetipo
 * Permette di mappare nomi dialettali/locali agli archetipi
 */
export interface CropAlias {
  id: string; // UUID
  aliasText: string; // 'burattino', 'carosello', ecc.
  archetypeId: ArchetypeId;
  
  // Opzionale: geolocalizzazione per disambiguare
  region?: string; // 'Puglia', 'Sicilia', ecc.
  province?: string; // 'Bari', 'Palermo', ecc.
  
  // Opzionale: suggerisce varietyType per L1 (Vite) e L2 (Olivo)
  defaultVarietyType?: 'Wine' | 'Table' | 'Oil' | 'Dual-purpose';
  
  // Confidence e tracciamento
  confidence: number; // 0.0-1.0 (1.0 = confermato dall'utente)
  createdBy?: string; // UUID utente che ha creato l'alias
  usageCount: number; // Quante volte è stato usato
  
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

/**
 * Coltura ufficiale (opzionale, per UX migliore)
 * Permette ricerca rapida per nomi comuni
 */
export interface OfficialCrop {
  id: string; // UUID
  name: string; // 'Pomodoro', 'Lattuga', ecc.
  archetypeId: ArchetypeId;
  profileOverrideId?: string; // UUID profilo override (se diverso da default)
  scientificName?: string; // Nome scientifico
}

