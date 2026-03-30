/**
 * Individual Plant Service
 * Servizio per gestire piante individuali con calcoli automatici
 */

import { 
  GardenPlant, 
  PlantOperation, 
  PlantHarvest, 
  FieldConfiguration,
  BulkRowOperation,
  BulkOperationResult,
  FieldWizardConfig,
  PlantCalculations
} from '../types/individualPlant';
import { getMarketPrice } from '../data/marketPrices';

/**
 * CALCOLI AUTOMATICI
 */
export const plantCalculations: PlantCalculations = {
  // Calcola numero massimo piante in un filare
  maxPlantsInRow: (lengthMeters: number, spacingCm: number): number => {
    return Math.floor((lengthMeters * 100) / spacingCm) + 1;
  },

  // Calcola lunghezza minima filare per N piante
  minRowLength: (plantsCount: number, spacingCm: number): number => {
    return ((plantsCount - 1) * spacingCm) / 100;
  },

  // Calcola area totale campo
  totalArea: (rowCount: number, rowLength: number, rowSpacing: number): number => {
    return rowLength * ((rowCount - 1) * (rowSpacing / 100) + 0.5); // +0.5m per bordi
  },

  // Calcola piante per metro quadro
  plantsPerSqMeter: (plantSpacing: number, rowSpacing: number): number => {
    const plantsPerMeterRow = 100 / plantSpacing;
    const rowsPerMeter = 100 / rowSpacing;
    return plantsPerMeterRow * rowsPerMeter;
  }
};

/**
 * GENERAZIONE CODICI PIANTA
 */
export const generatePlantCode = (
  rowNumber: number,
  position: number,
  rowType: 'garden' | 'field' = 'field'
): string => {
  const prefix = rowType === 'garden' ? 'B' : 'F'; // Bed o Field
  return `${prefix}${rowNumber}-P${position.toString().padStart(3, '0')}`;
};

/**
 * CONFIGURAZIONE CAMPO AUTOMATICA
 */
export const calculateFieldConfiguration = (
  config: Partial<FieldWizardConfig>
): FieldConfiguration => {
  const {
    rowCount = 10,
    rowLengthMeters = 40,
    plantSpacingCm = 40,
    rowSpacingCm = 150,
    plantName = 'Pomodoro',
    variety,
    zoneName = 'Campo Principale'
  } = config;

  const plantsPerRow = plantCalculations.maxPlantsInRow(rowLengthMeters, plantSpacingCm);
  const totalPlants = plantsPerRow * rowCount;
  const totalAreaSqm = plantCalculations.totalArea(rowCount, rowLengthMeters, rowSpacingCm);
  const plantsPerSqMeter = plantCalculations.plantsPerSqMeter(plantSpacingCm, rowSpacingCm);

  return {
    gardenId: '', // Sarà impostato dal chiamante
    zoneName,
    rowCount,
    rowLengthMeters,
    plantSpacingCm,
    rowSpacingCm,
    totalPlants,
    plantsPerRow,
    totalAreaSqm: Math.round(totalAreaSqm),
    plantsPerSqMeter: Math.round(plantsPerSqMeter * 100) / 100,
    plantName,
    variety,
    plantingDate: new Date().toISOString().split('T')[0]
  };
};

/**
 * VALIDAZIONE CONFIGURAZIONE
 */
export const validateFieldConfiguration = (config: FieldWizardConfig): string[] => {
  const errors: string[] = [];

  if (config.rowCount < 1 || config.rowCount > 50) {
    errors.push('Numero filari deve essere tra 1 e 50');
  }

  if (config.rowLengthMeters < 1 || config.rowLengthMeters > 200) {
    errors.push('Lunghezza filare deve essere tra 1 e 200 metri');
  }

  if (config.plantSpacingCm < 10 || config.plantSpacingCm > 200) {
    errors.push('Distanza tra piante deve essere tra 10 e 200 cm');
  }

  if (config.rowSpacingCm < 30 || config.rowSpacingCm > 500) {
    errors.push('Distanza tra filari deve essere tra 30 e 500 cm');
  }

  if (!config.plantName || config.plantName.trim().length < 2) {
    errors.push('Nome pianta è obbligatorio (minimo 2 caratteri)');
  }

  if (!config.zoneName || config.zoneName.trim().length < 2) {
    errors.push('Nome zona è obbligatorio (minimo 2 caratteri)');
  }

  // Verifica date
  const plantingDate = new Date(config.plantingDate);
  const today = new Date();
  const maxFutureDate = new Date();
  maxFutureDate.setFullYear(today.getFullYear() + 1);

  if (plantingDate > maxFutureDate) {
    errors.push('Data piantagione non può essere oltre 1 anno nel futuro');
  }

  // Calcola se la configurazione è ragionevole
  const totalPlants = plantCalculations.maxPlantsInRow(config.rowLengthMeters, config.plantSpacingCm) * config.rowCount;
  if (totalPlants > 10000) {
    errors.push(`Configurazione genera ${totalPlants} piante. Massimo consigliato: 10.000`);
  }

  const totalArea = plantCalculations.totalArea(config.rowCount, config.rowLengthMeters, config.rowSpacingCm);
  if (totalArea > 10000) { // 1 ettaro
    errors.push(`Area totale ${Math.round(totalArea)} m². Massimo consigliato: 10.000 m²`);
  }

  return errors;
};

