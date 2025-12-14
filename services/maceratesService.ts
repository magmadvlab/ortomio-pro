/**
 * Macerates Service
 * Gestisce preparati naturali: macerati, decotti, infusi
 */

export type MacerateType = 'ortica' | 'aglio' | 'equiseto' | 'tanaceto' | 'consolida';

export interface MacerateRecipe {
  type: MacerateType;
  name: string;
  preparation: 'macerato' | 'decotto' | 'infuso';
  materials: string[];
  ratio: string; // Es: "1:10" = 1 parte materiale, 10 parti acqua
  preparationTime: number; // Giorni
  storage: string;
  dosage: string;
  application: string;
  target: string[];
  notes?: string;
}

export interface MacerateLog {
  id: string;
  gardenId: string;
  type: MacerateType;
  startDate: Date;
  materials: Array<{ name: string; quantity: number; unit: string }>;
  preparationTime: number;
  quantityProduced: number;
  unit: 'L';
  notes?: string;
  createdAt: Date;
}

/**
 * Ricette macerati
 */
export const macerateRecipes: Record<MacerateType, MacerateRecipe> = {
  ortica: {
    type: 'ortica',
    name: 'Macerato di Ortica',
    preparation: 'macerato',
    materials: ['Ortica fresca', 'Acqua'],
    ratio: '1:10',
    preparationTime: 7,
    storage: 'Conservare in luogo fresco e buio. Usare entro 1 mese.',
    dosage: 'Diluizione 1:10 (preventivo) o 1:5 (curativo)',
    application: 'Fogliare, al tramonto',
    target: ['Afidi', 'Ragnetto rosso'],
    notes: 'Fornisce anche azoto fogliare. Attenzione all\'odore.',
  },
  aglio: {
    type: 'aglio',
    name: 'Macerato di Aglio',
    preparation: 'macerato',
    materials: ['Aglio', 'Acqua'],
    ratio: '1:10',
    preparationTime: 3,
    storage: 'Conservare in luogo fresco. Usare entro 2 settimane.',
    dosage: 'Diluizione 1:10',
    application: 'Fogliare, al tramonto',
    target: ['Fungicida leggero', 'Repellente insetti'],
    notes: 'Efficace contro oidio e batteriosi leggere.',
  },
  equiseto: {
    type: 'equiseto',
    name: 'Decotto di Equiseto',
    preparation: 'decotto',
    materials: ['Equiseto fresco o secco', 'Acqua'],
    ratio: '1:5',
    preparationTime: 1, // Bollitura
    storage: 'Usare fresco, entro 24h',
    dosage: 'Diluizione 1:5',
    application: 'Fogliare, al mattino',
    target: ['Oidio', 'Peronospora'],
    notes: 'Ricco di silicio. Rafforza pareti cellulari piante.',
  },
  tanaceto: {
    type: 'tanaceto',
    name: 'Infuso di Tanaceto',
    preparation: 'infuso',
    materials: ['Tanaceto fresco', 'Acqua bollente'],
    ratio: '1:10',
    preparationTime: 1, // Infusione
    storage: 'Usare fresco, entro 48h',
    dosage: 'Diluizione 1:10',
    application: 'Fogliare, al tramonto',
    target: ['Repellente insetti', 'Afidi'],
    notes: 'Repellente naturale. Non tossico per insetti utili.',
  },
  consolida: {
    type: 'consolida',
    name: 'Macerato di Consolida',
    preparation: 'macerato',
    materials: ['Consolida fresca', 'Acqua'],
    ratio: '1:10',
    preparationTime: 14,
    storage: 'Conservare in luogo fresco. Usare entro 1 mese.',
    dosage: 'Diluizione 1:10',
    application: 'Fogliare o radicale',
    target: ['Fertilizzante fogliare', 'Ricco di potassio'],
    notes: 'Fertilizzante naturale ricco di potassio e microelementi.',
  },
};

/**
 * Ottiene ricetta macerato
 */
export function getMacerateRecipe(type: MacerateType): MacerateRecipe {
  return macerateRecipes[type];
}

/**
 * Calcola tempo preparazione
 */
export function calculatePreparationTime(
  type: MacerateType,
  conditions?: { temperature?: number; aeration?: boolean }
): number {
  const recipe = macerateRecipes[type];
  let time = recipe.preparationTime;

  // Aggiusta per temperatura
  if (conditions?.temperature) {
    if (conditions.temperature > 25) {
      time *= 0.8; // Più veloce se caldo
    } else if (conditions.temperature < 15) {
      time *= 1.2; // Più lento se freddo
    }
  }

  return Math.round(time);
}

/**
 * Dosaggio e modalità applicazione
 */
export function getDosageAndApplication(
  type: MacerateType,
  plant: string
): { dosage: string; application: string; frequency: string } {
  const recipe = macerateRecipes[type];
  return {
    dosage: recipe.dosage,
    application: recipe.application,
    frequency: recipe.preparation === 'macerato' ? 'Ogni 7-10 giorni' : 'Al bisogno',
  };
}

/**
 * Istruzioni conservazione
 */
export function getStorageInstructions(type: MacerateType): string {
  return macerateRecipes[type].storage;
}

/**
 * Traccia produzione macerato
 */
export async function trackMacerateProduction(
  gardenId: string,
  macerateLog: Omit<MacerateLog, 'id' | 'createdAt'>
): Promise<MacerateLog> {
  // TODO: Implementare salvataggio in Supabase
  const storageKey = `macerate_logs_${gardenId}`;
  const stored = localStorage.getItem(storageKey);
  const logs: MacerateLog[] = stored ? JSON.parse(stored) : [];

  const newLog: MacerateLog = {
    id: `macerate_${Date.now()}`,
    ...macerateLog,
    createdAt: new Date(),
  };

  logs.push(newLog);
  localStorage.setItem(storageKey, JSON.stringify(logs));

  return newLog;
}

