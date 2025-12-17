/**
 * Calcolatore profondità radici (root zone depth)
 * 
 * Logica di calcolo:
 * 1. Se task.rootZoneDepthCm presente → usa override
 * 2. Se vaso/contenitore → limita a profondità contenitore
 * 3. Altrimenti → usa default archetipo
 */

import { GardenTask, GrowingLocation } from '../types';
import { getDefaultProfile } from '../services/archetypeService';
import { ArchetypeId } from '../types/archetypes';

/**
 * Calcola profondità radici per un task
 * 
 * @param task - Task del giardino
 * @param containerDepthCm - Profondità contenitore in cm (se vaso/contenitore)
 * @returns Profondità radici in cm
 */
export const calculateRootDepth = (
  task: GardenTask,
  containerDepthCm?: number
): number => {
  // 1. Se override presente → usa quello
  if (task.rootZoneDepthCm && task.rootZoneDepthCm > 0) {
    return task.rootZoneDepthCm;
  }
  
  // 2. Se vaso/contenitore piccolo → limita a profondità contenitore
  if (containerDepthCm && containerDepthCm > 0) {
    const locationType = task.locationType;
    
    // Verifica se è un contenitore
    const isContainer = 
      locationType === 'Pot' ||
      locationType === 'RaisedBed' ||
      locationType === 'HydroponicNFT' ||
      locationType === 'HydroponicDWC' ||
      locationType === 'HydroponicEbbFlow' ||
      locationType === 'HydroponicDrip' ||
      locationType === 'HydroponicWick' ||
      locationType === 'HydroponicKratky' ||
      locationType === 'Aquaponic' ||
      locationType === 'Aeroponic' ||
      locationType === 'Indoor';
    
    if (isContainer) {
      // Per contenitori, limita a profondità contenitore (con margine di sicurezza)
      return Math.min(containerDepthCm * 0.9, containerDepthCm); // 90% per sicurezza
    }
  }
  
  // 3. Usa default archetipo se presente
  if (task.archetypeId) {
    const profile = getDefaultProfile(task.archetypeId);
    if (profile && profile.rootZoneDepthCmDefault > 0) {
      return profile.rootZoneDepthCmDefault;
    }
  }
  
  // 4. Fallback: valore default generico (30 cm)
  return 30;
};

/**
 * Calcola profondità radici per un archetipo
 * Utile quando non si ha ancora un task ma solo l'archetipo
 * 
 * @param archetypeId - ID archetipo
 * @param containerDepthCm - Profondità contenitore in cm (opzionale)
 * @returns Profondità radici in cm
 */
export const calculateRootDepthForArchetype = (
  archetypeId: ArchetypeId,
  containerDepthCm?: number
): number => {
  // Se contenitore piccolo → limita
  if (containerDepthCm && containerDepthCm > 0) {
    return Math.min(containerDepthCm * 0.9, containerDepthCm);
  }
  
  // Usa default archetipo
  const profile = getDefaultProfile(archetypeId);
  if (profile && profile.rootZoneDepthCmDefault > 0) {
    return profile.rootZoneDepthCmDefault;
  }
  
  // Fallback
  return 30;
};

/**
 * Estrae profondità contenitore da irrigationSetup o locationType
 * Utile per determinare se c'è un limite fisico
 */
export const extractContainerDepth = (
  task: GardenTask,
  gardenBed?: { depth?: number; height?: number }
): number | undefined => {
  // Da irrigationSetup se presente
  if (task.irrigationSetup?.areaSqm) {
    // Stima da area (assumendo contenitore quadrato/circolare)
    // Per ora non abbiamo info precisa, quindi ritorna undefined
  }
  
  // Da gardenBed se presente
  if (gardenBed) {
    if (gardenBed.depth) return gardenBed.depth;
    if (gardenBed.height) return gardenBed.height;
  }
  
  // Da locationType possiamo inferire profondità tipiche
  const locationType = task.locationType;
  if (locationType === 'Pot') {
    // Vasi tipici: 15-40 cm
    return 25; // Media
  }
  if (locationType === 'RaisedBed') {
    // Letti rialzati tipici: 20-50 cm
    return 35; // Media
  }
  
  return undefined;
};