/**
 * OPERAZIONI DI MASSA
 */
export const createBulkOperation = (
  plants: GardenPlant[],
  operation: BulkRowOperation
): PlantOperation[] => {
  return plants
    .filter(plant => {
      // Filtra per stato se specificato
      if (operation.plantStatus && plant.status !== operation.plantStatus) {
        return false;
      }
      
      // Filtra per IDs specifici se specificati
      if (operation.plantIds && !operation.plantIds.includes(plant.id)) {
        return false;
      }
      
      return true;
    })
    .map(plant => ({
      id: crypto.randomUUID(),
      plantId: plant.id,
      gardenId: plant.gardenId,
      operationType: operation.operationType,
      operationCategory: getOperationCategory(operation.operationType),
      date: operation.operationDate,
      operationDate: operation.operationDate,
      quantity: operation.quantityPerPlant,
      unit: operation.unit,
      productName: operation.productName,
      notes: operation.notes,
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
};

/**
 * HELPER FUNCTIONS
 */
const getOperationCategory = (
  operationType: PlantOperation['operationType']
): PlantOperation['operationCategory'] => {
  const categoryMap: Record<string, PlantOperation['operationCategory']> = {
    'watering': 'irrigation',
    'fertilizing': 'nutrition',
    'treatment': 'protection',
    'pruning': 'maintenance',
    'harvest': 'maintenance',
    'transplanting': 'maintenance',
    'thinning': 'maintenance',
    'staking': 'maintenance',
    'mulching': 'maintenance'
  };
  
  return categoryMap[operationType] || 'maintenance';
};

/**
 * CALCOLO FABBISOGNI
 */
export const calculateResourceNeeds = (
  config: FieldConfiguration,
  operationType: 'watering' | 'fertilizing' | 'treatment'
): {
  totalQuantity: number;
  quantityPerPlant: number;
  unit: string;
  estimatedCost?: number;
} => {
  const { totalPlants } = config;
  
  switch (operationType) {
    case 'watering':
      // 2-5 litri per pianta a seconda della stagione
      const litersPerPlant = config.plantName.toLowerCase().includes('pomodoro') ? 3 : 2;
      return {
        totalQuantity: totalPlants * litersPerPlant,
        quantityPerPlant: litersPerPlant,
        unit: 'L',
        estimatedCost: totalPlants * litersPerPlant * 0.001 // €0.001 per litro
      };
      
    case 'fertilizing':
      // 20-50g per pianta
      const gramsPerPlant = config.plantName.toLowerCase().includes('pomodoro') ? 30 : 25;
      return {
        totalQuantity: totalPlants * gramsPerPlant,
        quantityPerPlant: gramsPerPlant,
        unit: 'g',
        estimatedCost: (totalPlants * gramsPerPlant / 1000) * 2.5 // €2.5 per kg
      };
      
    case 'treatment':
      // 5-15ml per pianta
      const mlPerPlant = 10;
      return {
        totalQuantity: totalPlants * mlPerPlant,
        quantityPerPlant: mlPerPlant,
        unit: 'ml',
        estimatedCost: (totalPlants * mlPerPlant / 1000) * 15 // €15 per litro
      };
      
    default:
      return {
        totalQuantity: 0,
        quantityPerPlant: 0,
        unit: 'unit'
      };
  }
};

/**
 * ANALISI PERFORMANCE CAMPO
 */
export interface FieldPerformanceAnalysis {
  totalPlants: number;
  healthyPercentage: number;
  avgHealthScore: number;
  totalProduction: number;
  productionPerPlant: number;
  productionPerSqMeter: number;
  estimatedValue: number;
  
  // Problemi identificati
  issues: {
    type: 'health' | 'production' | 'spacing' | 'irrigation';
    severity: 'low' | 'medium' | 'high';
    description: string;
    affectedPlants: number;
    recommendation: string;
  }[];
  
  // Raccomandazioni
  recommendations: string[];
}

export const analyzeFieldPerformance = (
  plants: GardenPlant[],
  harvests: PlantHarvest[],
  config: FieldConfiguration
): FieldPerformanceAnalysis => {
  const totalPlants = plants.length;
  const healthyPlants = plants.filter(p => p.status === 'healthy').length;
  const healthyPercentage = (healthyPlants / totalPlants) * 100;
  const avgHealthScore = plants.reduce((sum, p) => sum + p.healthScore, 0) / totalPlants;
  
  const totalProduction = harvests.reduce((sum, h) => sum + h.quantityKg, 0);
  const productionPerPlant = totalProduction / totalPlants;
  const productionPerSqMeter = totalProduction / config.totalAreaSqm;

  const averageHarvestQualityScore = harvests.length > 0
    ? harvests.reduce((sum, harvest) => sum + (harvest.qualityScore || 70), 0) / harvests.length
    : avgHealthScore;
  const seasonalWindow = (() => {
    const currentMonth = new Date().getMonth();
    return currentMonth >= 5 && currentMonth <= 8 ? 'Summer' : 'Winter';
  })();
  const basePricePerKg = getMarketPrice(config.plantName.toUpperCase(), seasonalWindow);
  const operationalAdjustment = Math.min(
    1.25,
    Math.max(
      0.8,
      0.92 + ((averageHarvestQualityScore - 70) / 100) + ((healthyPercentage - 80) / 200)
    )
  );
  const pricePerKg = Number((basePricePerKg * operationalAdjustment).toFixed(2));
  const estimatedValue = totalProduction * pricePerKg;
  
  // Identifica problemi
  const issues: FieldPerformanceAnalysis['issues'] = [];
  
  if (healthyPercentage < 80) {
    issues.push({
      type: 'health',
      severity: healthyPercentage < 60 ? 'high' : 'medium',
      description: `Solo ${Math.round(healthyPercentage)}% delle piante è sano`,
      affectedPlants: totalPlants - healthyPlants,
      recommendation: 'Verificare irrigazione, nutrizione e presenza di malattie'
    });
  }
  
  if (avgHealthScore < 70) {
    issues.push({
      type: 'health',
      severity: avgHealthScore < 50 ? 'high' : 'medium',
      description: `Punteggio salute medio basso: ${Math.round(avgHealthScore)}/100`,
      affectedPlants: plants.filter(p => p.healthScore < 70).length,
      recommendation: 'Aumentare frequenza controlli e trattamenti preventivi'
    });
  }
  
  // Raccomandazioni generali
  const recommendations: string[] = [];
  
  if (productionPerPlant < 2) {
    recommendations.push('Produzione sotto media. Verificare nutrizione e irrigazione');
  }

  if (operationalAdjustment < 0.95) {
    recommendations.push('Valore commerciale sotto benchmark stagionale. Migliorare uniformità, qualità e stato sanitario del lotto');
  } else if (operationalAdjustment > 1.08) {
    recommendations.push('Valore commerciale sopra benchmark stagionale. Consolidare questo lotto come riferimento operativo');
  }
  
  if (healthyPercentage > 90 && avgHealthScore > 80) {
    recommendations.push('Ottima gestione del campo! Mantenere le pratiche attuali');
  }
  
  return {
    totalPlants,
    healthyPercentage: Math.round(healthyPercentage * 100) / 100,
    avgHealthScore: Math.round(avgHealthScore * 100) / 100,
    totalProduction: Math.round(totalProduction * 100) / 100,
    productionPerPlant: Math.round(productionPerPlant * 100) / 100,
    productionPerSqMeter: Math.round(productionPerSqMeter * 100) / 100,
    estimatedValue: Math.round(estimatedValue * 100) / 100,
    issues,
    recommendations
  };
};

/**
 * EXPORT PRINCIPALE
 */
export default {
  plantCalculations,
  generatePlantCode,
  calculateFieldConfiguration,
  validateFieldConfiguration,
  createBulkOperation,
  calculateResourceNeeds,
  analyzeFieldPerformance
};
