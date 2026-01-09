import { OliveCrop } from '../types/olive';
import { NutrientCategory } from '../types';

/**
 * Master Sheets per varietà di olivo italiane
 * Pro Feature
 */

export const oliveMasterSheets: OliveCrop[] = [
  {
    id: 'olivo-frantoio',
    commonName: 'OLIVO FRANTOIO',
    cropType: 'Olive',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Olea europaea',
    family: 'Oleaceae',
    varietyType: 'Oil',
    treeAge: 0, // Da impostare al momento dell'impianto
    treeDensity: 300, // Piante/ettaro (impianto tradizionale)
    harvestMethod: 'Manual',
    harvestWindow: {
      startMonth: 10, // Ottobre
      endMonth: 12    // Dicembre
    },
    oilYieldExpected: 18, // kg olio/100kg olive
    millingType: 'Traditional',
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 2,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 30, max: 60 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile (albero)',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione moderata i primi anni',
      temperature: 'Mediterraneo'
    },
    transplanting: {
      when: 'Autunno o primavera (albero in zolla)',
      minTemp: 5,
      spacing: '6-8m tra gli alberi (tradizionale)',
      holeDepth: 80,
      holeWidth: 80,
      soilRequirements: 'Terreno ben drenato, anche povero, pH 6.0-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Frantoio è la varietà più diffusa in Italia per produzione olio. Resa elevata e qualità eccellente.',
      commonMistakes: [
        'Raccolta troppo tardiva (olio acido)',
        'Frangitura oltre 48h dalla raccolta',
        'Potatura eccessiva che riduce produzione'
      ],
      harvestGuide: 'Raccogli quando le olive sono invaiate (50-70% nere). Frangile entro 24-48h per olio extravergine di qualità.'
    },
    susceptibility: {
      fungalDiseases: ['Occhio di pavone', 'Rogna'],
      pests: ['Mosca dell\'olivo', 'Cocciniglia'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'olivo-leccino',
    commonName: 'OLIVO LECCINO',
    cropType: 'Olive',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Olea europaea',
    family: 'Oleaceae',
    varietyType: 'Oil',
    treeAge: 0,
    treeDensity: 300,
    harvestMethod: 'Mechanical',
    harvestWindow: {
      startMonth: 10,
      endMonth: 12
    },
    oilYieldExpected: 16,
    millingType: 'Continuous',
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 2,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 30, max: 60 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione moderata',
      temperature: 'Mediterraneo'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: 5,
      spacing: '6-8m tra gli alberi',
      holeDepth: 80,
      holeWidth: 80,
      soilRequirements: 'Terreno ben drenato, anche povero, pH 6.0-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Leccino è una varietà rustica e resistente, ideale per impianti meccanizzati. Olio di buona qualità.',
      commonMistakes: [
        'Raccolta troppo precoce (olio amaro)',
        'Gestione mosca dell\'olivo inadeguata',
        'Potatura insufficiente'
      ],
      harvestGuide: 'Raccogli quando le olive sono invaiate. Adatta a raccolta meccanica. Frangitura entro 48h.'
    },
    susceptibility: {
      fungalDiseases: ['Occhio di pavone'],
      pests: ['Mosca dell\'olivo'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  {
    id: 'olivo-moraiolo',
    commonName: 'OLIVO MORAIOLO',
    cropType: 'Olive',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Olea europaea',
    family: 'Oleaceae',
    varietyType: 'Oil',
    treeAge: 0,
    treeDensity: 400,
    harvestMethod: 'Manual',
    harvestWindow: {
      startMonth: 11,
      endMonth: 12
    },
    oilYieldExpected: 20,
    millingType: 'Traditional',
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 2,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 30, max: 60 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione moderata',
      temperature: 'Mediterraneo'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: 5,
      spacing: '5-6m tra gli alberi',
      holeDepth: 80,
      holeWidth: 80,
      soilRequirements: 'Terreno ben drenato, anche povero, pH 6.0-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Moraiolo è una varietà toscana molto pregiata, con olio fruttato e piccante. Resa elevata.',
      commonMistakes: [
        'Raccolta troppo tardiva',
        'Frangitura oltre 48h',
        'Gestione malattie inadeguata'
      ],
      harvestGuide: 'Raccogli quando le olive sono invaiate (novembre). Olio di qualità eccellente, fruttato intenso.'
    },
    susceptibility: {
      fungalDiseases: ['Occhio di pavone', 'Rogna'],
      pests: ['Mosca dell\'olivo'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'olivo-pendolino',
    commonName: 'OLIVO PENDOLINO',
    cropType: 'Olive',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Olea europaea',
    family: 'Oleaceae',
    varietyType: 'Dual-purpose',
    treeAge: 0,
    treeDensity: 300,
    harvestMethod: 'Manual',
    harvestWindow: {
      startMonth: 10,
      endMonth: 11
    },
    oilYieldExpected: 15,
    millingType: 'Traditional',
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 2,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 30, max: 60 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione moderata',
      temperature: 'Mediterraneo'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: 5,
      spacing: '6-8m tra gli alberi',
      holeDepth: 80,
      holeWidth: 80,
      soilRequirements: 'Terreno ben drenato, anche povero, pH 6.0-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Pendolino è una varietà impollinatrice e da olio. Usata spesso come impollinatore per altre varietà.',
      commonMistakes: [
        'Raccolta troppo precoce',
        'Non utilizzare come impollinatore',
        'Gestione inadeguata'
      ],
      harvestGuide: 'Raccogli quando le olive sono invaiate. Può essere consumata anche come oliva da tavola.'
    },
    susceptibility: {
      fungalDiseases: ['Occhio di pavone'],
      pests: ['Mosca dell\'olivo'],
      preventiveStrategy: 'MEDIUM'
    }
  }
];

