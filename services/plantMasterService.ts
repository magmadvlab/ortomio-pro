import { PlantMasterSheet, VarietyMapping, BehavioralTag } from '../types';
import { plantMasterSheets, behavioralTags } from '../data/plantMasterSheets';
import { varietyMappings } from '../data/varietyMappings';

/**
 * Trova la scheda master per una specie
 */
export const getMasterSheet = (speciesName: string): PlantMasterSheet | null => {
  const normalized = speciesName.toLowerCase().trim();
  
  return plantMasterSheets.find(sheet => 
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
 */
export const generateCompleteGuide = (
  speciesName: string, 
  varietyName?: string
): { 
  masterSheet: PlantMasterSheet; 
  tags: BehavioralTag[];
  additionalInstructions: string[];
} | null => {
  const masterSheet = getMasterSheet(speciesName);
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
 */
export const getVarietyInfo = (varietyName: string): {
  varietyName: string;
  speciesId: string;
  tags: BehavioralTag[];
  masterSheet: PlantMasterSheet | null;
} | null => {
  const speciesInfo = findSpeciesFromVariety(varietyName);
  if (!speciesInfo) return null;
  
  const masterSheet = getMasterSheet(speciesInfo.speciesId);
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
 * Ottiene tutte le schede master disponibili
 */
export const getAllMasterSheets = (): PlantMasterSheet[] => {
  return plantMasterSheets;
};




