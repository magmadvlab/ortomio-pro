/**
 * Servizio Tassonomia Piante
 * Fornisce accesso a family, archetype, functionalCategory per una pianta
 * Con fallback a PlantMasterSheet se non trova in taxonomy
 */

import { getSupabaseClient } from '../config/supabase';
import { getMasterSheet } from './plantMasterService';
import { PlantTaxonomy, FunctionalCategory } from '../data/plantTaxonomy';
import { ArchetypeId } from '../types/archetypes';

/**
 * Risultato tassonomia completa
 */
export interface PlantTaxonomyResult {
  plantId: string;
  familyId: string;
  archetypeId: ArchetypeId | null;
  functionalCategory: FunctionalCategory | null;
  source: 'taxonomy' | 'master_sheet' | 'inferred';
}

/**
 * Ottiene tassonomia completa per una pianta
 * 
 * @param plantId ID della pianta (es. "pomodoro", "carosello")
 * @returns Tassonomia completa o null se non trovata
 */
export async function getPlantTaxonomy(plantId: string): Promise<PlantTaxonomyResult | null> {
  if (!plantId) return null;

  const supabase = getSupabaseClient();

  // Se Supabase è disponibile, cerca in database
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('plant_taxonomy')
        .select('plant_id, family_id, archetype_id, functional_category')
        .eq('plant_id', plantId.toLowerCase().trim())
        .single();

      if (!error && data) {
        return {
          plantId: data.plant_id,
          familyId: data.family_id,
          archetypeId: data.archetype_id as ArchetypeId,
          functionalCategory: data.functional_category as FunctionalCategory,
          source: 'taxonomy'
        };
      }
    } catch (error) {
      console.error('Error fetching plant taxonomy from Supabase:', error);
    }
  }

  // Fallback 1: Cerca in seed locale
  const seedResult = getPlantTaxonomyFromSeed(plantId);
  if (seedResult) {
    return seedResult;
  }

  // Fallback 2: Usa PlantMasterSheet esistente
  const masterSheet = getMasterSheet(plantId);
  if (masterSheet) {
    return {
      plantId: masterSheet.id,
      familyId: masterSheet.family,
      archetypeId: inferArchetypeFromFamily(masterSheet.family),
      functionalCategory: inferFunctionalCategory(masterSheet.nutrientCategory),
      source: 'master_sheet'
    };
  }

  // Fallback 3: Prova inferenza da nome
  return inferTaxonomyFromName(plantId);
}

/**
 * Ottiene famiglia botanica di una pianta
 */
export async function getPlantFamily(plantId: string): Promise<string | null> {
  const taxonomy = await getPlantTaxonomy(plantId);
  return taxonomy?.familyId || null;
}

/**
 * Ottiene archetipo di una pianta
 */
export async function getPlantArchetype(plantId: string): Promise<ArchetypeId | null> {
  const taxonomy = await getPlantTaxonomy(plantId);
  return taxonomy?.archetypeId || null;
}

/**
 * Ottiene categoria funzionale di una pianta
 */
export async function getPlantFunctionalCategory(plantId: string): Promise<FunctionalCategory | null> {
  const taxonomy = await getPlantTaxonomy(plantId);
  return taxonomy?.functionalCategory || null;
}

/**
 * Cerca tassonomia in seed locale (fallback)
 */
function getPlantTaxonomyFromSeed(plantId: string): PlantTaxonomyResult | null {
  try {
    const { plantTaxonomySeed } = require('../data/plantTaxonomySeed');
    const normalized = plantId.toLowerCase().trim();
    
    const taxonomy = plantTaxonomySeed.find((p: PlantTaxonomy) => 
      p.plantId === normalized || 
      p.plantId.toLowerCase() === normalized
    );

    if (taxonomy) {
      return {
        plantId: taxonomy.plantId,
        familyId: taxonomy.familyId,
        archetypeId: taxonomy.archetypeId,
        functionalCategory: taxonomy.functionalCategory,
        source: 'taxonomy'
      };
    }
  } catch (error) {
    console.error('Error loading plant taxonomy seed:', error);
  }

  return null;
}

/**
 * Inferisce archetipo da famiglia botanica
 */
