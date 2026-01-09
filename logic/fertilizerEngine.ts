/**
 * Fertilizer Engine
 * Converte fabbisogni nutrizionali (da Nutrient Engine) in prodotti concreti con dosaggi specifici
 */

import { PlantMasterSheet, Garden } from '../types';
import { NutrientAdvice } from './nutrientEngine';
import {
  FertilizerProduct,
  allFertilizers,
  getFertilizerById,
  getFertilizersByType,
} from '../data/fertilizers';

export interface FertilizerRecommendation {
  product: FertilizerProduct;
  dosage: { amount: number; unit: string; perSqm: boolean };
  timing: Date;
  method: 'incorporated' | 'surface' | 'fertigation' | 'foliar';
  reason: string;
  warnings?: string[];
  estimatedCost?: number;
  totalQuantityNeeded?: number; // Quantità totale per area
}

export interface FertilizerPlan {
  plantName: string;
  recommendations: FertilizerRecommendation[];
  totalEstimatedCost: number;
  applicationSchedule: Array<{ date: Date; products: FertilizerProduct[] }>;
}

/**
 * Calcola dosaggio specifico prodotto per pianta
 */
export function calculateFertilizerDosage(
  plant: PlantMasterSheet,
  nutrientNeeds: NutrientAdvice,
  soilType: Garden['soilType'],
  fertilizer: FertilizerProduct,
  areaSqm: number = 1
): FertilizerRecommendation | null {
  // Verifica compatibilità prodotto con tipo terreno
  if (fertilizer.suitableSoilTypes && !fertilizer.suitableSoilTypes.includes(soilType || 'Loamy')) {
    return null;
  }

  // Verifica compatibilità con pianta
  if (fertilizer.suitablePlants && !fertilizer.suitablePlants.includes(plant.commonName)) {
    // Non escludere, ma potrebbe non essere ottimale
  }

  // Determina dosaggio basato su fabbisogno
  let dosageAmount = fertilizer.dosagePerSqm.min;

  // Aggiusta dosaggio in base a tipo terreno
  if (soilType === 'Sandy') {
    // Terreno sabbioso: aumenta dosaggio del 20% (perde nutrienti)
    dosageAmount = fertilizer.dosagePerSqm.min * 1.2;
  } else if (soilType === 'Clay') {
    // Terreno argilloso: riduci dosaggio del 10% (trattiene meglio)
    dosageAmount = fertilizer.dosagePerSqm.min * 0.9;
  }

  // Aggiusta in base a fase pianta
  if (nutrientNeeds.phase === 'Reproductive' && fertilizer.category === 'npk') {
    // Fase riproduttiva: preferisci prodotti ricchi di P e K
    if (fertilizer.npk && fertilizer.npk.p < 10) {
      dosageAmount *= 1.1; // Aumenta se prodotto non ottimale
    }
  }

  // Limita a range prodotto
  dosageAmount = Math.max(
    fertilizer.dosagePerSqm.min,
    Math.min(fertilizer.dosagePerSqm.max, dosageAmount)
  );

  // Calcola quantità totale per area
  const totalQuantityNeeded = dosageAmount * areaSqm;

  // Calcola costo stimato
  const estimatedCost = fertilizer.costPerUnit
    ? (totalQuantityNeeded / 1000) * fertilizer.costPerUnit // Assumendo unità in kg
    : undefined;

  // Determina timing
  const timing = calculateApplicationTiming(plant, fertilizer, soilType);

  // Genera warnings
  const warnings: string[] = [];
  if (fertilizer.incompatibilities && fertilizer.incompatibilities.length > 0) {
    warnings.push(
      `Non mescolare con: ${fertilizer.incompatibilities.map((id) => getFertilizerById(id)?.name || id).join(', ')}`
    );
  }
  if (fertilizer.phEffect && soilType) {
    // Verifica pH terreno (semplificato)
    warnings.push(`Effetto pH: ${fertilizer.phEffect}. Verifica pH terreno prima di applicare.`);
  }

  return {
    product: fertilizer,
    dosage: {
      amount: Math.round(dosageAmount * 10) / 10,
      unit: fertilizer.dosagePerSqm.unit,
      perSqm: true,
    },
    timing,
    method: fertilizer.applicationMethod,
    reason: generateReason(fertilizer, nutrientNeeds, plant),
    warnings: warnings.length > 0 ? warnings : undefined,
    estimatedCost,
    totalQuantityNeeded: Math.round(totalQuantityNeeded * 10) / 10,
  };
}

