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
  },
  
  // COTOGNO
  {
    id: 'cotogno',
    commonName: 'COTOGNO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Cydonia oblonga Mill.',
    family: 'Rosaceae',
    treeType: 'Pome',
    rootstock: 'Franco o BA29',
    maturityYears: 3,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 9,
      endMonth: 10
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
      spacing: '4-5m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il cotogno è un albero da frutto rustico che produce frutti aromatici. I frutti non si mangiano crudi ma sono ottimi per marmellate e conserve.',
      commonMistakes: [
        'Raccogliere troppo presto - i frutti devono essere maturi',
        'Non potare - necessaria potatura per mantenere forma',
        'Terreno troppo umido - preferisce terreno ben drenato'
      ],
      harvestGuide: 'Raccogli quando i frutti sono gialli e profumati (settembre-ottobre). I frutti maturano dopo la raccolta.'
    },
    susceptibility: {
      fungalDiseases: ['Ticchiolatura'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  
  // NESPOLO DEL GIAPPONE
  {
    id: 'nespolo-del-giappone',
    commonName: 'NESPOLO DEL GIAPPONE',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Eriobotrya japonica (Thunb.) Lindl.',
    family: 'Rosaceae',
    treeType: 'Stone',
    rootstock: 'Franco',
    maturityYears: 3,
    pruningSeasons: ['Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 4,
      endMonth: 5
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
      spacing: '4-5m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il nespolo del Giappone è un albero sempreverde che produce frutti in primavera. Richiede clima mite e protezione dal gelo.',
      commonMistakes: [
        'Non proteggere dal gelo - sensibile al freddo',
        'Potatura invernale - potare dopo la raccolta',
        'Terreno troppo umido - preferisce terreno ben drenato'
      ],
      harvestGuide: 'Raccogli quando i frutti sono gialli e leggermente morbidi (aprile-maggio). I frutti maturano rapidamente.'
    },
    susceptibility: {
      fungalDiseases: ['Ticchiolatura'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  
  // NESPOLO COMUNE
  {
    id: 'nespolo-comune',
    commonName: 'NESPOLO COMUNE',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Mespilus germanica L.',
    family: 'Rosaceae',
    treeType: 'Pome',
    rootstock: 'Franco',
    maturityYears: 3,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 10,
      endMonth: 11
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
      spacing: '4-5m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il nespolo comune è un albero rustico che produce frutti dopo le prime gelate. I frutti devono essere lasciati maturare dopo la raccolta.',
      commonMistakes: [
        'Raccogliere troppo presto - i frutti devono essere lasciati maturare',
        'Non potare - necessaria potatura per mantenere forma',
        'Terreno troppo umido - preferisce terreno ben drenato'
      ],
      harvestGuide: 'Raccogli dopo le prime gelate (ottobre-novembre). I frutti maturano dopo la raccolta, diventando morbidi e dolci.'
    },
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW'
    }
  },
  
  // NETTARINO
  {
    id: 'nettarino',
    commonName: 'NETTARINO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Prunus persica var. nucipersica',
    family: 'Rosaceae',
    treeType: 'Stone',
    rootstock: 'GF677 o Montclar',
    maturityYears: 3,
    pruningSeasons: ['Winter', 'Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 6,
      endMonth: 9
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
      introduction: 'Il nettarino è una varietà di pesco con buccia liscia. Richiede potatura e gestione attenta per massima produzione.',
      commonMistakes: [
        'Non potare - necessaria potatura per mantenere forma e produzione',
        'Non diradare frutti - frutti piccoli e di scarsa qualità',
        'Gestione malattie inadeguata - sensibile a monilia e bolla'
      ],
      harvestGuide: 'Raccogli quando i frutti sono colorati e leggermente morbidi (giugno-settembre a seconda della varietà).'
    },
    susceptibility: {
      fungalDiseases: ['Monilia', 'Bolla del pesco'],
      pests: ['Afidi', 'Anarsia'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // ALBICOCCO
  {
    id: 'albicocco',
    commonName: 'ALBICOCCO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Prunus armeniaca L.',
    family: 'Rosaceae',
    treeType: 'Stone',
    rootstock: 'GF677 o Montclar',
    maturityYears: 3,
    pruningSeasons: ['Winter', 'Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 6,
      endMonth: 7
    },
    chillHours: 500,
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
      introduction: 'L\'albicocco è un albero da frutto che produce frutti dolci e saporiti. Richiede clima mite e protezione dalle gelate tardive.',
      commonMistakes: [
        'Non proteggere dalle gelate tardive - fiorisce presto',
        'Non potare - necessaria potatura per mantenere forma',
        'Gestione malattie inadeguata - sensibile a monilia'
      ],
      harvestGuide: 'Raccogli quando i frutti sono colorati e leggermente morbidi (giugno-luglio). I frutti maturano rapidamente.'
    },
    susceptibility: {
      fungalDiseases: ['Monilia', 'Coryneum'],
      pests: ['Afidi', 'Anarsia'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // SUSINO
  {
    id: 'susino',
    commonName: 'SUSINO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Prunus domestica L.',
    family: 'Rosaceae',
    treeType: 'Stone',
    rootstock: 'GF677 o Myrobalan',
    maturityYears: 3,
    pruningSeasons: ['Winter', 'Summer'],
    pollinationType: 'Partially-self-fertile',
    pollinatorVarieties: ['Stanley', 'Angeleno', 'Santa Rosa'],
    harvestWindow: {
      startMonth: 7,
      endMonth: 9
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
      introduction: 'Il susino è un albero da frutto che produce frutti dolci e saporiti. Alcune varietà richiedono impollinatori per massima produzione.',
      commonMistakes: [
        'Non piantare impollinatori - alcune varietà richiedono impollinatori',
        'Non potare - necessaria potatura per mantenere forma',
        'Gestione malattie inadeguata - sensibile a monilia'
      ],
      harvestGuide: 'Raccogli quando i frutti sono colorati e leggermente morbidi (luglio-settembre a seconda della varietà).'
    },
    susceptibility: {
      fungalDiseases: ['Monilia', 'Ruggine'],
      pests: ['Afidi', 'Anarsia'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // CILIEGIO ACIDO (AMARENA)
  {
    id: 'ciliegio-acido-amarena',
    commonName: 'CILIEGIO ACIDO (AMARENA)',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Prunus cerasus L.',
    family: 'Rosaceae',
    treeType: 'Stone',
    rootstock: 'Colt o Gisela 5',
    maturityYears: 3,
    pruningSeasons: ['Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 6,
      endMonth: 7
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
      spacing: '4-5m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il ciliegio acido (amarena) è un albero da frutto che produce frutti acidi e saporiti. Perfetto per conserve e marmellate.',
      commonMistakes: [
        'Potatura invernale - potare dopo la raccolta',
        'Gestione uccelli inadeguata - proteggere i frutti',
        'Gestione malattie inadeguata - sensibile a monilia'
      ],
      harvestGuide: 'Raccogli quando i frutti sono completamente colorati (giugno-luglio). I frutti sono acidi e perfetti per conserve.'
    },
    susceptibility: {
      fungalDiseases: ['Monilia', 'Cilindrosporiosi'],
      pests: ['Mosca della ciliegia', 'Afidi'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // MANDORLO
  {
    id: 'mandorlo',
    commonName: 'MANDORLO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Prunus dulcis (Mill.) D.A.Webb',
    family: 'Rosaceae',
    treeType: 'Nut',
    rootstock: 'Franco o GF677',
    maturityYears: 4,
    pruningSeasons: ['Winter', 'Summer'],
    pollinationType: 'Self-sterile',
    pollinatorVarieties: ['Tuono', 'Filippo Ceo', 'Genco'],
    harvestWindow: {
      startMonth: 8,
      endMonth: 9
    },
    chillHours: 300,
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
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il mandorlo è un albero da frutto che produce mandorle dolci. Richiede clima caldo e impollinatori obbligatori.',
      commonMistakes: [
        'Non piantare impollinatori - produzione zero senza impollinatori',
        'Non potare - necessaria potatura per mantenere forma',
        'Gestione malattie inadeguata - sensibile a monilia'
      ],
      harvestGuide: 'Raccogli quando i malli sono aperti e le mandorle sono secche (agosto-settembre). Essicca le mandorle prima di conservare.'
    },
    susceptibility: {
      fungalDiseases: ['Monilia', 'Coryneum'],
      pests: ['Afidi', 'Carpocapsa'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // NOCCIOLO
  {
    id: 'nocciolo',
    commonName: 'NOCCIOLO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Corylus avellana L.',
    family: 'Betulaceae',
    treeType: 'Nut',
    rootstock: 'Franco',
    maturityYears: 3,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-sterile',
    pollinatorVarieties: ['Tonda di Giffoni', 'Tonda Gentile', 'Mortarella'],
    harvestWindow: {
      startMonth: 8,
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
      spacing: '4-5m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il nocciolo è un arbusto da frutto che produce nocciole dolci. Richiede impollinatori obbligatori e gestione attenta.',
      commonMistakes: [
        'Non piantare impollinatori - produzione zero senza impollinatori',
        'Non potare - necessaria potatura per mantenere forma',
        'Gestione malattie inadeguata - sensibile a monilia'
      ],
      harvestGuide: 'Raccogli quando le nocciole cadono naturalmente o quando i ricci sono aperti (agosto-settembre). Essicca le nocciole prima di conservare.'
    },
    susceptibility: {
      fungalDiseases: ['Monilia'],
      pests: ['Afidi', 'Cimice'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  
  // NOCE
  {
    id: 'noce',
    commonName: 'NOCE',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Juglans regia L.',
    family: 'Juglandaceae',
    treeType: 'Nut',
    rootstock: 'Franco',
    maturityYears: 5,
    pruningSeasons: ['Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 9,
      endMonth: 10
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
      spacing: '8-10m tra gli alberi',
      holeDepth: 80,
      holeWidth: 80,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il noce è un albero da frutto maestoso che produce noci dolci. Richiede molto spazio e pazienza per la maturità.',
      commonMistakes: [
        'Non dare spazio sufficiente - il noce diventa molto grande',
        'Potatura invernale - potare in estate',
        'Gestione malattie inadeguata - sensibile a antracnosi'
      ],
      harvestGuide: 'Raccogli quando i malli sono aperti e le noci cadono naturalmente (settembre-ottobre). Essicca le noci prima di conservare.'
    },
    susceptibility: {
      fungalDiseases: ['Antracnosi'],
      pests: ['Afidi', 'Cimice'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  
  // CASTAGNO
  {
    id: 'castagno',
    commonName: 'CASTAGNO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Castanea sativa Mill.',
    family: 'Fagaceae',
    treeType: 'Nut',
    rootstock: 'Franco',
    maturityYears: 10,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-sterile',
    pollinatorVarieties: ['Marrone', 'Castagna comune'],
    harvestWindow: {
      startMonth: 9,
      endMonth: 10
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
      spacing: '10-12m tra gli alberi',
      holeDepth: 80,
      holeWidth: 80,
      soilRequirements: 'Terreno fertile, ben drenato, acido, pH 5.0-6.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il castagno è un albero maestoso che produce castagne dolci. Richiede molto spazio, terreno acido e pazienza per la maturità.',
      commonMistakes: [
        'Non dare spazio sufficiente - il castagno diventa molto grande',
        'Terreno non acido - preferisce terreno acido',
        'Non piantare impollinatori - produzione zero senza impollinatori'
      ],
      harvestGuide: 'Raccogli quando i ricci cadono naturalmente o quando sono aperti (settembre-ottobre). Essicca le castagne prima di conservare.'
    },
    susceptibility: {
      fungalDiseases: ['Cryphonectria'],
      pests: ['Cynips'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // PISTACCHIO
  {
    id: 'pistacchio',
    commonName: 'PISTACCHIO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Pistacia vera L.',
    family: 'Anacardiaceae',
    treeType: 'Nut',
    rootstock: 'Franco',
    maturityYears: 7,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-sterile',
    pollinatorVarieties: ['Maschio impollinatore'],
    harvestWindow: {
      startMonth: 8,
      endMonth: 9
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
      spacing: '6-8m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, calcareo, pH 7.0-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il pistacchio è un albero da frutto che produce pistacchi dolci. Richiede clima caldo, terreno calcareo e impollinatori maschili.',
      commonMistakes: [
        'Non piantare impollinatori maschili - produzione zero senza impollinatori',
        'Clima troppo freddo - richiede clima caldo',
        'Terreno non calcareo - preferisce terreno calcareo'
      ],
      harvestGuide: 'Raccogli quando i frutti sono maturi e il guscio si apre (agosto-settembre). Essicca i pistacchi prima di conservare.'
    },
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW'
    }
  },
  
  // FICO
  {
    id: 'fico',
    commonName: 'FICO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Ficus carica L.',
    family: 'Moraceae',
    treeType: 'Berry',
    rootstock: 'Franco',
    maturityYears: 2,
    pruningSeasons: ['Winter'],
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
      spacing: '5-6m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il fico è un albero da frutto rustico che produce fichi dolci. Facile da coltivare, richiede clima caldo e poca manutenzione.',
      commonMistakes: [
        'Clima troppo freddo - richiede clima caldo',
        'Non potare - necessaria potatura per mantenere forma',
        'Gestione malattie inadeguata - sensibile a ruggine'
      ],
      harvestGuide: 'Raccogli quando i fichi sono morbidi e dolci (luglio-settembre). I fichi maturano rapidamente.'
    },
    susceptibility: {
      fungalDiseases: ['Ruggine'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  
  // FICO D\'INDIA
  {
    id: 'fico-dindia',
    commonName: 'FICO D\'INDIA',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Opuntia ficus-indica (L.) Mill.',
    family: 'Cactaceae',
    treeType: 'Berry',
    rootstock: 'Franco',
    maturityYears: 2,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 8,
      endMonth: 10
    },
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: false
    },
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 20, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione limitata',
      temperature: 'Caldo'
    },
    transplanting: {
      when: 'Primavera o estate',
      minTemp: 10,
      spacing: '3-4m tra le piante',
      holeDepth: 30,
      holeWidth: 30,
      soilRequirements: 'Terreno ben drenato, anche povero, pH 6.0-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il fico d\'India è una pianta succulenta che produce fichi dolci. Richiede clima caldo e terreno ben drenato.',
      commonMistakes: [
        'Clima troppo freddo - richiede clima caldo',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Irrigazione eccessiva - resistente alla siccità'
      ],
      harvestGuide: 'Raccogli quando i fichi sono colorati e leggermente morbidi (agosto-ottobre). Attenzione alle spine durante la raccolta.'
    },
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW'
    }
  },
  
  // MELOGRANO
  {
    id: 'melograno',
    commonName: 'MELOGRANO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Punica granatum L.',
    family: 'Lythraceae',
    treeType: 'Berry',
    rootstock: 'Franco',
    maturityYears: 3,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 9,
      endMonth: 11
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
      spacing: '4-5m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il melograno è un arbusto da frutto che produce melagrane dolci. Facile da coltivare, richiede clima caldo e poca manutenzione.',
      commonMistakes: [
        'Clima troppo freddo - richiede clima caldo',
        'Non potare - necessaria potatura per mantenere forma',
        'Gestione malattie inadeguata - sensibile a monilia'
      ],
      harvestGuide: 'Raccogli quando i frutti sono colorati e leggermente morbidi (settembre-novembre). I frutti maturano dopo la raccolta.'
    },
    susceptibility: {
      fungalDiseases: ['Monilia'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  
  // CACHI
  {
    id: 'cachi',
    commonName: 'CACHI',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Diospyros kaki L.f.',
    family: 'Ebenaceae',
    treeType: 'Berry',
    rootstock: 'Franco',
    maturityYears: 4,
    pruningSeasons: ['Winter'],
    pollinationType: 'Partially-self-fertile',
    harvestWindow: {
      startMonth: 10,
      endMonth: 11
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
      spacing: '5-6m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il cachi è un albero da frutto che produce cachi dolci. Richiede clima mite e pazienza per la maturità.',
      commonMistakes: [
        'Clima troppo freddo - richiede clima mite',
        'Non potare - necessaria potatura per mantenere forma',
        'Raccolta troppo precoce - i frutti devono essere maturi'
      ],
      harvestGuide: 'Raccogli quando i frutti sono morbidi e dolci (ottobre-novembre). I frutti maturano dopo le prime gelate.'
    },
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW'
    }
  },
  
  // KIWI
  {
    id: 'kiwi',
    commonName: 'KIWI',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Actinidia deliciosa (A.Chev.) C.F.Liang & A.R.Ferguson',
    family: 'Actinidiaceae',
    treeType: 'Berry',
    rootstock: 'Franco',
    maturityYears: 3,
    pruningSeasons: ['Winter', 'Summer'],
    pollinationType: 'Self-sterile',
    pollinatorVarieties: ['Maschio impollinatore'],
    harvestWindow: {
      startMonth: 10,
      endMonth: 11
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
      spacing: '4-5m tra le piante',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il kiwi è una pianta rampicante che produce kiwi dolci. Richiede supporti, clima mite e impollinatori maschili.',
      commonMistakes: [
        'Non piantare impollinatori maschili - produzione zero senza impollinatori',
        'Non supportare - necessari supporti robusti',
        'Clima troppo freddo - richiede clima mite'
      ],
      harvestGuide: 'Raccogli quando i frutti sono maturi ma ancora duri (ottobre-novembre). I frutti maturano dopo la raccolta.'
    },
    susceptibility: {
      fungalDiseases: ['Botrite'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  
  // UVA DA TAVOLA
  {
    id: 'uva-da-tavola',
    commonName: 'UVA DA TAVOLA',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Vitis vinifera L.',
    family: 'Vitaceae',
    treeType: 'Berry',
    rootstock: 'Franco o portinnesti resistenti',
    maturityYears: 3,
    pruningSeasons: ['Winter', 'Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 7,
      endMonth: 10
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
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'L\'uva da tavola è una pianta rampicante che produce uva dolce. Richiede supporti, potatura e gestione attenta.',
      commonMistakes: [
        'Non supportare - necessari supporti robusti',
        'Non potare - necessaria potatura per mantenere forma e produzione',
        'Gestione malattie inadeguata - sensibile a peronospora e oidio'
      ],
      harvestGuide: 'Raccogli quando i grappoli sono maturi e dolci (luglio-ottobre a seconda della varietà).'
    },
    susceptibility: {
      fungalDiseases: ['Peronospora', 'Oidio'],
      pests: ['Afidi', 'Tignola'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // LIMONE
  {
    id: 'limone',
    commonName: 'LIMONE',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Citrus × limon (L.) Osbeck',
    family: 'Rutaceae',
    treeType: 'Citrus',
    rootstock: 'Arancio amaro o Citrange',
    maturityYears: 3,
    pruningSeasons: ['Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 1,
      endMonth: 12
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
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 20, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare',
      temperature: 'Caldo'
    },
    transplanting: {
      when: 'Primavera',
      minTemp: 10,
      spacing: '4-5m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il limone è un albero da frutto sempreverde che produce limoni tutto l\'anno. Richiede clima caldo e protezione dal gelo.',
      commonMistakes: [
        'Non proteggere dal gelo - sensibile al freddo',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - sensibile a mal secco'
      ],
      harvestGuide: 'Raccogli quando i limoni sono gialli e leggermente morbidi. I limoni possono essere raccolti tutto l\'anno.'
    },
    susceptibility: {
      fungalDiseases: ['Mal secco'],
      pests: ['Afidi', 'Cocciniglia'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // ARANCIO DOLCE
  {
    id: 'arancio-dolce',
    commonName: 'ARANCIO DOLCE',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Citrus × sinensis (L.) Osbeck',
    family: 'Rutaceae',
    treeType: 'Citrus',
    rootstock: 'Arancio amaro o Citrange',
    maturityYears: 3,
    pruningSeasons: ['Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 11,
      endMonth: 5
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
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 20, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare',
      temperature: 'Caldo'
    },
    transplanting: {
      when: 'Primavera',
      minTemp: 10,
      spacing: '5-6m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'L\'arancio dolce è un albero da frutto sempreverde che produce arance dolci. Richiede clima caldo e protezione dal gelo.',
      commonMistakes: [
        'Non proteggere dal gelo - sensibile al freddo',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - sensibile a mal secco'
      ],
      harvestGuide: 'Raccogli quando le arance sono arancioni e leggermente morbide (novembre-maggio a seconda della varietà).'
    },
    susceptibility: {
      fungalDiseases: ['Mal secco'],
      pests: ['Afidi', 'Cocciniglia'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // ARANCIO AMARO
  {
    id: 'arancio-amaro',
    commonName: 'ARANCIO AMARO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Citrus × aurantium L.',
    family: 'Rutaceae',
    treeType: 'Citrus',
    rootstock: 'Franco',
    maturityYears: 3,
    pruningSeasons: ['Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 11,
      endMonth: 3
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
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 20, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare',
      temperature: 'Caldo'
    },
    transplanting: {
      when: 'Primavera',
      minTemp: 10,
      spacing: '5-6m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'L\'arancio amaro è un albero da frutto sempreverde che produce arance amare. Usato principalmente come portinnesto o per marmellate.',
      commonMistakes: [
        'Non proteggere dal gelo - sensibile al freddo',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - sensibile a mal secco'
      ],
      harvestGuide: 'Raccogli quando le arance sono arancioni (novembre-marzo). Le arance amare sono usate principalmente per marmellate.'
    },
    susceptibility: {
      fungalDiseases: ['Mal secco'],
      pests: ['Afidi', 'Cocciniglia'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // MANDARINO
  {
    id: 'mandarino',
    commonName: 'MANDARINO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Citrus reticulata Blanco',
    family: 'Rutaceae',
    treeType: 'Citrus',
    rootstock: 'Arancio amaro o Citrange',
    maturityYears: 3,
    pruningSeasons: ['Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 11,
      endMonth: 3
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
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 20, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare',
      temperature: 'Caldo'
    },
    transplanting: {
      when: 'Primavera',
      minTemp: 10,
      spacing: '4-5m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il mandarino è un albero da frutto sempreverde che produce mandarini dolci. Richiede clima caldo e protezione dal gelo.',
      commonMistakes: [
        'Non proteggere dal gelo - sensibile al freddo',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - sensibile a mal secco'
      ],
      harvestGuide: 'Raccogli quando i mandarini sono arancioni e leggermente morbidi (novembre-marzo).'
    },
    susceptibility: {
      fungalDiseases: ['Mal secco'],
      pests: ['Afidi', 'Cocciniglia'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // CLEMENTINO
  {
    id: 'clementino',
    commonName: 'CLEMENTINO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Citrus × clementina hort. ex Tanaka',
    family: 'Rutaceae',
    treeType: 'Citrus',
    rootstock: 'Arancio amaro o Citrange',
    maturityYears: 3,
    pruningSeasons: ['Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 11,
      endMonth: 2
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
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 20, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare',
      temperature: 'Caldo'
    },
    transplanting: {
      when: 'Primavera',
      minTemp: 10,
      spacing: '4-5m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il clementino è un albero da frutto sempreverde che produce clementine dolci. Richiede clima caldo e protezione dal gelo.',
      commonMistakes: [
        'Non proteggere dal gelo - sensibile al freddo',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - sensibile a mal secco'
      ],
      harvestGuide: 'Raccogli quando le clementine sono arancioni e leggermente morbide (novembre-febbraio).'
    },
    susceptibility: {
      fungalDiseases: ['Mal secco'],
      pests: ['Afidi', 'Cocciniglia'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // BERGAMOTTO
  {
    id: 'bergamotto',
    commonName: 'BERGAMOTTO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Citrus × bergamia Risso & Poit.',
    family: 'Rutaceae',
    treeType: 'Citrus',
    rootstock: 'Arancio amaro o Citrange',
    maturityYears: 3,
    pruningSeasons: ['Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 11,
      endMonth: 2
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
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 20, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare',
      temperature: 'Caldo'
    },
    transplanting: {
      when: 'Primavera',
      minTemp: 10,
      spacing: '4-5m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il bergamotto è un albero da frutto sempreverde che produce bergamotti aromatici. Usato principalmente per essenze e profumi.',
      commonMistakes: [
        'Non proteggere dal gelo - sensibile al freddo',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - sensibile a mal secco'
      ],
      harvestGuide: 'Raccogli quando i bergamotti sono gialli e leggermente morbidi (novembre-febbraio). Usati principalmente per essenze.'
    },
    susceptibility: {
      fungalDiseases: ['Mal secco'],
      pests: ['Afidi', 'Cocciniglia'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // POMPELMO
  {
    id: 'pompelmo',
    commonName: 'POMPELMO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Citrus × paradisi Macfad.',
    family: 'Rutaceae',
    treeType: 'Citrus',
    rootstock: 'Arancio amaro o Citrange',
    maturityYears: 3,
    pruningSeasons: ['Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 11,
      endMonth: 5
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
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 20, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare',
      temperature: 'Caldo'
    },
    transplanting: {
      when: 'Primavera',
      minTemp: 10,
      spacing: '5-6m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il pompelmo è un albero da frutto sempreverde che produce pompelmi dolci. Richiede clima caldo e protezione dal gelo.',
      commonMistakes: [
        'Non proteggere dal gelo - sensibile al freddo',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - sensibile a mal secco'
      ],
      harvestGuide: 'Raccogli quando i pompelmi sono gialli e leggermente morbidi (novembre-maggio).'
    },
    susceptibility: {
      fungalDiseases: ['Mal secco'],
      pests: ['Afidi', 'Cocciniglia'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // CEDRO
  {
    id: 'cedro',
    commonName: 'CEDRO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Citrus medica L.',
    family: 'Rutaceae',
    treeType: 'Citrus',
    rootstock: 'Arancio amaro o Citrange',
    maturityYears: 3,
    pruningSeasons: ['Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 11,
      endMonth: 2
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
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 20, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare',
      temperature: 'Caldo'
    },
    transplanting: {
      when: 'Primavera',
      minTemp: 10,
      spacing: '4-5m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il cedro è un albero da frutto sempreverde che produce cedri aromatici. Usato principalmente per canditi e essenze.',
      commonMistakes: [
        'Non proteggere dal gelo - sensibile al freddo',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - sensibile a mal secco'
      ],
      harvestGuide: 'Raccogli quando i cedri sono gialli e leggermente morbidi (novembre-febbraio). Usati principalmente per canditi.'
    },
    susceptibility: {
      fungalDiseases: ['Mal secco'],
      pests: ['Afidi', 'Cocciniglia'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // LIME
  {
    id: 'lime',
    commonName: 'LIME',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Citrus × aurantiifolia (Christm.) Swingle',
    family: 'Rutaceae',
    treeType: 'Citrus',
    rootstock: 'Arancio amaro o Citrange',
    maturityYears: 3,
    pruningSeasons: ['Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 1,
      endMonth: 12
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
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 20, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare',
      temperature: 'Caldo'
    },
    transplanting: {
      when: 'Primavera',
      minTemp: 10,
      spacing: '4-5m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il lime è un albero da frutto sempreverde che produce lime acidi. Richiede clima caldo e protezione dal gelo.',
      commonMistakes: [
        'Non proteggere dal gelo - molto sensibile al freddo',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - sensibile a mal secco'
      ],
      harvestGuide: 'Raccogli quando i lime sono verdi e leggermente morbidi. I lime possono essere raccolti tutto l\'anno.'
    },
    susceptibility: {
      fungalDiseases: ['Mal secco'],
      pests: ['Afidi', 'Cocciniglia'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // KUMQUAT
  {
    id: 'kumquat',
    commonName: 'KUMQUAT',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Fortunella margarita (Lour.) Swingle',
    family: 'Rutaceae',
    treeType: 'Citrus',
    rootstock: 'Arancio amaro o Citrange',
    maturityYears: 3,
    pruningSeasons: ['Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 11,
      endMonth: 3
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
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 20, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare',
      temperature: 'Caldo'
    },
    transplanting: {
      when: 'Primavera',
      minTemp: 10,
      spacing: '3-4m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il kumquat è un albero da frutto sempreverde che produce kumquat dolci. Richiede clima caldo e protezione dal gelo.',
      commonMistakes: [
        'Non proteggere dal gelo - sensibile al freddo',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - sensibile a mal secco'
      ],
      harvestGuide: 'Raccogli quando i kumquat sono arancioni e leggermente morbidi (novembre-marzo).'
    },
    susceptibility: {
      fungalDiseases: ['Mal secco'],
      pests: ['Afidi', 'Cocciniglia'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // CHINOTTO
  {
    id: 'chinotto',
    commonName: 'CHINOTTO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Citrus × myrtifolia Raf.',
    family: 'Rutaceae',
    treeType: 'Citrus',
    rootstock: 'Arancio amaro o Citrange',
    maturityYears: 3,
    pruningSeasons: ['Summer'],
    pollinationType: 'Self-fertile',
    harvestWindow: {
      startMonth: 11,
      endMonth: 2
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
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 20, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'non applicabile',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare',
      temperature: 'Caldo'
    },
    transplanting: {
      when: 'Primavera',
      minTemp: 10,
      spacing: '3-4m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il chinotto è un albero da frutto sempreverde che produce chinotti amari. Usato principalmente per bevande e canditi.',
      commonMistakes: [
        'Non proteggere dal gelo - sensibile al freddo',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - sensibile a mal secco'
      ],
      harvestGuide: 'Raccogli quando i chinotti sono arancioni (novembre-febbraio). Usati principalmente per bevande e canditi.'
    },
    susceptibility: {
      fungalDiseases: ['Mal secco'],
      pests: ['Afidi', 'Cocciniglia'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // NUOVE VARIETÀ DI MELO
  {
    id: 'melo-gala',
    commonName: 'MELO GALA',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Malus domestica',
    family: 'Rosaceae',
    treeType: 'Pome',
    rootstock: 'M9 o M26',
    maturityYears: 3,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-sterile',
    pollinatorVarieties: ['Golden Delicious', 'Fuji', 'Granny Smith'],
    harvestWindow: {
      startMonth: 8,
      endMonth: 9
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
      introduction: 'Gala è una varietà precoce con frutti dolci e croccanti. Richiede impollinatori.',
      commonMistakes: [
        'Non piantare impollinatori',
        'Potatura eccessiva',
        'Non diradare frutti'
      ],
      harvestGuide: 'Raccogli quando i frutti sono gialli-rossi (agosto-settembre).'
    },
    susceptibility: {
      fungalDiseases: ['Ticchiolatura', 'Oidio'],
      pests: ['Afidi', 'Carpocapsa'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'melo-granny-smith',
    commonName: 'MELO GRANNY SMITH',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Malus domestica',
    family: 'Rosaceae',
    treeType: 'Pome',
    rootstock: 'M9 o M26',
    maturityYears: 3,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-sterile',
    pollinatorVarieties: ['Golden Delicious', 'Gala', 'Fuji'],
    harvestWindow: {
      startMonth: 10,
      endMonth: 11
    },
    chillHours: 400,
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
      introduction: 'Granny Smith è una varietà con frutti verdi acidi e croccanti. Ottima per cottura.',
      commonMistakes: [
        'Non piantare impollinatori',
        'Potatura eccessiva',
        'Non diradare frutti'
      ],
      harvestGuide: 'Raccogli quando i frutti sono verdi brillanti (ottobre-novembre).'
    },
    susceptibility: {
      fungalDiseases: ['Ticchiolatura', 'Oidio'],
      pests: ['Afidi', 'Carpocapsa'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'melo-red-delicious',
    commonName: 'MELO RED DELICIOUS',
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
      spacing: '3-4m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Red Delicious è una varietà con frutti rossi dolci. Richiede impollinatori.',
      commonMistakes: [
        'Non piantare impollinatori',
        'Potatura eccessiva',
        'Non diradare frutti'
      ],
      harvestGuide: 'Raccogli quando i frutti sono rossi brillanti (settembre-ottobre).'
    },
    susceptibility: {
      fungalDiseases: ['Ticchiolatura', 'Oidio'],
      pests: ['Afidi', 'Carpocapsa'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'melo-renetta',
    commonName: 'MELO RENETTA',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Malus domestica',
    family: 'Rosaceae',
    treeType: 'Pome',
    rootstock: 'M9 o M26',
    maturityYears: 4,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-sterile',
    pollinatorVarieties: ['Golden Delicious', 'Gala'],
    harvestWindow: {
      startMonth: 10,
      endMonth: 11
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
      spacing: '3-4m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Renetta è una varietà tradizionale con frutti gialli-verdi. Ottima per cottura e conservazione.',
      commonMistakes: [
        'Non piantare impollinatori',
        'Potatura eccessiva',
        'Non diradare frutti'
      ],
      harvestGuide: 'Raccogli quando i frutti sono gialli-verdi (ottobre-novembre).'
    },
    susceptibility: {
      fungalDiseases: ['Ticchiolatura', 'Oidio'],
      pests: ['Afidi', 'Carpocapsa'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // NUOVE VARIETÀ DI PERO
  {
    id: 'pero-abate-fetel',
    commonName: 'PERO ABATE FETEL',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Pyrus communis',
    family: 'Rosaceae',
    treeType: 'Pome',
    rootstock: 'BA29 o OHxF',
    maturityYears: 4,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-sterile',
    pollinatorVarieties: ['Williams', 'Conference', 'Kaiser'],
    harvestWindow: {
      startMonth: 9,
      endMonth: 10
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
      introduction: 'Abate Fetel è una varietà pregiata con pere allungate dolci. Richiede impollinatori.',
      commonMistakes: [
        'Non piantare impollinatori',
        'Potatura eccessiva',
        'Non diradare frutti'
      ],
      harvestGuide: 'Raccogli quando le pere sono gialle-verdi (settembre-ottobre).'
    },
    susceptibility: {
      fungalDiseases: ['Ticchiolatura', 'Oidio'],
      pests: ['Afidi', 'Carpocapsa'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'pero-williams',
    commonName: 'PERO WILLIAMS',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Pyrus communis',
    family: 'Rosaceae',
    treeType: 'Pome',
    rootstock: 'BA29 o OHxF',
    maturityYears: 3,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-sterile',
    pollinatorVarieties: ['Conference', 'Kaiser', 'Abate Fetel'],
    harvestWindow: {
      startMonth: 8,
      endMonth: 9
    },
    chillHours: 500,
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
      introduction: 'Williams è una varietà precoce con pere gialle dolci. Richiede impollinatori.',
      commonMistakes: [
        'Non piantare impollinatori',
        'Potatura eccessiva',
        'Non diradare frutti'
      ],
      harvestGuide: 'Raccogli quando le pere sono gialle (agosto-settembre).'
    },
    susceptibility: {
      fungalDiseases: ['Ticchiolatura', 'Oidio'],
      pests: ['Afidi', 'Carpocapsa'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'pero-conference',
    commonName: 'PERO CONFERENCE',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Pyrus communis',
    family: 'Rosaceae',
    treeType: 'Pome',
    rootstock: 'BA29 o OHxF',
    maturityYears: 3,
    pruningSeasons: ['Winter'],
    pollinationType: 'Partially-self-fertile',
    pollinatorVarieties: ['Williams', 'Kaiser'],
    harvestWindow: {
      startMonth: 9,
      endMonth: 10
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
      introduction: 'Conference è una varietà con pere allungate dolci. Parzialmente autofertile.',
      commonMistakes: [
        'Non piantare impollinatori per massima produzione',
        'Potatura eccessiva',
        'Non diradare frutti'
      ],
      harvestGuide: 'Raccogli quando le pere sono gialle-verdi (settembre-ottobre).'
    },
    susceptibility: {
      fungalDiseases: ['Ticchiolatura', 'Oidio'],
      pests: ['Afidi', 'Carpocapsa'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'pero-kaiser',
    commonName: 'PERO KAISER',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Pyrus communis',
    family: 'Rosaceae',
    treeType: 'Pome',
    rootstock: 'BA29 o OHxF',
    maturityYears: 4,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-sterile',
    pollinatorVarieties: ['Williams', 'Conference', 'Abate Fetel'],
    harvestWindow: {
      startMonth: 10,
      endMonth: 11
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
      spacing: '3-4m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Kaiser è una varietà tardiva con pere grandi dolci. Richiede impollinatori.',
      commonMistakes: [
        'Non piantare impollinatori',
        'Potatura eccessiva',
        'Non diradare frutti'
      ],
      harvestGuide: 'Raccogli quando le pere sono gialle-rosse (ottobre-novembre).'
    },
    susceptibility: {
      fungalDiseases: ['Ticchiolatura', 'Oidio'],
      pests: ['Afidi', 'Carpocapsa'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'pero-decana-del-comizio',
    commonName: 'PERO DECANA DEL COMIZIO',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Pyrus communis',
    family: 'Rosaceae',
    treeType: 'Pome',
    rootstock: 'BA29 o OHxF',
    maturityYears: 4,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-sterile',
    pollinatorVarieties: ['Williams', 'Conference', 'Kaiser'],
    harvestWindow: {
      startMonth: 10,
      endMonth: 11
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
      spacing: '3-4m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Decana del Comizio è una varietà tradizionale italiana con pere grandi dolci. Richiede impollinatori.',
      commonMistakes: [
        'Non piantare impollinatori',
        'Potatura eccessiva',
        'Non diradare frutti'
      ],
      harvestGuide: 'Raccogli quando le pere sono gialle-verdi (ottobre-novembre).'
    },
    susceptibility: {
      fungalDiseases: ['Ticchiolatura', 'Oidio'],
      pests: ['Afidi', 'Carpocapsa'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'pero-coscia',
    commonName: 'PERO COSCIA',
    cropType: 'FruitTree',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Pyrus communis',
    family: 'Rosaceae',
    treeType: 'Pome',
    rootstock: 'BA29 o OHxF',
    maturityYears: 3,
    pruningSeasons: ['Winter'],
    pollinationType: 'Self-sterile',
    pollinatorVarieties: ['Williams', 'Conference'],
    harvestWindow: {
      startMonth: 7,
      endMonth: 8
    },
    chillHours: 400,
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
      introduction: 'Coscia è una varietà precoce con pere piccole dolci. Richiede impollinatori.',
      commonMistakes: [
        'Non piantare impollinatori',
        'Potatura eccessiva',
        'Non diradare frutti'
      ],
      harvestGuide: 'Raccogli quando le pere sono gialle (luglio-agosto).'
    },
    susceptibility: {
      fungalDiseases: ['Ticchiolatura', 'Oidio'],
      pests: ['Afidi', 'Carpocapsa'],
      preventiveStrategy: 'HIGH'
    }
  }
];

