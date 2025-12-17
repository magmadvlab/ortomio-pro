/**
 * Profili tecnici default per ogni archetipo
 * Contiene root depth, KC stages, NPK per calcoli irrigazione/fertilizzazione
 */

import { CropProfile, ArchetypeId } from '../types/archetypes';

export const archetypeProfiles: Record<ArchetypeId, CropProfile> = {
  'A1': {
    id: 'a1-profile',
    archetypeId: 'A1',
    rootZoneDepthCmDefault: 45,
    rootZoneDepthCmMin: 30,
    rootZoneDepthCmMax: 60,
    kcStages: {
      initial: 0.4,
      development: 0.7,
      mid: 1.0,
      late: 0.8
    },
    stressDepletionPDefault: 0.5,
    nutrientPlan: {
      germination: { N: 20, P: 10, K: 15 },
      vegetative: { N: 30, P: 15, K: 25 },
      production: { N: 25, P: 20, K: 30 }
    },
    irrigationNotes: 'Sensibili a stress in fioritura/allegagione. Irrigazione regolare durante produzione.'
  },
  'A2': {
    id: 'a2-profile',
    archetypeId: 'A2',
    rootZoneDepthCmDefault: 35,
    rootZoneDepthCmMin: 20,
    rootZoneDepthCmMax: 50,
    kcStages: {
      initial: 0.5,
      development: 0.7,
      mid: 1.0,
      late: 0.9
    },
    stressDepletionPDefault: 0.5,
    nutrientPlan: {
      germination: { N: 15, P: 10, K: 15 },
      vegetative: { N: 25, P: 15, K: 20 },
      production: { N: 20, P: 15, K: 25 }
    },
    irrigationNotes: 'Richiedono regolarità irrigazione (no sbalzi). Frequenza > dose.'
  },
  'A3': {
    id: 'a3-profile',
    archetypeId: 'A3',
    rootZoneDepthCmDefault: 55,
    rootZoneDepthCmMin: 30,
    rootZoneDepthCmMax: 80,
    kcStages: {
      initial: 0.5,
      development: 0.7,
      mid: 1.1,
      late: 0.9
    },
    stressDepletionPDefault: 0.5,
    nutrientPlan: {
      germination: { N: 15, P: 10, K: 15 },
      vegetative: { N: 30, P: 15, K: 25 },
      production: { N: 25, P: 20, K: 35 }
    },
    irrigationNotes: 'Volumi alti, attenzione stress in accrescimento. Irrigazione abbondante ma controllata.'
  },
  'A4': {
    id: 'a4-profile',
    archetypeId: 'A4',
    rootZoneDepthCmDefault: 18,
    rootZoneDepthCmMin: 10,
    rootZoneDepthCmMax: 25,
    kcStages: {
      initial: 0.6,
      development: 0.8,
      mid: 1.0,
      late: 0.9
    },
    stressDepletionPDefault: 0.4,
    nutrientPlan: {
      germination: { N: 20, P: 10, K: 10 },
      vegetative: { N: 30, P: 15, K: 20 },
      production: { N: 25, P: 15, K: 20 }
    },
    irrigationNotes: 'Radici superficiali: frequenza > dose. Irrigazione leggera e frequente.'
  },
  'A5': {
    id: 'a5-profile',
    archetypeId: 'A5',
    rootZoneDepthCmDefault: 30,
    rootZoneDepthCmMin: 20,
    rootZoneDepthCmMax: 40,
    kcStages: {
      initial: 0.5,
      development: 0.7,
      mid: 0.9,
      late: 0.8
    },
    stressDepletionPDefault: 0.5,
    nutrientPlan: {
      germination: { N: 20, P: 10, K: 15 },
      vegetative: { N: 30, P: 15, K: 25 },
      production: { N: 25, P: 15, K: 25 }
    },
    irrigationNotes: 'Più tolleranti di insalate. Irrigazione moderata.'
  },
  'A6': {
    id: 'a6-profile',
    archetypeId: 'A6',
    rootZoneDepthCmDefault: 45,
    rootZoneDepthCmMin: 30,
    rootZoneDepthCmMax: 60,
    kcStages: {
      initial: 0.5,
      development: 0.7,
      mid: 1.0,
      late: 0.9
    },
    stressDepletionPDefault: 0.5,
    nutrientPlan: {
      germination: { N: 25, P: 15, K: 20 },
      vegetative: { N: 35, P: 20, K: 30 },
      production: { N: 30, P: 20, K: 30 }
    },
    irrigationNotes: 'Soffrono stress idrico in fase di "testa". Irrigazione costante durante sviluppo.'
  },
  'A7': {
    id: 'a7-profile',
    archetypeId: 'A7',
    rootZoneDepthCmDefault: 30,
    rootZoneDepthCmMin: 20,
    rootZoneDepthCmMax: 40,
    kcStages: {
      initial: 0.5,
      development: 0.7,
      mid: 0.9,
      late: 0.7
    },
    stressDepletionPDefault: 0.5,
    nutrientPlan: {
      germination: { N: 20, P: 15, K: 15 },
      vegetative: { N: 25, P: 20, K: 20 },
      production: { N: 20, P: 20, K: 25 }
    },
    irrigationNotes: 'Attenzione eccesso acqua (marciumi). Terreno ben drenato essenziale.'
  },
  'A8': {
    id: 'a8-profile',
    archetypeId: 'A8',
    rootZoneDepthCmDefault: 40,
    rootZoneDepthCmMin: 20,
    rootZoneDepthCmMax: 60,
    kcStages: {
      initial: 0.5,
      development: 0.7,
      mid: 1.0,
      late: 0.8
    },
    stressDepletionPDefault: 0.5,
    nutrientPlan: {
      germination: { N: 15, P: 15, K: 20 },
      vegetative: { N: 25, P: 20, K: 30 },
      production: { N: 20, P: 25, K: 35 }
    },
    irrigationNotes: 'Stress = deformazioni/calibro. Patata più sensibile. Irrigazione regolare durante sviluppo radici.'
  },
  'A9': {
    id: 'a9-profile',
    archetypeId: 'A9',
    rootZoneDepthCmDefault: 40,
    rootZoneDepthCmMin: 20,
    rootZoneDepthCmMax: 60,
    kcStages: {
      initial: 0.5,
      development: 0.7,
      mid: 1.0,
      late: 0.8
    },
    stressDepletionPDefault: 0.5,
    nutrientPlan: {
      germination: { N: 5, P: 15, K: 15 },
      vegetative: { N: 10, P: 20, K: 25 },
      production: { N: 5, P: 25, K: 30 }
    },
    irrigationNotes: 'Picchi acqua in fioritura/allegagione. Azoto limitato (fissano N).'
  },
  'A10': {
    id: 'a10-profile',
    archetypeId: 'A10',
    rootZoneDepthCmDefault: 25,
    rootZoneDepthCmMin: 10,
    rootZoneDepthCmMax: 40,
    kcStages: {
      initial: 0.5,
      development: 0.6,
      mid: 0.7,
      late: 0.6
    },
    stressDepletionPDefault: 0.6,
    nutrientPlan: {
      germination: { N: 15, P: 10, K: 10 },
      vegetative: { N: 20, P: 15, K: 15 },
      production: { N: 15, P: 15, K: 15 }
    },
    irrigationNotes: 'Spesso meglio "poco ma giusto". Molte tollerano secco. Evitare eccessi.'
  },
  'A11': {
    id: 'a11-profile',
    archetypeId: 'A11',
    rootZoneDepthCmDefault: 40,
    rootZoneDepthCmMin: 20,
    rootZoneDepthCmMax: 60,
    kcStages: {
      initial: 0.5,
      development: 0.7,
      mid: 0.9,
      late: 0.8
    },
    stressDepletionPDefault: 0.5,
    nutrientPlan: {
      germination: { N: 20, P: 15, K: 20 },
      vegetative: { N: 30, P: 20, K: 30 },
      production: { N: 25, P: 25, K: 35 }
    },
    irrigationNotes: 'Fragola molto sensibile. Mirtillo richiede gestione specifica suolo (acidofila).'
  },
  'A12': {
    id: 'a12-profile',
    archetypeId: 'A12',
    rootZoneDepthCmDefault: 80,
    rootZoneDepthCmMin: 50,
    rootZoneDepthCmMax: 150,
    kcStages: {
      initial: 0.4,
      development: 0.6,
      mid: 0.8,
      late: 0.7
    },
    stressDepletionPDefault: 0.6,
    nutrientPlan: {
      germination: { N: 20, P: 15, K: 20 },
      vegetative: { N: 30, P: 20, K: 30 },
      production: { N: 25, P: 25, K: 35 }
    },
    irrigationNotes: 'Profondità radici varia con età/portinnesto. Irrigazione strategica.'
  },
  'L1': {
    id: 'l1-profile',
    archetypeId: 'L1',
    rootZoneDepthCmDefault: 80,
    rootZoneDepthCmMin: 40,
    rootZoneDepthCmMax: 120,
    kcStages: {
      initial: 0.3,
      development: 0.5,
      mid: 0.7,
      late: 0.6
    },
    stressDepletionPDefault: 0.6,
    nutrientPlan: {
      germination: { N: 20, P: 15, K: 25 },
      vegetative: { N: 30, P: 20, K: 35 },
      production: { N: 25, P: 25, K: 40 }
    },
    irrigationNotes: 'Logica qualità vs quantità. Stress controllato possibile per qualità. Irrigazione strategica.'
  },
  'L2': {
    id: 'l2-profile',
    archetypeId: 'L2',
    rootZoneDepthCmDefault: 105,
    rootZoneDepthCmMin: 60,
    rootZoneDepthCmMax: 150,
    kcStages: {
      initial: 0.3,
      development: 0.4,
      mid: 0.6,
      late: 0.5
    },
    stressDepletionPDefault: 0.7,
    nutrientPlan: {
      germination: { N: 15, P: 10, K: 15 },
      vegetative: { N: 25, P: 15, K: 25 },
      production: { N: 20, P: 20, K: 30 }
    },
    irrigationNotes: 'Irrigazione di supporto strategica (spesso). Tollerante alla siccità ma beneficia irrigazione controllata.'
  },
  'L3': {
    id: 'l3-profile',
    archetypeId: 'L3',
    rootZoneDepthCmDefault: 100,
    rootZoneDepthCmMin: 50,
    rootZoneDepthCmMax: 150,
    kcStages: {
      initial: 0.4,
      development: 0.6,
      mid: 0.8,
      late: 0.7
    },
    stressDepletionPDefault: 0.6,
    nutrientPlan: {
      germination: { N: 20, P: 15, K: 20 },
      vegetative: { N: 30, P: 20, K: 30 },
      production: { N: 25, P: 25, K: 35 }
    },
    irrigationNotes: 'Cambia con età/portinnesto: serve override facile. Irrigazione regolare durante produzione.'
  },
  'L3_CITRUS': {
    id: 'l3-profile',
    archetypeId: 'L3_CITRUS',
    rootZoneDepthCmDefault: 100,
    rootZoneDepthCmMin: 50,
    rootZoneDepthCmMax: 150,
    kcStages: {
      initial: 0.4,
      development: 0.6,
      mid: 0.8,
      late: 0.7
    },
    stressDepletionPDefault: 0.6,
    nutrientPlan: {
      germination: { N: 20, P: 15, K: 20 },
      vegetative: { N: 30, P: 20, K: 30 },
      production: { N: 25, P: 25, K: 35 }
    },
    irrigationNotes: 'Cambia con età/portinnesto: serve override facile. Irrigazione regolare durante produzione.'
  },
  'L3_STONE': {
    id: 'l3-profile',
    archetypeId: 'L3_STONE',
    rootZoneDepthCmDefault: 100,
    rootZoneDepthCmMin: 50,
    rootZoneDepthCmMax: 150,
    kcStages: {
      initial: 0.4,
      development: 0.6,
      mid: 0.8,
      late: 0.7
    },
    stressDepletionPDefault: 0.6,
    nutrientPlan: {
      germination: { N: 20, P: 15, K: 20 },
      vegetative: { N: 30, P: 20, K: 30 },
      production: { N: 25, P: 25, K: 35 }
    },
    irrigationNotes: 'Cambia con età/portinnesto: serve override facile. Irrigazione regolare durante produzione.'
  },
  'L3_POME': {
    id: 'l3-profile',
    archetypeId: 'L3_POME',
    rootZoneDepthCmDefault: 100,
    rootZoneDepthCmMin: 50,
    rootZoneDepthCmMax: 150,
    kcStages: {
      initial: 0.4,
      development: 0.6,
      mid: 0.8,
      late: 0.7
    },
    stressDepletionPDefault: 0.6,
    nutrientPlan: {
      germination: { N: 20, P: 15, K: 20 },
      vegetative: { N: 30, P: 20, K: 30 },
      production: { N: 25, P: 25, K: 35 }
    },
    irrigationNotes: 'Cambia con età/portinnesto: serve override facile. Irrigazione regolare durante produzione.'
  },
  'L3_EXOTIC': {
    id: 'l3-profile',
    archetypeId: 'L3_EXOTIC',
    rootZoneDepthCmDefault: 100,
    rootZoneDepthCmMin: 50,
    rootZoneDepthCmMax: 150,
    kcStages: {
      initial: 0.4,
      development: 0.6,
      mid: 0.8,
      late: 0.7
    },
    stressDepletionPDefault: 0.6,
    nutrientPlan: {
      germination: { N: 20, P: 15, K: 20 },
      vegetative: { N: 30, P: 20, K: 30 },
      production: { N: 25, P: 25, K: 35 }
    },
    irrigationNotes: 'Cambia con età/portinnesto: serve override facile. Irrigazione regolare durante produzione.'
  }
};

/**
 * Ottiene profilo default per un archetipo
 */
export const getProfileByArchetypeId = (archetypeId: ArchetypeId): CropProfile | undefined => {
  return archetypeProfiles[archetypeId];
};

