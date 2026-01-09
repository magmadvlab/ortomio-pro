import { VineCrop } from '../types/vine';
import { NutrientCategory } from '../types';

/**
 * Master Sheets per varietà di vite italiane
 * Pro Feature
 */

export const vineMasterSheets: VineCrop[] = [
  // VITI ROSSE
  {
    id: 'vite-sangiovese',
    commonName: 'VITE SANGIOVESE',
    cropType: 'Vine',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Vitis vinifera',
    family: 'Vitaceae',
    varietyType: 'Wine',
    trainingSystem: 'Guyot',
    rootstock: '1103P o SO4',
    plantingDensity: 5000, // Piante/ettaro
    harvestMethod: 'Manual',
    harvestWindow: {
      startMonth: 9, // Settembre
      endMonth: 10   // Ottobre
    },
    brixTarget: 22, // Gradi Brix per vendemmia
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 10, max: 20 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile (barbatella)',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione moderata i primi anni',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o primavera (barbatella)',
      minTemp: 5,
      spacing: '1.5-2m sulla fila, 2-2.5m tra le file',
      holeDepth: 40,
      holeWidth: 40,
      soilRequirements: 'Terreno ben drenato, anche calcareo, pH 6.5-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Sangiovese è il vitigno più diffuso in Italia, base di Chianti, Brunello, Nobile. Richiede gestione attenta.',
      commonMistakes: [
        'Vendemmia troppo precoce (vino acido)',
        'Non monitorare Brix',
        'Potatura inadeguata',
        'Gestione malattie fungine insufficiente'
      ],
      harvestGuide: 'Vendemmia quando Brix raggiunge 22-24°. Per vino rosso, inizia vinificazione entro 48h. Monitora maturazione settimanalmente.'
    },
    susceptibility: {
      fungalDiseases: ['Peronospora', 'Oidio', 'Botrite'],
      pests: ['Tignola', 'Cicadelle'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'vite-nebbiolo',
    commonName: 'VITE NEBBIOLO',
    cropType: 'Vine',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Vitis vinifera',
    family: 'Vitaceae',
    varietyType: 'Wine',
    trainingSystem: 'Guyot',
    rootstock: '1103P o Kober 5BB',
    plantingDensity: 4500,
    harvestMethod: 'Manual',
    harvestWindow: {
      startMonth: 10,
      endMonth: 11
    },
    brixTarget: 24,
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 10, max: 20 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione moderata',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: 5,
      spacing: '1.5-2m sulla fila, 2-2.5m tra le file',
      holeDepth: 40,
      holeWidth: 40,
      soilRequirements: 'Terreno ben drenato, anche calcareo, pH 6.5-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Nebbiolo è il vitigno del Barolo e Barbaresco. Maturazione tardiva, richiede esposizione ottimale e gestione attenta.',
      commonMistakes: [
        'Vendemmia troppo precoce',
        'Esposizione inadeguata',
        'Gestione malattie insufficiente',
        'Non monitorare Brix settimanalmente'
      ],
      harvestGuide: 'Vendemmia quando Brix raggiunge 24-26° (ottobre-novembre). Vino di grande struttura e longevità.'
    },
    susceptibility: {
      fungalDiseases: ['Peronospora', 'Oidio', 'Botrite'],
      pests: ['Tignola'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'vite-barbera',
    commonName: 'VITE BARBERA',
    cropType: 'Vine',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Vitis vinifera',
    family: 'Vitaceae',
    varietyType: 'Wine',
    trainingSystem: 'Guyot',
    rootstock: '1103P o SO4',
    plantingDensity: 5000,
    harvestMethod: 'Manual',
    harvestWindow: {
      startMonth: 9,
      endMonth: 10
    },
    brixTarget: 22,
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 10, max: 20 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione moderata',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: 5,
      spacing: '1.5-2m sulla fila, 2-2.5m tra le file',
      holeDepth: 40,
      holeWidth: 40,
      soilRequirements: 'Terreno ben drenato, anche calcareo, pH 6.5-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Barbera è un vitigno piemontese molto produttivo, con vino fruttato e acidità vivace. Adatto a diversi terreni.',
      commonMistakes: [
        'Vendemmia troppo tardiva (perde acidità)',
        'Gestione produzione eccessiva',
        'Non monitorare Brix'
      ],
      harvestGuide: 'Vendemmia quando Brix raggiunge 22-23° (settembre). Vino rosso fruttato, ideale per consumo giovane.'
    },
    susceptibility: {
      fungalDiseases: ['Peronospora', 'Oidio'],
      pests: ['Tignola'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  {
    id: 'vite-montepulciano',
    commonName: 'VITE MONTEPULCIANO',
    cropType: 'Vine',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Vitis vinifera',
    family: 'Vitaceae',
    varietyType: 'Wine',
    trainingSystem: 'Cordon',
    rootstock: '1103P o SO4',
    plantingDensity: 4500,
    harvestMethod: 'Manual',
    harvestWindow: {
      startMonth: 9,
      endMonth: 10
    },
    brixTarget: 23,
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 10, max: 20 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione moderata',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: 5,
      spacing: '1.5-2m sulla fila, 2-2.5m tra le file',
      holeDepth: 40,
      holeWidth: 40,
      soilRequirements: 'Terreno ben drenato, anche calcareo, pH 6.5-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Montepulciano è il vitigno dell\'Abruzzo, base di Montepulciano d\'Abruzzo. Produttivo e rustico.',
      commonMistakes: [
        'Vendemmia troppo precoce',
        'Gestione produzione eccessiva',
        'Non monitorare Brix'
      ],
      harvestGuide: 'Vendemmia quando Brix raggiunge 23-24° (settembre-ottobre). Vino rosso corposo e strutturato.'
    },
    susceptibility: {
      fungalDiseases: ['Peronospora', 'Oidio'],
      pests: ['Tignola'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  // VITI BIANCHE
  {
    id: 'vite-trebbiano',
    commonName: 'VITE TREBBIANO',
    cropType: 'Vine',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Vitis vinifera',
    family: 'Vitaceae',
    varietyType: 'Wine',
    trainingSystem: 'Guyot',
    rootstock: '1103P o SO4',
    plantingDensity: 5000,
    harvestMethod: 'Manual',
    harvestWindow: {
      startMonth: 8,
      endMonth: 9
    },
    brixTarget: 20,
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 10, max: 20 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione moderata',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: 5,
      spacing: '1.5-2m sulla fila, 2-2.5m tra le file',
      holeDepth: 40,
      holeWidth: 40,
      soilRequirements: 'Terreno ben drenato, anche calcareo, pH 6.5-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Trebbiano è il vitigno bianco più diffuso in Italia. Molto produttivo, base di molti vini bianchi.',
      commonMistakes: [
        'Vendemmia troppo tardiva (perde acidità)',
        'Vinificazione oltre 24h (perde freschezza)',
        'Gestione produzione eccessiva'
      ],
      harvestGuide: 'Vendemmia quando Brix raggiunge 20-21° (agosto-settembre). Per vino bianco, inizia vinificazione ENTRO 24H dalla vendemmia.'
    },
    susceptibility: {
      fungalDiseases: ['Peronospora', 'Oidio', 'Botrite'],
      pests: ['Tignola'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'vite-chardonnay',
    commonName: 'VITE CHARDONNAY',
    cropType: 'Vine',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Vitis vinifera',
    family: 'Vitaceae',
    varietyType: 'Wine',
    trainingSystem: 'Guyot',
    rootstock: '1103P o SO4',
    plantingDensity: 5000,
    harvestMethod: 'Manual',
    harvestWindow: {
      startMonth: 8,
      endMonth: 9
    },
    brixTarget: 21,
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 10, max: 20 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione moderata',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: 5,
      spacing: '1.5-2m sulla fila, 2-2.5m tra le file',
      holeDepth: 40,
      holeWidth: 40,
      soilRequirements: 'Terreno ben drenato, anche calcareo, pH 6.5-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Chardonnay è un vitigno internazionale molto versatile. Produce vini bianchi eleganti, anche spumanti.',
      commonMistakes: [
        'Vendemmia troppo tardiva',
        'Vinificazione oltre 24h (perde aromi)',
        'Gestione Botrite insufficiente'
      ],
      harvestGuide: 'Vendemmia quando Brix raggiunge 21-22° (agosto-settembre). Per vino bianco, vinificazione ENTRO 24H. Monitora Botrite.'
    },
    susceptibility: {
      fungalDiseases: ['Peronospora', 'Oidio', 'Botrite'],
      pests: ['Tignola'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'vite-pinot-grigio',
    commonName: 'VITE PINOT GRIGIO',
    cropType: 'Vine',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Vitis vinifera',
    family: 'Vitaceae',
    varietyType: 'Wine',
    trainingSystem: 'Guyot',
    rootstock: '1103P o SO4',
    plantingDensity: 5000,
    harvestMethod: 'Manual',
    harvestWindow: {
      startMonth: 8,
      endMonth: 9
    },
    brixTarget: 20,
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 10, max: 20 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione moderata',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: 5,
      spacing: '1.5-2m sulla fila, 2-2.5m tra le file',
      holeDepth: 40,
      holeWidth: 40,
      soilRequirements: 'Terreno ben drenato, anche calcareo, pH 6.5-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Pinot Grigio è un vitigno molto diffuso in Italia, produce vini bianchi secchi e fruttati.',
      commonMistakes: [
        'Vendemmia troppo tardiva',
        'Vinificazione oltre 24h',
        'Gestione Botrite insufficiente'
      ],
      harvestGuide: 'Vendemmia quando Brix raggiunge 20-21° (agosto-settembre). Per vino bianco, vinificazione ENTRO 24H dalla vendemmia.'
    },
    susceptibility: {
      fungalDiseases: ['Peronospora', 'Oidio', 'Botrite'],
      pests: ['Tignola'],
      preventiveStrategy: 'HIGH'
    }
  }
];

