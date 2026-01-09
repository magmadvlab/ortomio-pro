/**
 * Phyto Engine
 * Converte diagnosi problemi (da Health Engine) in prodotti concreti con dosaggi e timing critico
 */

import { PlantMasterSheet, UserProfile } from '../types';
import { PhytoProduct, getPhytoProductsForPest, getPhytoProductsForDisease, getBioProducts, getProductsWithoutSafetyInterval } from '../data/phytoproducts';
import { getWeatherForecast } from '../services/weatherService';

export interface PhytoRecommendation {
  product: PhytoProduct;
  dosage: { amount: number; unit: string };
  timing: Date;
  method: 'foliar' | 'systemic' | 'soil' | 'trap';
  reason: string;
  warnings?: string[];
  estimatedCost?: number;
  effectiveness: 'low' | 'medium' | 'high';
}

export interface TreatmentTimingCheck {
  conflict: boolean;
  message: string;
  options: Array<{ action: string; delay?: number; harvestFirst?: boolean; alternativeProduct?: PhytoProduct }>;
}

/**
 * Suggerisce prodotto fitofarmaco
 */
export async function suggestPhytoProduct(
  problem: string, // Es: 'peronospora', 'afidi'
  plant: PlantMasterSheet,
  weatherForecast?: { tempMin?: number; tempMax?: number; precipitation?: number; wind?: number },
  userProfile?: UserProfile
): Promise<PhytoRecommendation | null> {
  // Determina se problema è malattia o parassita
  const isDisease = problem.toLowerCase().includes('peronospora') ||
    problem.toLowerCase().includes('oidio') ||
    problem.toLowerCase().includes('ticchiolatura') ||
    problem.toLowerCase().includes('alternaria') ||
    problem.toLowerCase().includes('batteriosi');

  const isPest = problem.toLowerCase().includes('afidi') ||
    problem.toLowerCase().includes('tripidi') ||
    problem.toLowerCase().includes('cocciniglie') ||
    problem.toLowerCase().includes('bruchi') ||
    problem.toLowerCase().includes('lepidotteri');

  // Filtra prodotti disponibili
  let availableProducts: PhytoProduct[] = [];

  if (isDisease) {
    availableProducts = getPhytoProductsForDisease(problem);
  } else if (isPest) {
    availableProducts = getPhytoProductsForPest(problem);
  } else {
    // Prova entrambi
    availableProducts = [
      ...getPhytoProductsForDisease(problem),
      ...getPhytoProductsForPest(problem),
    ];
  }

  // Filtra per preferenze utente
  if (userProfile?.preferredTreatmentType === 'organic') {
    availableProducts = availableProducts.filter((p) => p.allowedInOrganic);
  } else if (userProfile?.preferredTreatmentType === 'classic') {
    // Permetti anche convenzionali
  } else {
    // Mixed: preferisci bio ma permetti convenzionali
    availableProducts.sort((a, b) => {
      if (a.type === 'bio' && b.type === 'conventional') return -1;
      if (a.type === 'conventional' && b.type === 'bio') return 1;
      return 0;
    });
  }

  // Verifica licenza per prodotti convenzionali
  if (userProfile) {
    availableProducts = availableProducts.filter((p) => {
      if (p.requiresLicense && !userProfile.pesticideLicense?.isValid) {
        return false;
      }
      return true;
    });
  }

  if (availableProducts.length === 0) {
    return null;
  }

  // Seleziona prodotto migliore (più efficace, bio se possibile)
  const selectedProduct = availableProducts[0];

  // Calcola dosaggio
  const dosage = calculateDosage(selectedProduct, plant, problem);

  // Calcola timing
  const timing = new Date(); // Semplificato

  // Genera warnings
  const warnings: string[] = [];
  if (selectedProduct.requiresLicense && !userProfile?.pesticideLicense?.isValid) {
    warnings.push('⚠️ Richiede patentino fitosanitario valido');
  }
  if (selectedProduct.type === 'conventional') {
    warnings.push('⚠️ Prodotto chimico convenzionale. Usare con cautela.');
  }
  if (selectedProduct.incompatibilities && selectedProduct.incompatibilities.length > 0) {
    warnings.push(`Non mescolare con: ${selectedProduct.incompatibilities.join(', ')}`);
  }

  return {
    product: selectedProduct,
    dosage,
    timing,
    method: selectedProduct.applicationMethod,
    reason: generateReason(selectedProduct, problem, plant),
    warnings: warnings.length > 0 ? warnings : undefined,
    estimatedCost: selectedProduct.costPerUnit ? (dosage.amount / 1000) * selectedProduct.costPerUnit : undefined,
    effectiveness: selectedProduct.effectiveness || 'medium',
  };
}

/**
 * Calcola dosaggio specifico
 */
export function calculateDosage(
  product: PhytoProduct,
  plant: PlantMasterSheet,
  problemSeverity: string
): { amount: number; unit: string } {
  // Dosaggio base
  let dosage = product.dosage.min;

  // Aggiusta per gravità problema
  if (problemSeverity.toLowerCase().includes('grave') || problemSeverity.toLowerCase().includes('severa')) {
    dosage = product.dosage.max;
  } else if (problemSeverity.toLowerCase().includes('lieve') || problemSeverity.toLowerCase().includes('iniziale')) {
    dosage = product.dosage.min;
  } else {
    // Media
    dosage = (product.dosage.min + product.dosage.max) / 2;
  }

  return {
    amount: Math.round(dosage * 10) / 10,
    unit: product.dosage.unit,
  };
}

