/**
 * Servizio per gestione archetipi
 * Fornisce accesso ai dati degli archetipi e profili default
 */

import { CropArchetype, CropProfile, ArchetypeId } from '../types/archetypes';
import { archetypes, getArchetypeById as getArchetypeByIdData, getMainArchetypes, getSubArchetypes, hasSubArchetypes } from '../data/archetypes';
import { archetypeProfiles, getProfileByArchetypeId } from '../data/archetypeProfiles';

/**
 * Ottiene archetipo per ID
 */
export const getArchetypeById = (id: ArchetypeId): CropArchetype | null => {
  const archetype = getArchetypeByIdData(id);
  return archetype || null;
};

/**
 * Ottiene profilo default per un archetipo
 */
export const getDefaultProfile = (archetypeId: ArchetypeId): CropProfile | null => {
  const profile = getProfileByArchetypeId(archetypeId);
  return profile || null;
};

/**
 * Ottiene tutti gli archetipi principali (A1-A12)
 * Per mostrare nella griglia principale
 */
export const getAllArchetypes = (): CropArchetype[] => {
  return getMainArchetypes();
};

/**
 * Ottiene sub-archetipi per un archetipo padre
 * Es: A12 → [L1, L2, L3]
 * Es: L3 → [L3_CITRUS, L3_STONE, L3_POME, L3_EXOTIC]
 */
export const getSubArchetypesForParent = (parentId: ArchetypeId): CropArchetype[] => {
  return getSubArchetypes(parentId);
};

/**
 * Verifica se un archetipo ha sub-griglie
 */
export const archetypeHasSubArchetypes = (id: ArchetypeId): boolean => {
  return hasSubArchetypes(id);
};

/**
 * Ottiene tutti gli archetipi (principali + sub)
 * Utile per ricerca completa
 */
export const getAllArchetypesIncludingSubs = (): CropArchetype[] => {
  return archetypes;
};

/**
 * Cerca archetipi per nome o esempio
 * Utile per suggerimenti quando utente digita nome
 */
export const searchArchetypesByExample = (query: string): CropArchetype[] => {
  const normalizedQuery = query.toLowerCase().trim();
  if (normalizedQuery.length < 2) return [];
  
  return archetypes.filter(archetype => {
    // Cerca nel label
    if (archetype.label.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // Cerca negli esempi
    if (archetype.examples?.some(example => example.toLowerCase().includes(normalizedQuery))) {
      return true;
    }
    
    return false;
  });
};

