/**
 * Harvest Indicators Data
 * Indicatori di maturazione per diverse piante
 */

export interface HarvestIndicator {
  plantName: string;
  visualIndicators: string[];
  tactileIndicators: string[];
  instrumentalIndicators?: {
    brix?: number; // Grado zuccherino
    firmness?: number; // Penetrometro
  };
  optimalHarvestWindow: {
    daysFromPlanting: { min: number; max: number };
    daysFromFlowering?: { min: number; max: number };
  };
}

export const harvestIndicators: Record<string, HarvestIndicator> = {
  Pomodoro: {
    plantName: 'Pomodoro',
    visualIndicators: [
      'Colore uniforme e intenso',
      'Buccia lucida e tesa',
      'Peduncolo leggermente secco',
    ],
    tactileIndicators: ['Cedevolezza leggera', 'Distacco facile dal peduncolo'],
    instrumentalIndicators: { brix: 4.5 },
    optimalHarvestWindow: {
      daysFromPlanting: { min: 80, max: 120 },
      daysFromFlowering: { min: 45, max: 60 },
    },
  },
  Zucchina: {
    plantName: 'Zucchina',
    visualIndicators: ['Dimensione 15-20 cm', 'Colore brillante', 'Buccia liscia'],
    tactileIndicators: ['Ferma al tatto', 'Peduncolo resistente'],
    optimalHarvestWindow: {
      daysFromPlanting: { min: 50, max: 70 },
    },
  },
  Peperone: {
    plantName: 'Peperone',
    visualIndicators: ['Colore completo (rosso/giallo)', 'Buccia lucida', 'Dimensione piena'],
    tactileIndicators: ['Fermo ma non duro', 'Distacco facile'],
    optimalHarvestWindow: {
      daysFromPlanting: { min: 80, max: 100 },
      daysFromFlowering: { min: 60, max: 75 },
    },
  },
  Lattuga: {
    plantName: 'Lattuga',
    visualIndicators: ['Cuore formato', 'Foglie esterne ben sviluppate', 'Colore uniforme'],
    tactileIndicators: ['Cuore compatto', 'Foglie croccanti'],
    optimalHarvestWindow: {
      daysFromPlanting: { min: 40, max: 60 },
    },
  },
};