/**
 * Verifica timing trattamento con raccolta
 */
export async function checkTreatmentTiming(
  product: PhytoProduct,
  weatherForecast?: { tempMin?: number; tempMax?: number; precipitation?: number; wind?: number },
  harvestDate?: Date
): Promise<TreatmentTimingCheck> {
  const currentDate = new Date();
  const daysUntilHarvest = harvestDate
    ? Math.ceil((harvestDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Verifica conflitto con raccolta
  if (daysUntilHarvest !== null && daysUntilHarvest < product.safetyInterval) {
    const conflict = true;
    const options: TreatmentTimingCheck['options'] = [];

    // Opzione 1: Tratta ora, ritarda raccolta
    if (product.safetyInterval > daysUntilHarvest) {
      options.push({
        action: `Tratta ora, ritarda raccolta di ${product.safetyInterval - daysUntilHarvest} giorni`,
        delay: product.safetyInterval - daysUntilHarvest,
      });
    }

    // Opzione 2: Raccogli prima, poi tratta
    options.push({
      action: 'Raccogli prima, poi tratta',
      harvestFirst: true,
    });

    // Opzione 3: Usa alternativa senza carenza
    const alternatives = getProductsWithoutSafetyInterval().filter(
      (p) => p.category === product.category && p.allowedInOrganic === product.allowedInOrganic
    );
    if (alternatives.length > 0) {
      options.push({
        action: `Usa alternativa senza carenza: ${alternatives[0].name}`,
        alternativeProduct: alternatives[0],
      });
    }

    return {
      conflict,
      message: `Conflitto: raccolta prevista tra ${daysUntilHarvest} giorni, ma tempo carenza ${product.name} è ${product.safetyInterval} giorni`,
      options,
    };
  }

  // Verifica condizioni meteo
  if (weatherForecast) {
    const warnings: string[] = [];

    if (weatherForecast.precipitation && weatherForecast.precipitation > 5) {
      warnings.push(`Pioggia prevista: dilavamento possibile. Aspetta tempo asciutto.`);
    }

    if (product.weatherConditions.minTemp && weatherForecast.tempMin && weatherForecast.tempMin < product.weatherConditions.minTemp) {
      warnings.push(`Temperatura troppo bassa: minimo ${product.weatherConditions.minTemp}°C richiesto`);
    }

    if (product.weatherConditions.maxTemp && weatherForecast.tempMax && weatherForecast.tempMax > product.weatherConditions.maxTemp) {
      warnings.push(`Temperatura troppo alta: massimo ${product.weatherConditions.maxTemp}°C richiesto`);
    }

    if (product.weatherConditions.windMax && weatherForecast.wind && weatherForecast.wind > product.weatherConditions.windMax) {
      warnings.push(`Vento troppo forte: massimo ${product.weatherConditions.windMax} km/h`);
    }

    if (warnings.length > 0) {
      return {
        conflict: true,
        message: warnings.join('. '),
        options: [{ action: 'Aspetta condizioni meteo migliori' }],
      };
    }
  }

  return {
    conflict: false,
    message: 'Timing ottimale per trattamento',
    options: [],
  };
}

/**
 * Calcola fine periodo carenza
 */
export function calculateSafetyInterval(
  product: PhytoProduct,
  applicationDate: Date
): Date {
  const endDate = new Date(applicationDate);
  endDate.setDate(endDate.getDate() + product.safetyInterval);
  return endDate;
}

/**
 * Verifica incompatibilità prodotti
 */
export function checkIncompatibilities(
  product1: PhytoProduct,
  product2: PhytoProduct
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

  // Verifica incompatibilità categoria (es. rame + zolfo)
  if (
    (product1.id.includes('rame') && product2.id.includes('zolfo')) ||
    (product1.id.includes('zolfo') && product2.id.includes('rame'))
  ) {
    return {
      incompatible: true,
      reason: 'Rame e Zolfo sono incompatibili. Non mescolare.',
    };
  }

  return { incompatible: false };
}

/**
 * Genera piano trattamento completo
 */
export async function suggestTreatmentPlan(
  problem: string,
  plant: PlantMasterSheet,
  availableProducts?: PhytoProduct[]
): Promise<PhytoRecommendation[]> {
  const recommendations: PhytoRecommendation[] = [];

  // Suggerisci prodotto principale
  const mainRecommendation = await suggestPhytoProduct(problem, plant);
  if (mainRecommendation) {
    recommendations.push(mainRecommendation);
  }

  // Suggerisci prodotti complementari se necessario
  // Es: per peronospora, potrebbe suggerire rame + propoli preventivo

  return recommendations;
}

/**
 * Genera motivo raccomandazione
 */
function generateReason(product: PhytoProduct, problem: string, plant: PlantMasterSheet): string {
  const reasons: string[] = [];

  if (product.targetDiseases?.some((d) => problem.toLowerCase().includes(d.toLowerCase()))) {
    reasons.push(`Efficace contro ${problem}`);
  }

  if (product.targetPests?.some((p) => problem.toLowerCase().includes(p.toLowerCase()))) {
    reasons.push(`Efficace contro ${problem}`);
  }

  if (product.type === 'bio') {
    reasons.push('Prodotto biologico');
  }

  if (product.safetyInterval === 0) {
    reasons.push('Nessun tempo di carenza');
  }

  if (reasons.length === 0) {
    return `Prodotto consigliato per ${problem} su ${plant.commonName}`;
  }

  return reasons.join('. ');
}

