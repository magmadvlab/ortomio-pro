/**
 * Mapping Coltura → Lavorazioni Meccaniche
 * Definisce quali lavorazioni sono applicabili a ciascuna coltura
 * con metadati completi (timing, attrezzatura, priorità, ecc.)
 */

import { MechanicalWorkType, MechanicalEquipmentType } from '../types';

export interface CropMechanicalWorkConfig {
  cropId: string;
  cropName: string;
  works: {
    workType: MechanicalWorkType;
    category: 'Soil' | 'Canopy' | 'General';
    priority: number; // 0-10, più alto = più importante
    timing: {
      months?: number[]; // 1-12
      phenologicalPhase?: string; // 'Vegetative', 'Flowering', 'Fruiting', ecc.
      daysAfterSowing?: number;
    };
    equipmentSuggested: MechanicalEquipmentType[];
    critical: boolean; // Se è essenziale per quella coltura
    frequency?: string; // "Ogni 7-10 giorni", "Una volta", ecc.
    description: string;
  }[];
}

export const cropMechanicalWorksConfig: CropMechanicalWorkConfig[] = [
  // POMODORO
  {
    cropId: 'pomodoro',
    cropName: 'POMODORO',
    works: [
      {
        workType: 'Suckering',
        category: 'Canopy',
        priority: 9,
        timing: { phenologicalPhase: 'Vegetative', daysAfterSowing: 30 },
        equipmentSuggested: ['Manual', 'ElectricPruner'],
        critical: true,
        frequency: 'Ogni 7-10 giorni',
        description: 'Rimozione femminelle (getti ascellari) per concentrare energia sui frutti'
      },
      {
        workType: 'Hoeing',
        category: 'Soil',
        priority: 7,
        timing: { phenologicalPhase: 'Vegetative' },
        equipmentSuggested: ['Manual', 'Rototiller'],
        critical: true,
        frequency: 'Ogni 2-3 settimane',
        description: 'Sarchiatura per controllo erbe infestanti tra le file'
      },
      {
        workType: 'Topping',
        category: 'General',
        priority: 5,
        timing: { months: [8, 9] }, // Agosto-Settembre
        equipmentSuggested: ['Manual', 'ElectricPruner'],
        critical: false,
        frequency: 'Una volta',
        description: 'Cimatura per concentrare maturazione frutti'
      }
    ]
  },

  // PATATA (se presente nel sistema)
  {
    cropId: 'patata',
    cropName: 'PATATA',
    works: [
      {
        workType: 'EarthingUp',
        category: 'Soil',
        priority: 10,
        timing: { phenologicalPhase: 'Vegetative', daysAfterSowing: 20 },
        equipmentSuggested: ['Tractor', 'Rototiller', 'Manual'],
        critical: true,
        frequency: '2-3 volte durante crescita',
        description: 'Rincalzatura per proteggere tuberi dalla luce e favorire sviluppo'
      },
      {
        workType: 'Hoeing',
        category: 'Soil',
        priority: 8,
        timing: { phenologicalPhase: 'Vegetative' },
        equipmentSuggested: ['Manual', 'Rototiller'],
        critical: true,
        frequency: 'Prima della rincalzatura',
        description: 'Sarchiatura per arieggiare terreno e controllare infestanti'
      }
    ]
  },

  // MAIS (se presente)
  {
    cropId: 'mais',
    cropName: 'MAIS',
    works: [
      {
        workType: 'EarthingUp',
        category: 'Soil',
        priority: 9,
        timing: { phenologicalPhase: 'Vegetative', daysAfterSowing: 30 },
        equipmentSuggested: ['Tractor', 'Rototiller'],
        critical: true,
        frequency: 'Una volta quando piante raggiungono 30-40cm',
        description: 'Rincalzatura per sostegno piante e protezione radici'
      },
      {
        workType: 'Hoeing',
        category: 'Soil',
        priority: 7,
        timing: { phenologicalPhase: 'Vegetative' },
        equipmentSuggested: ['Tractor', 'Rototiller'],
        critical: true,
        frequency: 'Prima della rincalzatura',
        description: 'Sarchiatura per controllo infestanti'
      }
    ]
  },

  // FAGIOLO
  {
    cropId: 'fagiolo',
    cropName: 'FAGIOLO',
    works: [
      {
        workType: 'Hoeing',
        category: 'Soil',
        priority: 7,
        timing: { phenologicalPhase: 'Vegetative' },
        equipmentSuggested: ['Manual', 'Rototiller'],
        critical: true,
        frequency: 'Ogni 2-3 settimane fino a fioritura',
        description: 'Sarchiatura per controllo erbe infestanti'
      }
    ]
  },

  // PISELLO
  {
    cropId: 'pisello',
    cropName: 'PISELLO',
    works: [
      {
        workType: 'Hoeing',
        category: 'Soil',
        priority: 6,
        timing: { phenologicalPhase: 'Vegetative' },
        equipmentSuggested: ['Manual'],
        critical: false,
        frequency: 'Quando necessario',
        description: 'Sarchiatura leggera per controllo infestanti'
      }
    ]
  },

  // VITE
  {
    cropId: 'vite-sangiovese', // Esempio, aggiungere altre varietà
    cropName: 'VITE',
    works: [
      {
        workType: 'WinterPruning',
        category: 'Canopy',
        priority: 10,
        timing: { months: [12, 1, 2] }, // Dicembre-Febbraio
        equipmentSuggested: ['Manual', 'ElectricPruner', 'PrePruner'],
        critical: true,
        frequency: 'Una volta all\'anno',
        description: 'Potatura secca (Guyot/Cordone) per definire carichi di gemme'
      },
      {
        workType: 'Suckering',
        category: 'Canopy',
        priority: 8,
        timing: { months: [5, 6, 7] }, // Maggio-Luglio
        equipmentSuggested: ['Manual', 'ElectricPruner'],
        critical: true,
        frequency: 'Ogni 2 settimane',
        description: 'Potatura verde / Scacchiatura: rimozione germogli inutili e succhioni'
      },
      {
        workType: 'Defoliation',
        category: 'Canopy',
        priority: 6,
        timing: { months: [7, 8] }, // Luglio-Agosto
        equipmentSuggested: ['Manual', 'Defoliator'],
        critical: false,
        frequency: 'Una volta',
        description: 'Defogliazione intorno ai grappoli per luce e sanità'
      },
      {
        workType: 'Tying',
        category: 'Canopy',
        priority: 7,
        timing: { phenologicalPhase: 'Vegetative' },
        equipmentSuggested: ['Manual', 'ElectricTier'],
        critical: true,
        frequency: 'Durante crescita',
        description: 'Legatura / Palizzamento: fissaggio tralci ai fili'
      }
    ]
  },

  // OLIVO
  {
    cropId: 'olivo',
    cropName: 'OLIVO',
    works: [
      {
        workType: 'MaintenancePruning',
        category: 'Canopy',
        priority: 9,
        timing: { months: [2, 3] }, // Febbraio-Marzo
        equipmentSuggested: ['Manual', 'ElectricPruner', 'TelescopicPruner'],
        critical: true,
        frequency: 'Una volta all\'anno',
        description: 'Potatura di produzione: rimozione legno esaurito e riequilibrio chioma'
      },
      {
        workType: 'RejuvenationPruning',
        category: 'Canopy',
        priority: 5,
        timing: { months: [2, 3] },
        equipmentSuggested: ['Manual', 'ElectricPruner'],
        critical: false,
        frequency: 'Ogni 5-10 anni',
        description: 'Potatura di ringiovanimento per piante vecchie o danneggiate'
      },
      {
        workType: 'OliveShredding',
        category: 'Canopy',
        priority: 6,
        timing: { months: [2, 3] },
        equipmentSuggested: ['Shredder', 'Tractor'],
        critical: false,
        frequency: 'Dopo potatura',
        description: 'Trinciatura residui potatura e inerbimento'
      }
    ]
  },

  // FRAGOLA
  {
    cropId: 'fragola-bosco', // Esempio
    cropName: 'FRAGOLA',
    works: [
      {
        workType: 'RunnerManagement',
        category: 'Canopy',
        priority: 8,
        timing: { months: [6, 7, 8] }, // Giugno-Agosto
        equipmentSuggested: ['Manual', 'ElectricPruner'],
        critical: true,
        frequency: 'Durante stagione',
        description: 'Gestione stoloni (runners): taglio o selezione per controllo densità'
      },
      {
        workType: 'StrawberryMulching',
        category: 'Soil',
        priority: 9,
        timing: { months: [4, 5] }, // Aprile-Maggio
        equipmentSuggested: ['Manual'],
        critical: true,
        frequency: 'Prima della fioritura',
        description: 'Pacciamatura ai filari con teli/paglia per frutti puliti'
      },
      {
        workType: 'StrawberryCleaning',
        category: 'Canopy',
        priority: 7,
        timing: { phenologicalPhase: 'Fruiting' },
        equipmentSuggested: ['Manual'],
        critical: true,
        frequency: 'Durante raccolta',
        description: 'Pulizia foglie secche/malate e frutti marci'
      }
    ]
  },

  // LAMPONE
  {
    cropId: 'lampone',
    cropName: 'LAMPONE',
    works: [
      {
        workType: 'CaneRemoval',
        category: 'Canopy',
        priority: 9,
        timing: { months: [8, 9] }, // Agosto-Settembre
        equipmentSuggested: ['Manual', 'ElectricPruner'],
        critical: true,
        frequency: 'Dopo raccolta',
        description: 'Potatura canne vecchie: taglio canne fruttificate alla base'
      },
      {
        workType: 'TipPruning',
        category: 'Canopy',
        priority: 6,
        timing: { months: [6, 7] }, // Giugno-Luglio
        equipmentSuggested: ['Manual', 'ElectricPruner'],
        critical: false,
        frequency: 'Quando necessario',
        description: 'Tip-Pruning / Cimatura: accorciamento apici per ramificazioni laterali'
      },
      {
        workType: 'RaspberryTying',
        category: 'Canopy',
        priority: 7,
        timing: { phenologicalPhase: 'Vegetative' },
        equipmentSuggested: ['Manual', 'ElectricTier'],
        critical: true,
        frequency: 'Durante crescita',
        description: 'Legatura a fili: fissaggio canne a fili o reti'
      }
    ]
  },

  // PICCOLI FRUTTI (generico)
  {
    cropId: 'piccoli-frutti',
    cropName: 'PICCOLI FRUTTI',
    works: [
      {
        workType: 'SuckerThinning',
        category: 'Canopy',
        priority: 7,
        timing: { months: [5, 6] }, // Maggio-Giugno
        equipmentSuggested: ['Manual', 'ElectricPruner'],
        critical: true,
        frequency: 'Una volta',
        description: 'Diradamento polloni: controllo numero di polloni per fila'
      }
    ]
  },

  // FRUTTA ESOTICA (generico)
  {
    cropId: 'frutta-esotica',
    cropName: 'FRUTTA ESOTICA',
    works: [
      {
        workType: 'FormativePruning',
        category: 'Canopy',
        priority: 8,
        timing: { months: [2, 3] }, // Febbraio-Marzo
        equipmentSuggested: ['Manual', 'ElectricPruner'],
        critical: true,
        frequency: 'Nei primi 3-4 anni',
        description: 'Potatura di formazione: forma bassa e aperta (mango, avocado, ecc.)'
      },
      {
        workType: 'MaintenancePruning',
        category: 'Canopy',
        priority: 7,
        timing: { months: [2, 3] },
        equipmentSuggested: ['Manual', 'ElectricPruner'],
        critical: true,
        frequency: 'Una volta all\'anno',
        description: 'Potatura di produzione: mantenimento dimensioni e rinnovo rami fruttiferi'
      },
      {
        workType: 'FruitBagging',
        category: 'Canopy',
        priority: 6,
        timing: { phenologicalPhase: 'Fruiting', daysAfterSowing: 60 },
        equipmentSuggested: ['Manual'],
        critical: false,
        frequency: 'Quando frutti sono piccoli',
        description: 'Insacchettamento frutti: protezione singola da insetti e scottature'
      },
      {
        workType: 'ExoticThinning',
        category: 'Canopy',
        priority: 7,
        timing: { phenologicalPhase: 'Fruiting' },
        equipmentSuggested: ['Manual'],
        critical: true,
        frequency: 'Quando necessario',
        description: 'Diradamento frutticini: riduzione carico eccessivo su rami'
      }
    ]
  }
];

/**
 * Ottiene le lavorazioni consigliate per una coltura specifica
 */
export function getMechanicalWorksForCrop(cropId: string): CropMechanicalWorkConfig['works'] {
  const config = cropMechanicalWorksConfig.find(c => c.cropId === cropId);
  return config?.works || [];
}

/**
 * Ottiene tutte le lavorazioni di una categoria specifica
 */
export function getWorksByCategory(category: 'Soil' | 'Canopy' | 'General'): CropMechanicalWorkConfig['works'] {
  return cropMechanicalWorksConfig.flatMap(config => 
    config.works.filter(work => work.category === category)
  );
}

/**
 * Verifica se una lavorazione è critica per una coltura
 */
export function isWorkCriticalForCrop(cropId: string, workType: MechanicalWorkType): boolean {
  const works = getMechanicalWorksForCrop(cropId);
  return works.some(work => work.workType === workType && work.critical);
}


