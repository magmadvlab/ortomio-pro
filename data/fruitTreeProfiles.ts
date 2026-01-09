/**
 * Profili tecnici base per categorie di frutteti
 * Ogni profilo contiene parametri per calcoli irrigazione e fertilizzazione
 * Tutti i profili usano l'archetype L3 come base
 */

import { CropProfile } from '../types/archetypes';
import { FruitTreeCategory } from '../types/orchardTypes';

export const fruitTreeProfiles: Record<FruitTreeCategory, CropProfile> = {
  DRUPACEE: {
    id: 'l3-drupacee-profile',
    archetypeId: 'L3', // Usa sempre L3 come archetype
    rootZoneDepthCmDefault: 60,
    rootZoneDepthCmMin: 40,
    rootZoneDepthCmMax: 80,
    kcStages: {
      initial: 0.5,      // Fase iniziale (primavera - risveglio vegetativo)
      development: 0.7,  // Sviluppo foglie/fiori (aprile-maggio)
      mid: 1.0,          // Piena produzione (estate - sviluppo frutti)
      late: 0.8          // Maturazione frutti (fine estate)
    },
    stressDepletionPDefault: 0.5, // Stress moderato - irrigare quando metà acqua disponibile esaurita
    nutrientPlan: {
      germination: { N: 0, P: 0, K: 0 }, // Non applicabile per alberi
      vegetative: { N: 80, P: 40, K: 100 }, // g/m² - fase sviluppo vegetativo
      production: { N: 60, P: 50, K: 120 }  // g/m² - fase produzione frutti
    },
    irrigationNotes: 'Irrigazione profonda e distanziata. Evitare ristagni. Frequenza: ogni 7-10 giorni in estate.'
  },
  
  POMACEE: {
    id: 'l3-pomacee-profile',
    archetypeId: 'L3',
    rootZoneDepthCmDefault: 70,
    rootZoneDepthCmMin: 50,
    rootZoneDepthCmMax: 100,
    kcStages: {
      initial: 0.5,      // Fase iniziale (primavera)
      development: 0.75, // Sviluppo foglie/fiori
      mid: 1.0,          // Piena produzione (sviluppo frutti)
      late: 0.85         // Maturazione frutti
    },
    stressDepletionPDefault: 0.5,
    nutrientPlan: {
      germination: { N: 0, P: 0, K: 0 },
      vegetative: { N: 100, P: 50, K: 120 }, // g/m²
      production: { N: 80, P: 60, K: 150 }    // g/m² - maggiore K per qualità frutti
    },
    irrigationNotes: 'Irrigazione regolare durante sviluppo frutti (giugno-agosto). Evitare stress idrico durante maturazione.'
  },
  
  AGRUMI: {
    id: 'l3-agrumi-profile',
    archetypeId: 'L3',
    rootZoneDepthCmDefault: 50,
    rootZoneDepthCmMin: 30,
    rootZoneDepthCmMax: 70,
    kcStages: {
      initial: 0.6,      // Fase iniziale (primavera)
      development: 0.8,  // Sviluppo foglie/fiori
      mid: 1.0,          // Piena produzione (estate)
      late: 0.9          // Maturazione frutti (autunno-inverno)
    },
    stressDepletionPDefault: 0.4, // Stress più basso - agrumi sensibili a siccità
    nutrientPlan: {
      germination: { N: 0, P: 0, K: 0 },
      vegetative: { N: 120, P: 40, K: 100 }, // g/m² - maggiore N per sviluppo fogliare
      production: { N: 100, P: 50, K: 140 }   // g/m² - maggiore K per qualità frutti
    },
    irrigationNotes: 'Irrigazione frequente ma moderata. Agrumi sensibili a ristagni. Frequenza: ogni 5-7 giorni in estate.'
  },
  
  FRUTTA_GUSCIO: {
    id: 'l3-frutta-guscio-profile',
    archetypeId: 'L3',
    rootZoneDepthCmDefault: 80,
    rootZoneDepthCmMin: 60,
    rootZoneDepthCmMax: 120,
    kcStages: {
      initial: 0.5,
      development: 0.7,
      mid: 0.9,          // Minore rispetto ad altri - alberi più rustici
      late: 0.7
    },
    stressDepletionPDefault: 0.6, // Stress più alto - alberi più resistenti
    nutrientPlan: {
      germination: { N: 0, P: 0, K: 0 },
      vegetative: { N: 60, P: 50, K: 80 },  // g/m²
      production: { N: 50, P: 60, K: 100 }  // g/m² - maggiore P per sviluppo guscio
    },
    irrigationNotes: 'Irrigazione profonda ma meno frequente. Alberi rustici, tolleranti a siccità moderata.'
  },
  
  MEDITERRANEA: {
    id: 'l3-mediterranea-profile',
    archetypeId: 'L3',
    rootZoneDepthCmDefault: 40,
    rootZoneDepthCmMin: 30,
    rootZoneDepthCmMax: 60,
    kcStages: {
      initial: 0.5,
      development: 0.7,
      mid: 0.9,
      late: 0.8
    },
    stressDepletionPDefault: 0.55,
    nutrientPlan: {
      germination: { N: 0, P: 0, K: 0 },
      vegetative: { N: 70, P: 40, K: 90 },  // g/m²
      production: { N: 60, P: 50, K: 110 }   // g/m²
    },
    irrigationNotes: 'Irrigazione moderata. Fichi e melograni tolleranti a siccità. Irrigare durante sviluppo frutti.'
  },
  
  KIWI: {
    id: 'l3-kiwi-profile',
    archetypeId: 'L3',
    rootZoneDepthCmDefault: 50,
    rootZoneDepthCmMin: 40,
    rootZoneDepthCmMax: 70,
    kcStages: {
      initial: 0.6,
      development: 0.8,
      mid: 1.1,          // Maggiore - kiwi richiede molta acqua
      late: 0.9
    },
    stressDepletionPDefault: 0.4, // Stress basso - kiwi sensibile
    nutrientPlan: {
      germination: { N: 0, P: 0, K: 0 },
      vegetative: { N: 100, P: 50, K: 120 }, // g/m²
      production: { N: 80, P: 60, K: 150 }    // g/m²
    },
    irrigationNotes: 'Irrigazione abbondante e frequente. Kiwi richiede molta acqua, soprattutto durante sviluppo frutti. Frequenza: ogni 3-5 giorni in estate.'
  },
  
  ESOTICHE: {
    id: 'l3-esotiche-profile',
    archetypeId: 'L3',
    rootZoneDepthCmDefault: 60,
    rootZoneDepthCmMin: 40,
    rootZoneDepthCmMax: 80,
    kcStages: {
      initial: 0.6,
      development: 0.8,
      mid: 1.0,
      late: 0.9
    },
    stressDepletionPDefault: 0.45, // Stress moderato-basso
    nutrientPlan: {
      germination: { N: 0, P: 0, K: 0 },
      vegetative: { N: 90, P: 45, K: 110 }, // g/m²
      production: { N: 70, P: 55, K: 130 }  // g/m²
    },
    irrigationNotes: 'Irrigazione regolare. Avocado e altre esotiche richiedono clima caldo e umidità costante. Proteggere da gelate.'
  }
};

/**
 * Ottiene profilo tecnico per categoria
 */
export const getProfileForCategory = (category: FruitTreeCategory): CropProfile => {
  return fruitTreeProfiles[category];
};

/**
 * Ottiene profilo tecnico per ID profilo
 */
export const getProfileById = (profileId: string): CropProfile | undefined => {
  return Object.values(fruitTreeProfiles).find(p => p.id === profileId);
};

