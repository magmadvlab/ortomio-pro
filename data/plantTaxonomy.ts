/**
 * Nucleo Tassonomico Completo
 * Definizione di interfacce e costanti per tassonomia piante
 */

import { ArchetypeId } from '../types/archetypes';

/**
 * Categoria funzionale della pianta (per motori NPK, irrigazione, ecc.)
 */
export type FunctionalCategory = 
  | 'LEAF'      // Piante da foglia (lattuga, spinaci)
  | 'FRUIT'     // Piante da frutto (pomodoro, peperone)
  | 'ROOT'      // Piante da radice (carota, patata)
  | 'AROMATIC'  // Aromatiche (basilico, rosmarino)
  | 'LEGUME'    // Legumi (fagioli, piselli)
  | 'SPECIALIZED'; // Colture specializzate (fruttiferi, agrumi)

/**
 * Tassonomia completa di una pianta canonica
 */
export interface PlantTaxonomy {
  plantId: string; // ID canonico (es. "pomodoro", "carosello")
  names: {
    it: string; // Nome italiano canonico
    en?: string;
    [locale: string]: string | undefined;
  };
  familyId: string; // "Solanaceae", "Cucurbitaceae", ecc.
  archetypeId: ArchetypeId; // "A1", "A2", ecc.
  functionalCategory: FunctionalCategory;
  tags: string[]; // ["orto", "estivo", "puglia"]
}

/**
 * Sinonimo dialettale/locale per una pianta
 */
export interface PlantSynonym {
  synonym: string; // "burattino", "p'mdòr", "barattiere"
  normalizedSynonym: string; // versione normalizzata per matching
  plantId: string; // riferimento a PlantTaxonomy.plantId
  locale: string; // "it", "it-puglia", "it-campania", ecc.
  confidence: number; // 0.0-1.0 (1.0 = confermato)
  source: 'user' | 'admin' | 'system';
}

/**
 * Famiglia botanica
 */
export interface PlantFamily {
  id: string; // "Solanaceae"
  name: string; // "Solanaceae"
  commonNames: string[]; // ["Solanacee"]
}

/**
 * I 12 archetipi principali allineati alla proposta
 * Mappano a famiglie botaniche e categorie funzionali
 */
export const TAXONOMY_ARCHETYPES = {
  A1: {
    id: 'A1' as ArchetypeId,
    label: 'Solanacee (frutti estivi)',
    icon: '🍅',
    family: 'Solanaceae',
    functionalCategory: 'FRUIT' as FunctionalCategory,
    examples: ['pomodoro', 'peperone', 'melanzana', 'patata']
  },
  A2: {
    id: 'A2' as ArchetypeId,
    label: 'Cucurbitacee (striscianti/rampicanti)',
    icon: '🥒',
    family: 'Cucurbitaceae',
    functionalCategory: 'FRUIT' as FunctionalCategory,
    examples: ['zucchina', 'zucca', 'cetriolo', 'melone', 'anguria', 'carosello', 'barattiere']
  },
  A3: {
    id: 'A3' as ArchetypeId,
    label: 'Cavoli & brassiche',
    icon: '🥦',
    family: 'Brassicaceae',
    functionalCategory: 'LEAF' as FunctionalCategory,
    examples: ['cavolfiore', 'broccoli', 'cavolo cappuccio', 'rucola']
  },
  A4: {
    id: 'A4' as ArchetypeId,
    label: 'Legumi',
    icon: '🫘',
    family: 'Fabaceae',
    functionalCategory: 'LEGUME' as FunctionalCategory,
    examples: ['fagiolo', 'pisello', 'fava', 'cece']
  },
  A5: {
    id: 'A5' as ArchetypeId,
    label: 'Allium',
    icon: '🧅',
    family: 'Amaryllidaceae',
    functionalCategory: 'ROOT' as FunctionalCategory,
    examples: ['cipolla', 'aglio', 'porro', 'erba cipollina']
  },
  A6: {
    id: 'A6' as ArchetypeId,
    label: 'Ombrellifere',
    icon: '🥕',
    family: 'Apiaceae',
    functionalCategory: 'ROOT' as FunctionalCategory,
    examples: ['carota', 'finocchio', 'sedano', 'prezzemolo']
  },
  A7: {
    id: 'A7' as ArchetypeId,
    label: 'Insalate & cicorie',
    icon: '🥬',
    family: 'Asteraceae',
    functionalCategory: 'LEAF' as FunctionalCategory,
    examples: ['lattuga', 'cicoria', 'radicchio', 'carciofo']
  },
  A8: {
    id: 'A8' as ArchetypeId,
    label: 'Bietole & spinaci',
    icon: '🥬',
    family: 'Amaranthaceae',
    functionalCategory: 'LEAF' as FunctionalCategory,
    examples: ['bietola', 'spinacio', 'barbabietola']
  },
  A9: {
    id: 'A9' as ArchetypeId,
    label: 'Aromatiche mediterranee',
    icon: '🌿',
    family: 'Lamiaceae',
    functionalCategory: 'AROMATIC' as FunctionalCategory,
    examples: ['basilico', 'rosmarino', 'salvia', 'menta', 'timo']
  },
  A10: {
    id: 'A10' as ArchetypeId,
    label: 'Fruttiferi a nocciolo (drupacee)',
    icon: '🍑',
    family: 'Rosaceae',
    functionalCategory: 'SPECIALIZED' as FunctionalCategory,
    examples: ['pesca', 'albicocca', 'ciliegia', 'susina']
  },
  A11: {
    id: 'A11' as ArchetypeId,
    label: 'Fruttiferi a pomo (pomacee)',
    icon: '🍎',
    family: 'Rosaceae',
    functionalCategory: 'SPECIALIZED' as FunctionalCategory,
    examples: ['mela', 'pera', 'cotogna']
  },
  A12: {
    id: 'A12' as ArchetypeId,
    label: 'Agrumi',
    icon: '🍊',
    family: 'Rutaceae',
    functionalCategory: 'SPECIALIZED' as FunctionalCategory,
    examples: ['limone', 'arancio', 'mandarino']
  }
} as const;

/**
 * Helper per ottenere archetipo da ID
 */
export function getArchetypeById(id: ArchetypeId) {
  return TAXONOMY_ARCHETYPES[id as keyof typeof TAXONOMY_ARCHETYPES];
}

/**
 * Helper per ottenere famiglia da archetipo
 */
export function getFamilyFromArchetype(archetypeId: ArchetypeId): string | null {
  const archetype = getArchetypeById(archetypeId);
  return archetype?.family || null;
}

/**
 * Helper per ottenere categoria funzionale da archetipo
 */
export function getFunctionalCategoryFromArchetype(archetypeId: ArchetypeId): FunctionalCategory | null {
  const archetype = getArchetypeById(archetypeId);
  return archetype?.functionalCategory || null;
}

