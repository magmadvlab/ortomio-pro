import { PlantMasterSheet, Garden } from '../types';

export type WasteDisposalType = 'Compost' | 'DryWaste' | 'ShreddedCompost';

export interface WasteDisposalAdvice {
  disposalType: WasteDisposalType;
  reason: string;
  instructions: string[];
  canCompost: boolean;
}

/**
 * Determina la destinazione degli scarti di una pianta
 * Basato su stato di salute, presenza di semi, tipo di materiale
 */
export const determineWasteDisposal = (
  plant: PlantMasterSheet,
  healthStatus: 'Healthy' | 'Diseased' | 'Unknown' = 'Unknown',
  hasSeeds: boolean = false,
  isWoody: boolean = false
): WasteDisposalAdvice => {
  // Piante malate → Rifiuto secco (patogeni sopravvivono nel compost)
  if (healthStatus === 'Diseased') {
    return {
      disposalType: 'DryWaste',
      reason: 'Pianta malata: i patogeni sopravviverebbero nel compost e potrebbero infettare altre piante',
      instructions: [
        'Rimuovi la pianta intera',
        'Non compostare: metti nel rifiuto secco',
        'Pulisci gli attrezzi usati con alcool o candeggina',
        'Evita di piantare la stessa specie nello stesso punto per 2-3 anni'
      ],
      canCompost: false
    };
  }

  // Piante con semi → Rifiuto secco (germineranno come erbacce)
  if (hasSeeds) {
    return {
      disposalType: 'DryWaste',
      reason: 'Pianta con semi: i semi germinerebbero nel compost come erbacce',
      instructions: [
        'Rimuovi la pianta prima che produca semi',
        'Se ha già semi, metti nel rifiuto secco',
        'Se non ha semi, puoi compostare solo le parti verdi'
      ],
      canCompost: false
    };
  }

  // Steli legnosi → Sminuzzare prima di compostare
  if (isWoody) {
    return {
      disposalType: 'ShreddedCompost',
      reason: 'Materiale legnoso: richiede sminuzzamento per decomporre velocemente',
      instructions: [
        'Sminuzza gli steli legnosi con cesoie o trituratore',
        'Aggiungi al compost in strati alternati con materiale verde',
        'Accelera la decomposizione e migliora la struttura del compost'
      ],
      canCompost: true
    };
  }

  // Piante sane → Compostiera
  return {
    disposalType: 'Compost',
    reason: 'Pianta sana: ottima sostanza organica per il compost',
    instructions: [
      'Rimuovi la pianta quando il ciclo è completo',
      'Taglia in pezzi più piccoli se molto grande',
      'Aggiungi al compost in strati alternati con materiale secco (foglie, paglia)',
      'Mantieni umidità e gira periodicamente per accelerare decomposizione'
    ],
    canCompost: true
  };
};

/**
 * Suggerisce aggiunta di humus quando si prepara una nuova aiuola
 */
export const suggestHumusAddition = (
  garden: Garden,
  compostMaturityMonths: number = 0
): { shouldAdd: boolean; suggestion: string; benefit: string } | null => {
  if (!garden.hasCompostBin) {
    return null; // Nessuna compostiera, nessun suggerimento
  }

  if (compostMaturityMonths < 6) {
    return null; // Compost non ancora maturo
  }

  const soilType = garden.soilType || 'Loamy';
  
  let benefit = '';
  if (soilType === 'Sandy') {
    benefit = 'Migliorerà la ritenzione idrica del terreno sabbioso';
  } else if (soilType === 'Clay') {
    benefit = 'Migliorerà il drenaggio del terreno argilloso';
  } else {
    benefit = 'Migliorerà la struttura e la fertilità del terreno';
  }

  return {
    shouldAdd: true,
    suggestion: `Aggiungi 3-4 manciate di humus maturo nella buca prima del trapianto`,
    benefit
  };
};

/**
 * Calcola se il compost è maturo (6+ mesi)
 */
export const isCompostMature = (compostStartDate: Date): boolean => {
  const monthsElapsed = (Date.now() - compostStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  return monthsElapsed >= 6;
};

