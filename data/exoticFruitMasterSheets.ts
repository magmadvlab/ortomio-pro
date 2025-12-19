import { ExoticFruitCrop } from '../types/exoticFruit';
import { NutrientCategory } from '../types';

/**
 * Master Sheets per frutta esotica/tropicale
 * Pro Feature
 */

export const exoticFruitMasterSheets: ExoticFruitCrop[] = [
  // PAPAYA
  {
    id: 'papaya-comune',
    commonName: 'PAPAYA',
    cropType: 'ExoticFruit',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Carica papaya',
    family: 'Caricaceae',
    fruitType: 'Tropical',
    
    climateRequirements: {
      minTemp: 15,
      maxTemp: 35,
      idealTemp: '25-30°C',
      humidity: 'Medium',
      frostTolerant: false,
      heatTolerant: true
    },
    
    greenhouseRequired: true,  // In Italia necessaria serra
    greenhouseType: 'Tropical',
    indoorGrowing: true,  // Possibile in vaso grande indoor
    containerSize: 'Minimo 50L, ideale 100L+',
    
    treeType: 'Tree',
    maturityYears: 1,  // Cresce velocemente
    harvestWindow: {
      startMonth: 9,  // Settembre (se piantato in primavera)
      endMonth: 12    // Dicembre
    },
    
    italianClimateNotes: 'In Italia coltivabile solo in serra riscaldata o zone costiere del Sud (Sicilia, Calabria). Richiede protezione invernale.',
    regionalSuitability: [
      { region: 'Sicilia', suitability: 'High', notes: 'Zone costiere, serra consigliata' },
      { region: 'Calabria', suitability: 'Medium', notes: 'Solo zone costiere, serra obbligatoria' },
      { region: 'Puglia', suitability: 'Low', notes: 'Solo serra riscaldata' }
    ],
    
    requiredTools: {
      seedTray: true,
      seedSoil: true,
      heatingMat: true,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '25-30°C',
      minTemp: 15,
      lightRequirement: 'Light',
      emergenceDays: { min: 14, max: 21 },
      coveringNeeded: true
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto o lampade LED (14-16h)',
      watering: 'Mantieni terreno umido ma ben drenato',
      temperature: '25-30°C'
    },
    transplanting: {
      when: 'Primavera (aprile-maggio) quando temperatura minima notturna >15°C',
      minTemp: 15,
      spacing: '2-3m tra le piante',
      holeDepth: 50,
      holeWidth: 50,
      soilRequirements: 'Terreno ricco, ben drenato, pH 6.0-6.5. Evitare ristagni'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'La papaya è una pianta tropicale che richiede calore costante. In Italia è coltivabile solo in serra riscaldata o in zone costiere del Sud con protezione invernale.',
      commonMistakes: [
        'Temperatura troppo bassa (sotto 15°C la pianta muore)',
        'Ristagni idrici (causano marciumi radicali)',
        'Esposizione insufficiente al sole',
        'Non proteggere in inverno'
      ],
      harvestGuide: 'Raccogli quando i frutti sono gialli-arancio e leggermente morbidi. La papaya continua a maturare dopo la raccolta.'
    },
    susceptibility: {
      fungalDiseases: ['Marciume radicale', 'Antracnosi'],
      pests: ['Afidi', 'Mosca della frutta'],
      preventiveStrategy: 'HIGH'
    },
    
    // NEW: Visual category
    visualCategory: 'Esotici',
    
    // NEW: Varieties
    varieties: [
      {
        id: 'papaya-solo',
        name: 'Solo',
        coldHardiness: 15,
        heatTolerance: 35,
        containerFriendly: true,
        dwarf: true,
        maturityYears: 1,
        harvestMonths: [9, 10, 11, 12],
        bestUsdaZones: [10, 11],
        notes: 'Varietà nano, ideale per vaso. Frutti piccoli, dolci.'
      },
      {
        id: 'papaya-maradol',
        name: 'Maradol',
        coldHardiness: 15,
        heatTolerance: 35,
        containerFriendly: false,
        dwarf: false,
        maturityYears: 1,
        harvestMonths: [9, 10, 11, 12],
        bestUsdaZones: [10, 11],
        notes: 'Varietà standard, frutti grandi.'
      }
    ],
    
    // NEW: Climate compatibility
    climateCompatibility: {
      usdaZones: [10, 11],
      optimalUsdaZones: [11],
      tempMinSurvival: 10,
      tempMinGrowth: 15,
      tempOptimal: { min: 25, max: 30 },
      tempMax: 35,
      maxAltitudeMeters: 200,
      benefitsFromSea: true,
      seaDistanceKm: 30
    },
    
    // NEW: Cultivation systems
    cultivationSystems: {
      openField: {
        possible: false,
        requires: {
          minUsdaZone: 11,
          protection: 'Permanent',
          protectionType: 'TNT'
        }
      },
      container: {
        possible: true,
        minSizeLiters: 50,
        moveableIndoor: true,
        indoorMonths: [11, 12, 1, 2, 3]
      },
      greenhouse: {
        required: true,
        type: 'Tropical',
        heatingRequired: true,
        minTempGreenhouse: 15
      }
    }
  },
  
  // MANGO
  {
    id: 'mango-kent',
    commonName: 'MANGO KENT',
    cropType: 'ExoticFruit',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Mangifera indica',
    family: 'Anacardiaceae',
    fruitType: 'Tropical',
    
    climateRequirements: {
      minTemp: 10,
      maxTemp: 40,
      idealTemp: '24-30°C',
      humidity: 'Medium',
      frostTolerant: false,
      heatTolerant: true
    },
    
    greenhouseRequired: true,
    greenhouseType: 'Warm',
    indoorGrowing: true,
    containerSize: 'Minimo 100L, ideale 200L+',
    
    treeType: 'Tree',
    maturityYears: 3,
    harvestWindow: {
      startMonth: 7,  // Luglio
      endMonth: 9     // Settembre
    },
    
    italianClimateNotes: 'In Italia coltivabile in serra o zone costiere del Sud. Varietà nane consigliate per vaso.',
    regionalSuitability: [
      { region: 'Sicilia', suitability: 'High', notes: 'Zone costiere, varietà nane' },
      { region: 'Calabria', suitability: 'Medium', notes: 'Solo serra o zone molto protette' }
    ],
    
    requiredTools: {
      seedTray: true,
      seedSoil: true,
      heatingMat: true,
      sprayer: true
    },
    germination: {
      preSoak: true,  // Ammollo consigliato
      sowingDepth: 2,
      idealTemp: '25-30°C',
      minTemp: 20,
      lightRequirement: 'Light',
      emergenceDays: { min: 14, max: 28 },
      coveringNeeded: true
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto o lampade LED (12-14h)',
      watering: 'Irrigazione regolare, evita ristagni',
      temperature: '24-30°C'
    },
    transplanting: {
      when: 'Primavera (aprile-maggio) quando temperatura minima >10°C',
      minTemp: 10,
      spacing: '4-5m tra gli alberi (varietà standard) o 2-3m (varietà nane)',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 5.5-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il mango è un albero tropicale che richiede calore e protezione dal freddo. Varietà nane come "Irwin" o "Keitt" sono più adatte alla coltivazione in vaso.',
      commonMistakes: [
        'Esposizione al freddo (sotto 10°C)',
        'Terreno troppo bagnato',
        'Potatura eccessiva',
        'Non proteggere in inverno'
      ],
      harvestGuide: 'Raccogli quando i frutti sono maturi (colore caratteristico della varietà) e profumati. Il mango non matura bene dopo la raccolta se troppo acerbo.'
    },
    susceptibility: {
      fungalDiseases: ['Antracnosi', 'Oidio'],
      pests: ['Afidi', 'Mosca della frutta', 'Cocciniglie'],
      preventiveStrategy: 'HIGH'
    },
    
    // NEW: Visual category
    visualCategory: 'Esotici',
    
    // NEW: Varieties
    varieties: [
      {
        id: 'mango-irwin',
        name: 'Irwin',
        coldHardiness: 5,
        heatTolerance: 40,
        containerFriendly: true,
        dwarf: true,
        maturityYears: 3,
        harvestMonths: [7, 8, 9],
        bestUsdaZones: [9, 10],
        notes: 'Varietà nano, ideale per vaso. Frutti rossi, dolci.'
      },
      {
        id: 'mango-kent',
        name: 'Kent',
        coldHardiness: 10,
        heatTolerance: 40,
        containerFriendly: false,
        dwarf: false,
        maturityYears: 4,
        harvestMonths: [7, 8, 9],
        bestUsdaZones: [10, 11],
        notes: 'Varietà standard, frutti grandi e dolci.'
      },
      {
        id: 'mango-keitt',
        name: 'Keitt',
        coldHardiness: 5,
        heatTolerance: 40,
        containerFriendly: true,
        dwarf: true,
        maturityYears: 3,
        harvestMonths: [8, 9, 10],
        bestUsdaZones: [9, 10],
        notes: 'Varietà nano, raccolta tardiva. Frutti verdi-gialli.'
      }
    ],
    
    // NEW: Climate compatibility
    climateCompatibility: {
      usdaZones: [9, 10, 11],
      optimalUsdaZones: [10, 11],
      tempMinSurvival: 5,
      tempMinGrowth: 10,
      tempOptimal: { min: 24, max: 30 },
      tempMax: 40,
      maxAltitudeMeters: 300,
      benefitsFromSea: true,
      seaDistanceKm: 50
    },
    
    // NEW: Cultivation systems
    cultivationSystems: {
      openField: {
        possible: true,
        requires: {
          minUsdaZone: 10,
          protection: 'Temporary',
          protectionType: 'TNT'
        }
      },
      container: {
        possible: true,
        minSizeLiters: 100,
        moveableIndoor: true,
        indoorMonths: [11, 12, 1, 2]
      },
      greenhouse: {
        required: false,
        type: 'Warm',
        heatingRequired: true,
        minTempGreenhouse: 10
      }
    }
  },
  
  // AVOCADO
  {
    id: 'avocado-hass',
    commonName: 'AVOCADO HASS',
    cropType: 'ExoticFruit',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Persea americana',
    family: 'Lauraceae',
    fruitType: 'Subtropical',
    
    climateRequirements: {
      minTemp: 5,  // Più tollerante al freddo
      maxTemp: 35,
      idealTemp: '20-25°C',
      humidity: 'Medium',
      frostTolerant: false,  // Ma più resistente di papaya/mango
      heatTolerant: true
    },
    
    greenhouseRequired: false,  // In zone costiere del Sud può stare all'aperto
    greenhouseType: 'Cold',  // Se in serra, serra fredda sufficiente
    indoorGrowing: true,
    containerSize: 'Minimo 50L, ideale 100L+',
    
    treeType: 'Tree',
    maturityYears: 5,
    harvestWindow: {
      startMonth: 10,  // Ottobre
      endMonth: 3      // Marzo (raccolta invernale)
    },
    
    italianClimateNotes: 'In Italia coltivabile in zone costiere del Sud (Sicilia, Calabria, Puglia). Protezione invernale consigliata. Varietà nane per vaso.',
    regionalSuitability: [
      { region: 'Sicilia', suitability: 'High', notes: 'Zone costiere, protezione invernale' },
      { region: 'Calabria', suitability: 'High', notes: 'Zone costiere' },
      { region: 'Puglia', suitability: 'Medium', notes: 'Zone costiere, protezione invernale obbligatoria' },
      { region: 'Basilicata', suitability: 'Low', notes: 'Solo zone costiere, serra consigliata' }
    ],
    
    requiredTools: {
      seedTray: true,
      seedSoil: true,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 2,
      idealTemp: '20-25°C',
      minTemp: 15,
      lightRequirement: 'Light',
      emergenceDays: { min: 21, max: 35 },
      coveringNeeded: true
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare, terreno ben drenato',
      temperature: '20-25°C'
    },
    transplanting: {
      when: 'Primavera (marzo-aprile) quando temperatura minima >5°C',
      minTemp: 5,
      spacing: '5-6m tra gli alberi (varietà standard) o 3-4m (varietà nane)',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.0. Evitare terreni argillosi compatti'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'L\'avocado è più tollerante al freddo rispetto ad altre piante tropicali. In zone costiere del Sud può essere coltivato all\'aperto con protezione invernale.',
      commonMistakes: [
        'Terreno troppo compatto o argilloso (causa marciumi)',
        'Esposizione a venti freddi',
        'Irrigazione eccessiva',
        'Non proteggere in inverno (gelate)'
      ],
      harvestGuide: 'Raccogli quando i frutti sono maturi (colore scuro per Hass). L\'avocado matura dopo la raccolta a temperatura ambiente.'
    },
    susceptibility: {
      fungalDiseases: ['Marciume radicale', 'Verticillium'],
      pests: ['Afidi', 'Cocciniglie', 'Tripidi'],
      preventiveStrategy: 'MEDIUM'
    },
    
    // NEW: Visual category
    visualCategory: 'Esotici',
    
    // NEW: Varieties
    varieties: [
      {
        id: 'avocado-hass',
        name: 'Hass',
        coldHardiness: -2,
        heatTolerance: 35,
        containerFriendly: true,
        dwarf: false,
        maturityYears: 5,
        harvestMonths: [10, 11, 12, 1, 2, 3],
        bestUsdaZones: [9, 10],
        notes: 'Varietà più resistente al freddo. Frutti scuri, ottimo sapore.'
      },
      {
        id: 'avocado-fuerte',
        name: 'Fuerte',
        coldHardiness: -3,
        heatTolerance: 35,
        containerFriendly: true,
        dwarf: false,
        maturityYears: 4,
        harvestMonths: [11, 12, 1, 2],
        bestUsdaZones: [9, 10],
        notes: 'Resistente al freddo, frutti verdi.'
      },
      {
        id: 'avocado-bacon',
        name: 'Bacon',
        coldHardiness: -5,
        heatTolerance: 35,
        containerFriendly: true,
        dwarf: false,
        maturityYears: 4,
        harvestMonths: [11, 12, 1],
        bestUsdaZones: [8, 9],
        notes: 'Molto resistente al freddo, ideale per zone più fresche.'
      }
    ],
    
    // NEW: Climate compatibility
    climateCompatibility: {
      usdaZones: [8, 9, 10, 11],
      optimalUsdaZones: [9, 10],
      tempMinSurvival: -5,
      tempMinGrowth: 5,
      tempOptimal: { min: 20, max: 25 },
      tempMax: 35,
      maxAltitudeMeters: 400,
      benefitsFromSea: true,
      seaDistanceKm: 50
    },
    
    // NEW: Cultivation systems
    cultivationSystems: {
      openField: {
        possible: true,
        requires: {
          minUsdaZone: 9,
          protection: 'Temporary',
          protectionType: 'TNT'
        }
      },
      container: {
        possible: true,
        minSizeLiters: 50,
        moveableIndoor: true,
        indoorMonths: [12, 1, 2]
      },
      greenhouse: {
        required: false,
        type: 'Cold',
        heatingRequired: false,
        minTempGreenhouse: 5
      }
    }
  },
  
  // ANANAS
  {
    id: 'ananas-comune',
    commonName: 'ANANAS',
    cropType: 'ExoticFruit',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Ananas comosus',
    family: 'Bromeliaceae',
    fruitType: 'Tropical',
    
    climateRequirements: {
      minTemp: 15,
      maxTemp: 35,
      idealTemp: '22-28°C',
      humidity: 'High',
      frostTolerant: false,
      heatTolerant: true
    },
    
    greenhouseRequired: true,  // Obbligatoria
    greenhouseType: 'Tropical',
    indoorGrowing: true,
    containerSize: 'Minimo 20L, ideale 30-40L',
    
    treeType: 'Herbaceous',
    maturityYears: 1.5,  // 18 mesi circa
    harvestWindow: {
      startMonth: 6,  // Giugno
      endMonth: 9     // Settembre
    },
    
    italianClimateNotes: 'In Italia coltivabile solo in serra riscaldata. Richiede alta umidità e temperatura costante.',
    regionalSuitability: [
      { region: 'Sicilia', suitability: 'Medium', notes: 'Solo serra riscaldata' },
      { region: 'Calabria', suitability: 'Low', notes: 'Solo serra riscaldata con controllo umidità' }
    ],
    
    requiredTools: {
      seedTray: false,  // Si propaga per talea di corona
      seedSoil: true,
      heatingMat: true,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 0,  // Non si semina, si usa corona
      idealTemp: '22-28°C',
      minTemp: 15,
      lightRequirement: 'Light',
      emergenceDays: { min: 0, max: 0 },  // N/A
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando la corona ha radicato (2-3 settimane)',
      lightNeeds: 'Sole diretto o lampade LED (12-14h)',
      watering: 'Irrigazione regolare, alta umidità (60-80%)',
      temperature: '22-28°C'
    },
    transplanting: {
      when: 'Quando la corona ha radicato',
      minTemp: 15,
      spacing: '50-60cm tra le piante',
      holeDepth: 20,
      holeWidth: 20,
      soilRequirements: 'Terreno acido (pH 4.5-6.5), ben drenato, ricco di materia organica'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'L\'ananas è una bromeliacea tropicale che richiede serra riscaldata in Italia. Si propaga facilmente dalla corona del frutto.',
      commonMistakes: [
        'Temperatura troppo bassa (sotto 15°C)',
        'Umidità insufficiente',
        'Terreno non acido',
        'Ristagni idrici'
      ],
      harvestGuide: 'Raccogli quando il frutto è giallo-arancio e profumato. L\'ananas non matura dopo la raccolta.'
    },
    susceptibility: {
      fungalDiseases: ['Marciume del cuore', 'Antracnosi'],
      pests: ['Cocciniglie', 'Acari'],
      preventiveStrategy: 'MEDIUM'
    }
  },
  
  // BANANO
  {
    id: 'banano-nano',
    commonName: 'BANANO NANO',
    cropType: 'ExoticFruit',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Musa acuminata',
    family: 'Musaceae',
    fruitType: 'Tropical',
    
    climateRequirements: {
      minTemp: 10,
      maxTemp: 35,
      idealTemp: '25-30°C',
      humidity: 'High',
      frostTolerant: false,
      heatTolerant: true
    },
    
    greenhouseRequired: true,  // Consigliata
    greenhouseType: 'Warm',
    indoorGrowing: true,
    containerSize: 'Minimo 100L, ideale 200L+',
    
    treeType: 'Herbaceous',  // Tecnicamente erbacea
    maturityYears: 1.5,  // 18 mesi circa
    harvestWindow: {
      startMonth: 8,  // Agosto
      endMonth: 11    // Novembre
    },
    
    italianClimateNotes: 'In Italia coltivabile in serra o zone costiere del Sud. Varietà nane come "Dwarf Cavendish" sono più adatte.',
    regionalSuitability: [
      { region: 'Sicilia', suitability: 'High', notes: 'Zone costiere, varietà nane, serra consigliata' },
      { region: 'Calabria', suitability: 'Medium', notes: 'Solo serra o zone molto protette' }
    ],
    
    requiredTools: {
      seedTray: false,  // Si propaga per polloni
      seedSoil: true,
      heatingMat: true,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 0,  // N/A - propagazione per polloni
      idealTemp: '25-30°C',
      minTemp: 15,
      lightRequirement: 'Light',
      emergenceDays: { min: 0, max: 0 },  // N/A
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando i polloni hanno 3-4 foglie',
      lightNeeds: 'Sole diretto o lampade LED (12-14h)',
      watering: 'Irrigazione abbondante, alta umidità (60-80%)',
      temperature: '25-30°C'
    },
    transplanting: {
      when: 'Primavera (aprile-maggio) quando temperatura minima >10°C',
      minTemp: 10,
      spacing: '2-3m tra le piante (varietà nane)',
      holeDepth: 50,
      holeWidth: 50,
      soilRequirements: 'Terreno fertile, ben drenato, pH 5.5-7.0, ricco di potassio'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il banano è una pianta erbacea tropicale che richiede calore e umidità. Varietà nane come "Dwarf Cavendish" sono più adatte alla coltivazione in vaso o serra.',
      commonMistakes: [
        'Temperatura troppo bassa (sotto 10°C)',
        'Umidità insufficiente',
        'Terreno troppo compatto',
        'Non proteggere in inverno'
      ],
      harvestGuide: 'Raccogli quando i frutti sono gialli e leggermente morbidi. Il banano continua a maturare dopo la raccolta.'
    },
    susceptibility: {
      fungalDiseases: ['Sigatoka', 'Marciume del rizoma'],
      pests: ['Afidi', 'Cocciniglie', 'Nematodi'],
      preventiveStrategy: 'HIGH'
    }
  },
  
  // GELSO
  {
    id: 'gelso',
    commonName: 'GELSO',
    cropType: 'ExoticFruit',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Morus alba L. / Morus nigra L.',
    family: 'Moraceae',
    fruitType: 'MediterraneanExotic',
    
    climateRequirements: {
      minTemp: -15,
      maxTemp: 35,
      idealTemp: '15-25°C',
      humidity: 'Medium',
      frostTolerant: true,
      heatTolerant: true
    },
    
    greenhouseRequired: false,
    greenhouseType: 'Cold',
    indoorGrowing: false,
    containerSize: 'Minimo 50L, ideale 100L+',
    
    treeType: 'Tree',
    maturityYears: 3,
    harvestWindow: {
      startMonth: 6,
      endMonth: 7
    },
    
    italianClimateNotes: 'Il gelso è molto adatto al clima italiano. Resiste bene al freddo e al caldo. Varietà nere (Morus nigra) più saporite.',
    regionalSuitability: [
      { region: 'Tutte', suitability: 'High', notes: 'Adatto a tutto il territorio italiano' }
    ],
    
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
      emergenceDays: { min: 14, max: 21 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: -5,
      spacing: '5-6m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il gelso è un albero rustico e resistente, molto adatto al clima italiano. Produce more dolci in estate.',
      commonMistakes: [
        'Potatura eccessiva - il gelso non necessita di potatura intensa',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - sensibile a oidio'
      ],
      harvestGuide: 'Raccogli quando le more sono mature e si staccano facilmente (giugno-luglio).'
    },
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW'
    }
  },
  
  // GIUGGIOLO
  {
    id: 'giuggiolo',
    commonName: 'GIUGGIOLO',
    cropType: 'ExoticFruit',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Ziziphus jujuba Mill.',
    family: 'Rhamnaceae',
    fruitType: 'MediterraneanExotic',
    
    climateRequirements: {
      minTemp: -20,
      maxTemp: 40,
      idealTemp: '20-30°C',
      humidity: 'Low',
      frostTolerant: true,
      heatTolerant: true
    },
    
    greenhouseRequired: false,
    greenhouseType: 'Cold',
    indoorGrowing: false,
    containerSize: 'Minimo 50L, ideale 100L+',
    
    treeType: 'Tree',
    maturityYears: 3,
    harvestWindow: {
      startMonth: 9,
      endMonth: 10
    },
    
    italianClimateNotes: 'Il giuggiolo è molto resistente e adatto al clima italiano, soprattutto zone calde e secche.',
    regionalSuitability: [
      { region: 'Tutte', suitability: 'High', notes: 'Adatto a tutto il territorio italiano, preferisce zone calde' }
    ],
    
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: true,
      sowingDepth: 2,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 21, max: 35 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione moderata, resistente alla siccità',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: -5,
      spacing: '4-5m tra gli alberi',
      holeDepth: 50,
      holeWidth: 50,
      soilRequirements: 'Terreno ben drenato, anche povero, pH 6.0-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il giuggiolo è un albero molto resistente alla siccità e al freddo. Produce giuggiole dolci in autunno.',
      commonMistakes: [
        'Irrigazione eccessiva - resistente alla siccità',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - generalmente resistente'
      ],
      harvestGuide: 'Raccogli quando le giuggiole sono marroni e leggermente morbide (settembre-ottobre).'
    },
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW'
    }
  },
  
  // CORBEZZOLO
  {
    id: 'corbezzolo',
    commonName: 'CORBEZZOLO',
    cropType: 'ExoticFruit',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Arbutus unedo L.',
    family: 'Ericaceae',
    fruitType: 'MediterraneanExotic',
    
    climateRequirements: {
      minTemp: -10,
      maxTemp: 35,
      idealTemp: '15-25°C',
      humidity: 'Medium',
      frostTolerant: true,
      heatTolerant: true
    },
    
    greenhouseRequired: false,
    greenhouseType: 'Cold',
    indoorGrowing: false,
    containerSize: 'Minimo 50L, ideale 100L+',
    
    treeType: 'Tree',
    maturityYears: 4,
    harvestWindow: {
      startMonth: 10,
      endMonth: 12
    },
    
    italianClimateNotes: 'Il corbezzolo è una pianta mediterranea molto adatta al clima italiano, soprattutto zone costiere.',
    regionalSuitability: [
      { region: 'Tutte', suitability: 'High', notes: 'Adatto a tutto il territorio italiano, preferisce zone costiere' }
    ],
    
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
      emergenceDays: { min: 30, max: 60 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      watering: 'Irrigazione moderata',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: -5,
      spacing: '4-5m tra gli alberi',
      holeDepth: 50,
      holeWidth: 50,
      soilRequirements: 'Terreno acido o neutro, ben drenato, pH 5.5-7.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il corbezzolo è un albero sempreverde mediterraneo che produce corbezzole in autunno-inverno.',
      commonMistakes: [
        'Terreno troppo alcalino - preferisce terreno acido o neutro',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - generalmente resistente'
      ],
      harvestGuide: 'Raccogli quando le corbezzole sono rosse e morbide (ottobre-dicembre).'
    },
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW'
    }
  },
  
  // MIRTO
  {
    id: 'mirto',
    commonName: 'MIRTO',
    cropType: 'ExoticFruit',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Myrtus communis L.',
    family: 'Myrtaceae',
    fruitType: 'MediterraneanExotic',
    
    climateRequirements: {
      minTemp: -5,
      maxTemp: 35,
      idealTemp: '15-25°C',
      humidity: 'Medium',
      frostTolerant: true,
      heatTolerant: true
    },
    
    greenhouseRequired: false,
    greenhouseType: 'Cold',
    indoorGrowing: true,
    containerSize: 'Minimo 20L, ideale 50L+',
    
    treeType: 'Shrub',
    maturityYears: 3,
    harvestWindow: {
      startMonth: 10,
      endMonth: 11
    },
    
    italianClimateNotes: 'Il mirto è una pianta mediterranea molto adatta al clima italiano, soprattutto zone costiere.',
    regionalSuitability: [
      { region: 'Tutte', suitability: 'High', notes: 'Adatto a tutto il territorio italiano, preferisce zone costiere' }
    ],
    
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
      emergenceDays: { min: 30, max: 60 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      watering: 'Irrigazione moderata',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: -5,
      spacing: '1-2m tra le piante',
      holeDepth: 40,
      holeWidth: 40,
      soilRequirements: 'Terreno ben drenato, anche povero, pH 6.0-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il mirto è un arbusto sempreverde mediterraneo che produce bacche aromatiche in autunno.',
      commonMistakes: [
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - generalmente resistente',
        'Potatura eccessiva - necessita di potatura leggera'
      ],
      harvestGuide: 'Raccogli quando le bacche sono nere e morbide (ottobre-novembre).'
    },
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW'
    }
  },
  
  // SORBO DOMESTICO
  {
    id: 'sorbo-domestico',
    commonName: 'SORBO DOMESTICO',
    cropType: 'ExoticFruit',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Sorbus domestica L.',
    family: 'Rosaceae',
    fruitType: 'MediterraneanExotic',
    
    climateRequirements: {
      minTemp: -20,
      maxTemp: 35,
      idealTemp: '15-25°C',
      humidity: 'Medium',
      frostTolerant: true,
      heatTolerant: true
    },
    
    greenhouseRequired: false,
    greenhouseType: 'Cold',
    indoorGrowing: false,
    containerSize: 'Minimo 50L, ideale 100L+',
    
    treeType: 'Tree',
    maturityYears: 5,
    harvestWindow: {
      startMonth: 9,
      endMonth: 10
    },
    
    italianClimateNotes: 'Il sorbo domestico è molto adatto al clima italiano, resistente al freddo e al caldo.',
    regionalSuitability: [
      { region: 'Tutte', suitability: 'High', notes: 'Adatto a tutto il territorio italiano' }
    ],
    
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: true,
      sowingDepth: 2,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: { min: 30, max: 90 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: -10,
      spacing: '5-6m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il sorbo domestico è un albero rustico che produce sorbe in autunno. I frutti maturano dopo la raccolta.',
      commonMistakes: [
        'Raccogliere troppo presto - i frutti maturano dopo la raccolta',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - generalmente resistente'
      ],
      harvestGuide: 'Raccogli quando le sorbe sono gialle-rosse (settembre-ottobre). Lasciare maturare in luogo fresco e asciutto.'
    },
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW'
    }
  },
  
  // AZZAROLO
  {
    id: 'azzarolo',
    commonName: 'AZZAROLO',
    cropType: 'ExoticFruit',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Crataegus azarolus L.',
    family: 'Rosaceae',
    fruitType: 'MediterraneanExotic',
    
    climateRequirements: {
      minTemp: -20,
      maxTemp: 35,
      idealTemp: '15-25°C',
      humidity: 'Medium',
      frostTolerant: true,
      heatTolerant: true
    },
    
    greenhouseRequired: false,
    greenhouseType: 'Cold',
    indoorGrowing: false,
    containerSize: 'Minimo 50L, ideale 100L+',
    
    treeType: 'Tree',
    maturityYears: 4,
    harvestWindow: {
      startMonth: 9,
      endMonth: 10
    },
    
    italianClimateNotes: 'L\'azzarolo è molto adatto al clima italiano, resistente al freddo e al caldo.',
    regionalSuitability: [
      { region: 'Tutte', suitability: 'High', notes: 'Adatto a tutto il territorio italiano' }
    ],
    
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: true,
      sowingDepth: 2,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: { min: 30, max: 90 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: -10,
      spacing: '4-5m tra gli alberi',
      holeDepth: 50,
      holeWidth: 50,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'L\'azzarolo è un albero rustico che produce azzarole in autunno. I frutti sono simili a piccole mele.',
      commonMistakes: [
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - generalmente resistente',
        'Potatura eccessiva - necessita di potatura leggera'
      ],
      harvestGuide: 'Raccogli quando le azzarole sono gialle-rosse e leggermente morbide (settembre-ottobre).'
    },
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW'
    }
  },
  
  // CARRUBO
  {
    id: 'carrubo',
    commonName: 'CARRUBO',
    cropType: 'ExoticFruit',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Ceratonia siliqua L.',
    family: 'Fabaceae',
    fruitType: 'MediterraneanExotic',
    
    climateRequirements: {
      minTemp: -5,
      maxTemp: 40,
      idealTemp: '15-25°C',
      humidity: 'Low',
      frostTolerant: true,
      heatTolerant: true
    },
    
    greenhouseRequired: false,
    greenhouseType: 'Cold',
    indoorGrowing: false,
    containerSize: 'Minimo 100L, ideale 200L+',
    
    treeType: 'Tree',
    maturityYears: 6,
    harvestWindow: {
      startMonth: 8,
      endMonth: 10
    },
    
    italianClimateNotes: 'Il carrubo è una pianta mediterranea molto adatta al clima italiano, soprattutto zone costiere del Sud.',
    regionalSuitability: [
      { region: 'Sicilia', suitability: 'High', notes: 'Zone costiere' },
      { region: 'Calabria', suitability: 'High', notes: 'Zone costiere' },
      { region: 'Puglia', suitability: 'High', notes: 'Zone costiere' },
      { region: 'Sardegna', suitability: 'High', notes: 'Zone costiere' }
    ],
    
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: true,
      sowingDepth: 2,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: { min: 14, max: 30 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione moderata, resistente alla siccità',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: -5,
      spacing: '6-8m tra gli alberi',
      holeDepth: 60,
      holeWidth: 60,
      soilRequirements: 'Terreno ben drenato, anche povero, pH 6.0-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il carrubo è un albero sempreverde mediterraneo che produce carrube in estate-autunno. Molto resistente alla siccità.',
      commonMistakes: [
        'Irrigazione eccessiva - resistente alla siccità',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - generalmente resistente'
      ],
      harvestGuide: 'Raccogli quando le carrube sono marroni e secche (agosto-ottobre).'
    },
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW'
    }
  },
  
  // ALCHEMENGI (PHYSALIS)
  {
    id: 'alchechengi',
    commonName: 'ALCHECHENGI',
    cropType: 'ExoticFruit',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Physalis alkekengi L.',
    family: 'Solanaceae',
    fruitType: 'MediterraneanExotic',
    
    climateRequirements: {
      minTemp: -15,
      maxTemp: 35,
      idealTemp: '15-25°C',
      humidity: 'Medium',
      frostTolerant: true,
      heatTolerant: true
    },
    
    greenhouseRequired: false,
    greenhouseType: 'Cold',
    indoorGrowing: false,
    containerSize: 'Minimo 20L, ideale 50L+',
    
    treeType: 'Herbaceous',
    maturityYears: 1,
    harvestWindow: {
      startMonth: 8,
      endMonth: 10
    },
    
    italianClimateNotes: 'L\'alchechengi è molto adatto al clima italiano, resistente al freddo e al caldo.',
    regionalSuitability: [
      { region: 'Tutte', suitability: 'High', notes: 'Adatto a tutto il territorio italiano' }
    ],
    
    requiredTools: {
      seedTray: true,
      seedSoil: true,
      heatingMat: false,
      sprayer: true
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
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      watering: 'Irrigazione regolare',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Primavera (aprile-maggio)',
      minTemp: 5,
      spacing: '50-60cm tra le piante',
      holeDepth: 20,
      holeWidth: 20,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'L\'alchechengi è una pianta erbacea che produce frutti avvolti in calici arancioni. Facile da coltivare.',
      commonMistakes: [
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - generalmente resistente',
        'Non raccogliere quando maturo - i frutti maturano in autunno'
      ],
      harvestGuide: 'Raccogli quando i calici sono arancioni e i frutti sono gialli (agosto-ottobre).'
    },
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW'
    }
  },
  
  // SAMBUCO
  {
    id: 'sambuco',
    commonName: 'SAMBUCO',
    cropType: 'ExoticFruit',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Sambucus nigra L.',
    family: 'Adoxaceae',
    fruitType: 'MediterraneanExotic',
    
    climateRequirements: {
      minTemp: -20,
      maxTemp: 35,
      idealTemp: '15-25°C',
      humidity: 'Medium',
      frostTolerant: true,
      heatTolerant: true
    },
    
    greenhouseRequired: false,
    greenhouseType: 'Cold',
    indoorGrowing: false,
    containerSize: 'Minimo 50L, ideale 100L+',
    
    treeType: 'Shrub',
    maturityYears: 2,
    harvestWindow: {
      startMonth: 8,
      endMonth: 9
    },
    
    italianClimateNotes: 'Il sambuco è molto adatto al clima italiano, resistente al freddo e al caldo.',
    regionalSuitability: [
      { region: 'Tutte', suitability: 'High', notes: 'Adatto a tutto il territorio italiano' }
    ],
    
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: true,
      sowingDepth: 1,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: { min: 30, max: 60 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      watering: 'Irrigazione regolare',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: -10,
      spacing: '2-3m tra le piante',
      holeDepth: 40,
      holeWidth: 40,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il sambuco è un arbusto rustico che produce bacche nere in estate. I frutti sono commestibili solo cotti.',
      commonMistakes: [
        'Mangiare frutti crudi - i frutti sono tossici crudi, vanno cotti',
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - generalmente resistente'
      ],
      harvestGuide: 'Raccogli quando le bacche sono nere e mature (agosto-settembre). Usare solo frutti cotti.'
    },
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW'
    }
  },
  
  // CORNIOLO
  {
    id: 'corniolo',
    commonName: 'CORNIOLO',
    cropType: 'ExoticFruit',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Cornus mas L.',
    family: 'Cornaceae',
    fruitType: 'MediterraneanExotic',
    
    climateRequirements: {
      minTemp: -20,
      maxTemp: 35,
      idealTemp: '15-25°C',
      humidity: 'Medium',
      frostTolerant: true,
      heatTolerant: true
    },
    
    greenhouseRequired: false,
    greenhouseType: 'Cold',
    indoorGrowing: false,
    containerSize: 'Minimo 50L, ideale 100L+',
    
    treeType: 'Tree',
    maturityYears: 4,
    harvestWindow: {
      startMonth: 8,
      endMonth: 9
    },
    
    italianClimateNotes: 'Il corniolo è molto adatto al clima italiano, resistente al freddo e al caldo.',
    regionalSuitability: [
      { region: 'Tutte', suitability: 'High', notes: 'Adatto a tutto il territorio italiano' }
    ],
    
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: true,
      sowingDepth: 2,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: { min: 30, max: 90 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      watering: 'Irrigazione regolare',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: -10,
      spacing: '4-5m tra gli alberi',
      holeDepth: 50,
      holeWidth: 50,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il corniolo è un albero rustico che produce corniole rosse in estate. I frutti sono acidi e si usano per marmellate.',
      commonMistakes: [
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - generalmente resistente',
        'Non raccogliere quando maturo - i frutti maturano in estate'
      ],
      harvestGuide: 'Raccogli quando le corniole sono rosse e leggermente morbide (agosto-settembre).'
    },
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW'
    }
  },
  
  // PRUGNOLO
  {
    id: 'prugnolo',
    commonName: 'PRUGNOLO',
    cropType: 'ExoticFruit',
    nutrientCategory: 'FRUITING' as NutrientCategory,
    scientificName: 'Prunus spinosa L.',
    family: 'Rosaceae',
    fruitType: 'MediterraneanExotic',
    
    climateRequirements: {
      minTemp: -25,
      maxTemp: 35,
      idealTemp: '15-25°C',
      humidity: 'Medium',
      frostTolerant: true,
      heatTolerant: true
    },
    
    greenhouseRequired: false,
    greenhouseType: 'Cold',
    indoorGrowing: false,
    containerSize: 'Minimo 50L, ideale 100L+',
    
    treeType: 'Shrub',
    maturityYears: 3,
    harvestWindow: {
      startMonth: 9,
      endMonth: 10
    },
    
    italianClimateNotes: 'Il prugnolo è molto adatto al clima italiano, molto resistente al freddo.',
    regionalSuitability: [
      { region: 'Tutte', suitability: 'High', notes: 'Adatto a tutto il territorio italiano, molto resistente' }
    ],
    
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: true,
      sowingDepth: 2,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: { min: 30, max: 90 },
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      watering: 'Irrigazione regolare',
      temperature: 'Temperato'
    },
    transplanting: {
      when: 'Autunno o primavera',
      minTemp: -15,
      spacing: '2-3m tra le piante',
      holeDepth: 40,
      holeWidth: 40,
      soilRequirements: 'Terreno fertile, ben drenato, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il prugnolo è un arbusto spinoso molto rustico che produce prugnole in autunno. I frutti sono acidi e si usano per liquori.',
      commonMistakes: [
        'Terreno troppo umido - preferisce terreno ben drenato',
        'Gestione malattie inadeguata - generalmente resistente',
        'Non raccogliere dopo le gelate - i frutti diventano più dolci dopo le gelate'
      ],
      harvestGuide: 'Raccogli quando le prugnole sono blu-nere e leggermente morbide (settembre-ottobre). Meglio dopo le prime gelate.'
    },
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW'
    }
  }
];







