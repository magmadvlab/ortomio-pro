import { BehavioralTag, PlantMasterSheet } from '../types';
import { parseDaysRange } from '../utils/dateParsing';

// Tag comportamentali comuni per gestire eccezioni delle varietà
export const behavioralTags: BehavioralTag[] = [
  {
    id: 'indeterminate',
    name: 'Indeterminato',
    description: 'Crescita continua in altezza',
    additionalInstructions: [
      'Questa pianta cresce in altezza all\'infinito. Devi mettere un tutore (canna) alto almeno 1,80m.',
      'Devi fare la "sfemminellatura" (togliere i getti ascellari) ogni 7-10 giorni per concentrare l\'energia sui frutti principali.',
      'Lega il fusto al tutore man mano che cresce, usando rafia o legacci morbidi.'
    ]
  },
  {
    id: 'determinate',
    name: 'Determinato',
    description: 'Crescita a cespuglio limitata',
    additionalInstructions: [
      'Questa pianta cresce a cespuglio e si ferma naturalmente. Basta un paletto basso (50-60cm) per supporto.',
      'NON devi togliere i getti laterali - lasciano crescere naturalmente.',
      'La pianta produrrà tutti i frutti in un periodo concentrato.'
    ]
  },
  {
    id: 'chinense',
    name: 'Chinense',
    description: 'Varietà di peperoncino a germinazione lenta',
    additionalInstructions: [
      'Attenzione: questa varietà ha tempi di germinazione più lunghi (14-21 giorni invece di 7-10).',
      'Mantieni temperatura costante a 24-28°C durante la germinazione.',
      'Usa un tappetino riscaldante per garantire temperatura costante.'
    ]
  },
  {
    id: 'annuum',
    name: 'Annuum',
    description: 'Varietà di peperoncino a germinazione veloce',
    additionalInstructions: [
      'Questa varietà germina velocemente (7-10 giorni) a 20-24°C.',
      'Più facile da coltivare rispetto alle varietà Chinense.'
    ]
  },
  {
    id: 'bush',
    name: 'A cespuglio',
    description: 'Crescita compatta a cespuglio',
    additionalInstructions: [
      'Questa varietà cresce in modo compatto e non necessita di supporti.',
      'Ideale per spazi ridotti o coltivazione in vaso.'
    ]
  },
  {
    id: 'vining',
    name: 'Rampicante',
    description: 'Crescita rampicante',
    additionalInstructions: [
      'Questa pianta ha bisogno di supporti verticali (reticolati, canne, pergole).',
      'Lega i tralci al supporto man mano che crescono.'
    ]
  }
];

