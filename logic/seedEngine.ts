/**
 * Seed Engine
 * Gestisce inventario semi, germinabilità, autoproduzione e pianificazione
 */

export interface Seed {
  id: string;
  plantName: string;
  variety?: string;
  quantity: number;
  unit: 'g' | 'seeds';
  productionYear: number;
  source: 'purchased' | 'self_produced' | 'exchange';
  germinationRate?: number; // 0-1, calcolato da test o stima
  storageConditions?: {
    temperature: number;
    humidity: number;
    container: string;
  };
  expectedViabilityYears: number;
}

/**
 * Calcola germinabilità stimata basata su età
 */
export function calculateGerminationRate(seed: Seed, currentYear: number): number {
  const age = currentYear - seed.productionYear;
  const maxAge = seed.expectedViabilityYears;

  if (age >= maxAge) {
    return 0.1; // Molto bassa dopo scadenza
  }

  // Formula: rate = baseRate * (1 - (age / maxAge))
  const baseRate = 0.9; // 90% per semi freschi
  const rate = baseRate * (1 - age / maxAge);

  return Math.max(0.1, Math.min(0.95, rate));
}

/**
 * Suggerisce test germinabilità se necessario
 */
export function suggestSeedTest(seed: Seed, currentYear: number): {
  shouldTest: boolean;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
} {
  const age = currentYear - seed.productionYear;
  const germinationRate = seed.germinationRate || calculateGerminationRate(seed, currentYear);

  if (age >= seed.expectedViabilityYears) {
    return {
      shouldTest: true,
      reason: `Semi di ${seed.productionYear} hanno superato la durata stimata (${seed.expectedViabilityYears} anni)`,
      urgency: 'high',
    };
  }

  if (age >= seed.expectedViabilityYears * 0.7 && !seed.germinationRate) {
    return {
      shouldTest: true,
      reason: `Semi di ${seed.productionYear} stanno invecchiando. Test consigliato prima della semina.`,
      urgency: 'medium',
    };
  }

  if (germinationRate < 0.5) {
    return {
      shouldTest: true,
      reason: `Germinabilità stimata bassa (${Math.round(germinationRate * 100)}%). Test consigliato.`,
      urgency: 'high',
    };
  }

  return { shouldTest: false, reason: '', urgency: 'low' };
}

/**
 * Calcola semi necessari per piano annuale
 */
export function getSeedRequirements(annualPlan: { plantName: string; area: number }[]): Map<string, number> {
  // Requisiti medi per m² (grammi o semi)
  const requirements: Record<string, number> = {
    Pomodoro: 0.5, // g/m²
    Zucchina: 2, // semi/m²
    Peperone: 0.3,
    Melanzana: 0.2,
    Lattuga: 1,
    Basilico: 0.5,
    Fagiolo: 20, // semi/m²
    Pisello: 30,
  };

  const needed = new Map<string, number>();

  for (const plan of annualPlan) {
    const req = requirements[plan.plantName] || 1;
    const total = req * plan.area;
    needed.set(plan.plantName, (needed.get(plan.plantName) || 0) + total);
  }

  return needed;
}

/**
 * Suggerisce acquisti/scambi basati su inventario e necessità
 */
export function suggestSeedPurchase(
  requirements: Map<string, number>,
  inventory: Seed[]
): Array<{ plantName: string; needed: number; reason: string }> {
  const suggestions: Array<{ plantName: string; needed: number; reason: string }> = [];

  for (const [plantName, needed] of requirements) {
    const available = inventory
      .filter((s) => s.plantName === plantName)
      .reduce((sum, s) => {
        const rate = s.germinationRate || 0.8;
        return sum + s.quantity * rate;
      }, 0);

    if (available < needed * 0.8) {
      // Meno dell'80% necessario
      suggestions.push({
        plantName,
        needed: Math.ceil(needed - available),
        reason: `Scorte insufficienti. Disponibili: ${available.toFixed(1)}, necessari: ${needed.toFixed(1)}`,
      });
    }
  }

  return suggestions;
}

