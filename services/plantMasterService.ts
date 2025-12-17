import { PlantMasterSheet, VarietyMapping, BehavioralTag } from '../types';
import { plantMasterSheets, behavioralTags } from '../data/plantMasterSheets';
import { varietyMappings } from '../data/varietyMappings';
import { getAllSpecializedMasterSheets } from '../data/specializedCropMasterSheets';
import { getPlantTaxonomy, getPlantArchetype } from './plantTaxonomyService';
import { ArchetypeId } from '../types/archetypes';

/**
 * Trova la scheda master per una specie (include anche colture specializzate)
 * Arricchita con archetypeId dalla taxonomy se disponibile
 */
export const getMasterSheet = async (speciesName: string): Promise<PlantMasterSheet | null> => {
  const normalized = speciesName.toLowerCase().trim();
  
  // Cerca prima nelle piante base
  const baseMatch = plantMasterSheets.find(sheet => 
    sheet.id === normalized ||
    sheet.commonName.toLowerCase().includes(normalized) ||
    sheet.scientificName.toLowerCase().includes(normalized) ||
    sheet.commonName.toLowerCase() === normalized
  );
  
  if (baseMatch) {
    // Arricchisci con archetypeId dalla taxonomy
    const archetypeId = await getPlantArchetype(normalized);
    if (archetypeId) {
      return { ...baseMatch, archetypeId } as PlantMasterSheet & { archetypeId?: ArchetypeId };
    }
    return baseMatch;
  }
  
  // Cerca nelle colture specializzate
  const specializedSheets = getAllSpecializedMasterSheets();
  const specializedMatch = specializedSheets.find(sheet => 
    sheet.id === normalized ||
    sheet.commonName.toLowerCase().includes(normalized) ||
    sheet.scientificName.toLowerCase().includes(normalized) ||
    sheet.commonName.toLowerCase() === normalized
  );
  
  if (specializedMatch) {
    // Arricchisci con archetypeId dalla taxonomy
    const archetypeId = await getPlantArchetype(normalized);
    if (archetypeId) {
      return { ...specializedMatch, archetypeId } as PlantMasterSheet & { archetypeId?: ArchetypeId };
    }
    return specializedMatch;
  }
  
  return null;
};

/**
 * Versione sincrona di getMasterSheet (per retrocompatibilità)
 * Non include archetypeId
 */
export const getMasterSheetSync = (speciesName: string): PlantMasterSheet | null => {
  const normalized = speciesName.toLowerCase().trim();
  
  // Cerca prima nelle piante base
  const baseMatch = plantMasterSheets.find(sheet => 
    sheet.id === normalized ||
    sheet.commonName.toLowerCase().includes(normalized) ||
    sheet.scientificName.toLowerCase().includes(normalized) ||
    sheet.commonName.toLowerCase() === normalized
  );
  
  if (baseMatch) return baseMatch;
  
  // Cerca nelle colture specializzate
  const specializedSheets = getAllSpecializedMasterSheets();
  return specializedSheets.find(sheet => 
    sheet.id === normalized ||
    sheet.commonName.toLowerCase().includes(normalized) ||
    sheet.scientificName.toLowerCase().includes(normalized) ||
    sheet.commonName.toLowerCase() === normalized
  ) || null;
};

/**
 * Trova i tag comportamentali per una varietà
 */
export const getVarietyTags = (varietyName: string): BehavioralTag[] => {
  const normalizedVariety = varietyName.toLowerCase().trim();
  
  const mapping = varietyMappings.find(v => 
    v.varietyName.toLowerCase() === normalizedVariety ||
    v.varietyName.toLowerCase().includes(normalizedVariety) ||
    normalizedVariety.includes(v.varietyName.toLowerCase())
  );
  
  if (!mapping || !mapping.tags || mapping.tags.length === 0) {
    return [];
  }
  
  return behavioralTags.filter(tag => mapping.tags.includes(tag.id));
};

/**
 * Trova la specie da un nome varietà
 */
export const findSpeciesFromVariety = (varietyName: string): { speciesId: string; tags: string[] } | null => {
  const normalizedVariety = varietyName.toLowerCase().trim();
  
  const mapping = varietyMappings.find(v => 
    v.varietyName.toLowerCase() === normalizedVariety ||
    v.varietyName.toLowerCase().includes(normalizedVariety) ||
    normalizedVariety.includes(v.varietyName.toLowerCase())
  );
  
  if (!mapping) return null;
  
  return {
    speciesId: mapping.speciesId,
    tags: mapping.tags || []
  };
};

/**
 * Genera la guida completa combinando scheda master + tag
 * Versione asincrona con supporto archetypeId
 */
export const generateCompleteGuide = async (
  speciesName: string, 
  varietyName?: string
): Promise<{ 
  masterSheet: PlantMasterSheet; 
  tags: BehavioralTag[];
  additionalInstructions: string[];
} | null> => {
  const masterSheet = await getMasterSheet(speciesName);
  if (!masterSheet) return null;
  
  const tags = varietyName ? getVarietyTags(varietyName) : [];
  const additionalInstructions = tags.flatMap(tag => tag.additionalInstructions);
  
  return {
    masterSheet,
    tags,
    additionalInstructions
  };
};

/**
 * Versione sincrona di generateCompleteGuide (per retrocompatibilità)
 */
export const generateCompleteGuideSync = (
  speciesName: string, 
  varietyName?: string
): { 
  masterSheet: PlantMasterSheet; 
  tags: BehavioralTag[];
  additionalInstructions: string[];
} | null => {
  const masterSheet = getMasterSheetSync(speciesName);
  if (!masterSheet) return null;
  
  const tags = varietyName ? getVarietyTags(varietyName) : [];
  const additionalInstructions = tags.flatMap(tag => tag.additionalInstructions);
  
  return {
    masterSheet,
    tags,
    additionalInstructions
  };
};

/**
 * Cerca una varietà e restituisce informazioni complete (specie + tag)
 * Versione asincrona con supporto archetypeId
 */
export const getVarietyInfo = async (varietyName: string): Promise<{
  varietyName: string;
  speciesId: string;
  tags: BehavioralTag[];
  masterSheet: PlantMasterSheet | null;
} | null> => {
  const speciesInfo = findSpeciesFromVariety(varietyName);
  if (!speciesInfo) return null;
  
  const masterSheet = await getMasterSheet(speciesInfo.speciesId);
  const tags = getVarietyTags(varietyName);
  
  return {
    varietyName,
    speciesId: speciesInfo.speciesId,
    tags,
    masterSheet
  };
};

/**
 * Versione sincrona di getVarietyInfo (per retrocompatibilità)
 */
export const getVarietyInfoSync = (varietyName: string): {
  varietyName: string;
  speciesId: string;
  tags: BehavioralTag[];
  masterSheet: PlantMasterSheet | null;
} | null => {
  const speciesInfo = findSpeciesFromVariety(varietyName);
  if (!speciesInfo) return null;
  
  const masterSheet = getMasterSheetSync(speciesInfo.speciesId);
  const tags = getVarietyTags(varietyName);
  
  return {
    varietyName,
    speciesId: speciesInfo.speciesId,
    tags,
    masterSheet
  };
};

/**
 * Ottiene tutti i tag comportamentali disponibili
 */
export const getAllBehavioralTags = (): BehavioralTag[] => {
  return behavioralTags;
};

/**
 * Ottiene tutte le schede master disponibili (include anche colture specializzate)
 */
export const getAllMasterSheets = (): PlantMasterSheet[] => {
  return [
    ...plantMasterSheets,
    ...getAllSpecializedMasterSheets()
  ];
};