/**
 * Suggerisce prodotto fertilizzante migliore
 */
export function suggestFertilizerProduct(
  nutrientNeeds: NutrientAdvice['elementFocus'],
  soilType: Garden['soilType'],
  applicationTiming: 'pre_planting' | 'top_dressing' | 'post_harvest',
  availableProducts?: FertilizerProduct[]
): FertilizerRecommendation | null {
  const products = availableProducts || allFertilizers;

  // Filtra prodotti per timing
  const timingProducts = products.filter((p) => {
    return (
      p.applicationTiming === applicationTiming || p.applicationTiming === 'all_season'
    );
  });

  if (timingProducts.length === 0) {
    return null;
  }

  // Filtra per tipo terreno
  const suitableProducts = timingProducts.filter((p) => {
    if (p.suitableSoilTypes && p.suitableSoilTypes.length > 0) {
      return p.suitableSoilTypes.includes(soilType || 'Loamy');
    }
    return true; // Nessuna restrizione
  });

  // Seleziona prodotto in base a fabbisogno
  let selectedProduct: FertilizerProduct | undefined;

  switch (nutrientNeeds) {
    case 'N':
      // Cerca prodotti ricchi di azoto
      selectedProduct = suitableProducts.find((p) => p.npk && p.npk.n >= 10);
      if (!selectedProduct) {
        selectedProduct = suitableProducts.find((p) => p.type === 'organic' && p.category === 'manure');
      }
      break;

    case 'P':
      // Cerca prodotti ricchi di fosforo
      selectedProduct = suitableProducts.find((p) => p.npk && p.npk.p >= 10);
      if (!selectedProduct) {
        selectedProduct = suitableProducts.find((p) => p.category === 'bone_meal');
      }
      break;

    case 'K':
      // Cerca prodotti ricchi di potassio
      selectedProduct = suitableProducts.find((p) => p.npk && p.npk.k >= 10);
      if (!selectedProduct) {
        selectedProduct = suitableProducts.find((p) => p.type === 'mineral' && p.category === 'npk');
      }
      break;

    case 'Micro':
      // Cerca microelementi
      selectedProduct = suitableProducts.find((p) => p.type === 'microelement');
      break;

    default:
      // Prodotto bilanciato
      selectedProduct = suitableProducts.find(
        (p) => p.npk && p.npk.n > 0 && p.npk.p > 0 && p.npk.k > 0
      );
  }

  if (!selectedProduct) {
    // Fallback: primo prodotto disponibile
    selectedProduct = suitableProducts[0];
  }

  if (!selectedProduct) {
    return null;
  }

  // Crea raccomandazione base
  const dosage = selectedProduct.dosagePerSqm.min;
  const timing = new Date(); // Semplificato, dovrebbe essere calcolato meglio

  return {
    product: selectedProduct,
    dosage: {
      amount: dosage,
      unit: selectedProduct.dosagePerSqm.unit,
      perSqm: true,
    },
    timing,
    method: selectedProduct.applicationMethod,
    reason: `Prodotto consigliato per fabbisogno ${nutrientNeeds} su terreno ${soilType}`,
    estimatedCost: selectedProduct.costPerUnit
      ? (dosage / 1000) * selectedProduct.costPerUnit
      : undefined,
  };
}

