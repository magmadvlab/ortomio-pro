import { PlantSpecies, PlantVariety } from '../types';
import { plantDatabase } from '../data/plantVarieties';

/**
 * Cerca una specie per nome comune o scientifico (case-insensitive)
 */
export const findSpecies = (query: string): PlantSpecies | null => {
  const normalizedQuery = query.toLowerCase().trim();
  
  return plantDatabase.find(species => 
    species.commonName.toLowerCase().includes(normalizedQuery) ||
    species.scientificName.toLowerCase().includes(normalizedQuery) ||
    species.id.toLowerCase().includes(normalizedQuery)
  ) || null;
};

/**
 * Cerca varietà per nome (anche nei sinonimi)
 */
export const findVariety = (varietyName: string, speciesName?: string): PlantVariety | null => {
  const normalizedVariety = varietyName.toLowerCase().trim();
  
  for (const species of plantDatabase) {
    // Se è specificata la specie, cerca solo lì
    if (speciesName && 
        !species.commonName.toLowerCase().includes(speciesName.toLowerCase()) &&
        !species.id.toLowerCase().includes(speciesName.toLowerCase())) {
      continue;
    }
    
    const variety = species.varieties.find(v => 
      v.name.toLowerCase() === normalizedVariety ||
      v.name.toLowerCase().includes(normalizedVariety) ||
      v.synonyms?.some(s => s.toLowerCase().includes(normalizedVariety))
    );
    
    if (variety) return variety;
  }
  
  return null;
};

/**
 * Ottiene tutte le varietà di una specie
 */
export const getVarietiesBySpecies = (speciesName: string): PlantVariety[] => {
  const species = findSpecies(speciesName);
  return species?.varieties || [];
};

/**
 * Cerca tutte le specie che corrispondono a una query
 */
export const searchSpecies = (query: string): PlantSpecies[] => {
  const normalizedQuery = query.toLowerCase().trim();
  
  return plantDatabase.filter(species =>
    species.commonName.toLowerCase().includes(normalizedQuery) ||
    species.scientificName.toLowerCase().includes(normalizedQuery) ||
    species.id.toLowerCase().includes(normalizedQuery) ||
    species.varieties.some(v => 
      v.name.toLowerCase().includes(normalizedQuery) ||
      v.synonyms?.some(s => s.toLowerCase().includes(normalizedQuery))
    )
  );
};

/**
 * Cerca varietà che corrispondono a una query (in tutte le specie)
 */
export const searchVarieties = (query: string, speciesFilter?: string): PlantVariety[] => {
  const normalizedQuery = query.toLowerCase().trim();
  const results: PlantVariety[] = [];
  
  for (const species of plantDatabase) {
    // Filtra per specie se specificato
    if (speciesFilter && 
        !species.commonName.toLowerCase().includes(speciesFilter.toLowerCase()) &&
        !species.id.toLowerCase().includes(speciesFilter.toLowerCase())) {
      continue;
    }
    
    const matchingVarieties = species.varieties.filter(v =>
      v.name.toLowerCase().includes(normalizedQuery) ||
      v.synonyms?.some(s => s.toLowerCase().includes(normalizedQuery))
    );
    
    results.push(...matchingVarieties);
  }
  
  return results;
};

/**
 * Ottiene tutte le specie nel database
 */
export const getAllSpecies = (): PlantSpecies[] => {
  return plantDatabase;
};

/**
 * Ottiene tutte le varietà nel database
 */
export const getAllVarieties = (): PlantVariety[] => {
  return plantDatabase.flatMap(species => species.varieties);
};

/**
 * Verifica se una varietà esiste nel database
 */
export const varietyExists = (varietyName: string, speciesName?: string): boolean => {
  return findVariety(varietyName, speciesName) !== null;
};

/**
 * Ottiene informazioni complete su una varietà (inclusa la specie)
 */
export const getVarietyInfo = (varietyName: string, speciesName?: string): { variety: PlantVariety; species: PlantSpecies } | null => {
  const variety = findVariety(varietyName, speciesName);
  if (!variety) return null;
  
  const species = plantDatabase.find(s => s.id === variety.speciesId);
  if (!species) return null;
  
  return { variety, species };
};

/**
 * Suggerisce varietà basate su una query parziale (per autocompletamento)
 */
export const suggestVarieties = (query: string, limit: number = 10): Array<{ variety: PlantVariety; species: PlantSpecies }> => {
  const normalizedQuery = query.toLowerCase().trim();
  if (normalizedQuery.length < 2) return [];
  
  const suggestions: Array<{ variety: PlantVariety; species: PlantSpecies }> = [];
  
  for (const species of plantDatabase) {
    for (const variety of species.varieties) {
      const nameMatch = variety.name.toLowerCase().includes(normalizedQuery);
      const synonymMatch = variety.synonyms?.some(s => s.toLowerCase().includes(normalizedQuery));
      
      if (nameMatch || synonymMatch) {
        suggestions.push({ variety, species });
        if (suggestions.length >= limit) break;
      }
    }
    if (suggestions.length >= limit) break;
  }
  
  // Ordina per rilevanza (match esatto prima, poi parziale)
  return suggestions.sort((a, b) => {
    const aExact = a.variety.name.toLowerCase() === normalizedQuery;
    const bExact = b.variety.name.toLowerCase() === normalizedQuery;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return a.variety.name.localeCompare(b.variety.name);
  });
};



