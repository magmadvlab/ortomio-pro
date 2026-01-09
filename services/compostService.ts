/**
 * Compost Service
 * Gestisce autoproduzione compost: tradizionale, lombrico, bokashi
 */

export interface CompostMaterial {
  name: string;
  type: 'green' | 'brown'; // Verde = azoto, Marrone = carbonio
  cnRatio: number; // Rapporto C/N
  moisture?: number; // % umidità
}

export interface CompostLog {
  id: string;
  gardenId: string;
  compostType: 'compost' | 'worm_compost' | 'bokashi';
  startDate: Date;
  materials: Array<{ material: CompostMaterial; quantity: number; unit: string }>;
  cnRatio?: number;
  maturityDate?: Date;
  quantityProduced?: number;
  unit: 'kg' | 'L';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Materiali comuni per compost
 */
export const compostMaterials: CompostMaterial[] = [
  // Materiali verdi (azoto)
  { name: 'Scarti cucina', type: 'green', cnRatio: 15 },
  { name: 'Erba tagliata fresca', type: 'green', cnRatio: 20 },
  { name: 'Foglie verdi', type: 'green', cnRatio: 25 },
  { name: 'Ortaggi scartati', type: 'green', cnRatio: 12 },
  { name: 'Fondi caffè', type: 'green', cnRatio: 20 },
  { name: 'Gusci uova', type: 'green', cnRatio: 12 },

  // Materiali marroni (carbonio)
  { name: 'Foglie secche', type: 'brown', cnRatio: 60 },
  { name: 'Paglia', type: 'brown', cnRatio: 80 },
  { name: 'Cartone', type: 'brown', cnRatio: 350 },
  { name: 'Segatura', type: 'brown', cnRatio: 400 },
  { name: 'Rami tritati', type: 'brown', cnRatio: 500 },
  { name: 'Giornali', type: 'brown', cnRatio: 175 },
];

/**
 * Calcola rapporto C/N materiali
 */
export function calculateCNRatio(
  materials: Array<{ material: CompostMaterial; quantity: number }>
): number {
  if (materials.length === 0) return 0;

  let totalCarbon = 0;
  let totalNitrogen = 0;

  for (const { material, quantity } of materials) {
    // Stima carbonio e azoto basata su rapporto C/N
    // C/N = Carbonio / Azoto, quindi Carbonio = C/N * Azoto
    // Assumiamo quantità in unità equivalenti
    const nitrogen = quantity;
    const carbon = material.cnRatio * nitrogen;

    totalCarbon += carbon;
    totalNitrogen += nitrogen;
  }

  return totalNitrogen > 0 ? totalCarbon / totalNitrogen : 0;
}

/**
 * Suggerisce materiali per rapporto C/N ottimale
 */
export function suggestCompostMaterials(
  targetCNRatio: number = 30
): Array<{ material: CompostMaterial; percentage: number }> {
  const suggestions: Array<{ material: CompostMaterial; percentage: number }> = [];

  // Mix ideale: 2/3 marroni, 1/3 verdi per C/N ~30
  const greenMaterials = compostMaterials.filter((m) => m.type === 'green');
  const brownMaterials = compostMaterials.filter((m) => m.type === 'brown');

  // Suggerisci mix base
  if (greenMaterials.length > 0 && brownMaterials.length > 0) {
    suggestions.push(
      { material: greenMaterials[0], percentage: 33 },
      { material: brownMaterials[0], percentage: 67 }
    );
  }

  return suggestions;
}

/**
 * Stima data maturazione compost
 */
export function estimateMaturityDate(
  startDate: Date,
  materials: Array<{ material: CompostMaterial; quantity: number }>,
  conditions: {
    temperature?: number; // °C media
    moisture?: number; // % umidità
    aeration?: 'low' | 'medium' | 'high'; // Frequenza rivoltamento
    compostType: 'compost' | 'worm_compost' | 'bokashi';
  }
): Date {
  const baseDays = conditions.compostType === 'bokashi' ? 30 : conditions.compostType === 'worm_compost' ? 60 : 180;

  // Aggiusta in base a condizioni
  let adjustedDays = baseDays;

  if (conditions.temperature) {
    // Temperatura ottimale: 50-60°C
    if (conditions.temperature < 40) {
      adjustedDays *= 1.5; // Più lento se freddo
    } else if (conditions.temperature > 60) {
      adjustedDays *= 0.8; // Più veloce se caldo
    }
  }

  if (conditions.aeration === 'high') {
    adjustedDays *= 0.8; // Più veloce con aerazione frequente
  } else if (conditions.aeration === 'low') {
    adjustedDays *= 1.3; // Più lento senza aerazione
  }

  // Verifica rapporto C/N
  const cnRatio = calculateCNRatio(materials);
  if (cnRatio > 40) {
    adjustedDays *= 1.2; // Più lento se troppo carbonio
  } else if (cnRatio < 20) {
    adjustedDays *= 0.9; // Più veloce se più azoto
  }

  const maturityDate = new Date(startDate);
  maturityDate.setDate(maturityDate.getDate() + Math.round(adjustedDays));

  return maturityDate;
}

/**
 * Ottiene istruzioni per tipo compost
 */
export function getCompostInstructions(
  compostType: 'compost' | 'worm_compost' | 'bokashi'
): {
  title: string;
  steps: string[];
  tips: string[];
  duration: string;
} {
  switch (compostType) {
    case 'compost':
      return {
        title: 'Compost Tradizionale',
        steps: [
          'Scegli posizione ombreggiata e ben drenata',
          'Alterna strati di materiali verdi (azoto) e marroni (carbonio)',
          'Mantieni umidità 50-60% (come spugna strizzata)',
          'Rivolta ogni 2-3 settimane per aerazione',
          'Quando temperatura scende e materiale è scuro e friabile, è maturo',
        ],
        tips: [
          'Rapporto ideale: 2 parti marroni, 1 parte verdi',
          'Taglia materiali grossi per accelerare decomposizione',
          'Evita carne, latticini, oli (attirano animali)',
        ],
        duration: '4-6 mesi',
      };

    case 'worm_compost':
      return {
        title: 'Lombricompost',
        steps: [
          'Prepara contenitore con fondo forato e coperchio',
          'Aggiungi letto di materiale umido (cartone, foglie)',
          'Introduci lombrichi (Eisenia fetida)',
          'Aggiungi scarti cucina gradualmente',
          'Raccogli humus quando scarti sono decomposti',
        ],
        tips: [
          'Mantieni temperatura 15-25°C',
          'Non sovraccaricare con troppi scarti',
          'Raccogli humus ogni 2-3 mesi',
        ],
        duration: '2-3 mesi',
      };

    case 'bokashi':
      return {
        title: 'Bokashi',
        steps: [
          'Usa contenitore con rubinetto per drenare liquidi',
          'Aggiungi scarti cucina e inocula con EM (microrganismi efficaci)',
          'Comprimi per eliminare aria',
          'Chiudi ermeticamente',
          'Dopo 2 settimane, interra o aggiungi a compost',
        ],
        tips: [
          'Può includere carne e latticini',
          'Raccogli liquido (ottimo fertilizzante diluito)',
          'Materiale fermentato va interrato o compostato',
        ],
        duration: '2-4 settimane',
      };
  }
}

/**
 * Traccia produzione compost
 */
export async function trackCompostProduction(
  gardenId: string,
  compostLog: Omit<CompostLog, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CompostLog> {
  // TODO: Implementare salvataggio in Supabase
  // Per ora, salva in localStorage
  const storageKey = `compost_logs_${gardenId}`;
  const stored = localStorage.getItem(storageKey);
  const logs: CompostLog[] = stored ? JSON.parse(stored) : [];

  const newLog: CompostLog = {
    id: `compost_${Date.now()}`,
    ...compostLog,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  logs.push(newLog);
  localStorage.setItem(storageKey, JSON.stringify(logs));

  return newLog;
}

/**
 * Recupera log compost
 */
export async function getCompostLogs(gardenId: string): Promise<CompostLog[]> {
  const storageKey = `compost_logs_${gardenId}`;
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    return JSON.parse(stored).map((log: any) => ({
      ...log,
      startDate: new Date(log.startDate),
      maturityDate: log.maturityDate ? new Date(log.maturityDate) : undefined,
      createdAt: new Date(log.createdAt),
      updatedAt: new Date(log.updatedAt),
    }));
  }
  return [];
}

