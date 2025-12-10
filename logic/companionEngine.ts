/**
 * Companion Planting Engine
 * Checks for good/bad companions and suggests beneficial pairings
 */

import { CompanionAdvice, CompanionRule } from '../types';
import { PlantMasterSheet } from '../types';
import { getCompanionRule } from '../data/companionDatabase';

/**
 * Calculate distance between two positions (in cm)
 */
const calculateDistance = (
  pos1: { x: number; y: number },
  pos2: { x: number; y: number }
): number => {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Check companion compatibility
 */
export const suggestCompanions = (
  selectedPlant: PlantMasterSheet,
  nearbyPlants: Array<{ plant: PlantMasterSheet; position: { x: number; y: number } }>
): CompanionAdvice => {
  const rule = getCompanionRule(selectedPlant.id);
  
  if (!rule) {
    return {
      severity: 'INFO',
      message: 'Nessuna regola di consociazione disponibile per questa pianta.',
    };
  }

  const conflicts: Array<{ plantName: string; reason: string }> = [];
  const suggestions: Array<{ plantName: string; benefit: string }> = [];

  // Check for bad companions nearby
  for (const nearby of nearbyPlants) {
    const distance = calculateDistance(
      nearby.position,
      { x: 0, y: 0 } // Assuming selected plant is at origin for now
    );
    
    const minDistance = rule.distanceMin || 200;
    
    if (distance < minDistance) {
      // Check if it's a bad companion
      if (rule.badCompanions.includes(nearby.plant.id)) {
        conflicts.push({
          plantName: nearby.plant.commonName,
          reason: rule.reason || 'Incompatibilità nota',
        });
      }
    }
  }

  // Check for missing good companions
  const nearbyPlantIds = nearbyPlants.map(p => p.plant.id);
  const missingGoodCompanions = rule.goodCompanions.filter(
    id => !nearbyPlantIds.includes(id)
  );

  if (missingGoodCompanions.length > 0) {
    suggestions.push({
      plantName: missingGoodCompanions[0], // Suggest first missing
      benefit: rule.benefit || 'Beneficio reciproco',
    });
  }

  // Return advice
  if (conflicts.length > 0) {
    return {
      severity: 'ERROR',
      message: `${conflicts[0].plantName} troppo vicino a ${selectedPlant.commonName}. ${conflicts[0].reason}. Distanza minima: ${rule.distanceMin || 200}cm.`,
      conflicts,
    };
  }

  if (suggestions.length > 0) {
    return {
      severity: 'INFO',
      message: `Suggerimento: Pianta ${suggestions[0].plantName} vicino a ${selectedPlant.commonName}. ${suggestions[0].benefit}`,
      suggestions,
    };
  }

  return {
    severity: 'SUCCESS',
    message: 'Consociazioni OK - nessun conflitto rilevato.',
  };
};

/**
 * Check if two plants are compatible
 */
export const areCompatible = (
  plant1: PlantMasterSheet,
  plant2: PlantMasterSheet,
  distance: number
): { compatible: boolean; reason?: string } => {
  const rule1 = getCompanionRule(plant1.id);
  const rule2 = getCompanionRule(plant2.id);

  // Check if plant2 is bad companion for plant1
  if (rule1 && rule1.badCompanions.includes(plant2.id)) {
    const minDistance = rule1.distanceMin || 200;
    if (distance < minDistance) {
      return {
        compatible: false,
        reason: rule1.reason || `${plant2.commonName} inibisce ${plant1.commonName}`,
      };
    }
  }

  // Check if plant1 is bad companion for plant2
  if (rule2 && rule2.badCompanions.includes(plant1.id)) {
    const minDistance = rule2.distanceMin || 200;
    if (distance < minDistance) {
      return {
        compatible: false,
        reason: rule2.reason || `${plant1.commonName} inibisce ${plant2.commonName}`,
      };
    }
  }

  return { compatible: true };
};