function inferArchetypeFromFamily(family: string): ArchetypeId | null {
  const familyToArchetype: Record<string, ArchetypeId> = {
    'Solanaceae': 'A1',
    'Cucurbitaceae': 'A2',
    'Brassicaceae': 'A3',
    'Fabaceae': 'A4',
    'Amaryllidaceae': 'A5',
    'Apiaceae': 'A6',
    'Asteraceae': 'A7',
    'Amaranthaceae': 'A8',
    'Lamiaceae': 'A9',
    'Rosaceae': 'A10', // Nota: potrebbe essere A10, A11, o A12 - usa A10 come default
    'Rutaceae': 'A12'
  };

  return familyToArchetype[family] || null;
}

/**
 * Inferisce categoria funzionale da nutrientCategory
 */
function inferFunctionalCategory(nutrientCategory: string): FunctionalCategory | null {
  const categoryMap: Record<string, FunctionalCategory> = {
    'FRUITING': 'FRUIT',
    'LEAFY': 'LEAF',
    'ROOT': 'ROOT',
    'LEGUME': 'LEGUME',
    'AROMATIC': 'AROMATIC'
  };

  return categoryMap[nutrientCategory] || null;
}

/**
 * Inferisce tassonomia da nome pianta (ultimo fallback)
 */
function inferTaxonomyFromName(plantId: string): PlantTaxonomyResult | null {
  const normalized = plantId.toLowerCase().trim();

  // Mapping basico per piante comuni
  const nameToFamily: Record<string, string> = {
    'pomodoro': 'Solanaceae',
    'peperone': 'Solanaceae',
    'peperoncino': 'Solanaceae',
    'melanzana': 'Solanaceae',
    'patata': 'Solanaceae',
    'zucchina': 'Cucurbitaceae',
    'cetriolo': 'Cucurbitaceae',
    'carosello': 'Cucurbitaceae',
    'barattiere': 'Cucurbitaceae',
    'zucca': 'Cucurbitaceae',
    'melone': 'Cucurbitaceae',
    'anguria': 'Cucurbitaceae',
    'cavolfiore': 'Brassicaceae',
    'broccoli': 'Brassicaceae',
    'cavolo': 'Brassicaceae',
    'rucola': 'Brassicaceae',
    'fagiolo': 'Fabaceae',
    'pisello': 'Fabaceae',
    'fava': 'Fabaceae',
    'cece': 'Fabaceae',
    'cipolla': 'Amaryllidaceae',
    'aglio': 'Amaryllidaceae',
    'porro': 'Amaryllidaceae',
    'carota': 'Apiaceae',
    'finocchio': 'Apiaceae',
    'sedano': 'Apiaceae',
    'prezzemolo': 'Apiaceae',
    'lattuga': 'Asteraceae',
    'cicoria': 'Asteraceae',
    'radicchio': 'Asteraceae',
    'bietola': 'Amaranthaceae',
    'spinacio': 'Amaranthaceae',
    'barbabietola': 'Amaranthaceae',
    'basilico': 'Lamiaceae',
    'rosmarino': 'Lamiaceae',
    'salvia': 'Lamiaceae',
    'menta': 'Lamiaceae',
    'timo': 'Lamiaceae'
  };

  const family = nameToFamily[normalized];
  if (!family) return null;

  const archetypeId = inferArchetypeFromFamily(family);
  if (!archetypeId) return null;

  // Inferisci categoria funzionale basandoti su pattern comuni
  let functionalCategory: FunctionalCategory = 'FRUIT';
  if (normalized.includes('cavolo') || normalized.includes('broccoli') || 
      normalized.includes('lattuga') || normalized.includes('spinacio') || 
      normalized.includes('bietola')) {
    functionalCategory = 'LEAF';
  } else if (normalized.includes('carota') || normalized.includes('patata') || 
             normalized.includes('cipolla') || normalized.includes('aglio')) {
    functionalCategory = 'ROOT';
  } else if (normalized.includes('fagiolo') || normalized.includes('pisello') || 
             normalized.includes('fava') || normalized.includes('cece')) {
    functionalCategory = 'LEGUME';
  } else if (normalized.includes('basilico') || normalized.includes('rosmarino') || 
             normalized.includes('salvia') || normalized.includes('menta') || 
             normalized.includes('timo') || normalized.includes('prezzemolo')) {
    functionalCategory = 'AROMATIC';
  }

  return {
    plantId: normalized,
    familyId: family,
    archetypeId,
    functionalCategory,
    source: 'inferred'
  };
}