// Schede Master per Specie (struttura base - sarà popolata nelle fasi successive)
export const plantMasterSheets: PlantMasterSheet[] = [
  // Scheda Pomodoro (completa come esempio di riferimento)
  {
    id: 'pomodoro',
    commonName: 'POMODORO',
    nutrientCategory: 'FRUITING',
    scientificName: 'Solanum lycopersicum L.',
    family: 'Solanaceae',
    
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: false, // Opzionale ma consigliato
      sprayer: true,
      additionalTools: ['Pellicola trasparente', 'Tutori (canna di bambù o paletti)']
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '20-24°C',
      minTemp: 12,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: true,
      coveringInstructions: 'Togli la pellicola non appena vedi il primo archietto verde'
    },
    
    seedlingCare: {
      transplantWhen: 'alla seconda coppia di foglie vere (circa 4-6 foglie totali)',
      lightNeeds: 'Tanta luce diretta o lampade LED',
      lightHours: 14,
      watering: 'Solo quando il terriccio è quasi asciutto',
      warning: 'Altrimenti la pianta fila (diventa alta e sottile)',
      temperature: '18-22°C'
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano stabilmente i 12°C (maggio in Italia)',
      minTemp: 12,
      spacing: '50cm sulla fila, 70cm tra le file',
      holeDepth: 30,
      holeWidth: 40,
      soilRequirements: 'Ricco di azoto e ben drenato. Aggiungi 2-3 manciate di compost sul fondo della buca',
      buryStem: true,
      buryStemInstructions: 'Interra la piantina fino alle prime foglie vere - il gambo farà radici avventizie',
      protectionNeeded: true,
      protectionInstructions: 'Proteggi dal sole diretto per 2-3 giorni con un telo ombreggiante'
    },
    
    availableTags: ['indeterminate', 'determinate'],
    
    baseInstructions: {
      introduction: 'Il pomodoro è perfetto per i principianti perché cresce velocemente e produce molti frutti. È resistente e si adatta bene a diversi tipi di terreno. Con poche cure, otterrai pomodori saporiti per tutta l\'estate.',
      commonMistakes: [
        'Evita di innaffiare troppo perché le radici marciscono. Invece, innaffia solo quando il terreno è asciutto a 2cm di profondità.',
        'Evita di piantare troppo presto all\'aperto perché il freddo uccide le piantine. Invece, aspetta che le temperature notturne siano sopra i 12°C.',
        'Evita di bagnare le foglie durante l\'irrigazione perché favorisce l\'oidio. Invece, innaffia sempre alla base della pianta.',
        'Evita di non legare il fusto perché la pianta si piega e si spezza. Invece, installa un tutore fin dall\'inizio.'
      ],
      harvestGuide: 'Raccogli quando i pomodori hanno raggiunto il colore caratteristico della varietà (rosso intenso per i rossi, giallo per i gialli) e risultano leggermente morbidi al tatto ma ancora sodi. Taglia il picciolo con una forbice affilata, lasciando 1cm di stelo attaccato al frutto. Il momento migliore è la mattina presto quando i frutti sono più freschi. Conserva a temperatura ambiente (non in frigorifero) per mantenere il sapore, e consuma entro 3-5 giorni.'
    },
    
    irrigationDetails: {
      litersPerPlantPerDay: {
        germination: 0.1, // Poca acqua durante germinazione
        vegetative: 1.5, // Crescita vegetativa
        production: 2.5 // Produzione frutti (fase più critica)
      },
      frequency: {
        germination: 'Ogni 2-3 giorni',
        vegetative: 'Ogni 1-2 giorni',
        production: 'Ogni giorno o due volte al giorno in estate'
      },
      method: 'Drip',
      criticalPeriods: [
        {
          phase: 'Fioritura e Allegagione',
          days: [50, 70],
          multiplier: 1.3 // +30% durante fioritura
        },
        {
          phase: 'Maturazione Frutti',
          days: [80, 120],
          multiplier: 1.5 // +50% durante maturazione
        }
      ]
    },
    
    susceptibility: {
      fungalDiseases: ['Peronospora', 'Alternaria', 'Oidio'],
      pests: ['Afidi', 'Cimici', 'Tuta absoluta'],
      preventiveStrategy: 'HIGH',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 20, max: 60 },
          risk: 'High' // Peronospora primaverile
        },
        {
          season: 'Summer',
          daysActive: { min: 40, max: 120 },
          risk: 'High' // Cimici e afidi estivi
        }
      ]
    }
  },
  
  // PEPERONCINO
  {
    id: 'peperoncino',
    commonName: 'PEPERONCINO',
    nutrientCategory: 'FRUITING',
    scientificName: 'Capsicum annuum L.',
    family: 'Solanaceae',
    
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: true, // Consigliato per varietà Chinense
      sprayer: true,
      additionalTools: ['Pellicola trasparente']
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '20-28°C',
      minTemp: 18,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('7-21 giorni'),
      coveringNeeded: true,
      coveringInstructions: 'Togli la pellicola quando compaiono i primi germogli'
    },
    
    seedlingCare: {
      transplantWhen: 'alla seconda coppia di foglie vere',
      lightNeeds: 'Tanta luce diretta o lampade LED (14-16h)',
      lightHours: 14,
      watering: 'Solo quando il terriccio è quasi asciutto',
      warning: 'Mantieni temperatura costante - i peperoncini sono sensibili agli sbalzi',
      temperature: '20-25°C'
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano stabilmente i 15°C (maggio-giugno in Italia)',
      minTemp: 15,
      spacing: '40cm sulla fila, 50cm tra le file',
      holeDepth: 25,
      holeWidth: 30,
      soilRequirements: 'Ricco di potassio e ben drenato. Aggiungi compost maturo',
      buryStem: false,
      protectionNeeded: true,
      protectionInstructions: 'Proteggi dal vento forte e dal sole diretto per i primi giorni'
    },
    
    availableTags: ['chinense', 'annuum'],
    
    baseInstructions: {
      introduction: 'Il peperoncino è una pianta gratificante da coltivare, con varietà che vanno dal dolce al piccantissimo. Richiede calore e luce, ma con le giuste condizioni produrrà frutti abbondanti per tutta l\'estate.',
      commonMistakes: [
        'Evita di piantare troppo presto - i peperoncini amano il caldo e non tollerano il freddo sotto i 15°C.',
        'Evita di innaffiare troppo - preferiscono terreno leggermente asciutto tra un\'irrigazione e l\'altra.',
        'Evita di concimare troppo con azoto - favorisce foglie a discapito dei frutti. Usa concimi ricchi di potassio.',
        'Evita di raccogliere troppo presto - lascia maturare i frutti per il massimo sapore e piccantezza.'
      ],
      harvestGuide: 'Raccogli i peperoncini quando hanno raggiunto il colore caratteristico della varietà (verde, giallo, arancione, rosso). Taglia il picciolo con una forbice, lasciando un pezzetto di stelo. I frutti maturi sono più piccanti. Conserva in un luogo fresco e asciutto, oppure essicca per conservarli a lungo.'
    },
    
    susceptibility: {
      fungalDiseases: ['Peronospora', 'Alternaria'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Summer',
          daysActive: { min: 40, max: 100 },
          risk: 'Medium' // Afidi estivi
        }
      ]
    },
    
    irrigationDetails: {
      litersPerPlantPerDay: {
        germination: 0.1,
        vegetative: 1.2,
        production: 2.0 // Fioritura e maturazione frutti
      },
      frequency: {
        germination: 'Ogni 2-3 giorni',
        vegetative: 'Ogni 1-2 giorni',
        production: 'Ogni giorno'
      },
      method: 'Drip',
      criticalPeriods: [
        {
          phase: 'Fioritura',
          days: [50, 80],
          multiplier: 1.2
        }
      ]
    }
  },
  
  // ZUCCHINA
  {
    id: 'zucchina',
    commonName: 'ZUCCHINA',
    nutrientCategory: 'FRUITING',
    scientificName: 'Cucurbita pepo L.',
    family: 'Cucurbitaceae',
    
    requiredTools: {
      seedTray: true,
      seedTrayType: 'vasetti',
      seedSoil: true,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 2,
      idealTemp: '20-25°C',
      minTemp: 15,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('5-10 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 2-3 foglie vere (circa 3-4 settimane)',
      lightNeeds: 'Luce diretta o lampade LED',
      lightHours: 12,
      watering: 'Mantieni terreno umido ma non bagnato',
      warning: 'Le zucchine crescono velocemente - non lasciare troppo tempo nel semenzaio',
      temperature: '18-22°C'
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano stabilmente i 12°C (maggio in Italia)',
      minTemp: 12,
      spacing: '80-100cm sulla fila, 100cm tra le file',
      holeDepth: 30,
      holeWidth: 40,
      soilRequirements: 'Ricco di sostanza organica e ben drenato. Aggiungi compost o letame maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: ['bush'],
    
    baseInstructions: {
      introduction: 'La zucchina è una delle piante più produttive dell\'orto. Cresce velocemente e produce frutti abbondanti per tutta l\'estate. Perfetta per principianti grazie alla sua resistenza.',
      commonMistakes: [
        'Evita di lasciare i frutti troppo grandi - raccogli quando sono lunghi 15-20cm per il miglior sapore.',
        'Evita di piantare troppo vicino - le zucchine hanno bisogno di spazio per svilupparsi.',
        'Evita di bagnare le foglie - favorisce l\'oidio. Innaffia alla base della pianta.',
        'Evita di dimenticare di raccogliere - i frutti crescono velocemente e se diventano troppo grandi diventano amari.'
      ],
      harvestGuide: 'Raccogli le zucchine quando sono lunghe 15-20cm e ancora teneri. Taglia il picciolo con un coltello affilato. Raccogli regolarmente per stimolare la produzione continua. I fiori maschili (quelli senza zucchina) sono commestibili e deliziosi fritti.'
    },
    
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'HIGH',
      criticalPeriods: [
        {
          season: 'Summer',
          daysActive: { min: 30, max: 90 },
          risk: 'High' // Oidio estivo
        }
      ]
    },
    
    irrigationDetails: {
      litersPerPlantPerDay: {
        germination: 0.1,
        vegetative: 2.0,
        production: 3.5 // Zucchine hanno bisogno di molta acqua
      },
      frequency: {
        germination: 'Ogni 2-3 giorni',
        vegetative: 'Ogni giorno',
        production: 'Due volte al giorno in estate'
      },
      method: 'Drip',
      criticalPeriods: [
        {
          phase: 'Fioritura e Produzione',
          days: [40, 100],
          multiplier: 1.4 // +40% durante produzione
        }
      ]
    }
  },
  
  // MELANZANA
  {
    id: 'melanzana',
    commonName: 'MELANZANA',
    nutrientCategory: 'FRUITING',
    scientificName: 'Solanum melongena L.',
    family: 'Solanaceae',
    
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: true,
      sprayer: true,
      additionalTools: ['Pellicola trasparente', 'Tutori']
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '24-28°C',
      minTemp: 18,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('10-21 giorni'),
      coveringNeeded: true,
      coveringInstructions: 'Togli la pellicola quando compaiono i primi germogli'
    },
    
    seedlingCare: {
      transplantWhen: 'alla seconda coppia di foglie vere',
      lightNeeds: 'Tanta luce diretta o lampade LED',
      lightHours: 14,
      watering: 'Solo quando il terriccio è quasi asciutto',
      warning: 'Le melanzane amano il caldo - mantieni temperatura costante',
      temperature: '20-25°C'
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano stabilmente i 15°C (maggio-giugno in Italia)',
      minTemp: 15,
      spacing: '50cm sulla fila, 60cm tra le file',
      holeDepth: 30,
      holeWidth: 35,
      soilRequirements: 'Ricco di sostanza organica e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: true,
      protectionInstructions: 'Proteggi dal vento e dal freddo - le melanzane sono molto sensibili'
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La melanzana è una pianta che ama il caldo e richiede pazienza, ma produce frutti deliziosi. È più esigente del pomodoro ma con le giuste condizioni darà ottimi risultati.',
      commonMistakes: [
        'Evita di piantare troppo presto - le melanzane sono molto sensibili al freddo.',
        'Evita di innaffiare troppo - preferiscono terreno leggermente asciutto.',
        'Evita di non supportare la pianta - alcuni frutti possono essere pesanti.',
        'Evita di raccogliere troppo tardi - i frutti maturi diventano amari e con molti semi.'
      ],
      harvestGuide: 'Raccogli le melanzane quando la buccia è lucida e il frutto cede leggermente alla pressione ma è ancora sodo. Taglia il picciolo con un coltello affilato. Raccogli regolarmente per stimolare la produzione. I frutti troppo maturi hanno molti semi e sapore amaro.'
    },
    
    susceptibility: {
      fungalDiseases: ['Peronospora'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 20, max: 60 },
          risk: 'Medium' // Peronospora primaverile
        }
      ]
    }
  },
  
  // LATTUGA
  {
    id: 'lattuga',
    commonName: 'LATTUGA',
    nutrientCategory: 'LEAFY',
    scientificName: 'Lactuca sativa L.',
    family: 'Asteraceae',
    
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.3,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('5-10 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 3-4 foglie vere',
      lightNeeds: 'Luce diretta o lampade LED',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Le lattughe non amano il caldo eccessivo',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le temperature sono stabili (marzo-aprile per primavera, agosto-settembre per autunno)',
      minTemp: 5,
      spacing: '25-30cm sulla fila, 30cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La lattuga è perfetta per i principianti e può essere coltivata quasi tutto l\'anno. Cresce velocemente e può essere raccolta foglia per foglia o intera.',
      commonMistakes: [
        'Evita di piantare in pieno sole estivo - preferisce ombra parziale in estate.',
        'Evita di innaffiare troppo - può causare marciume. Mantieni terreno umido ma non bagnato.',
        'Evita di piantare troppo fitto - le lattughe hanno bisogno di spazio per svilupparsi.',
        'Evita di lasciare andare a seme - raccogli prima che fiorisca per il miglior sapore.'
      ],
      harvestGuide: 'Raccogli le foglie esterne quando sono grandi abbastanza, oppure taglia l\'intera pianta alla base quando ha raggiunto la dimensione desiderata. Per le lattughe a cespo, raccogli quando il cespo è compatto e ben formato. Raccogli al mattino per la massima croccantezza.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    },
    
    irrigationDetails: {
      litersPerPlantPerDay: {
        germination: 0.05,
        vegetative: 0.6,
        production: 0.8 // Lattughe hanno bisogno di acqua costante ma non eccessiva
      },
      frequency: {
        germination: 'Ogni 2 giorni',
        vegetative: 'Ogni 1-2 giorni',
        production: 'Ogni giorno'
      },
      method: 'Drip',
      criticalPeriods: [
        {
          phase: 'Formazione Cespo',
          days: [30, 50],
          multiplier: 1.2
        }
      ]
    }
  },
  
  // BASILICO
  {
    id: 'basilico',
    commonName: 'BASILICO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Ocimum basilicum L.',
    family: 'Lamiaceae',
    
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.3,
      idealTemp: '20-25°C',
      minTemp: 15,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta o lampade LED',
      lightHours: 12,
      watering: 'Mantieni terreno umido ma non bagnato',
      warning: 'Il basilico ama il caldo e la luce',
      temperature: '20-25°C'
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano stabilmente i 15°C (maggio in Italia)',
      minTemp: 15,
      spacing: '20-25cm sulla fila, 25cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il basilico è un\'erba aromatica essenziale per la cucina italiana. Facile da coltivare, cresce velocemente e può essere raccolto continuamente durante l\'estate.',
      commonMistakes: [
        'Evita di lasciare fiorire - taglia i fiori per mantenere la pianta produttiva.',
        'Evita di innaffiare le foglie - favorisce malattie fungine. Innaffia alla base.',
        'Evita di piantare troppo presto - il basilico non tollera il freddo.',
        'Evita di raccogliere troppo poco - la raccolta regolare stimola la crescita.'
      ],
      harvestGuide: 'Raccogli le foglie tagliandole con le dita o con forbici, iniziando dalle foglie più grandi. Taglia sempre sopra una coppia di foglie per stimolare la crescita laterale. Raccogli regolarmente per evitare che la pianta fiorisca. Usa subito o conserva in frigorifero avvolto in un panno umido.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // FAGIOLO
  {
    id: 'fagiolo',
    commonName: 'FAGIOLO',
    nutrientCategory: 'LEGUME',
    scientificName: 'Phaseolus vulgaris L.',
    family: 'Fabaceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: false,
      additionalTools: []
    },
    
    germination: {
      preSoak: true,
      sowingDepth: 2,
      idealTemp: '18-25°C',
      minTemp: 10,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido durante la germinazione',
      warning: 'I fagioli non amano essere trapiantati',
      temperature: '18-25°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra quando le temperature notturne superano i 10°C (aprile-maggio)',
      minTemp: 10,
      spacing: '15-20cm sulla fila per nani, 30cm per rampicanti, 50cm tra le file',
      holeDepth: 2,
      holeWidth: 5,
      soilRequirements: 'Terreno fertile e ben drenato. Non aggiungere troppo azoto - i fagioli lo fissano da soli',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: ['bush', 'vining'],
    
    baseInstructions: {
      introduction: 'Il fagiolo è una pianta facile da coltivare e molto produttiva. I fagioli nani sono compatti, mentre quelli rampicanti necessitano di supporti ma producono di più.',
      commonMistakes: [
        'Evita di trapiantare - i fagioli non amano essere spostati. Semina direttamente in terra.',
        'Evita di concimare troppo con azoto - i fagioli lo fissano dall\'aria.',
        'Evita di raccogliere troppo tardi - i baccelli diventano duri e fibrosi.',
        'Evita di non supportare i rampicanti - hanno bisogno di reti o canne per crescere.'
      ],
      harvestGuide: 'Raccogli i baccelli quando sono teneri e i semi all\'interno sono ancora piccoli. Taglia il baccello con le dita o con forbici. Raccogli regolarmente per stimolare la produzione continua. I baccelli troppo maturi sono duri e non commestibili.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Summer',
          daysActive: { min: 30, max: 80 },
          risk: 'Medium' // Afidi estivi
        }
      ]
    },
    
    irrigationDetails: {
      litersPerPlantPerDay: {
        germination: 0.1,
        vegetative: 1.0,
        production: 1.5 // Fioritura e formazione baccelli
      },
      frequency: {
        germination: 'Ogni 2-3 giorni',
        vegetative: 'Ogni 2 giorni',
        production: 'Ogni 1-2 giorni'
      },
      method: 'Drip',
      criticalPeriods: [
        {
          phase: 'Fioritura e Formazione Baccelli',
          days: [40, 70],
          multiplier: 1.3
        }
      ]
    }
  },
  
  // PISELLO
  {
    id: 'pisello',
    commonName: 'PISELLO',
    nutrientCategory: 'LEGUME',
    scientificName: 'Pisum sativum L.',
    family: 'Fabaceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: false,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 2,
      idealTemp: '10-18°C',
      minTemp: 5,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido durante la germinazione',
      warning: 'I piselli amano il fresco e non il caldo',
      temperature: '10-18°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra in febbraio-marzo (preferiscono il fresco)',
      minTemp: 5,
      spacing: '5-10cm sulla fila per nani, 10-15cm per rampicanti, 30cm tra le file',
      holeDepth: 2,
      holeWidth: 5,
      soilRequirements: 'Terreno fertile e ben drenato. Non aggiungere troppo azoto',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: ['bush', 'vining'],
    
    baseInstructions: {
      introduction: 'Il pisello è una pianta da clima fresco, perfetta per la primavera. Cresce velocemente e produce baccelli dolci e saporiti. I rampicanti necessitano di supporti ma producono di più.',
      commonMistakes: [
        'Evita di piantare troppo tardi - i piselli amano il fresco primaverile.',
        'Evita di non supportare i rampicanti - hanno bisogno di reti o canne.',
        'Evita di raccogliere troppo tardi - i piselli diventano duri e amidacei.',
        'Evita di innaffiare troppo - preferiscono terreno umido ma non bagnato.'
      ],
      harvestGuide: 'Raccogli i baccelli quando sono pieni ma ancora teneri. I piselli devono essere dolci e croccanti. Taglia il baccello con le dita o con forbici. Raccogli regolarmente per stimolare la produzione. I baccelli troppo maturi hanno piselli duri e amidacei.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 30, max: 70 },
          risk: 'Medium' // Afidi primaverili
        }
      ]
    }
  },
  
  // CAROTA
  {
    id: 'carota',
    commonName: 'CAROTA',
    nutrientCategory: 'ROOT',
    scientificName: 'Daucus carota L.',
    family: 'Apiaceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: false,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido durante la germinazione',
      warning: 'Le carote hanno radici delicate - non trapiantare',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra da marzo a luglio',
      minTemp: 5,
      spacing: 'Diradare a 5-8cm sulla fila, 25-30cm tra le file',
      holeDepth: 0.5,
      holeWidth: 2,
      soilRequirements: 'Terreno sabbioso e ben drenato, senza sassi. Scava in profondità e aggiungi sabbia se il terreno è pesante',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La carota è una radice deliziosa e nutriente. Richiede terreno preparato bene ma è relativamente facile da coltivare. Non trapiantare mai - semina direttamente in terra.',
      commonMistakes: [
        'Evita di trapiantare - le carote hanno radici delicate che si danneggiano facilmente.',
        'Evita terreno pesante o con sassi - le carote si deformano o si spezzano.',
        'Evita di non diradare - le carote hanno bisogno di spazio per svilupparsi.',
        'Evita di innaffiare troppo - può causare spaccature nelle radici.'
      ],
      harvestGuide: 'Raccogli le carote quando hanno raggiunto la dimensione desiderata (di solito 60-90 giorni dopo la semina). Scava delicatamente intorno alla carota e tira verso l\'alto. Le carote possono essere lasciate in terra e raccolte quando servono. Le carote giovani sono più dolci e tenere.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Mosca della carota'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // CIPOLLA
  {
    id: 'cipolla',
    commonName: 'CIPOLLA',
    nutrientCategory: 'ROOT',
    scientificName: 'Allium cepa L.',
    family: 'Amaryllidaceae',
    
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('10-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 3-4 foglie e sono alte 10-15cm',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido ma non bagnato',
      warning: 'Le cipolle amano il sole e terreno ben drenato',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile)',
      minTemp: 5,
      spacing: '10-15cm sulla fila, 25-30cm tra le file',
      holeDepth: 5,
      holeWidth: 10,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost ma non troppo azoto',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La cipolla è un ortaggio fondamentale in cucina. Può essere coltivata da seme o da bulbo. Richiede pazienza ma è relativamente facile da coltivare.',
      commonMistakes: [
        'Evita terreno troppo ricco di azoto - favorisce foglie a discapito del bulbo.',
        'Evita di innaffiare troppo - le cipolle preferiscono terreno leggermente asciutto.',
        'Evita di non diradare - le cipolle hanno bisogno di spazio per sviluppare i bulbi.',
        'Evita di raccogliere troppo presto - aspetta che le foglie si secchino naturalmente.'
      ],
      harvestGuide: 'Raccogli le cipolle quando le foglie sono secche e cadute (luglio-agosto). Scava delicatamente e lascia asciugare al sole per alcuni giorni. Conserva in un luogo fresco, asciutto e buio. Le cipolle da consumo fresco possono essere raccolte prima quando sono ancora verdi.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Tripidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  }
];

