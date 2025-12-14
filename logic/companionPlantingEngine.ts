import { PlantMasterSheet, GardenTask, CompanionRule } from '../types';
import { findCompanionRule, findBeneficialCompanions, findHarmfulCompanions } from '../data/companionPlanting';

export interface CompanionCompatibility {
  compatible: boolean;
  reason: string;
  spacingAdjustment?: number; // cm da aggiungere o sottrarre
  relationship?: 'Beneficial' | 'Neutral' | 'Harmful';
}

/**
 * Verifica la compatibilità tra due piante
 */
export const checkCompanionCompatibility = (
  plant1: PlantMasterSheet,
  plant2: PlantMasterSheet
): CompanionCompatibility => {
  // Cerca regola specifica
  const rule = findCompanionRule(plant1.commonName, plant2.commonName);
  
  if (rule) {
    return {
      compatible: rule.relationship !== 'Harmful',
      reason: rule.reason || '',
      spacingAdjustment: rule.spacingModifier,
      relationship: rule.relationship
    };
  }
  
  // Se non c'è regola specifica, verifica per famiglia
  if (plant1.family === plant2.family) {
    // Stessa famiglia: spesso problematico per rotazione, ma non sempre
    // Alcune eccezioni: alcune famiglie possono stare insieme se ben distanziate
    const sameFamilyExceptions = [
      { f1: 'Asteraceae', f2: 'Asteraceae' }, // Lattughe diverse possono stare insieme
    ];
    
    const isException = sameFamilyExceptions.some(
      ex => (ex.f1 === plant1.family && ex.f2 === plant2.family) ||
            (ex.f1 === plant2.family && ex.f2 === plant1.family)
    );
    
    if (!isException) {
      return {
        compatible: false,
        reason: `Entrambe appartengono alla famiglia ${plant1.family}. Per evitare malattie comuni e rispettare la rotazione, è meglio piantarle in zone separate o distanziate.`,
        spacingAdjustment: 30, // Aumenta distanza
        relationship: 'Harmful'
      };
    }
  }
  
  // Default: neutrale (non si conosce interazione specifica)
  return {
    compatible: true,
    reason: 'Nessuna interazione nota. Possono essere consociate con le distanze standard.',
    relationship: 'Neutral'
  };
};

/**
 * Suggerisce piante consociate per una data pianta
 */
export const suggestCompanions = (
  targetPlant: PlantMasterSheet,
  allPlants: PlantMasterSheet[]
): Array<{ plant: PlantMasterSheet; rule: CompanionRule }> => {
  const beneficialRules = findBeneficialCompanions(targetPlant.commonName);
  
  // Mappa le regole alle piante disponibili
  const suggestions: Array<{ plant: PlantMasterSheet; rule: CompanionRule }> = [];
  
  for (const rule of beneficialRules) {
    if (!rule.plant1 || !rule.plant2) continue;
    const companionName = 
      rule.plant1.toUpperCase() === targetPlant.commonName.toUpperCase()
        ? rule.plant2
        : rule.plant1;
    
    const companionPlant = allPlants.find(
      p => p.commonName.toUpperCase() === companionName.toUpperCase()
    );
    
    if (companionPlant) {
      suggestions.push({ plant: companionPlant, rule });
    }
  }
  
  // Ordina per beneficio (spacingModifier negativo = più vicini = meglio)
  suggestions.sort((a, b) => {
    const modA = a.rule.spacingModifier || 0;
    const modB = b.rule.spacingModifier || 0;
    return modA - modB; // Negativo prima (più vicini)
  });
  
  return suggestions.slice(0, 5); // Top 5
};

/**
 * Genera avvisi per consociazioni problematiche
 */
export const getCompanionWarnings = (
  task1: GardenTask,
  task2: GardenTask,
  masterData1: PlantMasterSheet,
  masterData2: PlantMasterSheet
): { hasWarning: boolean; message?: string; severity?: 'Critical' | 'Warning' } => {
  const compatibility = checkCompanionCompatibility(masterData1, masterData2);
  
  if (!compatibility.compatible) {
    return {
      hasWarning: true,
      message: `⚠️ ${task1.plantName} e ${task2.plantName} non dovrebbero essere vicine: ${compatibility.reason}`,
      severity: 'Critical'
    };
  }
  
  if (compatibility.relationship === 'Beneficial' && compatibility.spacingAdjustment && compatibility.spacingAdjustment < 0) {
    return {
      hasWarning: false,
      message: `✅ ${task1.plantName} e ${task2.plantName} sono ottime consociate! ${compatibility.reason}`,
      severity: undefined
    };
  }
  
  return { hasWarning: false };
};

/**
 * Verifica se due piante appartengono alla stessa famiglia
 */
export const areSameFamily = (
  plant1: PlantMasterSheet,
  plant2: PlantMasterSheet
): boolean => {
  return plant1.family === plant2.family;
};

