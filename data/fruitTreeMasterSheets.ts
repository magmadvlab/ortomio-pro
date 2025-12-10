import { FruitTreeCrop } from '../types/fruitTree';
import { NutrientCategory } from '../types';

/**
 * Master Sheets per varietà di frutteti comuni in Italia
 * Pro Feature
 */

export const fruitTreeMasterSheets: FruitTreeCrop[] = [
  // MELO
  {
    id: 'melo-golden',
    commonName: 'MELO GOLDEN DELICIOUS',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Malus domestica',
    family: 'Rosaceae',
    treeType: 'Pome',
    rootstock: 'M9 o M26',
    maturityYears: 3,
    pruningSeasons: ['Winter', 'Summer'],
    pollinationType: 'Partially-self-fertile',
    pollinatorVarieties: ['Gala', 'Fuji', 'Granny Smith'],
    harvestWindow: {
      startMonth: 9, // Settembre
      endMonth: 10   // Ottobre
    },
    chillHours: 800,
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
      transplantWhen: 'non applicabile (albero)',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare i primi anni',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o fine inverno (albero in zolla)',
      minTemp: 5,
      spacing: '3-4m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Golden Delicious è una varietà molto produttiva, con frutti gialli dolci e croccanti. Richiede impollinatori per massima produzione.',
      commonMistakes: [
        'Non piantare impollinatori nelle vicinanze',
        'Potatura eccessiva che riduce produzione',
        'Non diradare frutti (frutti piccoli)'
      ],
      harvestGuide: 'Raccogli quando i frutti si staccano facilmente ruotandoli. Conserva in luogo fresco e asciutto.'
    },
    susceptibility: {
      fungalDiseases: ['Ticchiolatura', 'Oidio'],
      pests: ['Afidi', 'Carpocapsa'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'melo-fuji',
    commonName: 'MELO FUJI',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Malus domestica',
    family: 'Rosaceae',
    treeType: 'Pome',
    rootstock: 'M9 o M26',
    maturityYears: 3,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-sterile',
    pollinatorVarieties: ['Golden Delicious', 'Gala', 'Granny Smith'],
    harvestWindow: {
      startMonth: 10,
      endMonth: 11
    },
    chillHours: 600,
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
      spacing: '3-4m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Fuji è una varietà giapponese molto apprezzata, con frutti croccanti e dolci. Richiede impollinatori obbligatori.',
      commonMistakes: [
        'Non piantare impollinatori (produzione zero)',
        'Raccolta troppo precoce (frutti acidi)',
        'Conservazione inadeguata'
      ],
      harvestGuide: 'Raccogli tardi (ottobre-novembre) quando i frutti sono completamente maturi. Conserva a 0-2°C.'
    },
    susceptibility: {
      fungalDiseases: ['Ticchiolatura', 'Oidio'],
      pests: ['Afidi', 'Carpocapsa'],
      preventiveStrategy: 'HIGH'
    }
  },
  // PERO
  {
    id: 'pero-abate',
    commonName: 'PERO ABATE FETEL',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Pyrus communis',
    family: 'Rosaceae',
    treeType: 'Pome',
    rootstock: 'BA29 o M9',
    maturityYears: 4,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-sterile',
    pollinatorVarieties: ['Williams', 'Conference', 'Kaiser'],
    harvestWindow: {
      startMonth: 9,
      endMonth: 10
    },
    chillHours: 700,
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
      spacing: '4-5m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Abate Fetel è una pera molto pregiata, con frutti allungati e saporiti. Richiede impollinatori e gestione attenta.',
      commonMistakes: [
        'Non piantare impollinatori',
        'Potatura eccessiva',
        'Raccolta troppo precoce'
      ],
      harvestGuide: 'Raccogli quando i frutti si staccano facilmente. Maturazione avviene dopo la raccolta (conserva a temperatura ambiente).'
    },
    susceptibility: {
      fungalDiseases: ['Ticchiolatura', 'Ruggine'],
      pests: ['Psilla', 'Afidi'],
      preventiveStrategy: 'HIGH'
    }
  },
  // PESCO
  {
    id: 'pesco-gialla',
    commonName: 'PESCO PESCA GIALLA',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Prunus persica',
    family: 'Rosaceae',
    treeType: 'Stone',
    rootstock: 'GF677 o Montclar',
    maturityYears: 3,
    pruningSeasons: ['Winter', 'Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 6,
      endMonth: 8
    },
    chillHours: 600,
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
      spacing: '4-5m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Pesca gialla è una varietà molto produttiva, con frutti succosi e profumati. Autofeconda, non richiede impollinatori.',
      commonMistakes: [
        'Non diradare frutti (frutti piccoli)',
        'Potatura insufficiente',
        'Gestione malattie fungine inadeguata'
      ],
      harvestGuide: 'Raccogli quando i frutti sono leggermente morbidi al tatto e profumati. Consuma rapidamente o conserva in frigo.'
    },
    susceptibility: {
      fungalDiseases: ['Bolla del pesco', 'Monilia'],
      pests: ['Afidi', 'Carpocapsa'],
      preventiveStrategy: 'HIGH'
    }
  },
  // CILIEGIO
  {
    id: 'ciliegio-durone',
    commonName: 'CILIEGIO DURONE',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Prunus avium',
    family: 'Rosaceae',
    treeType: 'Stone',
    rootstock: 'Colt o Gisela 5',
    maturityYears: 5,
    pruningSeasons: ['Summer'],
    pollinationType: 'Self-sterile',
    pollinatorVarieties: ['Ferrovia', 'Bigarreau', 'Moreau'],
    harvestWindow: {
      startMonth: 5,
      endMonth: 6
    },
    chillHours: 800,
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
      spacing: '5-6m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Durone è una varietà di ciliegio molto apprezzata, con frutti grandi e croccanti. Richiede impollinatori obbligatori.',
      commonMistakes: [
        'Non piantare impollinatori (produzione zero)',
        'Potatura invernale (sanguina)',
        'Gestione uccelli inadeguata'
      ],
      harvestGuide: 'Raccogli quando le ciliegie sono completamente rosse e sode. Usa raccoglitore o scala per raggiungere i rami alti.'
    },
    susceptibility: {
      fungalDiseases: ['Monilia', 'Cilindrosporiosi'],
      pests: ['Mosca della ciliegia', 'Afidi'],
      preventiveStrategy: 'HIGH'
    }
  }
];