/**
 * Verifica incompatibilità tra prodotti
 */
export function checkIncompatibilities(
  product1: FertilizerProduct,
  product2: FertilizerProduct
): { incompatible: boolean; reason?: string } {
  // Verifica incompatibilità diretta
  if (
    product1.incompatibilities?.includes(product2.id) ||
    product2.incompatibilities?.includes(product1.id)
  ) {
    return {
      incompatible: true,
      reason: `${product1.name} e ${product2.name} sono incompatibili. Non mescolare.`,
    };
  }

  // Verifica incompatibilità pH
  if (
    (product1.phEffect === 'acidifying' && product2.phEffect === 'alkalizing') ||
    (product1.phEffect === 'alkalizing' && product2.phEffect === 'acidifying')
  ) {
    return {
      incompatible: true,
      reason: `${product1.name} (${product1.phEffect}) e ${product2.name} (${product2.phEffect}) hanno effetti pH opposti.`,
    };
  }

  return { incompatible: false };
}

/**
 * Calcola timing ottimale applicazione
 */
export function calculateApplicationTiming(
  plant: PlantMasterSheet,
  fertilizer: FertilizerProduct,
  soilType: Garden['soilType']
): Date {
  const now = new Date();

  switch (fertilizer.applicationTiming) {
    case 'pre_planting':
      // 1-2 settimane prima di piantare
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    case 'top_dressing':
      // Durante crescita
      return now;

    case 'post_harvest':
      // Dopo raccolta
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    default:
      return now;
  }
}

/**
 * Genera piano fertilizzazione annuale
 */
export function suggestFertilizerPlan(
  annualPlan: Array<{ plantName: string; area: number; plantingDate: Date }>,
  soilType: Garden['soilType'],
  availableProducts?: FertilizerProduct[]
): FertilizerPlan[] {
  const plans: FertilizerPlan[] = [];

  for (const planItem of annualPlan) {
    // Semplificato: assume bisogno generale
    const recommendation = suggestFertilizerProduct('None', soilType, 'pre_planting', availableProducts);

    if (recommendation) {
      const dosage = calculateFertilizerDosage(
        { commonName: planItem.plantName } as PlantMasterSheet,
        { elementFocus: 'None', shouldFertilize: true } as NutrientAdvice,
        soilType,
        recommendation.product,
        planItem.area
      );

      if (dosage) {
        plans.push({
          plantName: planItem.plantName,
          recommendations: [dosage],
          totalEstimatedCost: dosage.estimatedCost || 0,
          applicationSchedule: [
            {
              date: planItem.plantingDate,
              products: [recommendation.product],
            },
          ],
        });
      }
    }
  }

  return plans;
}

/**
 * Genera motivo raccomandazione
 */
function generateReason(
  fertilizer: FertilizerProduct,
  nutrientNeeds: NutrientAdvice,
  plant: PlantMasterSheet
): string {
  const reasons: string[] = [];

  if (fertilizer.npk) {
    if (nutrientNeeds.elementFocus === 'N' && fertilizer.npk.n >= 10) {
      reasons.push('Ricco di azoto per crescita vegetativa');
    }
    if (nutrientNeeds.elementFocus === 'P' && fertilizer.npk.p >= 10) {
      reasons.push('Ricco di fosforo per radicazione e fioritura');
    }
    if (nutrientNeeds.elementFocus === 'K' && fertilizer.npk.k >= 10) {
      reasons.push('Ricco di potassio per fruttificazione');
    }
  }

  if (fertilizer.type === 'organic') {
    reasons.push('Migliora struttura terreno');
  }

  if (fertilizer.category === 'slow_release') {
    reasons.push('Rilascio graduale, una sola applicazione per stagione');
  }

  if (reasons.length === 0) {
    return `Prodotto adatto per ${plant.commonName}`;
  }

  return reasons.join('. ');
}

