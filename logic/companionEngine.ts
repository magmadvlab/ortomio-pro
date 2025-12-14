/**
 * Companion Engine
 * Gestisce consociazioni, rotazioni e allelopatia
 */

import { companionRelationships, allelopathyInfo, botanicalFamilies } from '../data/companionPlants';

export interface CompanionCheck {
  compatible: boolean;
  relationship?: 'beneficial' | 'harmful' | 'neutral';
  reason?: string;
  distance?: number;
}

/**
 * Verifica relazione companion tra due piante
 */
export function checkCompanionship(plant1: string, plant2: string): CompanionCheck {
  const relationship = companionRelationships.find(
    (r) =>
      (r.plant1.toLowerCase() === plant1.toLowerCase() &&
        r.plant2.toLowerCase() === plant2.toLowerCase()) ||
      (r.plant1.toLowerCase() === plant2.toLowerCase() &&
        r.plant2.toLowerCase() === plant1.toLowerCase())
  );

  if (relationship) {
    return {
      compatible: relationship.relationship !== 'harmful',
      relationship: relationship.relationship,
      reason: relationship.reason,
      distance: relationship.distance,
    };
  }

  return { compatible: true, relationship: 'neutral' };
}

/**
 * Suggerisce compagni benefici per una pianta
 */
export function suggestCompanions(plant: string): Array<{ plant: string; reason: string; distance: number }> {
  return companionRelationships
    .filter((r) => r.plant1.toLowerCase() === plant.toLowerCase() && r.relationship === 'beneficial')
    .map((r) => ({
      plant: r.plant2,
      reason: r.reason,
      distance: r.distance || 30,
    }));
}

/**
 * Trova vicini dannosi
 */
export function findHarmfulNeighbors(
  plant: string,
  currentPlantings: Array<{ plant: string; position: { x: number; y: number } }>
): Array<{ plant: string; reason: string }> {
  const harmful: Array<{ plant: string; reason: string }> = [];

  for (const neighbor of currentPlantings) {
    const check = checkCompanionship(plant, neighbor.plant);
    if (!check.compatible && check.relationship === 'harmful') {
      harmful.push({
        plant: neighbor.plant,
        reason: check.reason || 'Incompatibilità',
      });
    }
  }

  return harmful;
}

/**
 * Verifica rotazione compatibile
 */
export function calculateRotationCompatibility(
  previousPlant: string,
  nextPlant: string
): { compatible: boolean; reason: string } {
  // Stessa famiglia botanica: non compatibile
  for (const [family, plants] of Object.entries(botanicalFamilies)) {
    if (
      plants.some((p) => p.toLowerCase() === previousPlant.toLowerCase()) &&
      plants.some((p) => p.toLowerCase() === nextPlant.toLowerCase())
    ) {
      return {
        compatible: false,
        reason: `Entrambe ${family}. Rotazione non consigliata.`,
      };
    }
  }

  return { compatible: true, reason: 'Rotazione compatibile' };
}

/**
 * Calcola anni di riposo necessari per famiglia
 */
export function getFamilyRestPeriod(
  family: string,
  history: Array<{ plant: string; year: number }>
): number {
  const familyPlants = botanicalFamilies[family] || [];
  const lastYear = Math.max(...history.map((h) => h.year), 0);
  const currentYear = new Date().getFullYear();

  // Conta quante volte famiglia è stata coltivata negli ultimi 4 anni
  const recentCount = history.filter(
    (h) =>
      familyPlants.some((p) => p.toLowerCase() === h.plant.toLowerCase()) &&
      h.year >= currentYear - 4
  ).length;

  if (recentCount >= 3) {
    return 2; // Riposo di 2 anni se coltivata 3+ volte
  }

  return 1; // Altrimenti 1 anno
}
