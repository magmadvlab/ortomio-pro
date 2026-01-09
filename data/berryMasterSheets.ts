import { FruitTreeCrop } from '../types/fruitTree';
import { NutrientCategory } from '../types';

/**
 * Master Sheets per frutti di bosco (mora, mirtillo, ribes, uva spina)
 * Pro Feature
 */

export const berryMasterSheets: FruitTreeCrop[] = [
  // MORA
  {
    id: 'mora',
    commonName: 'MORA',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Rubus fruticosus L.',
    family: 'Rosaceae',
    treeType: 'Berry',
    rootstock: 'Franco',
    maturityYears: 2,
    pruningSeasons: ['Winter', 'Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 7,
      endMonth: 9
    },
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: { min: 20, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o fine inverno',
      minTemp: 5,
      spacing: '2-3m tra le piante',
      holeDepth: 40,
      holeWidth: 40,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'La mora è un arbusto rampicante che produce more dolci. Richiede supporti e potatura attenta.',
      commonMistakes: [
        'Non supportare - necessari supporti robusti',
        'Non potare - necessaria potatura per mantenere forma e produzione',
        'Gestione malattie inadeguata - sensibile a oidio'
      ],
      harvestGuide: 'Raccogli quando le more sono nere e leggermente morbide (luglio-settembre).'
    },
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  
  // MIRTILLO
  {
    id: 'mirtillo',
    commonName: 'MIRTILLO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Vaccinium myrtillus L.',
    family: 'Ericaceae',
    treeType: 'Berry',
    rootstock: 'Franco',
    maturityYears: 3,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 7,
      endMonth: 8
    },
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: { min: 20, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      watering: 'Irrigazione regolare',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o fine inverno',
      minTemp: 5,
      spacing: '1.5-2m tra le piante',
      holeDepth: 40,
      holeWidth: 40,
      soilRequirements: 'Terreno acido, ben drenato, ricco di sostanza organica, pH 4.5-5.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il mirtillo è un arbusto che produce mirtilli dolci. Richiede terreno acido e gestione attenta.',
      commonMistakes: [
        'Terreno non acido - preferisce terreno acido',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - sensibile a oidio'
      ],
      harvestGuide: 'Raccogli quando i mirtilli sono blu e leggermente morbidi (luglio-agosto).'
    },
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  
  // RIBES ROSSO
  {
    id: 'ribes-rosso',
    commonName: 'RIBES ROSSO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Ribes rubrum L.',
    family: 'Grossulariaceae',
    treeType: 'Berry',
    rootstock: 'Franco',
    maturityYears: 2,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 6,
      endMonth: 7
    },
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: { min: 20, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      watering: 'Irrigazione regolare',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o fine inverno',
      minTemp: 5,
      spacing: '1.5-2m tra le piante',
      holeDepth: 40,
      holeWidth: 40,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il ribes rosso è un arbusto che produce ribes acidi. Facile da coltivare, richiede potatura attenta.',
      commonMistakes: [
        'Non potare - necessaria potatura per mantenere forma e produzione',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - sensibile a oidio'
      ],
      harvestGuide: 'Raccogli quando i ribes sono rossi e leggermente morbidi (giugno-luglio).'
    },
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  
  // RIBES NERO
  {
    id: 'ribes-nero',
    commonName: 'RIBES NERO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Ribes nigrum L.',
    family: 'Grossulariaceae',
    treeType: 'Berry',
    rootstock: 'Franco',
    maturityYears: 2,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 7,
      endMonth: 8
    },
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: { min: 20, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      watering: 'Irrigazione regolare',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o fine inverno',
      minTemp: 5,
      spacing: '1.5-2m tra le piante',
      holeDepth: 40,
      holeWidth: 40,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il ribes nero è un arbusto che produce ribes neri aromatici. Facile da coltivare, richiede potatura attenta.',
      commonMistakes: [
        'Non potare - necessaria potatura per mantenere forma e produzione',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - sensibile a oidio'
      ],
      harvestGuide: 'Raccogli quando i ribes sono neri e leggermente morbidi (luglio-agosto).'
    },
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  
  // UVA SPINA
  {
    id: 'uva-spina',
    commonName: 'UVA SPINA',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Ribes uva-crispa L.',
    family: 'Grossulariaceae',
    treeType: 'Berry',
    rootstock: 'Franco',
    maturityYears: 2,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 6,
      endMonth: 7
    },
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: { min: 20, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      watering: 'Irrigazione regolare',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o fine inverno',
      minTemp: 5,
      spacing: '1.5-2m tra le piante',
      holeDepth: 40,
      holeWidth: 40,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'L\'uva spina è un arbusto spinoso che produce uva spina dolci. Facile da coltivare, richiede potatura attenta.',
      commonMistakes: [
        'Non potare - necessaria potatura per mantenere forma e produzione',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - sensibile a oidio'
      ],
      harvestGuide: 'Raccogli quando l\'uva spina è colorata e leggermente morbida (giugno-luglio). Attenzione alle spine durante la raccolta.'
    },
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM'
    }
  }
];

/**
 * Ottiene tutte le schede master dei frutti di bosco
 */
export function getAllBerryMasterSheets(): FruitTreeCrop[] {
  return berryMasterSheets;
}

/**
 * Ottiene una scheda master per ID
 */
export function getBerryMasterSheetById(id: string): FruitTreeCrop | undefined {
  return berryMasterSheets.find(p => p.id === id);
}

