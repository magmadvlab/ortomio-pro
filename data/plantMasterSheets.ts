import { BehavioralTag, PlantMasterSheet, NutrientCategory } from '../types';
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
      optimalTemp: 22,
      optimalTempRange: { min: 20, max: 24 },
      maxTemp: 28,
      heatingMatTemp: 22, // Opzionale ma aiuta
      humidityLevel: 'High',
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: true,
      coveringType: 'PlasticWrap',
      coveringInstructions: 'Togli la pellicola non appena vedi il primo archietto verde',
      coveringRemoveWhen: 'Togli IMMEDIATAMENTE la pellicola appena vedi il primo cotiledone verde emergere',
      soilMoistureCheck: 'Tocca con il dito - deve essere umido ma non bagnato. Se esce acqua quando premi, è troppo bagnato',
      ventilationNeeded: false,
      // Metodo alternativo: scottex (consigliato per principianti)
      alternativeMethod: {
        name: 'Metodo Scottex',
        description: 'Germinazione su scottex in bicchieri di plastica - metodo più sicuro per principianti',
        instructions: [
          'Prepara bicchieri di plastica grandi da tavola con scottex umido sul fondo',
          'Metti i semi sullo scottex e copri con altro scottex umido per mantenere umidità',
          'L\'acqua evapora lentamente evitando che i semi rimangano a mollo',
          'Il secondo giorno pulisci i semi delicatamente rimuovendo eventuali residui (le impurità a bagno si ammorbidiscono)',
          'Non lasciare i semi all\'aria - coprili sempre con scottex per mantenere umidità',
          'Quando vedi la radichetta (2-3mm), trapianta immediatamente in terriccio'
        ],
        advantages: [
          'Riduce rischio di muffa sui semi',
          'Controllo visivo diretto della germinazione',
          'Evita problemi di eccessiva umidità nel terriccio'
        ]
      },
      // Gestione muffa
      moldPrevention: 'Se compaiono muffe sui semi, puliscili delicatamente il secondo giorno (le impurità a bagno si ammorbidiscono). Acquista sempre più semi del necessario per compensare eventuali perdite.'
    },
    
    seedlingCare: {
      transplantWhen: 'alla seconda coppia di foglie vere (circa 4-6 foglie totali)',
      lightNeeds: 'Tanta luce diretta o lampade LED',
      lightHours: 14,
      lightDetails: {
        type: 'LED',
        distance: 15,
        hours: 14,
        intensity: 'High',
        spectrum: 'Full'
      },
      temperature: '18-22°C',
      temperatureRange: { min: 18, max: 22 },
      watering: 'Solo quando il terriccio è quasi asciutto. Innaffia a fine giornata quando i raggi del sole si indeboliscono per evitare l\'effetto lente prodotto dall\'acqua sopra le foglie che le brucia',
      wateringMethod: 'Bottom',
      bottomWateringDepth: 2,
      bottomWateringDuration: 20,
      wateringTiming: 'Fine giornata (quando i raggi del sole si indeboliscono) per evitare effetto lente che brucia le foglie',
      soilCare: 'Se la temperatura è molto alta e il terriccio tende a seccarsi, smuovilo ogni tanto con una forchetta prima di annaffiare',
      ventilation: {
        needed: true,
        method: 'ventilatore leggero o finestra leggermente aperta',
        duration: '2-3 ore al giorno'
      },
      firstFertilization: {
        when: 'alla seconda coppia di foglie vere',
        type: 'concime liquido bilanciato (NPK 20-20-20)',
        dilution: '1/4 della dose consigliata'
      },
      warning: 'Altrimenti la pianta fila (diventa alta e sottile)',
      // Problema comune: cotiledoni imprigionati
      commonIssues: {
        trappedCotyledons: {
          problem: 'Cotiledoni imprigionati nel tegumento del seme',
          solution: 'Aiuta delicatamente i cotiledoni a liberarsi bagnando il tegumento con acqua tiepida e rimuovendolo con delicatezza usando pinzette o dita',
          prevention: 'Mantieni umidità costante durante la germinazione'
        }
      }
    },
    
    intermediateRepotting: {
      needed: true,
      when: '25-30 giorni dopo la semina, quando le radici escono dai fori di drenaggio',
      trigger: 'radici visibili dai fori di drenaggio o pianta troppo grande per il contenitore',
      containerSize: 'vaso 10-12cm di diametro',
      soilMix: 'terriccio universale + 30% perlite',
      buryStem: true,
      buryStemInstructions: 'Puoi interrare parte del gambo per favorire radici avventizie',
      aftercare: 'mantieni umido per 2-3 giorni, poi normale'
    },
    
    hardening: {
      duration: 10,
      procedure: {
        days1to3: 'Esponi le piantine all\'aperto per 2-3 ore al mattino in luogo ombreggiato. Riporta dentro prima del caldo pomeridiano.',
        days4to6: 'Aumenta l\'esposizione a 4-6 ore. Puoi esporre anche al sole diretto per 1-2 ore al mattino. Riporta dentro la sera.',
        days7to10: 'Esponi per 6-8 ore, incluso sole diretto. Se le temperature notturne superano i 12°C, lascia fuori anche la notte negli ultimi 2 giorni.',
        finalCheck: 'Le piantine sono pronte se hanno foglie verdi e robuste, gambo forte, e hanno resistito alle condizioni esterne senza stress'
      },
      temperatureMin: 12
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
      protectionInstructions: 'Proteggi dal sole diretto per 2-3 giorni con un telo ombreggiante',
      finalPlanting: {
        containerOptions: {
          minSize: 'vaso 40cm di diametro (per varietà indeterminate)',
          soilMix: 'terriccio universale + 30% perlite + compost maturo',
          drainage: 'assicurati che il vaso abbia fori di drenaggio e uno strato di argilla espansa sul fondo'
        },
        groundPlanting: {
          soilPrep: 'vanga profonda 40cm, aggiungi 2-3 manciate di compost maturo sul fondo della buca',
          spacing: '50cm sulla fila, 70cm tra le file'
        },
        raisedBed: {
          bedHeight: 30,
          soilMix: 'mix di terra, compost maturo e perlite',
          spacing: '50cm sulla fila, 70cm tra le file'
        },
        supportInstallation: {
          when: 'AtTransplant',
          instructions: 'INSTALLA SUBITO un tutore alto almeno 1,80m per varietà indeterminate, o 50-60cm per determinate. Lega delicatamente il fusto.'
        },
        finalFertilization: {
          type: 'Vegetative',
          product: 'concime ricco di azoto nella fase vegetativa, poi potassio in fioritura',
          timing: 'applica dopo 2 settimane dal trapianto con azoto, poi passa a potassio durante fioritura'
        }
      }
    },
    
    supportRequirements: {
      needsSupport: true,
      supportType: 'Stake',
      supportHeight: 150,
      supportTiming: 'AtTransplant',
      notes: 'Installa tutore durante trapianto. Lega delicatamente man mano che cresce. Varietà indeterminate crescono continuamente.'
    },
    
    availableTags: ['indeterminate', 'determinate'],
    
    baseInstructions: {
      introduction: 'Il pomodoro è perfetto per i principianti perché cresce velocemente e produce molti frutti. È resistente e si adatta bene a diversi tipi di terreno. Con poche cure, otterrai pomodori saporiti per tutta l\'estate.',
      commonMistakes: [
        'Evita di innaffiare troppo perché le radici marciscono. Invece, innaffia solo quando il terreno è asciutto a 2cm di profondità.',
        'Evita di piantare troppo presto all\'aperto perché il freddo uccide le piantine. Invece, aspetta che le temperature notturne siano sopra i 12°C.',
        'Evita di innaffiare durante le ore calde - l\'acqua sulle foglie crea un effetto lente che le brucia. Innaffia a fine giornata.',
        'Evita di bagnare le foglie durante l\'irrigazione perché favorisce l\'oidio. Invece, innaffia sempre alla base della pianta.',
        'Evita di non legare il fusto perché la pianta si piega e si spezza. Invece, installa un tutore fin dall\'inizio.'
      ],
      growthNotes: [
        'Per varietà determinate: la pianta assumerà una forma a cespuglio. Puoi eliminare i rametti secchi alla base, ma lascia sempre un cm del ramo.',
        'Per varietà indeterminate: cresce continuamente in altezza. Rimuovi i getti ascellari (femminelle) ogni 7-10 giorni per concentrare l\'energia sui frutti principali.',
        'Se il terriccio si compatta troppo, smuovilo delicatamente con una forchetta prima di annaffiare per migliorare l\'aerazione.'
      ],
      harvestGuide: 'Raccogli quando i pomodori hanno raggiunto il colore caratteristico della varietà (rosso intenso per i rossi, giallo per i gialli) e risultano leggermente morbidi al tatto ma ancora sodi. Taglia il picciolo con una forbice affilata, lasciando 1cm di stelo attaccato al frutto. Il momento migliore è la mattina presto quando i frutti sono più freschi. Conserva a temperatura ambiente (non in frigorifero) per mantenere il sapore, e consuma entro 3-5 giorni.'
    },
    
    //    //   frequency: {
    //     germination: 'Ogni 2-3 giorni',
    //     vegetative: 'Ogni 1-2 giorni',
    //     production: 'Ogni giorno o due volte al giorno in estate'
    //   },
    //   method: 'Drip',
    //   criticalPeriods: [
    //     {
    //       phase: 'Fioritura e Allegagione',
    //       days: [50, 70],
    //       multiplier: 1.3 // +30% durante fioritura
    //     },
    //     {
    //       phase: 'Maturazione Frutti',
    //       days: [80, 120],
    //       multiplier: 1.5 // +50% durante maturazione
    //     }
    //   ]
    // },
    
    visualCategory: 'Orto',
    
    familySpecificNotes: {
      growthSpeed: 'Fast',
      sowingTimingAdvice: 'NON seminare insieme ai peperoncini. Semina 30-40 giorni dopo per evitare crescita eccessiva.',
      containerSizeAdvice: 'Vaschette standard vanno bene, ma trapianta presto per evitare filatura.',
      transplantSensitivity: 'Low',
      specialCareInstructions: [
        'Tende a "filare" (allungarsi) molto più dei peperoncini - luci vicinissime!',
        'Al travaso intermedio e finale: puoi interrare quasi tutto il gambo, lasciando solo il ciuffo di foglie. Il gambo sepolto emetterà radici avventizie.',
        'Crescita molto veloce - gestisci lo spazio con attenzione.'
      ],
      comparisonWithSimilar: 'Simile a peperoncini nella fase iniziale, ma crescita molto più rapida. Richiede gestione spazio più attenta.'
    },
    
    equipmentCleaning: {
      seedTrayCleaning: 'Pulisci e sterilizza dopo ogni uso. I pomodori possono portare patogeni.',
      heatingMatCleaning: 'Pulisci con panno umido e alcool dopo ogni ciclo.',
      soilReuse: 'CompostOnly',
      sterilizationRequired: true
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
      optimalTemp: 24,
      optimalTempRange: { min: 20, max: 28 },
      maxTemp: 32,
      heatingMatTemp: 24, // Temperatura ottimale per tappetino riscaldante
      humidityLevel: 'High',
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('7-21 giorni'),
      coveringNeeded: true,
      coveringType: 'PlasticWrap',
      coveringInstructions: 'Togli la pellicola quando compaiono i primi germogli',
      coveringRemoveWhen: 'Togli IMMEDIATAMENTE la pellicola appena vedi il primo cotiledone verde emergere',
      soilMoistureCheck: 'Tocca con il dito - deve essere umido ma non bagnato. Se esce acqua quando premi, è troppo bagnato',
      ventilationNeeded: false,
      // Metodo alternativo: scottex (consigliato per principianti)
      alternativeMethod: {
        name: 'Metodo Scottex',
        description: 'Germinazione su scottex in bicchieri di plastica - metodo più sicuro per principianti',
        instructions: [
          'Prepara bicchieri di plastica grandi da tavola con scottex umido sul fondo',
          'Metti i semi sullo scottex e copri con altro scottex umido per mantenere umidità',
          'L\'acqua evapora lentamente evitando che i semi rimangano a mollo',
          'Il secondo giorno pulisci i semi delicatamente rimuovendo eventuali residui di peperoncino (le impurità a bagno si ammorbidiscono)',
          'Non lasciare i semi all\'aria - coprili sempre con scottex per mantenere umidità',
          'Quando vedi la radichetta (2-3mm), trapianta immediatamente in terriccio'
        ],
        advantages: [
          'Riduce rischio di muffa sui semi',
          'Controllo visivo diretto della germinazione',
          'Evita problemi di eccessiva umidità nel terriccio'
        ]
      },
      // Gestione muffa
      moldPrevention: 'Se compaiono muffe sui semi, puliscili delicatamente il secondo giorno (le impurità a bagno si ammorbidiscono). Acquista sempre più semi del necessario per compensare eventuali perdite.'
    },
    
    seedlingCare: {
      transplantWhen: 'alla seconda coppia di foglie vere',
      lightNeeds: 'Tanta luce diretta o lampade LED (14-16h)',
      lightHours: 14,
      lightDetails: {
        type: 'LED',
        distance: 15,
        hours: 14,
        intensity: 'High',
        spectrum: 'Full'
      },
      temperature: '20-25°C',
      temperatureRange: { min: 20, max: 25 },
      watering: 'Solo quando il terriccio è quasi asciutto. Innaffia a fine giornata quando i raggi del sole si indeboliscono per evitare l\'effetto lente prodotto dall\'acqua sopra le foglie che le brucia',
      wateringMethod: 'Bottom',
      bottomWateringDepth: 2,
      bottomWateringDuration: 20,
      wateringTiming: 'Fine giornata (quando i raggi del sole si indeboliscono) per evitare effetto lente che brucia le foglie',
      soilCare: 'Se la temperatura è molto alta e il terriccio tende a seccarsi, smuovilo ogni tanto con una forchetta prima di annaffiare',
      ventilation: {
        needed: true,
        method: 'ventilatore leggero o finestra leggermente aperta',
        duration: '2-3 ore al giorno'
      },
      firstFertilization: {
        when: 'alla seconda coppia di foglie vere',
        type: 'concime liquido bilanciato (NPK 20-20-20)',
        dilution: '1/4 della dose consigliata'
      },
      warning: 'Mantieni temperatura costante - i peperoncini sono sensibili agli sbalzi',
      // Problema comune: cotiledoni imprigionati
      commonIssues: {
        trappedCotyledons: {
          problem: 'Cotiledoni imprigionati nel tegumento del seme',
          solution: 'Aiuta delicatamente i cotiledoni a liberarsi bagnando il tegumento con acqua tiepida e rimuovendolo con delicatezza usando pinzette o dita',
          prevention: 'Mantieni umidità costante durante la germinazione'
        }
      }
    },
    
    intermediateRepotting: {
      needed: true,
      when: '25-30 giorni dopo la semina, quando le radici escono dai fori di drenaggio',
      trigger: 'radici visibili dai fori di drenaggio o pianta troppo grande per il contenitore',
      containerSize: 'vaso 10-12cm di diametro',
      soilMix: 'terriccio universale + 30% perlite per drenaggio ottimale',
      buryStem: false,
      aftercare: 'mantieni umido per 2-3 giorni, poi normale. Evita concimazione per la prima settimana'
    },
    
    hardening: {
      duration: 10,
      procedure: {
        days1to3: 'Esponi le piantine all\'aperto per 2-3 ore al mattino in luogo ombreggiato. Riporta dentro prima del caldo pomeridiano.',
        days4to6: 'Aumenta l\'esposizione a 4-6 ore. Puoi esporre anche al sole diretto per 1-2 ore al mattino. Riporta dentro la sera.',
        days7to10: 'Esponi per 6-8 ore, incluso sole diretto. Se le temperature notturne superano i 15°C, lascia fuori anche la notte negli ultimi 2 giorni.',
        finalCheck: 'Le piantine sono pronte se hanno foglie verdi e robuste, gambo forte, e hanno resistito alle condizioni esterne senza stress'
      },
      temperatureMin: 15
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
      protectionInstructions: 'Proteggi dal vento forte e dal sole diretto per i primi giorni',
      finalPlanting: {
        containerOptions: {
          minSize: 'vaso 30cm di diametro',
          soilMix: 'terriccio universale + 30% perlite + compost maturo',
          drainage: 'assicurati che il vaso abbia fori di drenaggio e uno strato di argilla espansa sul fondo'
        },
        groundPlanting: {
          soilPrep: 'vanga profonda 30cm, aggiungi 2-3 manciate di compost maturo sul fondo della buca',
          spacing: '40cm sulla fila, 50cm tra le file'
        },
        raisedBed: {
          bedHeight: 30,
          soilMix: 'mix di terra, compost maturo e perlite',
          spacing: '40cm sulla fila, 50cm tra le file'
        },
        supportInstallation: {
          when: 'AsNeeded',
          instructions: 'Installa un paletto di 80cm quando la pianta raggiunge 30-40cm di altezza, o prima se zona ventosa'
        },
        finalFertilization: {
          type: 'Vegetative',
          product: 'concime ricco di potassio (NPK 10-10-20)',
          timing: 'applica dopo 2 settimane dal trapianto, poi ogni 3-4 settimane durante la produzione'
        }
      }
    },
    
    supportRequirements: {
      needsSupport: true,
      supportType: 'Stake',
      supportHeight: 80,
      supportTiming: 'AsNeeded',
      notes: 'Paletto opzionale ma consigliato per varietà alte o zone ventose.'
    },
    
    availableTags: ['chinense', 'annuum'],
    
    baseInstructions: {
      introduction: 'Il peperoncino è una pianta gratificante da coltivare, con varietà che vanno dal dolce al piccantissimo. Richiede calore e luce, ma con le giuste condizioni produrrà frutti abbondanti per tutta l\'estate.',
      commonMistakes: [
        'Evita di piantare troppo presto - i peperoncini amano il caldo e non tollerano il freddo sotto i 15°C.',
        'Evita di innaffiare troppo - preferiscono terreno leggermente asciutto tra un\'irrigazione e l\'altra.',
        'Evita di innaffiare durante le ore calde - l\'acqua sulle foglie crea un effetto lente che le brucia. Innaffia a fine giornata.',
        'Evita di concimare troppo con azoto - favorisce foglie a discapito dei frutti. Usa concimi ricchi di potassio.',
        'Evita di raccogliere troppo presto - lascia maturare i frutti per il massimo sapore e piccantezza.'
      ],
      growthNotes: [
        'Crescendo, la piantina assumerà una forma a Y',
        'Puoi eliminare i rametti superflui che crescono alla base della piantina, o levare solo quelli secchi, ma lascia sempre un cm del ramo',
        'La pianta crescerà molto velocemente - legala a un tutore quando raggiunge 30-40cm di altezza'
      ],
      harvestGuide: 'Raccogli i peperoncini quando hanno raggiunto il colore caratteristico della varietà (verde, giallo, arancione, rosso). Taglia il picciolo con una forbice, lasciando un pezzetto di stelo. I frutti maturi sono più piccanti. Conserva in un luogo fresco e asciutto, oppure essicca per conservarli a lungo.',
      seedExtraction: {
        instructions: [
          'IMPORTANTE: Usa sempre guanti in lattice quando maneggi peperoncini piccanti',
          'Apri il peperoncino con un coltello (con guanti)',
          'Estrai i semi delicatamente',
          'Lascia essiccare i semi in luogo buio e asciutto',
          'Conserva i semi in contenitori sigillati in luogo fresco e buio'
        ],
        drying: {
          method: 'Essiccazione peperoncini interi',
          steps: [
            'Metti i peperoncini in forno a 70°C per 40 minuti per far evaporare l\'umidità',
            'Dopo i 40 minuti, esponili al sole per qualche giorno',
            'Quando sono completamente secchi, conservali in contenitori sigillati'
          ]
        }
      }
    },
    
    familySpecificNotes: {
      growthSpeed: 'Slow',
      sowingTimingAdvice: 'Semina a gennaio/febbraio (base di riferimento per altre Solanacee).',
      containerSizeAdvice: 'Vaschette standard vanno bene.',
      transplantSensitivity: 'Low',
      specialCareInstructions: [
        'Hanno bisogno di pazienza - germinazione lenta per varietà Chinense (14-28 giorni)',
        'Mantieni temperatura costante - sono sensibili agli sbalzi termici',
        'Varietà Chinense richiedono temperatura più alta (24-28°C) rispetto ad Annuum (20-24°C)'
      ],
      comparisonWithSimilar: 'Base di riferimento per altre Solanacee. Crescita più lenta rispetto a pomodori, simile a melanzane.'
    },
    
    equipmentCleaning: {
      seedTrayCleaning: 'Pulisci e sterilizza dopo ogni uso.',
      heatingMatCleaning: 'Pulisci con panno umido e alcool dopo ogni ciclo.',
      soilReuse: 'CompostOnly',
      sterilizationRequired: true
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
      optimalTemp: 22,
      optimalTempRange: { min: 20, max: 25 },
      maxTemp: 28,
      humidityLevel: 'Medium',
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('5-10 giorni'),
      coveringNeeded: false,
      coveringType: 'None',
      soilMoistureCheck: 'Mantieni umido ma non bagnato',
      ventilationNeeded: false
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 2-3 foglie vere (circa 3-4 settimane)',
      lightNeeds: 'Luce diretta o lampade LED',
      lightHours: 12,
      lightDetails: {
        type: 'LED',
        distance: 15,
        hours: 12,
        intensity: 'Medium',
        spectrum: 'Full'
      },
      temperature: '18-22°C',
      temperatureRange: { min: 18, max: 22 },
      watering: 'Mantieni terreno umido ma non bagnato',
      wateringMethod: 'Top',
      ventilation: {
        needed: true,
        method: 'finestra leggermente aperta',
        duration: '2-3 ore al giorno'
      },
      firstFertilization: {
        when: 'alla seconda coppia di foglie',
        type: 'concime liquido bilanciato',
        dilution: '1/4 della dose consigliata'
      },
      warning: 'Le zucchine crescono velocemente - non lasciare troppo tempo nel semenzaio'
    },
    
    intermediateRepotting: {
      needed: false // Le zucchine crescono velocemente, meglio trapiantare direttamente
    },
    
    hardening: {
      duration: 7,
      procedure: {
        days1to3: 'Esponi per 2-3 ore al mattino in luogo ombreggiato',
        days4to6: 'Aumenta a 4-6 ore con sole diretto parziale',
        days7to10: 'Esponi per 6-8 ore incluso sole diretto'
      },
      temperatureMin: 12
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
      finalPlanting: {
        containerOptions: {
          minSize: 'vaso 40cm di diametro (per varietà nane)',
          soilMix: 'terriccio universale + compost maturo',
          drainage: 'assicurati che il vaso abbia fori di drenaggio'
        },
        groundPlanting: {
          soilPrep: 'vanga profonda 40cm, aggiungi 3-4 manciate di compost o letame maturo',
          spacing: '80-100cm sulla fila, 100cm tra le file'
        },
        raisedBed: {
          bedHeight: 30,
          soilMix: 'mix di terra, compost maturo',
          spacing: '80-100cm sulla fila, 100cm tra le file'
        },
        finalFertilization: {
          type: 'Balanced',
          product: 'concime bilanciato ricco di sostanza organica',
          timing: 'applica dopo 2 settimane dal trapianto'
        }
      }
    },
    
    supportRequirements: {
      needsSupport: false,
      additionalAccessories: [
        {
          type: 'Net',
          purpose: 'WindProtection',
          required: false,
          timing: 'Durante crescita se zona ventosa'
        }
      ],
      notes: 'Non necessita supporto ma può beneficiare di protezione vento in zone esposte.'
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
    
    familySpecificNotes: {
      growthSpeed: 'Explosive',
      sowingTimingAdvice: 'Semina MOLTO TARDI - massimo 2-3 settimane prima di poterle mettere fuori (es. aprile). Se semini a gennaio/febbraio, moriranno o soffriranno.',
      containerSizeAdvice: 'NON usare vaschette da 12 celle piccole (3-4cm). La radice riempie quello spazio in 4 giorni. Semina direttamente in vasetti da 10cm o vaschette con celle molto grandi.',
      transplantSensitivity: 'High',
      specialCareInstructions: [
        'Germina in 2-3 giorni e diventa enorme in 10 giorni',
        'Odiano i trapianti - se rompi il pane di terra, la pianta si blocca',
        'Ideale: semina in vasetti di torba biodegradabile o cocco che si piantano direttamente senza togliere la pianta',
        'Tappetino: utile per germinazione veloce (24-48h), ma spegnilo subito dopo',
        'Travaso con delicatezza estrema - meglio evitare se possibile'
      ],
      comparisonWithSimilar: 'Completamente diversa dai peperoncini. Crescita esplosiva, radici delicate, odia i rinvasi. Richiede approccio completamente diverso.'
    },
    
    equipmentCleaning: {
      seedTrayCleaning: 'Pulisci e sterilizza dopo ogni uso. Le cucurbitacee sono sensibili ai patogeni.',
      heatingMatCleaning: 'Pulisci con panno umido e alcool dopo ogni ciclo.',
      soilReuse: 'Never',
      sterilizationRequired: true
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
      optimalTemp: 26,
      optimalTempRange: { min: 24, max: 28 },
      maxTemp: 32,
      heatingMatTemp: 26,
      humidityLevel: 'High',
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('10-21 giorni'),
      coveringNeeded: true,
      coveringType: 'PlasticWrap',
      coveringInstructions: 'Togli la pellicola quando compaiono i primi germogli',
      coveringRemoveWhen: 'Togli IMMEDIATAMENTE la pellicola appena vedi il primo cotiledone verde emergere',
      soilMoistureCheck: 'Tocca con il dito - deve essere umido ma non bagnato. Se esce acqua quando premi, è troppo bagnato',
      ventilationNeeded: false,
      // Metodo alternativo: scottex (consigliato per principianti)
      alternativeMethod: {
        name: 'Metodo Scottex',
        description: 'Germinazione su scottex in bicchieri di plastica - metodo più sicuro per principianti',
        instructions: [
          'Prepara bicchieri di plastica grandi da tavola con scottex umido sul fondo',
          'Metti i semi sullo scottex e copri con altro scottex umido per mantenere umidità',
          'L\'acqua evapora lentamente evitando che i semi rimangano a mollo',
          'Il secondo giorno pulisci i semi delicatamente rimuovendo eventuali residui (le impurità a bagno si ammorbidiscono)',
          'Non lasciare i semi all\'aria - coprili sempre con scottex per mantenere umidità',
          'Quando vedi la radichetta (2-3mm), trapianta immediatamente in terriccio'
        ],
        advantages: [
          'Riduce rischio di muffa sui semi',
          'Controllo visivo diretto della germinazione',
          'Evita problemi di eccessiva umidità nel terriccio',
          'Particolarmente utile per melanzane che richiedono alta temperatura'
        ]
      },
      // Gestione muffa
      moldPrevention: 'Se compaiono muffe sui semi, puliscili delicatamente il secondo giorno (le impurità a bagno si ammorbidiscono). Acquista sempre più semi del necessario per compensare eventuali perdite.'
    },
    
    seedlingCare: {
      transplantWhen: 'alla seconda coppia di foglie vere',
      lightNeeds: 'Tanta luce diretta o lampade LED',
      lightHours: 14,
      lightDetails: {
        type: 'LED',
        distance: 15,
        hours: 14,
        intensity: 'High',
        spectrum: 'Full'
      },
      temperature: '20-25°C',
      temperatureRange: { min: 20, max: 25 },
      watering: 'Solo quando il terriccio è quasi asciutto. Innaffia a fine giornata quando i raggi del sole si indeboliscono per evitare l\'effetto lente prodotto dall\'acqua sopra le foglie che le brucia',
      wateringMethod: 'Bottom',
      bottomWateringDepth: 2,
      bottomWateringDuration: 20,
      wateringTiming: 'Fine giornata (quando i raggi del sole si indeboliscono) per evitare effetto lente che brucia le foglie',
      soilCare: 'Se la temperatura è molto alta e il terriccio tende a seccarsi, smuovilo ogni tanto con una forchetta prima di annaffiare',
      ventilation: {
        needed: true,
        method: 'ventilatore leggero o finestra leggermente aperta',
        duration: '2-3 ore al giorno'
      },
      firstFertilization: {
        when: 'alla seconda coppia di foglie vere',
        type: 'concime liquido bilanciato (NPK 20-20-20)',
        dilution: '1/4 della dose consigliata'
      },
      warning: 'Le melanzane amano il caldo - mantieni temperatura costante',
      // Problema comune: cotiledoni imprigionati
      commonIssues: {
        trappedCotyledons: {
          problem: 'Cotiledoni imprigionati nel tegumento del seme',
          solution: 'Aiuta delicatamente i cotiledoni a liberarsi bagnando il tegumento con acqua tiepida e rimuovendolo con delicatezza usando pinzette o dita',
          prevention: 'Mantieni umidità costante durante la germinazione'
        }
      }
    },
    
    intermediateRepotting: {
      needed: true,
      when: '25-30 giorni dopo la semina, quando le radici escono dai fori di drenaggio',
      trigger: 'radici visibili dai fori di drenaggio',
      containerSize: 'vaso 10-12cm di diametro',
      soilMix: 'terriccio universale + 30% perlite',
      buryStem: false,
      aftercare: 'mantieni umido per 2-3 giorni, poi normale'
    },
    
    hardening: {
      duration: 10,
      procedure: {
        days1to3: 'Esponi le piantine all\'aperto per 2-3 ore al mattino in luogo ombreggiato. Riporta dentro prima del caldo pomeridiano.',
        days4to6: 'Aumenta l\'esposizione a 4-6 ore. Puoi esporre anche al sole diretto per 1-2 ore al mattino. Riporta dentro la sera.',
        days7to10: 'Esponi per 6-8 ore, incluso sole diretto. Se le temperature notturne superano i 18°C, lascia fuori anche la notte negli ultimi 2 giorni.',
        finalCheck: 'Le piantine sono pronte se hanno foglie verdi e robuste, gambo forte, e hanno resistito alle condizioni esterne senza stress'
      },
      temperatureMin: 18
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano stabilmente i 15°C (maggio-giugno in Italia)',
      minTemp: 15,
      spacing: '50cm sulla fila, 60cm tra le file',
      holeDepth: 30,
      holeWidth: 35,
      soilRequirements: 'Ricco di sostanza organica e ben drenato. Aggiungi compost',
      buryStem: false,
      finalPlanting: {
        containerOptions: {
          minSize: 'vaso 35cm di diametro',
          soilMix: 'terriccio universale + 30% perlite + compost maturo',
          drainage: 'assicurati che il vaso abbia fori di drenaggio e uno strato di argilla espansa sul fondo'
        },
        groundPlanting: {
          soilPrep: 'vanga profonda 40cm, aggiungi 2-3 manciate di compost maturo sul fondo della buca',
          spacing: '50cm sulla fila, 60cm tra le file'
        },
        raisedBed: {
          bedHeight: 30,
          soilMix: 'mix di terra, compost maturo e perlite',
          spacing: '50cm sulla fila, 60cm tra le file'
        },
        supportInstallation: {
          when: 'AsNeeded',
          instructions: 'Installa un paletto quando la pianta raggiunge 40-50cm di altezza'
        },
        finalFertilization: {
          type: 'Balanced',
          product: 'concime bilanciato ricco di potassio',
          timing: 'applica dopo 2 settimane dal trapianto, poi ogni 3-4 settimane'
        }
      },
      protectionNeeded: true,
      protectionInstructions: 'Proteggi dal vento e dal freddo - le melanzane sono molto sensibili'
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La melanzana è una pianta che ama il caldo e richiede pazienza, ma produce frutti deliziosi. È più esigente del pomodoro ma con le giuste condizioni darà ottimi risultati.',
      commonMistakes: [
        'Evita di piantare troppo presto - le melanzane sono molto sensibili al freddo.',
        'Evita di innaffiare troppo - preferiscono terreno leggermente asciutto.',
        'Evita di innaffiare durante le ore calde - l\'acqua sulle foglie crea un effetto lente che le brucia. Innaffia a fine giornata.',
        'Evita di non supportare la pianta - alcuni frutti possono essere pesanti.',
        'Evita di raccogliere troppo tardi - i frutti maturi diventano amari e con molti semi.'
      ],
      growthNotes: [
        'Se il terriccio si compatta troppo, smuovilo delicatamente con una forchetta prima di annaffiare per migliorare l\'aerazione.',
        'Le foglie grandi possono ombreggiare le piante vicine - trapianta prima se necessario.'
      ],
      harvestGuide: 'Raccogli le melanzane quando la buccia è lucida e il frutto cede leggermente alla pressione ma è ancora sodo. Taglia il picciolo con un coltello affilato. Raccogli regolarmente per stimolare la produzione. I frutti troppo maturi hanno molti semi e sapore amaro.'
    },
    
    familySpecificNotes: {
      growthSpeed: 'Medium',
      sowingTimingAdvice: 'Puoi seminare insieme ai peperoncini o 1 settimana dopo.',
      containerSizeAdvice: 'Vaschette standard vanno bene, ma le foglie grandi occupano spazio. Trapianta prima se si fanno ombra.',
      transplantSensitivity: 'Medium',
      specialCareInstructions: [
        'Foglie molto più grandi dei peperoncini - nelle vaschette da 12 celle possono farsi ombra a vicenda',
        'Travaso intermedio: potresti dover spostare una settimana prima dei peperoncini per evitare che soffochino i vicini',
        'Ama il caldo estremo - tappetino riscaldante fondamentale (26-28°C)'
      ],
      comparisonWithSimilar: 'Simile ai peperoncini ma con foglie più grandi. Richiede più spazio nelle vaschette.'
    },
    
    equipmentCleaning: {
      seedTrayCleaning: 'Pulisci e sterilizza dopo ogni uso.',
      heatingMatCleaning: 'Pulisci con panno umido e alcool dopo ogni ciclo.',
      soilReuse: 'CompostOnly',
      sterilizationRequired: true
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
      optimalTemp: 18,
      optimalTempRange: { min: 15, max: 20 },
      maxTemp: 24,
      humidityLevel: 'Medium',
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('5-10 giorni'),
      coveringNeeded: false,
      coveringType: 'None',
      soilMoistureCheck: 'Mantieni umido ma non bagnato',
      ventilationNeeded: false
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 3-4 foglie vere',
      lightNeeds: 'Luce diretta o lampade LED',
      lightHours: 12,
      lightDetails: {
        type: 'LED',
        distance: 10,
        hours: 12,
        intensity: 'Medium',
        spectrum: 'Full'
      },
      temperature: '15-20°C',
      temperatureRange: { min: 15, max: 20 },
      watering: 'Mantieni terreno costantemente umido',
      wateringMethod: 'Top',
      ventilation: {
        needed: false,
        method: undefined,
        duration: undefined
      },
      warning: 'Le lattughe non amano il caldo eccessivo - sopra i 24-25°C i semi vanno in termodormienza e non nascono'
    },
    
    intermediateRepotting: {
      needed: false // Le lattughe crescono velocemente, meglio trapiantare direttamente
    },
    
    hardening: {
      duration: 7,
      procedure: {
        days1to3: 'Esponi per 2-3 ore al mattino in luogo ombreggiato',
        days4to6: 'Aumenta a 4-6 ore con sole diretto parziale',
        days7to10: 'Esponi per 6-8 ore incluso sole diretto'
      },
      temperatureMin: 5
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
    
    familySpecificNotes: {
      growthSpeed: 'Fast',
      sowingTimingAdvice: 'Puoi seminare tutto l\'anno indoor. Per raccolto autunnale/invernale: semina a giugno/luglio. Per raccolto primaverile: semina a gennaio/febbraio.',
      containerSizeAdvice: 'Le celle da 12 sono grandi per una singola lattuga. Tecnica "Multisowing": metti 3-4 semi per cella, cresceranno a ciuffo.',
      transplantSensitivity: 'Low',
      specialCareInstructions: [
        'GRANDE PERICOLO: Termodormienza - Se il terriccio supera i 24-25°C, i semi si rifiutano di nascere',
        'Tappetino: ASSOLUTAMENTE SPENTO. Se fa caldo in casa, germina appoggiando la vaschetta sul pavimento (è più fresco)',
        'Luci: Vicinissime (10cm). Le lattughe filano se le guardi male',
        'Tecnica Multisowing: Metti 3-4 semi per cella. Quando trapianti, metti tutto il blocco di terra con le 3-4 piantine insieme'
      ],
      comparisonWithSimilar: 'Simile ad altre Asteracee (radicchi, indivie). Crescita veloce, ama il fresco, odia il caldo durante la germinazione.'
    },
    
    equipmentCleaning: {
      seedTrayCleaning: 'Pulisci e sterilizza dopo ogni uso.',
      heatingMatCleaning: 'NON usare tappetino per lattughe - preferiscono fresco.',
      soilReuse: 'CompostOnly',
      sterilizationRequired: true
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
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
    
    visualCategory: 'Aromatiche',
    
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
    
    supportRequirements: {
      needsSupport: true,
      supportType: 'Trellis',
      climbingType: 'Twining',
      supportHeight: 250,
      supportTiming: 'AtTransplant',
      notes: 'I fagioli rampicanti (fagiolini a metro) si arrampicano con viticci. Spalliera robusta alta 2-3 metri necessaria. I fagioli nani non necessitano supporto.'
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
    
    supportRequirements: {
      needsSupport: true,
      supportType: 'Net',
      climbingType: 'Tendril',
      supportHeight: 180,
      supportTiming: 'AtTransplant',
      notes: 'Rete o spalliera per piselli rampicanti. Supporto leggero sufficiente. I piselli nani non necessitano supporto.'
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
      optimalTemp: 18,
      optimalTempRange: { min: 15, max: 20 },
      maxTemp: 22,
      heatingMatTemp: 20, // Utile solo per germinazione
      humidityLevel: 'Medium',
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('10-14 giorni'),
      coveringNeeded: false,
      coveringType: 'None',
      soilMoistureCheck: 'Mantieni umido ma non bagnato',
      ventilationNeeded: false
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 3-4 foglie e sono alte 10-15cm',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      lightDetails: {
        type: 'LED',
        distance: 15,
        hours: 12,
        intensity: 'Medium',
        spectrum: 'Full'
      },
      temperature: '15-20°C',
      temperatureRange: { min: 15, max: 20 },
      watering: 'Mantieni terreno umido ma non bagnato',
      wateringMethod: 'Top',
      ventilation: {
        needed: false,
        method: undefined,
        duration: undefined
      },
      warning: 'Le cipolle amano il sole e terreno ben drenato. Taglia le foglie a metà quando sono alte 10-12cm per rinforzare la base.'
    },
    
    intermediateRepotting: {
      needed: false // Le cipolle si trapiantano direttamente quando pronte
    },
    
    hardening: {
      duration: 7,
      procedure: {
        days1to3: 'Esponi per 2-3 ore al mattino',
        days4to6: 'Aumenta a 4-6 ore',
        days7to10: 'Esponi per 6-8 ore incluso sole diretto'
      },
      temperatureMin: 5
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
    
    familySpecificNotes: {
      growthSpeed: 'Slow',
      sowingTimingAdvice: 'Sono lentissime. Si seminano a gennaio (o anche dicembre) per trapiantare ad aprile.',
      containerSizeAdvice: 'Metodo "Affollato": In una vaschetta da 12 celle, puoi mettere anche 5-8 semi per cella. Non serve separarle subito.',
      transplantSensitivity: 'Low',
      specialCareInstructions: [
        'Tappetino: Utile solo per la germinazione (20°C), poi spegnilo',
        'Il "Taglio dei Capelli" (Barber Shop): Quando sono alte 10-12cm, taglia le foglie a metà (lascia 5-6cm). Questo costringe la pianta a ingrossare la base e fare radici più forti invece di foglie deboli',
        'Crescita molto lenta - richiede pazienza'
      ],
      comparisonWithSimilar: 'Simile a porri e scalogno. Crescita molto lenta, ma risultati migliori rispetto ai bulbilli.'
    },
    
    equipmentCleaning: {
      seedTrayCleaning: 'Pulisci e sterilizza dopo ogni uso.',
      heatingMatCleaning: 'Pulisci con panno umido e alcool dopo ogni ciclo.',
      soilReuse: 'CompostOnly',
      sterilizationRequired: true
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Tripidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // PATATA
  {
    id: 'patata',
    commonName: 'PATATA',
    nutrientCategory: 'ROOT',
    scientificName: 'Solanum tuberosum L.',
    family: 'Solanaceae',
    
    requiredTools: {
      seedTray: false, // Si pianta da tubero
      seedSoil: false,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 10,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si pianta direttamente da tubero',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido ma non bagnato',
      warning: 'Le patate amano terreno fresco e ben drenato',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Piantare tuberi quando le temperature superano i 5°C (marzo-aprile)',
      minTemp: 5,
      spacing: '30-40cm sulla fila, 70-80cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile, ben drenato, senza sassi. Aggiungi compost maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La patata è un tubero fondamentale in cucina. Facile da coltivare, richiede terreno preparato bene e rincalzatura durante la crescita.',
      commonMistakes: [
        'Evita terreno troppo compatto o con sassi - le patate si deformano.',
        'Evita di non rincalzare - le patate esposte alla luce diventano verdi e tossiche.',
        'Evita terreno troppo bagnato - può causare marciumi.',
        'Evita di piantare troppo presto - il freddo può danneggiare i tuberi.'
      ],
      harvestGuide: 'Raccogli le patate quando le foglie sono secche (luglio-agosto per semina primaverile). Scava delicatamente con una forca. Le patate novelle possono essere raccolte prima quando sono ancora piccole. Conserva in un luogo fresco, buio e asciutto.'
    },
    
    susceptibility: {
      fungalDiseases: ['Peronospora', 'Alternaria'],
      pests: ['Dorifora'],
      preventiveStrategy: 'HIGH',
      criticalPeriods: [
        {
          season: 'Summer',
          daysActive: { min: 40, max: 100 },
          risk: 'High' // Peronospora e dorifora estive
        }
      ]
    }
  },
  
  // RADICCHIO
  {
    id: 'radicchio',
    commonName: 'RADICCHIO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Cichorium intybus L.',
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
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta o mezz\'ombra',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il radicchio ama il fresco e non il caldo eccessivo',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le temperature sono stabili (marzo-aprile per primavera, agosto per autunno)',
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
      introduction: 'Il radicchio è una verdura a foglia amara e croccante, perfetta per insalate. Cresce bene in clima fresco e può essere coltivato quasi tutto l\'anno.',
      commonMistakes: [
        'Evita di piantare in pieno sole estivo - preferisce ombra parziale in estate.',
        'Evita di innaffiare troppo - può causare marciume. Mantieni terreno umido ma non bagnato.',
        'Evita di non diradare - il radicchio ha bisogno di spazio per svilupparsi.',
        'Evita di non fare l\'imbianchimento - necessario per alcune varietà per ridurre l\'amaro.'
      ],
      harvestGuide: 'Raccogli le foglie esterne quando sono grandi abbastanza, oppure taglia l\'intera pianta alla base quando ha raggiunto la dimensione desiderata. Per alcune varietà, fai l\'imbianchimento coprendo la pianta 2-3 settimane prima della raccolta. Raccogli al mattino per la massima croccantezza.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // SPINACI
  {
    id: 'spinacio',
    commonName: 'SPINACIO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Spinacia oleracea L.',
    family: 'Amaranthaceae',
    
    requiredTools: {
      seedTray: true, // Si può anticipare indoor
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: false, // ASSOLUTAMENTE SPENTO
      sprayer: true,
      additionalTools: ['Vasetti di carta biodegradabili (consigliato)']
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '10-20°C',
      minTemp: 5,
      optimalTemp: 15,
      optimalTempRange: { min: 10, max: 20 },
      maxTemp: 22,
      humidityLevel: 'Medium',
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringType: 'None',
      soilMoistureCheck: 'Mantieni umido ma non bagnato',
      ventilationNeeded: false
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra o usa vasetti biodegradabili',
      lightNeeds: 'Luce diretta o mezz\'ombra',
      lightHours: 12,
      lightDetails: {
        type: 'LED',
        distance: 15,
        hours: 12,
        intensity: 'Medium',
        spectrum: 'Full'
      },
      temperature: '10-20°C',
      temperatureRange: { min: 10, max: 20 },
      watering: 'Mantieni terreno costantemente umido',
      wateringMethod: 'Top',
      warning: 'Gli spinaci amano il fresco e non il caldo',
      firstFertilization: {
        when: 'non necessario - crescita veloce',
        type: 'non necessario',
        dilution: undefined
      }
    },
    
    intermediateRepotting: {
      needed: false // Radice fittonante delicata - meglio semina diretta o vasetti biodegradabili
    },
    
    hardening: {
      duration: 5,
      procedure: {
        days1to3: 'Esponi per 2-3 ore al mattino',
        days4to6: 'Aumenta a 4-6 ore',
        days7to10: 'Esponi per 6-8 ore incluso sole diretto'
      },
      temperatureMin: 5
    },
    
    transplanting: {
      when: 'Semina direttamente in terra da febbraio a maggio e da agosto a ottobre',
      minTemp: 5,
      spacing: 'Diradare a 10-15cm sulla fila, 25-30cm tra le file',
      holeDepth: 1,
      holeWidth: 2,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Lo spinacio è una verdura a foglia nutriente e facile da coltivare. Cresce velocemente e può essere raccolto foglia per foglia o intero.',
      commonMistakes: [
        'Evita di piantare in pieno sole estivo - preferisce ombra parziale in estate.',
        'Evita di innaffiare troppo - può causare marciume. Mantieni terreno umido ma non bagnato.',
        'Evita di non diradare - gli spinaci hanno bisogno di spazio per svilupparsi.',
        'Evita di lasciare andare a seme - raccogli prima che fiorisca per il miglior sapore.'
      ],
      harvestGuide: 'Raccogli le foglie esterne quando sono grandi abbastanza, oppure taglia l\'intera pianta alla base quando ha raggiunto la dimensione desiderata. Raccogli regolarmente per stimolare la crescita continua. Raccogli al mattino per la massima freschezza.'
    },
    
    familySpecificNotes: {
      growthSpeed: 'Fast',
      sowingTimingAdvice: 'Si semina direttamente in terra da febbraio a maggio e da agosto a ottobre. Se anticipi indoor, usa vasetti biodegradabili.',
      containerSizeAdvice: 'Radice fittonante lunga e delicata. Meglio semina diretta in campo, ma se vuoi anticipare, usa vasetti di carta che si degradano.',
      transplantSensitivity: 'High',
      specialCareInstructions: [
        'Radice fittonante delicata - se tocca il fondo della plastica si storce per sempre',
        'Meglio semina diretta in campo, ma se anticipi indoor usa vasetti biodegradabili',
        'Fai molta attenzione a non rompere il pane di terra al trapianto',
        'Ama il fresco - non il caldo'
      ],
      comparisonWithSimilar: 'Simile a bietole e barbietole (Chenopodiacee). Radice fittonante delicata, meglio semina diretta.'
    },
    
    equipmentCleaning: {
      seedTrayCleaning: 'Pulisci e sterilizza dopo ogni uso.',
      heatingMatCleaning: 'NON usare tappetino per spinaci - preferiscono fresco.',
      soilReuse: 'CompostOnly',
      sterilizationRequired: true
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // FINOCCHIO
  {
    id: 'finocchio',
    commonName: 'FINOCCHIO',
    nutrientCategory: 'ROOT',
    scientificName: 'Foeniculum vulgare var. azoricum',
    family: 'Apiaceae',
    
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
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('10-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il finocchio ama il fresco e terreno ben drenato',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le temperature sono stabili (marzo-aprile per primavera, agosto per autunno)',
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
      introduction: 'Il finocchio è un ortaggio aromatico e croccante, perfetto per insalate e contorni. Richiede terreno preparato bene e rincalzatura per formare il grumolo.',
      commonMistakes: [
        'Evita terreno troppo compatto - il finocchio ha bisogno di terreno sciolto per formare il grumolo.',
        'Evita di non rincalzare - necessario per formare il grumolo bianco.',
        'Evita di innaffiare troppo - può causare marciume. Mantieni terreno umido ma non bagnato.',
        'Evita di piantare troppo fitto - il finocchio ha bisogno di spazio per svilupparsi.'
      ],
      harvestGuide: 'Raccogli il finocchio quando il grumolo è ben formato e compatto (circa 80-100 giorni dopo il trapianto). Taglia alla base con un coltello. Il grumolo deve essere bianco e croccante. Raccogli prima che la pianta fiorisca.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // MAIS
  {
    id: 'mais',
    commonName: 'MAIS',
    nutrientCategory: 'FRUITING',
    scientificName: 'Zea mays L.',
    family: 'Poaceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 3,
      idealTemp: '18-24°C',
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
      warning: 'Il mais ama il caldo e il sole',
      temperature: '18-24°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra quando le temperature notturne superano i 10°C (aprile-maggio)',
      minTemp: 10,
      spacing: '25-30cm sulla fila, 70-80cm tra le file',
      holeDepth: 3,
      holeWidth: 5,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    supportRequirements: {
      needsSupport: false,
      supportType: undefined,
      supportHeight: undefined,
      supportTiming: undefined,
      notes: 'Il mais non necessita supporti ma può essere rincalzato per stabilità'
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il mais è un cereale facile da coltivare e molto produttivo. Richiede spazio e sole, ma produce pannocchie dolci e saporite.',
      commonMistakes: [
        'Evita di piantare troppo fitto - il mais ha bisogno di spazio per svilupparsi.',
        'Evita terreno troppo povero - il mais è molto esigente in nutrienti.',
        'Evita di innaffiare troppo poco - il mais ha bisogno di acqua regolare, specialmente durante la fioritura.',
        'Evita di raccogliere troppo presto - aspetta che le pannocchie siano mature.'
      ],
      harvestGuide: 'Raccogli le pannocchie quando i chicchi sono pieni e la seta è secca e marrone (circa 80-100 giorni dopo la semina). Premi un chicco con l\'unghia - se esce un liquido lattiginoso, è pronto. Le pannocchie per consumo fresco devono essere raccolte quando sono ancora tenere.'
    },
    
    susceptibility: {
      fungalDiseases: ['Carbone', 'Ruggine'],
      pests: ['Piralide'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Summer',
          daysActive: { min: 50, max: 100 },
          risk: 'Medium' // Piralide estiva
        }
      ]
    }
  },
  
  // GRANO/FRUMENTO
  {
    id: 'frumento',
    commonName: 'FRUMENTO',
    nutrientCategory: 'LEGUME',
    scientificName: 'Triticum aestivum L.',
    family: 'Poaceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 2,
      idealTemp: '10-15°C',
      minTemp: 0,
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
      warning: 'Il frumento ama il clima temperato',
      temperature: '10-15°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra in autunno (ottobre-novembre) o primavera (marzo)',
      minTemp: 0,
      spacing: 'Semina a spaglio o in file distanziate 15-20cm',
      holeDepth: 2,
      holeWidth: 2,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il frumento è un cereale fondamentale, coltivato principalmente in campo aperto. Richiede spazio e terreno preparato bene.',
      commonMistakes: [
        'Evita terreno troppo compatto - il frumento ha bisogno di terreno sciolto per sviluppare le radici.',
        'Evita di seminare troppo fitto - il frumento ha bisogno di spazio per svilupparsi.',
        'Evita terreno troppo povero - il frumento è esigente in nutrienti.',
        'Evita di non controllare le infestanti - competono con il frumento per nutrienti e spazio.'
      ],
      harvestGuide: 'Raccogli il frumento quando le spighe sono mature e i chicchi sono duri (circa 120-150 giorni dopo la semina). Le spighe devono essere gialle e i chicchi devono essere duri quando li premi. Taglia le spighe e lascia asciugare al sole prima di trebbiare.'
    },
    
    susceptibility: {
      fungalDiseases: ['Ruggine', 'Septoria'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 60, max: 120 },
          risk: 'Medium' // Ruggine primaverile
        }
      ]
    }
  },
  
  // ERBE AROMATICHE (Pro Feature)
  {
    id: 'basilico',
    commonName: 'BASILICO',
    cropType: 'Aromatic',
    nutrientCategory: 'LEAFY' as NutrientCategory,
    scientificName: 'Ocimum basilicum',
    family: 'Lamiaceae',
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: false,
      sprayer: true
    },
    germination: {
      preSoak: false,
      sowingDepth: 0.3,
      idealTemp: '20-25°C',
      minTemp: 15,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: true,
      coveringInstructions: 'Rimuovi copertura quando emergono le prime foglioline'
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      lightHours: 6,
      watering: 'Mantieni terreno umido, evita ristagni',
      temperature: '18-25°C'
    },
    transplanting: {
      when: 'Quando le notturne superano i 15°C stabilmente (maggio)',
      minTemp: 15,
      spacing: '25-30cm sulla fila, 30cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile, ben drenato, ricco di materia organica'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il basilico è l\'erba aromatica più amata in Italia. Richiede calore e acqua regolare. Cimare regolarmente per favorire crescita cespugliosa.',
      commonMistakes: [
        'Non cimare i fiori (la pianta smette di produrre foglie)',
        'Terreno troppo bagnato (marciumi)',
        'Esposizione insufficiente al sole',
        'Non raccogliere regolarmente (foglie vecchie amare)'
      ],
      harvestGuide: 'Raccogli le foglie prima della fioritura per massimo aroma. Usa fresco o essicca rapidamente. Cima i fiori per prolungare produzione.'
    },
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW'
    }
  },
  {
    id: 'rosmarino',
    commonName: 'ROSMARINO',
    cropType: 'Aromatic',
    nutrientCategory: 'LEAFY' as NutrientCategory,
    scientificName: 'Rosmarinus officinalis',
    family: 'Lamiaceae',
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: false
    },
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      lightHours: 8,
      watering: 'Terreno ben drenato, evita ristagni',
      temperature: '15-25°C'
    },
    transplanting: {
      when: 'Primavera o autunno (pianta perenne)',
      minTemp: 5,
      spacing: '50-60cm sulla fila, 60cm tra le file',
      holeDepth: 20,
      holeWidth: 20,
      soilRequirements: 'Terreno ben drenato, anche povero, pH 6.0-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il rosmarino è un arbusto perenne rustico, ideale per climi mediterranei. Richiede poca manutenzione e produce tutto l\'anno.',
      commonMistakes: [
        'Terreno troppo umido (marciumi radicali)',
        'Potatura eccessiva',
        'Non raccogliere regolarmente (legnifica)',
        'Esposizione insufficiente al sole'
      ],
      harvestGuide: 'Raccogli rametti giovani tutto l\'anno. Usa fresco o essicca. Potatura leggera dopo fioritura per mantenere forma compatta.'
    },
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW'
    }
  },
  {
    id: 'salvia',
    commonName: 'SALVIA',
    cropType: 'Aromatic',
    nutrientCategory: 'LEAFY' as NutrientCategory,
    scientificName: 'Salvia officinalis',
    family: 'Lamiaceae',
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: false
    },
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      lightHours: 8,
      watering: 'Terreno ben drenato, moderatamente umido',
      temperature: '15-25°C'
    },
    transplanting: {
      when: 'Primavera o autunno (pianta perenne)',
      minTemp: 5,
      spacing: '40-50cm sulla fila, 50cm tra le file',
      holeDepth: 20,
      holeWidth: 20,
      soilRequirements: 'Terreno ben drenato, anche calcareo, pH 6.0-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'La salvia è un\'erba perenne molto aromatica, ideale per cucina e uso medicinale. Facile da coltivare e mantenere.',
      commonMistakes: [
        'Terreno troppo umido',
        'Non raccogliere regolarmente (legnifica)',
        'Potatura insufficiente',
        'Esposizione insufficiente al sole'
      ],
      harvestGuide: 'Raccogli foglie giovani prima della fioritura per massimo aroma. Usa fresco o essicca. Potatura post-fioritura per mantenere forma.'
    },
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW'
    }
  },
  {
    id: 'timo',
    commonName: 'TIMO',
    cropType: 'Aromatic',
    nutrientCategory: 'LEAFY' as NutrientCategory,
    scientificName: 'Thymus vulgaris',
    family: 'Lamiaceae',
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: false,
      sprayer: false
    },
    germination: {
      preSoak: false,
      sowingDepth: 0.2,
      idealTemp: '20-25°C',
      minTemp: 15,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      lightHours: 8,
      watering: 'Terreno ben drenato, moderatamente secco',
      temperature: '15-25°C'
    },
    transplanting: {
      when: 'Primavera (pianta perenne)',
      minTemp: 10,
      spacing: '25-30cm sulla fila, 30cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno ben drenato, anche povero, pH 6.0-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'Il timo è un\'erba perenne rustica, ideale per terreni poveri e secchi. Molto aromatica e facile da mantenere.',
      commonMistakes: [
        'Terreno troppo umido (marciumi)',
        'Esposizione insufficiente al sole',
        'Non raccogliere regolarmente',
        'Concimazione eccessiva (riduce aroma)'
      ],
      harvestGuide: 'Raccogli rametti giovani prima della fioritura. Usa fresco o essicca. Potatura leggera dopo fioritura.'
    },
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW'
    }
  },
  {
    id: 'origano',
    commonName: 'ORIGANO',
    cropType: 'Aromatic',
    nutrientCategory: 'LEAFY' as NutrientCategory,
    scientificName: 'Origanum vulgare',
    family: 'Lamiaceae',
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: false,
      sprayer: false
    },
    germination: {
      preSoak: false,
      sowingDepth: 0.3,
      idealTemp: '20-25°C',
      minTemp: 15,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('10-18 giorni'),
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      lightHours: 8,
      watering: 'Terreno ben drenato, moderatamente secco',
      temperature: '15-25°C'
    },
    transplanting: {
      when: 'Primavera (pianta perenne)',
      minTemp: 10,
      spacing: '30-40cm sulla fila, 40cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno ben drenato, anche povero, pH 6.0-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'L\'origano è un\'erba perenne molto aromatica, essenziale per la cucina italiana. Facile da coltivare e mantenere.',
      commonMistakes: [
        'Terreno troppo umido',
        'Esposizione insufficiente al sole',
        'Non raccogliere regolarmente',
        'Concimazione eccessiva'
      ],
      harvestGuide: 'Raccogli foglie e fiori prima della piena fioritura per massimo aroma. Usa fresco o essicca. Essiccazione migliora l\'aroma.'
    },
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW'
    }
  },
  {
    id: 'menta',
    commonName: 'MENTA',
    cropType: 'Aromatic',
    nutrientCategory: 'LEAFY' as NutrientCategory,
    scientificName: 'Mentha spicata',
    family: 'Lamiaceae',
    requiredTools: {
      seedTray: false,
      seedSoil: false,
      heatingMat: false,
      sprayer: false
    },
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('10-18 giorni'),
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      lightHours: 6,
      watering: 'Terreno sempre umido, evita secchezza',
      temperature: '15-25°C'
    },
    transplanting: {
      when: 'Primavera (pianta perenne)',
      minTemp: 10,
      spacing: '30-40cm sulla fila, 40cm tra le file',
      holeDepth: 15,
      holeWidth: 20,
      soilRequirements: 'Terreno fertile, ben drenato ma umido, pH 6.0-7.5'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'La menta è un\'erba perenne molto vigorosa e invasiva. Richiede contenimento e terreno sempre umido.',
      commonMistakes: [
        'Terreno troppo secco (appassisce)',
        'Non contenere la crescita (invasiva)',
        'Esposizione troppo soleggiata (brucia)',
        'Non raccogliere regolarmente'
      ],
      harvestGuide: 'Raccogli foglie giovani prima della fioritura. Usa fresco o essicca. Contieni la crescita tagliando stoloni laterali.'
    },
    susceptibility: {
      fungalDiseases: ['Ruggine'],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW'
    }
  },
  {
    id: 'lavanda',
    commonName: 'LAVANDA',
    cropType: 'Aromatic',
    nutrientCategory: 'LEAFY' as NutrientCategory,
    scientificName: 'Lavandula angustifolia',
    family: 'Lamiaceae',
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: false,
      sprayer: false
    },
    germination: {
      preSoak: false,
      sowingDepth: 0.3,
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('14-28 giorni'),
      coveringNeeded: false
    },
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      lightHours: 8,
      watering: 'Terreno ben drenato, moderatamente secco',
      temperature: '15-25°C'
    },
    transplanting: {
      when: 'Primavera (pianta perenne)',
      minTemp: 10,
      spacing: '40-50cm sulla fila, 50cm tra le file',
      holeDepth: 20,
      holeWidth: 20,
      soilRequirements: 'Terreno ben drenato, anche calcareo, pH 6.5-8.0'
    },
    availableTags: [],
    baseInstructions: {
      introduction: 'La lavanda è un arbusto perenne molto decorativo e aromatico. Ideale per bordure e giardini mediterranei.',
      commonMistakes: [
        'Terreno troppo umido (marciumi)',
        'Esposizione insufficiente al sole',
        'Potatura insufficiente (legnifica)',
        'Non raccogliere fiori'
      ],
      harvestGuide: 'Raccogli fiori quando sono aperti ma non completamente maturi. Essicca in mazzetti per conservazione. Potatura post-fioritura.'
    },
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW'
    }
  },
  
  // ZUCCA
  {
    id: 'zucca',
    commonName: 'ZUCCA',
    nutrientCategory: 'FRUITING',
    scientificName: 'Cucurbita maxima Duchesne',
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
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 2-3 foglie vere (circa 3-4 settimane)',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido ma non bagnato',
      warning: 'Le zucche crescono velocemente - non lasciare troppo tempo nel semenzaio',
      temperature: '18-22°C'
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano stabilmente i 12°C (maggio in Italia)',
      minTemp: 12,
      spacing: '100-150cm sulla fila, 150cm tra le file',
      holeDepth: 30,
      holeWidth: 40,
      soilRequirements: 'Ricco di sostanza organica e ben drenato. Aggiungi compost o letame maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    supportRequirements: {
      needsSupport: false,
      supportType: undefined,
      supportHeight: undefined,
      supportTiming: undefined,
      notes: 'Le zucche non necessitano supporti ma hanno bisogno di molto spazio'
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La zucca è una pianta molto produttiva che richiede spazio ma è relativamente facile da coltivare. Produce frutti grandi e saporiti per tutto l\'autunno.',
      commonMistakes: [
        'Evita di piantare troppo vicino - le zucche hanno bisogno di molto spazio per svilupparsi.',
        'Evita terreno troppo povero - le zucche sono esigenti in nutrienti.',
        'Evita di innaffiare troppo poco - le zucche hanno bisogno di acqua regolare, specialmente durante la crescita dei frutti.',
        'Evita di raccogliere troppo presto - aspetta che la buccia sia dura e il picciolo sia secco.'
      ],
      harvestGuide: 'Raccogli le zucche quando la buccia è dura e non si graffia con l\'unghia, e il picciolo è secco e legnoso (settembre-ottobre). Taglia il picciolo lasciando 5-10cm attaccato al frutto. Lascia asciugare al sole per alcuni giorni prima di conservare in un luogo fresco e asciutto.'
    },
    
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Summer',
          daysActive: { min: 40, max: 120 },
          risk: 'Medium' // Oidio estivo
        }
      ]
    }
  },
  
  // CETRIOLO
  {
    id: 'cetriolo',
    commonName: 'CETRIOLO',
    nutrientCategory: 'FRUITING',
    scientificName: 'Cucumis sativus L.',
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
      sowingDepth: 1,
      idealTemp: '20-25°C',
      minTemp: 15,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 2-3 foglie vere (circa 3-4 settimane)',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido ma non bagnato',
      warning: 'I cetrioli amano il caldo e l\'umidità',
      temperature: '20-25°C'
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano stabilmente i 15°C (maggio in Italia)',
      minTemp: 15,
      spacing: '40-50cm sulla fila, 100cm tra le file',
      holeDepth: 20,
      holeWidth: 30,
      soilRequirements: 'Ricco di sostanza organica e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    supportRequirements: {
      needsSupport: true,
      supportType: 'Trellis',
      supportHeight: 150,
      supportTiming: 'AtTransplant',
      notes: 'I cetrioli rampicanti necessitano di supporti verticali. Lega i tralci al supporto man mano che crescono.'
    },
    
    availableTags: ['vining'],
    
    baseInstructions: {
      introduction: 'Il cetriolo è una pianta che ama il caldo e l\'umidità. Produce frutti abbondanti per tutta l\'estate se coltivato correttamente.',
      commonMistakes: [
        'Evita di innaffiare troppo poco - i cetrioli hanno bisogno di acqua regolare e costante.',
        'Evita terreno troppo secco - i cetrioli amano l\'umidità ma non i ristagni.',
        'Evita di raccogliere troppo tardi - i cetrioli maturi diventano amari e con molti semi.',
        'Evita di non supportare - le varietà rampicanti necessitano di supporti verticali.'
      ],
      harvestGuide: 'Raccogli i cetrioli quando sono lunghi 15-20cm e ancora teneri (circa 50-70 giorni dopo il trapianto). Taglia il picciolo con un coltello affilato. Raccogli regolarmente per stimolare la produzione continua. I cetrioli troppo maturi sono amari e hanno molti semi.'
    },
    
    susceptibility: {
      fungalDiseases: ['Oidio', 'Peronospora'],
      pests: ['Afidi', 'Ragnetto rosso'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Summer',
          daysActive: { min: 30, max: 90 },
          risk: 'Medium' // Oidio e afidi estivi
        }
      ]
    }
  },
  
  // MELONE
  {
    id: 'melone',
    commonName: 'MELONE',
    nutrientCategory: 'FRUITING',
    scientificName: 'Cucumis melo L.',
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
      sowingDepth: 1,
      idealTemp: '20-25°C',
      minTemp: 15,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 2-3 foglie vere (circa 3-4 settimane)',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido ma non bagnato',
      warning: 'I meloni amano il caldo e il sole',
      temperature: '20-25°C'
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano stabilmente i 15°C (maggio in Italia)',
      minTemp: 15,
      spacing: '80-100cm sulla fila, 100cm tra le file',
      holeDepth: 25,
      holeWidth: 35,
      soilRequirements: 'Ricco di sostanza organica e ben drenato. Aggiungi compost o letame maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    supportRequirements: {
      needsSupport: false,
      supportType: undefined,
      supportHeight: undefined,
      supportTiming: undefined,
      notes: 'I meloni non necessitano supporti ma possono essere coltivati su reti per risparmiare spazio'
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il melone è una pianta che ama il caldo e il sole. Richiede spazio e pazienza, ma produce frutti dolci e saporiti.',
      commonMistakes: [
        'Evita di piantare troppo presto - i meloni sono molto sensibili al freddo.',
        'Evita terreno troppo povero - i meloni sono esigenti in nutrienti.',
        'Evita di innaffiare troppo poco durante la maturazione - può causare spaccature nei frutti.',
        'Evita di raccogliere troppo presto - aspetta che il frutto sia maturo per il miglior sapore.'
      ],
      harvestGuide: 'Raccogli i meloni quando il picciolo si stacca facilmente dalla pianta e il frutto emana un profumo dolce (circa 80-100 giorni dopo il trapianto). Il fondo del frutto dovrebbe essere leggermente morbido. I meloni maturi hanno un suono sordo quando li batti.'
    },
    
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Summer',
          daysActive: { min: 40, max: 120 },
          risk: 'Medium' // Oidio estivo
        }
      ]
    }
  },
  
  // ANGURIA
  {
    id: 'anguria',
    commonName: 'ANGURIA',
    nutrientCategory: 'FRUITING',
    scientificName: 'Citrullus lanatus (Thunb.) Matsum. & Nakai',
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
      sowingDepth: 1,
      idealTemp: '20-25°C',
      minTemp: 15,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 2-3 foglie vere (circa 3-4 settimane)',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido ma non bagnato',
      warning: 'Le angurie amano il caldo intenso e il sole',
      temperature: '20-25°C'
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano stabilmente i 15°C (maggio-giugno in Italia)',
      minTemp: 15,
      spacing: '100-150cm sulla fila, 150cm tra le file',
      holeDepth: 30,
      holeWidth: 40,
      soilRequirements: 'Ricco di sostanza organica e ben drenato. Aggiungi compost o letame maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    supportRequirements: {
      needsSupport: false,
      supportType: undefined,
      supportHeight: undefined,
      supportTiming: undefined,
      notes: 'Le angurie non necessitano supporti ma hanno bisogno di molto spazio'
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'L\'anguria è una pianta che ama il caldo intenso e il sole. Richiede molto spazio e acqua, ma produce frutti grandi e rinfrescanti.',
      commonMistakes: [
        'Evita di piantare troppo presto - le angurie sono molto sensibili al freddo.',
        'Evita terreno troppo povero - le angurie sono esigenti in nutrienti.',
        'Evita di innaffiare troppo poco - le angurie hanno bisogno di molta acqua, specialmente durante la crescita dei frutti.',
        'Evita di raccogliere troppo presto - aspetta che il frutto sia maturo per il miglior sapore.'
      ],
      harvestGuide: 'Raccogli le angurie quando il viticcio vicino al frutto è secco e marrone, e il fondo del frutto è giallo crema (circa 80-100 giorni dopo il trapianto). Il frutto maturo emana un suono sordo quando lo batti. Taglia il picciolo con un coltello affilato.'
    },
    
    susceptibility: {
      fungalDiseases: ['Oidio'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Summer',
          daysActive: { min: 40, max: 120 },
          risk: 'Medium' // Oidio estivo
        }
      ]
    }
  },
  
  // PEPERONE DOLCE
  {
    id: 'peperone-dolce',
    commonName: 'PEPERONE DOLCE',
    nutrientCategory: 'FRUITING',
    scientificName: 'Capsicum annuum L.',
    family: 'Solanaceae',
    
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: false,
      sprayer: true,
      additionalTools: ['Pellicola trasparente']
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '20-25°C',
      minTemp: 18,
      optimalTemp: 22,
      optimalTempRange: { min: 20, max: 25 },
      maxTemp: 28,
      heatingMatTemp: 22, // Opzionale ma consigliato
      humidityLevel: 'High',
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('10-21 giorni'),
      coveringNeeded: true,
      coveringType: 'PlasticWrap',
      coveringInstructions: 'Togli la pellicola quando compaiono i primi germogli',
      coveringRemoveWhen: 'Togli IMMEDIATAMENTE la pellicola appena vedi il primo cotiledone verde emergere',
      soilMoistureCheck: 'Tocca con il dito - deve essere umido ma non bagnato. Se esce acqua quando premi, è troppo bagnato',
      ventilationNeeded: false,
      // Metodo alternativo: scottex (consigliato per principianti)
      alternativeMethod: {
        name: 'Metodo Scottex',
        description: 'Germinazione su scottex in bicchieri di plastica - metodo più sicuro per principianti',
        instructions: [
          'Prepara bicchieri di plastica grandi da tavola con scottex umido sul fondo',
          'Metti i semi sullo scottex e copri con altro scottex umido per mantenere umidità',
          'L\'acqua evapora lentamente evitando che i semi rimangano a mollo',
          'Il secondo giorno pulisci i semi delicatamente rimuovendo eventuali residui (le impurità a bagno si ammorbidiscono)',
          'Non lasciare i semi all\'aria - coprili sempre con scottex per mantenere umidità',
          'Quando vedi la radichetta (2-3mm), trapianta immediatamente in terriccio'
        ],
        advantages: [
          'Riduce rischio di muffa sui semi',
          'Controllo visivo diretto della germinazione',
          'Evita problemi di eccessiva umidità nel terriccio'
        ]
      },
      // Gestione muffa
      moldPrevention: 'Se compaiono muffe sui semi, puliscili delicatamente il secondo giorno (le impurità a bagno si ammorbidiscono). Acquista sempre più semi del necessario per compensare eventuali perdite.'
    },
    
    seedlingCare: {
      transplantWhen: 'alla seconda coppia di foglie vere',
      lightNeeds: 'Tanta luce diretta o lampade LED',
      lightHours: 14,
      lightDetails: {
        type: 'LED',
        distance: 15,
        hours: 14,
        intensity: 'High',
        spectrum: 'Full'
      },
      temperature: '20-25°C',
      temperatureRange: { min: 20, max: 25 },
      watering: 'Solo quando il terriccio è quasi asciutto. Innaffia a fine giornata quando i raggi del sole si indeboliscono per evitare l\'effetto lente prodotto dall\'acqua sopra le foglie che le brucia',
      wateringMethod: 'Bottom',
      bottomWateringDepth: 2,
      bottomWateringDuration: 20,
      wateringTiming: 'Fine giornata (quando i raggi del sole si indeboliscono) per evitare effetto lente che brucia le foglie',
      soilCare: 'Se la temperatura è molto alta e il terriccio tende a seccarsi, smuovilo ogni tanto con una forchetta prima di annaffiare',
      ventilation: {
        needed: true,
        method: 'ventilatore leggero o finestra leggermente aperta',
        duration: '2-3 ore al giorno'
      },
      firstFertilization: {
        when: 'alla seconda coppia di foglie vere',
        type: 'concime liquido bilanciato (NPK 20-20-20)',
        dilution: '1/4 della dose consigliata'
      },
      warning: 'I peperoni amano il caldo - mantieni temperatura costante',
      // Problema comune: cotiledoni imprigionati
      commonIssues: {
        trappedCotyledons: {
          problem: 'Cotiledoni imprigionati nel tegumento del seme',
          solution: 'Aiuta delicatamente i cotiledoni a liberarsi bagnando il tegumento con acqua tiepida e rimuovendolo con delicatezza usando pinzette o dita',
          prevention: 'Mantieni umidità costante durante la germinazione'
        }
      }
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano stabilmente i 15°C (maggio-giugno in Italia)',
      minTemp: 15,
      spacing: '40-50cm sulla fila, 50cm tra le file',
      holeDepth: 25,
      holeWidth: 30,
      soilRequirements: 'Ricco di sostanza organica e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: true,
      protectionInstructions: 'Proteggi dal vento forte - i peperoni hanno fusti fragili'
    },
    
    supportRequirements: {
      needsSupport: true,
      supportType: 'Stake',
      supportHeight: 80,
      supportTiming: 'AsNeeded',
      notes: 'Paletto opzionale ma consigliato per varietà alte o zone ventose'
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il peperone dolce è una pianta che ama il caldo e il sole. Richiede pazienza ma produce frutti colorati e saporiti per tutta l\'estate.',
      commonMistakes: [
        'Evita di piantare troppo presto - i peperoni sono sensibili al freddo.',
        'Evita di innaffiare troppo - preferiscono terreno leggermente asciutto tra un\'irrigazione e l\'altra.',
        'Evita di innaffiare durante le ore calde - l\'acqua sulle foglie crea un effetto lente che le brucia. Innaffia a fine giornata.',
        'Evita di concimare troppo con azoto - favorisce foglie a discapito dei frutti.',
        'Evita di raccogliere troppo presto - lascia maturare i frutti per il massimo sapore.'
      ],
      growthNotes: [
        'Crescendo, la piantina assumerà una forma a Y',
        'Puoi eliminare i rametti superflui che crescono alla base della piantina, o levare solo quelli secchi, ma lascia sempre un cm del ramo',
        'La pianta crescerà molto velocemente - legala a un tutore quando raggiunge 30-40cm di altezza'
      ],
      harvestGuide: 'Raccogli i peperoni quando hanno raggiunto la dimensione e il colore desiderati. I peperoni verdi possono essere raccolti prima, mentre quelli colorati (gialli, rossi, arancioni) sono più dolci. Taglia il picciolo con un coltello affilato, lasciando un pezzetto di stelo.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // AGLIO
  {
    id: 'aglio',
    commonName: 'AGLIO',
    nutrientCategory: 'ROOT',
    scientificName: 'Allium sativum L.',
    family: 'Amaryllidaceae',
    
    requiredTools: {
      seedTray: false, // Si pianta da spicchi
      seedSoil: false,
      heatingMat: false,
      sprayer: false,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 3,
      idealTemp: '10-15°C',
      minTemp: 0,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si pianta direttamente da spicchi',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido durante la germinazione',
      warning: 'L\'aglio ama il clima fresco e terreno ben drenato',
      temperature: '10-15°C'
    },
    
    transplanting: {
      when: 'Piantare spicchi in autunno (ottobre-novembre) o primavera (febbraio-marzo)',
      minTemp: 0,
      spacing: '10-15cm sulla fila, 25-30cm tra le file',
      holeDepth: 3,
      holeWidth: 5,
      soilRequirements: 'Terreno fertile e ben drenato. Non aggiungere troppo azoto',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'L\'aglio è una pianta facile da coltivare che richiede poca manutenzione. Si pianta da spicchi e produce bulbi saporiti.',
      commonMistakes: [
        'Evita terreno troppo umido - l\'aglio preferisce terreno ben drenato.',
        'Evita di piantare spicchi troppo piccoli - usa solo gli spicchi più grandi e sani.',
        'Evita di non raccogliere i fiori - taglia i fiori per concentrare l\'energia sui bulbi.',
        'Evita di raccogliere troppo presto - aspetta che le foglie siano secche per almeno metà.'
      ],
      harvestGuide: 'Raccogli l\'aglio quando le foglie sono secche per almeno metà (giugno-luglio per semina autunnale). Scava delicatamente e lascia asciugare al sole per alcuni giorni. Conserva in un luogo fresco, asciutto e buio.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // PORRO
  {
    id: 'porro',
    commonName: 'PORRO',
    nutrientCategory: 'ROOT',
    scientificName: 'Allium ampeloprasum var. porrum',
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
      transplantWhen: 'quando le piantine hanno 3-4 foglie e sono alte 15-20cm',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido ma non bagnato',
      warning: 'I porri amano il clima fresco e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile per primavera, giugno-luglio per autunno)',
      minTemp: 5,
      spacing: '15-20cm sulla fila, 30cm tra le file',
      holeDepth: 15,
      holeWidth: 5,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: true,
      buryStemInstructions: 'Interra la piantina fino alle foglie per ottenere il fusto bianco',
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il porro è una pianta facile da coltivare che produce fusti bianchi e saporiti. Richiede rincalzatura per ottenere il fusto bianco.',
      commonMistakes: [
        'Evita terreno troppo compatto - i porri hanno bisogno di terreno sciolto per sviluppare il fusto.',
        'Evita di non rincalzare - necessario per ottenere il fusto bianco.',
        'Evita di innaffiare troppo poco - i porri hanno bisogno di acqua regolare.',
        'Evita di piantare troppo fitto - i porri hanno bisogno di spazio per svilupparsi.'
      ],
      harvestGuide: 'Raccogli i porri quando hanno raggiunto la dimensione desiderata (circa 100-120 giorni dopo il trapianto). Scava delicatamente e tira verso l\'alto. I porri possono essere lasciati in terra e raccolti quando servono.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Tripidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // SCALOGNO
  {
    id: 'scalogno',
    commonName: 'SCALOGNO',
    nutrientCategory: 'ROOT',
    scientificName: 'Allium cepa var. aggregatum',
    family: 'Amaryllidaceae',
    
    requiredTools: {
      seedTray: false, // Si pianta da bulbi
      seedSoil: false,
      heatingMat: false,
      sprayer: false,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 2,
      idealTemp: '10-15°C',
      minTemp: 0,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si pianta direttamente da bulbi',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido durante la germinazione',
      warning: 'Lo scalogno ama il clima fresco e terreno ben drenato',
      temperature: '10-15°C'
    },
    
    transplanting: {
      when: 'Piantare bulbi in autunno (ottobre-novembre) o primavera (febbraio-marzo)',
      minTemp: 0,
      spacing: '10-15cm sulla fila, 25-30cm tra le file',
      holeDepth: 2,
      holeWidth: 5,
      soilRequirements: 'Terreno fertile e ben drenato. Non aggiungere troppo azoto',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Lo scalogno è una pianta facile da coltivare simile alla cipolla ma con un sapore più delicato. Si pianta da bulbi e richiede poca manutenzione.',
      commonMistakes: [
        'Evita terreno troppo umido - lo scalogno preferisce terreno ben drenato.',
        'Evita di piantare bulbi troppo piccoli - usa solo i bulbi più grandi e sani.',
        'Evita di non diradare - lo scalogno ha bisogno di spazio per sviluppare i bulbi.',
        'Evita di raccogliere troppo presto - aspetta che le foglie siano secche.'
      ],
      harvestGuide: 'Raccogli lo scalogno quando le foglie sono secche e cadute (giugno-luglio per semina autunnale). Scava delicatamente e lascia asciugare al sole per alcuni giorni. Conserva in un luogo fresco, asciutto e buio.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // BARBABIETOLA ROSSA
  {
    id: 'barbabietola-rossa',
    commonName: 'BARBABIETOLA ROSSA',
    nutrientCategory: 'ROOT',
    scientificName: 'Beta vulgaris subsp. vulgaris',
    family: 'Amaranthaceae',
    
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
      sowingDepth: 1,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('10-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 2-3 foglie vere',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Le barbabietole amano il clima fresco e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile per primavera, agosto per autunno)',
      minTemp: 5,
      spacing: '10-15cm sulla fila, 25-30cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La barbabietola rossa è una radice nutriente e colorata, facile da coltivare. Può essere raccolta quando è piccola per consumo fresco o lasciata crescere per conservazione.',
      commonMistakes: [
        'Evita terreno troppo compatto - le barbabietole hanno bisogno di terreno sciolto per sviluppare le radici.',
        'Evita di non diradare - le barbabietole hanno bisogno di spazio per svilupparsi.',
        'Evita di innaffiare troppo poco - le barbabietole hanno bisogno di acqua regolare.',
        'Evita di raccogliere troppo presto - aspetta che le radici abbiano raggiunto la dimensione desiderata.'
      ],
      harvestGuide: 'Raccogli le barbabietole quando hanno raggiunto la dimensione desiderata (circa 60-90 giorni dopo il trapianto). Scava delicatamente e tira verso l\'alto. Le barbabietole piccole sono più tenere, quelle grandi sono migliori per conservazione.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // RAPA
  {
    id: 'rapa',
    commonName: 'RAPA',
    nutrientCategory: 'ROOT',
    scientificName: 'Brassica rapa subsp. rapa',
    family: 'Brassicaceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('5-10 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Le rape amano il clima fresco',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra da febbraio a maggio e da agosto a ottobre',
      minTemp: 5,
      spacing: 'Diradare a 10-15cm sulla fila, 25-30cm tra le file',
      holeDepth: 1,
      holeWidth: 2,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La rapa è una radice facile da coltivare che cresce velocemente. Può essere raccolta quando è piccola per consumo fresco o lasciata crescere per conservazione.',
      commonMistakes: [
        'Evita terreno troppo compatto - le rape hanno bisogno di terreno sciolto per sviluppare le radici.',
        'Evita di non diradare - le rape hanno bisogno di spazio per svilupparsi.',
        'Evita di innaffiare troppo poco - le rape hanno bisogno di acqua regolare.',
        'Evita di lasciare andare a seme - raccogli prima che fiorisca per il miglior sapore.'
      ],
      harvestGuide: 'Raccogli le rape quando hanno raggiunto la dimensione desiderata (circa 40-60 giorni dopo la semina). Scava delicatamente e tira verso l\'alto. Le rape piccole sono più tenere, quelle grandi sono migliori per conservazione.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // RAVANELLO
  {
    id: 'ravanello',
    commonName: 'RAVANELLO',
    nutrientCategory: 'ROOT',
    scientificName: 'Raphanus sativus L.',
    family: 'Brassicaceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('5-7 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'I ravanelli amano il clima fresco e crescono velocemente',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra da febbraio a maggio e da agosto a ottobre',
      minTemp: 5,
      spacing: 'Diradare a 3-5cm sulla fila, 15-20cm tra le file',
      holeDepth: 1,
      holeWidth: 2,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il ravanello è una radice facile da coltivare che cresce molto velocemente. Perfetto per principianti e per raccolti rapidi.',
      commonMistakes: [
        'Evita terreno troppo compatto - i ravanelli hanno bisogno di terreno sciolto per sviluppare le radici.',
        'Evita di non diradare - i ravanelli hanno bisogno di spazio per svilupparsi.',
        'Evita di innaffiare troppo poco - i ravanelli hanno bisogno di acqua regolare, altrimenti diventano piccanti.',
        'Evita di lasciare andare a seme - raccogli prima che fiorisca per il miglior sapore.'
      ],
      harvestGuide: 'Raccogli i ravanelli quando hanno raggiunto la dimensione desiderata (circa 25-30 giorni dopo la semina). Scava delicatamente e tira verso l\'alto. I ravanelli piccoli sono più teneri e meno piccanti.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // SEDANO
  {
    id: 'sedano',
    commonName: 'SEDANO',
    nutrientCategory: 'ROOT',
    scientificName: 'Apium graveolens var. dulce',
    family: 'Apiaceae',
    
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
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il sedano ama il clima fresco e terreno costantemente umido',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile per primavera, agosto per autunno)',
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
      introduction: 'Il sedano è una pianta che richiede terreno costantemente umido e clima fresco. Richiede pazienza ma produce fusti croccanti e saporiti.',
      commonMistakes: [
        'Evita terreno troppo secco - il sedano ha bisogno di terreno costantemente umido.',
        'Evita di innaffiare troppo poco - il sedano appassisce rapidamente se manca l\'acqua.',
        'Evita di piantare troppo fitto - il sedano ha bisogno di spazio per svilupparsi.',
        'Evita di non rincalzare - necessario per ottenere fusti bianchi e croccanti.'
      ],
      harvestGuide: 'Raccogli il sedano quando i fusti hanno raggiunto la dimensione desiderata (circa 100-120 giorni dopo il trapianto). Taglia alla base con un coltello affilato. I fusti esterni possono essere raccolti per primi.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // SEDANO RAPA
  {
    id: 'sedano-rapa',
    commonName: 'SEDANO RAPA',
    nutrientCategory: 'ROOT',
    scientificName: 'Apium graveolens var. rapaceum',
    family: 'Apiaceae',
    
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
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il sedano rapa ama il clima fresco e terreno costantemente umido',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile)',
      minTemp: 5,
      spacing: '30-40cm sulla fila, 40cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il sedano rapa è una varietà di sedano che produce una radice ingrossata e saporita. Richiede terreno costantemente umido e clima fresco.',
      commonMistakes: [
        'Evita terreno troppo secco - il sedano rapa ha bisogno di terreno costantemente umido.',
        'Evita di innaffiare troppo poco - il sedano rapa appassisce rapidamente se manca l\'acqua.',
        'Evita di piantare troppo fitto - il sedano rapa ha bisogno di spazio per sviluppare la radice.',
        'Evita di non rincalzare - necessario per ottenere una radice ben formata.'
      ],
      harvestGuide: 'Raccogli il sedano rapa quando la radice ha raggiunto la dimensione desiderata (circa 120-150 giorni dopo il trapianto). Scava delicatamente e tira verso l\'alto. La radice può essere conservata in un luogo fresco e umido.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // PREZZEMOLO
  {
    id: 'prezzemolo',
    commonName: 'PREZZEMOLO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Petroselinum crispum',
    family: 'Apiaceae',
    
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: true, // Il prezzemolo ha germinazione lenta
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('14-28 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Luce diretta o mezz\'ombra',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il prezzemolo ha germinazione lenta - sii paziente',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile)',
      minTemp: 5,
      spacing: '15-20cm sulla fila, 20cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il prezzemolo è un\'erba aromatica essenziale in cucina. Ha germinazione lenta ma una volta stabilito produce foglie per tutto l\'anno.',
      commonMistakes: [
        'Evita di non ammollare i semi - il prezzemolo ha germinazione lenta, l\'ammollo aiuta.',
        'Evita terreno troppo secco - il prezzemolo ha bisogno di terreno costantemente umido.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la crescita continua.',
        'Evita di lasciare andare a seme - taglia i fiori per prolungare la produzione.'
      ],
      harvestGuide: 'Raccogli le foglie esterne tagliandole alla base con un coltello affilato. Raccogli regolarmente per stimolare la crescita continua. Il prezzemolo può essere raccolto tutto l\'anno se protetto dal gelo.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // CARCIOFO
  {
    id: 'carciofo',
    commonName: 'CARCIOFO',
    nutrientCategory: 'FRUITING',
    scientificName: 'Cynara cardunculus var. scolymus',
    family: 'Asteraceae',
    
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
      sowingDepth: 1,
      idealTemp: '15-20°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido ma non bagnato',
      warning: 'I carciofi amano il clima mite e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile)',
      minTemp: 10,
      spacing: '80-100cm sulla fila, 100cm tra le file',
      holeDepth: 30,
      holeWidth: 40,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost o letame maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il carciofo è una pianta perenne che produce capolini saporiti. Richiede spazio e terreno fertile, ma una volta stabilito produce per molti anni.',
      commonMistakes: [
        'Evita terreno troppo povero - i carciofi sono esigenti in nutrienti.',
        'Evita di piantare troppo fitto - i carciofi hanno bisogno di molto spazio per svilupparsi.',
        'Evita di non proteggere dal gelo - i carciofi sono sensibili al freddo intenso.',
        'Evita di raccogliere troppo tardi - i capolini diventano duri e amari se lasciati troppo a lungo.'
      ],
      harvestGuide: 'Raccogli i carciofi quando i capolini sono compatti e le brattee sono ancora chiuse (aprile-giugno). Taglia il capolino con un coltello affilato, lasciando 5-10cm di stelo. Raccogli prima che i capolini si aprano.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // ASPARAGO
  {
    id: 'asparago',
    commonName: 'ASPARAGO',
    nutrientCategory: 'ROOT',
    scientificName: 'Asparagus officinalis L.',
    family: 'Asparagaceae',
    
    requiredTools: {
      seedTray: false, // Si pianta da zampe (rizomi)
      seedSoil: false,
      heatingMat: false,
      sprayer: false,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 2,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('21-30 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si pianta direttamente da zampe (rizomi)',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido durante la crescita',
      warning: 'Gli asparagi sono piante perenni - richiedono pazienza per il primo raccolto',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Piantare zampe (rizomi) in primavera (marzo-aprile)',
      minTemp: 5,
      spacing: '40-50cm sulla fila, 100cm tra le file',
      holeDepth: 20,
      holeWidth: 30,
      soilRequirements: 'Terreno fertile e ben drenato. Scava una buca profonda e aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'L\'asparago è una pianta perenne che richiede pazienza per il primo raccolto (2-3 anni), ma poi produce per molti anni. Richiede terreno preparato bene.',
      commonMistakes: [
        'Evita terreno troppo compatto - gli asparagi hanno bisogno di terreno sciolto e profondo.',
        'Evita di raccogliere troppo presto - aspetta almeno 2-3 anni prima del primo raccolto.',
        'Evita di non tagliare i fusti secchi - taglia i fusti secchi in autunno per favorire la crescita primaverile.',
        'Evita terreno troppo umido - gli asparagi preferiscono terreno ben drenato.'
      ],
      harvestGuide: 'Raccogli gli asparagi quando i turioni sono lunghi 15-20cm e ancora teneri (aprile-giugno). Taglia il turione alla base con un coltello affilato. Non raccogliere dopo giugno per permettere alla pianta di ricostituire le riserve.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // RUCOLA
  {
    id: 'rucola',
    commonName: 'RUCOLA',
    nutrientCategory: 'LEAFY',
    scientificName: 'Eruca sativa Mill.',
    family: 'Brassicaceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('5-7 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta o mezz\'ombra',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'La rucola cresce velocemente e ama il clima fresco',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra da febbraio a maggio e da agosto a ottobre',
      minTemp: 5,
      spacing: 'Diradare a 10-15cm sulla fila, 20cm tra le file',
      holeDepth: 0.5,
      holeWidth: 2,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La rucola è una verdura a foglia piccante e saporita, facile da coltivare e che cresce velocemente. Perfetta per insalate e contorni.',
      commonMistakes: [
        'Evita terreno troppo secco - la rucola ha bisogno di terreno costantemente umido.',
        'Evita di non diradare - la rucola ha bisogno di spazio per svilupparsi.',
        'Evita di lasciare andare a seme - raccogli prima che fiorisca per il miglior sapore.',
        'Evita di piantare in pieno sole estivo - preferisce ombra parziale in estate.'
      ],
      harvestGuide: 'Raccogli le foglie esterne quando sono grandi abbastanza, oppure taglia l\'intera pianta alla base quando ha raggiunto la dimensione desiderata (circa 30-40 giorni dopo la semina). Raccogli regolarmente per stimolare la crescita continua.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // PASTINACA
  {
    id: 'pastinaca',
    commonName: 'PASTINACA',
    nutrientCategory: 'ROOT',
    scientificName: 'Pastinaca sativa L.',
    family: 'Apiaceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido durante la germinazione',
      warning: 'La pastinaca ha germinazione lenta - sii paziente',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra in primavera (marzo-aprile)',
      minTemp: 5,
      spacing: 'Diradare a 10-15cm sulla fila, 30cm tra le file',
      holeDepth: 1,
      holeWidth: 2,
      soilRequirements: 'Terreno fertile e ben drenato, senza sassi. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La pastinaca è una radice simile alla carota ma con un sapore più dolce e aromatico. Richiede terreno preparato bene e pazienza per la germinazione.',
      commonMistakes: [
        'Evita terreno troppo compatto o con sassi - la pastinaca ha bisogno di terreno sciolto per sviluppare le radici.',
        'Evita di non diradare - la pastinaca ha bisogno di spazio per svilupparsi.',
        'Evita di innaffiare troppo poco - la pastinaca ha bisogno di acqua regolare.',
        'Evita di raccogliere troppo presto - la pastinaca migliora il sapore dopo le prime gelate.'
      ],
      harvestGuide: 'Raccogli la pastinaca quando le radici hanno raggiunto la dimensione desiderata (circa 100-120 giorni dopo la semina). Scava delicatamente e tira verso l\'alto. La pastinaca può essere lasciata in terra e raccolta quando servono, anche dopo le prime gelate.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // TOPINAMBUR
  {
    id: 'topinambur',
    commonName: 'TOPINAMBUR',
    nutrientCategory: 'ROOT',
    scientificName: 'Helianthus tuberosus L.',
    family: 'Asteraceae',
    
    requiredTools: {
      seedTray: false, // Si pianta da tuberi
      seedSoil: false,
      heatingMat: false,
      sprayer: false,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 10,
      idealTemp: '10-15°C',
      minTemp: 0,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si pianta direttamente da tuberi',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido durante la crescita',
      warning: 'Il topinambur è molto invasivo - pianta in un\'area delimitata',
      temperature: '10-15°C'
    },
    
    transplanting: {
      when: 'Piantare tuberi in primavera (marzo-aprile) o autunno (ottobre-novembre)',
      minTemp: 0,
      spacing: '30-40cm sulla fila, 50cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il topinambur è una pianta perenne che produce tuberi saporiti. È molto invasivo, quindi pianta in un\'area delimitata o in contenitori.',
      commonMistakes: [
        'Evita di piantare in un\'area non delimitata - il topinambur è molto invasivo.',
        'Evita terreno troppo umido - il topinambur preferisce terreno ben drenato.',
        'Evita di non raccogliere tutti i tuberi - lasciare tuberi nel terreno favorisce la propagazione.',
        'Evita di non controllare la crescita - il topinambur può diventare infestante.'
      ],
      harvestGuide: 'Raccogli i topinambur quando le foglie sono secche (ottobre-novembre). Scava delicatamente e raccogli tutti i tuberi. I tuberi possono essere lasciati in terra e raccolti quando servono durante l\'inverno.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // PATATA DOLCE
  {
    id: 'patata-dolce',
    commonName: 'PATATA DOLCE',
    nutrientCategory: 'ROOT',
    scientificName: 'Ipomoea batatas (L.) Lam.',
    family: 'Convolvulaceae',
    
    requiredTools: {
      seedTray: false, // Si pianta da talee o tuberi
      seedSoil: false,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 5,
      idealTemp: '20-25°C',
      minTemp: 15,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si pianta direttamente da talee o tuberi',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido durante la crescita',
      warning: 'La patata dolce ama il caldo intenso e il sole',
      temperature: '20-25°C'
    },
    
    transplanting: {
      when: 'Piantare talee o tuberi quando le temperature notturne superano i 15°C (maggio-giugno)',
      minTemp: 15,
      spacing: '30-40cm sulla fila, 80-100cm tra le file',
      holeDepth: 5,
      holeWidth: 10,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La patata dolce è una pianta che ama il caldo intenso e il sole. Richiede spazio e terreno fertile, ma produce tuberi dolci e nutrienti.',
      commonMistakes: [
        'Evita di piantare troppo presto - la patata dolce è molto sensibile al freddo.',
        'Evita terreno troppo umido - la patata dolce preferisce terreno ben drenato.',
        'Evita di non rincalzare - necessario per proteggere i tuberi dalla luce.',
        'Evita di raccogliere troppo presto - aspetta che le foglie siano secche per il miglior sapore.'
      ],
      harvestGuide: 'Raccogli le patate dolci quando le foglie sono secche (settembre-ottobre). Scava delicatamente e raccogli tutti i tuberi. Lascia asciugare al sole per alcuni giorni prima di conservare in un luogo fresco e asciutto.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // ERBA CIPOLLINA
  {
    id: 'erba-cipollina',
    commonName: 'ERBA CIPOLLINA',
    nutrientCategory: 'LEAFY',
    scientificName: 'Allium schoenoprasum L.',
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
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('10-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 3-4 foglie',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido ma non bagnato',
      warning: 'L\'erba cipollina è una pianta perenne - una volta stabilito produce per molti anni',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile)',
      minTemp: 5,
      spacing: '15-20cm sulla fila, 20cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'L\'erba cipollina è un\'erba aromatica perenne facile da coltivare. Produce foglie saporite per tutto l\'anno se protetta dal gelo.',
      commonMistakes: [
        'Evita terreno troppo secco - l\'erba cipollina ha bisogno di terreno umido ma ben drenato.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la crescita continua.',
        'Evita di lasciare andare a seme - taglia i fiori per prolungare la produzione.',
        'Evita di non dividere - dividi i cespi ogni 3-4 anni per mantenere la pianta vigorosa.'
      ],
      harvestGuide: 'Raccogli le foglie tagliandole alla base con un coltello affilato. Raccogli regolarmente per stimolare la crescita continua. L\'erba cipollina può essere raccolto tutto l\'anno se protetto dal gelo.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // LATTUGA ROMANA
  {
    id: 'lattuga-romana',
    commonName: 'LATTUGA ROMANA',
    nutrientCategory: 'LEAFY',
    scientificName: 'Lactuca sativa var. longifolia',
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
      warning: 'Le lattughe romane non amano il caldo eccessivo',
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
      introduction: 'La lattuga romana è una varietà di lattuga con foglie allungate e croccanti. Cresce velocemente e può essere coltivata quasi tutto l\'anno.',
      commonMistakes: [
        'Evita di piantare in pieno sole estivo - preferisce ombra parziale in estate.',
        'Evita di innaffiare troppo - può causare marciume. Mantieni terreno umido ma non bagnato.',
        'Evita di piantare troppo fitto - le lattughe romane hanno bisogno di spazio per svilupparsi.',
        'Evita di lasciare andare a seme - raccogli prima che fiorisca per il miglior sapore.'
      ],
      harvestGuide: 'Raccogli le foglie esterne quando sono grandi abbastanza, oppure taglia l\'intera pianta alla base quando ha raggiunto la dimensione desiderata. Raccogli al mattino per la massima croccantezza.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // LATTUGA ICEBERG
  {
    id: 'lattuga-iceberg',
    commonName: 'LATTUGA ICEBERG',
    nutrientCategory: 'LEAFY',
    scientificName: 'Lactuca sativa var. capitata',
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
      warning: 'Le lattughe iceberg non amano il caldo eccessivo',
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
      introduction: 'La lattuga iceberg è una varietà di lattuga con cespo compatto e croccante. Richiede più tempo per formare il cespo rispetto ad altre varietà.',
      commonMistakes: [
        'Evita di piantare in pieno sole estivo - preferisce ombra parziale in estate.',
        'Evita di innaffiare troppo - può causare marciume. Mantieni terreno umido ma non bagnato.',
        'Evita di piantare troppo fitto - le lattughe iceberg hanno bisogno di spazio per formare il cespo.',
        'Evita di raccogliere troppo presto - aspetta che il cespo sia ben formato.'
      ],
      harvestGuide: 'Raccogli la lattuga iceberg quando il cespo è compatto e ben formato. Taglia alla base con un coltello affilato. Raccogli al mattino per la massima croccantezza.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // INDIVIA RICCIA
  {
    id: 'indivia-riccia',
    commonName: 'INDIVIA RICCIA',
    nutrientCategory: 'LEAFY',
    scientificName: 'Cichorium endivia var. crispum',
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
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta o mezz\'ombra',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'L\'indivia riccia ama il fresco e non il caldo eccessivo',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le temperature sono stabili (marzo-aprile per primavera, agosto per autunno)',
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
      introduction: 'L\'indivia riccia è una verdura a foglia amara e croccante, perfetta per insalate. Cresce bene in clima fresco e può essere coltivata quasi tutto l\'anno.',
      commonMistakes: [
        'Evita di piantare in pieno sole estivo - preferisce ombra parziale in estate.',
        'Evita di innaffiare troppo - può causare marciume. Mantieni terreno umido ma non bagnato.',
        'Evita di non diradare - l\'indivia riccia ha bisogno di spazio per svilupparsi.',
        'Evita di non fare l\'imbianchimento - necessario per ridurre l\'amaro.'
      ],
      harvestGuide: 'Raccogli le foglie esterne quando sono grandi abbastanza, oppure taglia l\'intera pianta alla base quando ha raggiunto la dimensione desiderata. Per ridurre l\'amaro, fai l\'imbianchimento coprendo la pianta 2-3 settimane prima della raccolta.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // SCAROLA
  {
    id: 'scarola',
    commonName: 'SCAROLA',
    nutrientCategory: 'LEAFY',
    scientificName: 'Cichorium endivia var. latifolium',
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
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta o mezz\'ombra',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'La scarola ama il fresco e non il caldo eccessivo',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le temperature sono stabili (marzo-aprile per primavera, agosto per autunno)',
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
      introduction: 'La scarola è una verdura a foglia amara e croccante, perfetta per insalate. Cresce bene in clima fresco e può essere coltivata quasi tutto l\'anno.',
      commonMistakes: [
        'Evita di piantare in pieno sole estivo - preferisce ombra parziale in estate.',
        'Evita di innaffiare troppo - può causare marciume. Mantieni terreno umido ma non bagnato.',
        'Evita di non diradare - la scarola ha bisogno di spazio per svilupparsi.',
        'Evita di non fare l\'imbianchimento - necessario per ridurre l\'amaro.'
      ],
      harvestGuide: 'Raccogli le foglie esterne quando sono grandi abbastanza, oppure taglia l\'intera pianta alla base quando ha raggiunto la dimensione desiderata. Per ridurre l\'amaro, fai l\'imbianchimento coprendo la pianta 2-3 settimane prima della raccolta.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // CICORIA
  {
    id: 'cicoria',
    commonName: 'CICORIA',
    nutrientCategory: 'LEAFY',
    scientificName: 'Cichorium intybus L.',
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
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta o mezz\'ombra',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'La cicoria ama il fresco e non il caldo eccessivo',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le temperature sono stabili (marzo-aprile per primavera, agosto per autunno)',
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
      introduction: 'La cicoria è una verdura a foglia amara e croccante, perfetta per insalate. Cresce bene in clima fresco e può essere coltivata quasi tutto l\'anno.',
      commonMistakes: [
        'Evita di piantare in pieno sole estivo - preferisce ombra parziale in estate.',
        'Evita di innaffiare troppo - può causare marciume. Mantieni terreno umido ma non bagnato.',
        'Evita di non diradare - la cicoria ha bisogno di spazio per svilupparsi.',
        'Evita di non fare l\'imbianchimento - necessario per ridurre l\'amaro.'
      ],
      harvestGuide: 'Raccogli le foglie esterne quando sono grandi abbastanza, oppure taglia l\'intera pianta alla base quando ha raggiunto la dimensione desiderata. Per ridurre l\'amaro, fai l\'imbianchimento coprendo la pianta 2-3 settimane prima della raccolta.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // CATALOGNA
  {
    id: 'catalogna',
    commonName: 'CATALOGNA',
    nutrientCategory: 'LEAFY',
    scientificName: 'Cichorium intybus var. foliosum',
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
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta o mezz\'ombra',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'La catalogna ama il fresco e non il caldo eccessivo',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le temperature sono stabili (marzo-aprile per primavera, agosto per autunno)',
      minTemp: 5,
      spacing: '30-40cm sulla fila, 40cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La catalogna è una verdura a foglia amara e croccante, con foglie allungate e dentate. Cresce bene in clima fresco e può essere coltivata quasi tutto l\'anno.',
      commonMistakes: [
        'Evita di piantare in pieno sole estivo - preferisce ombra parziale in estate.',
        'Evita di innaffiare troppo - può causare marciume. Mantieni terreno umido ma non bagnato.',
        'Evita di non diradare - la catalogna ha bisogno di spazio per svilupparsi.',
        'Evita di non fare l\'imbianchimento - necessario per ridurre l\'amaro.'
      ],
      harvestGuide: 'Raccogli le foglie esterne quando sono grandi abbastanza, oppure taglia l\'intera pianta alla base quando ha raggiunto la dimensione desiderata. Per ridurre l\'amaro, fai l\'imbianchimento coprendo la pianta 2-3 settimane prima della raccolta.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // PUNTARELLE
  {
    id: 'puntarelle',
    commonName: 'PUNTARELLE',
    nutrientCategory: 'LEAFY',
    scientificName: 'Cichorium intybus var. foliosum',
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
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta o mezz\'ombra',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Le puntarelle amano il fresco e non il caldo eccessivo',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le temperature sono stabili (marzo-aprile per primavera, agosto per autunno)',
      minTemp: 5,
      spacing: '30-40cm sulla fila, 40cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Le puntarelle sono i germogli teneri della catalogna, molto apprezzati in cucina. Richiedono l\'imbianchimento per sviluppare i germogli bianchi e croccanti.',
      commonMistakes: [
        'Evita di piantare in pieno sole estivo - preferisce ombra parziale in estate.',
        'Evita di innaffiare troppo - può causare marciume. Mantieni terreno umido ma non bagnato.',
        'Evita di non fare l\'imbianchimento - necessario per sviluppare i germogli bianchi.',
        'Evita di raccogliere troppo presto - aspetta che i germogli siano ben formati.'
      ],
      harvestGuide: 'Raccogli le puntarelle quando i germogli sono ben formati e bianchi (circa 2-3 settimane dopo l\'imbianchimento). Taglia i germogli alla base con un coltello affilato.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // RADICCHIO VARiegato CASTELFRANCO
  {
    id: 'radicchio-variegato-castelfranco',
    commonName: 'RADICCHIO VARiegato CASTELFRANCO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Cichorium intybus var. foliosum',
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
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta o mezz\'ombra',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il radicchio variegato ama il fresco e non il caldo eccessivo',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le temperature sono stabili (marzo-aprile per primavera, agosto per autunno)',
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
      introduction: 'Il radicchio variegato di Castelfranco è una varietà pregiata di radicchio con foglie variegate e sapore delicato. Richiede l\'imbianchimento per sviluppare il colore caratteristico.',
      commonMistakes: [
        'Evita di piantare in pieno sole estivo - preferisce ombra parziale in estate.',
        'Evita di innaffiare troppo - può causare marciume. Mantieni terreno umido ma non bagnato.',
        'Evita di non fare l\'imbianchimento - necessario per sviluppare il colore variegato.',
        'Evita di raccogliere troppo presto - aspetta che il cespo sia ben formato.'
      ],
      harvestGuide: 'Raccogli il radicchio variegato quando il cespo è ben formato e ha il colore caratteristico (circa 2-3 settimane dopo l\'imbianchimento). Taglia alla base con un coltello affilato.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // VALERIANA (SONGINO)
  {
    id: 'valeriana-songino',
    commonName: 'VALERIANA (SONGINO)',
    nutrientCategory: 'LEAFY',
    scientificName: 'Valerianella locusta',
    family: 'Caprifoliaceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta o mezz\'ombra',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'La valeriana ama il clima fresco e cresce velocemente',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra da febbraio a maggio e da agosto a ottobre',
      minTemp: 5,
      spacing: 'Diradare a 10-15cm sulla fila, 20cm tra le file',
      holeDepth: 0.5,
      holeWidth: 2,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La valeriana (songino) è una verdura a foglia tenera e saporita, facile da coltivare e che cresce velocemente. Perfetta per insalate.',
      commonMistakes: [
        'Evita terreno troppo secco - la valeriana ha bisogno di terreno costantemente umido.',
        'Evita di non diradare - la valeriana ha bisogno di spazio per svilupparsi.',
        'Evita di lasciare andare a seme - raccogli prima che fiorisca per il miglior sapore.',
        'Evita di piantare in pieno sole estivo - preferisce ombra parziale in estate.'
      ],
      harvestGuide: 'Raccogli le foglie esterne quando sono grandi abbastanza, oppure taglia l\'intera pianta alla base quando ha raggiunto la dimensione desiderata (circa 40-50 giorni dopo la semina). Raccogli regolarmente per stimolare la crescita continua.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // BIETOLA DA COSTA
  {
    id: 'bietola-da-costa',
    commonName: 'BIETOLA DA COSTA',
    nutrientCategory: 'LEAFY',
    scientificName: 'Beta vulgaris subsp. vulgaris',
    family: 'Amaranthaceae',
    
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
      sowingDepth: 1,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('10-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 2-3 foglie vere',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'La bietola da costa ama il clima fresco e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile per primavera, agosto per autunno)',
      minTemp: 5,
      spacing: '30-40cm sulla fila, 40cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La bietola da costa è una verdura a foglia con coste larghe e colorate, facile da coltivare e molto produttiva. Può essere raccolta foglia per foglia o intera.',
      commonMistakes: [
        'Evita terreno troppo secco - la bietola da costa ha bisogno di terreno costantemente umido.',
        'Evita di non diradare - la bietola da costa ha bisogno di spazio per svilupparsi.',
        'Evita di innaffiare troppo poco - la bietola da costa appassisce rapidamente se manca l\'acqua.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la crescita continua.'
      ],
      harvestGuide: 'Raccogli le foglie esterne tagliandole alla base con un coltello affilato, oppure taglia l\'intera pianta alla base quando ha raggiunto la dimensione desiderata. Raccogli regolarmente per stimolare la crescita continua.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // BIETOLA DA TAGLIO
  {
    id: 'bietola-da-taglio',
    commonName: 'BIETOLA DA TAGLIO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Beta vulgaris subsp. vulgaris',
    family: 'Amaranthaceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('10-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'La bietola da taglio ama il clima fresco e cresce velocemente',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra da febbraio a maggio e da agosto a ottobre',
      minTemp: 5,
      spacing: 'Diradare a 10-15cm sulla fila, 25-30cm tra le file',
      holeDepth: 1,
      holeWidth: 2,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La bietola da taglio è una verdura a foglia facile da coltivare e molto produttiva. Può essere raccolta foglia per foglia e ricresce rapidamente.',
      commonMistakes: [
        'Evita terreno troppo secco - la bietola da taglio ha bisogno di terreno costantemente umido.',
        'Evita di non diradare - la bietola da taglio ha bisogno di spazio per svilupparsi.',
        'Evita di innaffiare troppo poco - la bietola da taglio appassisce rapidamente se manca l\'acqua.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la crescita continua.'
      ],
      harvestGuide: 'Raccogli le foglie esterne tagliandole alla base con un coltello affilato quando sono grandi abbastanza (circa 30-40 giorni dopo la semina). Raccogli regolarmente per stimolare la crescita continua.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // SPINACIO NEozelandese
  {
    id: 'spinacio-neozelandese',
    commonName: 'SPINACIO NEozelandese',
    nutrientCategory: 'LEAFY',
    scientificName: 'Tetragonia tetragonioides',
    family: 'Aizoaceae',
    
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: true, // Il seme ha tegumento duro
      sowingDepth: 1,
      idealTemp: '15-20°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Lo spinacio neozelandese ama il caldo e resiste meglio al caldo rispetto allo spinacio comune',
      temperature: '18-25°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (maggio-giugno)',
      minTemp: 10,
      spacing: '40-50cm sulla fila, 50cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Lo spinacio neozelandese è una varietà di spinacio che resiste meglio al caldo rispetto allo spinacio comune. Produce foglie saporite per tutta l\'estate.',
      commonMistakes: [
        'Evita terreno troppo secco - lo spinacio neozelandese ha bisogno di terreno costantemente umido.',
        'Evita di non diradare - lo spinacio neozelandese ha bisogno di spazio per svilupparsi.',
        'Evita di innaffiare troppo poco - lo spinacio neozelandese appassisce rapidamente se manca l\'acqua.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la crescita continua.'
      ],
      harvestGuide: 'Raccogli le foglie esterne tagliandole alla base con un coltello affilato quando sono grandi abbastanza. Raccogli regolarmente per stimolare la crescita continua.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // CRESCIONE
  {
    id: 'crescione',
    commonName: 'CRESCIONE',
    nutrientCategory: 'LEAFY',
    scientificName: 'Lepidium sativum',
    family: 'Brassicaceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('5-7 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta o mezz\'ombra',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il crescione ama il clima fresco e cresce velocemente',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra da febbraio a maggio e da agosto a ottobre',
      minTemp: 5,
      spacing: 'Diradare a 5-10cm sulla fila, 15-20cm tra le file',
      holeDepth: 0.5,
      holeWidth: 2,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il crescione è una verdura a foglia piccante e saporita, facile da coltivare e che cresce molto velocemente. Perfetta per insalate e contorni.',
      commonMistakes: [
        'Evita terreno troppo secco - il crescione ha bisogno di terreno costantemente umido.',
        'Evita di non diradare - il crescione ha bisogno di spazio per svilupparsi.',
        'Evita di lasciare andare a seme - raccogli prima che fiorisca per il miglior sapore.',
        'Evita di piantare in pieno sole estivo - preferisce ombra parziale in estate.'
      ],
      harvestGuide: 'Raccogli le foglie esterne quando sono grandi abbastanza, oppure taglia l\'intera pianta alla base quando ha raggiunto la dimensione desiderata (circa 20-30 giorni dopo la semina). Raccogli regolarmente per stimolare la crescita continua.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // PORTULACA
  {
    id: 'portulaca',
    commonName: 'PORTULACA',
    nutrientCategory: 'LEAFY',
    scientificName: 'Portulaca oleracea L.',
    family: 'Portulacaceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '20-25°C',
      minTemp: 15,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'La portulaca ama il caldo e cresce velocemente',
      temperature: '20-25°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra quando le temperature notturne superano i 15°C (maggio-giugno)',
      minTemp: 15,
      spacing: 'Diradare a 10-15cm sulla fila, 20cm tra le file',
      holeDepth: 0.5,
      holeWidth: 2,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La portulaca è una verdura a foglia succulenta e saporita, facile da coltivare e che cresce velocemente. Perfetta per insalate e contorni.',
      commonMistakes: [
        'Evita terreno troppo secco - la portulaca ha bisogno di terreno costantemente umido.',
        'Evita di non diradare - la portulaca ha bisogno di spazio per svilupparsi.',
        'Evita di lasciare andare a seme - raccogli prima che fiorisca per il miglior sapore.',
        'Evita di piantare troppo presto - la portulaca ama il caldo.'
      ],
      harvestGuide: 'Raccogli le foglie e i fusti teneri quando sono grandi abbastanza, oppure taglia l\'intera pianta alla base quando ha raggiunto la dimensione desiderata (circa 30-40 giorni dopo la semina). Raccogli regolarmente per stimolare la crescita continua.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // CAVOLFIORE
  {
    id: 'cavolfiore',
    commonName: 'CAVOLFIORE',
    nutrientCategory: 'LEAFY',
    scientificName: 'Brassica oleracea var. botrytis',
    family: 'Brassicaceae',
    
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
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il cavolfiore ama il clima fresco e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile per primavera, agosto per autunno)',
      minTemp: 5,
      spacing: '50-60cm sulla fila, 60cm tra le file',
      holeDepth: 15,
      holeWidth: 20,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost o letame maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il cavolfiore è una verdura invernale che produce teste compatte e saporite. Richiede terreno fertile e clima fresco.',
      commonMistakes: [
        'Evita terreno troppo povero - il cavolfiore è esigente in nutrienti.',
        'Evita di piantare troppo fitto - il cavolfiore ha bisogno di spazio per svilupparsi.',
        'Evita di non coprire le teste - necessario per mantenere il colore bianco.',
        'Evita di raccogliere troppo tardi - le teste diventano gialle e fioriscono.'
      ],
      harvestGuide: 'Raccogli il cavolfiore quando la testa è compatta e ben formata, prima che i fiori si aprano. Taglia la testa con un coltello affilato, lasciando alcune foglie attaccate. Copri le teste con le foglie per mantenere il colore bianco.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi', 'Cavolaia'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 30, max: 90 },
          risk: 'Medium' // Cavolaia primaverile
        }
      ]
    }
  },
  
  // BROCCOLO
  {
    id: 'broccolo',
    commonName: 'BROCCOLO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Brassica oleracea var. italica',
    family: 'Brassicaceae',
    
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
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il broccolo ama il clima fresco e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile per primavera, agosto per autunno)',
      minTemp: 5,
      spacing: '50-60cm sulla fila, 60cm tra le file',
      holeDepth: 15,
      holeWidth: 20,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost o letame maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il broccolo è una verdura invernale che produce teste saporite e nutrienti. Richiede terreno fertile e clima fresco.',
      commonMistakes: [
        'Evita terreno troppo povero - il broccolo è esigente in nutrienti.',
        'Evita di piantare troppo fitto - il broccolo ha bisogno di spazio per svilupparsi.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la produzione di getti laterali.',
        'Evita di raccogliere troppo tardi - le teste diventano gialle e fioriscono.'
      ],
      harvestGuide: 'Raccogli il broccolo quando la testa principale è compatta e ben formata, prima che i fiori si aprano. Taglia la testa con un coltello affilato. Dopo la raccolta della testa principale, la pianta produrrà getti laterali più piccoli.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi', 'Cavolaia'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 30, max: 90 },
          risk: 'Medium' // Cavolaia primaverile
        }
      ]
    }
  },
  
  // CAVOLO ROMANESCO
  {
    id: 'cavolo-romanesco',
    commonName: 'CAVOLO ROMANESCO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Brassica oleracea var. botrytis',
    family: 'Brassicaceae',
    
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
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il cavolo romanesco ama il clima fresco e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile per primavera, agosto per autunno)',
      minTemp: 5,
      spacing: '50-60cm sulla fila, 60cm tra le file',
      holeDepth: 15,
      holeWidth: 20,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost o letame maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il cavolo romanesco è una varietà di cavolfiore con teste a forma di spirale. Richiede terreno fertile e clima fresco.',
      commonMistakes: [
        'Evita terreno troppo povero - il cavolo romanesco è esigente in nutrienti.',
        'Evita di piantare troppo fitto - il cavolo romanesco ha bisogno di spazio per svilupparsi.',
        'Evita di non coprire le teste - necessario per mantenere il colore verde.',
        'Evita di raccogliere troppo tardi - le teste diventano gialle e fioriscono.'
      ],
      harvestGuide: 'Raccogli il cavolo romanesco quando la testa è compatta e ben formata, prima che i fiori si aprano. Taglia la testa con un coltello affilato, lasciando alcune foglie attaccate.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi', 'Cavolaia'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 30, max: 90 },
          risk: 'Medium' // Cavolaia primaverile
        }
      ]
    }
  },
  
  // CAVOLO CAPPUCCIO
  {
    id: 'cavolo-cappuccio',
    commonName: 'CAVOLO CAPPUCCIO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Brassica oleracea var. capitata',
    family: 'Brassicaceae',
    
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
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il cavolo cappuccio ama il clima fresco e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile per primavera, agosto per autunno)',
      minTemp: 5,
      spacing: '40-50cm sulla fila, 50cm tra le file',
      holeDepth: 15,
      holeWidth: 20,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost o letame maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il cavolo cappuccio è una verdura invernale che produce teste compatte e saporite. Richiede terreno fertile e clima fresco.',
      commonMistakes: [
        'Evita terreno troppo povero - il cavolo cappuccio è esigente in nutrienti.',
        'Evita di piantare troppo fitto - il cavolo cappuccio ha bisogno di spazio per svilupparsi.',
        'Evita di non innaffiare regolarmente - il cavolo cappuccio ha bisogno di acqua costante.',
        'Evita di raccogliere troppo tardi - le teste si spaccano.'
      ],
      harvestGuide: 'Raccogli il cavolo cappuccio quando la testa è compatta e ben formata. Taglia la testa con un coltello affilato alla base della pianta.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi', 'Cavolaia'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 30, max: 90 },
          risk: 'Medium' // Cavolaia primaverile
        }
      ]
    }
  },
  
  // CAVOLO VERZA
  {
    id: 'cavolo-verza',
    commonName: 'CAVOLO VERZA',
    nutrientCategory: 'LEAFY',
    scientificName: 'Brassica oleracea var. sabauda',
    family: 'Brassicaceae',
    
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
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il cavolo verza ama il clima fresco e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile per primavera, agosto per autunno)',
      minTemp: 5,
      spacing: '40-50cm sulla fila, 50cm tra le file',
      holeDepth: 15,
      holeWidth: 20,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost o letame maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il cavolo verza è una verdura invernale con foglie bollose e saporite. Richiede terreno fertile e clima fresco.',
      commonMistakes: [
        'Evita terreno troppo povero - il cavolo verza è esigente in nutrienti.',
        'Evita di piantare troppo fitto - il cavolo verza ha bisogno di spazio per svilupparsi.',
        'Evita di non innaffiare regolarmente - il cavolo verza ha bisogno di acqua costante.',
        'Evita di raccogliere troppo tardi - le teste si spaccano.'
      ],
      harvestGuide: 'Raccogli il cavolo verza quando la testa è compatta e ben formata. Taglia la testa con un coltello affilato alla base della pianta.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi', 'Cavolaia'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 30, max: 90 },
          risk: 'Medium' // Cavolaia primaverile
        }
      ]
    }
  },
  
  // CAVOLO NERO
  {
    id: 'cavolo-nero',
    commonName: 'CAVOLO NERO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Brassica oleracea var. acephala',
    family: 'Brassicaceae',
    
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
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il cavolo nero ama il clima fresco e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile per primavera, agosto per autunno)',
      minTemp: 5,
      spacing: '40-50cm sulla fila, 50cm tra le file',
      holeDepth: 15,
      holeWidth: 20,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost o letame maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il cavolo nero è una verdura invernale con foglie scure e saporite. Può essere raccolto foglia per foglia durante l\'inverno.',
      commonMistakes: [
        'Evita terreno troppo povero - il cavolo nero è esigente in nutrienti.',
        'Evita di piantare troppo fitto - il cavolo nero ha bisogno di spazio per svilupparsi.',
        'Evita di non innaffiare regolarmente - il cavolo nero ha bisogno di acqua costante.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la crescita continua.'
      ],
      harvestGuide: 'Raccogli le foglie esterne tagliandole alla base con un coltello affilato quando sono grandi abbastanza. Raccogli regolarmente per stimolare la crescita continua. Il cavolo nero può essere raccolto durante tutto l\'inverno.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi', 'Cavolaia'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 30, max: 90 },
          risk: 'Medium' // Cavolaia primaverile
        }
      ]
    }
  },
  
  // CAVOLO RICCIO (KALE)
  {
    id: 'cavolo-riccio-kale',
    commonName: 'CAVOLO RICCIO (KALE)',
    nutrientCategory: 'LEAFY',
    scientificName: 'Brassica oleracea var. sabellica',
    family: 'Brassicaceae',
    
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
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il cavolo riccio ama il clima fresco e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile per primavera, agosto per autunno)',
      minTemp: 5,
      spacing: '40-50cm sulla fila, 50cm tra le file',
      holeDepth: 15,
      holeWidth: 20,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost o letame maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il cavolo riccio (kale) è una verdura invernale con foglie ricce e saporite. Può essere raccolto foglia per foglia durante l\'inverno.',
      commonMistakes: [
        'Evita terreno troppo povero - il cavolo riccio è esigente in nutrienti.',
        'Evita di piantare troppo fitto - il cavolo riccio ha bisogno di spazio per svilupparsi.',
        'Evita di non innaffiare regolarmente - il cavolo riccio ha bisogno di acqua costante.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la crescita continua.'
      ],
      harvestGuide: 'Raccogli le foglie esterne tagliandole alla base con un coltello affilato quando sono grandi abbastanza. Raccogli regolarmente per stimolare la crescita continua. Il cavolo riccio può essere raccolto durante tutto l\'inverno.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi', 'Cavolaia'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 30, max: 90 },
          risk: 'Medium' // Cavolaia primaverile
        }
      ]
    }
  },
  
  // CAVOLO ROSSO
  {
    id: 'cavolo-rosso',
    commonName: 'CAVOLO ROSSO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Brassica oleracea var. capitata f. rubra',
    family: 'Brassicaceae',
    
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
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il cavolo rosso ama il clima fresco e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile per primavera, agosto per autunno)',
      minTemp: 5,
      spacing: '40-50cm sulla fila, 50cm tra le file',
      holeDepth: 15,
      holeWidth: 20,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost o letame maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il cavolo rosso è una verdura invernale che produce teste compatte e colorate. Richiede terreno fertile e clima fresco.',
      commonMistakes: [
        'Evita terreno troppo povero - il cavolo rosso è esigente in nutrienti.',
        'Evita di piantare troppo fitto - il cavolo rosso ha bisogno di spazio per svilupparsi.',
        'Evita di non innaffiare regolarmente - il cavolo rosso ha bisogno di acqua costante.',
        'Evita di raccogliere troppo tardi - le teste si spaccano.'
      ],
      harvestGuide: 'Raccogli il cavolo rosso quando la testa è compatta e ben formata. Taglia la testa con un coltello affilato alla base della pianta.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi', 'Cavolaia'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 30, max: 90 },
          risk: 'Medium' // Cavolaia primaverile
        }
      ]
    }
  },
  
  // CAVOLINI DI BRUXELLES
  {
    id: 'cavolini-di-bruxelles',
    commonName: 'CAVOLINI DI BRUXELLES',
    nutrientCategory: 'LEAFY',
    scientificName: 'Brassica oleracea var. gemmifera',
    family: 'Brassicaceae',
    
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
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'I cavolini di Bruxelles amano il clima fresco e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile per primavera, agosto per autunno)',
      minTemp: 5,
      spacing: '60-70cm sulla fila, 70cm tra le file',
      holeDepth: 15,
      holeWidth: 20,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost o letame maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'I cavolini di Bruxelles sono una verdura invernale che produce piccoli cavoli lungo il fusto. Richiedono terreno fertile e clima fresco.',
      commonMistakes: [
        'Evita terreno troppo povero - i cavolini di Bruxelles sono esigenti in nutrienti.',
        'Evita di piantare troppo fitto - i cavolini di Bruxelles hanno bisogno di spazio per svilupparsi.',
        'Evita di non innaffiare regolarmente - i cavolini di Bruxelles hanno bisogno di acqua costante.',
        'Evita di raccogliere troppo presto - aspetta che i cavolini siano ben formati.'
      ],
      harvestGuide: 'Raccogli i cavolini di Bruxelles quando sono compatti e ben formati (circa 90-120 giorni dopo il trapianto). Inizia dalla base della pianta e risali. Taglia i cavolini con un coltello affilato.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi', 'Cavolaia'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 30, max: 90 },
          risk: 'Medium' // Cavolaia primaverile
        }
      ]
    }
  },
  
  // CIME DI RAPA
  {
    id: 'cime-di-rapa',
    commonName: 'CIME DI RAPA',
    nutrientCategory: 'LEAFY',
    scientificName: 'Brassica rapa subsp. sylvestris var. esculenta',
    family: 'Brassicaceae',
    
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
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('5-10 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Le cime di rapa amano il clima fresco e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile per primavera, agosto per autunno)',
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
      introduction: 'Le cime di rapa sono una verdura invernale con foglie e fiori saporiti. Crescono velocemente e possono essere raccolte più volte.',
      commonMistakes: [
        'Evita terreno troppo povero - le cime di rapa sono esigenti in nutrienti.',
        'Evita di piantare troppo fitto - le cime di rapa hanno bisogno di spazio per svilupparsi.',
        'Evita di non innaffiare regolarmente - le cime di rapa hanno bisogno di acqua costante.',
        'Evita di raccogliere troppo tardi - raccogli prima che i fiori si aprano completamente.'
      ],
      harvestGuide: 'Raccogli le cime di rapa quando i fiori sono ancora in boccio e le foglie sono tenere (circa 50-70 giorni dopo il trapianto). Taglia le cime con un coltello affilato, lasciando alcune foglie per permettere la ricrescita.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi', 'Cavolaia'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 30, max: 90 },
          risk: 'Medium' // Cavolaia primaverile
        }
      ]
    }
  },
  
  // CAVOLO RAPA (KOHLRABI)
  {
    id: 'cavolo-rapa-kohlrabi',
    commonName: 'CAVOLO RAPA (KOHLRABI)',
    nutrientCategory: 'ROOT',
    scientificName: 'Brassica oleracea var. gongylodes',
    family: 'Brassicaceae',
    
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
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il cavolo rapa ama il clima fresco e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile per primavera, agosto per autunno)',
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
      introduction: 'Il cavolo rapa (kohlrabi) è una verdura che produce un bulbo commestibile sopra il terreno. Cresce velocemente e può essere raccolto quando è piccolo.',
      commonMistakes: [
        'Evita terreno troppo povero - il cavolo rapa è esigente in nutrienti.',
        'Evita di piantare troppo fitto - il cavolo rapa ha bisogno di spazio per svilupparsi.',
        'Evita di non innaffiare regolarmente - il cavolo rapa ha bisogno di acqua costante.',
        'Evita di raccogliere troppo tardi - il bulbo diventa legnoso se lasciato troppo a lungo.'
      ],
      harvestGuide: 'Raccogli il cavolo rapa quando il bulbo ha raggiunto la dimensione di una mela (circa 50-70 giorni dopo il trapianto). Taglia il bulbo alla base con un coltello affilato. I bulbi piccoli sono più teneri.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi', 'Cavolaia'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 30, max: 90 },
          risk: 'Medium' // Cavolaia primaverile
        }
      ]
    }
  },
  
  // CAVOLO CINESE (PAK CHOI)
  {
    id: 'cavolo-cinese-pak-choi',
    commonName: 'CAVOLO CINESE (PAK CHOI)',
    nutrientCategory: 'LEAFY',
    scientificName: 'Brassica rapa subsp. chinensis',
    family: 'Brassicaceae',
    
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
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('5-10 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta o mezz\'ombra',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il cavolo cinese ama il clima fresco e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile per primavera, agosto per autunno)',
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
      introduction: 'Il cavolo cinese (pak choi) è una verdura a foglia con coste larghe e saporite. Cresce velocemente e può essere raccolto quando è piccolo.',
      commonMistakes: [
        'Evita terreno troppo povero - il cavolo cinese è esigente in nutrienti.',
        'Evita di piantare troppo fitto - il cavolo cinese ha bisogno di spazio per svilupparsi.',
        'Evita di non innaffiare regolarmente - il cavolo cinese ha bisogno di acqua costante.',
        'Evita di lasciare andare a seme - raccogli prima che fiorisca per il miglior sapore.'
      ],
      harvestGuide: 'Raccogli il cavolo cinese quando le foglie sono ben formate e le coste sono croccanti (circa 40-60 giorni dopo il trapianto). Taglia alla base con un coltello affilato. Le piante piccole sono più tenere.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi', 'Cavolaia'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 30, max: 90 },
          risk: 'Medium' // Cavolaia primaverile
        }
      ]
    }
  },
  
  // BROCCOLO SPIGARIELLO
  {
    id: 'broccolo-spigariello',
    commonName: 'BROCCOLO SPIGARIELLO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Brassica oleracea var. italica',
    family: 'Brassicaceae',
    
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
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando ha 4-6 foglie vere',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il broccolo spigariello ama il clima fresco e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile per primavera, agosto per autunno)',
      minTemp: 5,
      spacing: '40-50cm sulla fila, 50cm tra le file',
      holeDepth: 15,
      holeWidth: 20,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost o letame maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il broccolo spigariello è una varietà di broccolo con foglie e fiori saporiti. Può essere raccolto foglia per foglia durante l\'inverno.',
      commonMistakes: [
        'Evita terreno troppo povero - il broccolo spigariello è esigente in nutrienti.',
        'Evita di piantare troppo fitto - il broccolo spigariello ha bisogno di spazio per svilupparsi.',
        'Evita di non innaffiare regolarmente - il broccolo spigariello ha bisogno di acqua costante.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la crescita continua.'
      ],
      harvestGuide: 'Raccogli le foglie e i fiori tagliandoli alla base con un coltello affilato quando sono grandi abbastanza. Raccogli regolarmente per stimolare la crescita continua. Il broccolo spigariello può essere raccolto durante tutto l\'inverno.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi', 'Cavolaia'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 30, max: 90 },
          risk: 'Medium' // Cavolaia primaverile
        }
      ]
    }
  },
  
  // FAGIOLINO
  {
    id: 'fagiolino',
    commonName: 'FAGIOLINO',
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
      warning: 'I fagiolini non amano essere trapiantati',
      temperature: '18-25°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra quando le temperature notturne superano i 10°C (aprile-maggio)',
      minTemp: 10,
      spacing: '15-20cm sulla fila per nani, 30cm per rampicanti, 50cm tra le file',
      holeDepth: 2,
      holeWidth: 5,
      soilRequirements: 'Terreno fertile e ben drenato. Non aggiungere troppo azoto - i fagiolini lo fissano da soli',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    supportRequirements: {
      needsSupport: true,
      supportType: 'Trellis',
      supportHeight: 250,
      supportTiming: 'AtTransplant',
      notes: 'I fagiolini rampicanti necessitano di supporti verticali. I nani non necessitano supporto.'
    },
    
    availableTags: ['bush', 'vining'],
    
    baseInstructions: {
      introduction: 'Il fagiolino è una varietà di fagiolo coltivata per i baccelli teneri. Facile da coltivare e molto produttivo. Raccogli quando i baccelli sono ancora teneri.',
      commonMistakes: [
        'Evita di trapiantare - i fagiolini non amano essere spostati. Semina direttamente in terra.',
        'Evita di concimare troppo con azoto - i fagiolini lo fissano dall\'aria.',
        'Evita di raccogliere troppo tardi - i baccelli diventano duri e fibrosi.',
        'Evita di non supportare i rampicanti - hanno bisogno di reti o canne per crescere.'
      ],
      harvestGuide: 'Raccogli i fagiolini quando i baccelli sono teneri e i semi all\'interno sono ancora piccoli (circa 50-70 giorni dopo la semina). Taglia il baccello con le dita o con forbici. Raccogli regolarmente per stimolare la produzione continua.'
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
    }
  },
  
  // FAGIOLO SECCO
  {
    id: 'fagiolo-secco',
    commonName: 'FAGIOLO SECCO',
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
      warning: 'I fagioli secchi non amano essere trapiantati',
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
    
    supportRequirements: {
      needsSupport: true,
      supportType: 'Trellis',
      supportHeight: 250,
      supportTiming: 'AtTransplant',
      notes: 'I fagioli rampicanti necessitano di supporti verticali. I nani non necessitano supporto.'
    },
    
    availableTags: ['bush', 'vining'],
    
    baseInstructions: {
      introduction: 'Il fagiolo secco è una varietà di fagiolo coltivata per i semi secchi. Richiede più tempo per maturare rispetto ai fagiolini, ma produce semi nutrienti per conservazione.',
      commonMistakes: [
        'Evita di trapiantare - i fagioli secchi non amano essere spostati. Semina direttamente in terra.',
        'Evita di concimare troppo con azoto - i fagioli lo fissano dall\'aria.',
        'Evita di raccogliere troppo presto - aspetta che i baccelli siano secchi e i semi duri.',
        'Evita di non supportare i rampicanti - hanno bisogno di reti o canne per crescere.'
      ],
      harvestGuide: 'Raccogli i fagioli secchi quando i baccelli sono secchi e i semi sono duri (circa 90-120 giorni dopo la semina). Taglia i baccelli e lascia asciugare al sole prima di sgranare. Conserva i semi in un luogo fresco e asciutto.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Summer',
          daysActive: { min: 30, max: 100 },
          risk: 'Medium' // Afidi estivi
        }
      ]
    }
  },
  
  // PISELLO MANGIATUTTO
  {
    id: 'pisello-mangiatutto',
    commonName: 'PISELLO MANGIATUTTO',
    nutrientCategory: 'LEGUME',
    scientificName: 'Pisum sativum var. macrocarpon',
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
      warning: 'I piselli mangiatutto amano il fresco e non il caldo',
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
    
    supportRequirements: {
      needsSupport: true,
      supportType: 'Net',
      supportHeight: 180,
      supportTiming: 'AtTransplant',
      notes: 'Rete o spalliera per piselli rampicanti. Supporto leggero sufficiente. I piselli nani non necessitano supporto.'
    },
    
    availableTags: ['bush', 'vining'],
    
    baseInstructions: {
      introduction: 'Il pisello mangiatutto è una varietà di pisello con baccelli teneri e commestibili. Si mangia tutto il baccello, non solo i semi. Perfetto per la primavera.',
      commonMistakes: [
        'Evita di piantare troppo tardi - i piselli mangiatutto amano il fresco primaverile.',
        'Evita di non supportare i rampicanti - hanno bisogno di reti o canne.',
        'Evita di raccogliere troppo tardi - i baccelli diventano duri e fibrosi.',
        'Evita di innaffiare troppo - preferiscono terreno umido ma non bagnato.'
      ],
      harvestGuide: 'Raccogli i piselli mangiatutto quando i baccelli sono teneri e ancora piatti (circa 50-70 giorni dopo la semina). Taglia il baccello con le dita o con forbici. Raccogli regolarmente per stimolare la produzione.'
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
  
  // FAVA
  {
    id: 'fava',
    commonName: 'FAVA',
    nutrientCategory: 'LEGUME',
    scientificName: 'Vicia faba L.',
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
      sowingDepth: 3,
      idealTemp: '10-15°C',
      minTemp: 0,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('10-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido durante la germinazione',
      warning: 'Le fave amano il clima fresco e possono essere seminate in autunno',
      temperature: '10-15°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra in autunno (ottobre-novembre) o primavera (febbraio-marzo)',
      minTemp: 0,
      spacing: '20-25cm sulla fila, 50cm tra le file',
      holeDepth: 3,
      holeWidth: 5,
      soilRequirements: 'Terreno fertile e ben drenato. Non aggiungere troppo azoto - le fave lo fissano da sole',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    supportRequirements: {
      needsSupport: true,
      supportType: 'Stake',
      supportHeight: 100,
      supportTiming: 'AsNeeded',
      notes: 'Le fave possono necessitare di supporti per evitare che si pieghino con il vento'
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La fava è una pianta da clima fresco che produce baccelli grandi con semi saporiti. Può essere seminata in autunno per raccolto primaverile.',
      commonMistakes: [
        'Evita di piantare troppo tardi - le fave amano il fresco e possono essere seminate in autunno.',
        'Evita di non supportare - le fave possono piegarsi con il vento.',
        'Evita di raccogliere troppo tardi - i semi diventano duri e amidacei.',
        'Evita di innaffiare troppo - preferiscono terreno umido ma non bagnato.'
      ],
      harvestGuide: 'Raccogli le fave quando i baccelli sono pieni ma ancora teneri (circa 90-120 giorni dopo la semina). Taglia il baccello con le dita o con forbici. I semi giovani sono più teneri e saporiti.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Spring',
          daysActive: { min: 40, max: 100 },
          risk: 'Medium' // Afidi primaverili
        }
      ]
    }
  },
  
  // CECI
  {
    id: 'ceci',
    commonName: 'CECI',
    nutrientCategory: 'LEGUME',
    scientificName: 'Cicer arietinum L.',
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
      sowingDepth: 3,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('10-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido durante la germinazione',
      warning: 'I ceci amano il clima caldo e secco',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra quando le temperature notturne superano i 5°C (aprile-maggio)',
      minTemp: 5,
      spacing: '20-25cm sulla fila, 40cm tra le file',
      holeDepth: 3,
      holeWidth: 5,
      soilRequirements: 'Terreno fertile e ben drenato. Non aggiungere troppo azoto - i ceci lo fissano da soli',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    supportRequirements: {
      needsSupport: false,
      supportType: undefined,
      supportHeight: undefined,
      supportTiming: undefined,
      notes: 'I ceci non necessitano supporti'
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il cece è una pianta da clima caldo e secco che produce semi nutrienti. Richiede terreno ben drenato e poca acqua.',
      commonMistakes: [
        'Evita terreno troppo umido - i ceci preferiscono terreno ben drenato e secco.',
        'Evita di innaffiare troppo - i ceci sono resistenti alla siccità.',
        'Evita di raccogliere troppo presto - aspetta che i baccelli siano secchi e i semi duri.',
        'Evita terreno troppo ricco - i ceci preferiscono terreno moderatamente fertile.'
      ],
      harvestGuide: 'Raccogli i ceci quando i baccelli sono secchi e i semi sono duri (circa 100-120 giorni dopo la semina). Taglia i baccelli e lascia asciugare al sole prima di sgranare. Conserva i semi in un luogo fresco e asciutto.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // LENTICCHIA
  {
    id: 'lenticchia',
    commonName: 'LENTICCHIA',
    nutrientCategory: 'LEGUME',
    scientificName: 'Lens culinaris Medik.',
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
      idealTemp: '10-15°C',
      minTemp: 0,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('7-10 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido durante la germinazione',
      warning: 'Le lenticchie amano il clima fresco e possono essere seminate in autunno',
      temperature: '10-15°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra in autunno (ottobre-novembre) o primavera (marzo)',
      minTemp: 0,
      spacing: '10-15cm sulla fila, 30cm tra le file',
      holeDepth: 2,
      holeWidth: 5,
      soilRequirements: 'Terreno fertile e ben drenato. Non aggiungere troppo azoto - le lenticchie lo fissano da sole',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    supportRequirements: {
      needsSupport: false,
      supportType: undefined,
      supportHeight: undefined,
      supportTiming: undefined,
      notes: 'Le lenticchie non necessitano supporti'
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La lenticchia è una pianta da clima fresco che produce semi nutrienti. Può essere seminata in autunno per raccolto primaverile.',
      commonMistakes: [
        'Evita terreno troppo umido - le lenticchie preferiscono terreno ben drenato.',
        'Evita di innaffiare troppo - le lenticchie sono resistenti alla siccità.',
        'Evita di raccogliere troppo presto - aspetta che i baccelli siano secchi e i semi duri.',
        'Evita terreno troppo ricco - le lenticchie preferiscono terreno moderatamente fertile.'
      ],
      harvestGuide: 'Raccogli le lenticchie quando i baccelli sono secchi e i semi sono duri (circa 90-110 giorni dopo la semina). Taglia i baccelli e lascia asciugare al sole prima di sgranare. Conserva i semi in un luogo fresco e asciutto.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // LUPINO
  {
    id: 'lupino',
    commonName: 'LUPINO',
    nutrientCategory: 'LEGUME',
    scientificName: 'Lupinus albus L.',
    family: 'Fabaceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: false,
      additionalTools: []
    },
    
    germination: {
      preSoak: true, // Il lupino ha tegumento duro
      sowingDepth: 3,
      idealTemp: '10-15°C',
      minTemp: 0,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('10-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido durante la germinazione',
      warning: 'I lupini amano il clima fresco e possono essere seminate in autunno',
      temperature: '10-15°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra in autunno (ottobre-novembre) o primavera (marzo)',
      minTemp: 0,
      spacing: '30-40cm sulla fila, 50cm tra le file',
      holeDepth: 3,
      holeWidth: 5,
      soilRequirements: 'Terreno fertile e ben drenato. Non aggiungere troppo azoto - i lupini lo fissano da soli',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    supportRequirements: {
      needsSupport: false,
      supportType: undefined,
      supportHeight: undefined,
      supportTiming: undefined,
      notes: 'I lupini non necessitano supporti'
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il lupino è una pianta da clima fresco che produce semi nutrienti. Richiede ammollo dei semi prima della semina per favorire la germinazione.',
      commonMistakes: [
        'Evita di non ammollare i semi - i lupini hanno tegumento duro, l\'ammollo aiuta la germinazione.',
        'Evita terreno troppo umido - i lupini preferiscono terreno ben drenato.',
        'Evita di innaffiare troppo - i lupini sono resistenti alla siccità.',
        'Evita di raccogliere troppo presto - aspetta che i baccelli siano secchi e i semi duri.'
      ],
      harvestGuide: 'Raccogli i lupini quando i baccelli sono secchi e i semi sono duri (circa 100-120 giorni dopo la semina). Taglia i baccelli e lascia asciugare al sole prima di sgranare. I lupini devono essere bolliti prima del consumo per rimuovere gli alcaloidi.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // CICERCHIA
  {
    id: 'cicerchia',
    commonName: 'CICERCHIA',
    nutrientCategory: 'LEGUME',
    scientificName: 'Lathyrus sativus L.',
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
      idealTemp: '10-15°C',
      minTemp: 0,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('7-10 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido durante la germinazione',
      warning: 'La cicerchia ama il clima fresco e può essere seminata in autunno',
      temperature: '10-15°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra in autunno (ottobre-novembre) o primavera (marzo)',
      minTemp: 0,
      spacing: '15-20cm sulla fila, 30cm tra le file',
      holeDepth: 2,
      holeWidth: 5,
      soilRequirements: 'Terreno fertile e ben drenato. Non aggiungere troppo azoto - la cicerchia lo fissa da sola',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    supportRequirements: {
      needsSupport: false,
      supportType: undefined,
      supportHeight: undefined,
      supportTiming: undefined,
      notes: 'La cicerchia non necessita supporti'
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La cicerchia è una pianta da clima fresco che produce semi nutrienti. Può essere seminata in autunno per raccolto primaverile.',
      commonMistakes: [
        'Evita terreno troppo umido - la cicerchia preferisce terreno ben drenato.',
        'Evita di innaffiare troppo - la cicerchia è resistente alla siccità.',
        'Evita di raccogliere troppo presto - aspetta che i baccelli siano secchi e i semi duri.',
        'Evita terreno troppo ricco - la cicerchia preferisce terreno moderatamente fertile.'
      ],
      harvestGuide: 'Raccogli la cicerchia quando i baccelli sono secchi e i semi sono duri (circa 90-110 giorni dopo la semina). Taglia i baccelli e lascia asciugare al sole prima di sgranare. Conserva i semi in un luogo fresco e asciutto.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // SOIA
  {
    id: 'soia',
    commonName: 'SOIA',
    nutrientCategory: 'LEGUME',
    scientificName: 'Glycine max (L.) Merr.',
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
      idealTemp: '20-25°C',
      minTemp: 10,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('7-10 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido durante la germinazione',
      warning: 'La soia ama il clima caldo e il sole',
      temperature: '20-25°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra quando le temperature notturne superano i 10°C (maggio-giugno)',
      minTemp: 10,
      spacing: '10-15cm sulla fila, 40cm tra le file',
      holeDepth: 2,
      holeWidth: 5,
      soilRequirements: 'Terreno fertile e ben drenato. Non aggiungere troppo azoto - la soia lo fissa da sola',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    supportRequirements: {
      needsSupport: false,
      supportType: undefined,
      supportHeight: undefined,
      supportTiming: undefined,
      notes: 'La soia non necessita supporti'
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La soia è una pianta da clima caldo che produce semi nutrienti. Richiede terreno fertile e clima caldo per maturare.',
      commonMistakes: [
        'Evita terreno troppo umido - la soia preferisce terreno ben drenato.',
        'Evita di piantare troppo presto - la soia ama il caldo e non tollera il freddo.',
        'Evita di raccogliere troppo presto - aspetta che i baccelli siano secchi e i semi duri.',
        'Evita terreno troppo povero - la soia è esigente in nutrienti.'
      ],
      harvestGuide: 'Raccogli la soia quando i baccelli sono secchi e i semi sono duri (circa 100-120 giorni dopo la semina). Taglia i baccelli e lascia asciugare al sole prima di sgranare. Conserva i semi in un luogo fresco e asciutto.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // TACCOLE
  {
    id: 'taccole',
    commonName: 'TACCOLE',
    nutrientCategory: 'LEGUME',
    scientificName: 'Pisum sativum var. saccharatum',
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
      warning: 'Le taccole amano il fresco e non il caldo',
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
    
    supportRequirements: {
      needsSupport: true,
      supportType: 'Net',
      supportHeight: 180,
      supportTiming: 'AtTransplant',
      notes: 'Rete o spalliera per taccole rampicanti. Supporto leggero sufficiente. Le taccole nane non necessitano supporto.'
    },
    
    availableTags: ['bush', 'vining'],
    
    baseInstructions: {
      introduction: 'Le taccole sono una varietà di pisello con baccelli teneri e commestibili. Si mangia tutto il baccello, non solo i semi. Perfetto per la primavera.',
      commonMistakes: [
        'Evita di piantare troppo tardi - le taccole amano il fresco primaverile.',
        'Evita di non supportare i rampicanti - hanno bisogno di reti o canne.',
        'Evita di raccogliere troppo tardi - i baccelli diventano duri e fibrosi.',
        'Evita di innaffiare troppo - preferiscono terreno umido ma non bagnato.'
      ],
      harvestGuide: 'Raccogli le taccole quando i baccelli sono teneri e ancora piatti (circa 50-70 giorni dopo la semina). Taglia il baccello con le dita o con forbici. Raccogli regolarmente per stimolare la produzione.'
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
  
  // MAGGIORANA
  {
    id: 'maggiorana',
    commonName: 'MAGGIORANA',
    nutrientCategory: 'LEAFY',
    scientificName: 'Origanum majorana L.',
    family: 'Lamiaceae',
    
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: false,
      sprayer: false,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.3,
      idealTemp: '20-25°C',
      minTemp: 15,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      lightHours: 8,
      watering: 'Terreno ben drenato, moderatamente umido',
      temperature: '18-25°C'
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano i 15°C (maggio)',
      minTemp: 15,
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
      introduction: 'La maggiorana è un\'erba aromatica perenne con foglie molto profumate. Facile da coltivare e mantenere.',
      commonMistakes: [
        'Evita terreno troppo umido - la maggiorana preferisce terreno ben drenato.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la crescita continua.',
        'Evita di lasciare andare a seme - taglia i fiori per prolungare la produzione.',
        'Evita esposizione insufficiente al sole - la maggiorana ama il sole diretto.'
      ],
      harvestGuide: 'Raccogli le foglie tagliandole alla base con un coltello affilato. Raccogli regolarmente per stimolare la crescita continua. Usa fresco o essicca per conservazione.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // ALLORO
  {
    id: 'alloro',
    commonName: 'ALLORO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Laurus nobilis L.',
    family: 'Lauraceae',
    
    requiredTools: {
      seedTray: false, // Si propaga per talea o seme
      seedSoil: false,
      heatingMat: false,
      sprayer: false,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 1,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('30-60 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      lightHours: 8,
      watering: 'Terreno ben drenato, moderatamente umido',
      temperature: '15-25°C'
    },
    
    transplanting: {
      when: 'Primavera o autunno (pianta perenne)',
      minTemp: 5,
      spacing: '100-150cm sulla fila, 150cm tra le file',
      holeDepth: 30,
      holeWidth: 40,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'L\'alloro è un arbusto perenne sempreverde molto aromatico. Facile da coltivare e mantenere, produce foglie per tutto l\'anno.',
      commonMistakes: [
        'Evita terreno troppo umido - l\'alloro preferisce terreno ben drenato.',
        'Evita di non potare - la potatura mantiene la forma compatta.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la crescita continua.',
        'Evita esposizione insufficiente al sole - l\'alloro ama il sole diretto.'
      ],
      harvestGuide: 'Raccogli le foglie tagliandole dalla pianta quando servono. Le foglie possono essere usate fresche o essiccate. L\'alloro può essere raccolto tutto l\'anno.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // CORIANDOLO
  {
    id: 'coriandolo',
    commonName: 'CORIANDOLO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Coriandrum sativum L.',
    family: 'Apiaceae',
    
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
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano i 5°C (marzo-aprile)',
      minTemp: 5,
      spacing: '15-20cm sulla fila, 20cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il coriandolo è un\'erba aromatica annuale con foglie e semi saporiti. Facile da coltivare, cresce velocemente.',
      commonMistakes: [
        'Evita terreno troppo secco - il coriandolo ha bisogno di terreno costantemente umido.',
        'Evita di lasciare andare a seme troppo presto - raccogli prima che fiorisca per il miglior sapore delle foglie.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la crescita continua.',
        'Evita esposizione insufficiente al sole - il coriandolo ama il sole diretto.'
      ],
      harvestGuide: 'Raccogli le foglie tagliandole alla base con un coltello affilato quando sono grandi abbastanza. Raccogli regolarmente per stimolare la crescita continua. I semi possono essere raccolti quando sono secchi.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // ANETO
  {
    id: 'aneto',
    commonName: 'ANETO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Anethum graveolens L.',
    family: 'Apiaceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Sole diretto',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra quando le temperature notturne superano i 5°C (marzo-aprile)',
      minTemp: 5,
      spacing: 'Diradare a 15-20cm sulla fila, 25cm tra le file',
      holeDepth: 0.5,
      holeWidth: 2,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'L\'aneto è un\'erba aromatica annuale con foglie e semi saporiti. Facile da coltivare, cresce velocemente.',
      commonMistakes: [
        'Evita terreno troppo secco - l\'aneto ha bisogno di terreno costantemente umido.',
        'Evita di non diradare - l\'aneto ha bisogno di spazio per svilupparsi.',
        'Evita di lasciare andare a seme troppo presto - raccogli prima che fiorisca per il miglior sapore delle foglie.',
        'Evita esposizione insufficiente al sole - l\'aneto ama il sole diretto.'
      ],
      harvestGuide: 'Raccogli le foglie tagliandole alla base con un coltello affilato quando sono grandi abbastanza. Raccogli regolarmente per stimolare la crescita continua. I semi possono essere raccolti quando sono secchi.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // FINOCCHIETTO SELVATICO
  {
    id: 'finocchietto-selvatico',
    commonName: 'FINOCCHIETTO SELVATICO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Foeniculum vulgare Mill.',
    family: 'Apiaceae',
    
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
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('10-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano i 5°C (marzo-aprile)',
      minTemp: 5,
      spacing: '40-50cm sulla fila, 50cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il finocchietto selvatico è un\'erba aromatica perenne con foglie e semi molto profumati. Facile da coltivare e mantenere.',
      commonMistakes: [
        'Evita terreno troppo secco - il finocchietto selvatico ha bisogno di terreno costantemente umido.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la crescita continua.',
        'Evita di lasciare andare a seme troppo presto - raccogli prima che fiorisca per il miglior sapore delle foglie.',
        'Evita esposizione insufficiente al sole - il finocchietto selvatico ama il sole diretto.'
      ],
      harvestGuide: 'Raccogli le foglie tagliandole alla base con un coltello affilato quando sono grandi abbastanza. Raccogli regolarmente per stimolare la crescita continua. I semi possono essere raccolti quando sono secchi.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // SANTOREGGIA
  {
    id: 'santoreggia',
    commonName: 'SANTOREGGIA',
    nutrientCategory: 'LEAFY',
    scientificName: 'Satureja hortensis L.',
    family: 'Lamiaceae',
    
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: false,
      sprayer: false,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.3,
      idealTemp: '20-25°C',
      minTemp: 15,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      lightHours: 8,
      watering: 'Terreno ben drenato, moderatamente umido',
      temperature: '18-25°C'
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano i 15°C (maggio)',
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
      introduction: 'La santoreggia è un\'erba aromatica annuale con foglie molto profumate. Facile da coltivare e mantenere.',
      commonMistakes: [
        'Evita terreno troppo umido - la santoreggia preferisce terreno ben drenato.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la crescita continua.',
        'Evita di lasciare andare a seme troppo presto - taglia i fiori per prolungare la produzione.',
        'Evita esposizione insufficiente al sole - la santoreggia ama il sole diretto.'
      ],
      harvestGuide: 'Raccogli le foglie tagliandole alla base con un coltello affilato quando sono grandi abbastanza. Raccogli regolarmente per stimolare la crescita continua. Usa fresco o essicca per conservazione.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // MELISSA
  {
    id: 'melissa',
    commonName: 'MELISSA',
    nutrientCategory: 'LEAFY',
    scientificName: 'Melissa officinalis L.',
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
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      lightHours: 8,
      watering: 'Terreno ben drenato, moderatamente umido',
      temperature: '15-25°C'
    },
    
    transplanting: {
      when: 'Primavera o autunno (pianta perenne)',
      minTemp: 5,
      spacing: '40-50cm sulla fila, 50cm tra le file',
      holeDepth: 15,
      holeWidth: 20,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La melissa è un\'erba aromatica perenne con foglie profumate al limone. Facile da coltivare e mantenere.',
      commonMistakes: [
        'Evita terreno troppo umido - la melissa preferisce terreno ben drenato.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la crescita continua.',
        'Evita di lasciare andare a seme troppo presto - taglia i fiori per prolungare la produzione.',
        'Evita esposizione insufficiente al sole - la melissa ama il sole diretto.'
      ],
      harvestGuide: 'Raccogli le foglie tagliandole alla base con un coltello affilato quando sono grandi abbastanza. Raccogli regolarmente per stimolare la crescita continua. Usa fresco o essicca per conservazione.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // ERBA LUIGIA (CEDRINA)
  {
    id: 'erba-luigia-cedrina',
    commonName: 'ERBA LUIGIA (CEDRINA)',
    nutrientCategory: 'LEAFY',
    scientificName: 'Aloysia citrodora Palau',
    family: 'Verbenaceae',
    
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: false,
      sprayer: false,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '20-25°C',
      minTemp: 15,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      lightHours: 8,
      watering: 'Terreno ben drenato, moderatamente umido',
      temperature: '18-25°C'
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano i 15°C (maggio)',
      minTemp: 15,
      spacing: '60-80cm sulla fila, 80cm tra le file',
      holeDepth: 20,
      holeWidth: 25,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: true,
      protectionInstructions: 'Proteggi dal gelo in inverno - la cedrina è sensibile al freddo'
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'L\'erba luigia (cedrina) è un\'erba aromatica perenne con foglie profumate al limone. Sensibile al freddo, richiede protezione in inverno.',
      commonMistakes: [
        'Evita terreno troppo umido - la cedrina preferisce terreno ben drenato.',
        'Evita di non proteggere dal gelo - la cedrina è sensibile al freddo.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la crescita continua.',
        'Evita esposizione insufficiente al sole - la cedrina ama il sole diretto.'
      ],
      harvestGuide: 'Raccogli le foglie tagliandole dalla pianta quando servono. Raccogli regolarmente per stimolare la crescita continua. Usa fresco o essicca per conservazione.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // DRAGONCELLO
  {
    id: 'dragoncello',
    commonName: 'DRAGONCELLO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Artemisia dracunculus L.',
    family: 'Asteraceae',
    
    requiredTools: {
      seedTray: false, // Si propaga per talea o divisione
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
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      lightHours: 8,
      watering: 'Terreno ben drenato, moderatamente umido',
      temperature: '15-25°C'
    },
    
    transplanting: {
      when: 'Primavera o autunno (pianta perenne)',
      minTemp: 5,
      spacing: '40-50cm sulla fila, 50cm tra le file',
      holeDepth: 15,
      holeWidth: 20,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il dragoncello è un\'erba aromatica perenne con foglie molto profumate. Facile da coltivare e mantenere.',
      commonMistakes: [
        'Evita terreno troppo umido - il dragoncello preferisce terreno ben drenato.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la crescita continua.',
        'Evita di lasciare andare a seme troppo presto - taglia i fiori per prolungare la produzione.',
        'Evita esposizione insufficiente al sole - il dragoncello ama il sole diretto.'
      ],
      harvestGuide: 'Raccogli le foglie tagliandole dalla pianta quando servono. Raccogli regolarmente per stimolare la crescita continua. Usa fresco o essicca per conservazione.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // RUTA
  {
    id: 'ruta',
    commonName: 'RUTA',
    nutrientCategory: 'LEAFY',
    scientificName: 'Ruta graveolens L.',
    family: 'Rutaceae',
    
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
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
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      lightHours: 8,
      watering: 'Terreno ben drenato, moderatamente umido',
      temperature: '15-25°C'
    },
    
    transplanting: {
      when: 'Primavera o autunno (pianta perenne)',
      minTemp: 5,
      spacing: '40-50cm sulla fila, 50cm tra le file',
      holeDepth: 15,
      holeWidth: 20,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La ruta è un\'erba aromatica perenne con foglie molto profumate. Attenzione: può causare irritazioni cutanee se toccata.',
      commonMistakes: [
        'Evita terreno troppo umido - la ruta preferisce terreno ben drenato.',
        'Evita di toccare le foglie senza guanti - può causare irritazioni cutanee.',
        'Evita di non raccogliere regolarmente - la raccolta stimola la crescita continua.',
        'Evita esposizione insufficiente al sole - la ruta ama il sole diretto.'
      ],
      harvestGuide: 'Raccogli le foglie tagliandole dalla pianta quando servono, usando guanti. Raccogli regolarmente per stimolare la crescita continua. Usa fresco o essicca per conservazione.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // BORRAGINE
  {
    id: 'borragine',
    commonName: 'BORRAGINE',
    nutrientCategory: 'LEAFY',
    scientificName: 'Borago officinalis L.',
    family: 'Boraginaceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Sole diretto o mezz\'ombra',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra quando le temperature notturne superano i 5°C (marzo-aprile)',
      minTemp: 5,
      spacing: 'Diradare a 30-40cm sulla fila, 40cm tra le file',
      holeDepth: 0.5,
      holeWidth: 2,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La borragine è un\'erba aromatica annuale con foglie e fiori commestibili. Facile da coltivare, cresce velocemente.',
      commonMistakes: [
        'Evita terreno troppo secco - la borragine ha bisogno di terreno costantemente umido.',
        'Evita di non diradare - la borragine ha bisogno di spazio per svilupparsi.',
        'Evita di lasciare andare a seme troppo presto - raccogli prima che fiorisca per il miglior sapore delle foglie.',
        'Evita esposizione insufficiente al sole - la borragine ama il sole diretto.'
      ],
      harvestGuide: 'Raccogli le foglie giovani tagliandole alla base con un coltello affilato quando sono grandi abbastanza. I fiori sono commestibili e possono essere usati per decorare. Raccogli regolarmente per stimolare la crescita continua.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // CALENDULA EDIBILE
  {
    id: 'calendula-edibile',
    commonName: 'CALENDULA EDIBILE',
    nutrientCategory: 'LEAFY',
    scientificName: 'Calendula officinalis L.',
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
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano i 5°C (marzo-aprile)',
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
      introduction: 'La calendula edibile è una pianta annuale con fiori commestibili e decorativi. Facile da coltivare, produce fiori per tutta l\'estate.',
      commonMistakes: [
        'Evita terreno troppo secco - la calendula ha bisogno di terreno costantemente umido.',
        'Evita di non raccogliere i fiori - la raccolta stimola la produzione continua.',
        'Evita di lasciare andare a seme troppo presto - raccogli i fiori per prolungare la produzione.',
        'Evita esposizione insufficiente al sole - la calendula ama il sole diretto.'
      ],
      harvestGuide: 'Raccogli i fiori quando sono completamente aperti ma ancora freschi. I petali sono commestibili e possono essere usati per decorare insalate e piatti. Raccogli regolarmente per stimolare la produzione continua.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // NASTURZIO EDIBILE
  {
    id: 'nasturzio-edibile',
    commonName: 'NASTURZIO EDIBILE',
    nutrientCategory: 'LEAFY',
    scientificName: 'Tropaeolum majus L.',
    family: 'Tropaeolaceae',
    
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
      sowingDepth: 1,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 2-3 foglie',
      lightNeeds: 'Sole diretto',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano i 5°C (marzo-aprile)',
      minTemp: 5,
      spacing: '30-40cm sulla fila, 40cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    supportRequirements: {
      needsSupport: true,
      supportType: 'Trellis',
      supportHeight: 150,
      supportTiming: 'AsNeeded',
      notes: 'I nasturzi rampicanti necessitano di supporti verticali. Le varietà nane non necessitano supporto.'
    },
    
    availableTags: ['bush', 'vining'],
    
    baseInstructions: {
      introduction: 'Il nasturzio edibile è una pianta annuale con foglie e fiori commestibili e piccanti. Facile da coltivare, produce fiori per tutta l\'estate.',
      commonMistakes: [
        'Evita terreno troppo ricco - i nasturzi preferiscono terreno moderatamente fertile.',
        'Evita di non raccogliere i fiori - la raccolta stimola la produzione continua.',
        'Evita di lasciare andare a seme troppo presto - raccogli i fiori per prolungare la produzione.',
        'Evita esposizione insufficiente al sole - i nasturzi amano il sole diretto.'
      ],
      harvestGuide: 'Raccogli i fiori e le foglie quando sono giovani e tenere. I fiori e le foglie sono commestibili e piccanti, perfetti per insalate e decorazioni. Raccogli regolarmente per stimolare la produzione continua.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // CAMOMILLA
  {
    id: 'camomilla',
    commonName: 'CAMOMILLA',
    nutrientCategory: 'LEAFY',
    scientificName: 'Matricaria chamomilla L.',
    family: 'Asteraceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
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
      emergenceDays: parseDaysRange('7-14 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Sole diretto',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra quando le temperature notturne superano i 5°C (marzo-aprile)',
      minTemp: 5,
      spacing: 'Diradare a 15-20cm sulla fila, 25cm tra le file',
      holeDepth: 0.3,
      holeWidth: 2,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La camomilla è una pianta annuale con fiori profumati usati per tisane. Facile da coltivare, cresce velocemente.',
      commonMistakes: [
        'Evita terreno troppo secco - la camomilla ha bisogno di terreno costantemente umido.',
        'Evita di non diradare - la camomilla ha bisogno di spazio per svilupparsi.',
        'Evita di raccogliere i fiori troppo presto - aspetta che siano completamente aperti.',
        'Evita esposizione insufficiente al sole - la camomilla ama il sole diretto.'
      ],
      harvestGuide: 'Raccogli i fiori quando sono completamente aperti ma ancora freschi. Essicca i fiori in un luogo fresco e asciutto per conservazione. Usa per tisane e infusi.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // ZAFFERANO
  {
    id: 'zafferano',
    commonName: 'ZAFFERANO',
    nutrientCategory: 'ROOT',
    scientificName: 'Crocus sativus L.',
    family: 'Iridaceae',
    
    requiredTools: {
      seedTray: false, // Si pianta da bulbi
      seedSoil: false,
      heatingMat: false,
      sprayer: false,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 10,
      idealTemp: '10-15°C',
      minTemp: 0,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si pianta direttamente da bulbi',
      lightNeeds: 'Sole diretto',
      lightHours: 12,
      watering: 'Mantieni terreno umido durante la crescita',
      warning: 'Lo zafferano è una pianta perenne che fiorisce in autunno',
      temperature: '10-15°C'
    },
    
    transplanting: {
      when: 'Piantare bulbi in estate (luglio-agosto) per fioritura autunnale',
      minTemp: 0,
      spacing: '10-15cm sulla fila, 15cm tra le file',
      holeDepth: 10,
      holeWidth: 15,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Lo zafferano è una pianta perenne che produce fiori in autunno con stimmi molto preziosi. Richiede pazienza ma è molto redditizio.',
      commonMistakes: [
        'Evita terreno troppo umido - lo zafferano preferisce terreno ben drenato.',
        'Evita di raccogliere troppo presto - aspetta che i fiori siano completamente aperti.',
        'Evita di non raccogliere gli stimmi - gli stimmi sono la parte preziosa dello zafferano.',
        'Evita esposizione insufficiente al sole - lo zafferano ama il sole diretto.'
      ],
      harvestGuide: 'Raccogli i fiori quando sono completamente aperti (ottobre-novembre). Estrai gli stimmi rossi con cura e essiccali in un luogo fresco e asciutto. Gli stimmi essiccati sono lo zafferano.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // CAPPERO
  {
    id: 'cappero',
    commonName: 'CAPPERO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Capparis spinosa L.',
    family: 'Capparaceae',
    
    requiredTools: {
      seedTray: true,
      seedTrayType: 'vasetti',
      seedSoil: true,
      heatingMat: false,
      sprayer: false,
      additionalTools: []
    },
    
    germination: {
      preSoak: true, // Il cappero ha tegumento duro
      sowingDepth: 1,
      idealTemp: '20-25°C',
      minTemp: 15,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('21-30 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Sole diretto',
      lightHours: 12,
      watering: 'Terreno ben drenato, moderatamente secco',
      temperature: '20-25°C'
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano i 15°C (maggio-giugno)',
      minTemp: 15,
      spacing: '100-150cm sulla fila, 150cm tra le file',
      holeDepth: 30,
      holeWidth: 40,
      soilRequirements: 'Terreno fertile e ben drenato, anche calcareo. Aggiungi compost',
      buryStem: false,
      protectionNeeded: true,
      protectionInstructions: 'Proteggi dal gelo in inverno - il cappero è sensibile al freddo'
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il cappero è una pianta perenne che produce boccioli commestibili. Richiede clima caldo e terreno ben drenato.',
      commonMistakes: [
        'Evita terreno troppo umido - il cappero preferisce terreno ben drenato e secco.',
        'Evita di non proteggere dal gelo - il cappero è sensibile al freddo.',
        'Evita di raccogliere troppo tardi - raccogli i boccioli quando sono ancora chiusi.',
        'Evita esposizione insufficiente al sole - il cappero ama il sole diretto.'
      ],
      harvestGuide: 'Raccogli i boccioli quando sono ancora chiusi e piccoli (maggio-agosto). Conserva i capperi in salamoia o aceto. I capperi possono essere raccolti durante tutta l\'estate.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // CARDO
  {
    id: 'cardo',
    commonName: 'CARDO',
    nutrientCategory: 'LEAFY',
    scientificName: 'Cynara cardunculus L.',
    family: 'Asteraceae',
    
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
      sowingDepth: 1,
      idealTemp: '15-20°C',
      minTemp: 10,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'quando le piantine hanno 4-6 foglie',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'Il cardo ama il clima mite e terreno fertile',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Quando le piantine sono pronte (marzo-aprile)',
      minTemp: 10,
      spacing: '80-100cm sulla fila, 100cm tra le file',
      holeDepth: 30,
      holeWidth: 40,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost o letame maturo',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il cardo è una pianta perenne che produce coste saporite. Richiede spazio e terreno fertile, ma una volta stabilito produce per molti anni.',
      commonMistakes: [
        'Evita terreno troppo povero - i cardi sono esigenti in nutrienti.',
        'Evita di piantare troppo fitto - i cardi hanno bisogno di molto spazio per svilupparsi.',
        'Evita di non fare l\'imbianchimento - necessario per ottenere coste tenere e saporite.',
        'Evita di raccogliere troppo tardi - le coste diventano dure e amare.'
      ],
      harvestGuide: 'Raccogli i cardi quando le coste sono ben formate e tenere (circa 2-3 settimane dopo l\'imbianchimento). Taglia le coste alla base con un coltello affilato.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // SCORZONERA
  {
    id: 'scorzonera',
    commonName: 'SCORZONERA',
    nutrientCategory: 'ROOT',
    scientificName: 'Scorzonera hispanica L.',
    family: 'Asteraceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 1,
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
      watering: 'Mantieni terreno umido durante la germinazione',
      warning: 'La scorzonera ha germinazione lenta - sii paziente',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra in primavera (marzo-aprile)',
      minTemp: 5,
      spacing: 'Diradare a 15-20cm sulla fila, 30cm tra le file',
      holeDepth: 1,
      holeWidth: 2,
      soilRequirements: 'Terreno fertile e ben drenato, senza sassi. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La scorzonera è una radice simile alla carota ma con un sapore più delicato. Richiede terreno preparato bene e pazienza per la germinazione.',
      commonMistakes: [
        'Evita terreno troppo compatto o con sassi - la scorzonera ha bisogno di terreno sciolto per sviluppare le radici.',
        'Evita di non diradare - la scorzonera ha bisogno di spazio per svilupparsi.',
        'Evita di innaffiare troppo poco - la scorzonera ha bisogno di acqua regolare.',
        'Evita di raccogliere troppo presto - la scorzonera migliora il sapore dopo le prime gelate.'
      ],
      harvestGuide: 'Raccogli la scorzonera quando le radici hanno raggiunto la dimensione desiderata (circa 120-150 giorni dopo la semina). Scava delicatamente e tira verso l\'alto. La scorzonera può essere lasciata in terra e raccolta quando servono, anche dopo le prime gelate.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // SALSEFRICA
  {
    id: 'salsefrica',
    commonName: 'SALSEFRICA',
    nutrientCategory: 'ROOT',
    scientificName: 'Tragopogon porrifolius L.',
    family: 'Asteraceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 1,
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
      watering: 'Mantieni terreno umido durante la germinazione',
      warning: 'La salsefrica ha germinazione lenta - sii paziente',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra in primavera (marzo-aprile)',
      minTemp: 5,
      spacing: 'Diradare a 15-20cm sulla fila, 30cm tra le file',
      holeDepth: 1,
      holeWidth: 2,
      soilRequirements: 'Terreno fertile e ben drenato, senza sassi. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La salsefrica è una radice simile alla carota ma con un sapore più delicato. Richiede terreno preparato bene e pazienza per la germinazione.',
      commonMistakes: [
        'Evita terreno troppo compatto o con sassi - la salsefrica ha bisogno di terreno sciolto per sviluppare le radici.',
        'Evita di non diradare - la salsefrica ha bisogno di spazio per svilupparsi.',
        'Evita di innaffiare troppo poco - la salsefrica ha bisogno di acqua regolare.',
        'Evita di raccogliere troppo presto - la salsefrica migliora il sapore dopo le prime gelate.'
      ],
      harvestGuide: 'Raccogli la salsefrica quando le radici hanno raggiunto la dimensione desiderata (circa 120-150 giorni dopo la semina). Scava delicatamente e tira verso l\'alto. La salsefrica può essere lasciata in terra e raccolta quando servono, anche dopo le prime gelate.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // RAFANO
  {
    id: 'rafano',
    commonName: 'RAFANO',
    nutrientCategory: 'ROOT',
    scientificName: 'Armoracia rusticana P.Gaertn., B.Mey. & Scherb.',
    family: 'Brassicaceae',
    
    requiredTools: {
      seedTray: false, // Si propaga per radici
      seedSoil: false,
      heatingMat: false,
      sprayer: false,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 5,
      idealTemp: '10-15°C',
      minTemp: 0,
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('14-21 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si propaga per radici',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno umido durante la crescita',
      warning: 'Il rafano è molto invasivo - pianta in un\'area delimitata',
      temperature: '10-15°C'
    },
    
    transplanting: {
      when: 'Piantare radici in primavera (marzo-aprile) o autunno (ottobre-novembre)',
      minTemp: 0,
      spacing: '50-60cm sulla fila, 60cm tra le file',
      holeDepth: 5,
      holeWidth: 10,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il rafano è una pianta perenne molto invasiva che produce radici piccanti. Richiede spazio e controllo della crescita.',
      commonMistakes: [
        'Evita di piantare in un\'area non delimitata - il rafano è molto invasivo.',
        'Evita terreno troppo umido - il rafano preferisce terreno ben drenato.',
        'Evita di non controllare la crescita - il rafano può diventare infestante.',
        'Evita di non raccogliere tutte le radici - lasciare radici nel terreno favorisce la propagazione.'
      ],
      harvestGuide: 'Raccogli il rafano quando le radici hanno raggiunto la dimensione desiderata (circa 100-120 giorni dopo la semina). Scava delicatamente e raccogli tutte le radici. Le radici possono essere conservate in un luogo fresco e umido.'
    },
    
    susceptibility: {
      fungalDiseases: [],
      pests: [],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // SENAPE (SEMI)
  {
    id: 'senape-semi',
    commonName: 'SENAPE (SEMI)',
    nutrientCategory: 'LEAFY',
    scientificName: 'Sinapis alba L.',
    family: 'Brassicaceae',
    
    requiredTools: {
      seedTray: false, // Si semina direttamente in terra
      seedSoil: false,
      heatingMat: false,
      sprayer: true,
      additionalTools: []
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '15-20°C',
      minTemp: 5,
      lightRequirement: 'Light',
      emergenceDays: parseDaysRange('5-10 giorni'),
      coveringNeeded: false,
      coveringInstructions: undefined
    },
    
    seedlingCare: {
      transplantWhen: 'Non si trapianta - si semina direttamente in terra',
      lightNeeds: 'Luce diretta',
      lightHours: 12,
      watering: 'Mantieni terreno costantemente umido',
      warning: 'La senape cresce velocemente',
      temperature: '15-20°C'
    },
    
    transplanting: {
      when: 'Semina direttamente in terra quando le temperature notturne superano i 5°C (marzo-aprile)',
      minTemp: 5,
      spacing: 'Diradare a 10-15cm sulla fila, 20cm tra le file',
      holeDepth: 0.5,
      holeWidth: 2,
      soilRequirements: 'Terreno fertile e ben drenato. Aggiungi compost',
      buryStem: false,
      protectionNeeded: false,
      protectionInstructions: undefined
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'La senape è una pianta annuale che produce foglie commestibili e semi piccanti. Facile da coltivare, cresce velocemente.',
      commonMistakes: [
        'Evita terreno troppo secco - la senape ha bisogno di terreno costantemente umido.',
        'Evita di non diradare - la senape ha bisogno di spazio per svilupparsi.',
        'Evita di raccogliere i semi troppo presto - aspetta che i baccelli siano secchi.',
        'Evita esposizione insufficiente al sole - la senape ama il sole diretto.'
      ],
      harvestGuide: 'Raccogli le foglie quando sono giovani e tenere per consumo fresco. I semi possono essere raccolti quando i baccelli sono secchi e i semi sono duri. Essicca i semi in un luogo fresco e asciutto.'
    },
    
    visualCategory: 'Aromatiche',
    
    susceptibility: {
      fungalDiseases: [],
      pests: ['Afidi'],
      preventiveStrategy: 'LOW',
      criticalPeriods: []
    }
  },
  
  // PEPERONE (Dolce/Quadrato)
  {
    id: 'peperone',
    commonName: 'PEPERONE',
    nutrientCategory: 'FRUITING',
    scientificName: 'Capsicum annuum L.',
    family: 'Solanaceae',
    
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: true, // Consigliato
      sprayer: true,
      additionalTools: ['Pellicola trasparente']
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '20-28°C',
      minTemp: 18,
      optimalTemp: 24,
      optimalTempRange: { min: 20, max: 28 },
      maxTemp: 32,
      heatingMatTemp: 24,
      humidityLevel: 'High',
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('7-14 giorni'), // Spesso germinano leggermente prima dei super-piccanti
      coveringNeeded: true,
      coveringType: 'PlasticWrap',
      coveringInstructions: 'Togli la pellicola quando compaiono i primi germogli',
      coveringRemoveWhen: 'Togli IMMEDIATAMENTE la pellicola appena vedi il primo cotiledone verde emergere',
      soilMoistureCheck: 'Tocca con il dito - deve essere umido ma non bagnato',
      ventilationNeeded: false
    },
    
    seedlingCare: {
      transplantWhen: 'alla seconda coppia di foglie vere',
      lightNeeds: 'Tanta luce diretta o lampade LED (14-16h)',
      lightHours: 14,
      lightDetails: {
        type: 'LED',
        distance: 15,
        hours: 14,
        intensity: 'High',
        spectrum: 'Full'
      },
      temperature: '20-25°C',
      temperatureRange: { min: 20, max: 25 },
      watering: 'Solo quando il terriccio è quasi asciutto',
      wateringMethod: 'Bottom',
      bottomWateringDepth: 2,
      bottomWateringDuration: 20,
      ventilation: {
        needed: true,
        method: 'ventilatore leggero o finestra leggermente aperta',
        duration: '2-3 ore al giorno'
      },
      firstFertilization: {
        when: 'alla seconda coppia di foglie vere',
        type: 'concime liquido bilanciato (NPK 20-20-20)',
        dilution: '1/4 della dose consigliata'
      },
      warning: 'Mantieni temperatura costante'
    },
    
    intermediateRepotting: {
      needed: true,
      when: '25-30 giorni dopo la semina, quando le radici escono dai fori di drenaggio',
      trigger: 'radici visibili dai fori di drenaggio o pianta troppo grande per il contenitore',
      containerSize: 'vaso 10-12cm di diametro',
      soilMix: 'terriccio universale + 30% perlite per drenaggio ottimale',
      buryStem: false,
      aftercare: 'mantieni umido per 2-3 giorni, poi normale. Evita concimazione per la prima settimana'
    },
    
    hardening: {
      duration: 10,
      procedure: {
        days1to3: 'Esponi le piantine all\'aperto per 2-3 ore al mattino in luogo ombreggiato. Riporta dentro prima del caldo pomeridiano.',
        days4to6: 'Aumenta l\'esposizione a 4-6 ore. Puoi esporre anche al sole diretto per 1-2 ore al mattino. Riporta dentro la sera.',
        days7to10: 'Esponi per 6-8 ore, incluso sole diretto. Se le temperature notturne superano i 15°C, lascia fuori anche la notte negli ultimi 2 giorni.',
        finalCheck: 'Le piantine sono pronte se hanno foglie verdi e robuste, gambo forte, e hanno resistito alle condizioni esterne senza stress'
      },
      temperatureMin: 15
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
      protectionInstructions: 'Proteggi dal vento forte e dal sole diretto per i primi giorni',
      finalPlanting: {
        containerOptions: {
          minSize: 'vaso 30cm di diametro',
          soilMix: 'terriccio universale + 30% perlite + compost maturo',
          drainage: 'assicurati che il vaso abbia fori di drenaggio e uno strato di argilla espansa sul fondo'
        },
        groundPlanting: {
          soilPrep: 'vanga profonda 30cm, aggiungi 2-3 manciate di compost maturo sul fondo della buca',
          spacing: '40cm sulla fila, 50cm tra le file'
        },
        raisedBed: {
          bedHeight: 30,
          soilMix: 'mix di terra, compost maturo e perlite',
          spacing: '40cm sulla fila, 50cm tra le file'
        },
        supportInstallation: {
          when: 'AsNeeded',
          instructions: 'Installa un paletto di 80cm quando la pianta raggiunge 30-40cm di altezza, o prima se zona ventosa'
        },
        finalFertilization: {
          type: 'Vegetative',
          product: 'concime ricco di potassio (NPK 10-10-20)',
          timing: 'applica dopo 2 settimane dal trapianto, poi ogni 3-4 settimane durante la produzione'
        }
      }
    },
    
    supportRequirements: {
      needsSupport: true,
      supportType: 'Stake',
      supportHeight: 80,
      supportTiming: 'AsNeeded',
      notes: 'Paletto opzionale ma consigliato per varietà alte o zone ventose.'
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'Il peperone dolce è identico al 100% ai peperoncini piccanti nella procedura di coltivazione. Spesso germina leggermente prima dei super-piccanti (tipo Habanero), ma trattalo esattamente allo stesso modo.',
      commonMistakes: [
        'Evita di piantare troppo presto - i peperoni amano il caldo e non tollerano il freddo sotto i 15°C.',
        'Evita di innaffiare troppo - preferiscono terreno leggermente asciutto tra un\'irrigazione e l\'altra.',
        'Evita di concimare troppo con azoto - favorisce foglie a discapito dei frutti. Usa concimi ricchi di potassio.',
        'Evita di raccogliere troppo presto - lascia maturare i frutti per il massimo sapore.'
      ],
      harvestGuide: 'Raccogli i peperoni quando hanno raggiunto il colore caratteristico della varietà (verde, giallo, arancione, rosso). Taglia il picciolo con una forbice. I frutti maturi hanno sapore più dolce.'
    },
    
    familySpecificNotes: {
      growthSpeed: 'Medium',
      sowingTimingAdvice: 'Semina insieme ai peperoncini (gennaio/febbraio).',
      containerSizeAdvice: 'Vaschette standard vanno bene.',
      transplantSensitivity: 'Low',
      specialCareInstructions: [
        'Procedura identica al 100% ai peperoncini piccanti',
        'Spesso germinano leggermente prima dei super-piccanti (tipo Habanero), ma trattali esattamente allo stesso modo'
      ],
      comparisonWithSimilar: 'Identici ai peperoncini piccanti nella procedura. Germinazione leggermente più veloce rispetto alle varietà Chinense.'
    },
    
    equipmentCleaning: {
      seedTrayCleaning: 'Pulisci e sterilizza dopo ogni uso.',
      heatingMatCleaning: 'Pulisci con panno umido e alcool dopo ogni ciclo.',
      soilReuse: 'CompostOnly',
      sterilizationRequired: true
    },
    
    susceptibility: {
      fungalDiseases: ['Peronospora', 'Alternaria'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Summer',
          daysActive: { min: 40, max: 100 },
          risk: 'Medium'
        }
      ]
    }
  },
  
  // ALCHEchengi (Physalis)
  {
    id: 'alchechengi',
    commonName: 'ALCHECHENGI',
    nutrientCategory: 'FRUITING',
    scientificName: 'Physalis peruviana L.',
    family: 'Solanaceae',
    
    requiredTools: {
      seedTray: true,
      seedTrayType: 'alveolato',
      seedSoil: true,
      heatingMat: true,
      sprayer: true,
      additionalTools: ['Pellicola trasparente']
    },
    
    germination: {
      preSoak: false,
      sowingDepth: 0.5,
      idealTemp: '20-24°C',
      minTemp: 18,
      optimalTemp: 22,
      optimalTempRange: { min: 20, max: 24 },
      maxTemp: 28,
      heatingMatTemp: 22,
      humidityLevel: 'High',
      lightRequirement: 'Dark',
      emergenceDays: parseDaysRange('10-21 giorni'), // Crescita iniziale lenta (tipo peperoncino)
      coveringNeeded: true,
      coveringType: 'PlasticWrap',
      coveringInstructions: 'Togli la pellicola quando compaiono i primi germogli',
      coveringRemoveWhen: 'Togli IMMEDIATAMENTE la pellicola appena vedi il primo cotiledone verde emergere',
      soilMoistureCheck: 'Tocca con il dito - deve essere umido ma non bagnato',
      ventilationNeeded: false
    },
    
    seedlingCare: {
      transplantWhen: 'alla seconda coppia di foglie vere',
      lightNeeds: 'Tanta luce diretta o lampade LED (14-16h)',
      lightHours: 14,
      lightDetails: {
        type: 'LED',
        distance: 15,
        hours: 14,
        intensity: 'High',
        spectrum: 'Full'
      },
      temperature: '18-22°C',
      temperatureRange: { min: 18, max: 22 },
      watering: 'Solo quando il terriccio è quasi asciutto',
      wateringMethod: 'Bottom',
      bottomWateringDepth: 2,
      bottomWateringDuration: 20,
      ventilation: {
        needed: true,
        method: 'ventilatore leggero o finestra leggermente aperta',
        duration: '2-3 ore al giorno'
      },
      firstFertilization: {
        when: 'alla seconda coppia di foglie vere',
        type: 'concime liquido bilanciato (NPK 20-20-20)',
        dilution: '1/4 della dose consigliata'
      },
      warning: 'Crescita iniziale lenta - sii paziente'
    },
    
    intermediateRepotting: {
      needed: true,
      when: '30-35 giorni dopo la semina, quando le radici escono dai fori di drenaggio',
      trigger: 'radici visibili dai fori di drenaggio o pianta troppo grande per il contenitore',
      containerSize: 'vaso 10-12cm di diametro',
      soilMix: 'terriccio universale + 30% perlite per drenaggio ottimale',
      buryStem: false,
      aftercare: 'mantieni umido per 2-3 giorni, poi normale. Evita concimazione per la prima settimana'
    },
    
    hardening: {
      duration: 10,
      procedure: {
        days1to3: 'Esponi le piantine all\'aperto per 2-3 ore al mattino in luogo ombreggiato. Riporta dentro prima del caldo pomeridiano.',
        days4to6: 'Aumenta l\'esposizione a 4-6 ore. Puoi esporre anche al sole diretto per 1-2 ore al mattino. Riporta dentro la sera.',
        days7to10: 'Esponi per 6-8 ore, incluso sole diretto. Se le temperature notturne superano i 15°C, lascia fuori anche la notte negli ultimi 2 giorni.',
        finalCheck: 'Le piantine sono pronte se hanno foglie verdi e robuste, gambo forte, e hanno resistito alle condizioni esterne senza stress'
      },
      temperatureMin: 15
    },
    
    transplanting: {
      when: 'Quando le temperature notturne superano stabilmente i 15°C (maggio-giugno in Italia)',
      minTemp: 15,
      spacing: '50cm sulla fila, 60cm tra le file',
      holeDepth: 25,
      holeWidth: 30,
      soilRequirements: 'Ricco di potassio e ben drenato. Aggiungi compost maturo',
      buryStem: false,
      protectionNeeded: true,
      protectionInstructions: 'Proteggi dal vento forte e dal sole diretto per i primi giorni',
      finalPlanting: {
        containerOptions: {
          minSize: 'vaso 35cm di diametro',
          soilMix: 'terriccio universale + 30% perlite + compost maturo',
          drainage: 'assicurati che il vaso abbia fori di drenaggio e uno strato di argilla espansa sul fondo'
        },
        groundPlanting: {
          soilPrep: 'vanga profonda 30cm, aggiungi 2-3 manciate di compost maturo sul fondo della buca',
          spacing: '50cm sulla fila, 60cm tra le file'
        },
        raisedBed: {
          bedHeight: 30,
          soilMix: 'mix di terra, compost maturo e perlite',
          spacing: '50cm sulla fila, 60cm tra le file'
        },
        supportInstallation: {
          when: 'AsNeeded',
          instructions: 'Installa un paletto o griglia quando la pianta inizia a crescere disordinata (tende a crescere molto cespuglioso)'
        },
        finalFertilization: {
          type: 'Vegetative',
          product: 'concime ricco di potassio (NPK 10-10-20)',
          timing: 'applica dopo 2 settimane dal trapianto, poi ogni 3-4 settimane durante la produzione'
        }
      }
    },
    
    supportRequirements: {
      needsSupport: true,
      supportType: 'Cage',
      supportHeight: 100,
      supportTiming: 'AsNeeded',
      notes: 'Tende a crescere molto disordinato/cespuglioso dopo - supporto consigliato.'
    },
    
    availableTags: [],
    
    baseInstructions: {
      introduction: 'L\'alchechengi (Physalis) è simile al pomodoro ma con crescita iniziale lenta tipo peperoncino. Trattalo come un peperoncino nella fase 1 e 2. Dopo tende a crescere molto disordinato/cespuglioso.',
      commonMistakes: [
        'Evita di piantare troppo presto - ama il caldo e non tollera il freddo sotto i 15°C.',
        'Evita di innaffiare troppo - preferisce terreno leggermente asciutto.',
        'Evita di non supportare - tende a crescere disordinato e ha bisogno di supporto.',
        'Evita di raccogliere troppo presto - aspetta che i frutti siano completamente maturi dentro il calice.'
      ],
      harvestGuide: 'Raccogli l\'alchechengi quando il calice è secco e il frutto all\'interno è arancione/giallo. Il frutto deve essere dolce e maturo. Taglia il calice con il frutto.'
    },
    
    familySpecificNotes: {
      growthSpeed: 'Medium',
      sowingTimingAdvice: 'Semina insieme ai peperoncini (gennaio/febbraio).',
      containerSizeAdvice: 'Vaschette standard vanno bene.',
      transplantSensitivity: 'Low',
      specialCareInstructions: [
        'Simile al pomodoro ma crescita iniziale lenta (tipo peperoncino)',
        'Trattalo come un peperoncino nella fase 1 e 2',
        'Tende a crescere molto disordinato/cespuglioso dopo - supporto consigliato'
      ],
      comparisonWithSimilar: 'Simile al pomodoro ma crescita iniziale lenta. Trattalo come un peperoncino nelle prime fasi.'
    },
    
    equipmentCleaning: {
      seedTrayCleaning: 'Pulisci e sterilizza dopo ogni uso.',
      heatingMatCleaning: 'Pulisci con panno umido e alcool dopo ogni ciclo.',
      soilReuse: 'CompostOnly',
      sterilizationRequired: true
    },
    
    susceptibility: {
      fungalDiseases: ['Peronospora'],
      pests: ['Afidi'],
      preventiveStrategy: 'MEDIUM',
      criticalPeriods: [
        {
          season: 'Summer',
          daysActive: { min: 40, max: 100 },
          risk: 'Medium'
        }
      ]
    }
  }
];

/**
 * Ottiene tutte le schede master delle piante
 */
export function getAllMasterSheets(): PlantMasterSheet[] {
  return plantMasterSheets;
}

/**
 * Ottiene una scheda master per ID
 */
export function getMasterSheetById(id: string): PlantMasterSheet | undefined {
  return plantMasterSheets.find(p => p.id === id);
}

/**
 * Ottiene una scheda master per nome comune (case insensitive)
 */
export function getMasterSheetByName(name: string): PlantMasterSheet | undefined {
  const upperName = name.toUpperCase();
  return plantMasterSheets.find(p => p.commonName.toUpperCase() === upperName);
}

