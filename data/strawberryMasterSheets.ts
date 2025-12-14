import { StrawberryCrop } from '../types/strawberry';
import { NutrientCategory } from '../types';

/**
 * Master Sheets per varietà di fragole comuni in Italia
 * Pro Feature
 */

export const strawberryMasterSheets: StrawberryCrop[] = [
  {
    id: 'fragola-bosco',
    commonName: 'FRAGOLA DI BOSCO',
    cropType: 'Strawberry',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Fragaria vesca',
    family: 'Rosaceae',
    varietyType: 'June-bearing',
    plantingSystem: 'Matted Row',
    runnerManagement: {
      removeRunners: true,
      keepForPropagation: false
    },
    mulching: {
      material: 'Straw',
      thickness: 5
    },
    harvestWindow: {
      startMonth: 5, // Maggio
      endMonth: 6    // Giugno
    },
    renovationRequired: true,
    renovationMonth: 7, // Luglio
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: false
    },
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '18-22°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 14, max: 21 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 3-4 foglie',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      watering: 'Mantieni terreno umido ma non bagnato',
      temperature: '15-25°C'
    },
    transplanting: {
      when: 'Settembre-Ottobre o Marzo-Aprile',
      minTemp: 8,
      spacing: '30cm sulla fila, 60cm tra le file',
      holeDepth: 15,
      holeWidth: 15,
      soilRequirements: 'Terreno ricco, ben drenato, pH 5.5-6.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'La fragola di bosco è una varietà rustica e profumata, ideale per climi freschi. Produce frutti piccoli ma molto saporiti.',
      commonMistakes: [
        'Non rinnovare l\'impianto dopo la raccolta',
        'Lasciare stoloni che competono con la produzione',
        'Terreno troppo bagnato che causa marciumi'
      ],
      harvestGuide: 'Raccogli quando le fragole sono completamente rosse e profumate. Taglia il picciolo, non tirare.'
    },
    susceptibility: {
      fungalDiseases: ['Oidio', 'Botrite'],
      pests: ['Afidi', 'Ragnetto rosso'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  {
    id: 'fragola-elsanta',
    commonName: 'FRAGOLA ELSANTA',
    cropType: 'Strawberry',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Fragaria × ananassa',
    family: 'Rosaceae',
    varietyType: 'June-bearing',
    plantingSystem: 'Spaced Row',
    runnerManagement: {
      removeRunners: true,
      keepForPropagation: true
    },
    mulching: {
      material: 'Plastic',
      thickness: 0.02
    },
    harvestWindow: {
      startMonth: 5,
      endMonth: 6
    },
    renovationRequired: true,
    renovationMonth: 7,
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: false
    },
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '20-24°C',
      minTemp: 12,
      lightRequirement: 'Light',
      emergenceDays: { min: 10, max: 18 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 3-4 foglie',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare, evita ristagni',
      temperature: '18-25°C'
    },
    transplanting: {
      when: 'Agosto-Settembre per produzione primaverile',
      minTemp: 10,
      spacing: '35cm sulla fila, 70cm tra le file',
      holeDepth: 15,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-6.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Elsanta è una varietà commerciale molto produttiva, con frutti grandi e saporiti. Richiede gestione attenta degli stoloni.',
      commonMistakes: [
        'Non rimuovere stoloni durante la produzione',
        'Sovraffollamento che riduce dimensione frutti',
        'Concimazione eccessiva che favorisce foglie invece di frutti'
      ],
      harvestGuide: 'Raccogli quando le fragole sono rosse uniformemente. Frutti grandi e compatti, ideali per consumo fresco.'
    },
    susceptibility: {
      fungalDiseases: ['Oidio', 'Botrite', 'Verticillium'],
      pests: ['Afidi', 'Tripide'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'fragola-albion',
    commonName: 'FRAGOLA ALBION',
    cropType: 'Strawberry',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Fragaria × ananassa',
    family: 'Rosaceae',
    varietyType: 'Day-neutral',
    plantingSystem: 'Hill System',
    runnerManagement: {
      removeRunners: true,
      keepForPropagation: false
    },
    mulching: {
      material: 'Organic',
      thickness: 5
    },
    harvestWindow: {
      startMonth: 5,
      endMonth: 10  // Produzione estesa fino ad ottobre
    },
    renovationRequired: false,
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: false
    },
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '20-24°C',
      minTemp: 12,
      lightRequirement: 'Light',
      emergenceDays: { min: 10, max: 18 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 3-4 foglie',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione costante, evita stress idrico',
      temperature: '18-25°C'
    },
    transplanting: {
      when: 'Marzo-Aprile o Agosto-Settembre',
      minTemp: 10,
      spacing: '30cm sulla fila, 50cm tra le file',
      holeDepth: 15,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-6.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Albion è una varietà rifiorente (day-neutral) che produce frutti dalla primavera all\'autunno. Ideale per raccolte continue.',
      commonMistakes: [
        'Non rimuovere stoloni (riducono produzione continua)',
        'Stress idrico che interrompe la produzione',
        'Concimazione insufficiente per produzione estesa'
      ],
      harvestGuide: 'Raccogli regolarmente ogni 2-3 giorni per stimolare produzione continua. Frutti di media dimensione, molto saporiti.'
    },
    susceptibility: {
      fungalDiseases: ['Oidio', 'Botrite'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  {
    id: 'fragola-seascape',
    commonName: 'FRAGOLA SEASCAPE',
    cropType: 'Strawberry',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Fragaria × ananassa',
    family: 'Rosaceae',
    varietyType: 'Ever-bearing',
    plantingSystem: 'Spaced Row',
    runnerManagement: {
      removeRunners: true,
      keepForPropagation: true
    },
    mulching: {
      material: 'Straw',
      thickness: 5
    },
    harvestWindow: {
      startMonth: 5,
      endMonth: 9  // Produzione da maggio a settembre
    },
    renovationRequired: false,
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: false
    },
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '20-24°C',
      minTemp: 12,
      lightRequirement: 'Light',
      emergenceDays: { min: 10, max: 18 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 3-4 foglie',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare',
      temperature: '18-25°C'
    },
    transplanting: {
      when: 'Agosto-Settembre o Marzo-Aprile',
      minTemp: 10,
      spacing: '35cm sulla fila, 70cm tra le file',
      holeDepth: 15,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-6.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Seascape è una varietà ever-bearing che produce due raccolte principali (primavera e fine estate) con produzione continua tra le due.',
      commonMistakes: [
        'Non rimuovere stoloni durante produzione',
        'Gestione irrigazione insufficiente',
        'Non concimare tra le due raccolte principali'
      ],
      harvestGuide: 'Raccogli regolarmente per mantenere produzione. Frutti di buona dimensione, sapore equilibrato.'
    },
    susceptibility: {
      fungalDiseases: ['Oidio', 'Botrite'],
      pests: ['Afidi', 'Tripide'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  // BASILICATA - Varietà di Eccellenza per Esportazione
  {
    id: 'fragola-candonga',
    commonName: 'FRAGOLA CANDONGA',
    cropType: 'Strawberry',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Fragaria × ananassa',
    family: 'Rosaceae',
    varietyType: 'June-bearing',
    plantingSystem: 'Spaced Row',
    runnerManagement: {
      removeRunners: true,
      keepForPropagation: true
    },
    mulching: {
      material: 'Plastic',
      thickness: 0.02
    },
    harvestWindow: {
      startMonth: 3, // Marzo (produzione precoce per esportazione)
      endMonth: 6    // Giugno
    },
    renovationRequired: true,
    renovationMonth: 7,
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '20-24°C',
      minTemp: 12,
      lightRequirement: 'Light',
      emergenceDays: { min: 10, max: 18 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 3-4 foglie',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare, evita ristagni',
      temperature: '18-25°C'
    },
    transplanting: {
      when: 'Agosto-Settembre per produzione precoce primaverile',
      minTemp: 10,
      spacing: '35-40cm sulla fila, 70-80cm tra le file',
      holeDepth: 15,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-6.5. Ideale per terreni della Basilicata'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Candonga è una varietà di eccellenza della Basilicata, leader nell\'esportazione italiana. Frutti grandi, compatti, di colore rosso brillante, con ottima conservabilità e trasportabilità. Ideale per produzione professionale ed esportazione.',
      commonMistakes: [
        'Non rimuovere stoloni durante produzione (riduce dimensione frutti)',
        'Gestione irrigazione insufficiente (frutti piccoli)',
        'Raccolta troppo precoce (frutti acidi, scarsa conservabilità)',
        'Non gestire correttamente la pacciamatura plastica'
      ],
      harvestGuide: 'Raccogli quando le fragole sono completamente rosse e brillanti. Frutti devono essere compatti e sodi per esportazione. Gestisci con cura per mantenere qualità commerciale. Raccolta al mattino presto per migliore conservabilità.'
    },
    susceptibility: {
      fungalDiseases: ['Oidio', 'Botrite', 'Verticillium', 'Antracnosi'],
      pests: ['Afidi', 'Tripide', 'Ragnetto rosso'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'fragola-matera',
    commonName: 'FRAGOLA MATERA',
    cropType: 'Strawberry',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Fragaria × ananassa',
    family: 'Rosaceae',
    varietyType: 'June-bearing',
    plantingSystem: 'Spaced Row',
    runnerManagement: {
      removeRunners: true,
      keepForPropagation: true
    },
    mulching: {
      material: 'Plastic',
      thickness: 0.02
    },
    harvestWindow: {
      startMonth: 3, // Marzo (produzione precoce)
      endMonth: 6    // Giugno
    },
    renovationRequired: true,
    renovationMonth: 7,
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '20-24°C',
      minTemp: 12,
      lightRequirement: 'Light',
      emergenceDays: { min: 10, max: 18 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 3-4 foglie',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare, evita ristagni',
      temperature: '18-25°C'
    },
    transplanting: {
      when: 'Agosto-Settembre per produzione precoce primaverile',
      minTemp: 10,
      spacing: '35-40cm sulla fila, 70-80cm tra le file',
      holeDepth: 15,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-6.5. Ottimale per clima mediterraneo della Basilicata'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Matera è una varietà di punta della Basilicata, eccellente per esportazione. Frutti di grande dimensione, forma conica regolare, colore rosso intenso, con ottime caratteristiche organolettiche e lunga conservabilità. Varietà leader per mercati internazionali.',
      commonMistakes: [
        'Non gestire correttamente la densità di impianto (riduce qualità frutti)',
        'Irrigazione irregolare (frutti deformi)',
        'Non rimuovere stoloni (competizione con produzione)',
        'Raccolta non selettiva (miscela qualità diverse)',
        'Gestione post-raccolta inadeguata (perdita qualità esportazione)'
      ],
      harvestGuide: 'Raccogli selettivamente solo frutti completamente maturi e uniformi. Gestisci con cura per mantenere integrità commerciale. Raccolta al mattino presto, evitare ore calde. Classifica per dimensione e qualità per esportazione. Conserva a 0-2°C per massima durata.'
    },
    susceptibility: {
      fungalDiseases: ['Oidio', 'Botrite', 'Verticillium', 'Antracnosi'],
      pests: ['Afidi', 'Tripide', 'Ragnetto rosso', 'Nottue'],
      preventiveStrategy: 'HIGH'
    }
  }
];

