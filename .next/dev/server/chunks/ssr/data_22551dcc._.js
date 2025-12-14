module.exports = [
"[project]/data/plantMasterSheets.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "behavioralTags",
    ()=>behavioralTags,
    "getAllMasterSheets",
    ()=>getAllMasterSheets,
    "getMasterSheetById",
    ()=>getMasterSheetById,
    "getMasterSheetByName",
    ()=>getMasterSheetByName,
    "plantMasterSheets",
    ()=>plantMasterSheets
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/dateParsing.ts [app-ssr] (ecmascript)");
;
const behavioralTags = [
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
const plantMasterSheets = [
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
            heatingMat: false,
            sprayer: true,
            additionalTools: [
                'Pellicola trasparente',
                'Tutori (canna di bambù o paletti)'
            ]
        },
        germination: {
            preSoak: false,
            sowingDepth: 0.5,
            idealTemp: '20-24°C',
            minTemp: 12,
            lightRequirement: 'Dark',
            emergenceDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDaysRange"])('7-14 giorni'),
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
        supportRequirements: {
            needsSupport: true,
            supportType: 'Stake',
            supportHeight: 150,
            supportTiming: 'AtTransplant',
            notes: 'Installa tutore durante trapianto. Lega delicatamente man mano che cresce. Varietà indeterminate crescono continuamente.'
        },
        availableTags: [
            'indeterminate',
            'determinate'
        ],
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
                germination: 0.1,
                vegetative: 1.5,
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
                    days: [
                        50,
                        70
                    ],
                    multiplier: 1.3 // +30% durante fioritura
                },
                {
                    phase: 'Maturazione Frutti',
                    days: [
                        80,
                        120
                    ],
                    multiplier: 1.5 // +50% durante maturazione
                }
            ]
        },
        visualCategory: 'Orto',
        susceptibility: {
            fungalDiseases: [
                'Peronospora',
                'Alternaria',
                'Oidio'
            ],
            pests: [
                'Afidi',
                'Cimici',
                'Tuta absoluta'
            ],
            preventiveStrategy: 'HIGH',
            criticalPeriods: [
                {
                    season: 'Spring',
                    daysActive: {
                        min: 20,
                        max: 60
                    },
                    risk: 'High' // Peronospora primaverile
                },
                {
                    season: 'Summer',
                    daysActive: {
                        min: 40,
                        max: 120
                    },
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
            heatingMat: true,
            sprayer: true,
            additionalTools: [
                'Pellicola trasparente'
            ]
        },
        germination: {
            preSoak: false,
            sowingDepth: 0.5,
            idealTemp: '20-28°C',
            minTemp: 18,
            lightRequirement: 'Dark',
            emergenceDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDaysRange"])('7-21 giorni'),
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
        supportRequirements: {
            needsSupport: true,
            supportType: 'Stake',
            supportHeight: 80,
            supportTiming: 'AsNeeded',
            notes: 'Paletto opzionale ma consigliato per varietà alte o zone ventose.'
        },
        availableTags: [
            'chinense',
            'annuum'
        ],
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
            fungalDiseases: [
                'Peronospora',
                'Alternaria'
            ],
            pests: [
                'Afidi'
            ],
            preventiveStrategy: 'MEDIUM',
            criticalPeriods: [
                {
                    season: 'Summer',
                    daysActive: {
                        min: 40,
                        max: 100
                    },
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
                    days: [
                        50,
                        80
                    ],
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
            emergenceDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDaysRange"])('5-10 giorni'),
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
        availableTags: [
            'bush'
        ],
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
            fungalDiseases: [
                'Oidio'
            ],
            pests: [
                'Afidi'
            ],
            preventiveStrategy: 'HIGH',
            criticalPeriods: [
                {
                    season: 'Summer',
                    daysActive: {
                        min: 30,
                        max: 90
                    },
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
                    days: [
                        40,
                        100
                    ],
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
            additionalTools: [
                'Pellicola trasparente',
                'Tutori'
            ]
        },
        germination: {
            preSoak: false,
            sowingDepth: 0.5,
            idealTemp: '24-28°C',
            minTemp: 18,
            lightRequirement: 'Dark',
            emergenceDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDaysRange"])('10-21 giorni'),
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
            fungalDiseases: [
                'Peronospora'
            ],
            pests: [
                'Afidi'
            ],
            preventiveStrategy: 'MEDIUM',
            criticalPeriods: [
                {
                    season: 'Spring',
                    daysActive: {
                        min: 20,
                        max: 60
                    },
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
            emergenceDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDaysRange"])('5-10 giorni'),
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
            pests: [
                'Afidi'
            ],
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
                    days: [
                        30,
                        50
                    ],
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
            emergenceDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDaysRange"])('7-14 giorni'),
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
            pests: [
                'Afidi'
            ],
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
            seedTray: false,
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
            emergenceDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDaysRange"])('7-14 giorni'),
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
        availableTags: [
            'bush',
            'vining'
        ],
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
            pests: [
                'Afidi'
            ],
            preventiveStrategy: 'MEDIUM',
            criticalPeriods: [
                {
                    season: 'Summer',
                    daysActive: {
                        min: 30,
                        max: 80
                    },
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
                    days: [
                        40,
                        70
                    ],
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
            seedTray: false,
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
            emergenceDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDaysRange"])('7-14 giorni'),
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
        availableTags: [
            'bush',
            'vining'
        ],
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
            pests: [
                'Afidi'
            ],
            preventiveStrategy: 'MEDIUM',
            criticalPeriods: [
                {
                    season: 'Spring',
                    daysActive: {
                        min: 30,
                        max: 70
                    },
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
            seedTray: false,
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
            emergenceDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDaysRange"])('14-21 giorni'),
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
            pests: [
                'Mosca della carota'
            ],
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
            emergenceDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDaysRange"])('10-14 giorni'),
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
            pests: [
                'Tripidi'
            ],
            preventiveStrategy: 'LOW',
            criticalPeriods: []
        }
    },
    // ERBE AROMATICHE (Pro Feature)
    {
        id: 'basilico',
        commonName: 'BASILICO',
        cropType: 'Aromatic',
        nutrientCategory: 'LEAFY',
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
            emergenceDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDaysRange"])('7-14 giorni'),
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
            fungalDiseases: [
                'Oidio'
            ],
            pests: [
                'Afidi'
            ],
            preventiveStrategy: 'LOW'
        }
    },
    {
        id: 'rosmarino',
        commonName: 'ROSMARINO',
        cropType: 'Aromatic',
        nutrientCategory: 'LEAFY',
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
            emergenceDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDaysRange"])('14-21 giorni'),
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
            pests: [
                'Afidi'
            ],
            preventiveStrategy: 'LOW'
        }
    },
    {
        id: 'salvia',
        commonName: 'SALVIA',
        cropType: 'Aromatic',
        nutrientCategory: 'LEAFY',
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
            emergenceDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDaysRange"])('14-21 giorni'),
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
            fungalDiseases: [
                'Oidio'
            ],
            pests: [
                'Afidi'
            ],
            preventiveStrategy: 'LOW'
        }
    },
    {
        id: 'timo',
        commonName: 'TIMO',
        cropType: 'Aromatic',
        nutrientCategory: 'LEAFY',
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
            emergenceDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDaysRange"])('14-21 giorni'),
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
        nutrientCategory: 'LEAFY',
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
            emergenceDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDaysRange"])('10-18 giorni'),
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
        nutrientCategory: 'LEAFY',
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
            emergenceDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDaysRange"])('10-18 giorni'),
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
            fungalDiseases: [
                'Ruggine'
            ],
            pests: [
                'Afidi'
            ],
            preventiveStrategy: 'LOW'
        }
    },
    {
        id: 'lavanda',
        commonName: 'LAVANDA',
        cropType: 'Aromatic',
        nutrientCategory: 'LEAFY',
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
            emergenceDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$dateParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDaysRange"])('14-28 giorni'),
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
    }
];
function getAllMasterSheets() {
    return plantMasterSheets;
}
function getMasterSheetById(id) {
    return plantMasterSheets.find((p)=>p.id === id);
}
function getMasterSheetByName(name) {
    const upperName = name.toUpperCase();
    return plantMasterSheets.find((p)=>p.commonName.toUpperCase() === upperName);
}
}),
"[project]/data/varietyMappings.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "varietyMappings",
    ()=>varietyMappings
]);
const varietyMappings = [
    // POMODORI - Indeterminati
    {
        varietyName: 'San Marzano',
        speciesId: 'pomodoro',
        tags: [
            'indeterminate'
        ]
    },
    {
        varietyName: 'Cuor di Bue',
        speciesId: 'pomodoro',
        tags: [
            'indeterminate'
        ]
    },
    {
        varietyName: 'Cuore di Bue',
        speciesId: 'pomodoro',
        tags: [
            'indeterminate'
        ]
    },
    {
        varietyName: 'Datterino',
        speciesId: 'pomodoro',
        tags: [
            'indeterminate'
        ]
    },
    {
        varietyName: 'Pachino',
        speciesId: 'pomodoro',
        tags: [
            'indeterminate'
        ]
    },
    {
        varietyName: 'Ciliegia',
        speciesId: 'pomodoro',
        tags: [
            'indeterminate'
        ]
    },
    {
        varietyName: 'Cherry',
        speciesId: 'pomodoro',
        tags: [
            'indeterminate'
        ]
    },
    {
        varietyName: 'Costoluto fiorentino',
        speciesId: 'pomodoro',
        tags: [
            'indeterminate'
        ]
    },
    {
        varietyName: 'Costoluto di Parma',
        speciesId: 'pomodoro',
        tags: [
            'indeterminate'
        ]
    },
    {
        varietyName: 'Principe Borghese',
        speciesId: 'pomodoro',
        tags: [
            'indeterminate'
        ]
    },
    {
        varietyName: 'Pera d\'Abruzzo',
        speciesId: 'pomodoro',
        tags: [
            'indeterminate'
        ]
    },
    {
        varietyName: 'Pizzutello',
        speciesId: 'pomodoro',
        tags: [
            'indeterminate'
        ]
    },
    {
        varietyName: 'Marzano',
        speciesId: 'pomodoro',
        tags: [
            'indeterminate'
        ]
    },
    // POMODORI - Determinati
    {
        varietyName: 'Roma',
        speciesId: 'pomodoro',
        tags: [
            'determinate'
        ]
    },
    {
        varietyName: 'Pisanello',
        speciesId: 'pomodoro',
        tags: [
            'determinate'
        ]
    },
    {
        varietyName: 'Pizza',
        speciesId: 'pomodoro',
        tags: [
            'determinate'
        ]
    },
    {
        varietyName: 'Patataro',
        speciesId: 'pomodoro',
        tags: [
            'determinate'
        ]
    },
    // PEPERONCINI - Chinense (germinazione lenta)
    {
        varietyName: 'Carolina Reaper',
        speciesId: 'peperoncino',
        tags: [
            'chinense'
        ]
    },
    {
        varietyName: 'Trinidad Scorpion',
        speciesId: 'peperoncino',
        tags: [
            'chinense'
        ]
    },
    {
        varietyName: 'Habanero',
        speciesId: 'peperoncino',
        tags: [
            'chinense'
        ]
    },
    {
        varietyName: 'Ghost Pepper',
        speciesId: 'peperoncino',
        tags: [
            'chinense'
        ]
    },
    {
        varietyName: 'Bhut Jolokia',
        speciesId: 'peperoncino',
        tags: [
            'chinense'
        ]
    },
    {
        varietyName: '7 Pot',
        speciesId: 'peperoncino',
        tags: [
            'chinense'
        ]
    },
    // PEPERONCINI - Annuum (germinazione veloce)
    {
        varietyName: 'Jalapeno',
        speciesId: 'peperoncino',
        tags: [
            'annuum'
        ]
    },
    {
        varietyName: 'Cayenna',
        speciesId: 'peperoncino',
        tags: [
            'annuum'
        ]
    },
    {
        varietyName: 'Serrano',
        speciesId: 'peperoncino',
        tags: [
            'annuum'
        ]
    },
    {
        varietyName: 'Anaheim',
        speciesId: 'peperoncino',
        tags: [
            'annuum'
        ]
    },
    {
        varietyName: 'Poblano',
        speciesId: 'peperoncino',
        tags: [
            'annuum'
        ]
    },
    {
        varietyName: 'Friggitello',
        speciesId: 'peperoncino',
        tags: [
            'annuum'
        ]
    },
    {
        varietyName: 'Piccante calabrese',
        speciesId: 'peperoncino',
        tags: [
            'annuum'
        ]
    },
    {
        varietyName: 'Diavolicchio',
        speciesId: 'peperoncino',
        tags: [
            'annuum'
        ]
    },
    // PEPERONI DOLCI
    {
        varietyName: 'Peperone',
        speciesId: 'peperone',
        tags: []
    },
    {
        varietyName: 'Peperone giallo',
        speciesId: 'peperone',
        tags: []
    },
    {
        varietyName: 'Peperone rosso',
        speciesId: 'peperone',
        tags: []
    },
    {
        varietyName: 'Peperone verde',
        speciesId: 'peperone',
        tags: []
    },
    {
        varietyName: 'Quadrato d\'Asti',
        speciesId: 'peperone',
        tags: []
    },
    {
        varietyName: 'Corno di toro',
        speciesId: 'peperone',
        tags: []
    },
    {
        varietyName: 'Corno di Carmagnola',
        speciesId: 'peperone',
        tags: []
    },
    // ZUCCHINE
    {
        varietyName: 'Zucchino',
        speciesId: 'zucchina',
        tags: [
            'bush'
        ]
    },
    {
        varietyName: 'Zucchina',
        speciesId: 'zucchina',
        tags: [
            'bush'
        ]
    },
    {
        varietyName: 'Zucchino nero di Milano',
        speciesId: 'zucchina',
        tags: [
            'bush'
        ]
    },
    {
        varietyName: 'Zucchino romanesco',
        speciesId: 'zucchina',
        tags: [
            'bush'
        ]
    },
    {
        varietyName: 'Zucchino striato',
        speciesId: 'zucchina',
        tags: [
            'bush'
        ]
    },
    {
        varietyName: 'Zucchino tondo',
        speciesId: 'zucchina',
        tags: [
            'bush'
        ]
    },
    {
        varietyName: 'Zucchino di Faenza',
        speciesId: 'zucchina',
        tags: [
            'bush'
        ]
    },
    // MELANZANE
    {
        varietyName: 'Melanzana',
        speciesId: 'melanzana',
        tags: []
    },
    {
        varietyName: 'Melanzana violetta',
        speciesId: 'melanzana',
        tags: []
    },
    {
        varietyName: 'Melanzana lunga',
        speciesId: 'melanzana',
        tags: []
    },
    {
        varietyName: 'Melanzana tonda',
        speciesId: 'melanzana',
        tags: []
    },
    {
        varietyName: 'Violetta di Firenze',
        speciesId: 'melanzana',
        tags: []
    },
    {
        varietyName: 'Violetta lunga',
        speciesId: 'melanzana',
        tags: []
    },
    {
        varietyName: 'Black Beauty',
        speciesId: 'melanzana',
        tags: []
    },
    // LATTUGHE
    {
        varietyName: 'Lattuga',
        speciesId: 'lattuga',
        tags: []
    },
    {
        varietyName: 'Lattuga romana',
        speciesId: 'lattuga',
        tags: []
    },
    {
        varietyName: 'Lattuga iceberg',
        speciesId: 'lattuga',
        tags: []
    },
    {
        varietyName: 'Lattuga butterhead',
        speciesId: 'lattuga',
        tags: []
    },
    {
        varietyName: 'Lollo',
        speciesId: 'lattuga',
        tags: []
    },
    {
        varietyName: 'Lollo rossa',
        speciesId: 'lattuga',
        tags: []
    },
    {
        varietyName: 'Canasta',
        speciesId: 'lattuga',
        tags: []
    },
    {
        varietyName: 'Trocadero',
        speciesId: 'lattuga',
        tags: []
    },
    // BASILICO
    {
        varietyName: 'Basilico',
        speciesId: 'basilico',
        tags: []
    },
    {
        varietyName: 'Basilico genovese',
        speciesId: 'basilico',
        tags: []
    },
    {
        varietyName: 'Basilico napoletano',
        speciesId: 'basilico',
        tags: []
    },
    {
        varietyName: 'Basilico a foglia larga',
        speciesId: 'basilico',
        tags: []
    },
    {
        varietyName: 'Basilico rosso',
        speciesId: 'basilico',
        tags: []
    },
    // FAGIOLI
    {
        varietyName: 'Fagiolo',
        speciesId: 'fagiolo',
        tags: []
    },
    {
        varietyName: 'Fagiolo nano',
        speciesId: 'fagiolo',
        tags: [
            'bush'
        ]
    },
    {
        varietyName: 'Fagiolo rampicante',
        speciesId: 'fagiolo',
        tags: [
            'vining'
        ]
    },
    {
        varietyName: 'Borlotto',
        speciesId: 'fagiolo',
        tags: [
            'bush'
        ]
    },
    {
        varietyName: 'Borlotto nano',
        speciesId: 'fagiolo',
        tags: [
            'bush'
        ]
    },
    {
        varietyName: 'Borlotto rampicante',
        speciesId: 'fagiolo',
        tags: [
            'vining'
        ]
    },
    {
        varietyName: 'Cannellino',
        speciesId: 'fagiolo',
        tags: [
            'bush'
        ]
    },
    {
        varietyName: 'Spagna',
        speciesId: 'fagiolo',
        tags: [
            'vining'
        ]
    },
    {
        varietyName: 'Fagiolo di Spagna',
        speciesId: 'fagiolo',
        tags: [
            'vining'
        ]
    },
    // PISELLI
    {
        varietyName: 'Pisello',
        speciesId: 'pisello',
        tags: []
    },
    {
        varietyName: 'Pisello nano',
        speciesId: 'pisello',
        tags: [
            'bush'
        ]
    },
    {
        varietyName: 'Pisello rampicante',
        speciesId: 'pisello',
        tags: [
            'vining'
        ]
    },
    {
        varietyName: 'Pisello mangiatutto',
        speciesId: 'pisello',
        tags: []
    },
    {
        varietyName: 'Pisello da sgranare',
        speciesId: 'pisello',
        tags: []
    },
    // CAROTE
    {
        varietyName: 'Carota',
        speciesId: 'carota',
        tags: []
    },
    {
        varietyName: 'Carota nantese',
        speciesId: 'carota',
        tags: []
    },
    {
        varietyName: 'Carota lunga',
        speciesId: 'carota',
        tags: []
    },
    {
        varietyName: 'Carota corta',
        speciesId: 'carota',
        tags: []
    },
    {
        varietyName: 'Carota di Amsterdam',
        speciesId: 'carota',
        tags: []
    },
    // CIPOLLE
    {
        varietyName: 'Cipolla',
        speciesId: 'cipolla',
        tags: []
    },
    {
        varietyName: 'Cipolla bianca',
        speciesId: 'cipolla',
        tags: []
    },
    {
        varietyName: 'Cipolla rossa',
        speciesId: 'cipolla',
        tags: []
    },
    {
        varietyName: 'Cipolla dorata',
        speciesId: 'cipolla',
        tags: []
    },
    {
        varietyName: 'Cipolla di Tropea',
        speciesId: 'cipolla',
        tags: []
    },
    {
        varietyName: 'Cipolla di Barletta',
        speciesId: 'cipolla',
        tags: []
    },
    {
        varietyName: 'Cipolla di Bassano',
        speciesId: 'cipolla',
        tags: []
    }
];
}),
"[project]/data/strawberryMasterSheets.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "strawberryMasterSheets",
    ()=>strawberryMasterSheets
]);
const strawberryMasterSheets = [
    {
        id: 'fragola-bosco',
        commonName: 'FRAGOLA DI BOSCO',
        cropType: 'Strawberry',
        nutrientCategory: 'FRUITING',
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
            startMonth: 5,
            endMonth: 6 // Giugno
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
            idealTemp: '18-22°C',
            minTemp: 10,
            lightRequirement: 'Light',
            emergenceDays: {
                min: 14,
                max: 21
            },
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
            fungalDiseases: [
                'Oidio',
                'Botrite'
            ],
            pests: [
                'Afidi',
                'Ragnetto rosso'
            ],
            preventiveStrategy: 'MEDIUM'
        }
    },
    {
        id: 'fragola-elsanta',
        commonName: 'FRAGOLA ELSANTA',
        cropType: 'Strawberry',
        nutrientCategory: 'FRUITING',
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
            emergenceDays: {
                min: 10,
                max: 18
            },
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
            fungalDiseases: [
                'Oidio',
                'Botrite',
                'Verticillium'
            ],
            pests: [
                'Afidi',
                'Tripide'
            ],
            preventiveStrategy: 'HIGH'
        }
    },
    {
        id: 'fragola-albion',
        commonName: 'FRAGOLA ALBION',
        cropType: 'Strawberry',
        nutrientCategory: 'FRUITING',
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
            endMonth: 10 // Produzione estesa fino ad ottobre
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
            emergenceDays: {
                min: 10,
                max: 18
            },
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
            fungalDiseases: [
                'Oidio',
                'Botrite'
            ],
            pests: [
                'Afidi'
            ],
            preventiveStrategy: 'MEDIUM'
        }
    },
    {
        id: 'fragola-seascape',
        commonName: 'FRAGOLA SEASCAPE',
        cropType: 'Strawberry',
        nutrientCategory: 'FRUITING',
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
            endMonth: 9 // Produzione da maggio a settembre
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
            emergenceDays: {
                min: 10,
                max: 18
            },
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
            fungalDiseases: [
                'Oidio',
                'Botrite'
            ],
            pests: [
                'Afidi',
                'Tripide'
            ],
            preventiveStrategy: 'MEDIUM'
        }
    },
    // BASILICATA - Varietà di Eccellenza per Esportazione
    {
        id: 'fragola-candonga',
        commonName: 'FRAGOLA CANDONGA',
        cropType: 'Strawberry',
        nutrientCategory: 'FRUITING',
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
            startMonth: 3,
            endMonth: 6 // Giugno
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
            emergenceDays: {
                min: 10,
                max: 18
            },
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
            fungalDiseases: [
                'Oidio',
                'Botrite',
                'Verticillium',
                'Antracnosi'
            ],
            pests: [
                'Afidi',
                'Tripide',
                'Ragnetto rosso'
            ],
            preventiveStrategy: 'HIGH'
        }
    },
    {
        id: 'fragola-matera',
        commonName: 'FRAGOLA MATERA',
        cropType: 'Strawberry',
        nutrientCategory: 'FRUITING',
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
            startMonth: 3,
            endMonth: 6 // Giugno
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
            emergenceDays: {
                min: 10,
                max: 18
            },
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
            fungalDiseases: [
                'Oidio',
                'Botrite',
                'Verticillium',
                'Antracnosi'
            ],
            pests: [
                'Afidi',
                'Tripide',
                'Ragnetto rosso',
                'Nottue'
            ],
            preventiveStrategy: 'HIGH'
        }
    }
];
}),
"[project]/data/fruitTreeMasterSheets.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fruitTreeMasterSheets",
    ()=>fruitTreeMasterSheets
]);
const fruitTreeMasterSheets = [
    // MELO
    {
        id: 'melo-golden',
        commonName: 'MELO GOLDEN DELICIOUS',
        cropType: 'FruitTree',
        nutrientCategory: 'FRUITING',
        scientificName: 'Malus domestica',
        family: 'Rosaceae',
        treeType: 'Pome',
        rootstock: 'M9 o M26',
        maturityYears: 3,
        pruningSeasons: [
            'Winter',
            'Summer'
        ],
        pollinationType: 'Partially-self-fertile',
        pollinatorVarieties: [
            'Gala',
            'Fuji',
            'Granny Smith'
        ],
        harvestWindow: {
            startMonth: 9,
            endMonth: 10 // Ottobre
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
            emergenceDays: {
                min: 20,
                max: 30
            },
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
            fungalDiseases: [
                'Ticchiolatura',
                'Oidio'
            ],
            pests: [
                'Afidi',
                'Carpocapsa'
            ],
            preventiveStrategy: 'HIGH'
        }
    },
    {
        id: 'melo-fuji',
        commonName: 'MELO FUJI',
        cropType: 'FruitTree',
        nutrientCategory: 'FRUITING',
        scientificName: 'Malus domestica',
        family: 'Rosaceae',
        treeType: 'Pome',
        rootstock: 'M9 o M26',
        maturityYears: 3,
        pruningSeasons: [
            'Winter'
        ],
        pollinationType: 'Self-sterile',
        pollinatorVarieties: [
            'Golden Delicious',
            'Gala',
            'Granny Smith'
        ],
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
            emergenceDays: {
                min: 20,
                max: 30
            },
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
            fungalDiseases: [
                'Ticchiolatura',
                'Oidio'
            ],
            pests: [
                'Afidi',
                'Carpocapsa'
            ],
            preventiveStrategy: 'HIGH'
        }
    },
    // PERO
    {
        id: 'pero-abate',
        commonName: 'PERO ABATE FETEL',
        cropType: 'FruitTree',
        nutrientCategory: 'FRUITING',
        scientificName: 'Pyrus communis',
        family: 'Rosaceae',
        treeType: 'Pome',
        rootstock: 'BA29 o M9',
        maturityYears: 4,
        pruningSeasons: [
            'Winter'
        ],
        pollinationType: 'Self-sterile',
        pollinatorVarieties: [
            'Williams',
            'Conference',
            'Kaiser'
        ],
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
            emergenceDays: {
                min: 20,
                max: 30
            },
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
            fungalDiseases: [
                'Ticchiolatura',
                'Ruggine'
            ],
            pests: [
                'Psilla',
                'Afidi'
            ],
            preventiveStrategy: 'HIGH'
        }
    },
    // PESCO
    {
        id: 'pesco-gialla',
        commonName: 'PESCO PESCA GIALLA',
        cropType: 'FruitTree',
        nutrientCategory: 'FRUITING',
        scientificName: 'Prunus persica',
        family: 'Rosaceae',
        treeType: 'Stone',
        rootstock: 'GF677 o Montclar',
        maturityYears: 3,
        pruningSeasons: [
            'Winter',
            'Summer'
        ],
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
            emergenceDays: {
                min: 20,
                max: 30
            },
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
            fungalDiseases: [
                'Bolla del pesco',
                'Monilia'
            ],
            pests: [
                'Afidi',
                'Carpocapsa'
            ],
            preventiveStrategy: 'HIGH'
        }
    },
    // CILIEGIO
    {
        id: 'ciliegio-durone',
        commonName: 'CILIEGIO DURONE',
        cropType: 'FruitTree',
        nutrientCategory: 'FRUITING',
        scientificName: 'Prunus avium',
        family: 'Rosaceae',
        treeType: 'Stone',
        rootstock: 'Colt o Gisela 5',
        maturityYears: 5,
        pruningSeasons: [
            'Summer'
        ],
        pollinationType: 'Self-sterile',
        pollinatorVarieties: [
            'Ferrovia',
            'Bigarreau',
            'Moreau'
        ],
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
            emergenceDays: {
                min: 20,
                max: 30
            },
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
            fungalDiseases: [
                'Monilia',
                'Cilindrosporiosi'
            ],
            pests: [
                'Mosca della ciliegia',
                'Afidi'
            ],
            preventiveStrategy: 'HIGH'
        }
    }
];
}),
"[project]/data/oliveMasterSheets.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "oliveMasterSheets",
    ()=>oliveMasterSheets
]);
const oliveMasterSheets = [
    {
        id: 'olivo-frantoio',
        commonName: 'OLIVO FRANTOIO',
        cropType: 'Olive',
        nutrientCategory: 'FRUITING',
        scientificName: 'Olea europaea',
        family: 'Oleaceae',
        varietyType: 'Oil',
        treeAge: 0,
        treeDensity: 300,
        harvestMethod: 'Manual',
        harvestWindow: {
            startMonth: 10,
            endMonth: 12 // Dicembre
        },
        oilYieldExpected: 18,
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
            emergenceDays: {
                min: 30,
                max: 60
            },
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
            fungalDiseases: [
                'Occhio di pavone',
                'Rogna'
            ],
            pests: [
                'Mosca dell\'olivo',
                'Cocciniglia'
            ],
            preventiveStrategy: 'HIGH'
        }
    },
    {
        id: 'olivo-leccino',
        commonName: 'OLIVO LECCINO',
        cropType: 'Olive',
        nutrientCategory: 'FRUITING',
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
            emergenceDays: {
                min: 30,
                max: 60
            },
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
            fungalDiseases: [
                'Occhio di pavone'
            ],
            pests: [
                'Mosca dell\'olivo'
            ],
            preventiveStrategy: 'MEDIUM'
        }
    },
    {
        id: 'olivo-moraiolo',
        commonName: 'OLIVO MORAIOLO',
        cropType: 'Olive',
        nutrientCategory: 'FRUITING',
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
            emergenceDays: {
                min: 30,
                max: 60
            },
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
            fungalDiseases: [
                'Occhio di pavone',
                'Rogna'
            ],
            pests: [
                'Mosca dell\'olivo'
            ],
            preventiveStrategy: 'HIGH'
        }
    },
    {
        id: 'olivo-pendolino',
        commonName: 'OLIVO PENDOLINO',
        cropType: 'Olive',
        nutrientCategory: 'FRUITING',
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
            emergenceDays: {
                min: 30,
                max: 60
            },
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
            fungalDiseases: [
                'Occhio di pavone'
            ],
            pests: [
                'Mosca dell\'olivo'
            ],
            preventiveStrategy: 'MEDIUM'
        }
    }
];
}),
"[project]/data/vineMasterSheets.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "vineMasterSheets",
    ()=>vineMasterSheets
]);
const vineMasterSheets = [
    // VITI ROSSE
    {
        id: 'vite-sangiovese',
        commonName: 'VITE SANGIOVESE',
        cropType: 'Vine',
        nutrientCategory: 'FRUITING',
        scientificName: 'Vitis vinifera',
        family: 'Vitaceae',
        varietyType: 'Wine',
        trainingSystem: 'Guyot',
        rootstock: '1103P o SO4',
        plantingDensity: 5000,
        harvestMethod: 'Manual',
        harvestWindow: {
            startMonth: 9,
            endMonth: 10 // Ottobre
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
            emergenceDays: {
                min: 10,
                max: 20
            },
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
            fungalDiseases: [
                'Peronospora',
                'Oidio',
                'Botrite'
            ],
            pests: [
                'Tignola',
                'Cicadelle'
            ],
            preventiveStrategy: 'HIGH'
        }
    },
    {
        id: 'vite-nebbiolo',
        commonName: 'VITE NEBBIOLO',
        cropType: 'Vine',
        nutrientCategory: 'FRUITING',
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
            emergenceDays: {
                min: 10,
                max: 20
            },
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
            fungalDiseases: [
                'Peronospora',
                'Oidio',
                'Botrite'
            ],
            pests: [
                'Tignola'
            ],
            preventiveStrategy: 'HIGH'
        }
    },
    {
        id: 'vite-barbera',
        commonName: 'VITE BARBERA',
        cropType: 'Vine',
        nutrientCategory: 'FRUITING',
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
            emergenceDays: {
                min: 10,
                max: 20
            },
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
            fungalDiseases: [
                'Peronospora',
                'Oidio'
            ],
            pests: [
                'Tignola'
            ],
            preventiveStrategy: 'MEDIUM'
        }
    },
    {
        id: 'vite-montepulciano',
        commonName: 'VITE MONTEPULCIANO',
        cropType: 'Vine',
        nutrientCategory: 'FRUITING',
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
            emergenceDays: {
                min: 10,
                max: 20
            },
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
            fungalDiseases: [
                'Peronospora',
                'Oidio'
            ],
            pests: [
                'Tignola'
            ],
            preventiveStrategy: 'MEDIUM'
        }
    },
    // VITI BIANCHE
    {
        id: 'vite-trebbiano',
        commonName: 'VITE TREBBIANO',
        cropType: 'Vine',
        nutrientCategory: 'FRUITING',
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
            emergenceDays: {
                min: 10,
                max: 20
            },
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
            fungalDiseases: [
                'Peronospora',
                'Oidio',
                'Botrite'
            ],
            pests: [
                'Tignola'
            ],
            preventiveStrategy: 'HIGH'
        }
    },
    {
        id: 'vite-chardonnay',
        commonName: 'VITE CHARDONNAY',
        cropType: 'Vine',
        nutrientCategory: 'FRUITING',
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
            emergenceDays: {
                min: 10,
                max: 20
            },
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
            fungalDiseases: [
                'Peronospora',
                'Oidio',
                'Botrite'
            ],
            pests: [
                'Tignola'
            ],
            preventiveStrategy: 'HIGH'
        }
    },
    {
        id: 'vite-pinot-grigio',
        commonName: 'VITE PINOT GRIGIO',
        cropType: 'Vine',
        nutrientCategory: 'FRUITING',
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
            emergenceDays: {
                min: 10,
                max: 20
            },
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
            fungalDiseases: [
                'Peronospora',
                'Oidio',
                'Botrite'
            ],
            pests: [
                'Tignola'
            ],
            preventiveStrategy: 'HIGH'
        }
    }
];
}),
"[project]/data/exoticFruitMasterSheets.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "exoticFruitMasterSheets",
    ()=>exoticFruitMasterSheets
]);
const exoticFruitMasterSheets = [
    // PAPAYA
    {
        id: 'papaya-comune',
        commonName: 'PAPAYA',
        cropType: 'ExoticFruit',
        nutrientCategory: 'FRUITING',
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
        greenhouseRequired: true,
        greenhouseType: 'Tropical',
        indoorGrowing: true,
        containerSize: 'Minimo 50L, ideale 100L+',
        treeType: 'Tree',
        maturityYears: 1,
        harvestWindow: {
            startMonth: 9,
            endMonth: 12 // Dicembre
        },
        italianClimateNotes: 'In Italia coltivabile solo in serra riscaldata o zone costiere del Sud (Sicilia, Calabria). Richiede protezione invernale.',
        regionalSuitability: [
            {
                region: 'Sicilia',
                suitability: 'High',
                notes: 'Zone costiere, serra consigliata'
            },
            {
                region: 'Calabria',
                suitability: 'Medium',
                notes: 'Solo zone costiere, serra obbligatoria'
            },
            {
                region: 'Puglia',
                suitability: 'Low',
                notes: 'Solo serra riscaldata'
            }
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
            emergenceDays: {
                min: 14,
                max: 21
            },
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
            fungalDiseases: [
                'Marciume radicale',
                'Antracnosi'
            ],
            pests: [
                'Afidi',
                'Mosca della frutta'
            ],
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
                harvestMonths: [
                    9,
                    10,
                    11,
                    12
                ],
                bestUsdaZones: [
                    10,
                    11
                ],
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
                harvestMonths: [
                    9,
                    10,
                    11,
                    12
                ],
                bestUsdaZones: [
                    10,
                    11
                ],
                notes: 'Varietà standard, frutti grandi.'
            }
        ],
        // NEW: Climate compatibility
        climateCompatibility: {
            usdaZones: [
                10,
                11
            ],
            optimalUsdaZones: [
                11
            ],
            tempMinSurvival: 10,
            tempMinGrowth: 15,
            tempOptimal: {
                min: 25,
                max: 30
            },
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
                indoorMonths: [
                    11,
                    12,
                    1,
                    2,
                    3
                ]
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
        nutrientCategory: 'FRUITING',
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
            startMonth: 7,
            endMonth: 9 // Settembre
        },
        italianClimateNotes: 'In Italia coltivabile in serra o zone costiere del Sud. Varietà nane consigliate per vaso.',
        regionalSuitability: [
            {
                region: 'Sicilia',
                suitability: 'High',
                notes: 'Zone costiere, varietà nane'
            },
            {
                region: 'Calabria',
                suitability: 'Medium',
                notes: 'Solo serra o zone molto protette'
            }
        ],
        requiredTools: {
            seedTray: true,
            seedSoil: true,
            heatingMat: true,
            sprayer: true
        },
        germination: {
            preSoak: true,
            sowingDepth: 2,
            idealTemp: '25-30°C',
            minTemp: 20,
            lightRequirement: 'Light',
            emergenceDays: {
                min: 14,
                max: 28
            },
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
            fungalDiseases: [
                'Antracnosi',
                'Oidio'
            ],
            pests: [
                'Afidi',
                'Mosca della frutta',
                'Cocciniglie'
            ],
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
                harvestMonths: [
                    7,
                    8,
                    9
                ],
                bestUsdaZones: [
                    9,
                    10
                ],
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
                harvestMonths: [
                    7,
                    8,
                    9
                ],
                bestUsdaZones: [
                    10,
                    11
                ],
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
                harvestMonths: [
                    8,
                    9,
                    10
                ],
                bestUsdaZones: [
                    9,
                    10
                ],
                notes: 'Varietà nano, raccolta tardiva. Frutti verdi-gialli.'
            }
        ],
        // NEW: Climate compatibility
        climateCompatibility: {
            usdaZones: [
                9,
                10,
                11
            ],
            optimalUsdaZones: [
                10,
                11
            ],
            tempMinSurvival: 5,
            tempMinGrowth: 10,
            tempOptimal: {
                min: 24,
                max: 30
            },
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
                indoorMonths: [
                    11,
                    12,
                    1,
                    2
                ]
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
        nutrientCategory: 'FRUITING',
        scientificName: 'Persea americana',
        family: 'Lauraceae',
        fruitType: 'Subtropical',
        climateRequirements: {
            minTemp: 5,
            maxTemp: 35,
            idealTemp: '20-25°C',
            humidity: 'Medium',
            frostTolerant: false,
            heatTolerant: true
        },
        greenhouseRequired: false,
        greenhouseType: 'Cold',
        indoorGrowing: true,
        containerSize: 'Minimo 50L, ideale 100L+',
        treeType: 'Tree',
        maturityYears: 5,
        harvestWindow: {
            startMonth: 10,
            endMonth: 3 // Marzo (raccolta invernale)
        },
        italianClimateNotes: 'In Italia coltivabile in zone costiere del Sud (Sicilia, Calabria, Puglia). Protezione invernale consigliata. Varietà nane per vaso.',
        regionalSuitability: [
            {
                region: 'Sicilia',
                suitability: 'High',
                notes: 'Zone costiere, protezione invernale'
            },
            {
                region: 'Calabria',
                suitability: 'High',
                notes: 'Zone costiere'
            },
            {
                region: 'Puglia',
                suitability: 'Medium',
                notes: 'Zone costiere, protezione invernale obbligatoria'
            },
            {
                region: 'Basilicata',
                suitability: 'Low',
                notes: 'Solo zone costiere, serra consigliata'
            }
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
            emergenceDays: {
                min: 21,
                max: 35
            },
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
            fungalDiseases: [
                'Marciume radicale',
                'Verticillium'
            ],
            pests: [
                'Afidi',
                'Cocciniglie',
                'Tripidi'
            ],
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
                harvestMonths: [
                    10,
                    11,
                    12,
                    1,
                    2,
                    3
                ],
                bestUsdaZones: [
                    9,
                    10
                ],
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
                harvestMonths: [
                    11,
                    12,
                    1,
                    2
                ],
                bestUsdaZones: [
                    9,
                    10
                ],
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
                harvestMonths: [
                    11,
                    12,
                    1
                ],
                bestUsdaZones: [
                    8,
                    9
                ],
                notes: 'Molto resistente al freddo, ideale per zone più fresche.'
            }
        ],
        // NEW: Climate compatibility
        climateCompatibility: {
            usdaZones: [
                8,
                9,
                10,
                11
            ],
            optimalUsdaZones: [
                9,
                10
            ],
            tempMinSurvival: -5,
            tempMinGrowth: 5,
            tempOptimal: {
                min: 20,
                max: 25
            },
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
                indoorMonths: [
                    12,
                    1,
                    2
                ]
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
        nutrientCategory: 'FRUITING',
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
        greenhouseRequired: true,
        greenhouseType: 'Tropical',
        indoorGrowing: true,
        containerSize: 'Minimo 20L, ideale 30-40L',
        treeType: 'Herbaceous',
        maturityYears: 1.5,
        harvestWindow: {
            startMonth: 6,
            endMonth: 9 // Settembre
        },
        italianClimateNotes: 'In Italia coltivabile solo in serra riscaldata. Richiede alta umidità e temperatura costante.',
        regionalSuitability: [
            {
                region: 'Sicilia',
                suitability: 'Medium',
                notes: 'Solo serra riscaldata'
            },
            {
                region: 'Calabria',
                suitability: 'Low',
                notes: 'Solo serra riscaldata con controllo umidità'
            }
        ],
        requiredTools: {
            seedTray: false,
            seedSoil: true,
            heatingMat: true,
            sprayer: true
        },
        germination: {
            preSoak: false,
            sowingDepth: 0,
            idealTemp: '22-28°C',
            minTemp: 15,
            lightRequirement: 'Light',
            emergenceDays: {
                min: 0,
                max: 0
            },
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
            fungalDiseases: [
                'Marciume del cuore',
                'Antracnosi'
            ],
            pests: [
                'Cocciniglie',
                'Acari'
            ],
            preventiveStrategy: 'MEDIUM'
        }
    },
    // BANANO
    {
        id: 'banano-nano',
        commonName: 'BANANO NANO',
        cropType: 'ExoticFruit',
        nutrientCategory: 'FRUITING',
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
        greenhouseRequired: true,
        greenhouseType: 'Warm',
        indoorGrowing: true,
        containerSize: 'Minimo 100L, ideale 200L+',
        treeType: 'Herbaceous',
        maturityYears: 1.5,
        harvestWindow: {
            startMonth: 8,
            endMonth: 11 // Novembre
        },
        italianClimateNotes: 'In Italia coltivabile in serra o zone costiere del Sud. Varietà nane come "Dwarf Cavendish" sono più adatte.',
        regionalSuitability: [
            {
                region: 'Sicilia',
                suitability: 'High',
                notes: 'Zone costiere, varietà nane, serra consigliata'
            },
            {
                region: 'Calabria',
                suitability: 'Medium',
                notes: 'Solo serra o zone molto protette'
            }
        ],
        requiredTools: {
            seedTray: false,
            seedSoil: true,
            heatingMat: true,
            sprayer: true
        },
        germination: {
            preSoak: false,
            sowingDepth: 0,
            idealTemp: '25-30°C',
            minTemp: 15,
            lightRequirement: 'Light',
            emergenceDays: {
                min: 0,
                max: 0
            },
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
            fungalDiseases: [
                'Sigatoka',
                'Marciume del rizoma'
            ],
            pests: [
                'Afidi',
                'Cocciniglie',
                'Nematodi'
            ],
            preventiveStrategy: 'HIGH'
        }
    }
];
}),
"[project]/data/raspberryMasterSheets.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "raspberryMasterSheets",
    ()=>raspberryMasterSheets
]);
const raspberryMasterSheets = [
    {
        id: 'lampone-tulameen',
        commonName: 'LAMPONE TULAMEEN',
        cropType: 'Raspberry',
        nutrientCategory: 'FRUITING',
        scientificName: 'Rubus idaeus',
        family: 'Rosaceae',
        varietyType: 'Summer-bearing',
        canesType: 'Floricane',
        trainingSystem: 'Trellis',
        harvestWindow: {
            startMonth: 6,
            endMonth: 7 // Luglio
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
            emergenceDays: {
                min: 21,
                max: 30
            },
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
            fungalDiseases: [
                'Antracnosi',
                'Botrite',
                'Marciume radicale'
            ],
            pests: [
                'Afidi',
                'Cimice dei frutti'
            ],
            preventiveStrategy: 'HIGH'
        }
    },
    {
        id: 'lampone-glen-ample',
        commonName: 'LAMPONE GLEN AMPLE',
        cropType: 'Raspberry',
        nutrientCategory: 'FRUITING',
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
            emergenceDays: {
                min: 21,
                max: 30
            },
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
            fungalDiseases: [
                'Antracnosi',
                'Botrite'
            ],
            pests: [
                'Afidi'
            ],
            preventiveStrategy: 'MEDIUM'
        }
    },
    {
        id: 'lampone-heritage',
        commonName: 'LAMPONE HERITAGE',
        cropType: 'Raspberry',
        nutrientCategory: 'FRUITING',
        scientificName: 'Rubus idaeus',
        family: 'Rosaceae',
        varietyType: 'Ever-bearing',
        canesType: 'Primocane',
        trainingSystem: 'Trellis',
        harvestWindow: {
            startMonth: 7,
            endMonth: 10 // Ottobre
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
            emergenceDays: {
                min: 21,
                max: 30
            },
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
            fungalDiseases: [
                'Antracnosi',
                'Botrite'
            ],
            pests: [
                'Afidi'
            ],
            preventiveStrategy: 'MEDIUM'
        }
    },
    {
        id: 'lampone-autumn-bliss',
        commonName: 'LAMPONE AUTUMN BLISS',
        cropType: 'Raspberry',
        nutrientCategory: 'FRUITING',
        scientificName: 'Rubus idaeus',
        family: 'Rosaceae',
        varietyType: 'Fall-bearing',
        canesType: 'Primocane',
        trainingSystem: 'Trellis',
        harvestWindow: {
            startMonth: 8,
            endMonth: 10 // Ottobre
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
            emergenceDays: {
                min: 21,
                max: 30
            },
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
            fungalDiseases: [
                'Antracnosi',
                'Botrite'
            ],
            pests: [
                'Afidi'
            ],
            preventiveStrategy: 'MEDIUM'
        }
    }
];
}),
"[project]/data/specializedCropMasterSheets.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * File di esportazione per tutti i master sheets delle colture specializzate (Pro Features)
 * Questo file facilita l'importazione di tutte le varietà specializzate
 */ __turbopack_context__.s([
    "getAllSpecializedMasterSheets",
    ()=>getAllSpecializedMasterSheets,
    "getMasterSheetsByCropType",
    ()=>getMasterSheetsByCropType
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$strawberryMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/data/strawberryMasterSheets.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$fruitTreeMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/data/fruitTreeMasterSheets.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$oliveMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/data/oliveMasterSheets.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$vineMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/data/vineMasterSheets.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$exoticFruitMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/data/exoticFruitMasterSheets.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$raspberryMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/data/raspberryMasterSheets.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$plantMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/data/plantMasterSheets.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
const getAllSpecializedMasterSheets = ()=>{
    return [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$data$2f$strawberryMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strawberryMasterSheets"],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$data$2f$fruitTreeMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fruitTreeMasterSheets"],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$data$2f$oliveMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["oliveMasterSheets"],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$data$2f$vineMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["vineMasterSheets"],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$data$2f$exoticFruitMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exoticFruitMasterSheets"],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$data$2f$raspberryMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["raspberryMasterSheets"],
        // Filtra erbe aromatiche da plantMasterSheets
        ...__TURBOPACK__imported__module__$5b$project$5d2f$data$2f$plantMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["plantMasterSheets"].filter((p)=>p.cropType === 'Aromatic' || p.cropType === 'Medicinal')
    ];
};
const getMasterSheetsByCropType = (cropType)=>{
    switch(cropType){
        case 'Strawberry':
            return __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$strawberryMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strawberryMasterSheets"];
        case 'FruitTree':
            return __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$fruitTreeMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fruitTreeMasterSheets"];
        case 'Olive':
            return __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$oliveMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["oliveMasterSheets"];
        case 'Vine':
            return __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$vineMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["vineMasterSheets"];
        case 'ExoticFruit':
            return __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$exoticFruitMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exoticFruitMasterSheets"];
        case 'Raspberry':
            return __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$raspberryMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["raspberryMasterSheets"];
        case 'Aromatic':
        case 'Medicinal':
            return __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$plantMasterSheets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["plantMasterSheets"].filter((p)=>p.cropType === cropType);
        default:
            return [];
    }
};
}),
"[project]/data/treatments.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "protectionProducts",
    ()=>protectionProducts
]);
const protectionProducts = [
    {
        id: 'zeolite',
        name: 'Zeolite Micronizzata',
        type: 'PREVENTIVE',
        allowedInOrganic: true,
        target: [
            'Funghi',
            'Insetti masticatori',
            'Eccesso umidità'
        ],
        frequencyDays: 20,
        dosage: '3-5g per litro (fogliare) o a polvere secca',
        notes: 'Crea una barriera fisica. Ridà alla foglia se piove molto.',
        applicationMethod: 'Foliar',
        bestTime: 'Morning'
    },
    {
        id: 'neem',
        name: 'Olio di Neem',
        type: 'REPELLENT',
        allowedInOrganic: true,
        target: [
            'Afidi',
            'Cimici',
            'Ditteri'
        ],
        frequencyDays: 14,
        dosage: '5ml per litro + emulsionante',
        notes: 'Agisce per ingestione e repulsione. Dare la sera al tramonto.',
        applicationMethod: 'Foliar',
        bestTime: 'Evening'
    },
    {
        id: 'sapone_molle',
        name: 'Sapone Molle Potassico',
        type: 'CURATIVE',
        allowedInOrganic: true,
        target: [
            'Afidi',
            'Cocciniglia',
            'Melata'
        ],
        frequencyDays: 0,
        dosage: '10-15ml per litro',
        notes: 'Lava via la melata e soffoca gli insetti a corpo molle. Usare come "vettore" per il Neem.',
        applicationMethod: 'Foliar',
        bestTime: 'Evening'
    },
    {
        id: 'propoli',
        name: 'Propoli Agricola',
        type: 'PREVENTIVE',
        allowedInOrganic: true,
        target: [
            'Funghi',
            'Batteri',
            'Cicatrizzazione'
        ],
        frequencyDays: 15,
        dosage: '2-3ml per litro',
        notes: 'Potente cicatrizzante naturale dopo potature o grandine. Attira impollinatori.',
        applicationMethod: 'Foliar',
        bestTime: 'Any'
    },
    {
        id: 'macerato_ortica',
        name: 'Macerato di Ortica',
        type: 'REPELLENT',
        allowedInOrganic: true,
        target: [
            'Afidi',
            'Ragnetto Rosso'
        ],
        frequencyDays: 10,
        dosage: 'Diluizione 1:10 (preventivo) o 1:5 (curativo)',
        notes: 'Attenzione all\'odore. Fornisce anche azoto fogliare.',
        applicationMethod: 'Foliar',
        bestTime: 'Evening'
    },
    {
        id: 'rame',
        name: 'Rame (Basso Dosaggio)',
        type: 'CURATIVE',
        allowedInOrganic: true,
        target: [
            'Peronospora',
            'Batteriosi'
        ],
        frequencyDays: 21,
        dosage: 'Massimo 4kg/ha/anno (rispettare limiti biologici)',
        notes: 'Usare solo in prevenzione primaverile. Non superare i limiti annuali.',
        applicationMethod: 'Foliar',
        bestTime: 'Morning'
    },
    {
        id: 'bacillus_thuringiensis',
        name: 'Bacillus Thuringiensis',
        type: 'CURATIVE',
        allowedInOrganic: true,
        target: [
            'Cavolaia',
            'Notte',
            'Lepidotteri'
        ],
        frequencyDays: 0,
        dosage: 'Seguire indicazioni prodotto',
        notes: 'Batterio che attacca solo le larve. Controllare pagina inferiore foglie per uova.',
        applicationMethod: 'Foliar',
        bestTime: 'Evening'
    },
    // PRODOTTI CHIMICI CLASSICI (richiedono patentino fitosanitario)
    {
        id: 'deltametrina',
        name: 'Deltametrina',
        type: 'CURATIVE',
        allowedInOrganic: false,
        requiresLicense: true,
        target: [
            'Afidi',
            'Cimici',
            'Lepidotteri',
            'Coleotteri'
        ],
        frequencyDays: 14,
        dosage: 'Seguire indicazioni prodotto (tipicamente 0.5-1g per litro)',
        notes: '⚠️ Richiede patentino fitosanitario. Rispettare tempi di carenza. Insetticida piretroide ad ampio spettro.',
        applicationMethod: 'Foliar',
        bestTime: 'Evening',
        safetyInterval: 7 // Giorni di carenza
    },
    {
        id: 'azoxystrobin',
        name: 'Azoxystrobin',
        type: 'PREVENTIVE',
        allowedInOrganic: false,
        requiresLicense: true,
        target: [
            'Peronospora',
            'Oidio',
            'Alternaria',
            'Septoria'
        ],
        frequencyDays: 10,
        dosage: 'Seguire indicazioni prodotto (tipicamente 0.5-1ml per litro)',
        notes: '⚠️ Richiede patentino. Fungicida sistemico ad ampio spettro. Usare in rotazione con altri principi attivi per evitare resistenze.',
        applicationMethod: 'Foliar',
        bestTime: 'Morning',
        safetyInterval: 14
    },
    {
        id: 'lambda_cialotrina',
        name: 'Lambda-cialotrina',
        type: 'CURATIVE',
        allowedInOrganic: false,
        requiresLicense: true,
        target: [
            'Afidi',
            'Cimici',
            'Tripidi',
            'Aleurodidi'
        ],
        frequencyDays: 10,
        dosage: 'Seguire indicazioni prodotto (tipicamente 0.3-0.5ml per litro)',
        notes: '⚠️ Richiede patentino. Insetticida piretroide efficace contro insetti succhiatori. Non utilizzare in fioritura per proteggere api.',
        applicationMethod: 'Foliar',
        bestTime: 'Evening',
        safetyInterval: 7
    },
    {
        id: 'mancozeb',
        name: 'Mancozeb',
        type: 'PREVENTIVE',
        allowedInOrganic: false,
        requiresLicense: true,
        target: [
            'Peronospora',
            'Alternaria',
            'Antracnosi'
        ],
        frequencyDays: 7,
        dosage: 'Seguire indicazioni prodotto (tipicamente 2-3g per litro)',
        notes: '⚠️ Richiede patentino. Fungicida di contatto, efficace in prevenzione. Non sistemico, quindi copertura completa necessaria.',
        applicationMethod: 'Foliar',
        bestTime: 'Morning',
        safetyInterval: 21
    },
    {
        id: 'imidacloprid',
        name: 'Imidacloprid',
        type: 'CURATIVE',
        allowedInOrganic: false,
        requiresLicense: true,
        target: [
            'Afidi',
            'Cimici',
            'Aleurodidi',
            'Coleotteri'
        ],
        frequencyDays: 14,
        dosage: 'Seguire indicazioni prodotto (tipicamente 0.5-1ml per litro)',
        notes: '⚠️ Richiede patentino. Insetticida sistemico neonicotinoide. ⚠️ ATTENZIONE: Altamente tossico per api. NON utilizzare in fioritura o vicino a fiori.',
        applicationMethod: 'Foliar',
        bestTime: 'Evening',
        safetyInterval: 21
    }
];
}),
"[project]/data/fertilizers.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Fertilizers Database
 * Database completo di prodotti fertilizzanti: organici, minerali, correttivi, microelementi, sovesci
 */ __turbopack_context__.s([
    "allFertilizers",
    ()=>allFertilizers,
    "correctiveFertilizers",
    ()=>correctiveFertilizers,
    "coverCrops",
    ()=>coverCrops,
    "getAllCoverCrops",
    ()=>getAllCoverCrops,
    "getCoverCropByName",
    ()=>getCoverCropByName,
    "getFertilizerById",
    ()=>getFertilizerById,
    "getFertilizersByCategory",
    ()=>getFertilizersByCategory,
    "getFertilizersByType",
    ()=>getFertilizersByType,
    "microelementFertilizers",
    ()=>microelementFertilizers,
    "mineralFertilizers",
    ()=>mineralFertilizers,
    "organicFertilizers",
    ()=>organicFertilizers
]);
const organicFertilizers = [
    // Letame
    {
        id: 'manure_bovine',
        name: 'Letame Bovino',
        type: 'organic',
        category: 'manure',
        npk: {
            n: 0.6,
            p: 0.3,
            k: 0.5
        },
        organicMatter: 25,
        phEffect: 'neutral',
        applicationTiming: 'pre_planting',
        applicationMethod: 'incorporated',
        dosagePerSqm: {
            min: 3000,
            max: 5000,
            unit: 'g/m²'
        },
        notes: 'Deve essere ben maturo (minimo 6 mesi). Ottimo per migliorare struttura terreno.',
        suitableSoilTypes: [
            'Clay',
            'Loamy'
        ]
    },
    {
        id: 'manure_equine',
        name: 'Letame Equino',
        type: 'organic',
        category: 'manure',
        npk: {
            n: 0.7,
            p: 0.3,
            k: 0.6
        },
        organicMatter: 30,
        phEffect: 'neutral',
        applicationTiming: 'pre_planting',
        applicationMethod: 'incorporated',
        dosagePerSqm: {
            min: 2500,
            max: 4000,
            unit: 'g/m²'
        },
        notes: 'Più ricco di azoto rispetto a bovino. Ottimo per compostaggio.'
    },
    {
        id: 'manure_ovine',
        name: 'Letame Ovino',
        type: 'organic',
        category: 'manure',
        npk: {
            n: 0.8,
            p: 0.5,
            k: 0.7
        },
        organicMatter: 35,
        phEffect: 'neutral',
        applicationTiming: 'pre_planting',
        applicationMethod: 'incorporated',
        dosagePerSqm: {
            min: 2000,
            max: 3500,
            unit: 'g/m²'
        },
        notes: 'Molto ricco, usare con moderazione. Ottimo per ortaggi esigenti.'
    },
    {
        id: 'manure_poultry',
        name: 'Pollina',
        type: 'organic',
        category: 'manure',
        npk: {
            n: 1.5,
            p: 1.2,
            k: 0.8
        },
        organicMatter: 40,
        phEffect: 'acidifying',
        applicationTiming: 'pre_planting',
        applicationMethod: 'incorporated',
        dosagePerSqm: {
            min: 500,
            max: 1000,
            unit: 'g/m²'
        },
        notes: 'Molto ricco di azoto. Usare con cautela, può bruciare radici se non maturo.',
        incompatibilities: [
            'lime_dolomite'
        ]
    },
    // Compost
    {
        id: 'compost_mature',
        name: 'Compost Maturo',
        type: 'organic',
        category: 'compost',
        npk: {
            n: 0.5,
            p: 0.3,
            k: 0.5
        },
        organicMatter: 50,
        phEffect: 'neutral',
        applicationTiming: 'all_season',
        applicationMethod: 'incorporated',
        dosagePerSqm: {
            min: 2000,
            max: 4000,
            unit: 'g/m²'
        },
        notes: 'Compost ben maturo (minimo 6 mesi). Migliora struttura e fertilità terreno.'
    },
    {
        id: 'compost_fresh',
        name: 'Compost Fresco',
        type: 'organic',
        category: 'compost',
        npk: {
            n: 0.3,
            p: 0.2,
            k: 0.3
        },
        organicMatter: 40,
        phEffect: 'neutral',
        applicationTiming: 'pre_planting',
        applicationMethod: 'incorporated',
        dosagePerSqm: {
            min: 3000,
            max: 5000,
            unit: 'g/m²'
        },
        notes: 'Compost giovane (2-4 mesi). Usare solo in pre-impianto, non a contatto radici.'
    },
    // Humus
    {
        id: 'humus_worm',
        name: 'Humus di Lombrico',
        type: 'organic',
        category: 'humus',
        npk: {
            n: 1.0,
            p: 0.8,
            k: 0.6
        },
        organicMatter: 60,
        phEffect: 'neutral',
        applicationTiming: 'all_season',
        applicationMethod: 'surface',
        dosagePerSqm: {
            min: 500,
            max: 1000,
            unit: 'g/m²'
        },
        notes: 'Molto ricco e bilanciato. Può essere usato anche in copertura.',
        costPerUnit: 8.0
    },
    // Farine
    {
        id: 'bone_meal',
        name: 'Cornunghia',
        type: 'organic',
        category: 'bone_meal',
        npk: {
            n: 3.0,
            p: 15.0,
            k: 0
        },
        organicMatter: 0,
        phEffect: 'neutral',
        applicationTiming: 'pre_planting',
        applicationMethod: 'incorporated',
        dosagePerSqm: {
            min: 50,
            max: 100,
            unit: 'g/m²'
        },
        notes: 'Ricco di fosforo. Ottimo per radicazione e fioritura. Lenta cessione.',
        suitablePlants: [
            'Pomodoro',
            'Peperone',
            'Melanzana'
        ],
        costPerUnit: 12.0
    },
    {
        id: 'blood_meal',
        name: 'Farina di Sangue',
        type: 'organic',
        category: 'blood_meal',
        npk: {
            n: 12.0,
            p: 1.0,
            k: 0.5
        },
        organicMatter: 0,
        phEffect: 'acidifying',
        applicationTiming: 'top_dressing',
        applicationMethod: 'surface',
        dosagePerSqm: {
            min: 30,
            max: 60,
            unit: 'g/m²'
        },
        notes: 'Ricco di azoto, rapida cessione. Usare con moderazione per evitare eccesso azoto.',
        incompatibilities: [
            'lime_dolomite'
        ],
        costPerUnit: 15.0
    },
    // Bokashi
    {
        id: 'bokashi',
        name: 'Bokashi',
        type: 'organic',
        category: 'compost',
        npk: {
            n: 1.5,
            p: 0.8,
            k: 0.6
        },
        organicMatter: 45,
        phEffect: 'acidifying',
        applicationTiming: 'pre_planting',
        applicationMethod: 'incorporated',
        dosagePerSqm: {
            min: 1000,
            max: 2000,
            unit: 'g/m²'
        },
        notes: 'Compost fermentato giapponese. Più veloce del compost tradizionale.'
    }
];
const mineralFertilizers = [
    // NPK Standard
    {
        id: 'npk_15_15_15',
        name: 'NPK 15-15-15',
        type: 'mineral',
        category: 'npk',
        npk: {
            n: 15,
            p: 15,
            k: 15
        },
        phEffect: 'neutral',
        applicationTiming: 'top_dressing',
        applicationMethod: 'fertigation',
        dosagePerSqm: {
            min: 30,
            max: 50,
            unit: 'g/m²'
        },
        notes: 'Bilanciato per uso generale. Rapida cessione.',
        costPerUnit: 2.5
    },
    {
        id: 'npk_20_10_10',
        name: 'NPK 20-10-10',
        type: 'mineral',
        category: 'npk',
        npk: {
            n: 20,
            p: 10,
            k: 10
        },
        phEffect: 'neutral',
        applicationTiming: 'top_dressing',
        applicationMethod: 'fertigation',
        dosagePerSqm: {
            min: 25,
            max: 40,
            unit: 'g/m²'
        },
        notes: 'Ricco di azoto. Per crescita vegetativa.',
        suitablePlants: [
            'Lattuga',
            'Spinaci',
            'Basilico'
        ]
    },
    {
        id: 'npk_10_20_20',
        name: 'NPK 10-20-20',
        type: 'mineral',
        category: 'npk',
        npk: {
            n: 10,
            p: 20,
            k: 20
        },
        phEffect: 'neutral',
        applicationTiming: 'top_dressing',
        applicationMethod: 'fertigation',
        dosagePerSqm: {
            min: 30,
            max: 50,
            unit: 'g/m²'
        },
        notes: 'Ricco di fosforo e potassio. Per fioritura e fruttificazione.',
        suitablePlants: [
            'Pomodoro',
            'Peperone',
            'Zucchina'
        ]
    },
    // Lenta cessione
    {
        id: 'slow_release_14_7_14',
        name: 'Concime Lenta Cessione 14-7-14',
        type: 'mineral',
        category: 'slow_release',
        npk: {
            n: 14,
            p: 7,
            k: 14
        },
        phEffect: 'neutral',
        applicationTiming: 'pre_planting',
        applicationMethod: 'incorporated',
        dosagePerSqm: {
            min: 40,
            max: 60,
            unit: 'g/m²'
        },
        notes: 'Rilascio graduale per 3-4 mesi. Una sola applicazione per stagione.',
        costPerUnit: 4.0
    },
    // Fogliari
    {
        id: 'foliar_npk_20_20_20',
        name: 'Concime Fogliare NPK 20-20-20',
        type: 'mineral',
        category: 'foliar',
        npk: {
            n: 20,
            p: 20,
            k: 20
        },
        phEffect: 'neutral',
        applicationTiming: 'top_dressing',
        applicationMethod: 'foliar',
        dosagePerSqm: {
            min: 2,
            max: 3,
            unit: 'g/L'
        },
        notes: 'Assorbimento rapido via fogliare. Usare al mattino o sera, mai in pieno sole.'
    }
];
const correctiveFertilizers = [
    {
        id: 'lime_dolomite',
        name: 'Calce Dolomitica',
        type: 'corrective',
        category: 'lime',
        phEffect: 'alkalizing',
        applicationTiming: 'pre_planting',
        applicationMethod: 'incorporated',
        dosagePerSqm: {
            min: 100,
            max: 200,
            unit: 'g/m²'
        },
        notes: 'Aumenta pH terreno. Usare solo se pH < 6.5. Non mescolare con letame fresco.',
        incompatibilities: [
            'manure_poultry',
            'blood_meal',
            'sulfur'
        ]
    },
    {
        id: 'sulfur',
        name: 'Zolfo',
        type: 'corrective',
        category: 'sulfur',
        phEffect: 'acidifying',
        applicationTiming: 'pre_planting',
        applicationMethod: 'incorporated',
        dosagePerSqm: {
            min: 50,
            max: 100,
            unit: 'g/m²'
        },
        notes: 'Riduce pH terreno. Usare solo se pH > 7.5. Effetto lento (mesi).',
        incompatibilities: [
            'lime_dolomite'
        ]
    },
    {
        id: 'gypsum',
        name: 'Gesso',
        type: 'corrective',
        category: 'gypsum',
        phEffect: 'neutral',
        applicationTiming: 'pre_planting',
        applicationMethod: 'incorporated',
        dosagePerSqm: {
            min: 200,
            max: 400,
            unit: 'g/m²'
        },
        notes: 'Migliora struttura terreni argillosi senza cambiare pH.',
        suitableSoilTypes: [
            'Clay'
        ]
    }
];
const microelementFertilizers = [
    {
        id: 'iron_chelate',
        name: 'Ferro Chelato',
        type: 'microelement',
        category: 'iron',
        phEffect: 'neutral',
        applicationTiming: 'top_dressing',
        applicationMethod: 'foliar',
        dosagePerSqm: {
            min: 1,
            max: 2,
            unit: 'g/L'
        },
        notes: 'Per carenze di ferro (clorosi ferrica). Assorbimento migliore via fogliare.',
        suitablePlants: [
            'Pomodoro',
            'Peperone'
        ]
    },
    {
        id: 'boron',
        name: 'Boro',
        type: 'microelement',
        category: 'boron',
        phEffect: 'neutral',
        applicationTiming: 'top_dressing',
        applicationMethod: 'foliar',
        dosagePerSqm: {
            min: 0.5,
            max: 1,
            unit: 'g/L'
        },
        notes: 'Importante per fioritura e allegagione. Usare con cautela, dosi eccessive sono tossiche.',
        suitablePlants: [
            'Pomodoro',
            'Peperone',
            'Zucchina'
        ]
    },
    {
        id: 'zinc',
        name: 'Zinco',
        type: 'microelement',
        category: 'zinc',
        phEffect: 'neutral',
        applicationTiming: 'top_dressing',
        applicationMethod: 'foliar',
        dosagePerSqm: {
            min: 0.5,
            max: 1,
            unit: 'g/L'
        },
        notes: 'Importante per crescita vegetativa. Carenze comuni in terreni alcalini.'
    }
];
const coverCrops = [
    {
        name: 'Senape',
        family: 'Brassicaceae',
        sowingPeriod: {
            start: 8,
            end: 10
        },
        incorporationPeriod: {
            start: 3,
            end: 4
        },
        nitrogenFixation: false,
        biomassProduction: 'high',
        cnRatio: 20,
        depth: 30,
        notes: 'Biofumigante naturale. Controlla nematodi e funghi patogeni.'
    },
    {
        name: 'Favino',
        family: 'Leguminose',
        sowingPeriod: {
            start: 9,
            end: 11
        },
        incorporationPeriod: {
            start: 3,
            end: 5
        },
        nitrogenFixation: true,
        biomassProduction: 'medium',
        cnRatio: 15,
        depth: 40,
        notes: 'Fissa azoto atmosferico. Ottimo prima di piante esigenti.'
    },
    {
        name: 'Veccia',
        family: 'Leguminose',
        sowingPeriod: {
            start: 9,
            end: 10
        },
        incorporationPeriod: {
            start: 4,
            end: 5
        },
        nitrogenFixation: true,
        biomassProduction: 'high',
        cnRatio: 12,
        depth: 50,
        notes: 'Fissa molto azoto. Ottima biomassa per compostaggio.'
    },
    {
        name: 'Trifoglio',
        family: 'Leguminose',
        sowingPeriod: {
            start: 3,
            end: 5
        },
        incorporationPeriod: {
            start: 6,
            end: 8
        },
        nitrogenFixation: true,
        biomassProduction: 'low',
        cnRatio: 18,
        depth: 20,
        notes: 'Perenne, può essere lasciato come pacciamatura viva.'
    }
];
const allFertilizers = [
    ...organicFertilizers,
    ...mineralFertilizers,
    ...correctiveFertilizers,
    ...microelementFertilizers
];
function getFertilizerById(id) {
    return allFertilizers.find((f)=>f.id === id);
}
function getFertilizersByType(type) {
    return allFertilizers.filter((f)=>f.type === type);
}
function getFertilizersByCategory(category) {
    return allFertilizers.filter((f)=>f.category === category);
}
function getCoverCropByName(name) {
    return coverCrops.find((c)=>c.name.toLowerCase() === name.toLowerCase());
}
function getAllCoverCrops() {
    return coverCrops;
}
}),
"[project]/data/phytoproducts.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Phytoproducts Database
 * Database completo prodotti fitofarmaci: bio, convenzionali, trappole
 */ __turbopack_context__.s([
    "allPhytoproducts",
    ()=>allPhytoproducts,
    "bioFungicides",
    ()=>bioFungicides,
    "bioInsecticides",
    ()=>bioInsecticides,
    "bioRepellents",
    ()=>bioRepellents,
    "conventionalProducts",
    ()=>conventionalProducts,
    "getBioProducts",
    ()=>getBioProducts,
    "getPhytoProductById",
    ()=>getPhytoProductById,
    "getPhytoProductsByCategory",
    ()=>getPhytoProductsByCategory,
    "getPhytoProductsByType",
    ()=>getPhytoProductsByType,
    "getPhytoProductsForDisease",
    ()=>getPhytoProductsForDisease,
    "getPhytoProductsForPest",
    ()=>getPhytoProductsForPest,
    "getProductsWithoutSafetyInterval",
    ()=>getProductsWithoutSafetyInterval,
    "traps",
    ()=>traps
]);
const bioFungicides = [
    {
        id: 'rame_poltiglia',
        name: 'Rame - Poltiglia Bordolese',
        type: 'bio',
        category: 'fungicide',
        activeIngredient: 'Rame (Cu)',
        targetDiseases: [
            'peronospora',
            'batteriosi',
            'ticchiolatura'
        ],
        dosage: {
            min: 20,
            max: 30,
            unit: 'g/L'
        },
        applicationMethod: 'foliar',
        frequencyDays: 14,
        safetyInterval: 7,
        requiresLicense: false,
        allowedInOrganic: true,
        weatherConditions: {
            minTemp: 5,
            maxTemp: 25,
            noRainHours: 12,
            windMax: 15,
            bestTime: 'morning'
        },
        notes: 'Non usare in fioritura (tossico per api). Evitare accumulo nel terreno.',
        costPerUnit: 8.0,
        effectiveness: 'high'
    },
    {
        id: 'rame_idrossido',
        name: 'Rame - Idrossido',
        type: 'bio',
        category: 'fungicide',
        activeIngredient: 'Rame (Cu)',
        targetDiseases: [
            'peronospora',
            'batteriosi'
        ],
        dosage: {
            min: 15,
            max: 25,
            unit: 'g/L'
        },
        applicationMethod: 'foliar',
        frequencyDays: 14,
        safetyInterval: 7,
        requiresLicense: false,
        allowedInOrganic: true,
        weatherConditions: {
            minTemp: 5,
            maxTemp: 25,
            noRainHours: 12,
            windMax: 15,
            bestTime: 'morning'
        },
        notes: 'Più delicato della poltiglia bordolese. Meno rischio fitotossicità.',
        costPerUnit: 10.0,
        effectiveness: 'high'
    },
    {
        id: 'zolfo',
        name: 'Zolfo Bagnabile',
        type: 'bio',
        category: 'fungicide',
        activeIngredient: 'Zolfo (S)',
        targetDiseases: [
            'oidio',
            'ticchiolatura'
        ],
        dosage: {
            min: 5,
            max: 8,
            unit: 'g/L'
        },
        applicationMethod: 'foliar',
        frequencyDays: 10,
        safetyInterval: 0,
        requiresLicense: false,
        allowedInOrganic: true,
        weatherConditions: {
            minTemp: 10,
            maxTemp: 30,
            noRainHours: 6,
            windMax: 20,
            bestTime: 'morning'
        },
        incompatibilities: [
            'rame_poltiglia',
            'rame_idrossido'
        ],
        notes: 'Non usare sopra 30°C (fitotossico). Non mescolare con rame.',
        costPerUnit: 5.0,
        effectiveness: 'medium'
    },
    {
        id: 'bicarbonato_potassio',
        name: 'Bicarbonato di Potassio',
        type: 'bio',
        category: 'fungicide',
        activeIngredient: 'Bicarbonato di Potassio',
        targetDiseases: [
            'oidio'
        ],
        dosage: {
            min: 5,
            max: 10,
            unit: 'g/L'
        },
        applicationMethod: 'foliar',
        frequencyDays: 7,
        safetyInterval: 0,
        requiresLicense: false,
        allowedInOrganic: true,
        weatherConditions: {
            minTemp: 10,
            maxTemp: 30,
            noRainHours: 6,
            bestTime: 'anytime'
        },
        notes: 'Nessun tempo di carenza. Può essere usato fino a raccolta.',
        costPerUnit: 12.0,
        effectiveness: 'medium'
    },
    {
        id: 'propoli',
        name: 'Propoli',
        type: 'bio',
        category: 'fungicide',
        activeIngredient: 'Propoli',
        targetDiseases: [
            'oidio',
            'batteriosi'
        ],
        dosage: {
            min: 2,
            max: 5,
            unit: 'mL/L'
        },
        applicationMethod: 'foliar',
        frequencyDays: 7,
        safetyInterval: 0,
        requiresLicense: false,
        allowedInOrganic: true,
        weatherConditions: {
            minTemp: 5,
            maxTemp: 35,
            noRainHours: 4,
            bestTime: 'anytime'
        },
        notes: 'Efficacia preventiva. Nessun tempo di carenza.',
        costPerUnit: 25.0,
        effectiveness: 'low'
    }
];
const bioInsecticides = [
    {
        id: 'piretro',
        name: 'Piretro Naturale',
        type: 'bio',
        category: 'insecticide',
        activeIngredient: 'Piretrine',
        targetPests: [
            'afidi',
            'tripidi',
            'altiche',
            'mosche'
        ],
        dosage: {
            min: 2,
            max: 4,
            unit: 'mL/L'
        },
        applicationMethod: 'foliar',
        frequencyDays: 7,
        safetyInterval: 3,
        requiresLicense: false,
        allowedInOrganic: true,
        weatherConditions: {
            minTemp: 10,
            maxTemp: 25,
            noRainHours: 6,
            windMax: 10,
            bestTime: 'evening'
        },
        notes: 'Tossico per api. Usare solo la sera quando api non sono attive.',
        costPerUnit: 15.0,
        effectiveness: 'high'
    },
    {
        id: 'olio_neem',
        name: 'Olio di Neem',
        type: 'bio',
        category: 'insecticide',
        activeIngredient: 'Azadiractina',
        targetPests: [
            'afidi',
            'cocciniglie',
            'tripidi',
            'acari'
        ],
        dosage: {
            min: 2,
            max: 5,
            unit: 'mL/L'
        },
        applicationMethod: 'foliar',
        frequencyDays: 10,
        safetyInterval: 0,
        requiresLicense: false,
        allowedInOrganic: true,
        weatherConditions: {
            minTemp: 15,
            maxTemp: 30,
            noRainHours: 8,
            windMax: 15,
            bestTime: 'evening'
        },
        notes: 'Repellente e insetticida. Agisce per ingestione e contatto.',
        costPerUnit: 20.0,
        effectiveness: 'medium'
    },
    {
        id: 'olio_bianco',
        name: 'Olio Bianco Minerale',
        type: 'bio',
        category: 'insecticide',
        activeIngredient: 'Olio minerale',
        targetPests: [
            'cocciniglie',
            'afidi',
            'acari'
        ],
        dosage: {
            min: 10,
            max: 20,
            unit: 'mL/L'
        },
        applicationMethod: 'foliar',
        frequencyDays: 14,
        safetyInterval: 0,
        requiresLicense: false,
        allowedInOrganic: true,
        weatherConditions: {
            minTemp: 5,
            maxTemp: 25,
            noRainHours: 12,
            windMax: 10,
            bestTime: 'winter'
        },
        notes: 'Usare in inverno su piante spoglie. Soffoca insetti.',
        costPerUnit: 8.0,
        effectiveness: 'high'
    },
    {
        id: 'bacillus_thuringiensis',
        name: 'Bacillus thuringiensis',
        type: 'bio',
        category: 'insecticide',
        activeIngredient: 'Bt (Bacillus thuringiensis)',
        targetPests: [
            'lepidotteri',
            'bruchi'
        ],
        dosage: {
            min: 1,
            max: 2,
            unit: 'g/L'
        },
        applicationMethod: 'foliar',
        frequencyDays: 7,
        safetyInterval: 0,
        requiresLicense: false,
        allowedInOrganic: true,
        weatherConditions: {
            minTemp: 15,
            maxTemp: 30,
            noRainHours: 8,
            bestTime: 'evening'
        },
        notes: 'Selettivo per bruchi. Non dannoso per insetti utili.',
        costPerUnit: 18.0,
        effectiveness: 'high'
    },
    {
        id: 'sapone_molle',
        name: 'Sapone Molle Potassico',
        type: 'bio',
        category: 'insecticide',
        activeIngredient: 'Sapone potassico',
        targetPests: [
            'afidi',
            'cocciniglie',
            'acari'
        ],
        dosage: {
            min: 10,
            max: 20,
            unit: 'mL/L'
        },
        applicationMethod: 'foliar',
        frequencyDays: 5,
        safetyInterval: 0,
        requiresLicense: false,
        allowedInOrganic: true,
        weatherConditions: {
            minTemp: 10,
            maxTemp: 30,
            noRainHours: 4,
            bestTime: 'anytime'
        },
        notes: 'Soffoca insetti. Nessun tempo di carenza.',
        costPerUnit: 6.0,
        effectiveness: 'medium'
    },
    {
        id: 'spinosad',
        name: 'Spinosad',
        type: 'bio',
        category: 'insecticide',
        activeIngredient: 'Spinosad',
        targetPests: [
            'tripidi',
            'lepidotteri',
            'coleotteri'
        ],
        dosage: {
            min: 0.5,
            max: 1,
            unit: 'mL/L'
        },
        applicationMethod: 'foliar',
        frequencyDays: 7,
        safetyInterval: 3,
        requiresLicense: false,
        allowedInOrganic: true,
        weatherConditions: {
            minTemp: 15,
            maxTemp: 30,
            noRainHours: 8,
            windMax: 15,
            bestTime: 'evening'
        },
        notes: 'Tossico per api. Usare solo la sera.',
        costPerUnit: 22.0,
        effectiveness: 'high'
    }
];
const bioRepellents = [
    {
        id: 'caolino',
        name: 'Caolino',
        type: 'bio',
        category: 'repellent',
        activeIngredient: 'Caolino',
        targetPests: [
            'mosca',
            'cimice',
            'tignola'
        ],
        dosage: {
            min: 50,
            max: 100,
            unit: 'g/L'
        },
        applicationMethod: 'foliar',
        frequencyDays: 14,
        safetyInterval: 0,
        requiresLicense: false,
        allowedInOrganic: true,
        weatherConditions: {
            minTemp: 10,
            maxTemp: 35,
            noRainHours: 24,
            bestTime: 'morning'
        },
        notes: 'Barriera fisica. Protegge da scottature solari. Si lava con pioggia.',
        costPerUnit: 3.0,
        effectiveness: 'medium'
    },
    {
        id: 'farina_roccia',
        name: 'Farina di Roccia',
        type: 'bio',
        category: 'repellent',
        activeIngredient: 'Silicati',
        targetPests: [
            'lumache',
            'chiocciole'
        ],
        dosage: {
            min: 100,
            max: 200,
            unit: 'g/m²'
        },
        applicationMethod: 'soil',
        frequencyDays: 0,
        safetyInterval: 0,
        requiresLicense: false,
        allowedInOrganic: true,
        weatherConditions: {
            noRainHours: 0,
            bestTime: 'anytime'
        },
        notes: 'Barriera fisica per lumache. Si rinnova dopo pioggia.',
        costPerUnit: 2.0,
        effectiveness: 'medium'
    }
];
const traps = [
    {
        id: 'trappola_cromotropica_gialla',
        name: 'Trappola Cromotropica Gialla',
        type: 'bio',
        category: 'trap',
        targetPests: [
            'tripidi',
            'mosche bianche',
            'afidi alati'
        ],
        dosage: {
            min: 1,
            max: 1,
            unit: 'units/m²'
        },
        applicationMethod: 'trap',
        frequencyDays: 30,
        safetyInterval: 0,
        requiresLicense: false,
        allowedInOrganic: true,
        weatherConditions: {
            bestTime: 'anytime'
        },
        notes: 'Attrae insetti volanti. Sostituire ogni 30 giorni o quando piena.',
        costPerUnit: 2.0,
        effectiveness: 'medium'
    },
    {
        id: 'trappola_cromotropica_blu',
        name: 'Trappola Cromotropica Blu',
        type: 'bio',
        category: 'trap',
        targetPests: [
            'tripidi'
        ],
        dosage: {
            min: 1,
            max: 1,
            unit: 'units/m²'
        },
        applicationMethod: 'trap',
        frequencyDays: 30,
        safetyInterval: 0,
        requiresLicense: false,
        allowedInOrganic: true,
        weatherConditions: {
            bestTime: 'anytime'
        },
        notes: 'Specifica per tripidi. Più efficace del giallo per questa specie.',
        costPerUnit: 2.0,
        effectiveness: 'high'
    },
    {
        id: 'trappola_feromonica_carpocapsa',
        name: 'Trappola Feromonica Carpocapsa',
        type: 'bio',
        category: 'trap',
        targetPests: [
            'carpocapsa'
        ],
        dosage: {
            min: 1,
            max: 2,
            unit: 'units/pianta'
        },
        applicationMethod: 'trap',
        frequencyDays: 60,
        safetyInterval: 0,
        requiresLicense: false,
        allowedInOrganic: true,
        weatherConditions: {
            bestTime: 'spring'
        },
        notes: 'Feromone specifico per carpocapsa. Monitoraggio e cattura massale.',
        costPerUnit: 8.0,
        effectiveness: 'high'
    },
    {
        id: 'trappola_alimentare_mosca',
        name: 'Trappola Alimentare Mosca',
        type: 'bio',
        category: 'trap',
        targetPests: [
            'mosca della frutta',
            'mosca dell\'olivo'
        ],
        dosage: {
            min: 1,
            max: 2,
            unit: 'units/pianta'
        },
        applicationMethod: 'trap',
        frequencyDays: 14,
        safetyInterval: 0,
        requiresLicense: false,
        allowedInOrganic: true,
        weatherConditions: {
            bestTime: 'summer'
        },
        notes: 'Esche alimentari. Sostituire ogni 2 settimane.',
        costPerUnit: 5.0,
        effectiveness: 'medium'
    }
];
const conventionalProducts = [
    {
        id: 'deltametrina',
        name: 'Deltametrina',
        type: 'conventional',
        category: 'insecticide',
        activeIngredient: 'Deltametrina',
        targetPests: [
            'afidi',
            'lepidotteri',
            'coleotteri'
        ],
        dosage: {
            min: 0.5,
            max: 1,
            unit: 'mL/L'
        },
        applicationMethod: 'foliar',
        frequencyDays: 14,
        safetyInterval: 7,
        requiresLicense: true,
        allowedInOrganic: false,
        weatherConditions: {
            minTemp: 10,
            maxTemp: 25,
            noRainHours: 12,
            windMax: 10,
            bestTime: 'evening'
        },
        notes: '⚠️ PRODOTTO CHIMICO. Richiede patentino. Tossico per api e ambiente acquatico.',
        costPerUnit: 15.0,
        effectiveness: 'high'
    },
    {
        id: 'azoxystrobin',
        name: 'Azoxystrobin',
        type: 'conventional',
        category: 'fungicide',
        activeIngredient: 'Azoxystrobin',
        targetDiseases: [
            'peronospora',
            'oidio',
            'alternaria'
        ],
        dosage: {
            min: 0.5,
            max: 1,
            unit: 'mL/L'
        },
        applicationMethod: 'foliar',
        frequencyDays: 10,
        safetyInterval: 14,
        requiresLicense: true,
        allowedInOrganic: false,
        weatherConditions: {
            minTemp: 10,
            maxTemp: 30,
            noRainHours: 6,
            bestTime: 'anytime'
        },
        notes: '⚠️ PRODOTTO CHIMICO. Richiede patentino. Tempo di carenza lungo.',
        costPerUnit: 25.0,
        effectiveness: 'high'
    }
];
const allPhytoproducts = [
    ...bioFungicides,
    ...bioInsecticides,
    ...bioRepellents,
    ...traps,
    ...conventionalProducts
];
function getPhytoProductById(id) {
    return allPhytoproducts.find((p)=>p.id === id);
}
function getPhytoProductsByType(type) {
    return allPhytoproducts.filter((p)=>p.type === type);
}
function getPhytoProductsByCategory(category) {
    return allPhytoproducts.filter((p)=>p.category === category);
}
function getPhytoProductsForPest(pest) {
    return allPhytoproducts.filter((p)=>p.targetPests?.some((tp)=>tp.toLowerCase().includes(pest.toLowerCase())));
}
function getPhytoProductsForDisease(disease) {
    return allPhytoproducts.filter((p)=>p.targetDiseases?.some((td)=>td.toLowerCase().includes(disease.toLowerCase())));
}
function getBioProducts() {
    return allPhytoproducts.filter((p)=>p.type === 'bio');
}
function getProductsWithoutSafetyInterval() {
    return allPhytoproducts.filter((p)=>p.safetyInterval === 0);
}
}),
];

//# sourceMappingURL=data_22551dcc._.js.map