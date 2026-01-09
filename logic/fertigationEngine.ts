/**
 * Fertigation Engine
 * Calcola piano fertirrigazione completo con dosaggi, tempistiche e prodotti
 */

import { PlantMasterSheet, Garden, GardenTask } from '../types';
import { NutrientAdvice, calculateNutrientNeeds } from './nutrientEngine';
import { fertigationProducts, FertigationProduct } from '../data/fertigationProducts';
import { getSeasonForDate } from '../utils/seasonalAdjustment';
import { getDefaultProfile } from '../services/archetypeService';

export interface FertigationPlan {
  shouldFertigate: boolean;
  product: FertigationProduct | null;
  dosage: {
    perLiter: number; // ml o grammi per litro
    totalForIrrigation: number; // Totale per sessione irrigazione
    unit: 'ml' | 'g';
  };
  timing: {
    nextDate: Date;
    frequency: number; // Giorni
    bestTimeOfDay: 'Morning' | 'Evening';
  };
  instructions: string[];
  warnings: string[];
  irrigationVolume: number; // Litri d'acqua necessari
}

/**
 * Calcola piano fertirrigazione completo
 * @param irrigationVolume - Volume irrigazione in litri (opzionale, se fornito usa questo invece di calcolarlo)
 */
export const calculateFertigationPlan = (
  task: GardenTask,
  plant: PlantMasterSheet,
  garden: Garden,
  currentDate: Date = new Date(),
  irrigationVolume?: number
): FertigationPlan => {
  const daysActive = Math.floor(
    (currentDate.getTime() - new Date(task.date).getTime()) / (1000 * 60 * 60 * 24)
  );

  // 1. Verifica se fertirrigazione è appropriata
  const nutrientAdvice = calculateNutrientNeeds(plant, daysActive, garden.soilType, task.taskType);
  
  if (!nutrientAdvice.shouldFertilize) {
    return {
      shouldFertigate: false,
      product: null,
      dosage: { perLiter: 0, totalForIrrigation: 0, unit: 'ml' },
      timing: { nextDate: currentDate, frequency: 0, bestTimeOfDay: 'Evening' },
      instructions: ['Non è necessario fertirrigare in questo momento'],
      warnings: [],
      irrigationVolume: 0,
    };
  }

  // 2. Determina fase
  const phase = nutrientAdvice.phase;
  const element = nutrientAdvice.elementFocus;

  // 3. Seleziona prodotto appropriato
  const suitableProducts = fertigationProducts.filter(p => {
    const phaseMatch = p.phase === phase || p.phase === 'ALL';
    const categoryMatch = p.suitableFor === plant.nutrientCategory || p.suitableFor === 'ALL';
    
    // Match elemento richiesto basato su NPK
    let elementMatch = false;
    if (element === 'N') {
      // Prodotto ricco di azoto: N deve essere il maggiore
      elementMatch = p.npk.n > p.npk.p && p.npk.n > p.npk.k && p.npk.n >= 5;
    } else if (element === 'P') {
      // Prodotto ricco di fosforo: P deve essere il maggiore
      elementMatch = p.npk.p > p.npk.n && p.npk.p > p.npk.k && p.npk.p >= 5;
    } else if (element === 'K') {
      // Prodotto ricco di potassio: K deve essere il maggiore
      elementMatch = p.npk.k > p.npk.n && p.npk.k > p.npk.p && p.npk.k >= 5;
    } else if (element === 'Micro') {
      // Prodotti con microelementi
      elementMatch = (p.micronutrients && p.micronutrients.length > 0) || p.type === 'Chelated';
    } else {
      // None: accetta prodotti bilanciati o coadiuvanti
      elementMatch = true;
    }

    return phaseMatch && categoryMatch && elementMatch;
  });

  if (suitableProducts.length === 0) {
    return {
      shouldFertigate: false,
      product: null,
      dosage: { perLiter: 0, totalForIrrigation: 0, unit: 'ml' },
      timing: { nextDate: currentDate, frequency: 0, bestTimeOfDay: 'Evening' },
      instructions: ['Nessun prodotto adatto trovato per questa fase'],
      warnings: [],
      irrigationVolume: 0,
    };
  }

  // Preferisci organico se disponibile, altrimenti primo disponibile
  const selectedProduct = suitableProducts.find(p => p.organic) || suitableProducts[0];

  // 4. Calcola dosaggio basato su terreno e dimensione giardino
  const baseDosage = selectedProduct.dosagePerLiter;
  let adjustedDosage = baseDosage;

  // Modificatori per tipo terreno
  if (garden.soilType === 'Sandy') {
    adjustedDosage = baseDosage * 0.7; // -30% dosaggio, più frequente
  } else if (garden.soilType === 'Clay') {
    adjustedDosage = baseDosage * 1.2; // +20% dosaggio, meno frequente
  }

  // 5. Calcola volume irrigazione necessario
  // Se irrigationVolume è fornito (da zona), usalo direttamente
  // Altrimenti stima: 5-10 litri per m² per irrigazione standard
  let totalIrrigationVolume: number;
  if (irrigationVolume !== undefined && irrigationVolume > 0) {
    totalIrrigationVolume = irrigationVolume;
  } else {
    let irrigationPerSqM = 6; // Default Loamy
    if (garden.soilType === 'Sandy') {
      irrigationPerSqM = 8; // Più acqua per terreno sabbioso
    } else if (garden.soilType === 'Clay') {
      irrigationPerSqM = 5; // Meno acqua per terreno argilloso
    }
    totalIrrigationVolume = garden.sizeSqMeters * irrigationPerSqM;
  }

  // 6. Calcola dosaggio totale
  const totalDosage = adjustedDosage * totalIrrigationVolume;
  const unit = selectedProduct.type === 'Liquid' ? 'ml' : 'g';

  // 7. Determina tempistiche
  const latitude = garden.coordinates?.latitude || 0;
  const season = getSeasonForDate(currentDate, latitude);
  const bestTimeOfDay = season === 'Summer' ? 'Evening' : 'Morning';
  
  // Frequenza: terreno sabbioso = più frequente
  let frequency = selectedProduct.frequency;
  if (garden.soilType === 'Sandy') {
    frequency = Math.floor(frequency * 0.7); // 30% più frequente (arrotondato per difetto)
  } else if (garden.soilType === 'Clay') {
    frequency = Math.ceil(frequency * 1.3); // 30% meno frequente (arrotondato per eccesso)
  }

  const nextDate = new Date(currentDate);
  nextDate.setDate(nextDate.getDate() + frequency);

  // 8. Istruzioni dettagliate
  const instructions: string[] = [
    `Sciogli ${totalDosage.toFixed(1)}${unit} di ${selectedProduct.name} in ${totalIrrigationVolume.toFixed(0)} litri d'acqua`,
    `Applica durante irrigazione ${bestTimeOfDay === 'Evening' ? 'serale' : 'mattutina'}`,
    `Ripeti ogni ${frequency} giorni`,
    `Non superare questa dose per evitare fitotossicità`,
  ];

  if (selectedProduct.type === 'Soluble') {
    instructions.unshift('⚠️ Sciogli completamente il prodotto in acqua tiepida prima di aggiungere all\'irrigazione');
  }

  if (selectedProduct.type === 'Liquid' && selectedProduct.organic && selectedProduct.id.includes('ortica')) {
    instructions.push('Per macerato di ortica: prepara 48h prima, filtra prima dell\'uso');
  }

  // 9. Warnings
  const warnings: string[] = [];
  
  if (garden.soilType === 'Clay' && phase === 'Reproductive' && element === 'N') {
    warnings.push('Terreno argilloso: evita eccessi di azoto in fase fruttificazione (favorisce solo foglie)');
  }

  if (season === 'Summer' && bestTimeOfDay === 'Evening') {
    warnings.push('In estate, fertirriga solo la sera (dopo le 18:00) per evitare evaporazione e scottature fogliari');
  }

  if (garden.soilType === 'Sandy' && frequency < 7) {
    warnings.push('Terreno sabbioso: fertirriga frequentemente ma con dosi ridotte per evitare dilavamento');
  }

  if (selectedProduct.type === 'Soluble') {
    warnings.push('Assicurati che il prodotto sia completamente sciolto prima di applicare, altrimenti può ostruire il sistema di irrigazione');
  }

  return {
    shouldFertigate: true,
    product: selectedProduct,
    dosage: {
      perLiter: adjustedDosage,
      totalForIrrigation: totalDosage,
      unit,
    },
    timing: {
      nextDate,
      frequency,
      bestTimeOfDay,
    },
    instructions,
    warnings,
    irrigationVolume: totalIrrigationVolume,
  };
};

/**
 * Verifica se è il momento giusto per fertirrigare
 */
export const shouldFertigateNow = (
  task: GardenTask,
  plant: PlantMasterSheet,
  garden: Garden,
  lastFertigationDate?: string
): boolean => {
  const plan = calculateFertigationPlan(task, plant, garden);
  
  if (!plan.shouldFertigate) return false;

  if (!lastFertigationDate) {
    // Prima fertirrigazione: aspetta almeno 7 giorni dal trapianto/semina
    const daysSincePlanting = Math.floor(
      (new Date().getTime() - new Date(task.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSincePlanting >= 7;
  }

  // Verifica se è passato il tempo necessario
  const lastDate = new Date(lastFertigationDate);
  const daysSinceLast = Math.floor(
    (new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceLast >= plan.timing.frequency;
};

