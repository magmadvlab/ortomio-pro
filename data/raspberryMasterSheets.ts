import { RaspberryCrop } from '../types/raspberry';
import { NutrientCategory } from '../types';

/**
 * Master Sheets per varietà di lamponi comuni in Italia
 * Pro Feature
 */

export const raspberryMasterSheets: RaspberryCrop[] = [
  {
    id: 'lampone-tulameen',
    commonName: 'LAMPONE TULAMEEN',
    cropType: 'Raspberry',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Rubus idaeus',
    family: 'Rosaceae',
    varietyType: 'Summer-bearing',
    canesType: 'Floricane',
    trainingSystem: 'Trellis',
    harvestWindow: {
      startMonth: 6, // Giugno
      endMonth: 7    // Luglio
    },
    pruningRequired: true,
    propagationMethod: 'Suckers',
    supportRequired: true,
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '18-22°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: { min: 21, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      watering: 'Mantieni terreno umido ma ben drenato',
      temperature: '15-25°C'
    },
    transplanting: {
      when: 'Autunno (ottobre-novembre) o fine inverno (febbraio-marzo)',
      minTemp: 5,
      spacing: '50cm sulla fila, 2m tra le file',
      holeDepth: 30,
      holeWidth: 30,
      soilRequirements: 'Terreno ricco, ben drenato, pH 5.5-6.5. Evitare ristagni'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Tulameen è una varietà estiva molto produttiva con frutti grandi e saporiti. Richiede supporti (trelis) e potatura annuale delle canne esaurite.',
      commonMistakes: [
        'Non rimuovere canne esaurite dopo la raccolta',
        'Non installare supporti (le canne si piegano sotto il peso)',
        'Terreno troppo compatto che causa marciumi radicali',
        'Potatura troppo aggressiva che riduce produzione'
      ],
      harvestGuide: 'Raccogli quando i frutti si staccano facilmente dal ricettacolo. I frutti maturano gradualmente, raccogli ogni 2-3 giorni durante la stagione.'
    },
    susceptibility: {
      fungalDiseases: ['Antracnosi', 'Botrite', 'Marciume radicale'],
      pests: ['Afidi', 'Cimice dei frutti'],
      preventiveStrategy: 'HIGH'
    }
  },
  {
    id: 'lampone-glen-ample',
    commonName: 'LAMPONE GLEN AMPLE',
    cropType: 'Raspberry',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Rubus idaeus',
    family: 'Rosaceae',
    varietyType: 'Summer-bearing',
    canesType: 'Floricane',
    trainingSystem: 'Trellis',
    harvestWindow: {
      startMonth: 6,
      endMonth: 8
    },
    pruningRequired: true,
    propagationMethod: 'Suckers',
    supportRequired: true,
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '18-22°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: { min: 21, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      watering: 'Mantieni terreno umido ma ben drenato',
      temperature: '15-25°C'
    },
    transplanting: {
      when: 'Autunno (ottobre-novembre) o fine inverno (febbraio-marzo)',
      minTemp: 5,
      spacing: '50cm sulla fila, 2m tra le file',
      holeDepth: 30,
      holeWidth: 30,
      soilRequirements: 'Terreno ricco, ben drenato, pH 5.5-6.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Glen Ample è una varietà estiva molto vigorosa con frutti grandi e dolci. Produzione abbondante e prolungata.',
      commonMistakes: [
        'Non gestire correttamente le canne (rimozione dopo raccolta)',
        'Supporti insufficienti per canne vigorose',
        'Terreno troppo umido'
      ],
      harvestGuide: 'Raccogli quando i frutti sono completamente maturi e si staccano facilmente. Produzione prolungata da giugno ad agosto.'
    },
    susceptibility: {
      fungalDiseases: ['Antracnosi', 'Botrite'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  {
    id: 'lampone-heritage',
    commonName: 'LAMPONE HERITAGE',
    cropType: 'Raspberry',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Rubus idaeus',
    family: 'Rosaceae',
    varietyType: 'Ever-bearing',
    canesType: 'Primocane',
    trainingSystem: 'Trellis',
    harvestWindow: {
      startMonth: 7, // Luglio
      endMonth: 10   // Ottobre
    },
    pruningRequired: true,
    propagationMethod: 'Suckers',
    supportRequired: true,
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '18-22°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: { min: 21, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      watering: 'Mantieni terreno umido ma ben drenato',
      temperature: '15-25°C'
    },
    transplanting: {
      when: 'Autunno (ottobre-novembre) o fine inverno (febbraio-marzo)',
      minTemp: 5,
      spacing: '50cm sulla fila, 2m tra le file',
      holeDepth: 30,
      holeWidth: 30,
      soilRequirements: 'Terreno ricco, ben drenato, pH 5.5-6.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Heritage è una varietà rifiorente (ever-bearing) che produce su canne primocane. Produzione estesa da luglio ad ottobre. Potatura: taglia tutte le canne a terra in inverno.',
      commonMistakes: [
        'Potatura errata (non tagliare tutte le canne a terra in inverno per varietà rifiorenti)',
        'Confondere con varietà estive (gestione canne diversa)',
        'Non supportare le canne'
      ],
      harvestGuide: 'Raccogli regolarmente durante tutta la stagione. Le canne primocane producono frutti nella parte superiore.'
    },
    susceptibility: {
      fungalDiseases: ['Antracnosi', 'Botrite'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  {
    id: 'lampone-autumn-bliss',
    commonName: 'LAMPONE AUTUMN BLISS',
    cropType: 'Raspberry',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Rubus idaeus',
    family: 'Rosaceae',
    varietyType: 'Fall-bearing',
    canesType: 'Primocane',
    trainingSystem: 'Trellis',
    harvestWindow: {
      startMonth: 8, // Agosto
      endMonth: 10   // Ottobre
    },
    pruningRequired: true,
    propagationMethod: 'Suckers',
    supportRequired: true,
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '18-22°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: { min: 21, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      watering: 'Mantieni terreno umido ma ben drenato',
      temperature: '15-25°C'
    },
    transplanting: {
      when: 'Autunno (ottobre-novembre) o fine inverno (febbraio-marzo)',
      minTemp: 5,
      spacing: '50cm sulla fila, 2m tra le file',
      holeDepth: 30,
      holeWidth: 30,
      soilRequirements: 'Terreno ricco, ben drenato, pH 5.5-6.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Autumn Bliss è una varietà autunnale che produce su canne primocane. Produzione tardiva da agosto ad ottobre. Potatura: taglia tutte le canne a terra in inverno per produzione solo autunnale, oppure mantieni parte delle canne per doppia produzione.',
      commonMistakes: [
        'Non gestire correttamente le canne primocane',
        'Potatura troppo aggressiva',
        'Non supportare le canne'
      ],
      harvestGuide: 'Raccogli quando i frutti sono completamente maturi. Produzione concentrata in autunno.'
    },
    susceptibility: {
      fungalDiseases: ['Antracnosi', 'Botrite'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM'
    }
  }
];








