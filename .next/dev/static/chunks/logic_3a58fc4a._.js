(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/logic/winterPreparationEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateWinterPreparationPlan",
    ()=>generateWinterPreparationPlan
]);
const generateWinterPreparationPlan = (garden, targetSeason)=>{
    const tasks = [];
    const currentMonth = new Date().getMonth() + 1; // 1-12
    // Determina se siamo nella stagione di preparazione
    const isPreparationSeason = targetSeason === 'Summer' && (currentMonth >= 11 || currentMonth <= 2) || targetSeason === 'Winter' && currentMonth >= 6 && currentMonth <= 8; // Giugno-Agosto per inverno
    if (!isPreparationSeason) {
        return tasks; // Non è il momento per lavori preparatori
    }
    const soilType = garden.soilType || 'Loamy';
    const sizeSqM = garden.sizeSqMeters;
    // Genera task basati su tipo terreno e stagione target
    if (targetSeason === 'Summer') {
        // Preparazione per orto estivo (inverno)
        generateSummerPreparationTasks(tasks, soilType, sizeSqM, currentMonth);
    } else {
        // Preparazione per orto invernale (estate)
        generateWinterPreparationTasks(tasks, soilType, sizeSqM, currentMonth);
    }
    return tasks;
};
/**
 * Genera task per preparazione orto estivo (da fare in inverno)
 */ function generateSummerPreparationTasks(tasks, soilType, sizeSqM, currentMonth) {
    // Task comuni per tutti i terreni
    tasks.push({
        id: 'winter-cleanup',
        category: 'Structure',
        title: 'Pulizia residui colture precedenti',
        description: 'Rimuovi tutte le piante secche, radici e residui dell\'orto invernale per evitare malattie e parassiti.',
        priority: 'High',
        dueMonth: currentMonth <= 2 ? currentMonth : 1,
        estimatedTime: '1-2 ore',
        materials: [
            'Sacco per rifiuti',
            'Forbici',
            'Zappa'
        ],
        instructions: [
            'Rimuovi tutte le piante secche e i residui',
            'Taglia le radici grosse con le forbici',
            'Raccogli tutto in sacchi per compost o smaltimento',
            'Pulisci gli attrezzi dopo l\'uso'
        ]
    });
    // Task specifici per tipo terreno
    if (soilType === 'Sandy') {
        // Terreno sabbioso: migliorare struttura e ritenzione
        tasks.push({
            id: 'sandy-organic',
            category: 'Fertilization',
            title: 'Miglioramento struttura con materia organica',
            description: `Aggiungi compost o letame maturo per migliorare la ritenzione idrica del terreno sabbioso.`,
            priority: 'Critical',
            dueMonth: 1,
            estimatedTime: '2-3 ore',
            materials: [
                `Compost: ${Math.ceil(sizeSqM * 1.5)}kg (1.5kg/m²)`,
                `Letame maturo: ${Math.ceil(sizeSqM * 2)}kg (2kg/m²) - opzionale`
            ],
            instructions: [
                `Distribuisci ${Math.ceil(sizeSqM * 1.5)}kg di compost su tutta la superficie`,
                'Lavora il terreno con la vanga o motozappa per incorporare il compost',
                'Se usi letame, assicurati che sia ben maturo (almeno 6 mesi)',
                'Lascia riposare il terreno per 2-3 settimane prima di trapiantare'
            ]
        });
        tasks.push({
            id: 'sandy-mulch',
            category: 'Soil',
            title: 'Pacciamatura preventiva',
            description: 'Prepara la pacciamatura per ridurre l\'evaporazione estiva.',
            priority: 'Medium',
            dueMonth: 2,
            estimatedTime: '1 ora',
            materials: [
                'Paglia o teli pacciamanti',
                'Pietre o picchetti'
            ],
            instructions: [
                'Acquista o prepara materiale per pacciamatura (paglia, teli, corteccia)',
                'Conservalo in luogo asciutto fino al trapianto',
                'Dopo il trapianto, applica 5-7cm di pacciamatura attorno alle piante'
            ]
        });
    } else if (soilType === 'Clay') {
        // Terreno argilloso: migliorare drenaggio e struttura
        tasks.push({
            id: 'clay-deep-tilling',
            category: 'Soil',
            title: 'Lavorazione profonda del terreno',
            description: 'Vanga o ara il terreno in profondità per migliorare il drenaggio e la struttura.',
            priority: 'Critical',
            dueMonth: currentMonth <= 2 ? currentMonth : 1,
            estimatedTime: '3-4 ore',
            materials: [
                'Vanga',
                'Zappa',
                'Eventuale motozappa'
            ],
            instructions: [
                'Lavora il terreno quando è leggermente umido (non bagnato)',
                'Vanga a 30-40cm di profondità',
                'Rompere le zolle grosse con la zappa',
                'Non lavorare se il terreno è troppo bagnato (si compatta)'
            ]
        });
        tasks.push({
            id: 'clay-drainage',
            category: 'Soil',
            title: 'Miglioramento drenaggio',
            description: 'Aggiungi sabbia o ghiaia fine per migliorare il drenaggio del terreno argilloso.',
            priority: 'High',
            dueMonth: 1,
            estimatedTime: '2-3 ore',
            materials: [
                `Sabbia di fiume: ${Math.ceil(sizeSqM * 0.1)}m³ (10cm di spessore su 10% superficie)`,
                'Compost: per migliorare struttura'
            ],
            instructions: [
                'Identifica le zone più problematiche (ristagni d\'acqua)',
                `Distribuisci sabbia nelle zone problematiche (circa ${Math.ceil(sizeSqM * 0.1)}m³)`,
                'Miscela sabbia e compost con il terreno esistente',
                'Lavora in profondità per incorporare bene'
            ]
        });
        tasks.push({
            id: 'clay-fertilization',
            category: 'Fertilization',
            title: 'Concimazione di fondo',
            description: `Aggiungi letame o compost maturo per nutrire il terreno argilloso.`,
            priority: 'High',
            dueMonth: 1,
            estimatedTime: '2 ore',
            materials: [
                `Letame maturo: ${Math.ceil(sizeSqM * 2.5)}kg (2.5kg/m²)`,
                `Compost: ${Math.ceil(sizeSqM * 2)}kg (2kg/m²) - alternativa`
            ],
            instructions: [
                `Distribuisci ${Math.ceil(sizeSqM * 2.5)}kg di letame maturo su tutta la superficie`,
                'Lavora il terreno per incorporare il letame a 20-30cm di profondità',
                'Se usi compost, usa la stessa quantità',
                'Lascia maturare per almeno 3-4 settimane prima di trapiantare'
            ]
        });
    } else {
        // Terreno medio impasto (Loamy) o altri
        tasks.push({
            id: 'loamy-fertilization',
            category: 'Fertilization',
            title: 'Concimazione di fondo',
            description: `Aggiungi compost o letame per arricchire il terreno prima della stagione estiva.`,
            priority: 'High',
            dueMonth: 1,
            estimatedTime: '2 ore',
            materials: [
                `Compost: ${Math.ceil(sizeSqM * 2)}kg (2kg/m²)`,
                `Letame maturo: ${Math.ceil(sizeSqM * 2)}kg (2kg/m²) - opzionale`
            ],
            instructions: [
                `Distribuisci ${Math.ceil(sizeSqM * 2)}kg di compost su tutta la superficie`,
                'Lavora il terreno con la vanga per incorporare',
                'Lascia riposare per 2-3 settimane'
            ]
        });
    }
    // Task strutturali comuni
    tasks.push({
        id: 'structure-trellis',
        category: 'Structure',
        title: 'Preparazione tutori e supporti',
        description: 'Prepara tutori, pali e reti per piante rampicanti (pomodori, fagioli, zucchine).',
        priority: 'Medium',
        dueMonth: 2,
        estimatedTime: '1-2 ore',
        materials: [
            'Pali in legno o metallo',
            'Filo o rete',
            'Martello',
            'Cesoie'
        ],
        instructions: [
            'Controlla i tutori dell\'anno precedente, sostituisci quelli rotti',
            'Prepara nuovi tutori se necessario',
            'Prepara reti per fagioli rampicanti',
            'Conserva tutto in luogo asciutto fino al trapianto'
        ]
    });
    tasks.push({
        id: 'structure-irrigation',
        category: 'Structure',
        title: 'Preparazione sistema irrigazione',
        description: 'Controlla e prepara il sistema di irrigazione per l\'estate.',
        priority: 'Medium',
        dueMonth: 2,
        estimatedTime: '1 ora',
        materials: [
            'Tubi irrigazione',
            'Gocciolatori',
            'Raccordi'
        ],
        instructions: [
            'Controlla i tubi per perdite o ostruzioni',
            'Sostituisci gocciolatori rotti o intasati',
            'Pulisci i filtri',
            'Testa il sistema prima dell\'uso estivo'
        ]
    });
    tasks.push({
        id: 'planning-seeds',
        category: 'Planning',
        title: 'Pianificazione semine indoor',
        description: 'Prepara il semenzaio e pianifica le semine indoor per trapianti primaverili.',
        priority: 'High',
        dueMonth: 2,
        estimatedTime: '30 minuti',
        materials: [
            'Semenzaio alveolato',
            'Terriccio da semina',
            'Etichette'
        ],
        instructions: [
            'Controlla l\'inventario semi (vedi Banca Semi)',
            'Acquista semi mancanti per le varietà estive',
            'Prepara il semenzaio e il terriccio',
            'Pianifica le date di semina in base alle varietà scelte'
        ]
    });
}
/**
 * Genera task per preparazione orto invernale (da fare in estate)
 */ function generateWinterPreparationTasks(tasks, soilType, sizeSqM, currentMonth) {
    // Pulizia residui estivi
    tasks.push({
        id: 'summer-cleanup',
        category: 'Structure',
        title: 'Pulizia residui colture estive',
        description: 'Rimuovi piante secche e residui dell\'orto estivo.',
        priority: 'High',
        dueMonth: currentMonth,
        estimatedTime: '1-2 ore',
        materials: [
            'Sacco per rifiuti',
            'Forbici',
            'Zappa'
        ],
        instructions: [
            'Rimuovi tutte le piante secche',
            'Taglia le radici grosse',
            'Raccogli in sacchi per compost'
        ]
    });
    if (soilType === 'Clay') {
        // Terreno argilloso: baulatura per drenaggio invernale
        tasks.push({
            id: 'clay-ridging',
            category: 'Soil',
            title: 'Baulatura per orto invernale',
            description: 'Crea collinette (bauli) per evitare ristagni d\'acqua in inverno.',
            priority: 'Critical',
            dueMonth: currentMonth,
            estimatedTime: '3-4 ore',
            materials: [
                'Vanga',
                'Zappa'
            ],
            instructions: [
                'Crea collinette alte 15-20cm',
                'Larghezza collinette: 60-80cm',
                'Distanza tra collinette: 40-50cm (per i solchi)',
                'Pianta le colture invernali sulle collinette, non nei solchi'
            ]
        });
    }
    // Concimazione per inverno
    tasks.push({
        id: 'winter-fertilization',
        category: 'Fertilization',
        title: 'Concimazione per orto invernale',
        description: `Aggiungi compost per nutrire le colture invernali.`,
        priority: 'High',
        dueMonth: currentMonth,
        estimatedTime: '1-2 ore',
        materials: [
            `Compost: ${Math.ceil(sizeSqM * 1.5)}kg (1.5kg/m²)`
        ],
        instructions: [
            `Distribuisci ${Math.ceil(sizeSqM * 1.5)}kg di compost`,
            'Lavora superficialmente (10-15cm)',
            'Non troppo profondo per non disturbare le radici'
        ]
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/lunarCalendar.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Calendario Lunare Completo
 * Calcola tutte le fasi lunari basandosi su algoritmi matematici
 * Ciclo lunare: ~29.5 giorni
 */ __turbopack_context__.s([
    "calculateMoonPhase",
    ()=>calculateMoonPhase,
    "daysUntilPhase",
    ()=>daysUntilPhase,
    "getMoonPhaseEmoji",
    ()=>getMoonPhaseEmoji,
    "getMoonPhaseName",
    ()=>getMoonPhaseName,
    "getMoonPhaseNameFromPhase",
    ()=>getMoonPhaseNameFromPhase,
    "isIdealPhaseFor",
    ()=>isIdealPhaseFor,
    "isWaning",
    ()=>isWaning,
    "isWaxing",
    ()=>isWaxing
]);
/**
 * Calcola il Julian Day Number per una data
 */ const julianDay = (date)=>{
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours() + date.getMinutes() / 60;
    let a, b;
    if (month <= 2) {
        a = year - 1;
        b = 0;
    } else {
        a = year;
        b = Math.floor(month / 12.6);
    }
    const c = Math.floor(365.25 * a);
    const d = Math.floor(30.6001 * (month + 1));
    return c + d + day + hour / 24 + 1720994.5;
};
const calculateMoonPhase = (date)=>{
    const jd = julianDay(date);
    // Data di riferimento: Luna Nuova del 6 gennaio 2000 (JD 2451549.5)
    const knownNewMoonJD = 2451549.5;
    // Ciclo lunare sinodico medio: 29.53058867 giorni
    const synodicMonth = 29.53058867;
    // Calcola quanti cicli sono passati
    const daysSinceKnown = jd - knownNewMoonJD;
    const cyclesSinceKnown = daysSinceKnown / synodicMonth;
    // Calcola la posizione nel ciclo corrente (0-1)
    const positionInCycle = cyclesSinceKnown - Math.floor(cyclesSinceKnown);
    // Converti in giorni (0-29.5)
    const daysInCycle = positionInCycle * synodicMonth;
    // Determina la fase basandosi sui giorni nel ciclo
    let phase;
    let name;
    if (daysInCycle < 1.84) {
        phase = 'New';
        name = 'Luna Nuova';
    } else if (daysInCycle < 5.53) {
        phase = 'WaxingCrescent';
        name = 'Crescente';
    } else if (daysInCycle < 9.23) {
        phase = 'FirstQuarter';
        name = 'Primo Quarto';
    } else if (daysInCycle < 12.93) {
        phase = 'WaxingGibbous';
        name = 'Gibbosa Crescente';
    } else if (daysInCycle < 16.61) {
        phase = 'Full';
        name = 'Luna Piena';
    } else if (daysInCycle < 20.30) {
        phase = 'WaningGibbous';
        name = 'Gibbosa Calante';
    } else if (daysInCycle < 24.00) {
        phase = 'LastQuarter';
        name = 'Ultimo Quarto';
    } else {
        phase = 'WaningCrescent';
        name = 'Calante';
    }
    const isWaxing = phase === 'WaxingCrescent' || phase === 'FirstQuarter' || phase === 'WaxingGibbous';
    const isWaning = phase === 'WaningGibbous' || phase === 'LastQuarter' || phase === 'WaningCrescent';
    return {
        phase,
        name,
        isWaxing,
        isWaning,
        daysInCycle
    };
};
const isWaxing = (date = new Date())=>{
    return calculateMoonPhase(date).isWaxing;
};
const isWaning = (date = new Date())=>{
    return calculateMoonPhase(date).isWaning;
};
const getMoonPhaseName = (date = new Date())=>{
    return calculateMoonPhase(date).name;
};
const getMoonPhaseNameFromPhase = (phase)=>{
    const phaseNames = {
        'New': 'Luna Nuova',
        'WaxingCrescent': 'Crescente',
        'FirstQuarter': 'Primo Quarto',
        'WaxingGibbous': 'Gibbosa Crescente',
        'Full': 'Luna Piena',
        'WaningGibbous': 'Gibbosa Calante',
        'LastQuarter': 'Ultimo Quarto',
        'WaningCrescent': 'Calante'
    };
    return phaseNames[phase] || 'Fase Sconosciuta';
};
const getMoonPhaseEmoji = (phase)=>{
    if (phase === 'Full') return '🌕';
    if (phase === 'New') return '🌑';
    if (phase === 'WaxingCrescent' || phase === 'FirstQuarter' || phase === 'WaxingGibbous') return '🌒';
    if (phase === 'WaningGibbous' || phase === 'LastQuarter' || phase === 'WaningCrescent') return '🌘';
    return '🌓'; // Default fallback
};
const daysUntilPhase = (targetPhase, fromDate = new Date())=>{
    const current = calculateMoonPhase(fromDate);
    const synodicMonth = 29.53058867;
    // Mappa delle fasi con posizione nel ciclo (0-29.5)
    const phasePositions = {
        'New': 0,
        'WaxingCrescent': 3.69,
        'FirstQuarter': 7.38,
        'WaxingGibbous': 11.08,
        'Full': 14.77,
        'WaningGibbous': 18.46,
        'LastQuarter': 22.15,
        'WaningCrescent': 25.85
    };
    const currentPos = current.daysInCycle;
    const targetPos = phasePositions[targetPhase];
    let daysUntil = targetPos - currentPos;
    // Se la fase target è già passata, calcola per il prossimo ciclo
    if (daysUntil < 0) {
        daysUntil += synodicMonth;
    }
    return Math.ceil(daysUntil);
};
const isIdealPhaseFor = (operation, plantCategory, date = new Date())=>{
    const moonInfo = calculateMoonPhase(date);
    // Regole tradizionali:
    // - Foglie/Frutti: Luna Crescente (cresce la parte aerea)
    // - Radici: Luna Calante (cresce la parte sotterranea)
    // - Trapianto: preferibilmente Luna Crescente
    // - Raccolto: dipende dal tipo (foglie in calante, frutti in crescente)
    if (operation === 'sowing') {
        if (plantCategory === 'ROOT') {
            // Radici: meglio Luna Calante
            if (moonInfo.isWaning) {
                return {
                    ideal: true,
                    reason: 'Luna Calante ideale per semina di radici'
                };
            } else {
                const days = daysUntilPhase('WaningCrescent', date);
                return {
                    ideal: false,
                    reason: 'Per le radici è meglio Luna Calante. Aspetta ' + days + ' giorni.',
                    daysUntilIdeal: days
                };
            }
        } else {
            // Foglie/Frutti: meglio Luna Crescente
            if (moonInfo.isWaxing || moonInfo.phase === 'New') {
                return {
                    ideal: true,
                    reason: 'Luna Crescente ideale per semina di foglie/frutti'
                };
            } else {
                const days = daysUntilPhase('WaxingCrescent', date);
                return {
                    ideal: false,
                    reason: 'Per foglie/frutti è meglio Luna Crescente. Aspetta ' + days + ' giorni.',
                    daysUntilIdeal: days
                };
            }
        }
    }
    if (operation === 'transplant') {
        // Trapianto: preferibilmente Luna Crescente
        if (moonInfo.isWaxing || moonInfo.phase === 'New') {
            return {
                ideal: true,
                reason: 'Luna Crescente ideale per trapianto'
            };
        } else {
            const days = daysUntilPhase('WaxingCrescent', date);
            return {
                ideal: false,
                reason: 'Per il trapianto è meglio Luna Crescente. Aspetta ' + days + ' giorni.',
                daysUntilIdeal: days
            };
        }
    }
    if (operation === 'harvest') {
        if (plantCategory === 'LEAFY') {
            // Foglie: meglio Luna Calante (meno acqua, più sapore)
            if (moonInfo.isWaning) {
                return {
                    ideal: true,
                    reason: 'Luna Calante ideale per raccolta foglie'
                };
            } else {
                const days = daysUntilPhase('WaningCrescent', date);
                return {
                    ideal: false,
                    reason: 'Per le foglie è meglio Luna Calante. Aspetta ' + days + ' giorni.',
                    daysUntilIdeal: days
                };
            }
        } else {
            // Frutti: meglio Luna Crescente (più succosi)
            if (moonInfo.isWaxing) {
                return {
                    ideal: true,
                    reason: 'Luna Crescente ideale per raccolta frutti'
                };
            } else {
                const days = daysUntilPhase('WaxingCrescent', date);
                return {
                    ideal: false,
                    reason: 'Per i frutti è meglio Luna Crescente. Aspetta ' + days + ' giorni.',
                    daysUntilIdeal: days
                };
            }
        }
    }
    return {
        ideal: true,
        reason: 'Fase lunare accettabile'
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/vacationEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateVacationPlan",
    ()=>generateVacationPlan,
    "getDaysUntilDeparture",
    ()=>getDaysUntilDeparture,
    "hasActiveVacation",
    ()=>hasActiveVacation,
    "hasUpcomingVacation",
    ()=>hasUpcomingVacation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/plantMasterService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$taskCalculationService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/taskCalculationService.ts [app-client] (ecmascript)");
;
;
/**
 * Determina la fase del ciclo vitale (versione semplificata per vacation engine)
 */ const getLifecyclePhase = (daysAlive, task)=>{
    if (task.lifecycleState) {
        return task.lifecycleState;
    }
    if (daysAlive === 0) return 'Sowing';
    if (daysAlive < 20) return 'Germination';
    if (daysAlive < 50) return 'Nursing';
    if (daysAlive < 65) return 'Hardening';
    if (daysAlive < 90) return 'Transplanting';
    return 'Production';
};
const generateVacationPlan = (garden, tasks, startDate, endDate)=>{
    const tasksList = [];
    const daysAway = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentDate = new Date();
    const daysUntilDeparture = Math.ceil((startDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    // Filtra solo le piante attive (non completate)
    const activeTasks = tasks.filter((t)=>!t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant'));
    // Task 1: Raccolta preventiva (per piante in fruttificazione)
    activeTasks.forEach((task)=>{
        const masterData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMasterSheet"])(task.plantName);
        if (!masterData) return;
        const daysAlive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$taskCalculationService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateDaysActive"])(task);
        const phase = getLifecyclePhase(daysAlive, task);
        // Se la pianta è in produzione e ha frutti quasi maturi, raccogli tutto
        if (phase === 'Production') {
            // Per piante da frutto (pomodori, peperoncini, zucchine)
            if (masterData.nutrientCategory === 'FRUITING') {
                tasksList.push({
                    id: crypto.randomUUID(),
                    priority: 'Critical',
                    category: 'Harvest',
                    title: `Raccogli ${task.plantName} quasi maturi`,
                    description: `Raccogli tutto ciò che è quasi maturo (colore che inizia a cambiare). I frutti matureranno in casa durante la tua assenza, evitando di stressare la pianta e perdere il raccolto.`,
                    dueDate: new Date(startDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    estimatedTime: '30 minuti'
                });
            }
            // Per piante a foglia (lattuga, spinaci)
            if (masterData.nutrientCategory === 'LEAFY') {
                tasksList.push({
                    id: crypto.randomUUID(),
                    priority: 'High',
                    category: 'Harvest',
                    title: `Raccogli ${task.plantName} prima della partenza`,
                    description: `Raccogli le foglie più mature per evitare che vadano a seme durante la tua assenza.`,
                    dueDate: new Date(startDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    estimatedTime: '20 minuti'
                });
            }
        }
    });
    // Task 2: Pacciamatura (terreno sabbioso)
    if (garden.soilType === 'Sandy' && daysAway > 5) {
        tasksList.push({
            id: crypto.randomUUID(),
            priority: 'Critical',
            category: 'Soil',
            title: 'Pacciamatura urgente (terreno sabbioso)',
            description: `Il tuo terreno è sabbioso e perde umidità velocemente. Applica 5cm di paglia, corteccia o foglie secche attorno alle piante per mantenere l'umidità durante la tua assenza.`,
            dueDate: new Date(startDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            estimatedTime: '1 ora'
        });
    }
    // Task 3: Spostare vasi all'ombra
    const potTasks = activeTasks.filter((t)=>t.locationType === 'Pot');
    if (potTasks.length > 0) {
        tasksList.push({
            id: crypto.randomUUID(),
            priority: 'High',
            category: 'Protection',
            title: 'Sposta vasi all\'ombra o raggruppali',
            description: `Hai ${potTasks.length} pianta/e in vaso. Spostale all'ombra o raggruppale per creare un microclima umido. I vasi si seccano più velocemente del terreno.`,
            dueDate: new Date(startDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            estimatedTime: '20 minuti'
        });
    }
    // Task 4: Irrigazione straordinaria (se vacanza > 7 giorni)
    if (daysAway > 7) {
        tasksList.push({
            id: crypto.randomUUID(),
            priority: 'Critical',
            category: 'Watering',
            title: 'Irrigazione profonda prima della partenza',
            description: `Fai un'irrigazione abbondante e profonda il giorno prima della partenza. Bagna bene il terreno fino a 20-30cm di profondità. Considera di installare un sistema di irrigazione automatica se disponibile.`,
            dueDate: new Date(startDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            estimatedTime: '45 minuti'
        });
    }
    // Task 5: Protezione da parassiti (se ci sono piante vulnerabili)
    activeTasks.forEach((task)=>{
        const masterData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMasterSheet"])(task.plantName);
        if (!masterData || !masterData.susceptibility) return;
        if (masterData.susceptibility.preventiveStrategy === 'HIGH') {
            tasksList.push({
                id: crypto.randomUUID(),
                priority: 'Medium',
                category: 'Protection',
                title: `Protezione preventiva per ${task.plantName}`,
                description: `${task.plantName} è suscettibile a ${masterData.susceptibility.fungalDiseases.join(', ')}. Applica un trattamento preventivo (es. zeolite, rame) prima della partenza per proteggere durante la tua assenza.`,
                dueDate: new Date(startDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                estimatedTime: '30 minuti'
            });
        }
    });
    // Task 6: Rimuovi fiori secchi e parti malate
    if (activeTasks.length > 0) {
        tasksList.push({
            id: crypto.randomUUID(),
            priority: 'Medium',
            category: 'Protection',
            title: 'Pulizia generale: rimuovi fiori secchi e parti malate',
            description: 'Rimuovi fiori secchi, foglie gialle e parti malate per evitare che diventino fonte di malattie durante la tua assenza.',
            dueDate: new Date(startDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            estimatedTime: '30 minuti'
        });
    }
    // Ordina i task per priorità e data
    tasksList.sort((a, b)=>{
        const priorityOrder = {
            'Critical': 0,
            'High': 1,
            'Medium': 2
        };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    return {
        gardenId: garden.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        tasks: tasksList,
        createdAt: new Date().toISOString()
    };
};
const getDaysUntilDeparture = (startDate)=>{
    const currentDate = new Date();
    const diffTime = startDate.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
const hasActiveVacation = (garden)=>{
    if (!garden.vacationMode) return false;
    const startDate = new Date(garden.vacationMode.startDate);
    const endDate = new Date(garden.vacationMode.endDate);
    const currentDate = new Date();
    // La vacanza è attiva se siamo tra startDate e endDate
    return currentDate >= startDate && currentDate <= endDate;
};
const hasUpcomingVacation = (garden)=>{
    if (!garden.vacationMode) return false;
    const startDate = new Date(garden.vacationMode.startDate);
    const currentDate = new Date();
    return currentDate < startDate;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/seedlingTimelineEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Seedling Timeline Engine
 * Calcoli avanzati per timing germinazione, nursing, hardening e trapianto
 */ __turbopack_context__.s([
    "calculateGerminationDays",
    ()=>calculateGerminationDays,
    "calculateSeedlingTimeline",
    ()=>calculateSeedlingTimeline
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/plantMasterService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/lunarCalendar.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$seasonalAdjustment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/seasonalAdjustment.ts [app-client] (ecmascript)");
;
;
;
const calculateSeedlingTimeline = (batch, garden, weatherForecast)=>{
    const masterData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMasterSheet"])(batch.plantName);
    if (!masterData) {
        throw new Error(`Pianta ${batch.plantName} non trovata`);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sowingDate = new Date(batch.sowingDate);
    sowingDate.setHours(0, 0, 0, 0);
    const daysSinceSowing = Math.floor((today.getTime() - sowingDate.getTime()) / (1000 * 60 * 60 * 24));
    // Calcoli giorni per fase
    const avgGerminationDays = (masterData.germination.emergenceDays.min + masterData.germination.emergenceDays.max) / 2;
    const nursingDays = 30;
    const hardeningDays = 10;
    // Germinazione
    const germinationStart = new Date(sowingDate);
    const germinationEnd = new Date(sowingDate);
    germinationEnd.setDate(germinationEnd.getDate() + avgGerminationDays);
    let germinationStatus = 'NotStarted';
    if (daysSinceSowing >= avgGerminationDays) {
        germinationStatus = 'Completed';
    } else if (daysSinceSowing > 0) {
        germinationStatus = 'InProgress';
    }
    // Nursing
    const nursingStart = new Date(germinationEnd);
    const nursingEnd = new Date(nursingStart);
    nursingEnd.setDate(nursingEnd.getDate() + nursingDays);
    let nursingStatus = 'NotStarted';
    if (daysSinceSowing >= avgGerminationDays + nursingDays) {
        nursingStatus = 'Completed';
    } else if (daysSinceSowing >= avgGerminationDays) {
        nursingStatus = 'InProgress';
    }
    // Hardening
    const hardeningStartRecommended = new Date(nursingEnd);
    hardeningStartRecommended.setDate(hardeningStartRecommended.getDate() - 14); // 14 giorni prima fine nursing
    let hardeningStatus = 'NotStarted';
    let hardeningStart = null;
    let hardeningEnd = null;
    if (batch.phase === 'Hardening' || batch.phase === 'ReadyToTransplant') {
        hardeningStatus = batch.phase === 'ReadyToTransplant' ? 'Ready' : 'InProgress';
        hardeningStart = hardeningStartRecommended;
        hardeningEnd = new Date(nursingEnd);
    } else if (daysSinceSowing >= avgGerminationDays + nursingDays - 14) {
        hardeningStatus = 'NotStarted'; // Pronto per iniziare
        hardeningStart = null;
        hardeningEnd = null;
    }
    // Trapianto ottimale
    const baseTransplantDate = new Date(nursingEnd);
    baseTransplantDate.setDate(baseTransplantDate.getDate() + hardeningDays);
    const transplantResult = calculateOptimalTransplantDate(baseTransplantDate, batch, garden, weatherForecast);
    return {
        germination: {
            startDate: germinationStart,
            expectedEndDate: germinationEnd,
            daysRemaining: Math.max(0, avgGerminationDays - daysSinceSowing),
            status: germinationStatus
        },
        nursing: {
            startDate: nursingStart,
            expectedEndDate: nursingEnd,
            daysRemaining: Math.max(0, avgGerminationDays + nursingDays - daysSinceSowing),
            status: nursingStatus,
            leafCount: Math.floor((daysSinceSowing - avgGerminationDays) / 7) // Stima foglie vere
        },
        hardening: {
            startDate: hardeningStart,
            expectedEndDate: hardeningEnd,
            daysRemaining: hardeningEnd ? Math.max(0, Math.floor((hardeningEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : null,
            status: hardeningStatus,
            recommendedStartDate: hardeningStartRecommended
        },
        transplant: transplantResult
    };
};
/**
 * Calcola data trapianto ottimale considerando meteo, luna, temperatura
 */ const calculateOptimalTransplantDate = (baseDate, batch, garden, weatherForecast)=>{
    const reasons = [];
    const warnings = [];
    let recommendedDate = new Date(baseDate);
    let isOptimal = true;
    // Verifica temperatura notturna
    if (weatherForecast && weatherForecast.length > 0) {
        const forecast = weatherForecast[0];
        const masterData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMasterSheet"])(batch.plantName);
        if (masterData && forecast.tempMin !== undefined) {
            const minTemp = masterData.germination.minTemp || 10; // Default 10°C
            if (forecast.tempMin < minTemp) {
                isOptimal = false;
                warnings.push(`Temperatura notturna prevista: ${forecast.tempMin}°C (minimo richiesto: ${minTemp}°C)`);
                // Cerca prossima data con temperatura adeguata
                for(let i = 0; i < Math.min(14, weatherForecast.length); i++){
                    const futureForecast = weatherForecast[i];
                    if (futureForecast.tempMin && futureForecast.tempMin >= minTemp) {
                        recommendedDate = new Date(baseDate);
                        recommendedDate.setDate(recommendedDate.getDate() + i);
                        reasons.push(`Trapianto spostato a ${i} giorni per temperatura adeguata`);
                        break;
                    }
                }
            } else {
                reasons.push(`Temperatura notturna adeguata: ${forecast.tempMin}°C`);
            }
        }
    }
    // Verifica fase lunare
    const moonInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMoonPhase"])(recommendedDate);
    const masterData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMasterSheet"])(batch.plantName);
    if (masterData) {
        const isIdeal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isIdealPhaseFor"])('transplant', masterData.nutrientCategory, recommendedDate);
        if (!isIdeal) {
            // Cerca prossima fase lunare ideale (entro 7 giorni)
            for(let i = 1; i <= 7; i++){
                const testDate = new Date(recommendedDate);
                testDate.setDate(testDate.getDate() + i);
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isIdealPhaseFor"])('transplant', masterData.nutrientCategory, testDate)) {
                    recommendedDate = testDate;
                    reasons.push(`Trapianto spostato per fase lunare ideale`);
                    break;
                }
            }
        } else {
            reasons.push('Fase lunare ideale per trapianto');
        }
    }
    // Verifica stagione
    const season = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$seasonalAdjustment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSeasonForDate"])(recommendedDate, garden.coordinates?.latitude || 0);
    if (season === 'Winter' && masterData && masterData.season !== 'Winter') {
        warnings.push('Trapianto in inverno: considerare protezione o posticipare');
        isOptimal = false;
    }
    return {
        recommendedDate,
        isOptimal,
        reasons,
        warnings
    };
};
const calculateGerminationDays = (plant, temperature, humidity)=>{
    const baseDays = (plant.germination.emergenceDays.min + plant.germination.emergenceDays.max) / 2;
    const optimalTemp = plant.germination.optimalTemp || 20;
    const minTemp = plant.germination.minTemp || 10;
    const maxTemp = plant.germination.maxTemp || 30;
    // Modificatore temperatura
    let tempModifier = 1;
    if (temperature < optimalTemp) {
        // Sotto temperatura ottimale: rallenta
        const diff = optimalTemp - temperature;
        tempModifier = 1 + diff / 10; // +10% per ogni grado sotto
    } else if (temperature > optimalTemp) {
        // Sopra temperatura ottimale: accelera leggermente
        const diff = temperature - optimalTemp;
        tempModifier = Math.max(0.8, 1 - diff / 20); // -5% per ogni grado sopra (min 0.8)
    }
    // Modificatore umidità (ottimale 70-80%)
    let humidityModifier = 1;
    if (humidity < 60) {
        humidityModifier = 1.2; // Rallenta se troppo secco
    } else if (humidity > 90) {
        humidityModifier = 1.1; // Rallenta se troppo umido
    }
    return Math.round(baseDays * tempModifier * humidityModifier);
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/fruitTreeEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateChillHours",
    ()=>calculateChillHours,
    "calculateFruitTreeTasks",
    ()=>calculateFruitTreeTasks,
    "isChillRequirementMet",
    ()=>isChillRequirementMet
]);
const calculateFruitTreeTasks = (tree, treeAge, currentDate = new Date())=>{
    const tasks = [];
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    // 1. POTATURA INVERNALE (Dicembre-Febbraio)
    if (tree.pruningSeasons.includes('Winter') && (currentMonth === 12 || currentMonth === 1 || currentMonth === 2)) {
        const pruningType = treeAge < 3 ? 'Formative' : treeAge > 15 ? 'Rejuvenation' : 'Maintenance';
        tasks.push({
            taskType: 'Pruning',
            priority: 'High',
            message: `Potatura invernale (${pruningType})`,
            dueDate: new Date(currentYear, 0, 15).toISOString().split('T')[0],
            instructions: getPruningInstructions(tree.treeType, pruningType, 'Winter'),
            season: 'Winter',
            pruningType
        });
    }
    // 2. POTATURA ESTIVA (Giugno-Luglio)
    if (tree.pruningSeasons.includes('Summer') && (currentMonth === 6 || currentMonth === 7)) {
        tasks.push({
            taskType: 'Pruning',
            priority: 'Medium',
            message: 'Potatura estiva (controllo vegetazione)',
            dueDate: new Date(currentYear, 5, 15).toISOString().split('T')[0],
            instructions: getPruningInstructions(tree.treeType, 'Maintenance', 'Summer'),
            season: 'Summer',
            pruningType: 'Maintenance'
        });
    }
    // 3. DIradamento FRUTTI (Maggio-Giugno, solo per alberi maturi)
    if (treeAge >= 3 && (currentMonth === 5 || currentMonth === 6)) {
        tasks.push({
            taskType: 'Thinning',
            priority: 'High',
            message: 'Diradamento frutti per migliorare qualità e dimensione',
            dueDate: new Date(currentYear, 4, 20).toISOString().split('T')[0],
            instructions: [
                'Rimuovi frutti piccoli, deformi o danneggiati',
                `Per ${tree.treeType}: mantieni 1 frutto ogni 15-20cm`,
                'Lascia i frutti più grandi e ben formati',
                'Dirada quando i frutti hanno raggiunto 1-2cm di diametro',
                'Questo migliorerà la dimensione e qualità dei frutti rimanenti'
            ]
        });
    }
    // 4. RACCOLTA (Durante harvestWindow)
    const isInHarvestWindow = currentMonth >= tree.harvestWindow.startMonth && currentMonth <= tree.harvestWindow.endMonth || tree.harvestWindow.startMonth > tree.harvestWindow.endMonth && (currentMonth >= tree.harvestWindow.startMonth || currentMonth <= tree.harvestWindow.endMonth);
    if (isInHarvestWindow) {
        tasks.push({
            taskType: 'Harvest',
            priority: 'High',
            message: 'Raccolta frutti maturi',
            dueDate: currentDate.toISOString().split('T')[0],
            instructions: [
                'Raccogli al mattino quando i frutti sono freschi',
                'Verifica maturazione: colore, consistenza, sapore',
                'Usa forbici o raccoglitore per evitare danni',
                'Conserva in contenitori puliti e areati',
                'Raccogli regolarmente per evitare sovramaturazione'
            ]
        });
    }
    // 5. CONCIMAZIONE PRIMAVERILE (Marzo)
    if (currentMonth === 3) {
        tasks.push({
            taskType: 'Fertilization',
            priority: 'Medium',
            message: 'Concimazione primaverile per supportare crescita e fioritura',
            dueDate: new Date(currentYear, 2, 15).toISOString().split('T')[0],
            instructions: [
                'Usa concime bilanciato NPK o organico maturo',
                'Applica 100-150g per mq di proiezione chioma',
                'Distribuisci uniformemente sotto la chioma',
                'Irriga dopo la concimazione',
                'Evita concimazioni tardive che possono ritardare la dormienza invernale'
            ]
        });
    }
    // 6. VERIFICA IMPOLLINAZIONE (Aprile-Maggio, per self-sterile)
    if (tree.pollinationType === 'Self-sterile' && (currentMonth === 4 || currentMonth === 5)) {
        tasks.push({
            taskType: 'PollinationCheck',
            priority: 'High',
            message: 'Verifica presenza impollinatori necessari',
            dueDate: new Date(currentYear, 3, 15).toISOString().split('T')[0],
            instructions: [
                `Questa varietà richiede impollinatori: ${tree.pollinatorVarieties?.join(', ') || 'varietà compatibili'}`,
                'Verifica che gli impollinatori siano in fioritura contemporaneamente',
                'Se mancano impollinatori, pianta varietà compatibili entro 50m',
                'Considera l\'uso di api o altri impollinatori per migliorare la produzione'
            ]
        });
    }
    return tasks;
};
/**
 * Istruzioni di potatura per tipo di albero
 */ function getPruningInstructions(treeType, pruningType, season) {
    const baseInstructions = {
        'Pome': [
            'Rimuovi rami morti, malati o danneggiati',
            'Elimina rami che si incrociano o competono',
            'Apri la chioma per favorire penetrazione luce',
            'Mantieni forma a vaso o piramide',
            'Taglia sopra gemma esterna per favorire crescita verso l\'esterno'
        ],
        'Stone': [
            'Potatura più leggera rispetto ai pomacee',
            'Rimuovi rami che producono frutti piccoli',
            'Favorisci rinnovo di rami fruttiferi',
            'Elimina succhioni vigorosi',
            'Mantieni equilibrio tra vegetazione e produzione'
        ],
        'Citrus': [
            'Potatura leggera, principalmente rimozione rami secchi',
            'Elimina rami che toccano il suolo',
            'Apri la chioma per favorire aereazione',
            'Rimuovi rami interni che non ricevono luce',
            'Mantieni forma naturale arrotondata'
        ]
    };
    const instructions = baseInstructions[treeType] || baseInstructions['Pome'];
    if (pruningType === 'Formative') {
        return [
            ...instructions,
            'Fase formativa: stabilisci struttura principale',
            'Scegli 3-5 rami principali ben distribuiti',
            'Elimina rami troppo bassi (sotto 50cm)',
            'Mantieni angolo di inserzione ampio (45-60°)'
        ];
    }
    if (pruningType === 'Rejuvenation') {
        return [
            ...instructions,
            'Potatura di ringiovanimento: rimuovi 1/3 dei rami vecchi',
            'Favorisci crescita di nuovi rami fruttiferi',
            'Riduci altezza se necessario',
            'Potatura distribuita su 2-3 anni per evitare stress eccessivo'
        ];
    }
    return instructions;
}
const calculateChillHours = (location, altitudeMeters = 0, season = 'winter')=>{
    // Stima approssimativa basata su latitudine e altitudine
    // In Italia, le ore di freddo variano da 200-300 (Sud) a 800-1200 (Nord/Alpi)
    const baseChillHours = location.latitude > 45 ? 800 : location.latitude > 43 ? 500 : 300; // Sud Italia
    // Aggiungi ore per altitudine (circa 50 ore ogni 100m)
    const altitudeBonus = Math.floor(altitudeMeters / 100) * 50;
    return baseChillHours + altitudeBonus;
};
const isChillRequirementMet = (tree, location, altitudeMeters = 0)=>{
    if (!tree.chillHours) {
        return true; // Nessun requisito specificato
    }
    const estimatedChillHours = calculateChillHours(location, altitudeMeters);
    return estimatedChillHours >= tree.chillHours;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/strawberryEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateNextRenovationDate",
    ()=>calculateNextRenovationDate,
    "calculateStrawberryTasks",
    ()=>calculateStrawberryTasks,
    "isOptimalHarvestTime",
    ()=>isOptimalHarvestTime
]);
const calculateStrawberryTasks = (crop, currentDate = new Date())=>{
    const tasks = [];
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    // 1. RUNNER MANAGEMENT (Giugno-Luglio per June-bearing)
    if (crop.varietyType === 'June-bearing' && (currentMonth === 6 || currentMonth === 7)) {
        tasks.push({
            taskType: 'RunnerManagement',
            priority: 'High',
            message: 'Rimuovi stoloni per concentrare energia sui frutti',
            dueDate: new Date(currentYear, currentMonth - 1, 15).toISOString().split('T')[0],
            instructions: [
                'Taglia gli stoloni alla base con cesoie pulite',
                'Rimuovi stoloni ogni 7-10 giorni durante il periodo di produzione',
                'Se vuoi propagare, mantieni solo 2-3 stoloni per pianta madre',
                'Elimina stoloni deboli o malati'
            ]
        });
    }
    // 2. MULCHING INVERNALE (Ottobre-Novembre)
    if (currentMonth === 10 || currentMonth === 11) {
        tasks.push({
            taskType: 'Mulching',
            priority: 'High',
            message: 'Applica pacciamatura invernale per proteggere le piante',
            dueDate: new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0],
            instructions: [
                `Usa ${crop.mulching.material} con spessore di ${crop.mulching.thickness}cm`,
                'Applica pacciamatura dopo il primo gelo leggero',
                'Mantieni la corona della pianta scoperta per evitare marciumi',
                'Rimuovi pacciamatura in primavera quando le temperature si stabilizzano'
            ]
        });
    }
    // 3. RINNOVO IMPIANTO (Luglio per June-bearing)
    if (crop.varietyType === 'June-bearing' && crop.renovationRequired && currentMonth === 7) {
        tasks.push({
            taskType: 'Renovation',
            priority: 'High',
            message: 'Rinnova l\'impianto per mantenere la produttività',
            dueDate: new Date(currentYear, 6, 1).toISOString().split('T')[0],
            instructions: [
                'Taglia le foglie a 5cm dal suolo dopo l\'ultima raccolta',
                'Rimuovi le piante vecchie o deboli',
                'Dirada le piante mantenendo 20-30cm tra loro',
                'Fertilizza con concime ricco di azoto per stimolare nuova crescita',
                'Irriga abbondantemente per favorire la ripresa'
            ]
        });
    }
    // 4. RACCOLTA (Durante harvestWindow)
    const isInHarvestWindow = currentMonth >= crop.harvestWindow.startMonth && currentMonth <= crop.harvestWindow.endMonth || crop.harvestWindow.startMonth > crop.harvestWindow.endMonth && (currentMonth >= crop.harvestWindow.startMonth || currentMonth <= crop.harvestWindow.endMonth);
    if (isInHarvestWindow) {
        tasks.push({
            taskType: 'Harvest',
            priority: 'High',
            message: 'Raccogli fragole mature ogni 2-3 giorni',
            dueDate: currentDate.toISOString().split('T')[0],
            instructions: [
                'Raccogli al mattino quando le fragole sono fresche',
                'Taglia il picciolo con le unghie o forbici, non tirare',
                'Raccogli solo fragole completamente rosse',
                'Rimuovi fragole marce o danneggiate per prevenire malattie',
                'Conserva in contenitori bassi per evitare schiacciamenti'
            ]
        });
    }
    // 5. CONCIMAZIONE PRE-FIORITURA (Marzo-Aprile)
    if (currentMonth === 3 || currentMonth === 4) {
        tasks.push({
            taskType: 'Fertilization',
            priority: 'Medium',
            message: 'Concimazione pre-fioritura per supportare la produzione',
            dueDate: new Date(currentYear, 2, 15).toISOString().split('T')[0],
            instructions: [
                'Usa concime ricco di potassio (K) per favorire fioritura e fruttificazione',
                'Applica 50-80g per mq di concime organico',
                'Evita concimi ad alto contenuto di azoto che favoriscono solo foglie',
                'Irriga dopo la concimazione per favorire l\'assorbimento'
            ]
        });
    }
    return tasks;
};
const isOptimalHarvestTime = (crop, currentDate = new Date())=>{
    const currentMonth = currentDate.getMonth() + 1;
    return currentMonth >= crop.harvestWindow.startMonth && currentMonth <= crop.harvestWindow.endMonth || crop.harvestWindow.startMonth > crop.harvestWindow.endMonth && (currentMonth >= crop.harvestWindow.startMonth || currentMonth <= crop.harvestWindow.endMonth);
};
const calculateNextRenovationDate = (crop, lastRenovationDate)=>{
    if (!crop.renovationRequired || crop.varietyType !== 'June-bearing') {
        return null;
    }
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const renovationMonth = crop.renovationMonth || 7; // Default luglio
    // Se abbiamo una data di rinnovo precedente, calcola il prossimo anno
    if (lastRenovationDate) {
        const lastRenovation = new Date(lastRenovationDate);
        const nextRenovation = new Date(lastRenovation.getFullYear() + 1, renovationMonth - 1, 1);
        return nextRenovation.toISOString().split('T')[0];
    }
    // Altrimenti, calcola per l'anno corrente o prossimo
    const thisYearRenovation = new Date(currentYear, renovationMonth - 1, 1);
    if (currentDate < thisYearRenovation) {
        return thisYearRenovation.toISOString().split('T')[0];
    } else {
        return new Date(currentYear + 1, renovationMonth - 1, 1).toISOString().split('T')[0];
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/exoticFruitEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Exotic Fruit Engine
 * Calculates tasks and advice for exotic/tropical fruits
 */ __turbopack_context__.s([
    "calculateExoticFruitTasks",
    ()=>calculateExoticFruitTasks,
    "checkClimateRequirements",
    ()=>checkClimateRequirements,
    "getGreenhouseManagementTasks",
    ()=>getGreenhouseManagementTasks
]);
const calculateExoticFruitTasks = (crop, garden, currentDate = new Date())=>{
    const tasks = [];
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    // 1. CLIMATE CHECK (High priority if temperature requirements not met)
    if (crop.climateRequirements.minTemp > 10) {
        tasks.push({
            taskType: 'ClimateCheck',
            priority: 'High',
            message: `Verifica temperatura ambiente (min richiesta: ${crop.climateRequirements.minTemp}°C)`,
            dueDate: currentDate.toISOString().split('T')[0],
            instructions: [
                'Monitora temperatura giornaliera',
                `Se temperatura scende sotto ${crop.climateRequirements.minTemp}°C, attiva riscaldamento serra`,
                'Proteggi pianta con teli o spostala in ambiente riscaldato',
                `Temperatura ideale: ${crop.climateRequirements.idealTemp}`
            ],
            climateWarning: true
        });
    }
    // 2. GREENHOUSE MANAGEMENT (if required)
    if (crop.greenhouseRequired) {
        tasks.push({
            taskType: 'GreenhouseManagement',
            priority: 'High',
            message: `Gestione serra per ${crop.commonName}`,
            dueDate: currentDate.toISOString().split('T')[0],
            instructions: [
                `Mantieni temperatura tra ${crop.climateRequirements.idealTemp}`,
                `Gestisci umidità: ${crop.climateRequirements.humidity}`,
                'Ventilazione: apri serra nelle ore calde',
                `Riscaldamento: attiva se temperatura scende sotto ${crop.climateRequirements.minTemp}°C`,
                `Tipo serra richiesta: ${crop.greenhouseType || 'Warm'}`
            ]
        });
    }
    // 3. HARVEST (during harvest window)
    const isInHarvestWindow = currentMonth >= crop.harvestWindow.startMonth && currentMonth <= crop.harvestWindow.endMonth || crop.harvestWindow.startMonth > crop.harvestWindow.endMonth && (currentMonth >= crop.harvestWindow.startMonth || currentMonth <= crop.harvestWindow.endMonth);
    if (isInHarvestWindow) {
        tasks.push({
            taskType: 'Harvest',
            priority: 'Medium',
            message: `Raccolta ${crop.commonName}`,
            dueDate: new Date(currentYear, crop.harvestWindow.startMonth - 1, 15).toISOString().split('T')[0],
            instructions: [
                'Raccogli quando i frutti sono maturi',
                'Verifica segni di maturazione specifici per la varietà',
                'Gestisci con cura per mantenere qualità',
                crop.italianClimateNotes ? `Nota clima italiano: ${crop.italianClimateNotes}` : ''
            ]
        });
    }
    // 4. PRUNING (if tree type and applicable)
    if (crop.treeType === 'Tree' && crop.maturityYears && crop.maturityYears > 0) {
        // Pruning typically in late winter/early spring for tropical fruits
        if (currentMonth === 2 || currentMonth === 3) {
            tasks.push({
                taskType: 'Pruning',
                priority: 'Low',
                message: `Potatura ${crop.commonName}`,
                dueDate: new Date(currentYear, 1, 15).toISOString().split('T')[0],
                instructions: [
                    'Rimuovi rami secchi o danneggiati',
                    'Mantieni forma compatta per coltivazione in serra/vaso',
                    'Disinfetta attrezzi prima e dopo la potatura'
                ]
            });
        }
    }
    return tasks;
};
const checkClimateRequirements = (crop, currentTemp)=>{
    const { minTemp, maxTemp, idealTemp } = crop.climateRequirements;
    if (currentTemp < minTemp) {
        return {
            status: 'Critical',
            message: `Temperatura critica: ${currentTemp}°C (min richiesta: ${minTemp}°C). Proteggi immediatamente!`
        };
    }
    if (currentTemp > maxTemp) {
        return {
            status: 'Warning',
            message: `Temperatura elevata: ${currentTemp}°C (max: ${maxTemp}°C). Aumenta ventilazione.`
        };
    }
    return {
        status: 'Optimal',
        message: `Temperatura ottimale: ${currentTemp}°C (range ideale: ${idealTemp})`
    };
};
const getGreenhouseManagementTasks = (crop)=>{
    if (!crop.greenhouseRequired) {
        return [
            'Serra non richiesta per questa varietà'
        ];
    }
    const tasks = [
        `Tipo serra: ${crop.greenhouseType || 'Warm'}`,
        `Temperatura ideale: ${crop.climateRequirements.idealTemp}`,
        `Umidità: ${crop.climateRequirements.humidity}`,
        'Ventilazione: apri durante le ore calde',
        `Riscaldamento: attiva se temperatura < ${crop.climateRequirements.minTemp}°C`
    ];
    return tasks;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/aromaticEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateAromaticTasks",
    ()=>calculateAromaticTasks,
    "calculateDryingTime",
    ()=>calculateDryingTime,
    "isDryingComplete",
    ()=>isDryingComplete
]);
const calculateAromaticTasks = (crop, currentDate = new Date())=>{
    const tasks = [];
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    // 1. RACCOLTA (basata su harvestTiming)
    // Per "BeforeFlowering", monitorare fioritura e raccogliere prima
    if (crop.harvestTiming === 'BeforeFlowering') {
        tasks.push({
            taskType: 'Harvest',
            priority: 'High',
            message: 'Raccogli prima della fioritura per massimo contenuto di oli essenziali',
            dueDate: currentDate.toISOString().split('T')[0],
            instructions: [
                `Raccogli ${crop.harvestType.toLowerCase()} quando la pianta è in pieno vigore`,
                'Monitora la fioritura: raccogli appena vedi i primi boccioli',
                'Raccogli al mattino dopo che la rugiada è evaporata',
                'Usa forbici pulite per tagliare',
                'Lascia almeno 1/3 della pianta per permettere ricrescita'
            ]
        });
    } else if (crop.harvestTiming === 'DuringFlowering') {
        tasks.push({
            taskType: 'Harvest',
            priority: 'High',
            message: 'Raccogli durante la fioritura per massimo aroma',
            dueDate: currentDate.toISOString().split('T')[0],
            instructions: [
                `Raccogli ${crop.harvestType.toLowerCase()} quando i fiori sono aperti`,
                'Raccogli al mattino quando gli oli essenziali sono al massimo',
                'Raccogli solo fiori completamente aperti',
                'Usa contenitori areati per evitare appassimento'
            ]
        });
    }
    // 2. ESSICCAZIONE (se richiesta, dopo raccolta)
    if (crop.dryingRequired) {
        tasks.push({
            taskType: 'Drying',
            priority: 'High',
            message: 'Essicca il raccolto per conservazione',
            dueDate: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            instructions: [
                `Metodo: ${crop.dryingMethod || 'Air'}`,
                'Raccogli in mazzetti e appendi a testa in giù',
                'Mantieni in ambiente buio, asciutto e areato',
                `Tempo stimato: ${crop.dryingTime || 7 - 14} giorni`,
                'Verifica secco quando le foglie si sbriciolano facilmente',
                'Conserva in contenitori ermetici al buio'
            ]
        });
    }
    // 3. MOLTIPLICAZIONE (Primavera per talee)
    if (crop.multiplicationMethod === 'Cutting' && (currentMonth === 3 || currentMonth === 4)) {
        tasks.push({
            taskType: 'Multiplication',
            priority: 'Medium',
            message: 'Propagazione per talea',
            dueDate: new Date(currentYear, 2, 15).toISOString().split('T')[0],
            instructions: [
                'Preleva talee di 10-15cm da rami giovani e vigorosi',
                'Rimuovi foglie basali, mantieni 2-3 foglie apicali',
                'Immergi la base in ormone radicante (opzionale)',
                'Pianta in terriccio leggero e ben drenato',
                'Mantieni umidità alta con copertura trasparente',
                'Radicazione avviene in 2-4 settimane'
            ]
        });
    }
    // 4. POTATURA POST-RACCOLTA (per erbe perenni)
    if (crop.cropType === 'Aromatic' && (currentMonth === 8 || currentMonth === 9)) {
        tasks.push({
            taskType: 'Pruning',
            priority: 'Medium',
            message: 'Potatura post-raccolta per mantenere forma e vigore',
            dueDate: new Date(currentYear, 7, 15).toISOString().split('T')[0],
            instructions: [
                'Taglia i rami legnosi vecchi',
                'Riduci di 1/3 per favorire nuova crescita',
                'Mantieni forma compatta e areata',
                'Rimuovi fiori appassiti per evitare auto-semina',
                'Non potare troppo tardi per permettere ripresa prima dell\'inverno'
            ]
        });
    }
    // 5. CONSERVAZIONE (dopo essiccazione)
    if (crop.dryingRequired && crop.storageMethod === 'Dried') {
        tasks.push({
            taskType: 'Storage',
            priority: 'Low',
            message: 'Conserva prodotto essiccato correttamente',
            dueDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            instructions: [
                'Verifica che il prodotto sia completamente secco',
                'Rimuovi steli e parti non utilizzabili',
                'Conserva in contenitori ermetici (vetro o metallo)',
                'Etichetta con data di essiccazione',
                'Conserva al buio, in luogo fresco e asciutto',
                'Durata conservazione: 12-24 mesi se ben conservato'
            ]
        });
    }
    return tasks;
};
const calculateDryingTime = (method, humidity, temperature // °C
)=>{
    // Tempo base in giorni
    const baseTime = {
        'Air': 10,
        'Dehydrator': 2,
        'Oven': 1
    };
    let time = baseTime[method] || 10;
    // Modificatori per umidità
    if (humidity > 70) {
        time *= 1.5; // Umidità alta rallenta essiccazione
    } else if (humidity < 40) {
        time *= 0.8; // Umidità bassa accelera
    }
    // Modificatori per temperatura
    if (method === 'Air') {
        if (temperature > 25) {
            time *= 0.9; // Caldo accelera
        } else if (temperature < 15) {
            time *= 1.3; // Freddo rallenta
        }
    }
    return Math.ceil(time);
};
const isDryingComplete = (initialWeight, currentWeight, targetMoistureContent = 10 // % umidità target
)=>{
    const moistureContent = (initialWeight - currentWeight) / initialWeight * 100;
    return moistureContent >= 100 - targetMoistureContent;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/raspberryEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateCanesToRemove",
    ()=>calculateCanesToRemove,
    "calculateRaspberryTasks",
    ()=>calculateRaspberryTasks,
    "isOptimalHarvestTime",
    ()=>isOptimalHarvestTime
]);
const calculateRaspberryTasks = (crop, currentDate = new Date())=>{
    const tasks = [];
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    // 1. RIMOZIONE CANNE ESAURITE (Dopo raccolta per Summer-bearing/Floricane)
    if (crop.varietyType === 'Summer-bearing' && crop.canesType === 'Floricane') {
        // Rimuovi canne floricane dopo la raccolta (agosto-settembre)
        if (currentMonth === 8 || currentMonth === 9) {
            tasks.push({
                taskType: 'CaneRemoval',
                priority: 'High',
                message: 'Rimuovi canne floricane esaurite dopo la raccolta',
                dueDate: new Date(currentYear, 7, 15).toISOString().split('T')[0],
                instructions: [
                    'Taglia alla base tutte le canne che hanno prodotto frutti (floricane)',
                    'Lascia solo le canne primocane nuove (verdi, senza frutti)',
                    'Le primocane produrranno l\'anno prossimo',
                    'Disinfetta le cesoie tra una pianta e l\'altra',
                    'Rimuovi canne deboli, malate o danneggiate'
                ],
                canesType: 'Floricane'
            });
        }
    }
    // 2. POTATURA INVERNALE (Dicembre-Febbraio)
    // Per varietà Summer-bearing: pota le primocane lasciando solo le più vigorose
    // Per varietà Ever-bearing/Fall-bearing: taglia tutte le canne a terra per produzione solo su primocane
    if (currentMonth === 12 || currentMonth === 1 || currentMonth === 2) {
        if (crop.varietyType === 'Summer-bearing') {
            tasks.push({
                taskType: 'Pruning',
                priority: 'High',
                message: 'Potatura invernale: seleziona e lega le canne primocane migliori',
                dueDate: new Date(currentYear, 0, 15).toISOString().split('T')[0],
                instructions: [
                    'Seleziona 4-6 canne primocane più vigorose per pianta',
                    'Taglia le canne deboli, malate o troppo fitte',
                    'Accorcia le canne selezionate a 1.5-2m di altezza',
                    'Lega le canne selezionate al trelis',
                    'Rimuovi tutti i polloni basali eccetto quelli necessari per propagazione',
                    'Mantieni 15-20cm tra le canne per favorire aereazione'
                ],
                canesType: 'Primocane'
            });
        } else if (crop.varietyType === 'Ever-bearing' || crop.varietyType === 'Fall-bearing') {
            // Per varietà rifiorenti: taglia tutte le canne a terra per produzione solo autunnale
            tasks.push({
                taskType: 'Pruning',
                priority: 'High',
                message: 'Potatura invernale: taglia tutte le canne a terra (produzione solo su primocane)',
                dueDate: new Date(currentYear, 0, 15).toISOString().split('T')[0],
                instructions: [
                    'Taglia tutte le canne a livello del suolo',
                    'Questo favorirà produzione solo su canne primocane nuove in autunno',
                    'Rimuovi tutti i detriti e bruciali o compostali lontano dalle piante',
                    'Se vuoi doppia produzione (estate + autunno), mantieni alcune canne floricane',
                    'Disinfetta le cesoie dopo ogni pianta'
                ],
                canesType: 'Primocane'
            });
        }
    }
    // 3. INSTALLAZIONE SUPPORTI (Marzo-Aprile, se necessario)
    if (crop.supportRequired && crop.trainingSystem === 'Trellis' && (currentMonth === 3 || currentMonth === 4)) {
        tasks.push({
            taskType: 'SupportInstallation',
            priority: 'Medium',
            message: 'Verifica e installa supporti (trelis) per le canne',
            dueDate: new Date(currentYear, 2, 1).toISOString().split('T')[0],
            instructions: [
                'Installa pali robusti ogni 3-4m lungo la fila',
                'Posiziona fili orizzontali a 60cm, 120cm e 180cm di altezza',
                'Usa filo zincato o plastificato resistente',
                'Lega le canne ai fili con legacci morbidi (rafia, filo plastificato)',
                'Mantieni le canne verticali per favorire aereazione e raccolta',
                'Verifica che i supporti siano stabili prima della crescita vigorosa'
            ]
        });
    }
    // 4. RACCOLTA (Durante harvestWindow)
    const isInHarvestWindow = currentMonth >= crop.harvestWindow.startMonth && currentMonth <= crop.harvestWindow.endMonth || crop.harvestWindow.startMonth > crop.harvestWindow.endMonth && (currentMonth >= crop.harvestWindow.startMonth || currentMonth <= crop.harvestWindow.endMonth);
    if (isInHarvestWindow) {
        tasks.push({
            taskType: 'Harvest',
            priority: 'High',
            message: 'Raccogli lamponi maturi ogni 2-3 giorni',
            dueDate: currentDate.toISOString().split('T')[0],
            instructions: [
                'Raccogli al mattino quando i frutti sono freschi e sodi',
                'I frutti maturi si staccano facilmente dal ricettacolo',
                'Raccogli solo frutti completamente maturi (non raccogliere acerbi)',
                'Usa contenitori bassi per evitare schiacciamenti',
                'Rimuovi frutti marci o danneggiati per prevenire malattie',
                'Raccogli regolarmente (ogni 2-3 giorni) durante la stagione',
                'Conserva in frigorifero subito dopo la raccolta'
            ],
            canesType: crop.canesType
        });
    }
    // 5. CONCIMAZIONE PRIMAVERILE (Marzo-Aprile)
    if (currentMonth === 3 || currentMonth === 4) {
        tasks.push({
            taskType: 'Fertilization',
            priority: 'Medium',
            message: 'Concimazione primaverile per supportare crescita canne',
            dueDate: new Date(currentYear, 2, 15).toISOString().split('T')[0],
            instructions: [
                'Usa concime bilanciato NPK (es. 10-10-10) o organico maturo',
                'Applica 50-80g per pianta di concime',
                'Distribuisci uniformemente intorno alla base della pianta',
                'Lavora leggermente nel terreno e irriga dopo',
                'Evita concimi ad alto contenuto di azoto che favoriscono solo vegetazione'
            ]
        });
    }
    // 6. PROPAGAZIONE (Ottobre-Novembre o Marzo-Aprile)
    if (crop.propagationMethod === 'Suckers' && (currentMonth === 10 || currentMonth === 11 || currentMonth === 3 || currentMonth === 4)) {
        tasks.push({
            taskType: 'Propagation',
            priority: 'Low',
            message: 'Propagazione: rimuovi polloni basali per nuovi impianti',
            dueDate: new Date(currentYear, currentMonth === 10 || currentMonth === 11 ? 9 : 2, 15).toISOString().split('T')[0],
            instructions: [
                'Scava intorno ai polloni basali (suckers) che crescono dalla pianta madre',
                'Taglia il collegamento con la pianta madre mantenendo radici',
                'Trapianta i polloni in nuova posizione o vasi',
                'Mantieni terreno umido per favorire radicazione',
                'Rimuovi solo polloni vigorosi e sani',
                'Non rimuovere troppi polloni dalla stessa pianta madre'
            ]
        });
    }
    return tasks;
};
const isOptimalHarvestTime = (crop, currentDate = new Date())=>{
    const currentMonth = currentDate.getMonth() + 1;
    return currentMonth >= crop.harvestWindow.startMonth && currentMonth <= crop.harvestWindow.endMonth || crop.harvestWindow.startMonth > crop.harvestWindow.endMonth && (currentMonth >= crop.harvestWindow.startMonth || currentMonth <= crop.harvestWindow.endMonth);
};
const calculateCanesToRemove = (crop, totalCanes)=>{
    if (crop.varietyType === 'Summer-bearing' && crop.canesType === 'Floricane') {
        // Rimuovi tutte le canne floricane esaurite (circa 50% delle canne totali)
        return Math.floor(totalCanes * 0.5);
    }
    return 0;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/gardenLayoutEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateFootprint",
    ()=>calculateFootprint,
    "calculateMaxPlants",
    ()=>calculateMaxPlants,
    "calculateOptimalDensity",
    ()=>calculateOptimalDensity,
    "checkAllCollisions",
    ()=>checkAllCollisions,
    "checkCollision",
    ()=>checkCollision,
    "checkCompanionSpacing",
    ()=>checkCompanionSpacing,
    "parseSpacing",
    ()=>parseSpacing,
    "suggestInitialPosition",
    ()=>suggestInitialPosition,
    "suggestOptimalLayout",
    ()=>suggestOptimalLayout,
    "suggestRotation",
    ()=>suggestRotation
]);
const parseSpacing = (spacingString)=>{
    const cleaned = spacingString.toLowerCase().trim();
    // Pattern per "Xcm sulla fila, Ycm tra le file"
    const pattern1 = /(\d+)\s*cm\s*(?:sulla|sulle|sul)\s*(?:fila|file).*?(\d+)\s*cm\s*(?:tra|fra)\s*(?:le\s*)?(?:file|fila)/;
    const match1 = cleaned.match(pattern1);
    if (match1) {
        return {
            row: parseInt(match1[1], 10),
            between: parseInt(match1[2], 10)
        };
    }
    // Pattern per "X-Ycm" (assume stesso valore per entrambi)
    const pattern2 = /(\d+)(?:\s*-\s*(\d+))?\s*cm/;
    const match2 = cleaned.match(pattern2);
    if (match2) {
        const val1 = parseInt(match2[1], 10);
        const val2 = match2[2] ? parseInt(match2[2], 10) : val1;
        return {
            row: Math.min(val1, val2),
            between: Math.max(val1, val2)
        };
    }
    // Pattern semplice per singolo numero
    const pattern3 = /(\d+)/;
    const match3 = cleaned.match(pattern3);
    if (match3) {
        const val = parseInt(match3[1], 10);
        return {
            row: val,
            between: val
        };
    }
    // Default
    console.warn(`Impossibile parsare spacing: "${spacingString}". Uso valori di default 30cm.`);
    return {
        row: 30,
        between: 30
    };
};
const calculateFootprint = (masterData)=>{
    const spacing = parseSpacing(masterData.transplanting.spacing);
    // L'ingombro è basato sulla distanza di trapianto
    // Usiamo la distanza maggiore tra row e between come diametro base
    const maxSpacing = Math.max(spacing.row, spacing.between);
    // Il footprint è un cerchio con raggio = metà della distanza maggiore
    // Questo garantisce che due piante non si sovrappongano
    const radius = maxSpacing / 2;
    return {
        width: maxSpacing,
        height: maxSpacing,
        radius
    };
};
/**
 * Calcola la distanza tra due punti nella griglia
 */ const calculateDistance = (pos1, pos2)=>{
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
};
const checkCollision = (task1, task2, masterData1, masterData2)=>{
    if (!task1.gridPosition || !task2.gridPosition) {
        return {
            hasCollision: false,
            distance: Infinity,
            minRequired: 0
        };
    }
    const footprint1 = calculateFootprint(masterData1);
    const footprint2 = calculateFootprint(masterData2);
    // Distanza minima richiesta: somma dei raggi
    const minRequired = footprint1.radius + footprint2.radius;
    // Distanza effettiva
    const distance = calculateDistance(task1.gridPosition, task2.gridPosition);
    const hasCollision = distance < minRequired;
    let message;
    if (hasCollision) {
        const deficit = minRequired - distance;
        message = `Troppo vicine! ${task1.plantName} e ${task2.plantName} sono a ${distance.toFixed(0)}cm ma servono almeno ${minRequired.toFixed(0)}cm. Sposta di almeno ${deficit.toFixed(0)}cm.`;
    }
    return {
        hasCollision,
        distance,
        minRequired,
        message
    };
};
const checkAllCollisions = (task, allTasks, masterDataMap)=>{
    if (!task.gridPosition) return [];
    const masterData1 = masterDataMap.get(task.plantName);
    if (!masterData1) return [];
    const collisions = [];
    for (const otherTask of allTasks){
        if (otherTask.id === task.id || !otherTask.gridPosition) continue;
        const masterData2 = masterDataMap.get(otherTask.plantName);
        if (!masterData2) continue;
        const collision = checkCollision(task, otherTask, masterData1, masterData2);
        if (collision.hasCollision) {
            collisions.push({
                task: otherTask,
                collision
            });
        }
    }
    return collisions;
};
const suggestRotation = (masterData, gardenWidth, gardenHeight // Altezza orto in cm
)=>{
    const spacing = parseSpacing(masterData.transplanting.spacing);
    // Se la distanza tra le file è maggiore, orienta le file orizzontalmente (0°)
    // Se la distanza sulla fila è maggiore, orienta le file verticalmente (90°)
    if (spacing.between > spacing.row) {
        // File orizzontali (piante in riga)
        return 0;
    } else {
        // File verticali (piante in colonna)
        return 90;
    }
};
const suggestInitialPosition = (task, allTasks, masterData, gardenWidth, gardenHeight)=>{
    const footprint = calculateFootprint(masterData);
    const spacing = parseSpacing(masterData.transplanting.spacing);
    // Inizia da una posizione sicura (margine)
    const margin = footprint.radius + 20; // 20cm di margine
    // Prova posizioni in griglia
    for(let y = margin; y < gardenHeight - margin; y += spacing.between){
        for(let x = margin; x < gardenWidth - margin; x += spacing.row){
            const testPosition = {
                x,
                y
            };
            const testTask = {
                ...task,
                gridPosition: testPosition
            };
            // Verifica collisioni (dovremmo avere masterDataMap, ma per semplicità controlliamo solo posizione)
            let hasCollision = false;
            for (const otherTask of allTasks){
                if (!otherTask.gridPosition) continue;
                const distance = calculateDistance(testPosition, otherTask.gridPosition);
                if (distance < footprint.radius * 2) {
                    hasCollision = true;
                    break;
                }
            }
            if (!hasCollision) {
                return {
                    x,
                    y,
                    rotation: suggestRotation(masterData, gardenWidth, gardenHeight)
                };
            }
        }
    }
    // Se non trova spazio, restituisce una posizione centrale
    return {
        x: gardenWidth / 2,
        y: gardenHeight / 2,
        rotation: 0
    };
};
const calculateMaxPlants = (masterData, gardenSizeSqMeters)=>{
    const spacing = parseSpacing(masterData.transplanting.spacing);
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Converti m² in cm²
    const gardenSizeCm = Math.sqrt(gardenSizeSqMeters * 10000);
    // Calcola layout a file
    const plantsPerRow = Math.floor(gardenSizeCm / spacing.row);
    const numRows = Math.floor(gardenSizeCm / spacing.between);
    const maxPlantsRows = plantsPerRow * numRows;
    // Calcola layout quadrato (più compatto)
    const plantsPerSide = Math.floor(gardenSizeCm / spacing.row);
    const maxPlantsSquare = plantsPerSide * plantsPerSide;
    // Scegli il layout migliore
    if (maxPlantsRows > maxPlantsSquare) {
        return {
            maxPlants: maxPlantsRows,
            layout: 'rows',
            efficiency: maxPlantsRows * spacing.row * spacing.between / (gardenSizeCm * gardenSizeCm)
        };
    } else {
        return {
            maxPlants: maxPlantsSquare,
            layout: 'square',
            efficiency: maxPlantsSquare * spacing.row * spacing.row / (gardenSizeCm * gardenSizeCm)
        };
    }
};
const suggestOptimalLayout = (masterData, gardenWidth, gardenHeight)=>{
    const spacing = parseSpacing(masterData.transplanting.spacing);
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const plantsPerRow = Math.floor(gardenWidth / spacing.row);
    const numRows = Math.floor(gardenHeight / spacing.between);
    return `Layout consigliato: ${plantsPerRow} piante per fila × ${numRows} file = ${plantsPerRow * numRows} piante totali`;
};
const calculateOptimalDensity = (masterData, currentQuantity, gardenSizeSqMeters)=>{
    const maxInfo = calculateMaxPlants(masterData, gardenSizeSqMeters);
    const canIncrease = currentQuantity < maxInfo.maxPlants;
    const canDecrease = currentQuantity > maxInfo.maxPlants * 0.8; // Se è oltre l'80% del massimo
    let suggestion = '';
    if (currentQuantity < maxInfo.maxPlants * 0.5) {
        suggestion = `Puoi aumentare fino a ${maxInfo.maxPlants} piante`;
    } else if (currentQuantity > maxInfo.maxPlants) {
        suggestion = `Troppe piante! Massimo consigliato: ${maxInfo.maxPlants}`;
    } else {
        suggestion = `Quantità ottimale: ${currentQuantity} piante su ${maxInfo.maxPlants} possibili`;
    }
    return {
        optimal: maxInfo.maxPlants,
        canIncrease,
        canDecrease,
        suggestion
    };
};
const checkCompanionSpacing = (plant1, plant2, distance // Distanza attuale in cm
)=>{
    const spacing1 = parseSpacing(plant1.transplanting.spacing);
    const spacing2 = parseSpacing(plant2.transplanting.spacing);
    if (!spacing1 || !spacing2) {
        return {
            compatible: true,
            reason: 'Distanze non disponibili'
        };
    }
    // Distanza minima consigliata: media delle distanze sulla fila
    const minDistance = (spacing1.row + spacing2.row) / 2;
    if (distance < minDistance * 0.7) {
        return {
            compatible: false,
            suggestedDistance: minDistance,
            reason: `Distanza troppo ravvicinata. Consigliato almeno ${minDistance}cm`
        };
    }
    return {
        compatible: true,
        reason: 'Distanza adeguata per consociazioni'
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/spaceCalculator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Space Calculator
 * Calcola spazio occupato/disponibile per letti e strutture
 */ __turbopack_context__.s([
    "calculateBedSpace",
    ()=>calculateBedSpace,
    "calculateGardenSpace",
    ()=>calculateGardenSpace,
    "calculateStructureSpace",
    ()=>calculateStructureSpace
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$gardenLayoutEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/gardenLayoutEngine.ts [app-client] (ecmascript)");
;
/**
 * Calcola area per pianta basandosi su spacing
 */ function calculatePlantArea(plant, quantity) {
    // Prova a prendere spacing da baseInstructions o transplanting
    const spacingString = plant.baseInstructions?.spacing || plant.transplanting?.spacing || '30cm x 30cm';
    const spacing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$gardenLayoutEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseSpacing"])(spacingString);
    // Calcola area per pianta in m²
    // Area = row (cm) * between (cm) / 10000
    const areaPerPlant = spacing.row * spacing.between / 10000;
    return {
        areaPerPlant,
        spacing: {
            row: spacing.row,
            between: spacing.between
        }
    };
}
function calculateBedSpace(bed, tasks, masterSheets) {
    // Filtra task associati a questo bed e non completati
    const bedTasks = tasks.filter((t)=>t.bedId === bed.id && !t.completed && t.plantName);
    const totalArea = bed.areaSqMeters || 0;
    let occupiedArea = 0;
    const plants = [];
    // Raggruppa task per pianta
    const plantGroups = new Map();
    bedTasks.forEach((task)=>{
        if (!task.plantName) return;
        const key = task.plantName.toLowerCase();
        const existing = plantGroups.get(key);
        if (existing) {
            existing.count += task.quantity || 1;
        } else {
            plantGroups.set(key, {
                task,
                count: task.quantity || 1
            });
        }
    });
    // Calcola spazio per ogni pianta
    plantGroups.forEach(({ task, count })=>{
        const masterSheet = masterSheets.get(task.plantName.toLowerCase());
        if (!masterSheet) {
            // Se non troviamo il master sheet, usiamo stima conservativa
            console.warn(`Master sheet non trovato per ${task.plantName}, uso stima default`);
            const defaultArea = 0.09; // 30cm x 30cm = 0.09 m²
            const totalAreaForPlant = defaultArea * count;
            occupiedArea += totalAreaForPlant;
            plants.push({
                plantName: task.plantName,
                quantity: count,
                areaPerPlant: defaultArea,
                totalArea: totalAreaForPlant
            });
            return;
        }
        const { areaPerPlant, spacing } = calculatePlantArea(masterSheet, count);
        const totalAreaForPlant = areaPerPlant * count;
        occupiedArea += totalAreaForPlant;
        plants.push({
            plantName: task.plantName,
            quantity: count,
            areaPerPlant,
            totalArea: totalAreaForPlant,
            spacing
        });
    });
    const availableArea = Math.max(0, totalArea - occupiedArea);
    const occupancyPercentage = totalArea > 0 ? occupiedArea / totalArea * 100 : 0;
    return {
        bedId: bed.id,
        bedName: bed.name,
        totalArea,
        occupiedArea,
        availableArea,
        occupancyPercentage,
        plants
    };
}
function calculateGardenSpace(garden, beds, tasks, masterSheets) {
    const totalGardenArea = garden.sizeSqMeters || garden.areaSqMeters || 0;
    // Calcola spazio per ogni letto
    const bedsCalculations = beds.map((bed)=>calculateBedSpace(bed, tasks, masterSheets));
    // Calcola totale spazio letti
    const totalBedsArea = beds.reduce((sum, bed)=>sum + (bed.areaSqMeters || 0), 0);
    // Calcola totale spazio occupato nei letti
    const totalOccupiedArea = bedsCalculations.reduce((sum, calc)=>sum + calc.occupiedArea, 0);
    // Calcola spazio occupato da task senza letto assegnato
    const unassignedTasks = tasks.filter((t)=>!t.bedId && !t.completed && t.plantName);
    let unassignedTasksArea = 0;
    unassignedTasks.forEach((task)=>{
        const masterSheet = masterSheets.get(task.plantName.toLowerCase());
        if (masterSheet) {
            const { areaPerPlant } = calculatePlantArea(masterSheet, task.quantity || 1);
            unassignedTasksArea += areaPerPlant * (task.quantity || 1);
        } else {
            // Stima conservativa
            unassignedTasksArea += 0.09 * (task.quantity || 1);
        }
    });
    const totalAvailableArea = Math.max(0, totalGardenArea - totalOccupiedArea - unassignedTasksArea);
    return {
        totalGardenArea,
        totalBedsArea,
        totalOccupiedArea,
        totalAvailableArea,
        bedsCalculations,
        unassignedTasksArea
    };
}
function calculateStructureSpace(structureType, structureConfig, beds, tasks, masterSheets) {
    // Filtra letti associati a questa struttura
    const structureBeds = beds.filter((b)=>b.structureType === structureType || b.bedType === structureType);
    if (structureBeds.length === 0) {
        return null;
    }
    // Calcola spazio totale struttura
    // Per serre/idroponiche, usa le dimensioni dalla config se disponibili
    let totalArea = 0;
    if (structureConfig?.growSpace?.growArea) {
        totalArea = structureConfig.growSpace.growArea;
    } else if (structureConfig?.width && structureConfig?.length) {
        // Converti da cm a m²
        totalArea = structureConfig.width * structureConfig.length / 10000;
    } else {
        // Somma area di tutti i letti associati
        totalArea = structureBeds.reduce((sum, bed)=>sum + (bed.areaSqMeters || 0), 0);
    }
    // Calcola spazio occupato da tutti i letti dentro la struttura
    let occupiedArea = 0;
    const allPlants = [];
    structureBeds.forEach((bed)=>{
        const bedCalc = calculateBedSpace(bed, tasks, masterSheets);
        occupiedArea += bedCalc.occupiedArea;
        allPlants.push(...bedCalc.plants);
    });
    const availableArea = Math.max(0, totalArea - occupiedArea);
    const occupancyPercentage = totalArea > 0 ? occupiedArea / totalArea * 100 : 0;
    return {
        bedId: `structure_${structureType}`,
        bedName: `Struttura ${structureType}`,
        totalArea,
        occupiedArea,
        availableArea,
        occupancyPercentage,
        plants: allPlants
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/nutrientEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateNutrientNeeds",
    ()=>calculateNutrientNeeds
]);
const calculateNutrientNeeds = (plant, daysActive, soilType = 'Loamy' // Default
)=>{
    // 1. DETERMINAZIONE FASE FENOLOGICA (Algoritmo Semplificato)
    // Establishment: Radicazione (primi 20gg)
    // Vegetative: Crescita fogliare (20-50gg)
    // Reproductive: Fiori/Frutti (50gg+)
    let phase = 'Vegetative';
    if (daysActive <= 20) {
        phase = 'Establishment';
    } else if (daysActive > 20 && daysActive <= 50) {
        phase = 'Vegetative';
    } else {
        phase = 'Reproductive';
    }
    // Eccezione per colture veloci (Lattughe, Rapanelli)
    if (plant.nutrientCategory === 'LEAFY' || plant.nutrientCategory === 'ROOT') {
        if (daysActive > 40) phase = 'Reproductive'; // Maturazione finale
    }
    // 2. CALCOLO FABBISOGNO (Matrice Categoria x Fase)
    let element = 'None';
    let title = '';
    let body = '';
    switch(plant.nutrientCategory){
        case 'FRUITING':
            if (phase === 'Establishment') {
                element = 'P';
                title = 'Supporto Radicale';
                body = 'La pianta si sta stabilizzando. Se non hai concimato al trapianto, usa un fertilizzante bilanciato ricco di Fosforo.';
            } else if (phase === 'Vegetative') {
                element = 'N';
                title = 'Spinta Vegetativa';
                body = 'La pianta sta costruendo la struttura. Serve Azoto (es. macerato di ortica o sangue di bue) per sostenere foglie e fusti.';
            } else {
                element = 'K';
                title = 'Supporto Fruttificazione';
                body = 'Fase critica: riduci l\'Azoto (farebbe solo foglie) e aumenta il Potassio (es. cenere o concime specifico) per dare sapore ai frutti.';
            }
            break;
        case 'LEAFY':
            if (daysActive > 60) {
                element = 'None';
                title = 'Sospensione Pre-Raccolta';
                body = 'Sospendi le concimazioni per evitare l\'accumulo di nitrati nelle foglie prima della raccolta.';
            } else {
                element = 'N';
                title = 'Mantenimento Fogliare';
                body = 'Fornisci Azoto in modo costante ma leggero per mantenere le foglie tenere e verdi.';
            }
            break;
        case 'ROOT':
            if (phase === 'Establishment') {
                element = 'P';
                title = 'Sviluppo Radicale';
                body = 'Il Fosforo è cruciale ora per l\'attecchimento.';
            } else {
                element = 'K';
                title = 'Ingrossamento Radice';
                body = 'Evita eccessi di Azoto che favoriscono la parte aerea. Il Potassio aiuta l\'ingrossamento del bulbo/radice.';
            }
            break;
        case 'LEGUME':
            element = 'None';
            title = 'Autosufficienza';
            body = 'Le leguminose fissano l\'azoto da sole. Non concimare, o usa solo un po\' di cenere (Potassio) se il terreno è molto povero.';
            break;
        default:
            element = 'None';
            title = 'Monitoraggio';
            body = 'Mantieni il terreno pulito dalle infestanti.';
    }
    // 3. LOGICA TERRENO (Soil Modifier)
    let soilNote = '';
    if (soilType === 'Sandy') {
        // Terreno Sabbioso: Perde acqua e nutrienti velocemente
        soilNote = '⚠️ Suolo Sabbioso: I nutrienti vengono dilavati via rapidamente. Dividi la dose consigliata a metà e dalla con frequenza doppia (es. ogni settimana invece che ogni due). Usa pacciamatura per trattenere umidità.';
    } else if (soilType === 'Clay') {
        // Terreno Argilloso: Trattiene nutrienti, rischio asfissia
        soilNote = '⚠️ Suolo Argilloso: Il terreno trattiene bene i nutrienti. Puoi dare la dose piena meno frequentemente. Importante: zappa leggermente la superficie (sarchiatura) per evitare che si formi la crosta dura.';
    } else {
        // Medio impasto (Loamy) o altri
        soilNote = 'Il tuo terreno ha una buona ritenzione. Segui le dosi standard.';
    }
    return {
        shouldFertilize: element !== 'None',
        elementFocus: element,
        adviceTitle: title,
        adviceBody: body,
        soilNote,
        phase
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/healthEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateHealthStrategy",
    ()=>calculateHealthStrategy,
    "calculateNextTreatmentDate",
    ()=>calculateNextTreatmentDate,
    "calculateWindEffect",
    ()=>calculateWindEffect,
    "getAvailableProducts",
    ()=>getAvailableProducts,
    "getCurrentSeason",
    ()=>getCurrentSeason,
    "getProductById",
    ()=>getProductById,
    "scheduleNextTreatment",
    ()=>scheduleNextTreatment
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$treatments$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/data/treatments.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$seasonalAdjustment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/seasonalAdjustment.ts [app-client] (ecmascript)");
;
;
const getCurrentSeason = (latitude = 0)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$seasonalAdjustment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSeasonForDate"])(new Date(), latitude);
};
const getProductById = (id)=>{
    return __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$treatments$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["protectionProducts"].find((p)=>p.id === id);
};
const calculateNextTreatmentDate = (productId, lastTreatmentDate)=>{
    const product = getProductById(productId);
    if (!product || product.frequencyDays === 0) return undefined;
    const baseDate = lastTreatmentDate ? new Date(lastTreatmentDate) : new Date();
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + product.frequencyDays);
    return nextDate.toISOString().split('T')[0];
};
/**
 * Verifica se un prodotto è disponibile per l'utente
 * in base a patentino e preferenze
 */ function isProductAvailable(product, userProfile) {
    // Se utente preferisce solo bio
    if (userProfile?.preferredTreatmentType === 'organic') {
        return product.allowedInOrganic;
    }
    // Se prodotto richiede patentino, verificare validità
    if (product.requiresLicense) {
        if (!userProfile?.pesticideLicense) {
            return false; // Nessun patentino registrato
        }
        // Verifica validità patentino
        if (!userProfile.pesticideLicense.isValid) {
            return false; // Patentino scaduto o non valido
        }
    }
    return true;
}
const calculateHealthStrategy = (plant, daysActive, season, latitude = 0, userProfile)=>{
    const currentSeason = season || getCurrentSeason(latitude);
    // Filtra prodotti disponibili in base a patentino e preferenze
    const availableProducts = __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$treatments$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["protectionProducts"].filter((product)=>isProductAvailable(product, userProfile));
    // 1. STRATEGIA GENERICA DI RINFORZO (Tutti) - Post-trapianto
    if (daysActive < 14) {
        const propoli = availableProducts.find((p)=>p.id === 'propoli');
        if (propoli) {
            return {
                productToUse: 'Propoli o Alghe',
                productId: 'propoli',
                reason: 'Aiuta a superare lo stress da trapianto e stimola le difese naturali della pianta.',
                priority: 'Low',
                actionType: 'Prevent',
                dosage: propoli.dosage,
                applicationNotes: propoli.notes,
                season: currentSeason
            };
        }
    }
    // 2. STRATEGIA PER CUCURBITACEE (Zucchine, Cetrioli, Meloni)
    // Problema principale: Oidio (Mal bianco)
    if (plant.family === 'Cucurbitaceae') {
        if (daysActive > 30 && (currentSeason === 'Spring' || currentSeason === 'Summer')) {
            // Prova prima con Zeolite (bio)
            let zeolite = availableProducts.find((p)=>p.id === 'zeolite');
            if (!zeolite) {
                // Se non disponibile, prova con Azoxystrobin (chimico, richiede patentino)
                zeolite = availableProducts.find((p)=>p.id === 'azoxystrobin');
            }
            if (zeolite) {
                return {
                    productToUse: zeolite.name + (zeolite.requiresLicense ? ' (Richiede Patentino)' : ''),
                    productId: zeolite.id,
                    reason: 'Le cucurbitacee sono soggette a Oidio (mal bianco) quando l\'umidità sale. ' + (zeolite.id === 'zeolite' ? 'La Zeolite asciuga la foglia creando una barriera fisica.' : 'Fungicida sistemico efficace contro Oidio.'),
                    priority: 'High',
                    actionType: 'Prevent',
                    dosage: zeolite.dosage,
                    applicationNotes: zeolite.notes + (zeolite.requiresLicense ? ' ⚠️ Richiede patentino fitosanitario.' : ''),
                    season: currentSeason,
                    nextTreatmentDate: calculateNextTreatmentDate(zeolite.id)
                };
            }
        }
    }
    // 3. STRATEGIA PER SOLANACEE (Pomodori, Melanzane)
    // Problema principale: Peronospora (funghi) e Cimici/Afidi
    if (plant.family === 'Solanaceae') {
        if (currentSeason === 'Spring' && daysActive > 20) {
            // Preferisci Zeolite (bio), poi Rame (bio), poi Azoxystrobin (chimico)
            const zeolite = availableProducts.find((p)=>p.id === 'zeolite');
            const rame = availableProducts.find((p)=>p.id === 'rame');
            const azoxystrobin = availableProducts.find((p)=>p.id === 'azoxystrobin');
            const product = zeolite || rame || azoxystrobin;
            if (product) {
                return {
                    productToUse: product.name + (product.requiresLicense ? ' (Richiede Patentino)' : ''),
                    productId: product.id,
                    reason: 'Prevenzione Peronospora tipica delle piogge primaverili. ' + (product.id === 'zeolite' ? 'La Zeolite è preferibile (biologica).' : product.id === 'rame' ? 'Rame efficace ma rispettare limiti biologici annuali.' : 'Fungicida sistemico efficace.'),
                    priority: 'Medium',
                    actionType: 'Prevent',
                    dosage: product.dosage,
                    applicationNotes: product.notes + (product.requiresLicense ? ' ⚠️ Richiede patentino fitosanitario.' : ''),
                    season: currentSeason,
                    nextTreatmentDate: calculateNextTreatmentDate(product.id)
                };
            }
        }
        if (currentSeason === 'Summer' && daysActive > 40) {
            // Preferisci Neem (bio), poi prodotti chimici se disponibili
            const neem = availableProducts.find((p)=>p.id === 'neem');
            const sapone = availableProducts.find((p)=>p.id === 'sapone_molle');
            const deltametrina = availableProducts.find((p)=>p.id === 'deltametrina');
            if (neem && sapone) {
                return {
                    productToUse: 'Olio di Neem + Sapone Molle',
                    productId: 'neem',
                    reason: 'In estate aumenta la pressione di Cimici e Afidi. Il Neem li rende sterili e repellente. Il sapone molle lava la melata.',
                    priority: 'High',
                    actionType: 'Prevent',
                    dosage: `${neem.dosage} + ${sapone.dosage}`,
                    applicationNotes: 'Applicare al tramonto. Il sapone molle migliora l\'adesione del Neem.',
                    season: currentSeason,
                    nextTreatmentDate: calculateNextTreatmentDate('neem')
                };
            } else if (deltametrina) {
                return {
                    productToUse: deltametrina.name + ' (Richiede Patentino)',
                    productId: 'deltametrina',
                    reason: 'Insetticida ad ampio spettro efficace contro Cimici e Afidi estivi.',
                    priority: 'High',
                    actionType: 'Prevent',
                    dosage: deltametrina.dosage,
                    applicationNotes: deltametrina.notes + ' ⚠️ Richiede patentino fitosanitario.',
                    season: currentSeason,
                    nextTreatmentDate: calculateNextTreatmentDate('deltametrina')
                };
            }
        }
    }
    // 4. STRATEGIA PER BRASSICACEE (Cavoli)
    // Problema: Cavolaia (bruchi)
    if (plant.family === 'Brassicaceae' && daysActive > 20) {
        // Preferisci Bacillus (bio), poi prodotti chimici se disponibili
        const bacillus = availableProducts.find((p)=>p.id === 'bacillus_thuringiensis');
        const deltametrina = availableProducts.find((p)=>p.id === 'deltametrina');
        const product = bacillus || deltametrina;
        if (product) {
            return {
                productToUse: product.name + (product.requiresLicense ? ' (Richiede Patentino)' : ''),
                productId: product.id,
                reason: product.id === 'bacillus_thuringiensis' ? 'Controlla la pagina inferiore delle foglie per uova di Cavolaia (farfalla bianca). Intervenire tempestivamente.' : 'Insetticida ad ampio spettro efficace contro cavolaia e altri lepidotteri.',
                priority: 'Medium',
                actionType: product.id === 'bacillus_thuringiensis' ? 'Monitor' : 'Prevent',
                dosage: product.dosage,
                applicationNotes: product.notes + (product.requiresLicense ? ' ⚠️ Richiede patentino fitosanitario.' : ''),
                season: currentSeason,
                nextTreatmentDate: product.frequencyDays > 0 ? calculateNextTreatmentDate(product.id) : undefined
            };
        }
    }
    // 5. Logica basata su suscettibilità specifica
    if (plant.susceptibility) {
        const { fungalDiseases, pests, preventiveStrategy, criticalPeriods } = plant.susceptibility;
        // Controlla se siamo in un periodo critico
        let isCriticalPeriod = false;
        let criticalRisk = 'Low';
        if (criticalPeriods && criticalPeriods.length > 0) {
            for (const period of criticalPeriods){
                if (period.season === currentSeason && daysActive >= period.daysActive.min && daysActive <= period.daysActive.max) {
                    isCriticalPeriod = true;
                    criticalRisk = period.risk;
                    break;
                }
            }
        }
        // Se alta suscettibilità e pianta adulta o periodo critico
        if (preventiveStrategy === 'HIGH' && (daysActive > 30 || isCriticalPeriod)) {
            // Priorità a funghi se presenti e in stagione umida
            if (fungalDiseases.length > 0 && (currentSeason === 'Spring' || currentSeason === 'Summer')) {
                const zeolite = availableProducts.find((p)=>p.id === 'zeolite');
                const azoxystrobin = availableProducts.find((p)=>p.id === 'azoxystrobin');
                const product = zeolite || azoxystrobin;
                if (product) {
                    const priority = isCriticalPeriod && criticalRisk === 'High' ? 'High' : 'Medium';
                    return {
                        productToUse: product.name + (product.requiresLicense ? ' (Richiede Patentino)' : ''),
                        productId: product.id,
                        reason: `Prevenzione ${fungalDiseases.join(', ')}. ` + (product.id === 'zeolite' ? 'La Zeolite crea una barriera fisica protettiva.' : 'Fungicida sistemico efficace.'),
                        priority,
                        actionType: 'Prevent',
                        dosage: product.dosage,
                        applicationNotes: product.notes + (product.requiresLicense ? ' ⚠️ Richiede patentino fitosanitario.' : ''),
                        season: currentSeason,
                        nextTreatmentDate: calculateNextTreatmentDate(product.id)
                    };
                }
            }
            // Priorità a parassiti se presenti e in estate
            if (pests.length > 0 && currentSeason === 'Summer' && daysActive > 30) {
                const neem = availableProducts.find((p)=>p.id === 'neem');
                const deltametrina = availableProducts.find((p)=>p.id === 'deltametrina');
                const product = neem || deltametrina;
                if (product) {
                    const priority = isCriticalPeriod && criticalRisk === 'High' ? 'High' : 'Medium';
                    return {
                        productToUse: product.name + (product.requiresLicense ? ' (Richiede Patentino)' : ''),
                        productId: product.id,
                        reason: `Prevenzione ${pests.join(', ')}. ` + (product.id === 'neem' ? 'Il Neem agisce come repellente e interferisce con il ciclo riproduttivo.' : 'Insetticida ad ampio spettro efficace.'),
                        priority,
                        actionType: 'Prevent',
                        dosage: product.dosage,
                        applicationNotes: product.notes + (product.requiresLicense ? ' ⚠️ Richiede patentino fitosanitario.' : ''),
                        season: currentSeason,
                        nextTreatmentDate: calculateNextTreatmentDate(product.id)
                    };
                }
            }
        }
        // Se media suscettibilità, suggerisce solo in periodi critici
        if (preventiveStrategy === 'MEDIUM' && isCriticalPeriod) {
            if (fungalDiseases.length > 0) {
                const zeolite = availableProducts.find((p)=>p.id === 'zeolite');
                const azoxystrobin = availableProducts.find((p)=>p.id === 'azoxystrobin');
                const product = zeolite || azoxystrobin;
                if (product) {
                    return {
                        productToUse: product.name + (product.requiresLicense ? ' (Richiede Patentino)' : ''),
                        productId: product.id,
                        reason: `Periodo critico per ${fungalDiseases.join(', ')}. Prevenzione consigliata.`,
                        priority: criticalRisk === 'High' ? 'High' : 'Medium',
                        actionType: 'Prevent',
                        dosage: product.dosage,
                        applicationNotes: product.notes + (product.requiresLicense ? ' ⚠️ Richiede patentino fitosanitario.' : ''),
                        season: currentSeason,
                        nextTreatmentDate: calculateNextTreatmentDate(product.id)
                    };
                }
            }
            if (pests.length > 0) {
                const neem = availableProducts.find((p)=>p.id === 'neem');
                const deltametrina = availableProducts.find((p)=>p.id === 'deltametrina');
                const product = neem || deltametrina;
                if (product) {
                    return {
                        productToUse: product.name + (product.requiresLicense ? ' (Richiede Patentino)' : ''),
                        productId: product.id,
                        reason: `Periodo critico per ${pests.join(', ')}. Prevenzione consigliata.`,
                        priority: criticalRisk === 'High' ? 'High' : 'Medium',
                        actionType: 'Prevent',
                        dosage: product.dosage,
                        applicationNotes: product.notes + (product.requiresLicense ? ' ⚠️ Richiede patentino fitosanitario.' : ''),
                        season: currentSeason,
                        nextTreatmentDate: calculateNextTreatmentDate(product.id)
                    };
                }
            }
        }
        // Se bassa suscettibilità, suggerisce solo se esplicitamente necessario (periodo critico con rischio alto)
        if (preventiveStrategy === 'LOW' && isCriticalPeriod && criticalRisk === 'High') {
            if (fungalDiseases.length > 0 || pests.length > 0) {
                const propoli = availableProducts.find((p)=>p.id === 'propoli');
                if (propoli) {
                    return {
                        productToUse: 'Propoli Agricola',
                        productId: 'propoli',
                        reason: `Rinforzo delle difese naturali durante periodo critico.`,
                        priority: 'Low',
                        actionType: 'Prevent',
                        dosage: propoli.dosage,
                        applicationNotes: propoli.notes,
                        season: currentSeason,
                        nextTreatmentDate: calculateNextTreatmentDate('propoli')
                    };
                }
            }
        }
    }
    return null;
};
function getAvailableProducts(userProfile) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$treatments$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["protectionProducts"].filter((product)=>isProductAvailable(product, userProfile));
}
const scheduleNextTreatment = (taskId, productId, lastTreatmentDate, gardenId, plantName, variety)=>{
    const product = getProductById(productId);
    if (!product || product.frequencyDays === 0) {
        return null; // Prodotto non trovato o non ricorrente
    }
    // Calcola prossima data
    const nextDate = calculateNextTreatmentDate(productId, lastTreatmentDate);
    if (!nextDate) {
        return null;
    }
    // Crea nuovo task
    const nextTask = {
        id: crypto.randomUUID(),
        gardenId,
        plantName,
        variety,
        taskType: 'Treatment',
        treatmentProductId: productId,
        date: nextDate,
        completed: false,
        notes: `Trattamento ricorrente: ${product.name}. ${product.notes || ''}`
    };
    return nextTask;
};
const calculateWindEffect = (windProtection, plant)=>{
    if (!windProtection) {
        return {
            risk: 'LOW',
            message: '✅ Circolazione aria non specificata. Assumendo condizioni normali.'
        };
    }
    if (windProtection === 'Low') {
        // Ristagno aria = funghi
        const fungiRisk = plant.susceptibility?.fungalDiseases && plant.susceptibility.fungalDiseases.length > 0;
        if (fungiRisk) {
            return {
                risk: 'HIGH',
                message: `⚠️ Bassa circolazione aria + pianta suscettibile = alto rischio Oidio/Peronospora.`,
                action: 'Aumenta frequenza trattamenti preventivi (Zeolite ogni 10gg invece di 20gg). Applica trattamenti al mattino quando l\'aria è più secca.',
                improvement: 'Considera ventilatore solare, pota vegetazione circostante, o installa frangivento parziale per migliorare circolazione senza bloccare completamente il vento.'
            };
        }
        // Anche senza funghi specifici, ristagno aria è problematico
        return {
            risk: 'MEDIUM',
            message: 'Bassa circolazione aria può favorire sviluppo di malattie fungine.',
            action: 'Monitora attentamente segni di funghi (macchie fogliari, muffa). Trattamenti preventivi consigliati.',
            improvement: 'Migliora circolazione aria potando vegetazione circostante o installando ventilatore.'
        };
    }
    if (windProtection === 'High') {
        // Vento forte = stress meccanico + evapotraspirazione
        const isTallPlant = plant.family === 'Solanaceae' || // Pomodori, peperoni
        plant.family === 'Cucurbitaceae' || // Zucchine rampicanti
        plant.commonName.toUpperCase().includes('FAGIOLO') || plant.commonName.toUpperCase().includes('PISELLO');
        if (isTallPlant) {
            return {
                risk: 'MEDIUM',
                message: 'Vento forte: stress meccanico e disidratazione accelerata per piante alte.',
                action: 'Tutoraggio obbligatorio per piante alte. Aumenta irrigazione del 20% per compensare evapotraspirazione. Lega i fusti ai tutori con rafia o legacci morbidi.',
                improvement: 'Installa frangivento o siepe protettiva a 2-3 metri di distanza per ridurre velocità vento senza eliminarlo completamente.'
            };
        }
        // Piante basse ma comunque stressate
        return {
            risk: 'MEDIUM',
            message: 'Vento forte può causare disidratazione e stress meccanico.',
            action: 'Aumenta frequenza irrigazione del 15-20%. Proteggi piante giovani con teli o campane.',
            improvement: 'Considera frangivento parziale per ridurre velocità vento.'
        };
    }
    // Medium = condizioni ottimali
    return {
        risk: 'LOW',
        message: '✅ Circolazione aria ottimale. Vento moderato previene ristagno senza causare stress eccessivo.'
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/compostEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "determineWasteDisposal",
    ()=>determineWasteDisposal,
    "isCompostMature",
    ()=>isCompostMature,
    "suggestHumusAddition",
    ()=>suggestHumusAddition
]);
const determineWasteDisposal = (plant, healthStatus = 'Unknown', hasSeeds = false, isWoody = false)=>{
    // Piante malate → Rifiuto secco (patogeni sopravvivono nel compost)
    if (healthStatus === 'Diseased') {
        return {
            disposalType: 'DryWaste',
            reason: 'Pianta malata: i patogeni sopravviverebbero nel compost e potrebbero infettare altre piante',
            instructions: [
                'Rimuovi la pianta intera',
                'Non compostare: metti nel rifiuto secco',
                'Pulisci gli attrezzi usati con alcool o candeggina',
                'Evita di piantare la stessa specie nello stesso punto per 2-3 anni'
            ],
            canCompost: false
        };
    }
    // Piante con semi → Rifiuto secco (germineranno come erbacce)
    if (hasSeeds) {
        return {
            disposalType: 'DryWaste',
            reason: 'Pianta con semi: i semi germinerebbero nel compost come erbacce',
            instructions: [
                'Rimuovi la pianta prima che produca semi',
                'Se ha già semi, metti nel rifiuto secco',
                'Se non ha semi, puoi compostare solo le parti verdi'
            ],
            canCompost: false
        };
    }
    // Steli legnosi → Sminuzzare prima di compostare
    if (isWoody) {
        return {
            disposalType: 'ShreddedCompost',
            reason: 'Materiale legnoso: richiede sminuzzamento per decomporre velocemente',
            instructions: [
                'Sminuzza gli steli legnosi con cesoie o trituratore',
                'Aggiungi al compost in strati alternati con materiale verde',
                'Accelera la decomposizione e migliora la struttura del compost'
            ],
            canCompost: true
        };
    }
    // Piante sane → Compostiera
    return {
        disposalType: 'Compost',
        reason: 'Pianta sana: ottima sostanza organica per il compost',
        instructions: [
            'Rimuovi la pianta quando il ciclo è completo',
            'Taglia in pezzi più piccoli se molto grande',
            'Aggiungi al compost in strati alternati con materiale secco (foglie, paglia)',
            'Mantieni umidità e gira periodicamente per accelerare decomposizione'
        ],
        canCompost: true
    };
};
const suggestHumusAddition = (garden, compostMaturityMonths = 0)=>{
    if (!garden.hasCompostBin) {
        return null; // Nessuna compostiera, nessun suggerimento
    }
    if (compostMaturityMonths < 6) {
        return null; // Compost non ancora maturo
    }
    const soilType = garden.soilType || 'Loamy';
    let benefit = '';
    if (soilType === 'Sandy') {
        benefit = 'Migliorerà la ritenzione idrica del terreno sabbioso';
    } else if (soilType === 'Clay') {
        benefit = 'Migliorerà il drenaggio del terreno argilloso';
    } else {
        benefit = 'Migliorerà la struttura e la fertilità del terreno';
    }
    return {
        shouldAdd: true,
        suggestion: `Aggiungi 3-4 manciate di humus maturo nella buca prima del trapianto`,
        benefit
    };
};
const isCompostMature = (compostStartDate)=>{
    const monthsElapsed = (Date.now() - compostStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsElapsed >= 6;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/lifecycleEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateEndOfCycle",
    ()=>calculateEndOfCycle,
    "checkLifecycleStatus",
    ()=>checkLifecycleStatus,
    "generateNextTreatmentTask",
    ()=>generateNextTreatmentTask
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$taskCalculationService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/taskCalculationService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$nutrientEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/nutrientEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$healthEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/healthEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$weatherService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/weatherService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/lunarCalendar.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$altitudeUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/altitudeUtils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$compostEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/compostEngine.ts [app-client] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
/**
 * Determina la fase corrente del ciclo vitale basandosi sui giorni trascorsi
 */ const determineLifecyclePhase = (daysAlive, masterData, task)=>{
    // Se l'utente ha già risposto alle domande, usa lo stato salvato
    if (task.lifecycleState) {
        return task.lifecycleState;
    }
    // Fase 0: Semina (giorno 0)
    if (daysAlive === 0) {
        return 'Sowing';
    }
    // Fase 1: Germinazione (entro il range di emergenceDays)
    if (daysAlive >= masterData.germination.emergenceDays.min && daysAlive <= masterData.germination.emergenceDays.max + 3) {
        // Se l'utente ha già confermato la germinazione, passa a Nursing
        if (task.userResponses?.germinationConfirmed) {
            return 'Nursing';
        }
        return 'Germination';
    }
    // Fase 2: Nursing (dopo germinazione fino a ~30 giorni)
    if (daysAlive > masterData.germination.emergenceDays.max + 3 && daysAlive < 50) {
        return 'Nursing';
    }
    // Fase 3: Hardening (50-60 giorni, preparazione al trapianto)
    if (daysAlive >= 50 && daysAlive < 65) {
        return 'Hardening';
    }
    // Fase 4: Trapianto (60+ giorni, o se taskType è già Transplant)
    if (daysAlive >= 60 || task.taskType === 'Transplant') {
        // Se l'utente ha già trapiantato, passa a Production
        if (task.userResponses?.transplantReady || task.taskType === 'Transplant') {
            return 'Production';
        }
        return 'Transplanting';
    }
    // Fase 5: Produzione (dopo trapianto o 90+ giorni)
    if (daysAlive >= 90) {
        return 'Production';
    }
    // Default: Nursing
    return 'Nursing';
};
/**
 * Genera suggerimenti per la fase di Semina
 */ const generateSowingAdvice = (task, masterData)=>{
    const sowingDate = new Date(task.date);
    const moonInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMoonPhase"])(sowingDate);
    const moonCheck = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isIdealPhaseFor"])('sowing', masterData.nutrientCategory, sowingDate);
    const subTasks = [
        'Assicurati di avere tutti gli strumenti necessari',
        'Mantieni il terreno umido con il nebulizzatore',
        'Controlla la temperatura ideale per la germinazione'
    ];
    let message = `Hai appena seminato ${task.plantName}. ${masterData.baseInstructions.introduction}`;
    let adviceType = 'INFO';
    // Check lunare per semina
    if (!moonCheck.ideal) {
        // Warning specifico per piante che montano a seme facilmente (LEAFY)
        if (masterData.nutrientCategory === 'LEAFY' && moonCheck.daysUntilIdeal) {
            message += ` ⚠️ Attenzione: La luna è ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMoonPhaseName"])(sowingDate)}. Per evitare che ${task.plantName} monti a seme, sarebbe meglio aspettare ${moonCheck.daysUntilIdeal} giorni che la luna diventi Calante.`;
            adviceType = 'WARNING';
            subTasks.unshift(`🌙 ${moonCheck.reason}`);
        } else if (moonCheck.daysUntilIdeal) {
            message += ` 🌙 ${moonCheck.reason}`;
            adviceType = 'WARNING';
            subTasks.unshift(`Luna: ${moonCheck.reason}`);
        }
    } else {
        subTasks.unshift(`🌙 Luna ${moonInfo.name}: ${moonCheck.reason}`);
    }
    return {
        phase: 'Sowing',
        type: adviceType,
        message,
        subTasks
    };
};
/**
 * Genera suggerimenti per la fase di Germinazione
 */ const generateGerminationAdvice = (daysAlive, task, masterData)=>{
    // Se l'utente ha già confermato, non mostrare più
    if (task.userResponses?.germinationConfirmed) {
        return null;
    }
    const isInWindow = daysAlive >= masterData.germination.emergenceDays.min && daysAlive <= masterData.germination.emergenceDays.max;
    if (isInWindow) {
        return {
            phase: 'Germination',
            type: 'CHECK',
            message: `Dovresti vedere i primi germogli tra ${masterData.germination.emergenceDays.min} e ${masterData.germination.emergenceDays.max} giorni. È spuntato qualcosa?`,
            actionYes: 'Ottimo! Passa alla fase Nursing. Cambia l\'irrigazione: non nebulizzare più, dai acqua da sotto nel sottovaso.',
            actionNo: 'Attendi ancora qualche giorno. Mantieni il terreno umido con il nebulizzatore e controlla la temperatura.'
        };
    }
    // Se siamo oltre il range, chiedi comunque
    if (daysAlive > masterData.germination.emergenceDays.max) {
        return {
            phase: 'Germination',
            type: 'WARNING',
            message: `Sono passati ${daysAlive} giorni dalla semina. Hai visto germogliare qualcosa?`,
            actionYes: 'Ottimo! Passa alla fase Nursing.',
            actionNo: 'Controlla le condizioni: temperatura, umidità, profondità di semina. Potrebbe essere necessario riseminare.'
        };
    }
    return null;
};
/**
 * Genera suggerimenti per la fase di Nursing
 */ const generateNursingAdvice = (daysAlive, task, masterData, garden, nutrients, health)=>{
    const subTasks = [];
    // Suggerimento rinvaso intermedio (25-30 giorni)
    if (daysAlive >= 25 && daysAlive <= 35) {
        subTasks.push('Rinvaso intermedio: sposta in un vaso più grande se necessario');
    }
    // Aggiungi suggerimenti nutrizionali
    if (nutrients.shouldFertilize) {
        subTasks.push(`Nutrizione: ${nutrients.adviceTitle} - ${nutrients.adviceBody}`);
    }
    // Aggiungi suggerimenti salute
    if (health) {
        subTasks.push(`Protezione: ${health.productToUse} - ${health.reason}`);
    }
    if (subTasks.length === 0) {
        return null;
    }
    return {
        phase: 'Nursing',
        type: 'TASK',
        message: `Le tue piantine di ${task.plantName} stanno crescendo! Ecco cosa fare ora:`,
        subTasks,
        relatedAdvice: {
            nutrients,
            health: health || undefined
        }
    };
};
/**
 * Genera suggerimenti per la fase di Hardening
 */ const generateHardeningAdvice = (task, masterData)=>{
    return {
        phase: 'Hardening',
        type: 'TASK',
        message: `È il momento di preparare le piantine di ${task.plantName} al trapianto. Inizia l'acclimatazione:`,
        subTasks: [
            'Metti i vasi fuori di giorno per 2-3 ore (evita il sole diretto)',
            'Aumenta gradualmente il tempo all\'aperto ogni giorno',
            'Riporta dentro la sera per proteggere dal freddo notturno',
            'Dopo 3-5 giorni, le piantine saranno pronte per il trapianto definitivo'
        ]
    };
};
/**
 * Genera suggerimenti per la fase di Trapianto
 */ const generateTransplantingAdvice = async (daysAlive, task, masterData, garden, nutrients, health)=>{
    const subTasks = [];
    let warning;
    // Verifica condizioni meteo se abbiamo coordinate
    if (garden.coordinates) {
        const weatherCheck = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$weatherService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkTransplantConditions"])(garden.coordinates.latitude, garden.coordinates.longitude, masterData.transplanting.minTemp);
        if (!weatherCheck.isSuitable) {
            return {
                phase: 'Transplanting',
                type: 'WARNING',
                message: weatherCheck.reason,
                postponeDays: 7,
                subTasks: [
                    'Aspetta che le temperature notturne salgano',
                    'Continua l\'acclimatazione delle piantine',
                    'Prepara il terreno in anticipo'
                ]
            };
        }
    }
    // Correzione per altitudine (migliorata)
    if (garden.altitudeMeters && garden.altitudeMeters > 200) {
        // Determina tipo pianta per ritardo differenziato
        const plantNameUpper = masterData.commonName.toUpperCase();
        let plantType = 'standard';
        if ([
            'LATTUGA',
            'INSALATA',
            'RUCOLA',
            'SPINACIO',
            'RAVANELLO'
        ].some((name)=>plantNameUpper.includes(name))) {
            plantType = 'early';
        } else if ([
            'POMODORO',
            'PEPERONE',
            'MELANZANA',
            'ZUCCHINA',
            'CETRIOLO'
        ].some((name)=>plantNameUpper.includes(name))) {
            plantType = 'late';
        }
        const delayDays = calculateAltitudePlantingDelay(garden.altitudeMeters, plantType);
        const adjustedDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$altitudeUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["adjustPlantingDates"])(new Date(), garden.altitudeMeters, plantType);
        if (delayDays > 0) {
            warning = `⚠️ Altitudine ${garden.altitudeMeters}m: Ritardo consigliato di ${delayDays} giorni per il trapianto rispetto alla costa. Data ottimale: ${adjustedDate.toLocaleDateString('it-IT')}`;
            subTasks.unshift(`🏔️ Correzione altitudine: Aspetta ${delayDays} giorni in più rispetto alla data standard`);
        }
    }
    // Validazione compatibilità terreno
    const soilCompatibility = getSoilCompatibility(masterData.commonName, garden.soilType);
    if (!soilCompatibility.compatible) {
        warning = `${warning || ''} ⚠️ COMPATIBILITÀ TERRENO: ${soilCompatibility.reason || 'Terreno non ottimale per questa pianta'}`.trim();
        if (soilCompatibility.optimalSoilTypes) {
            subTasks.push(`💡 Terreni ottimali: ${soilCompatibility.optimalSoilTypes.join(', ')}. Considera miglioramenti o varietà resistenti.`);
        }
    } else if (soilCompatibility.optimalSoilTypes && garden.soilType && soilCompatibility.optimalSoilTypes.includes(garden.soilType)) {
        subTasks.push(`✅ Terreno ${garden.soilType} ideale per ${masterData.commonName}`);
    }
    // Controllo temperatura suolo (se disponibile)
    if (masterData.transplanting?.minTemp && garden.coordinates) {
        try {
            // Nota: Questo richiede chiamata API meteo, quindi lo lasciamo opzionale
            // Il Director già gestisce questo controllo con dati meteo reali
            subTasks.push(`🌡️ Verifica temperatura suolo: minimo ${masterData.transplanting.minTemp}°C richiesto`);
        } catch (error) {
        // Ignora errori
        }
    }
    // Check lunare per trapianto
    const transplantDate = new Date();
    const moonCheck = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isIdealPhaseFor"])('transplant', masterData.nutrientCategory, transplantDate);
    const moonInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMoonPhase"])(transplantDate);
    if (!moonCheck.ideal && moonCheck.daysUntilIdeal) {
        subTasks.unshift(`🌙 Luna ${moonInfo.name}: ${moonCheck.reason}`);
    // Non bloccare il trapianto, ma avvisare
    } else {
        subTasks.unshift(`🌙 Luna ${moonInfo.name}: ${moonCheck.reason}`);
    }
    // Preparazione terreno
    subTasks.push('Prepara il terreno: zappatura e arieggiatura');
    subTasks.push(`Prepara le buche: ${masterData.transplanting.holeDepth}cm di profondità, ${masterData.transplanting.holeWidth}cm di larghezza`);
    // Suggerimento humus se disponibile
    const humusSuggestion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$compostEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["suggestHumusAddition"])(garden, 6); // Assume compost maturo (6+ mesi)
    if (humusSuggestion?.shouldAdd) {
        subTasks.push(`🌱 ${humusSuggestion.suggestion} - ${humusSuggestion.benefit}`);
    }
    // Concimazione di fondo
    if (nutrients.shouldFertilize) {
        subTasks.push(`Concimazione di fondo: ${nutrients.adviceTitle} - ${nutrients.adviceBody}`);
    }
    // Istruzioni specifiche
    if (masterData.transplanting.buryStem) {
        subTasks.push(`Interra il gambo: ${masterData.transplanting.buryStemInstructions}`);
    }
    if (masterData.transplanting.protectionNeeded) {
        subTasks.push(`Protezione: ${masterData.transplanting.protectionInstructions}`);
    }
    // Aggiungi suggerimenti salute
    if (health) {
        subTasks.push(`Protezione preventiva: ${health.productToUse} - ${health.reason}`);
    }
    return {
        phase: 'Transplanting',
        type: 'TASK',
        message: `Le piantine di ${task.plantName} sono pronte per il trapianto definitivo! Ecco la checklist:`,
        subTasks,
        relatedAdvice: {
            nutrients,
            health: health || undefined
        }
    };
};
const calculateEndOfCycle = (task, masterData)=>{
    // Trova la data di trapianto (se taskType è Transplant, usa quella, altrimenti stima)
    let transplantDate;
    if (task.taskType === 'Transplant') {
        transplantDate = new Date(task.date);
    } else {
        // Stima: 60 giorni dopo semina (media per trapianto)
        transplantDate = new Date(task.date);
        transplantDate.setDate(transplantDate.getDate() + 60);
    }
    // Fine Ciclo = Data Trapianto + harvestWindow.max + 30 giorni buffer
    const endOfCycle = new Date(transplantDate);
    // Estrai giorni massimi da harvestWindow (es. "60-90 giorni" -> 90)
    const harvestWindow = masterData.harvestWindow || '60-90 giorni';
    const harvestDaysMatch = harvestWindow.match(/(\d+)\s*-\s*(\d+)/);
    const maxHarvestDays = harvestDaysMatch ? parseInt(harvestDaysMatch[2], 10) : 90;
    endOfCycle.setDate(endOfCycle.getDate() + maxHarvestDays + 30);
    return endOfCycle;
};
/**
 * Genera suggerimenti per la fase di Produzione
 */ const generateProductionAdvice = (daysAlive, task, masterData, nutrients, health, currentDate, garden)=>{
    const subTasks = [];
    // Monitoraggio maturazione
    subTasks.push('Monitora la maturazione dei frutti/ortaggi');
    subTasks.push('Raccogli regolarmente per stimolare la produzione continua');
    // Check lunare per raccolto
    const harvestDate = new Date();
    const moonCheck = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isIdealPhaseFor"])('harvest', masterData.nutrientCategory, harvestDate);
    const moonInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMoonPhase"])(harvestDate);
    if (moonCheck.ideal) {
        subTasks.unshift(`🌙 Luna ${moonInfo.name}: ${moonCheck.reason} - Momento ideale per raccogliere`);
    } else if (moonCheck.daysUntilIdeal) {
        subTasks.unshift(`🌙 Luna ${moonInfo.name}: ${moonCheck.reason}`);
    }
    // Aggiungi suggerimenti nutrizionali
    if (nutrients.shouldFertilize) {
        subTasks.push(`Nutrizione: ${nutrients.adviceTitle} - ${nutrients.adviceBody}`);
    }
    // Aggiungi suggerimenti salute
    if (health) {
        subTasks.push(`Protezione: ${health.productToUse} - ${health.reason}`);
    }
    // Check fine ciclo
    const endOfCycle = calculateEndOfCycle(task, masterData);
    const daysUntilEnd = Math.floor((endOfCycle.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilEnd <= 7 && daysUntilEnd >= 0) {
        // Fine ciclo imminente
        const wasteAdvice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$compostEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["determineWasteDisposal"])(masterData, 'Unknown', false, false);
        subTasks.push(`⚠️ Fine ciclo tra ${daysUntilEnd} giorni: Prepara la rimozione`);
        subTasks.push(`Smaltimento: ${wasteAdvice.reason}`);
        wasteAdvice.instructions.forEach((instruction)=>{
            subTasks.push(`  → ${instruction}`);
        });
        if (garden.hasCompostBin && wasteAdvice.canCompost) {
            subTasks.push(`✅ Puoi compostare: ${wasteAdvice.instructions.join(', ')}`);
        }
    }
    return {
        phase: 'Production',
        type: daysUntilEnd <= 7 ? 'TASK' : 'INFO',
        message: `Le tue piante di ${task.plantName} sono in produzione! ${daysUntilEnd <= 7 ? `Fine ciclo tra ${daysUntilEnd} giorni.` : 'Continua a monitorare e curare:'}`,
        subTasks,
        relatedAdvice: {
            nutrients,
            health: health || undefined
        }
    };
};
const checkLifecycleStatus = async (task, masterData, garden, currentDate = new Date())=>{
    // Calcola giorni trascorsi
    const daysAlive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$taskCalculationService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateDaysActive"])(task);
    // Determina la fase corrente
    const currentPhase = determineLifecyclePhase(daysAlive, masterData, task);
    // Calcola suggerimenti nutrizionali e di salute
    const nutrients = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$nutrientEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateNutrientNeeds"])(masterData, daysAlive, garden.soilType);
    const health = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$healthEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateHealthStrategy"])(masterData, daysAlive);
    // Genera suggerimenti in base alla fase
    switch(currentPhase){
        case 'Sowing':
            return generateSowingAdvice(task, masterData);
        case 'Germination':
            return generateGerminationAdvice(daysAlive, task, masterData);
        case 'Nursing':
            return generateNursingAdvice(daysAlive, task, masterData, garden, nutrients, health);
        case 'Hardening':
            return generateHardeningAdvice(task, masterData);
        case 'Transplanting':
            return await generateTransplantingAdvice(daysAlive, task, masterData, garden, nutrients, health);
        case 'Production':
            return generateProductionAdvice(daysAlive, task, masterData, nutrients, health, currentDate, garden);
        default:
            return null;
    }
};
const generateNextTreatmentTask = (completedTask, allTasks)=>{
    // Verifica che sia un task di trattamento completato
    if (completedTask.taskType !== 'Treatment' || !completedTask.completed) {
        return null;
    }
    // Verifica che abbia un productId
    if (!completedTask.treatmentProductId) {
        return null;
    }
    // Verifica che non esista già un task futuro per lo stesso prodotto e pianta
    const existingFutureTask = allTasks.find((t)=>t.gardenId === completedTask.gardenId && t.plantName === completedTask.plantName && t.taskType === 'Treatment' && t.treatmentProductId === completedTask.treatmentProductId && !t.completed && new Date(t.date) > new Date(completedTask.date));
    if (existingFutureTask) {
        return null; // Già esiste un task futuro
    }
    // Genera prossimo task
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$healthEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scheduleNextTreatment"])(completedTask.id, completedTask.treatmentProductId, completedTask.date, completedTask.gardenId, completedTask.plantName, completedTask.variety);
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/rainManager.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Rain Management System
 * Calcola acqua piovana effettiva e gestisce skip irrigazione basato su precipitazioni
 */ __turbopack_context__.s([
    "adjustIrrigationForRain",
    ()=>adjustIrrigationForRain,
    "calculateEffectiveRain",
    ()=>calculateEffectiveRain,
    "forecastToRainEvent",
    ()=>forecastToRainEvent
]);
const calculateEffectiveRain = (rainEvents, soilType = 'Loamy')=>{
    const totalMM = rainEvents.reduce((sum, e)=>sum + e.precipitationMM, 0);
    // Fattore assorbimento per tipo terreno
    // Valori basati su capacità di campo e punto di appassimento
    const absorption = {
        'Sandy': 0.5,
        'Loamy': 0.8,
        'Clay': 0.6,
        'Peaty': 0.9,
        'Chalky': 0.4,
        'Silty': 0.75
    };
    const absorptionFactor = absorption[soilType] || 0.7; // Default 70%
    const effectiveMM = totalMM * absorptionFactor;
    // Calcola giorni di skip irrigazione
    // Assumiamo ~5mm di acqua = 1 giorno di irrigazione standard
    const irrigationSkipDays = Math.floor(effectiveMM / 5);
    let message = '';
    if (effectiveMM > 20) {
        message = `☔ Piogge abbondanti (${totalMM.toFixed(1)}mm totali, ${effectiveMM.toFixed(1)}mm effettivi). Sospendi irrigazione per ${irrigationSkipDays} giorni.`;
    } else if (effectiveMM > 10) {
        message = `🌧️ Pioggia moderata (${totalMM.toFixed(1)}mm totali, ${effectiveMM.toFixed(1)}mm effettivi). Riduci irrigazione del 50% per ${irrigationSkipDays} giorni.`;
    } else if (effectiveMM > 5) {
        message = `🌦️ Pioggia leggera (${totalMM.toFixed(1)}mm totali, ${effectiveMM.toFixed(1)}mm effettivi). Irrigazione parziale sufficiente.`;
    } else {
        message = `💧 Pioggia minima (${totalMM.toFixed(1)}mm). Irrigazione normale.`;
    }
    return {
        totalRainfall: totalMM,
        effectiveWater: effectiveMM,
        irrigationSkipDays,
        message
    };
};
const adjustIrrigationForRain = (scheduledTask, weatherHistory, garden)=>{
    // Filtra ultimi 3 giorni con precipitazioni
    const recentRain = weatherHistory.slice(0, 3).filter((f)=>f.rainForecastMm > 0).map((f)=>({
            date: f.date || new Date().toISOString().split('T')[0],
            precipitationMM: f.rainForecastMm,
            duration: 60,
            intensity: f.rainForecastMm > 10 ? 'heavy' : f.rainForecastMm > 5 ? 'moderate' : 'light'
        }));
    if (recentRain.length === 0) {
        return {
            action: 'PROCEED',
            message: 'Nessuna pioggia recente. Irrigazione normale.'
        };
    }
    const rainResult = calculateEffectiveRain(recentRain, garden.soilType);
    // Decisione basata su acqua effettiva
    if (rainResult.effectiveWater > 20) {
        // Pioggia abbondante: cancella irrigazione
        const skipDays = rainResult.irrigationSkipDays;
        const nextDate = new Date(scheduledTask.date);
        nextDate.setDate(nextDate.getDate() + skipDays);
        return {
            action: 'CANCEL',
            message: rainResult.message,
            nextScheduledDate: nextDate
        };
    }
    if (rainResult.effectiveWater > 10) {
        // Pioggia moderata: riduci dose
        const adjustedDuration = scheduledTask.durationMinutes ? scheduledTask.durationMinutes * 0.5 : 15; // Default 15 minuti se non specificato
        return {
            action: 'REDUCE',
            message: rainResult.message,
            adjustedDuration: Math.round(adjustedDuration)
        };
    }
    if (rainResult.effectiveWater > 5) {
        // Pioggia leggera: procedi ma con nota
        return {
            action: 'PROCEED',
            message: rainResult.message
        };
    }
    // Pioggia minima: procedi normalmente
    return {
        action: 'PROCEED',
        message: 'Irrigazione normale.'
    };
};
const forecastToRainEvent = (forecast)=>{
    if (forecast.rainForecastMm <= 0) {
        return null;
    }
    return {
        date: forecast.date || new Date().toISOString().split('T')[0],
        precipitationMM: forecast.rainForecastMm,
        duration: 60,
        intensity: forecast.rainForecastMm > 10 ? 'heavy' : forecast.rainForecastMm > 5 ? 'moderate' : 'light'
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/oliveEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateExpectedOilYield",
    ()=>calculateExpectedOilYield,
    "calculateOliveTasks",
    ()=>calculateOliveTasks,
    "calculateOptimalHarvestDate",
    ()=>calculateOptimalHarvestDate,
    "isMillingUrgent",
    ()=>isMillingUrgent
]);
const calculateOliveTasks = (grove, currentDate = new Date(), weather)=>{
    const tasks = [];
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    // 1. POTATURA INVERNALE (Febbraio-Marzo)
    if (currentMonth === 2 || currentMonth === 3) {
        tasks.push({
            taskType: 'Pruning',
            priority: 'High',
            message: 'Potatura invernale olivo',
            dueDate: new Date(currentYear, 1, 15).toISOString().split('T')[0],
            instructions: [
                'Rimuovi rami secchi, malati o danneggiati',
                'Elimina succhioni e polloni',
                'Apri la chioma per favorire penetrazione luce e aereazione',
                'Mantieni forma a vaso per facilitare raccolta',
                'Riduci altezza se necessario (max 4-5m)',
                'Taglia sopra gemma esterna per favorire crescita verso l\'esterno',
                'Disinfetta attrezzi tra un albero e l\'altro'
            ]
        });
    }
    // 2. CONCIMAZIONE PRE-FIORITURA (Marzo)
    if (currentMonth === 3) {
        tasks.push({
            taskType: 'Fertilization',
            priority: 'Medium',
            message: 'Concimazione pre-fioritura',
            dueDate: new Date(currentYear, 2, 1).toISOString().split('T')[0],
            instructions: [
                'Usa concime organico maturo o NPK bilanciato',
                'Applica 2-3kg per albero adulto',
                'Distribuisci uniformemente sotto la chioma',
                'Lavora leggermente nel terreno',
                'Irriga dopo la concimazione se possibile'
            ]
        });
    }
    // 3. POTATURA VERDE ESTIVA (Giugno-Luglio)
    if (currentMonth === 6 || currentMonth === 7) {
        tasks.push({
            taskType: 'SummerPruning',
            priority: 'Medium',
            message: 'Potatura verde: rimozione succhioni',
            dueDate: new Date(currentYear, 5, 15).toISOString().split('T')[0],
            instructions: [
                'Rimuovi succhioni vigorosi che crescono dal tronco',
                'Elimina polloni basali',
                'Taglia rami che competono con struttura principale',
                'Mantieni operazione leggera, non invasiva',
                'Favorisci aereazione della chioma'
            ]
        });
    }
    // 4. RACCOLTA OLIVE (Ottobre-Dicembre)
    const isInHarvestWindow = currentMonth >= grove.harvestWindow.startMonth && currentMonth <= grove.harvestWindow.endMonth || grove.harvestWindow.startMonth > grove.harvestWindow.endMonth && (currentMonth >= grove.harvestWindow.startMonth || currentMonth <= grove.harvestWindow.endMonth);
    if (isInHarvestWindow) {
        const optimalHarvestDate = calculateOptimalHarvestDate(grove, currentDate, weather);
        tasks.push({
            taskType: 'Harvest',
            priority: 'High',
            message: 'Raccolta olive',
            dueDate: optimalHarvestDate.toISOString().split('T')[0],
            instructions: [
                `Metodo: ${grove.harvestMethod}`,
                'Raccogli quando le olive sono invaiate (50-70% nere)',
                'Evita raccolta con pioggia o umidità elevata',
                'Usa contenitori areati per evitare fermentazione',
                'Raccogli delicatamente per evitare ammaccature',
                'Trasporta rapidamente al frantoio (entro 24-48h)',
                'Non conservare olive in sacchi chiusi per più di 1 giorno'
            ]
        });
    }
    return tasks;
};
const calculateOptimalHarvestDate = (grove, currentDate = new Date(), weather)=>{
    const currentMonth = currentDate.getMonth() + 1;
    // Data base: metà del periodo di raccolta
    const harvestStartMonth = grove.harvestWindow.startMonth;
    const harvestEndMonth = grove.harvestWindow.endMonth;
    let optimalMonth;
    if (harvestStartMonth <= harvestEndMonth) {
        optimalMonth = Math.floor((harvestStartMonth + harvestEndMonth) / 2);
    } else {
        // Periodo che attraversa l'anno (es. ottobre-dicembre)
        optimalMonth = harvestStartMonth;
    }
    // Se siamo già nel periodo di raccolta, usa data corrente o prossima settimana
    if (currentMonth >= harvestStartMonth || currentMonth <= harvestEndMonth) {
        if (weather) {
            // Evita giorni di pioggia
            const daysToAdd = weather.daily?.some((d)=>d.precipitation > 5) ? 3 : 0;
            return new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
        }
        return currentDate;
    }
    // Altrimenti, calcola per il prossimo periodo di raccolta
    const currentYear = currentDate.getFullYear();
    if (currentMonth < harvestStartMonth) {
        return new Date(currentYear, optimalMonth - 1, 15);
    } else {
        return new Date(currentYear + 1, optimalMonth - 1, 15);
    }
};
const calculateExpectedOilYield = (oliveQuantity, oilYieldExpected // kg olio/100kg olive
)=>{
    return oliveQuantity * oilYieldExpected / 100;
};
const isMillingUrgent = (harvestDate, currentDate = new Date())=>{
    const harvest = new Date(harvestDate);
    const hoursSinceHarvest = (currentDate.getTime() - harvest.getTime()) / (1000 * 60 * 60);
    // Urgente se passate più di 24h
    return hoursSinceHarvest > 24;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/vineEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateBrixProgress",
    ()=>calculateBrixProgress,
    "calculateVineTasks",
    ()=>calculateVineTasks,
    "estimateDaysToHarvest",
    ()=>estimateDaysToHarvest,
    "isOptimalHarvestTime",
    ()=>isOptimalHarvestTime,
    "isWinemakingUrgent",
    ()=>isWinemakingUrgent
]);
const calculateVineTasks = (vineyard, currentDate = new Date(), weather)=>{
    const tasks = [];
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    // 1. POTATURA INVERNALE (Dicembre-Febbraio)
    if (currentMonth === 12 || currentMonth === 1 || currentMonth === 2) {
        tasks.push({
            taskType: 'Pruning',
            priority: 'High',
            message: `Potatura invernale (${vineyard.trainingSystem})`,
            dueDate: new Date(currentYear, 0, 15).toISOString().split('T')[0],
            instructions: getPruningInstructions(vineyard.trainingSystem)
        });
    }
    // 2. LEGATURA TRALCI (Marzo)
    if (currentMonth === 3) {
        tasks.push({
            taskType: 'Tying',
            priority: 'High',
            message: 'Legatura tralci al filo',
            dueDate: new Date(currentYear, 2, 15).toISOString().split('T')[0],
            instructions: [
                'Lega i tralci principali al filo portante',
                'Usa legacci morbidi (rafia, filo plastificato)',
                'Non stringere troppo per evitare strozzature',
                'Mantieni forma secondo sistema di allevamento',
                'Lega prima che i tralci diventino troppo rigidi'
            ]
        });
    }
    // 3. SFEMMINELLATURA (Maggio)
    if (currentMonth === 5) {
        tasks.push({
            taskType: 'ShootThinning',
            priority: 'High',
            message: 'Sfemminellatura: rimozione getti ascellari',
            dueDate: new Date(currentYear, 4, 15).toISOString().split('T')[0],
            instructions: [
                'Rimuovi getti ascellari (femminelle) che competono con tralci principali',
                'Lascia solo i getti necessari per produzione',
                'Rimuovi getti deboli, malati o mal posizionati',
                'Opera quando i getti sono ancora teneri (5-10cm)',
                'Mantieni 1-2 getti per nodo principale',
                'Favorisci aereazione e penetrazione luce'
            ]
        });
    }
    // 4. DEFOGLIAZIONE (Luglio-Agosto)
    if (currentMonth === 7 || currentMonth === 8) {
        tasks.push({
            taskType: 'LeafRemoval',
            priority: 'Medium',
            message: 'Defogliazione zona grappoli',
            dueDate: new Date(currentYear, 6, 15).toISOString().split('T')[0],
            instructions: [
                'Rimuovi foglie che coprono i grappoli',
                'Favorisci esposizione diretta al sole per maturazione',
                'Rimuovi solo foglie basali, mantieni foglie apicali',
                'Opera gradualmente per evitare scottature',
                'Mantieni 12-15 foglie per tralcio per fotosintesi',
                'Favorisci aereazione per prevenire malattie fungine'
            ]
        });
    }
    // 5. VENDEMMIA (Monitoraggio Brix)
    const isInHarvestWindow = currentMonth >= vineyard.harvestWindow.startMonth && currentMonth <= vineyard.harvestWindow.endMonth || vineyard.harvestWindow.startMonth > vineyard.harvestWindow.endMonth && (currentMonth >= vineyard.harvestWindow.startMonth || currentMonth <= vineyard.harvestWindow.endMonth);
    if (isInHarvestWindow) {
        const brixProgress = calculateBrixProgress(vineyard, currentDate, weather);
        const isReadyForHarvest = brixProgress >= vineyard.brixTarget;
        tasks.push({
            taskType: 'Harvest',
            priority: isReadyForHarvest ? 'High' : 'Medium',
            message: isReadyForHarvest ? `Vendemmia: Brix target raggiunto (${brixProgress.toFixed(1)}°)` : `Monitoraggio Brix: ${brixProgress.toFixed(1)}° / ${vineyard.brixTarget}° target`,
            dueDate: currentDate.toISOString().split('T')[0],
            instructions: [
                `Brix attuale: ${brixProgress.toFixed(1)}° (target: ${vineyard.brixTarget}°)`,
                isReadyForHarvest ? 'Raccogli immediatamente per qualità ottimale' : 'Continua monitoraggio, raccogli quando raggiungi target',
                `Metodo: ${vineyard.harvestMethod}`,
                'Raccogli al mattino quando le uve sono fresche',
                'Evita raccolta con pioggia o umidità elevata',
                'Usa contenitori areati per evitare schiacciamenti',
                'Trasporta rapidamente per vinificazione (entro 24h per uve bianche)'
            ]
        });
    }
    return tasks;
};
/**
 * Istruzioni di potatura per sistema di allevamento
 */ function getPruningInstructions(trainingSystem) {
    const instructions = {
        'Guyot': [
            'Sistema Guyot: mantieni 1-2 tralci fruttiferi',
            'Taglia tralci dell\'anno precedente, mantieni solo sperone',
            'Lascia 6-8 gemme per tralcio fruttifero',
            'Mantieni sperone con 2-3 gemme per rinnovo',
            'Elimina tralci deboli, malati o mal posizionati',
            'Mantieni forma a cordone semplice o doppio'
        ],
        'Cordon': [
            'Sistema Cordon: potatura a speroni',
            'Mantieni cordone permanente con speroni di 2-3 gemme',
            'Rinnova speroni ogni 2-3 anni',
            'Elimina tralci che escono dal cordone',
            'Mantieni distanza di 20-30cm tra speroni',
            'Favorisci equilibrio vegetazione/produzione'
        ],
        'Pergola': [
            'Sistema Pergola: potatura a rinnovo',
            'Mantieni struttura permanente della pergola',
            'Rinnova tralci fruttiferi ogni anno',
            'Lascia 8-12 gemme per tralcio',
            'Elimina tralci vecchi o deboli',
            'Mantieni copertura uniforme della pergola'
        ],
        'Alberello': [
            'Sistema Alberello: potatura a vaso',
            'Mantieni forma a vaso basso',
            'Lascia 2-3 tralci principali con 4-6 gemme',
            'Rinnova tralci ogni anno',
            'Elimina succhioni e polloni',
            'Mantieni altezza contenuta (max 1.5m)'
        ]
    };
    return instructions[trainingSystem] || instructions['Guyot'];
}
const calculateBrixProgress = (vineyard, currentDate = new Date(), weather)=>{
    const currentMonth = currentDate.getMonth() + 1;
    const harvestStartMonth = vineyard.harvestWindow.startMonth;
    // Stima Brix basata su progressione stagionale
    // Assumiamo che Brix parta da ~15° a inizio agosto e raggiunga target a fine settembre
    let baseBrix = 15; // Brix iniziale stimato
    if (currentMonth >= harvestStartMonth) {
        // Calcolo giorni dall'inizio periodo raccolta
        const harvestStartDate = new Date(currentDate.getFullYear(), harvestStartMonth - 1, 1);
        const daysSinceStart = Math.floor((currentDate.getTime() - harvestStartDate.getTime()) / (1000 * 60 * 60 * 24));
        // Incremento Brix: ~0.2-0.3 gradi al giorno in condizioni normali
        const dailyBrixIncrease = 0.25;
        baseBrix += daysSinceStart * dailyBrixIncrease;
        // Modificatori meteo
        if (weather) {
            // Caldo accelera maturazione
            if (weather.tempMax && weather.tempMax > 25) {
                baseBrix += 0.5;
            }
            // Pioggia può rallentare
            if (weather.rainForecastMm > 10) {
                baseBrix -= 0.3;
            }
        }
    }
    // Limita al target massimo
    return Math.min(baseBrix, vineyard.brixTarget + 2);
};
const isOptimalHarvestTime = (vineyard, currentBrix, currentDate = new Date())=>{
    const currentMonth = currentDate.getMonth() + 1;
    const isInHarvestWindow = currentMonth >= vineyard.harvestWindow.startMonth && currentMonth <= vineyard.harvestWindow.endMonth || vineyard.harvestWindow.startMonth > vineyard.harvestWindow.endMonth && (currentMonth >= vineyard.harvestWindow.startMonth || currentMonth <= vineyard.harvestWindow.endMonth);
    return isInHarvestWindow && currentBrix >= vineyard.brixTarget;
};
const isWinemakingUrgent = (harvestDate, wineType, currentDate = new Date())=>{
    if (wineType === 'White' || wineType === 'Rosé' || wineType === 'Sparkling') {
        const harvest = new Date(harvestDate);
        const hoursSinceHarvest = (currentDate.getTime() - harvest.getTime()) / (1000 * 60 * 60);
        // Urgente se passate più di 12h per uve bianche
        return hoursSinceHarvest > 12;
    }
    // Per uve rosse, meno urgente (entro 48h)
    return false;
};
const estimateDaysToHarvest = (vineyard, currentBrix, currentDate = new Date())=>{
    if (currentBrix >= vineyard.brixTarget) {
        return 0; // Pronto ora
    }
    const brixRemaining = vineyard.brixTarget - currentBrix;
    const dailyBrixIncrease = 0.25; // Gradi Brix al giorno in condizioni normali
    return Math.ceil(brixRemaining / dailyBrixIncrease);
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/hydroponicEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateHydroponicTasks",
    ()=>calculateHydroponicTasks
]);
const calculateHydroponicTasks = (garden, tasks, currentDate = new Date(), readings)=>{
    const tasksAdvice = [];
    if (!garden.hydroponicConfig) return tasksAdvice;
    const config = garden.hydroponicConfig;
    const lastReading = readings && readings.length > 0 ? readings[0] : null;
    const daysSinceLastReading = lastReading ? Math.floor((currentDate.getTime() - new Date(lastReading.readingDate).getTime()) / (1000 * 60 * 60 * 24)) : Infinity;
    // 1. CONTROLLO pH/EC PROGRAMMATO
    const daysSinceLastPhCheck = config.maintenance.lastPhCheck ? Math.floor((currentDate.getTime() - new Date(config.maintenance.lastPhCheck).getTime()) / (1000 * 60 * 60 * 24)) : Infinity;
    if (daysSinceLastPhCheck >= config.maintenance.phCheckFrequencyDays) {
        tasksAdvice.push({
            taskType: 'PhCheck',
            priority: daysSinceLastPhCheck > config.maintenance.phCheckFrequencyDays * 2 ? 'High' : 'Medium',
            message: `Controlla pH e EC della soluzione nutritiva`,
            dueDate: currentDate.toISOString().split('T')[0],
            instructions: [
                `pH target: ${config.nutrientSolution.phTarget}`,
                `EC target: ${config.nutrientSolution.ecTarget} mS/cm`,
                'Usa un misuratore digitale calibrato',
                'Registra i valori nel sistema',
                'Se pH fuori range, aggiusta con pH Up/Down',
                'Se EC troppo bassa, aggiungi nutrienti',
                'Se EC troppo alta, diluisci con acqua'
            ]
        });
    }
    // 2. ALERT PARAMETRI FUORI RANGE
    if (lastReading) {
        const phDiff = Math.abs((lastReading.ph || 0) - config.nutrientSolution.phTarget);
        const ecDiff = Math.abs((lastReading.ec || 0) - config.nutrientSolution.ecTarget);
        if (phDiff > 0.5 || ecDiff > 0.5) {
            tasksAdvice.push({
                taskType: 'Alert',
                priority: phDiff > 1 || ecDiff > 1 ? 'Critical' : 'High',
                message: `⚠️ Parametri fuori range! pH: ${lastReading.ph?.toFixed(2) || 'N/A'}, EC: ${lastReading.ec?.toFixed(2) || 'N/A'} mS/cm`,
                dueDate: currentDate.toISOString().split('T')[0],
                instructions: [
                    phDiff > 0.5 ? `pH devia di ${phDiff.toFixed(2)} dal target (${config.nutrientSolution.phTarget})` : '',
                    ecDiff > 0.5 ? `EC devia di ${ecDiff.toFixed(2)} dal target (${config.nutrientSolution.ecTarget})` : '',
                    'Aggiusta immediatamente i parametri',
                    'Controlla che la pompa funzioni correttamente',
                    'Verifica che non ci siano perdite nel sistema'
                ].filter(Boolean),
                isUrgent: phDiff > 1 || ecDiff > 1
            });
        }
    }
    // 3. CAMBIO SOLUZIONE NUTRITIVA
    const daysSinceLastChange = config.maintenance.lastReservoirChange ? Math.floor((currentDate.getTime() - new Date(config.maintenance.lastReservoirChange).getTime()) / (1000 * 60 * 60 * 24)) : Infinity;
    if (daysSinceLastChange >= config.maintenance.changeFrequencyDays) {
        tasksAdvice.push({
            taskType: 'SolutionChange',
            priority: daysSinceLastChange > config.maintenance.changeFrequencyDays * 1.5 ? 'High' : 'Medium',
            message: `Cambia la soluzione nutritiva (${daysSinceLastChange} giorni dall'ultimo cambio)`,
            dueDate: currentDate.toISOString().split('T')[0],
            instructions: [
                `Svuota completamente il serbatoio (${config.nutrientSolution.reservoirCapacity}L)`,
                'Pulisci il serbatoio con acqua pulita',
                'Prepara nuova soluzione con nutrienti freschi',
                `Imposta pH a ${config.nutrientSolution.phTarget}`,
                `Imposta EC a ${config.nutrientSolution.ecTarget} mS/cm`,
                'Riempi il serbatoio con la nuova soluzione',
                'Registra la data del cambio nel sistema'
            ]
        });
    }
    // 4. CONTROLLO VOLUME SOLUZIONE
    if (lastReading && lastReading.reservoirVolume) {
        const volumePercent = lastReading.reservoirVolume / config.nutrientSolution.reservoirCapacity * 100;
        if (volumePercent < 50) {
            tasksAdvice.push({
                taskType: 'NutrientAdd',
                priority: volumePercent < 30 ? 'High' : 'Medium',
                message: `Volume soluzione basso: ${lastReading.reservoirVolume.toFixed(1)}L (${volumePercent.toFixed(0)}%)`,
                dueDate: currentDate.toISOString().split('T')[0],
                instructions: [
                    'Aggiungi acqua e nutrienti per riportare al volume target',
                    `Volume target: ${config.nutrientSolution.reservoirCapacity}L`,
                    'Mantieni pH e EC nei valori target',
                    'Controlla che non ci siano perdite nel sistema'
                ]
            });
        }
    }
    // 5. PULIZIA SISTEMA (mensile)
    const currentMonth = currentDate.getMonth() + 1;
    if (currentMonth % 1 === 0) {
        tasksAdvice.push({
            taskType: 'SystemClean',
            priority: 'Medium',
            message: 'Pulizia mensile del sistema idroponico',
            dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15).toISOString().split('T')[0],
            instructions: [
                'Svuota e pulisci il serbatoio',
                'Pulisci canali/tubi/pompe',
                'Controlla e pulisci filtri',
                'Verifica che non ci siano ostruzioni',
                'Disinfetta con perossido di idrogeno se necessario',
                'Risciacqua bene prima di riempire con nuova soluzione'
            ]
        });
    }
    // 6. CONTROLLO RADICI (per sistemi NFT/DWC)
    if (config.systemType === 'NFT' || config.systemType === 'DWC') {
        tasksAdvice.push({
            taskType: 'RootCheck',
            priority: 'Low',
            message: 'Controlla lo stato delle radici',
            dueDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            instructions: [
                'Verifica che le radici siano bianche e sane',
                'Controlla che non ci siano radici marce o scure',
                'Assicurati che le radici non ostruiscano i canali (NFT)',
                'Verifica che le radici siano ben ossigenate (DWC)',
                'Se necessario, taglia radici morte o malate'
            ]
        });
    }
    return tasksAdvice;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/aquaponicEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateAquaponicTasks",
    ()=>calculateAquaponicTasks
]);
const calculateAquaponicTasks = (garden, tasks, currentDate = new Date(), readings)=>{
    const tasksAdvice = [];
    if (!garden.aquaponicConfig) return tasksAdvice;
    const config = garden.aquaponicConfig;
    const lastReading = readings && readings.length > 0 ? readings[0] : null;
    const daysSinceLastReading = lastReading ? Math.floor((currentDate.getTime() - new Date(lastReading.readingDate).getTime()) / (1000 * 60 * 60 * 24)) : Infinity;
    // 1. TEST QUALITÀ ACQUA PROGRAMMATO
    const daysSinceLastTest = config.maintenance.lastWaterTest ? Math.floor((currentDate.getTime() - new Date(config.maintenance.lastWaterTest).getTime()) / (1000 * 60 * 60 * 24)) : Infinity;
    if (daysSinceLastTest >= config.maintenance.testFrequencyDays) {
        tasksAdvice.push({
            taskType: 'WaterTest',
            priority: daysSinceLastTest > config.maintenance.testFrequencyDays * 2 ? 'High' : 'Medium',
            message: `Test qualità acqua (${daysSinceLastTest} giorni dall'ultimo test)`,
            dueDate: currentDate.toISOString().split('T')[0],
            instructions: [
                `pH target: ${config.waterQuality.phTarget}`,
                `Ammoniaca target: < ${config.waterQuality.ammoniaTarget} mg/L`,
                `Nitriti target: < ${config.waterQuality.nitriteTarget} mg/L`,
                `Nitrati target: ${config.waterQuality.nitrateTarget} mg/L`,
                'Usa kit di test per acquariofilia',
                'Registra tutti i valori nel sistema',
                'Se valori fuori range, prendi azioni correttive'
            ]
        });
    }
    // 2. ALERT CRITICI PER SALUTE PESCI
    if (lastReading) {
        const criticalAlerts = [];
        if (lastReading.ammonia && lastReading.ammonia > config.waterQuality.ammoniaTarget * 2) {
            criticalAlerts.push(`⚠️ AMMONIACA CRITICA: ${lastReading.ammonia.toFixed(2)} mg/L (target: < ${config.waterQuality.ammoniaTarget})`);
        }
        if (lastReading.nitrite && lastReading.nitrite > config.waterQuality.nitriteTarget * 2) {
            criticalAlerts.push(`⚠️ NITRITI CRITICI: ${lastReading.nitrite.toFixed(2)} mg/L (target: < ${config.waterQuality.nitriteTarget})`);
        }
        if (lastReading.ph && (lastReading.ph < 6.5 || lastReading.ph > 7.5)) {
            criticalAlerts.push(`⚠️ pH FUORI RANGE: ${lastReading.ph.toFixed(2)} (target: ${config.waterQuality.phTarget})`);
        }
        if (criticalAlerts.length > 0) {
            tasksAdvice.push({
                taskType: 'Alert',
                priority: 'Critical',
                message: criticalAlerts.join(' | '),
                dueDate: currentDate.toISOString().split('T')[0],
                instructions: [
                    'AZIONE IMMEDIATA RICHIESTA per salvare i pesci!',
                    'Fai cambio parziale acqua (20-30%)',
                    'Aggiungi batteri benefici se necessario',
                    'Verifica che il filtro biologico funzioni',
                    'Riduci alimentazione pesci temporaneamente',
                    'Monitora ogni 12-24 ore fino a normalizzazione'
                ],
                isUrgent: true
            });
        }
    }
    // 3. ALIMENTAZIONE PESCI
    const lastFeedDate = config.maintenance.lastFishFeed ? new Date(config.maintenance.lastFishFeed) : null;
    const hoursSinceLastFeed = lastFeedDate ? Math.floor((currentDate.getTime() - lastFeedDate.getTime()) / (1000 * 60 * 60)) : Infinity;
    const hoursBetweenFeeds = 24 / config.maintenance.feedFrequency;
    if (hoursSinceLastFeed >= hoursBetweenFeeds) {
        tasksAdvice.push({
            taskType: 'FishFeed',
            priority: 'Medium',
            message: `Alimenta i pesci (${config.maintenance.feedFrequency} volte al giorno)`,
            dueDate: currentDate.toISOString().split('T')[0],
            instructions: [
                `Quantità: ${config.maintenance.feedAmount ? `${config.maintenance.feedAmount}g` : 'quantità appropriata per numero pesci'}`,
                'Usa mangime di qualità per acquaponica',
                'Non sovralimentare (i pesci dovrebbero finire il cibo in 5 minuti)',
                'Rimuovi cibo non consumato dopo 10 minuti',
                'Registra la data dell\'alimentazione'
            ]
        });
    }
    // 4. MANUTENZIONE FILTRI
    if (config.filtration.hasMechanicalFilter || config.filtration.hasBiologicalFilter) {
        tasksAdvice.push({
            taskType: 'FilterMaintenance',
            priority: 'Medium',
            message: 'Manutenzione filtri sistema acquaponico',
            dueDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            instructions: [
                config.filtration.hasMechanicalFilter ? 'Pulisci filtro meccanico (rimuovi detriti)' : '',
                config.filtration.hasBiologicalFilter ? 'Controlla filtro biologico (non pulire troppo aggressivamente)' : '',
                'Lava solo con acqua del sistema (non acqua di rubinetto clorata)',
                'Mantieni batteri benefici nel filtro biologico',
                'Verifica che la pompa funzioni correttamente'
            ].filter(Boolean)
        });
    }
    // 5. CONTROLLO CICLO AZOTO
    if (lastReading) {
        const hasAmmonia = lastReading.ammonia && lastReading.ammonia > 0;
        const hasNitrite = lastReading.nitrite && lastReading.nitrite > 0;
        const hasNitrate = lastReading.nitrate && lastReading.nitrate > 0;
        if (!hasNitrate && (hasAmmonia || hasNitrite)) {
            tasksAdvice.push({
                taskType: 'NitrogenCycleCheck',
                priority: 'High',
                message: 'Ciclo azoto non completo - sistema in maturazione',
                dueDate: currentDate.toISOString().split('T')[0],
                instructions: [
                    'Il sistema è ancora in fase di maturazione',
                    'Aggiungi batteri benefici per accelerare il ciclo',
                    'Riduci alimentazione pesci fino a completamento ciclo',
                    'Monitora ammoniaca e nitriti giornalmente',
                    'Il ciclo sarà completo quando avrai nitrati e zero ammoniaca/nitriti'
                ]
            });
        }
    }
    return tasksAdvice;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/aeroponicEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateAeroponicTasks",
    ()=>calculateAeroponicTasks
]);
const calculateAeroponicTasks = (garden, tasks, currentDate = new Date())=>{
    const tasksAdvice = [];
    if (!garden.aeroponicConfig) return tasksAdvice;
    const config = garden.aeroponicConfig;
    // 1. PULIZIA UGelli PROGRAMMATA
    const daysSinceLastClean = config.maintenance.lastNozzleClean ? Math.floor((currentDate.getTime() - new Date(config.maintenance.lastNozzleClean).getTime()) / (1000 * 60 * 60 * 24)) : Infinity;
    if (daysSinceLastClean >= config.maintenance.cleanFrequencyDays) {
        tasksAdvice.push({
            taskType: 'NozzleClean',
            priority: daysSinceLastClean > config.maintenance.cleanFrequencyDays * 1.5 ? 'High' : 'Medium',
            message: `Pulisci gli ugelli di nebulizzazione (${daysSinceLastClean} giorni dall'ultima pulizia)`,
            dueDate: currentDate.toISOString().split('T')[0],
            instructions: [
                `Pulisci tutti i ${config.misting.nozzleCount} ugelli`,
                'Rimuovi depositi di sali minerali',
                'Usa spazzolino o ago per sbloccare ostruzioni',
                'Verifica che ogni ugello nebulizzi correttamente',
                'Controlla pressione sistema (se High Pressure)',
                'Registra la data della pulizia'
            ]
        });
    }
    // 2. CONTROLLO NEBULIZZAZIONE
    tasksAdvice.push({
        taskType: 'MistingCheck',
        priority: 'Medium',
        message: 'Verifica funzionamento sistema nebulizzazione',
        dueDate: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        instructions: [
            `Verifica che tutti i ${config.misting.nozzleCount} ugelli nebulizzino correttamente`,
            `Frequenza: ${config.misting.mistFrequency} volte al giorno`,
            `Durata ciclo: ${config.misting.mistDuration} secondi`,
            `Intervallo: ${config.misting.mistInterval} minuti`,
            'Controlla che non ci siano perdite',
            'Verifica che le radici ricevano umidità uniforme',
            'Se sistema non nebulizza correttamente, pulisci immediatamente'
        ]
    });
    // 3. CAMBIO SOLUZIONE NUTRITIVA
    const daysSinceLastChange = config.maintenance.lastReservoirChange ? Math.floor((currentDate.getTime() - new Date(config.maintenance.lastReservoirChange).getTime()) / (1000 * 60 * 60 * 24)) : Infinity;
    if (daysSinceLastChange >= config.maintenance.changeFrequencyDays) {
        tasksAdvice.push({
            taskType: 'SolutionChange',
            priority: daysSinceLastChange > config.maintenance.changeFrequencyDays * 1.5 ? 'High' : 'Medium',
            message: `Cambia la soluzione nutritiva (${daysSinceLastChange} giorni dall'ultimo cambio)`,
            dueDate: currentDate.toISOString().split('T')[0],
            instructions: [
                `Svuota serbatoio (${config.nutrientSolution.reservoirCapacity}L)`,
                'Pulisci serbatoio e sistema di nebulizzazione',
                'Prepara nuova soluzione con nutrienti freschi',
                `pH target: ${config.nutrientSolution.phTarget}`,
                `EC target: ${config.nutrientSolution.ecTarget} mS/cm`,
                'Riempi serbatoio e testa sistema nebulizzazione',
                'Registra la data del cambio'
            ]
        });
    }
    // 4. MANUTENZIONE CAMERA RADICI
    tasksAdvice.push({
        taskType: 'RootChamberMaintenance',
        priority: 'Low',
        message: 'Manutenzione camera radici',
        dueDate: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        instructions: [
            `Volume camera: ${config.rootChamber.volume}L`,
            config.rootChamber.hasDrainage ? 'Verifica che il drenaggio funzioni correttamente' : '',
            config.rootChamber.hasVentilation ? 'Controlla ventilazione camera radici' : '',
            'Ispeziona radici per segni di malattia',
            'Rimuovi radici morte o marce',
            'Verifica che le radici non ostruiscano gli ugelli',
            'Mantieni ambiente pulito e ben ventilato'
        ].filter(Boolean)
    });
    // 5. ALERT SE SISTEMA NON NEBULIZZA
    // Questo sarebbe meglio verificato con sensori, ma per ora è un reminder
    tasksAdvice.push({
        taskType: 'Alert',
        priority: 'Critical',
        message: '⚠️ Verifica che il sistema nebulizzi correttamente - CRITICO per sopravvivenza piante',
        dueDate: currentDate.toISOString().split('T')[0],
        instructions: [
            'Le radici devono essere costantemente umide',
            'Se sistema non nebulizza per più di 30 minuti, le radici si seccano',
            'Controlla immediatamente se noti radici secche',
            'Verifica pressione sistema (se High Pressure)',
            'Pulisci ugelli se necessario',
            'Testa sistema prima di lasciarlo incustodito'
        ],
        isUrgent: true
    });
    return tasksAdvice;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/accessoriesEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateAccessoryTasks",
    ()=>calculateAccessoryTasks,
    "suggestAccessoriesForPlant",
    ()=>suggestAccessoriesForPlant
]);
const calculateAccessoryTasks = (garden, accessories, currentDate = new Date())=>{
    const tasksAdvice = [];
    const gardenAccessories = accessories.filter((a)=>a.gardenId === garden.id);
    for (const accessory of gardenAccessories){
        // 1. MANUTENZIONE PROGRAMMATA
        if (accessory.lastMaintenance) {
            const daysSinceMaintenance = Math.floor((currentDate.getTime() - new Date(accessory.lastMaintenance).getTime()) / (1000 * 60 * 60 * 24));
            // Manutenzione annuale per reti e strutture
            if (daysSinceMaintenance > 365 && (accessory.category === 'Netting' || accessory.category === 'Structure')) {
                tasksAdvice.push({
                    taskType: 'Maintenance',
                    priority: 'Medium',
                    message: `Manutenzione accessorio: ${accessory.name}`,
                    dueDate: currentDate.toISOString().split('T')[0],
                    instructions: [
                        `Accessorio: ${accessory.name} (${accessory.category})`,
                        'Ispeziona per usura o danni',
                        'Pulisci e rimuovi detriti',
                        'Verifica che sia ancora funzionale',
                        'Ripara o sostituisci se necessario',
                        'Registra la data della manutenzione'
                    ],
                    accessoryId: accessory.id
                });
            }
        }
        // 2. SOSTITUZIONE SCADUTA
        if (accessory.needsReplacement) {
            tasksAdvice.push({
                taskType: 'Replacement',
                priority: 'High',
                message: `⚠️ Sostituisci accessorio: ${accessory.name}`,
                dueDate: currentDate.toISOString().split('T')[0],
                instructions: [
                    `Accessorio: ${accessory.name} (${accessory.category})`,
                    'L\'accessorio è marcato per sostituzione',
                    'Rimuovi vecchio accessorio',
                    'Installa nuovo accessorio',
                    'Registra data installazione',
                    'Aggiorna stato nel sistema'
                ],
                accessoryId: accessory.id
            });
        }
        // 3. CONTROLLO DURATA PREVISTA
        if (accessory.installationDate && accessory.expectedLifespan) {
            const installationDate = new Date(accessory.installationDate);
            const expectedEndDate = new Date(installationDate.getTime() + accessory.expectedLifespan * 365 * 24 * 60 * 60 * 1000);
            const daysUntilReplacement = Math.floor((expectedEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilReplacement <= 30 && daysUntilReplacement > 0) {
                tasksAdvice.push({
                    taskType: 'Replacement',
                    priority: 'Medium',
                    message: `Accessorio ${accessory.name} si avvicina alla fine della durata prevista`,
                    dueDate: expectedEndDate.toISOString().split('T')[0],
                    instructions: [
                        `Accessorio: ${accessory.name}`,
                        `Durata prevista: ${accessory.expectedLifespan} anni`,
                        `Installato: ${new Date(accessory.installationDate).toLocaleDateString()}`,
                        `Fine durata prevista: ${expectedEndDate.toLocaleDateString()}`,
                        'Prepara sostituzione',
                        'Ispeziona per usura anticipata'
                    ],
                    accessoryId: accessory.id
                });
            }
        }
    }
    return tasksAdvice;
};
const suggestAccessoriesForPlant = (plantName, masterData)=>{
    const suggestions = [];
    if (!masterData) return suggestions;
    const plantNameLower = plantName.toLowerCase();
    // PRIORITÀ 1: Usa supportRequirements se presente (dati strutturati)
    if (masterData.supportRequirements) {
        const req = masterData.supportRequirements;
        if (req.needsSupport && req.supportType) {
            const supportTypeMap = {
                'Stake': {
                    category: 'Support',
                    type: 'Stake'
                },
                'Trellis': {
                    category: 'Support',
                    type: 'Trellis'
                },
                'Cage': {
                    category: 'Support',
                    type: 'Cage'
                },
                'Net': {
                    category: 'Netting',
                    type: 'Shade'
                },
                'Espalier': {
                    category: 'Support',
                    type: 'Espalier'
                }
            };
            const supportInfo = supportTypeMap[req.supportType] || {
                category: 'Support',
                type: req.supportType
            };
            suggestions.push({
                taskType: 'Suggestion',
                priority: 'High',
                message: `Installa ${req.supportType === 'Stake' ? 'tutore/paletto' : req.supportType === 'Trellis' ? 'spalliera' : req.supportType.toLowerCase()} per ${plantName}`,
                dueDate: new Date().toISOString().split('T')[0],
                instructions: [
                    `${plantName} necessita di supporto per crescere correttamente`,
                    req.supportType === 'Trellis' ? 'Installa spalliera robusta' : req.supportType === 'Stake' ? 'Installa tutore o paletto' : `Installa ${req.supportType.toLowerCase()}`,
                    req.supportHeight ? `Altezza consigliata: ${req.supportHeight}cm` : 'Altezza adeguata alla crescita della pianta',
                    req.supportTiming === 'AtTransplant' ? 'Posiziona supporto durante trapianto' : req.supportTiming === 'BeforeFlowering' ? 'Installa prima della fioritura' : 'Installa quando necessario',
                    req.climbingType === 'Twining' ? 'La pianta si arrampica avvolgendo il supporto' : req.climbingType === 'Tendril' ? 'La pianta usa viticci per arrampicarsi' : 'Lega delicatamente senza stringere troppo',
                    req.notes || 'Controlla regolarmente che il supporto sia stabile'
                ].filter(Boolean),
                suggestedAccessory: {
                    category: supportInfo.category,
                    type: supportInfo.type,
                    heightCm: req.supportHeight,
                    material: req.supportType === 'Trellis' ? 'Bamboo o Acciaio' : req.supportType === 'Stake' ? 'Bamboo, Legno o Acciaio' : undefined,
                    usedFor: [
                        plantName
                    ]
                }
            });
        }
        // Accessori aggiuntivi
        if (req.additionalAccessories) {
            for (const acc of req.additionalAccessories){
                if (acc.type === 'Net') {
                    const netTypeMap = {
                        'InsectProtection': 'Insect',
                        'Shade': 'Shade',
                        'Harvest': 'Harvest',
                        'WindProtection': 'Shade'
                    };
                    suggestions.push({
                        taskType: 'Suggestion',
                        priority: acc.required ? 'High' : 'Medium',
                        message: `Considera rete ${acc.purpose === 'InsectProtection' ? 'antinsetto' : acc.purpose === 'Shade' ? 'ombreggiante' : acc.purpose === 'Harvest' ? 'per raccolta' : 'di protezione'} per ${plantName}`,
                        dueDate: new Date().toISOString().split('T')[0],
                        instructions: [
                            acc.purpose === 'InsectProtection' ? `Protezione da parassiti per ${plantName}` : acc.purpose === 'Shade' ? `Protezione dal sole eccessivo` : acc.purpose === 'Harvest' ? `Facilita la raccolta` : `Protezione dal vento`,
                            acc.timing || 'Installa quando necessario',
                            'Assicurati che la rete non tocchi le foglie',
                            'Rimuovi durante impollinazione se necessario'
                        ],
                        suggestedAccessory: {
                            category: 'Netting',
                            type: netTypeMap[acc.purpose] || 'Shade',
                            usedFor: [
                                plantName
                            ]
                        }
                    });
                }
            }
        }
    }
    // PRIORITÀ 2: Riconoscimento specifico per piante comuni (fallback se supportRequirements non presente)
    if (!masterData.supportRequirements) {
        // FAGIOLI ARRAMPICANTI / FAGIOLINI A METRO
        if (plantNameLower.includes('fagiol') && (plantNameLower.includes('rampicant') || plantNameLower.includes('metro') || plantNameLower.includes('a metro'))) {
            suggestions.push({
                taskType: 'Suggestion',
                priority: 'High',
                message: `Installa spalliera per ${plantName}`,
                dueDate: new Date().toISOString().split('T')[0],
                instructions: [
                    'I fagioli arrampicanti necessitano di supporto robusto',
                    'Installa spalliera o rete alta almeno 2-3 metri',
                    'Posiziona supporto prima della semina/trapianto',
                    'I fagioli si arrampicano naturalmente con viticci',
                    'Supporto robusto necessario per sostenere il peso dei baccelli'
                ],
                suggestedAccessory: {
                    category: 'Support',
                    type: 'Trellis',
                    heightCm: 250,
                    material: 'Bamboo o Acciaio',
                    usedFor: [
                        plantName
                    ]
                }
            });
        }
        // PISELLI RAMPICANTI
        if (plantNameLower.includes('pisell') && plantNameLower.includes('rampicant')) {
            suggestions.push({
                taskType: 'Suggestion',
                priority: 'High',
                message: `Installa rete o spalliera per ${plantName}`,
                dueDate: new Date().toISOString().split('T')[0],
                instructions: [
                    'I piselli rampicanti necessitano di supporto leggero',
                    'Installa rete o spalliera alta 1.5-2 metri',
                    'Posiziona supporto durante trapianto',
                    'I piselli si arrampicano con viticci delicati'
                ],
                suggestedAccessory: {
                    category: 'Netting',
                    type: 'Shade',
                    heightCm: 180,
                    material: 'Rete plastica o filo',
                    usedFor: [
                        plantName
                    ]
                }
            });
        }
        // POMODORI
        if (plantNameLower.includes('pomodoro')) {
            suggestions.push({
                taskType: 'Suggestion',
                priority: 'High',
                message: `Installa tutore per ${plantName}`,
                dueDate: new Date().toISOString().split('T')[0],
                instructions: [
                    'I pomodori necessitano di supporto per crescere verticalmente',
                    'Installa tutore o paletto alto almeno 1.5-2 metri',
                    'Posiziona durante trapianto',
                    'Lega delicatamente man mano che la pianta cresce',
                    'Varietà indeterminate crescono continuamente'
                ],
                suggestedAccessory: {
                    category: 'Support',
                    type: 'Stake',
                    heightCm: 150,
                    material: 'Bamboo, Legno o Acciaio',
                    usedFor: [
                        plantName
                    ]
                }
            });
        }
        // PEPERONI
        if (plantNameLower.includes('peperon')) {
            suggestions.push({
                taskType: 'Suggestion',
                priority: 'Medium',
                message: `Considera paletto per ${plantName}`,
                dueDate: new Date().toISOString().split('T')[0],
                instructions: [
                    'Paletto opzionale ma consigliato per varietà alte',
                    'Installa paletto alto 0.8-1 metro',
                    'Utile in zone ventose o per varietà pesanti',
                    'Posiziona durante trapianto o quando necessario'
                ],
                suggestedAccessory: {
                    category: 'Support',
                    type: 'Stake',
                    heightCm: 80,
                    material: 'Bamboo o Legno',
                    usedFor: [
                        plantName
                    ]
                }
            });
        }
        // MELANZANE
        if (plantNameLower.includes('melanzan')) {
            suggestions.push({
                taskType: 'Suggestion',
                priority: 'Medium',
                message: `Considera paletto per ${plantName}`,
                dueDate: new Date().toISOString().split('T')[0],
                instructions: [
                    'Paletto consigliato per sostenere i frutti pesanti',
                    'Installa paletto alto circa 1 metro',
                    'Posiziona durante trapianto',
                    'Previene piegamento del fusto'
                ],
                suggestedAccessory: {
                    category: 'Support',
                    type: 'Stake',
                    heightCm: 100,
                    material: 'Bamboo o Legno',
                    usedFor: [
                        plantName
                    ]
                }
            });
        }
        // ZUCCHINE (non supporto ma protezione vento)
        if (plantNameLower.includes('zucchin')) {
            suggestions.push({
                taskType: 'Suggestion',
                priority: 'Low',
                message: `Considera protezione vento per ${plantName}`,
                dueDate: new Date().toISOString().split('T')[0],
                instructions: [
                    'Le zucchine non necessitano supporto',
                    'In zone ventose può essere utile rete di protezione',
                    'Installa solo se necessario',
                    'Proteggi soprattutto durante crescita iniziale'
                ],
                suggestedAccessory: {
                    category: 'Netting',
                    type: 'Shade',
                    usedFor: [
                        plantName
                    ]
                }
            });
        }
    }
    // PRIORITÀ 3: Fallback su campi esistenti (se supportRequirements non presente)
    if (!masterData.supportRequirements) {
        const needsSupport = masterData.needsSupport || false;
        const isClimbing = masterData.growthHabit?.includes('Climbing') || false;
        const isTall = masterData.maxHeight && masterData.maxHeight > 100; // > 1 metro
        // PIANTE CHE NECESSITANO SUPPORTO (fallback generico)
        if (needsSupport || isClimbing) {
            suggestions.push({
                taskType: 'Suggestion',
                priority: 'High',
                message: `Installa supporto per ${plantName}`,
                dueDate: new Date().toISOString().split('T')[0],
                instructions: [
                    `${plantName} necessita di supporto per crescere correttamente`,
                    isClimbing ? 'Installa tutore o spalliera per piante rampicanti' : 'Installa paletto o gabbia per piante alte',
                    'Posiziona supporto vicino alla pianta',
                    'Legare delicatamente senza stringere troppo',
                    'Controlla regolarmente che il supporto sia stabile'
                ],
                suggestedAccessory: {
                    category: 'Support',
                    type: isClimbing ? 'Trellis' : 'Stake',
                    heightCm: isTall ? masterData.maxHeight : undefined,
                    usedFor: [
                        plantName
                    ]
                }
            });
        }
        // PIANTE ALTE CHE NECESSITANO PALETTI
        if (isTall && !isClimbing) {
            suggestions.push({
                taskType: 'Suggestion',
                priority: 'Medium',
                message: `Considera paletto per ${plantName} (pianta alta)`,
                dueDate: new Date().toISOString().split('T')[0],
                instructions: [
                    `${plantName} può crescere fino a ${masterData.maxHeight}cm`,
                    'Installa paletto robusto per prevenire piegamento',
                    'Posiziona paletto durante trapianto o prima che la pianta cresca troppo',
                    'Usa legature morbide per non danneggiare il fusto'
                ],
                suggestedAccessory: {
                    category: 'Support',
                    type: 'Stake',
                    heightCm: masterData.maxHeight,
                    usedFor: [
                        plantName
                    ]
                }
            });
        }
    }
    // PIANTE SENSIBILI A PARASSITI - RETI ANTINSETTO
    if (masterData.susceptibility?.pests && masterData.susceptibility.pests.length > 0) {
        // Evita duplicati se già suggerito in additionalAccessories
        const alreadySuggested = suggestions.some((s)=>s.suggestedAccessory?.category === 'Netting' && s.suggestedAccessory?.type === 'Insect');
        if (!alreadySuggested) {
            suggestions.push({
                taskType: 'Suggestion',
                priority: 'Medium',
                message: `Considera rete antinsetto per ${plantName}`,
                dueDate: new Date().toISOString().split('T')[0],
                instructions: [
                    `${plantName} è sensibile a: ${masterData.susceptibility.pests.join(', ')}`,
                    'Installa rete antinsetto per proteggere la pianta',
                    'Assicurati che la rete non tocchi le foglie',
                    'Rimuovi rete durante impollinazione se necessario'
                ],
                suggestedAccessory: {
                    category: 'Netting',
                    type: 'Insect',
                    usedFor: [
                        plantName
                    ]
                }
            });
        }
    }
    // PIANTE DA FRUTTO - RETI RACCOLTA
    if (plantNameLower.includes('olivo') || plantNameLower.includes('vite') || plantNameLower.includes('melo') || plantNameLower.includes('pero') || masterData.cropType === 'FruitTree') {
        suggestions.push({
            taskType: 'Suggestion',
            priority: 'Low',
            message: `Considera rete per raccolta frutta per ${plantName}`,
            dueDate: new Date().toISOString().split('T')[0],
            instructions: [
                'Rete per raccolta facilita la raccolta dei frutti',
                'Posiziona rete sotto la pianta durante periodo raccolta',
                'Rimuovi rete dopo raccolta per evitare accumulo detriti'
            ],
            suggestedAccessory: {
                category: 'Netting',
                type: 'Harvest',
                usedFor: [
                    plantName
                ]
            }
        });
    }
    return suggestions;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/rotationOptimizer.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Rotation Optimizer
 * Ottimizza rotazioni automaticamente considerando famiglie botaniche, esigenze nutrizionali, successioni stagionali
 */ __turbopack_context__.s([
    "areSameFamily",
    ()=>areSameFamily,
    "getPlantFamily",
    ()=>getPlantFamily,
    "isGoodSuccession",
    ()=>isGoodSuccession,
    "optimizeBedRotation",
    ()=>optimizeBedRotation,
    "plantFamilies",
    ()=>plantFamilies
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/plantMasterService.ts [app-client] (ecmascript)");
;
const plantFamilies = {
    'Solanaceae': [
        'Pomodoro',
        'Peperone',
        'Melanzana',
        'Patata'
    ],
    'Cucurbitaceae': [
        'Zucchina',
        'Cetriolo',
        'Melone',
        'Anguria',
        'Zucca'
    ],
    'Leguminose': [
        'Fagiolo',
        'Pisello',
        'Fava',
        'Fagiolino'
    ],
    'Ombrellifere': [
        'Carota',
        'Sedano',
        'Prezzemolo',
        'Finocchio'
    ],
    'Liliacee': [
        'Cipolla',
        'Aglio',
        'Porro',
        'Scalogno'
    ],
    'Brassicaceae': [
        'Cavolo',
        'Broccolo',
        'Rapa',
        'Ravanello',
        'Cavolfiore'
    ],
    'Asteraceae': [
        'Lattuga',
        'Indivia',
        'Radicchio'
    ],
    'Chenopodiaceae': [
        'Bietola',
        'Spinacio'
    ]
};
const getPlantFamily = (plantName)=>{
    const masterData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMasterSheet"])(plantName);
    if (masterData?.family) {
        return masterData.family;
    }
    // Fallback: cerca nel database
    for (const [family, plants] of Object.entries(plantFamilies)){
        if (plants.some((p)=>p.toLowerCase().includes(plantName.toLowerCase()) || plantName.toLowerCase().includes(p.toLowerCase()))) {
            return family;
        }
    }
    return null;
};
const areSameFamily = (plant1, plant2)=>{
    const family1 = getPlantFamily(plant1);
    const family2 = getPlantFamily(plant2);
    return family1 !== null && family1 === family2;
};
const optimizeBedRotation = (bedRotation, availablePlants, targetYear)=>{
    const suggestions = [];
    const warnings = [];
    const optimized = {
        ...bedRotation,
        year: targetYear,
        quarters: {
            ...bedRotation.quarters
        }
    };
    // Analizza storia per evitare ripetizioni
    const last3Years = bedRotation.history.filter((h)=>h.year >= targetYear - 3).map((h)=>({
            plant: h.plantName,
            family: h.family
        }));
    // Per ogni quarter, suggerisci pianta ottimale
    const quarters = [
        'Q1',
        'Q2',
        'Q3',
        'Q4'
    ];
    for (const quarter of quarters){
        if (optimized.quarters[quarter]) continue; // Già assegnata
        // Evita piante stessa famiglia degli ultimi 3 anni
        const forbiddenFamilies = new Set(last3Years.filter((h)=>{
            // Considera solo quarters precedenti o stesso quarter anni precedenti
            const quarterOrder = [
                'Q1',
                'Q2',
                'Q3',
                'Q4'
            ];
            const currentQuarterIdx = quarterOrder.indexOf(quarter);
            const historyQuarterIdx = quarterOrder.indexOf(h.plant ? 'Q1' : 'Q1'); // Semplificato
            return true; // Considera tutte le piante degli ultimi 3 anni
        }).map((h)=>h.family));
        // Cerca pianta ottimale
        let bestPlant = null;
        let bestScore = 0;
        for (const plant of availablePlants){
            const family = getPlantFamily(plant);
            if (!family) continue;
            // Skip se stessa famiglia recente
            if (forbiddenFamilies.has(family)) {
                continue;
            }
            // Score basato su:
            // 1. Leguminose dopo solanacee (arricchiscono terreno)
            const lastPlant = last3Years[last3Years.length - 1]?.plant;
            if (lastPlant) {
                const lastFamily = getPlantFamily(lastPlant);
                if (lastFamily === 'Solanaceae' && family === 'Leguminose') {
                    bestPlant = plant;
                    bestScore = 100;
                    break; // Perfetto match
                }
            }
            // 2. Piante diverse da ultime 2
            const recentPlants = last3Years.slice(-2).map((h)=>h.plant);
            if (!recentPlants.includes(plant)) {
                const score = 50;
                if (score > bestScore) {
                    bestScore = score;
                    bestPlant = plant;
                }
            }
        }
        if (bestPlant) {
            optimized.quarters[quarter] = bestPlant;
            suggestions.push(`${quarter}: ${bestPlant} (ottimale per rotazione)`);
        } else {
            warnings.push(`${quarter}: Nessuna pianta ottimale trovata, considera rotazione manuale`);
        }
    }
    return {
        optimized,
        suggestions,
        warnings
    };
};
const isGoodSuccession = (previousPlant, nextPlant)=>{
    const prevFamily = getPlantFamily(previousPlant);
    const nextFamily = getPlantFamily(nextPlant);
    if (!prevFamily || !nextFamily) {
        return {
            compatible: true,
            reason: 'Famiglia non identificata'
        };
    }
    // Stessa famiglia = non compatibile
    if (prevFamily === nextFamily) {
        return {
            compatible: false,
            reason: `Stessa famiglia botanica: ${prevFamily}`
        };
    }
    // Leguminose dopo solanacee = ottimo
    if (prevFamily === 'Solanaceae' && nextFamily === 'Leguminose') {
        return {
            compatible: true,
            reason: 'Leguminose arricchiscono terreno dopo solanacee'
        };
    }
    // Solanacee dopo leguminose = buono
    if (prevFamily === 'Leguminose' && nextFamily === 'Solanaceae') {
        return {
            compatible: true,
            reason: 'Solanacee beneficiano di azoto da leguminose'
        };
    }
    return {
        compatible: true,
        reason: 'Successione compatibile'
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/solarClassificationHelper.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Solar Classification Helper
 * Funzioni helper per calcolare e validare la classificazione solare stagionale
 */ __turbopack_context__.s([
    "calculateGardenSolarClassification",
    ()=>calculateGardenSolarClassification,
    "getOptimizedPlantSuggestions",
    ()=>getOptimizedPlantSuggestions,
    "validatePlantCompatibility",
    ()=>validatePlantCompatibility
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$seasonalSunWindows$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/seasonalSunWindows.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantingWindowOptimizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/plantingWindowOptimizer.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$seasonalPlantSuggestions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/seasonalPlantSuggestions.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/plantMasterService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$seedlingBatchHelper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/seedlingBatchHelper.ts [app-client] (ecmascript)");
;
;
;
;
;
async function calculateGardenSolarClassification(garden, currentDate = new Date(), historicalWeather, seedlingBatches) {
    // Verifica che le coordinate siano disponibili
    if (!garden.coordinates) {
        return null;
    }
    const lat = garden.coordinates.latitude;
    const lng = garden.coordinates.longitude;
    const obstacles = garden.obstacles || [];
    const year = currentDate.getFullYear();
    try {
        // Calcola finestre stagionali
        const windows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$seasonalSunWindows$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateSeasonalWindows"])(lat, lng, obstacles, year);
        // Classifica tipo di orto
        const classification = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$seasonalSunWindows$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["classifyGardenType"])(windows);
        // Trova finestre di impianto ottimali (con aggiustamenti terreno, altitudine e temperatura)
        let plantingWindows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantingWindowOptimizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findPlantingWindows"])(classification, windows, lat, lng, obstacles, year, garden.soilType, garden.altitudeMeters, historicalWeather || undefined);
        // Applica aggiustamenti basati su batch pronti
        if (seedlingBatches && seedlingBatches.length > 0) {
            plantingWindows = plantingWindows.map((window)=>{
                // Verifica se esiste un batch pronto per una delle piante raccomandate
                const hasReadyBatch = window.recommendedPlants.some((plantName)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$seedlingBatchHelper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasReadyBatchForPlant"])(plantName, seedlingBatches, garden));
                if (hasReadyBatch) {
                    // Se esiste batch pronto, usa Seedling (non anticipare)
                    return {
                        ...window,
                        method: 'Seedling',
                        adjustedStartDate: window.startDate
                    };
                } else {
                    // Se non esiste batch, usa Seed (anticipa)
                    const adjustedWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantingWindowOptimizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["adjustForPlantingMethod"])(window, 'Seed', window.recommendedPlants[0] // Usa prima pianta per calcolo preciso
                    );
                    return {
                        ...window,
                        method: 'Seed',
                        adjustedStartDate: adjustedWindow.adjustedStartDate
                    };
                }
            });
        } else {
            // Se non ci sono batch, applica aggiustamento Seed di default
            plantingWindows = plantingWindows.map((window)=>{
                const adjustedWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantingWindowOptimizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["adjustForPlantingMethod"])(window, 'Seed', window.recommendedPlants[0]);
                return {
                    ...window,
                    method: 'Seed',
                    adjustedStartDate: adjustedWindow.adjustedStartDate
                };
            });
        }
        // Ottieni suggerimenti piante ottimizzati
        const optimizedSuggestions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$seasonalPlantSuggestions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["suggestPlantsForGardenType"])(classification, windows, lat, lng, obstacles, year);
        // Valida compatibilità piante esistenti (sarà fatto nel Director)
        const compatibilityAlerts = [];
        return {
            windows,
            classification,
            plantingWindows,
            compatibilityAlerts,
            optimizedSuggestions
        };
    } catch (error) {
        console.error('Error calculating solar classification:', error);
        return null;
    }
}
function validatePlantCompatibility(plantName, classification, windows) {
    const masterData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMasterSheet"])(plantName);
    if (!masterData) {
        return {
            compatible: true
        }; // Se non trovata, assumiamo compatibile
    }
    const giuLug = windows.find((w)=>w.period === 'Giu-Lug');
    const febMar = windows.find((w)=>w.period === 'Feb-Mar');
    const aprMag = windows.find((w)=>w.period === 'Apr-Mag');
    if (!giuLug || !febMar || !aprMag) {
        return {
            compatible: true
        }; // Se dati mancanti, assumiamo compatibile
    }
    // Piante estive richiedono orto estivo
    const summerPlants = [
        'Pomodoro',
        'Peperone',
        'Melanzana',
        'Zucchina',
        'Cetriolo',
        'Fagiolino',
        'Pomodoro Ciliegino',
        'Pomodoro San Marzano'
    ];
    // Piante primaverili/autunnali preferiscono orto non estivo
    const springAutumnPlants = [
        'Lattuga',
        'Spinaci',
        'Rucola',
        'Bietola',
        'Piselli',
        'Cipolla',
        'Fava',
        'Carota',
        'Ravanello'
    ];
    const isSummerPlant = summerPlants.some((name)=>plantName.toLowerCase().includes(name.toLowerCase()));
    const isSpringAutumnPlant = springAutumnPlants.some((name)=>plantName.toLowerCase().includes(name.toLowerCase()));
    // Validazione per orto estivo
    if (classification.type === 'Estivo') {
        if (isSpringAutumnPlant && giuLug.avgHours > 7) {
            return {
                compatible: false,
                reason: `Pianta primaverile/autunnale in orto estivo (${giuLug.avgHours.toFixed(1)}h sole Giu-Lug). Potrebbe soffrire il caldo estivo.`,
                alternativePlants: [
                    'Pomodoro',
                    'Peperone',
                    'Zucchina',
                    'Melanzana'
                ]
            };
        }
    }
    // Validazione per orto non estivo
    if (classification.type === 'NonEstivo') {
        if (isSummerPlant && giuLug.avgHours < 6) {
            return {
                compatible: false,
                reason: `Pianta estiva in orto non estivo (${giuLug.avgHours.toFixed(1)}h sole Giu-Lug). Resa limitata senza sole estivo sufficiente.`,
                alternativePlants: [
                    'Lattuga',
                    'Spinaci',
                    'Rucola',
                    'Bietola',
                    'Piselli'
                ]
            };
        }
    }
    // Validazione per orto misto
    if (classification.type === 'Misto') {
        // Piante estive richiedono almeno 5h in Giu-Lug
        if (isSummerPlant && giuLug.avgHours < 5) {
            return {
                compatible: false,
                reason: `Pianta estiva in orto misto con sole limitato (${giuLug.avgHours.toFixed(1)}h sole Giu-Lug). Considera varietà più tolleranti.`,
                alternativePlants: [
                    'Lattuga estiva',
                    'Basilico',
                    'Prezzemolo'
                ]
            };
        }
    }
    return {
        compatible: true
    };
}
function getOptimizedPlantSuggestions(classification, windows, currentDate) {
    if (!classification || !windows || windows.length === 0) {
        return [];
    }
    const lat = 0; // Sarà passato dal chiamante se necessario
    const lng = 0; // Sarà passato dal chiamante se necessario
    const obstacles = [];
    const year = currentDate.getFullYear();
    try {
        const suggestions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$seasonalPlantSuggestions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["suggestPlantsForGardenType"])(classification, windows, lat, lng, obstacles, year);
        // Filtra suggerimenti per finestre di impianto attive
        const now = currentDate;
        const activeSuggestions = suggestions.filter((s)=>{
            return s.plantingWindow.start <= now && s.plantingWindow.end >= now;
        });
        // Ordina per suitability score (migliori prima)
        return activeSuggestions.sort((a, b)=>b.suitabilityScore - a.suitabilityScore);
    } catch (error) {
        console.error('Error getting optimized plant suggestions:', error);
        return [];
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/annualPlannerEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Annual Planner Engine
 * Genera e gestisce piani annuali completi con rotazioni, proiezioni e successioni
 */ __turbopack_context__.s([
    "calculateProjections",
    ()=>calculateProjections,
    "generateAnnualPlan",
    ()=>generateAnnualPlan,
    "optimizeRotations",
    ()=>optimizeRotations,
    "suggestSuccessions",
    ()=>suggestSuccessions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$seasonalAdjustment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/seasonalAdjustment.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$rotationOptimizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/rotationOptimizer.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/plantMasterService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$solarClassificationHelper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/solarClassificationHelper.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$soilTemperatureUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/soilTemperatureUtils.ts [app-client] (ecmascript)");
;
;
;
;
;
const generateAnnualPlan = (garden, preferences, solarClassification)=>{
    const currentYear = new Date().getFullYear();
    const latitude = garden.coordinates?.latitude || 0;
    // Determina stagioni per quarters
    const q1Season = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$seasonalAdjustment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSeasonForDate"])(new Date(currentYear, 0, 15), latitude); // Gennaio
    const q2Season = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$seasonalAdjustment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSeasonForDate"])(new Date(currentYear, 3, 15), latitude); // Aprile
    const q3Season = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$seasonalAdjustment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSeasonForDate"])(new Date(currentYear, 6, 15), latitude); // Luglio
    const q4Season = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$seasonalAdjustment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSeasonForDate"])(new Date(currentYear, 9, 15), latitude); // Ottobre
    const masterSheets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllMasterSheets"])();
    let availablePlants = preferences?.preferredPlants || masterSheets.filter((p)=>p.season === 'Summer' || p.season === 'Winter').map((p)=>p.commonName);
    // Filtra piante in base alla classificazione solare se disponibile
    if (solarClassification) {
        // Ottieni finestre stagionali (mock per ora, dovrebbero essere passate)
        const mockWindows = [
            {
                period: 'Feb-Mar',
                avgHours: 4
            },
            {
                period: 'Apr-Mag',
                avgHours: 5
            },
            {
                period: 'Giu-Lug',
                avgHours: 6
            },
            {
                period: 'Ago-Set',
                avgHours: 5
            }
        ];
        availablePlants = availablePlants.filter((plantName)=>{
            const solarCompatibility = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$solarClassificationHelper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validatePlantCompatibility"])(plantName, solarClassification, mockWindows);
            return solarCompatibility.compatible;
        });
    }
    // Filtra per compatibilità terreno
    availablePlants = availablePlants.filter((plantName)=>{
        const soilCompatibility = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$soilTemperatureUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSoilCompatibility"])(plantName, garden.soilType);
        return soilCompatibility.compatible;
    });
    // Genera quarters
    const quarters = {
        Q1: generateQuarterPlan(1, 3, q1Season, availablePlants, garden, solarClassification),
        Q2: generateQuarterPlan(4, 6, q2Season, availablePlants, garden, solarClassification),
        Q3: generateQuarterPlan(7, 9, q3Season, availablePlants, garden, solarClassification),
        Q4: generateQuarterPlan(10, 12, q4Season, availablePlants, garden, solarClassification)
    };
    // Genera rotazioni per ogni aiuola
    const rotations = [];
    // TODO: Implementare logica aiuole se disponibile
    // Calcola proiezioni
    const projections = calculateProjections(quarters, garden);
    return {
        year: currentYear,
        gardenId: garden.id,
        quarters,
        rotations,
        projections
    };
};
/**
 * Genera piano per un quarter
 */ const generateQuarterPlan = (startMonth, endMonth, season, availablePlants, garden, solarClassification)=>{
    const plantings = [];
    const harvests = [];
    const maintenance = [];
    // Filtra piante per stagione
    const seasonalPlants = availablePlants.filter((plantName)=>{
        const master = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllMasterSheets"])().find((p)=>p.commonName === plantName);
        if (!master) return false;
        return master.season === season || master.season === 'Both';
    });
    // Genera plantings per ogni mese
    for(let month = startMonth; month <= endMonth; month++){
        // Assegna 1-2 piante per mese
        const plantsForMonth = seasonalPlants.slice(0, 2);
        for (const plantName of plantsForMonth){
            plantings.push({
                plantName,
                month,
                method: 'Seed',
                quantity: 10
            });
        }
    }
    return {
        season,
        plantings,
        harvests,
        maintenance
    };
};
const calculateProjections = (quarters, garden)=>{
    let totalYield = 0;
    // Stima resa basata su piante pianificate
    for (const quarter of Object.values(quarters)){
        for (const planting of quarter.plantings){
            const master = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllMasterSheets"])().find((p)=>p.commonName === planting.plantName);
            if (master && master.estimatedYield) {
                const yieldPerPlant = master.estimatedYield.min || 1; // kg per pianta
                totalYield += yieldPerPlant * planting.quantity * 0.7; // 70% survival rate
            }
        }
    }
    // Stima risparmio (prezzo medio biologico: 5€/kg)
    const avgPricePerKg = 5;
    const costSavings = totalYield * avgPricePerKg;
    // Break-even: quando risparmio supera costi iniziali (semi, attrezzi, etc.)
    const initialCosts = 100; // € stima
    const breakEvenDate = costSavings >= initialCosts ? new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0] // Aprile
     : undefined;
    return {
        totalYield: Math.round(totalYield),
        costSavings: Math.round(costSavings),
        breakEvenDate
    };
};
const optimizeRotations = (plan, garden)=>{
    const optimizedRotations = plan.rotations.map((rotation)=>{
        const availablePlants = Object.values(plan.quarters).flatMap((q)=>q.plantings.map((p)=>p.plantName));
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$rotationOptimizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["optimizeBedRotation"])(rotation, availablePlants, plan.year);
        return result.optimized;
    });
    return {
        ...plan,
        rotations: optimizedRotations
    };
};
const suggestSuccessions = (harvestDate, bed, currentPlan)=>{
    const harvestMonth = new Date(harvestDate).getMonth() + 1;
    const suggestions = [];
    // Trova piante che possono essere piantate dopo questo mese
    const masterSheets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllMasterSheets"])();
    const nextMonths = harvestMonth < 10 ? [
        harvestMonth + 1,
        harvestMonth + 2
    ] : [];
    for (const month of nextMonths){
        const season = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$seasonalAdjustment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSeasonForDate"])(new Date(new Date().getFullYear(), month - 1, 15), 0);
        const suitablePlants = masterSheets.filter((p)=>(p.season === season || p.season === 'Both') && p.plantingMonths?.includes(month));
        for (const plant of suitablePlants.slice(0, 2)){
            suggestions.push({
                plantName: plant.commonName,
                month,
                method: 'Seed',
                quantity: 10,
                bed
            });
        }
    }
    return suggestions;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/mechanicalWorkEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Engine per lavorazioni meccaniche (aratura, fresatura)
 * Per terreni più grandi che utilizzano trattori e attrezzature
 */ __turbopack_context__.s([
    "calculateMechanicalWorkTasks",
    ()=>calculateMechanicalWorkTasks
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$weatherService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/weatherService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$areaConverter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/areaConverter.ts [app-client] (ecmascript)");
;
;
async function calculateMechanicalWorkTasks(garden, currentDate = new Date(), tasks) {
    const suggestions = [];
    // Converti dimensione in m² se necessario
    const sizeInSqM = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$areaConverter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertToSqMeters"])(garden.sizeSqMeters, garden.sizeUnit || 'sqm');
    // Solo per terreni > 1000 m² (1 are)
    if (sizeInSqM < 1000) {
        return suggestions; // Terreno troppo piccolo per lavorazioni meccaniche
    }
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    // Verifica lavorazioni già completate
    const completedPlowing = tasks.some((t)=>t.taskType === 'Plowing' && t.completed);
    const completedTilling = tasks.some((t)=>t.taskType === 'Tilling' && t.completed);
    // Determina tipo attrezzatura in base alla dimensione
    const equipmentType = sizeInSqM >= 5000 ? 'Tractor' : 'Manual';
    // 1. ARATURA (Autunno/Inverno - Ottobre-Febbraio)
    // Aratura profonda per preparare il terreno per le semine primaverili
    if (!completedPlowing && (currentMonth >= 10 || currentMonth <= 2)) {
        const suggestedDate = new Date(currentYear, currentMonth === 10 || currentMonth === 11 || currentMonth === 12 ? currentMonth - 1 : 11, 15);
        // Verifica condizioni meteo
        let weatherWarning;
        if (garden.coordinates) {
            try {
                const weather = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$weatherService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWeatherForecast"])(garden.coordinates.latitude, garden.coordinates.longitude);
                if (weather && weather.rainForecastMm > 10) {
                    weatherWarning = `⚠️ Pioggia prevista (${weather.rainForecastMm.toFixed(1)}mm). Evita aratura con terreno bagnato.`;
                }
            } catch (error) {
                console.error('Error fetching weather for mechanical work:', error);
            }
        }
        suggestions.push({
            taskType: 'Plowing',
            priority: currentMonth === 11 || currentMonth === 12 || currentMonth === 1 ? 'High' : 'Medium',
            message: 'Aratura profonda per preparazione terreno',
            suggestedDate: suggestedDate.toISOString().split('T')[0],
            instructions: [
                'Esegui aratura profonda (30-40 cm) per arieggiare il terreno',
                'Lavora quando il terreno è in tempera (né troppo bagnato né troppo secco)',
                'Evita aratura con terreno gelato o eccessivamente bagnato',
                equipmentType === 'Tractor' ? 'Usa aratro a versoio o ripuntatore per terreni compatti' : 'Per terreni più piccoli, considera vangatura profonda manuale',
                'Dopo aratura, lascia il terreno esposto alle intemperie per migliorare struttura',
                'Programma aratura almeno 2-3 settimane prima delle semine primaverili'
            ],
            equipmentType,
            depth: equipmentType === 'Tractor' ? 35 : 25,
            area: sizeInSqM,
            weatherWarning
        });
    }
    // 2. FRESATURA (Primavera - Marzo-Aprile)
    // Fresatura superficiale per preparare il letto di semina
    if (!completedTilling && (currentMonth === 3 || currentMonth === 4)) {
        const suggestedDate = new Date(currentYear, currentMonth - 1, 10);
        // Verifica condizioni meteo
        let weatherWarning;
        if (garden.coordinates) {
            try {
                const weather = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$weatherService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWeatherForecast"])(garden.coordinates.latitude, garden.coordinates.longitude);
                if (weather && weather.rainForecastMm > 5) {
                    weatherWarning = `⚠️ Pioggia prevista. Attendi terreno asciutto per fresatura.`;
                }
            } catch (error) {
                console.error('Error fetching weather for mechanical work:', error);
            }
        }
        suggestions.push({
            taskType: 'Tilling',
            priority: 'High',
            message: 'Fresatura superficiale per preparazione letto di semina',
            suggestedDate: suggestedDate.toISOString().split('T')[0],
            instructions: [
                'Esegui fresatura superficiale (15-20 cm) per affinare il terreno',
                'Rimuovi erbe infestanti e sassi',
                'Livella il terreno per facilitare semina e irrigazione',
                equipmentType === 'Tractor' ? 'Usa fresa rotativa o erpice rotante' : 'Per piccole superfici, usa zappa o motozappa',
                'Non fresare terreno troppo bagnato per evitare compattazione',
                'Dopo fresatura, attendi 2-3 giorni prima di seminare per stabilizzazione'
            ],
            equipmentType,
            depth: equipmentType === 'Tractor' ? 18 : 15,
            area: sizeInSqM,
            weatherWarning
        });
    }
    return suggestions;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/treePruningEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Engine per potatura alberi (inclusi agrumi)
 * Suggerisce potatura in base a stagione, tipo di albero e condizioni
 */ __turbopack_context__.s([
    "calculateTreePruningTasks",
    ()=>calculateTreePruningTasks
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/lunarCalendar.ts [app-client] (ecmascript)");
;
function calculateTreePruningTasks(garden, currentDate = new Date(), tasks) {
    const suggestions = [];
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    // Trova tutti i task di alberi da frutto nel giardino
    const fruitTreeTasks = tasks.filter((t)=>t.gardenId === garden.id && (t.fruitTreeData || t.taskType === 'TreePruning' || t.plantName.toLowerCase().includes('albero') || t.plantName.toLowerCase().includes('frutto')));
    if (fruitTreeTasks.length === 0) {
        return suggestions; // Nessun albero nel giardino
    }
    // Verifica potature già completate quest'anno
    const currentYearCompletions = tasks.filter((t)=>t.taskType === 'TreePruning' && t.completed && new Date(t.date).getFullYear() === currentYear);
    // Calcola fase lunare
    const moonInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMoonPhase"])(currentDate);
    const lunarAdvice = moonInfo.isWaning ? '🌙 Luna calante: momento ideale per potatura' : '⚠️ Luna crescente: meglio aspettare luna calante per potatura';
    // 1. POTATURA INVERNALE (Dicembre-Febbraio)
    // Per la maggior parte degli alberi da frutto (esclusi agrumi)
    if (currentMonth === 12 || currentMonth === 1 || currentMonth === 2) {
        const suggestedDate = new Date(currentYear, currentMonth === 12 ? 11 : currentMonth - 1, 15);
        // Potatura per alberi da frutto standard (non agrumi)
        const nonCitrusTrees = fruitTreeTasks.filter((t)=>!t.treePruningData || t.treePruningData.treeType !== 'Citrus');
        if (nonCitrusTrees.length > 0 && !currentYearCompletions.some((t)=>t.treePruningData?.season === 'Winter')) {
            suggestions.push({
                taskType: 'TreePruning',
                priority: 'High',
                message: 'Potatura invernale alberi da frutto',
                suggestedDate: suggestedDate.toISOString().split('T')[0],
                instructions: [
                    'Esegui potatura durante il riposo vegetativo (dicembre-febbraio)',
                    'Rimuovi rami secchi, malati, danneggiati o che si incrociano',
                    'Apri la chioma per favorire penetrazione luce e aereazione',
                    'Taglia sopra gemma esterna per favorire crescita verso l\'esterno',
                    'Mantieni forma a vaso o palmetta secondo sistema di allevamento',
                    'Disinfetta attrezzi tra un albero e l\'altro per prevenire malattie',
                    'Evita potatura con temperature sotto zero'
                ],
                treeType: 'Pome',
                pruningType: 'Maintenance',
                season: 'Winter',
                lunarAdvice
            });
        }
        // Potatura agrumi (diversa da altri fruttiferi)
        const citrusTrees = fruitTreeTasks.filter((t)=>t.treePruningData?.treeType === 'Citrus');
        if (citrusTrees.length > 0) {
            // Agrumi: potatura più leggera in inverno, principale in primavera
            suggestions.push({
                taskType: 'TreePruning',
                priority: 'Medium',
                message: 'Potatura invernale agrumi (leggera)',
                suggestedDate: suggestedDate.toISOString().split('T')[0],
                instructions: [
                    'Agrumi: potatura invernale leggera (rimozione rami secchi)',
                    'Evita potature drastiche in inverno per agrumi',
                    'Rimuovi solo rami morti, malati o danneggiati',
                    'La potatura principale degli agrumi si fa in primavera (marzo-aprile)',
                    'Proteggi i tagli con mastice cicatrizzante',
                    'Disinfetta attrezzi tra un albero e l\'altro'
                ],
                treeType: 'Citrus',
                pruningType: 'Maintenance',
                season: 'Winter',
                lunarAdvice
            });
        }
    }
    // 2. POTATURA PRIMAVERILE AGRUMI (Marzo-Aprile)
    // Potatura principale per agrumi (diversa da altri fruttiferi)
    if (currentMonth === 3 || currentMonth === 4) {
        const citrusTrees = fruitTreeTasks.filter((t)=>t.treePruningData?.treeType === 'Citrus');
        if (citrusTrees.length > 0) {
            const suggestedDate = new Date(currentYear, currentMonth - 1, 10);
            const moonInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMoonPhase"])(suggestedDate);
            const lunarAdvice = moonInfo.isWaning ? '🌙 Luna calante: momento ideale per potatura agrumi' : '⚠️ Luna crescente: meglio aspettare luna calante';
            suggestions.push({
                taskType: 'TreePruning',
                priority: 'High',
                message: 'Potatura primaverile agrumi (principale)',
                suggestedDate: suggestedDate.toISOString().split('T')[0],
                instructions: [
                    'Agrumi: potatura principale in primavera (marzo-aprile)',
                    'Rimuovi succhioni e rami che crescono verso l\'interno',
                    'Apri la chioma per favorire aereazione e penetrazione luce',
                    'Mantieni forma globosa o a vaso aperto',
                    'Taglia rami che toccano il terreno',
                    'Riduci altezza se necessario (max 3-4m per facilitare raccolta)',
                    'Dopo potatura, applica concimazione per favorire ripresa vegetativa',
                    'Proteggi i tagli principali con mastice cicatrizzante',
                    'Disinfetta attrezzi tra un albero e l\'altro'
                ],
                treeType: 'Citrus',
                pruningType: 'Maintenance',
                season: 'Winter',
                lunarAdvice
            });
        }
    }
    // 3. POTATURA ESTIVA (Giugno-Luglio)
    // Potatura verde per controllo vegetazione
    if (currentMonth === 6 || currentMonth === 7) {
        const suggestedDate = new Date(currentYear, currentMonth - 1, 15);
        const moonInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMoonPhase"])(suggestedDate);
        const lunarAdvice = moonInfo.isWaning ? '🌙 Luna calante: ideale per potatura verde' : '⚠️ Luna crescente: meglio aspettare luna calante';
        suggestions.push({
            taskType: 'TreePruning',
            priority: 'Medium',
            message: 'Potatura estiva (controllo vegetazione)',
            suggestedDate: suggestedDate.toISOString().split('T')[0],
            instructions: [
                'Potatura verde estiva per controllo vegetazione eccessiva',
                'Rimuovi succhioni e rami che crescono verticalmente',
                'Dirada rami troppo fitti per favorire maturazione frutti',
                'Rimuovi rami danneggiati o malati',
                'Per agrumi: rimuovi succhioni basali e rami che toccano il terreno',
                'Evita potature drastiche in estate (stress idrico)',
                'Irriga dopo potatura se necessario'
            ],
            treeType: 'Pome',
            pruningType: 'Maintenance',
            season: 'Summer',
            lunarAdvice
        });
    }
    return suggestions;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/calendarTimelineEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Calendar Timeline Engine
 * Genera timeline automatica delle fasi successive quando viene completata una semina
 * Integrato nell'orchestrator per generare suggerimenti automatici
 */ __turbopack_context__.s([
    "convertToGardenTask",
    ()=>convertToGardenTask,
    "generateTimelineFromSowing",
    ()=>generateTimelineFromSowing
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/lunarCalendar.ts [app-client] (ecmascript)");
;
function generateTimelineFromSowing(sowingTask, masterData, garden) {
    const sowingDate = new Date(sowingTask.date);
    const suggestedTasks = [];
    // Calcola giorni per fase
    const avgGerminationDays = (masterData.germination.emergenceDays.min + masterData.germination.emergenceDays.max) / 2;
    const nursingDays = 30;
    const hardeningDays = 10;
    const transplantDays = avgGerminationDays + nursingDays + hardeningDays;
    // 1. TRAPIANTO (se applicabile)
    if (sowingTask.plantingMethod === 'Seed' && masterData.transplanting) {
        const transplantDate = new Date(sowingDate);
        transplantDate.setDate(transplantDate.getDate() + transplantDays);
        // Verifica fase lunare ideale per trapianto
        const moonCheck = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isIdealPhaseFor"])('transplant', masterData.nutrientCategory, transplantDate);
        if (!moonCheck.ideal && moonCheck.daysUntilIdeal) {
            transplantDate.setDate(transplantDate.getDate() + moonCheck.daysUntilIdeal);
        }
        suggestedTasks.push({
            taskType: 'Transplant',
            suggestedDate: transplantDate.toISOString().split('T')[0],
            title: `Trapianto ${sowingTask.plantName}`,
            description: `Trapianto previsto dopo ${transplantDays} giorni dalla semina. Verifica che le piantine abbiano almeno 4-6 foglie vere.`,
            priority: 'High',
            plantName: sowingTask.plantName,
            gardenId: sowingTask.gardenId,
            isSuggested: true,
            suggestedBy: sowingTask.id
        });
    }
    // 2. CONCIMAZIONI (ogni 20-30 giorni dopo trapianto o 40 giorni dopo semina)
    const firstFertilizationDays = sowingTask.plantingMethod === 'Seed' ? transplantDays + 20 : 40;
    const fertilizationInterval = 25; // giorni tra una concimazione e l'altra
    for(let i = 0; i < 4; i++){
        const fertDate = new Date(sowingDate);
        fertDate.setDate(fertDate.getDate() + firstFertilizationDays + i * fertilizationInterval);
        // Non suggerire concimazioni oltre la fine del ciclo
        const daysToHarvest = masterData.harvestWindow?.daysToFirstHarvest || 90;
        if (fertDate.getTime() > sowingDate.getTime() + daysToHarvest * 24 * 60 * 60 * 1000) {
            break;
        }
        suggestedTasks.push({
            taskType: 'Fertilize',
            suggestedDate: fertDate.toISOString().split('T')[0],
            title: `Concimazione ${sowingTask.plantName} - ${i + 1}° applicazione`,
            description: i === 0 ? 'Prima concimazione dopo trapianto/sviluppo iniziale' : `Concimazione di mantenimento (${i + 1}° applicazione)`,
            priority: i === 0 ? 'High' : 'Medium',
            plantName: sowingTask.plantName,
            gardenId: sowingTask.gardenId,
            isSuggested: true,
            suggestedBy: sowingTask.id
        });
    }
    // 3. TRATTAMENTI PREVENTIVI (ogni 15 giorni durante crescita)
    const firstTreatmentDays = sowingTask.plantingMethod === 'Seed' ? transplantDays + 10 : 30;
    const treatmentInterval = 15;
    for(let i = 0; i < 3; i++){
        const treatmentDate = new Date(sowingDate);
        treatmentDate.setDate(treatmentDate.getDate() + firstTreatmentDays + i * treatmentInterval);
        const daysToHarvest = masterData.harvestWindow?.daysToFirstHarvest || 90;
        if (treatmentDate.getTime() > sowingDate.getTime() + daysToHarvest * 24 * 60 * 60 * 1000) {
            break;
        }
        suggestedTasks.push({
            taskType: 'Treatment',
            suggestedDate: treatmentDate.toISOString().split('T')[0],
            title: `Trattamento preventivo ${sowingTask.plantName} - ${i + 1}° applicazione`,
            description: 'Trattamento preventivo per malattie e parassiti comuni',
            priority: 'Medium',
            plantName: sowingTask.plantName,
            gardenId: sowingTask.gardenId,
            isSuggested: true,
            suggestedBy: sowingTask.id
        });
    }
    // 4. RACCOLTA PREVISTA
    const daysToHarvest = masterData.harvestWindow?.daysToFirstHarvest || 90;
    const harvestDate = new Date(sowingDate);
    harvestDate.setDate(harvestDate.getDate() + daysToHarvest);
    suggestedTasks.push({
        taskType: 'Harvest',
        suggestedDate: harvestDate.toISOString().split('T')[0],
        title: `Raccolta prevista ${sowingTask.plantName}`,
        description: `Raccolta prevista dopo ${daysToHarvest} giorni dalla semina. Verifica maturazione prima di raccogliere.`,
        priority: 'High',
        plantName: sowingTask.plantName,
        gardenId: sowingTask.gardenId,
        isSuggested: true,
        suggestedBy: sowingTask.id
    });
    return {
        sowingDate,
        plantName: sowingTask.plantName,
        suggestedTasks
    };
}
function convertToGardenTask(suggested, originalSowingTask) {
    return {
        id: crypto.randomUUID(),
        gardenId: suggested.gardenId,
        plantName: suggested.plantName,
        variety: originalSowingTask.variety,
        plantingMethod: originalSowingTask.plantingMethod,
        taskType: suggested.taskType,
        date: suggested.suggestedDate,
        suggestedDate: suggested.suggestedDate,
        isSuggested: true,
        suggestedBy: suggested.suggestedBy,
        completed: false,
        notes: suggested.description,
        lifecycleState: suggested.taskType === 'Transplant' ? 'Transplanting' : suggested.taskType === 'Harvest' ? 'Production' : undefined
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/taskSynchronizer.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Task Synchronizer
 * Sincronizza suggerimenti dell'orchestrator con completamenti reali
 * Gestisce il caso in cui un lavoro viene fatto in data diversa da quella suggerita
 */ __turbopack_context__.s([
    "getPendingSuggestions",
    ()=>getPendingSuggestions,
    "isSuggestionStillValid",
    ()=>isSuggestionStillValid,
    "markSuggestionAsCompleted",
    ()=>markSuggestionAsCompleted,
    "syncTaskCompletion",
    ()=>syncTaskCompletion,
    "updateOrchestratorFromCompletion",
    ()=>updateOrchestratorFromCompletion
]);
function syncTaskCompletion(task, actualDate) {
    const updatedTask = {
        ...task
    };
    // Se è un task suggerito
    if (task.isSuggested && task.suggestedDate) {
        const suggestedDate = new Date(task.suggestedDate);
        const actualDateStr = actualDate.toISOString().split('T')[0];
        const suggestedDateStr = suggestedDate.toISOString().split('T')[0];
        // Se completato in data diversa da quella suggerita
        if (actualDateStr !== suggestedDateStr) {
            updatedTask.actualCompletedDate = actualDate.toISOString();
            updatedTask.date = actualDateStr; // Aggiorna anche la data principale
            // Aggiungi nota sulla differenza
            const daysDiff = Math.floor((actualDate.getTime() - suggestedDate.getTime()) / (1000 * 60 * 60 * 24));
            const diffNote = `\n\n[Completato ${daysDiff > 0 ? `${daysDiff} giorni dopo` : `${Math.abs(daysDiff)} giorni prima`} rispetto alla data suggerita (${suggestedDateStr})]`;
            updatedTask.notes = (updatedTask.notes || '') + diffNote;
        } else {
            // Completato nella data suggerita
            updatedTask.actualCompletedDate = actualDate.toISOString();
        }
    } else {
        // Task non suggerito, usa semplicemente la data di completamento
        updatedTask.date = actualDate.toISOString().split('T')[0];
    }
    updatedTask.completed = true;
    return updatedTask;
}
function markSuggestionAsCompleted(suggestedTaskId, actualDate, allTasks) {
    const suggestedTask = allTasks.find((t)=>t.id === suggestedTaskId);
    if (!suggestedTask || !suggestedTask.isSuggested) {
        throw new Error(`Task suggerito non trovato: ${suggestedTaskId}`);
    }
    const suggestedDate = suggestedTask.suggestedDate ? new Date(suggestedTask.suggestedDate) : new Date(suggestedTask.date);
    const actualDateStr = actualDate.toISOString().split('T')[0];
    const suggestedDateStr = suggestedDate.toISOString().split('T')[0];
    // Se completato nella stessa data suggerita, aggiorna semplicemente
    if (actualDateStr === suggestedDateStr) {
        const updatedTask = syncTaskCompletion(suggestedTask, actualDate);
        return {
            updatedTask
        };
    }
    // Se completato in data diversa:
    // 1. Marca il task suggerito come completato (per tracciabilità)
    const updatedSuggestedTask = {
        ...suggestedTask,
        completed: true,
        actualCompletedDate: actualDate.toISOString(),
        notes: (suggestedTask.notes || '') + `\n\n[Completato in data diversa: ${actualDateStr} invece di ${suggestedDateStr}]`
    };
    // 2. Crea nuovo task con data effettiva (per calendario)
    const newTask = {
        ...suggestedTask,
        id: crypto.randomUUID(),
        date: actualDateStr,
        suggestedDate: suggestedDateStr,
        actualCompletedDate: actualDate.toISOString(),
        completed: true,
        notes: (suggestedTask.notes || '') + `\n\n[Completato il ${actualDateStr}. Data suggerita: ${suggestedDateStr}]`
    };
    return {
        updatedTask: updatedSuggestedTask,
        newTask
    };
}
function getPendingSuggestions(tasks) {
    return tasks.filter((t)=>t.isSuggested === true && !t.completed);
}
function updateOrchestratorFromCompletion(completedTask, allTasks) {
    // Se è un task suggerito completato in data diversa
    if (completedTask.isSuggested && completedTask.actualCompletedDate) {
        const actualDate = new Date(completedTask.actualCompletedDate);
        return {
            shouldRecalculate: true,
            baseDate: actualDate // Usa data effettiva, non quella suggerita
        };
    }
    // Se è un task normale o completato nella data suggerita
    if (completedTask.completed) {
        const completionDate = completedTask.actualCompletedDate ? new Date(completedTask.actualCompletedDate) : new Date(completedTask.date);
        return {
            shouldRecalculate: true,
            baseDate: completionDate
        };
    }
    return {
        shouldRecalculate: false,
        baseDate: new Date()
    };
}
function isSuggestionStillValid(suggestedTask, currentDate = new Date()) {
    if (!suggestedTask.isSuggested || !suggestedTask.suggestedDate) {
        return {
            valid: true
        };
    }
    const suggestedDate = new Date(suggestedTask.suggestedDate);
    const daysDiff = Math.floor((currentDate.getTime() - suggestedDate.getTime()) / (1000 * 60 * 60 * 24));
    // Suggerimento valido se non è passato più di 30 giorni dalla data suggerita
    if (daysDiff > 30) {
        return {
            valid: false,
            reason: `Suggerimento scaduto (${daysDiff} giorni fa)`
        };
    }
    return {
        valid: true
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/fertilizerEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Fertilizer Engine
 * Converte fabbisogni nutrizionali (da Nutrient Engine) in prodotti concreti con dosaggi specifici
 */ __turbopack_context__.s([
    "calculateApplicationTiming",
    ()=>calculateApplicationTiming,
    "calculateFertilizerDosage",
    ()=>calculateFertilizerDosage,
    "checkIncompatibilities",
    ()=>checkIncompatibilities,
    "suggestFertilizerPlan",
    ()=>suggestFertilizerPlan,
    "suggestFertilizerProduct",
    ()=>suggestFertilizerProduct
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$fertilizers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/data/fertilizers.ts [app-client] (ecmascript)");
;
function calculateFertilizerDosage(plant, nutrientNeeds, soilType, fertilizer, areaSqm = 1) {
    // Verifica compatibilità prodotto con tipo terreno
    if (fertilizer.suitableSoilTypes && !fertilizer.suitableSoilTypes.includes(soilType || 'Loamy')) {
        return null;
    }
    // Verifica compatibilità con pianta
    if (fertilizer.suitablePlants && !fertilizer.suitablePlants.includes(plant.commonName)) {
    // Non escludere, ma potrebbe non essere ottimale
    }
    // Determina dosaggio basato su fabbisogno
    let dosageAmount = fertilizer.dosagePerSqm.min;
    // Aggiusta dosaggio in base a tipo terreno
    if (soilType === 'Sandy') {
        // Terreno sabbioso: aumenta dosaggio del 20% (perde nutrienti)
        dosageAmount = fertilizer.dosagePerSqm.min * 1.2;
    } else if (soilType === 'Clay') {
        // Terreno argilloso: riduci dosaggio del 10% (trattiene meglio)
        dosageAmount = fertilizer.dosagePerSqm.min * 0.9;
    }
    // Aggiusta in base a fase pianta
    if (nutrientNeeds.phase === 'Reproductive' && fertilizer.category === 'npk') {
        // Fase riproduttiva: preferisci prodotti ricchi di P e K
        if (fertilizer.npk && fertilizer.npk.p < 10) {
            dosageAmount *= 1.1; // Aumenta se prodotto non ottimale
        }
    }
    // Limita a range prodotto
    dosageAmount = Math.max(fertilizer.dosagePerSqm.min, Math.min(fertilizer.dosagePerSqm.max, dosageAmount));
    // Calcola quantità totale per area
    const totalQuantityNeeded = dosageAmount * areaSqm;
    // Calcola costo stimato
    const estimatedCost = fertilizer.costPerUnit ? totalQuantityNeeded / 1000 * fertilizer.costPerUnit // Assumendo unità in kg
     : undefined;
    // Determina timing
    const timing = calculateApplicationTiming(plant, fertilizer, soilType);
    // Genera warnings
    const warnings = [];
    if (fertilizer.incompatibilities && fertilizer.incompatibilities.length > 0) {
        warnings.push(`Non mescolare con: ${fertilizer.incompatibilities.map((id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$fertilizers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFertilizerById"])(id)?.name || id).join(', ')}`);
    }
    if (fertilizer.phEffect && soilType) {
        // Verifica pH terreno (semplificato)
        warnings.push(`Effetto pH: ${fertilizer.phEffect}. Verifica pH terreno prima di applicare.`);
    }
    return {
        product: fertilizer,
        dosage: {
            amount: Math.round(dosageAmount * 10) / 10,
            unit: fertilizer.dosagePerSqm.unit,
            perSqm: true
        },
        timing,
        method: fertilizer.applicationMethod,
        reason: generateReason(fertilizer, nutrientNeeds, plant),
        warnings: warnings.length > 0 ? warnings : undefined,
        estimatedCost,
        totalQuantityNeeded: Math.round(totalQuantityNeeded * 10) / 10
    };
}
function suggestFertilizerProduct(nutrientNeeds, soilType, applicationTiming, availableProducts) {
    const products = availableProducts || __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$fertilizers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["allFertilizers"];
    // Filtra prodotti per timing
    const timingProducts = products.filter((p)=>{
        return p.applicationTiming === applicationTiming || p.applicationTiming === 'all_season';
    });
    if (timingProducts.length === 0) {
        return null;
    }
    // Filtra per tipo terreno
    const suitableProducts = timingProducts.filter((p)=>{
        if (p.suitableSoilTypes && p.suitableSoilTypes.length > 0) {
            return p.suitableSoilTypes.includes(soilType || 'Loamy');
        }
        return true; // Nessuna restrizione
    });
    // Seleziona prodotto in base a fabbisogno
    let selectedProduct;
    switch(nutrientNeeds){
        case 'N':
            // Cerca prodotti ricchi di azoto
            selectedProduct = suitableProducts.find((p)=>p.npk && p.npk.n >= 10);
            if (!selectedProduct) {
                selectedProduct = suitableProducts.find((p)=>p.type === 'organic' && p.category === 'manure');
            }
            break;
        case 'P':
            // Cerca prodotti ricchi di fosforo
            selectedProduct = suitableProducts.find((p)=>p.npk && p.npk.p >= 10);
            if (!selectedProduct) {
                selectedProduct = suitableProducts.find((p)=>p.category === 'bone_meal');
            }
            break;
        case 'K':
            // Cerca prodotti ricchi di potassio
            selectedProduct = suitableProducts.find((p)=>p.npk && p.npk.k >= 10);
            if (!selectedProduct) {
                selectedProduct = suitableProducts.find((p)=>p.type === 'mineral' && p.category === 'npk');
            }
            break;
        case 'Micro':
            // Cerca microelementi
            selectedProduct = suitableProducts.find((p)=>p.type === 'microelement');
            break;
        default:
            // Prodotto bilanciato
            selectedProduct = suitableProducts.find((p)=>p.npk && p.npk.n > 0 && p.npk.p > 0 && p.npk.k > 0);
    }
    if (!selectedProduct) {
        // Fallback: primo prodotto disponibile
        selectedProduct = suitableProducts[0];
    }
    if (!selectedProduct) {
        return null;
    }
    // Crea raccomandazione base
    const dosage = selectedProduct.dosagePerSqm.min;
    const timing = new Date(); // Semplificato, dovrebbe essere calcolato meglio
    return {
        product: selectedProduct,
        dosage: {
            amount: dosage,
            unit: selectedProduct.dosagePerSqm.unit,
            perSqm: true
        },
        timing,
        method: selectedProduct.applicationMethod,
        reason: `Prodotto consigliato per fabbisogno ${nutrientNeeds} su terreno ${soilType}`,
        estimatedCost: selectedProduct.costPerUnit ? dosage / 1000 * selectedProduct.costPerUnit : undefined
    };
}
function checkIncompatibilities(product1, product2) {
    // Verifica incompatibilità diretta
    if (product1.incompatibilities?.includes(product2.id) || product2.incompatibilities?.includes(product1.id)) {
        return {
            incompatible: true,
            reason: `${product1.name} e ${product2.name} sono incompatibili. Non mescolare.`
        };
    }
    // Verifica incompatibilità pH
    if (product1.phEffect === 'acidifying' && product2.phEffect === 'alkalizing' || product1.phEffect === 'alkalizing' && product2.phEffect === 'acidifying') {
        return {
            incompatible: true,
            reason: `${product1.name} (${product1.phEffect}) e ${product2.name} (${product2.phEffect}) hanno effetti pH opposti.`
        };
    }
    return {
        incompatible: false
    };
}
function calculateApplicationTiming(plant, fertilizer, soilType) {
    const now = new Date();
    switch(fertilizer.applicationTiming){
        case 'pre_planting':
            // 1-2 settimane prima di piantare
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        case 'top_dressing':
            // Durante crescita
            return now;
        case 'post_harvest':
            // Dopo raccolta
            return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        default:
            return now;
    }
}
function suggestFertilizerPlan(annualPlan, soilType, availableProducts) {
    const plans = [];
    for (const planItem of annualPlan){
        // Semplificato: assume bisogno generale
        const recommendation = suggestFertilizerProduct('None', soilType, 'pre_planting', availableProducts);
        if (recommendation) {
            const dosage = calculateFertilizerDosage({
                commonName: planItem.plantName
            }, {
                elementFocus: 'None',
                shouldFertilize: true
            }, soilType, recommendation.product, planItem.area);
            if (dosage) {
                plans.push({
                    plantName: planItem.plantName,
                    recommendations: [
                        dosage
                    ],
                    totalEstimatedCost: dosage.estimatedCost || 0,
                    applicationSchedule: [
                        {
                            date: planItem.plantingDate,
                            products: [
                                recommendation.product
                            ]
                        }
                    ]
                });
            }
        }
    }
    return plans;
}
/**
 * Genera motivo raccomandazione
 */ function generateReason(fertilizer, nutrientNeeds, plant) {
    const reasons = [];
    if (fertilizer.npk) {
        if (nutrientNeeds.elementFocus === 'N' && fertilizer.npk.n >= 10) {
            reasons.push('Ricco di azoto per crescita vegetativa');
        }
        if (nutrientNeeds.elementFocus === 'P' && fertilizer.npk.p >= 10) {
            reasons.push('Ricco di fosforo per radicazione e fioritura');
        }
        if (nutrientNeeds.elementFocus === 'K' && fertilizer.npk.k >= 10) {
            reasons.push('Ricco di potassio per fruttificazione');
        }
    }
    if (fertilizer.type === 'organic') {
        reasons.push('Migliora struttura terreno');
    }
    if (fertilizer.category === 'slow_release') {
        reasons.push('Rilascio graduale, una sola applicazione per stagione');
    }
    if (reasons.length === 0) {
        return `Prodotto adatto per ${plant.commonName}`;
    }
    return reasons.join('. ');
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/soilTimingEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Soil Timing Engine
 * Calcola timing ottimale per lavorazioni terreno ("terreno in tempera")
 */ __turbopack_context__.s([
    "calculateTemperaDate",
    ()=>calculateTemperaDate,
    "getOptimalWorkWindow",
    ()=>getOptimalWorkWindow,
    "isSoilInTempera",
    ()=>isSoilInTempera
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$weatherService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/weatherService.ts [app-client] (ecmascript)");
;
async function calculateTemperaDate(garden, lastRainDate, lastRainAmount// mm
) {
    if (!garden.coordinates) {
        throw new Error('Coordinate giardino non disponibili');
    }
    // Recupera previsioni meteo
    const forecast = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$weatherService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWeatherForecast"])(garden.coordinates.latitude, garden.coordinates.longitude);
    // Calcola giorni necessari in base a tipo terreno
    let requiredDays = 3; // Default
    if (garden.soilType === 'Clay') {
        requiredDays = 5; // Terreno argilloso: più lento a drenare
    } else if (garden.soilType === 'Sandy') {
        requiredDays = 1; // Terreno sabbioso: drena velocemente
    }
    // Aggiusta in base a quantità pioggia
    if (lastRainAmount > 50) {
        requiredDays += 1; // Pioggia abbondante: più tempo necessario
    }
    // Verifica previsioni: se piove ancora, aggiungi giorni
    if (forecast?.precipitation && forecast.precipitation > 5) {
        requiredDays += 1;
    }
    const temperaDate = new Date(lastRainDate);
    temperaDate.setDate(temperaDate.getDate() + requiredDays);
    return temperaDate;
}
async function isSoilInTempera(garden, currentConditions) {
    if (!garden.coordinates) {
        return {
            isTempera: false,
            reason: 'Coordinate non disponibili'
        };
    }
    // Verifica temperatura
    if (currentConditions.currentTemp !== undefined && currentConditions.currentTemp < 0) {
        return {
            isTempera: false,
            reason: 'Terreno ghiacciato'
        };
    }
    // Verifica pioggia recente
    if (currentConditions.lastRainDate && currentConditions.lastRainAmount) {
        const daysSinceRain = Math.ceil((new Date().getTime() - currentConditions.lastRainDate.getTime()) / (1000 * 60 * 60 * 24));
        let requiredDays = 3;
        if (garden.soilType === 'Clay') requiredDays = 5;
        else if (garden.soilType === 'Sandy') requiredDays = 1;
        if (daysSinceRain < requiredDays && currentConditions.lastRainAmount > 10) {
            return {
                isTempera: false,
                reason: `Terreno ancora umido. Aspetta ${requiredDays - daysSinceRain} giorni.`
            };
        }
    }
    return {
        isTempera: true,
        reason: 'Terreno in tempera, pronto per lavorazione'
    };
}
async function getOptimalWorkWindow(garden, lastRainDate, lastRainAmount) {
    const startDate = await calculateTemperaDate(garden, lastRainDate, lastRainAmount);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3); // Finestra di 3 giorni
    // Verifica previsioni meteo per confidence
    let confidence = 0.8;
    if (garden.coordinates) {
        try {
            const forecast = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$weatherService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWeatherForecast"])(garden.coordinates.latitude, garden.coordinates.longitude);
            if (forecast?.precipitation && forecast.precipitation > 10) {
                confidence = 0.5; // Pioggia prevista riduce confidence
            }
        } catch (error) {
        // Ignora errori meteo
        }
    }
    return {
        startDate,
        endDate,
        confidence,
        reason: `Terreno sarà in tempera tra ${startDate.toLocaleDateString('it-IT')} e ${endDate.toLocaleDateString('it-IT')}`
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/tillageEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Tillage Engine
 * Gestisce tutte le lavorazioni terra: principali, complementari, no-dig
 * Estende/espande mechanicalWorkEngine con funzionalità complete
 */ __turbopack_context__.s([
    "calculateTemperaTiming",
    ()=>calculateTemperaTiming,
    "checkTillageProblems",
    ()=>checkTillageProblems,
    "getOptimalWorkWindow",
    ()=>getOptimalWorkWindow,
    "suggestTillageMethod",
    ()=>suggestTillageMethod,
    "suggestTillageWork",
    ()=>suggestTillageWork
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$soilTimingEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/soilTimingEngine.ts [app-client] (ecmascript)");
;
async function suggestTillageWork(garden, zoneId, soilState, plannedPlanting) {
    if (!garden.coordinates) {
        return null;
    }
    // Verifica se terreno è in tempera
    const temperaCheck = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$soilTimingEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSoilInTempera"])(garden, {
        lastRainDate: soilState?.lastRainDate,
        lastRainAmount: soilState?.lastRainAmount,
        currentTemp: undefined
    });
    if (!temperaCheck.isTempera) {
        return {
            workType: 'Vangatura',
            priority: 'low',
            message: `Terreno non ancora in tempera: ${temperaCheck.reason}`,
            suggestedDate: new Date(),
            optimalWindow: {
                start: new Date(),
                end: new Date()
            },
            instructions: [
                'Aspetta che terreno sia in tempera prima di lavorare'
            ],
            reason: temperaCheck.reason
        };
    }
    // Determina tipo lavorazione necessario
    let workType = 'Vangatura';
    let reason = 'Preparazione terreno per nuova stagione';
    if (plannedPlanting) {
        const daysUntilPlanting = Math.ceil((plannedPlanting.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilPlanting <= 7) {
            workType = 'Vangatura';
            reason = `Preparazione terreno per ${plannedPlanting.plantName} tra ${daysUntilPlanting} giorni`;
        } else if (daysUntilPlanting <= 14) {
            workType = 'Zappatura';
            reason = `Preparazione superficiale per ${plannedPlanting.plantName}`;
        }
    }
    // Verifica compattazione
    if (soilState && soilState.compaction < 0.5) {
        workType = 'Sarchiatura';
        reason = 'Terreno compattato. Sarchiatura migliorerà aerazione';
    }
    // Calcola finestra ottimale
    const optimalWindow = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$soilTimingEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getOptimalWorkWindow"])(garden, soilState?.lastRainDate || new Date(), soilState?.lastRainAmount || 0);
    // Genera istruzioni
    const instructions = generateWorkInstructions(workType, garden, soilState);
    return {
        workType,
        priority: plannedPlanting && plannedPlanting.date.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 ? 'high' : 'medium',
        message: `Lavorazione consigliata: ${workType}`,
        suggestedDate: optimalWindow.startDate,
        optimalWindow: {
            start: optimalWindow.startDate,
            end: optimalWindow.endDate
        },
        depth: getWorkDepth(workType),
        area: garden.sizeSqMeters,
        instructions,
        reason
    };
}
async function calculateTemperaTiming(garden, lastRainDate, lastRainAmount) {
    if (!garden.coordinates) {
        return {
            isTempera: false,
            reason: 'Coordinate non disponibili'
        };
    }
    const temperaDate = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$soilTimingEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateTemperaDate"])(garden, lastRainDate, lastRainAmount);
    const check = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$soilTimingEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSoilInTempera"])(garden, {
        lastRainDate,
        lastRainAmount
    });
    return {
        isTempera: check.isTempera,
        date: temperaDate,
        reason: check.reason
    };
}
async function getOptimalWorkWindow(garden, soilState) {
    if (!garden.coordinates || !soilState?.lastRainDate) {
        return {
            start: new Date(),
            end: new Date(),
            confidence: 0,
            reason: 'Dati insufficienti'
        };
    }
    const window = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$soilTimingEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getOptimalWorkWindow"])(garden, soilState.lastRainDate, soilState.lastRainAmount || 0);
    return {
        start: window.startDate,
        end: window.endDate,
        confidence: window.confidence,
        reason: window.reason
    };
}
function suggestTillageMethod(area, soilType, equipmentAvailable = []) {
    // Area piccola: manuale
    if (area < 100) {
        return {
            method: 'Vangatura',
            tool: 'vanga',
            reason: 'Area piccola, lavorazione manuale sufficiente'
        };
    }
    // Area media: motozappa o manuale
    if (area < 1000) {
        if (equipmentAvailable.includes('motozappa')) {
            return {
                method: 'Fresatura',
                tool: 'motozappa',
                reason: 'Area media, motozappa consigliata'
            };
        }
        return {
            method: 'Vangatura',
            tool: 'vanga',
            reason: 'Area media, lavorazione manuale possibile'
        };
    }
    // Area grande: trattore
    if (area >= 1000) {
        if (equipmentAvailable.includes('trattore')) {
            return {
                method: 'Aratura',
                tool: 'trattore_aratro',
                reason: 'Area grande, trattore necessario'
            };
        }
        return {
            method: 'Fresatura',
            tool: 'motocoltivatore',
            reason: 'Area grande, motocoltivatore consigliato'
        };
    }
    return {
        method: 'Vangatura',
        reason: 'Metodo standard'
    };
}
function checkTillageProblems(soilState, history) {
    const problems = [];
    // Verifica compattazione
    if (soilState.compaction < 0.3) {
        problems.push({
            type: 'compaction',
            severity: 'high',
            description: 'Terreno molto compatto. Aerazione insufficiente.',
            solution: [
                'Esegui sarchiatura profonda',
                'Aggiungi sostanza organica (compost)',
                'Evita calpestio quando terreno è bagnato'
            ]
        });
    }
    // Verifica suola di lavorazione (stessa profondità ripetuta)
    if (history.length >= 3) {
        const depths = history.filter((h)=>h.depth).map((h)=>h.depth).slice(-3);
        if (depths.length === 3 && depths.every((d)=>Math.abs(d - depths[0]) < 5)) {
            problems.push({
                type: 'hardpan',
                severity: 'medium',
                description: `Suola di lavorazione rilevata a ${depths[0]}cm. Stessa profondità ripetuta.`,
                solution: [
                    'Varia profondità lavorazione',
                    'Esegui scasso profondo ogni 3-4 anni',
                    'Usa forca invece di vanga per rompere suola'
                ]
            });
        }
    }
    return problems;
}
/**
 * Genera istruzioni lavorazione
 */ function generateWorkInstructions(workType, garden, soilState) {
    const instructions = [];
    switch(workType){
        case 'Vangatura':
            instructions.push('Scava buche profonde 30-40cm');
            instructions.push('Rivolta zolle per esporre terreno inferiore');
            instructions.push('Rimuovi sassi e radici');
            if (soilState && soilState.compaction < 0.5) {
                instructions.push('Aggiungi compost durante vangatura per migliorare struttura');
            }
            break;
        case 'Sarchiatura':
            instructions.push('Lavora superficie 5-10cm di profondità');
            instructions.push('Rompi crosta superficiale');
            instructions.push('Elimina infestanti');
            instructions.push('Arieggia terreno senza rivoltare strati');
            break;
        case 'Rincalzatura':
            instructions.push('Accumula terreno attorno a base pianta');
            instructions.push('Altezza cumulo: 10-15cm');
            instructions.push('Utile per patate, porri, finocchi, asparagi');
            break;
        case 'Pacciamatura':
            instructions.push('Stendi materiale organico (paglia, cartone, compost)');
            instructions.push('Spessore: 5-10cm');
            instructions.push('Lascia spazio attorno a colletto piante');
            break;
        case 'NoDig':
            instructions.push('NON lavorare terreno');
            instructions.push('Stendi cartone + compost sopra terreno');
            instructions.push('Piantare direttamente nel compost');
            instructions.push('Ottimo per terreni già strutturati');
            break;
        default:
            instructions.push(`Esegui ${workType} secondo metodo standard`);
    }
    return instructions;
}
/**
 * Ottiene profondità lavorazione
 */ function getWorkDepth(workType) {
    const depths = {
        Vangatura: 40,
        Aratura: 30,
        Fresatura: 20,
        Scasso: 60,
        Zappatura: 15,
        Sarchiatura: 8,
        Rincalzatura: 0,
        Erpicatura: 5,
        Rullatura: 0,
        Pacciamatura: 0,
        NoDig: 0
    };
    return depths[workType] || 20;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/phytoEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Phyto Engine
 * Converte diagnosi problemi (da Health Engine) in prodotti concreti con dosaggi e timing critico
 */ __turbopack_context__.s([
    "calculateDosage",
    ()=>calculateDosage,
    "calculateSafetyInterval",
    ()=>calculateSafetyInterval,
    "checkIncompatibilities",
    ()=>checkIncompatibilities,
    "checkTreatmentTiming",
    ()=>checkTreatmentTiming,
    "suggestPhytoProduct",
    ()=>suggestPhytoProduct,
    "suggestTreatmentPlan",
    ()=>suggestTreatmentPlan
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$phytoproducts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/data/phytoproducts.ts [app-client] (ecmascript)");
;
async function suggestPhytoProduct(problem, plant, weatherForecast, userProfile) {
    // Determina se problema è malattia o parassita
    const isDisease = problem.toLowerCase().includes('peronospora') || problem.toLowerCase().includes('oidio') || problem.toLowerCase().includes('ticchiolatura') || problem.toLowerCase().includes('alternaria') || problem.toLowerCase().includes('batteriosi');
    const isPest = problem.toLowerCase().includes('afidi') || problem.toLowerCase().includes('tripidi') || problem.toLowerCase().includes('cocciniglie') || problem.toLowerCase().includes('bruchi') || problem.toLowerCase().includes('lepidotteri');
    // Filtra prodotti disponibili
    let availableProducts = [];
    if (isDisease) {
        availableProducts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$phytoproducts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPhytoProductsForDisease"])(problem);
    } else if (isPest) {
        availableProducts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$phytoproducts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPhytoProductsForPest"])(problem);
    } else {
        // Prova entrambi
        availableProducts = [
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$phytoproducts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPhytoProductsForDisease"])(problem),
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$phytoproducts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPhytoProductsForPest"])(problem)
        ];
    }
    // Filtra per preferenze utente
    if (userProfile?.preferredTreatmentType === 'organic') {
        availableProducts = availableProducts.filter((p)=>p.allowedInOrganic);
    } else if (userProfile?.preferredTreatmentType === 'classic') {
    // Permetti anche convenzionali
    } else {
        // Mixed: preferisci bio ma permetti convenzionali
        availableProducts.sort((a, b)=>{
            if (a.type === 'bio' && b.type === 'conventional') return -1;
            if (a.type === 'conventional' && b.type === 'bio') return 1;
            return 0;
        });
    }
    // Verifica licenza per prodotti convenzionali
    if (userProfile) {
        availableProducts = availableProducts.filter((p)=>{
            if (p.requiresLicense && !userProfile.pesticideLicense?.isValid) {
                return false;
            }
            return true;
        });
    }
    if (availableProducts.length === 0) {
        return null;
    }
    // Seleziona prodotto migliore (più efficace, bio se possibile)
    const selectedProduct = availableProducts[0];
    // Calcola dosaggio
    const dosage = calculateDosage(selectedProduct, plant, problem);
    // Calcola timing
    const timing = new Date(); // Semplificato
    // Genera warnings
    const warnings = [];
    if (selectedProduct.requiresLicense && !userProfile?.pesticideLicense?.isValid) {
        warnings.push('⚠️ Richiede patentino fitosanitario valido');
    }
    if (selectedProduct.type === 'conventional') {
        warnings.push('⚠️ Prodotto chimico convenzionale. Usare con cautela.');
    }
    if (selectedProduct.incompatibilities && selectedProduct.incompatibilities.length > 0) {
        warnings.push(`Non mescolare con: ${selectedProduct.incompatibilities.join(', ')}`);
    }
    return {
        product: selectedProduct,
        dosage,
        timing,
        method: selectedProduct.applicationMethod,
        reason: generateReason(selectedProduct, problem, plant),
        warnings: warnings.length > 0 ? warnings : undefined,
        estimatedCost: selectedProduct.costPerUnit ? dosage.amount / 1000 * selectedProduct.costPerUnit : undefined,
        effectiveness: selectedProduct.effectiveness || 'medium'
    };
}
function calculateDosage(product, plant, problemSeverity) {
    // Dosaggio base
    let dosage = product.dosage.min;
    // Aggiusta per gravità problema
    if (problemSeverity.toLowerCase().includes('grave') || problemSeverity.toLowerCase().includes('severa')) {
        dosage = product.dosage.max;
    } else if (problemSeverity.toLowerCase().includes('lieve') || problemSeverity.toLowerCase().includes('iniziale')) {
        dosage = product.dosage.min;
    } else {
        // Media
        dosage = (product.dosage.min + product.dosage.max) / 2;
    }
    return {
        amount: Math.round(dosage * 10) / 10,
        unit: product.dosage.unit
    };
}
async function checkTreatmentTiming(product, weatherForecast, harvestDate) {
    const currentDate = new Date();
    const daysUntilHarvest = harvestDate ? Math.ceil((harvestDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) : null;
    // Verifica conflitto con raccolta
    if (daysUntilHarvest !== null && daysUntilHarvest < product.safetyInterval) {
        const conflict = true;
        const options = [];
        // Opzione 1: Tratta ora, ritarda raccolta
        if (product.safetyInterval > daysUntilHarvest) {
            options.push({
                action: `Tratta ora, ritarda raccolta di ${product.safetyInterval - daysUntilHarvest} giorni`,
                delay: product.safetyInterval - daysUntilHarvest
            });
        }
        // Opzione 2: Raccogli prima, poi tratta
        options.push({
            action: 'Raccogli prima, poi tratta',
            harvestFirst: true
        });
        // Opzione 3: Usa alternativa senza carenza
        const alternatives = (0, __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$phytoproducts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getProductsWithoutSafetyInterval"])().filter((p)=>p.category === product.category && p.allowedInOrganic === product.allowedInOrganic);
        if (alternatives.length > 0) {
            options.push({
                action: `Usa alternativa senza carenza: ${alternatives[0].name}`,
                alternativeProduct: alternatives[0]
            });
        }
        return {
            conflict,
            message: `Conflitto: raccolta prevista tra ${daysUntilHarvest} giorni, ma tempo carenza ${product.name} è ${product.safetyInterval} giorni`,
            options
        };
    }
    // Verifica condizioni meteo
    if (weatherForecast) {
        const warnings = [];
        if (weatherForecast.precipitation && weatherForecast.precipitation > 5) {
            warnings.push(`Pioggia prevista: dilavamento possibile. Aspetta tempo asciutto.`);
        }
        if (product.weatherConditions.minTemp && weatherForecast.tempMin && weatherForecast.tempMin < product.weatherConditions.minTemp) {
            warnings.push(`Temperatura troppo bassa: minimo ${product.weatherConditions.minTemp}°C richiesto`);
        }
        if (product.weatherConditions.maxTemp && weatherForecast.tempMax && weatherForecast.tempMax > product.weatherConditions.maxTemp) {
            warnings.push(`Temperatura troppo alta: massimo ${product.weatherConditions.maxTemp}°C richiesto`);
        }
        if (product.weatherConditions.windMax && weatherForecast.wind && weatherForecast.wind > product.weatherConditions.windMax) {
            warnings.push(`Vento troppo forte: massimo ${product.weatherConditions.windMax} km/h`);
        }
        if (warnings.length > 0) {
            return {
                conflict: true,
                message: warnings.join('. '),
                options: [
                    {
                        action: 'Aspetta condizioni meteo migliori'
                    }
                ]
            };
        }
    }
    return {
        conflict: false,
        message: 'Timing ottimale per trattamento',
        options: []
    };
}
function calculateSafetyInterval(product, applicationDate) {
    const endDate = new Date(applicationDate);
    endDate.setDate(endDate.getDate() + product.safetyInterval);
    return endDate;
}
function checkIncompatibilities(product1, product2) {
    // Verifica incompatibilità diretta
    if (product1.incompatibilities?.includes(product2.id) || product2.incompatibilities?.includes(product1.id)) {
        return {
            incompatible: true,
            reason: `${product1.name} e ${product2.name} sono incompatibili. Non mescolare.`
        };
    }
    // Verifica incompatibilità categoria (es. rame + zolfo)
    if (product1.id.includes('rame') && product2.id.includes('zolfo') || product1.id.includes('zolfo') && product2.id.includes('rame')) {
        return {
            incompatible: true,
            reason: 'Rame e Zolfo sono incompatibili. Non mescolare.'
        };
    }
    return {
        incompatible: false
    };
}
async function suggestTreatmentPlan(problem, plant, availableProducts) {
    const recommendations = [];
    // Suggerisci prodotto principale
    const mainRecommendation = await suggestPhytoProduct(problem, plant);
    if (mainRecommendation) {
        recommendations.push(mainRecommendation);
    }
    // Suggerisci prodotti complementari se necessario
    // Es: per peronospora, potrebbe suggerire rame + propoli preventivo
    return recommendations;
}
/**
 * Genera motivo raccomandazione
 */ function generateReason(product, problem, plant) {
    const reasons = [];
    if (product.targetDiseases?.some((d)=>problem.toLowerCase().includes(d.toLowerCase()))) {
        reasons.push(`Efficace contro ${problem}`);
    }
    if (product.targetPests?.some((p)=>problem.toLowerCase().includes(p.toLowerCase()))) {
        reasons.push(`Efficace contro ${problem}`);
    }
    if (product.type === 'bio') {
        reasons.push('Prodotto biologico');
    }
    if (product.safetyInterval === 0) {
        reasons.push('Nessun tempo di carenza');
    }
    if (reasons.length === 0) {
        return `Prodotto consigliato per ${problem} su ${plant.commonName}`;
    }
    return reasons.join('. ');
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/logic/director.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDailyGardenPlan",
    ()=>getDailyGardenPlan
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$weatherService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/weatherService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lifecycleEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/lifecycleEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$nutrientEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/nutrientEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$healthEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/healthEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/lunarCalendar.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/plantMasterService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$taskCalculationService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/taskCalculationService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$rainManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/rainManager.ts [app-client] (ecmascript)");
// Specialized crop engines (Pro Features)
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$strawberryEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/strawberryEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$fruitTreeEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/fruitTreeEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$aromaticEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/aromaticEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$oliveEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/oliveEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$vineEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/vineEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$exoticFruitEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/exoticFruitEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$raspberryEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/raspberryEngine.ts [app-client] (ecmascript)");
// Advanced growing systems engines (Pro Features)
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$hydroponicEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/hydroponicEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$aquaponicEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/aquaponicEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$aeroponicEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/aeroponicEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$accessoriesEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/accessoriesEngine.ts [app-client] (ecmascript)");
// Annual Planner integration
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$annualPlannerEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/annualPlannerEngine.ts [app-client] (ecmascript)");
// Nuovi engine per lavorazioni meccaniche, potatura alberi, timeline calendario
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$mechanicalWorkEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/mechanicalWorkEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$treePruningEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/treePruningEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$calendarTimelineEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/calendarTimelineEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$taskSynchronizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/taskSynchronizer.ts [app-client] (ecmascript)");
// Solar Classification integration
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$solarClassificationHelper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/solarClassificationHelper.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$historicalWeatherService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/historicalWeatherService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$seasonalAdjustment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/seasonalAdjustment.ts [app-client] (ecmascript)");
// Soil and Altitude utilities
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$soilTemperatureUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/soilTemperatureUtils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$altitudeUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/altitudeUtils.ts [app-client] (ecmascript)");
// FERTILIZER, TILLAGE, PHYTO Engines
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$fertilizerEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/fertilizerEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$fertilizerInventoryService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/fertilizerInventoryService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$tillageEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/tillageEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$soilStateService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/soilStateService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$phytoEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/logic/phytoEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$treatmentRegistryService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/treatmentRegistryService.ts [app-client] (ecmascript)");
'use client';
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
;
;
;
;
;
;
;
;
;
/**
 * Verifica urgenze climatiche (gelo, caldo estremo, siccità)
 * PRIORITÀ 1: Clima incontrollabile che blocca operazioni
 */ const checkWeatherUrgency = async (coordinates)=>{
    const alerts = [];
    const warnings1 = [];
    if (!coordinates) {
        return {
            alerts,
            warnings: warnings1
        };
    }
    try {
        const forecast = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$weatherService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWeatherForecast"])(coordinates.latitude, coordinates.longitude);
        if (!forecast) {
            return {
                alerts,
                warnings: warnings1
            };
        }
        // Check gelo (frost) - CRITICO
        if (forecast.tempMin !== undefined && forecast.tempMin < 2) {
            alerts.push({
                type: 'Frost',
                message: `⚠️ GELATA PREVISTA: Temperatura minima ${forecast.tempMin.toFixed(1)}°C`,
                action: 'Copri immediatamente le piante sensibili con teli o sposta i vasi al riparo',
                blockOperations: true
            });
        }
        // Check caldo estremo
        if (forecast.tempMax !== undefined && forecast.tempMax > 35) {
            alerts.push({
                type: 'Heat',
                message: `🌡️ CALDO ESTREMO: Temperatura massima ${forecast.tempMax.toFixed(1)}°C`,
                action: 'Aumenta irrigazioni, ombreggia piante sensibili, evita trapianti',
                blockOperations: false
            });
        }
        // Check siccità (nessuna pioggia prevista)
        if (forecast.rainForecastMm < 1) {
            warnings1.push({
                type: 'Rain',
                severity: 'Medium',
                message: 'Nessuna pioggia prevista nei prossimi giorni',
                recommendation: 'Programma irrigazioni regolari, considera pacciamatura per trattenere umidità'
            });
        } else if (forecast.rainForecastMm > 20) {
            warnings1.push({
                type: 'Rain',
                severity: 'High',
                message: `Pioggia intensa prevista: ${forecast.rainForecastMm.toFixed(1)}mm`,
                recommendation: 'Evita trattamenti fogliari, verifica drenaggio, sospendi irrigazioni'
            });
        }
        // Warning temperatura
        if (forecast.tempMin !== undefined && forecast.tempMin < 8) {
            warnings1.push({
                type: 'Temperature',
                severity: 'Medium',
                message: `Temperature basse previste: minima ${forecast.tempMin.toFixed(1)}°C`,
                recommendation: 'Proteggi piante sensibili, evita trapianti fino a riscaldamento'
            });
        }
    } catch (error) {
        console.error('Error checking weather urgency:', error);
    }
    return {
        alerts,
        warnings: warnings1
    };
};
/**
 * Applica modificatori per tipo di terreno ai consigli
 * PRIORITÀ 3: Come fare le operazioni in base al terreno
 */ const applySoilModifier = (advice, soilType)=>{
    if (!soilType || soilType === 'Loamy') {
        return '';
    }
    if (soilType === 'Sandy') {
        return '⚠️ Suolo Sabbioso: Dividi le dosi a metà e applica con frequenza doppia. Usa pacciamatura.';
    }
    if (soilType === 'Clay') {
        return '⚠️ Suolo Argilloso: Puoi dare dosi piene ma meno frequentemente. Importante: sarchiatura post-applicazione.';
    }
    return '';
};
/**
 * Applica aggiustamenti per tipo terreno e altitudine a una data di impianto
 * Combina ritardo altitudine + correzione tipo terreno
 * 
 * @param garden - Giardino con informazioni terreno e altitudine
 * @param baseDate - Data base di semina/trapianto
 * @param plantType - Tipo di pianta per calcolare ritardo altitudine differenziato
 * @returns Data ottimale aggiustata
 */ function applySoilAndAltitudeAdjustments(garden, baseDate, plantType) {
    let adjustedDate = new Date(baseDate);
    // 1. Applica ritardo altitudine (se presente)
    if (garden.altitudeMeters && garden.altitudeMeters > 200) {
        const altitudeDelay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$altitudeUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateAltitudePlantingDelay"])(garden.altitudeMeters, plantType || 'standard');
        adjustedDate.setDate(adjustedDate.getDate() + altitudeDelay);
    }
    // 2. Applica correzione tipo terreno (anticipo/ritardo riscaldamento)
    const soilDelay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$soilTemperatureUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateSoilWarmingDelay"])(garden.soilType);
    adjustedDate.setDate(adjustedDate.getDate() + soilDelay);
    return adjustedDate;
}
/**
 * Determina tipo pianta per calcolo ritardo altitudine
 */ function getPlantTypeForAltitude(plantName) {
    const nameUpper = plantName.toUpperCase();
    // Piante precoci
    const earlyPlants = [
        'LATTUGA',
        'INSALATA',
        'RUCOLA',
        'SPINACIO',
        'RAVANELLO',
        'RAPANELLO'
    ];
    if (earlyPlants.some((name)=>nameUpper.includes(name))) {
        return 'early';
    }
    // Piante tardive
    const latePlants = [
        'POMODORO',
        'PEPERONE',
        'MELANZANA',
        'ZUCCHINA',
        'CETRIOLO'
    ];
    if (latePlants.some((name)=>nameUpper.includes(name))) {
        return 'late';
    }
    return 'standard';
}
/**
 * Determina priorità complessiva del piano giornaliero
 */ const determineOverallPriority = (alerts, lifecycleTasks)=>{
    if (alerts.some((a)=>a.blockOperations)) {
        return 'Critical';
    }
    if (alerts.length > 0 || lifecycleTasks.some((t)=>t.priority === 'Critical' || t.priority === 'High')) {
        return 'High';
    }
    if (lifecycleTasks.length > 0) {
        return 'Medium';
    }
    return 'Low';
};
/**
 * Genera consiglio lunare per il giorno
 * PRIORITÀ 5: Ottimizzazione tradizionale
 */ const generateLunarAdvice = (currentDate)=>{
    const moonInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lunarCalendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMoonPhase"])(currentDate);
    const idealFor = [];
    if (moonInfo.isWaxing) {
        idealFor.push('Semina foglie/frutti', 'Trapianto', 'Raccolta frutti');
    }
    if (moonInfo.isWaning) {
        idealFor.push('Semina radici', 'Raccolta foglie', 'Potatura');
    }
    return {
        phase: moonInfo.phase,
        phaseName: moonInfo.name,
        advice: moonInfo.isWaxing ? 'Luna Crescente: ideale per crescita parte aerea' : 'Luna Calante: ideale per crescita radici',
        idealFor
    };
};
const getDailyGardenPlan = async (garden, tasks, currentDate = new Date(), annualPlan, userProfile, seedlingBatches)=>{
    // PRIORITÀ 1: CLIMA (incontrollabile, blocca operazioni)
    const { alerts: urgentAlerts, warnings: climateWarnings } = await checkWeatherUrgency(garden.coordinates);
    // PRIORITÀ 1.5: CLASSIFICAZIONE SOLARE (coordinamento variabili)
    let solarClassification = null;
    if (garden.coordinates) {
        try {
            // Carica dati meteo storici per calcoli temperatura
            let historicalWeather = null;
            try {
                historicalWeather = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$historicalWeatherService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllHistoricalWeather"])(garden.coordinates.latitude, garden.coordinates.longitude, currentDate.getFullYear());
            } catch (weatherError) {
                console.warn('Could not load historical weather, continuing without temperature adjustments:', weatherError);
            // Continua senza dati meteo storici
            }
            solarClassification = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$solarClassificationHelper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateGardenSolarClassification"])(garden, currentDate, historicalWeather, seedlingBatches);
        } catch (error) {
            console.error('Error calculating solar classification:', error);
        // Continua senza classificazione solare se errore
        }
    }
    // PRIORITÀ 2: CICLO VITALE (cosa fare)
    const lifecycleTasks = [];
    const nutrientTasks = [];
    const healthTasks = [];
    // Filtra solo piante attive (non completate)
    const activeTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$taskCalculationService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getActivePlants"])(tasks.filter((t)=>t.gardenId === garden.id));
    // Verifica deviazioni dal piano annuale (se disponibile)
    const annualPlanDeviations = [];
    if (annualPlan) {
        const currentMonth = currentDate.getMonth() + 1;
        const currentQuarter = currentMonth <= 3 ? 'Q1' : currentMonth <= 6 ? 'Q2' : currentMonth <= 9 ? 'Q3' : 'Q4';
        const quarterPlan = annualPlan.quarters[currentQuarter];
        if (quarterPlan) {
            // Verifica se ci sono piantagioni previste per questo mese che non sono state eseguite
            const expectedPlantings = quarterPlan.plantings.filter((p)=>p.month === currentMonth);
            const actualPlantings = activeTasks.filter((t)=>{
                const taskDate = new Date(t.plantingDate);
                return taskDate.getMonth() + 1 === currentMonth;
            });
            for (const expected of expectedPlantings){
                const found = actualPlantings.find((t)=>t.plantName === expected.plantName);
                if (!found) {
                    annualPlanDeviations.push({
                        type: 'Planning',
                        message: `⚠️ PIANIFICAZIONE: ${expected.plantName} prevista per questo mese non ancora piantata`,
                        action: `Considera di piantare ${expected.plantName} entro la fine del mese per rispettare il piano annuale`,
                        blockOperations: false
                    });
                }
            }
            // Verifica successioni suggerite
            const recentHarvests = tasks.filter((t)=>{
                if (t.harvestDate) {
                    const harvestDate = new Date(t.harvestDate);
                    const daysDiff = Math.floor((currentDate.getTime() - harvestDate.getTime()) / (1000 * 60 * 60 * 24));
                    return daysDiff >= 0 && daysDiff <= 30; // Ultimi 30 giorni
                }
                return false;
            });
            for (const harvest of recentHarvests){
                if (harvest.harvestDate && harvest.bed) {
                    const successions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$annualPlannerEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["suggestSuccessions"])(harvest.harvestDate, harvest.bed, annualPlan);
                    if (successions.length > 0) {
                        const nextPlanting = successions[0];
                        const existingTask = activeTasks.find((t)=>t.plantName === nextPlanting.plantName && t.bed === nextPlanting.bed);
                        if (!existingTask) {
                            annualPlanDeviations.push({
                                type: 'Succession',
                                message: `🌱 SUCCESSIONE SUGGERITA: Dopo ${harvest.plantName}, considera ${nextPlanting.plantName}`,
                                action: `Piantare ${nextPlanting.plantName} in ${nextPlanting.bed || 'aiuola disponibile'} per ottimizzare rotazione`,
                                blockOperations: false
                            });
                        }
                    }
                }
            }
        }
    }
    // Aggiungi deviazioni annual plan agli alert
    urgentAlerts.push(...annualPlanDeviations);
    // Validazione compatibilità piante con classificazione solare e tipo terreno
    if (solarClassification) {
        for (const task of activeTasks){
            // Validazione compatibilità solare
            const solarCompatibility = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$solarClassificationHelper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validatePlantCompatibility"])(task.plantName, solarClassification.classification, solarClassification.windows);
            if (!solarCompatibility.compatible) {
                urgentAlerts.push({
                    type: 'SolarCompatibility',
                    message: `⚠️ COMPATIBILITÀ SOLARE: ${task.plantName} - ${solarCompatibility.reason || 'Non ottimale per tipo orto'}`,
                    action: solarCompatibility.alternativePlants ? `Considera alternative: ${solarCompatibility.alternativePlants.join(', ')}` : 'Verifica esposizione solare richiesta',
                    blockOperations: false
                });
            }
            // Validazione compatibilità terreno
            const soilCompatibility = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$soilTemperatureUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSoilCompatibility"])(task.plantName, garden.soilType);
            if (!soilCompatibility.compatible) {
                urgentAlerts.push({
                    type: 'SolarCompatibility',
                    message: `⚠️ COMPATIBILITÀ TERRENO: ${task.plantName} - ${soilCompatibility.reason || 'Non ottimale per tipo terreno'}`,
                    action: soilCompatibility.optimalSoilTypes ? `Terreni ottimali: ${soilCompatibility.optimalSoilTypes.join(', ')}. Considera miglioramenti o varietà resistenti.` : 'Verifica requisiti terreno della pianta',
                    blockOperations: false
                });
            }
        }
        // Validazione annual plan con classificazione solare
        if (annualPlan && solarClassification) {
            const currentMonth = currentDate.getMonth() + 1;
            const currentQuarter = currentMonth <= 3 ? 'Q1' : currentMonth <= 6 ? 'Q2' : currentMonth <= 9 ? 'Q3' : 'Q4';
            const quarterPlan = annualPlan.quarters[currentQuarter];
            if (quarterPlan) {
                const expectedPlantings = quarterPlan.plantings.filter((p)=>p.month === currentMonth);
                for (const expected of expectedPlantings){
                    const compatibility = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$solarClassificationHelper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validatePlantCompatibility"])(expected.plantName, solarClassification.classification, solarClassification.windows);
                    if (!compatibility.compatible) {
                        urgentAlerts.push({
                            type: 'SolarCompatibility',
                            message: `⚠️ PIANIFICAZIONE SOLARE: ${expected.plantName} prevista per questo mese non è ottimale per tipo orto`,
                            action: compatibility.alternativePlants ? `Considera alternative: ${compatibility.alternativePlants.join(', ')}` : 'Verifica esposizione solare richiesta',
                            blockOperations: false
                        });
                    }
                }
            }
        }
    }
    for (const task of activeTasks){
        const masterData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMasterSheet"])(task.plantName);
        if (!masterData) continue;
        // Check lifecycle status
        const lifecycleAdvice = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$lifecycleEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkLifecycleStatus"])(task, masterData, garden, currentDate);
        if (lifecycleAdvice) {
            let lifecycleMessage = lifecycleAdvice.message;
            let lifecycleAction = lifecycleAdvice.actionYes;
            // Ottimizza timing basato su finestre di impianto solari, terreno e altitudine
            if (solarClassification && (task.taskType === 'Sowing' || task.taskType === 'Transplant')) {
                const relevantWindow = solarClassification.plantingWindows.find((pw)=>pw.recommendedPlants.some((rp)=>task.plantName.toLowerCase().includes(rp.toLowerCase())));
                if (relevantWindow) {
                    const taskDate = new Date(task.date);
                    const windowStart = new Date(relevantWindow.startDate);
                    const windowEnd = new Date(relevantWindow.endDate);
                    // Applica aggiustamenti terreno e altitudine alla finestra
                    const plantType = getPlantTypeForAltitude(task.plantName);
                    const adjustedWindowStart = applySoilAndAltitudeAdjustments(garden, windowStart, plantType);
                    const adjustedWindowEnd = applySoilAndAltitudeAdjustments(garden, windowEnd, plantType);
                    // Verifica se terreno è pronto (se abbiamo temperatura aria disponibile)
                    if (garden.coordinates && masterData.transplanting?.minTemp) {
                        try {
                            const forecast = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$weatherService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWeatherForecast"])(garden.coordinates.latitude, garden.coordinates.longitude);
                            if (forecast && forecast.tempMin !== undefined) {
                                const effectiveTemp = garden.altitudeMeters ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$altitudeUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateEffectiveTemperature"])(garden.altitudeMeters, forecast.tempMin) : forecast.tempMin;
                                const soilTemp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$soilTemperatureUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateSoilHeatingRate"])(garden.soilType, effectiveTemp);
                                const isReady = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$soilTemperatureUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSoilReadyForPlanting"])(garden.soilType, effectiveTemp, masterData.transplanting.minTemp);
                                if (!isReady) {
                                    lifecycleMessage += ` ⚠️ Terreno non ancora pronto (temp. suolo: ${soilTemp.toFixed(1)}°C, richiesta: ${masterData.transplanting.minTemp}°C)`;
                                    lifecycleAction = `${lifecycleAction || ''} Aspetta che il terreno si scaldi. Data suggerita: ${adjustedWindowStart.toLocaleDateString('it-IT')}`.trim();
                                }
                            }
                        } catch (error) {
                        // Ignora errori meteo, continua con logica normale
                        }
                    }
                    if (taskDate < adjustedWindowStart || taskDate > adjustedWindowEnd) {
                        const adjustments = [];
                        if (garden.altitudeMeters && garden.altitudeMeters > 200) {
                            adjustments.push(`altitudine ${garden.altitudeMeters}m`);
                        }
                        if (garden.soilType && garden.soilType !== 'Loamy') {
                            adjustments.push(`terreno ${garden.soilType}`);
                        }
                        const adjustmentsText = adjustments.length > 0 ? ` (aggiustata per ${adjustments.join(', ')})` : '';
                        lifecycleMessage += ` ⚠️ Fuori finestra ottimale${adjustmentsText} (${adjustedWindowStart.toLocaleDateString('it-IT')} - ${adjustedWindowEnd.toLocaleDateString('it-IT')})`;
                        lifecycleAction = `${lifecycleAction || ''} Finestra ottimale: ${adjustedWindowStart.toLocaleDateString('it-IT')} - ${adjustedWindowEnd.toLocaleDateString('it-IT')}`.trim();
                    }
                }
            }
            lifecycleTasks.push({
                taskId: task.id,
                plantName: task.plantName,
                phase: lifecycleAdvice.phase,
                message: lifecycleMessage,
                priority: lifecycleAdvice.type === 'WARNING' ? 'High' : lifecycleAdvice.type === 'TASK' ? 'Medium' : 'Low',
                action: lifecycleAction
            });
            // Estrai consigli nutrizionali e salute dal lifecycle advice
            if (lifecycleAdvice.relatedAdvice?.nutrients) {
                const nutrientAdvice = lifecycleAdvice.relatedAdvice.nutrients;
                if (nutrientAdvice.shouldFertilize) {
                    nutrientTasks.push({
                        plantName: task.plantName,
                        element: nutrientAdvice.elementFocus,
                        adviceTitle: nutrientAdvice.adviceTitle,
                        adviceBody: nutrientAdvice.adviceBody + ' ' + applySoilModifier(nutrientAdvice, garden.soilType),
                        priority: nutrientAdvice.elementFocus === 'None' ? 'Low' : 'Medium'
                    });
                }
            }
            if (lifecycleAdvice.relatedAdvice?.health) {
                const healthAdvice = lifecycleAdvice.relatedAdvice.health;
                healthTasks.push({
                    plantName: task.plantName,
                    productToUse: healthAdvice.productToUse,
                    reason: healthAdvice.reason + ' ' + applySoilModifier(healthAdvice, garden.soilType),
                    priority: healthAdvice.priority,
                    actionType: healthAdvice.actionType
                });
            }
        }
        // Se non c'è lifecycle advice ma la pianta è attiva, calcola comunque nutrienti e salute
        if (!lifecycleAdvice) {
            const daysActive1 = Math.floor((currentDate.getTime() - new Date(task.date).getTime()) / (1000 * 60 * 60 * 24));
            const nutrientAdvice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$nutrientEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateNutrientNeeds"])(masterData, daysActive1, garden.soilType);
            if (nutrientAdvice.shouldFertilize) {
                nutrientTasks.push({
                    plantName: task.plantName,
                    element: nutrientAdvice.elementFocus,
                    adviceTitle: nutrientAdvice.adviceTitle,
                    adviceBody: nutrientAdvice.adviceBody + ' ' + applySoilModifier(nutrientAdvice, garden.soilType),
                    priority: 'Medium'
                });
                // FERTILIZER ENGINE: Suggerisci prodotto concreto
                try {
                    const fertilizerRec = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$fertilizerEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["suggestFertilizerProduct"])(nutrientAdvice.elementFocus, garden.soilType, 'top_dressing');
                    if (fertilizerRec) {
                        // Aggiungi alert se scorte basse
                        const stockAlerts = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$fertilizerInventoryService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkLowStock"])(garden.id, (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$seasonalAdjustment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSeasonForDate"])(currentDate, garden.coordinates?.latitude || 0));
                        if (stockAlerts.length > 0) {
                            urgentAlerts.push({
                                type: 'Planning',
                                message: `⚠️ Scorte fertilizzanti basse: ${stockAlerts[0].item.productName}`,
                                action: stockAlerts[0].reason,
                                blockOperations: false
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error suggesting fertilizer product:', error);
                }
            }
            // Calcola stagione per health strategy
            const season = garden.coordinates ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$seasonalAdjustment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSeasonForDate"])(currentDate, garden.coordinates.latitude) : undefined;
            const latitude = garden.coordinates?.latitude || 0;
            const healthAdvice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$healthEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateHealthStrategy"])(masterData, daysActive1, season, latitude, userProfile);
            if (healthAdvice) {
                // Aggiungi wind factor al health advice
                const windAdvice = calculateWindEffect(garden.windProtection, masterData);
                if (windAdvice.risk !== 'LOW') {
                    // Integra wind advice nel reason
                    healthAdvice.reason += ` ${windAdvice.message}`;
                    if (windAdvice.action) {
                        healthAdvice.applicationNotes = (healthAdvice.applicationNotes || '') + ` ${windAdvice.action}`;
                    }
                    healthAdvice.windAdvice = windAdvice;
                    // Aumenta priorità se rischio alto
                    if (windAdvice.risk === 'HIGH' && healthAdvice.priority === 'Medium') {
                        healthAdvice.priority = 'High';
                    }
                }
                healthTasks.push({
                    plantName: task.plantName,
                    productToUse: healthAdvice.productToUse,
                    reason: healthAdvice.reason + ' ' + applySoilModifier(healthAdvice, garden.soilType),
                    priority: healthAdvice.priority,
                    actionType: healthAdvice.actionType
                });
                // PHYTO ENGINE: Suggerisci prodotto concreto con timing critico
                if (healthAdvice.actionType === 'Prevent' || healthAdvice.actionType === 'Treat') {
                    try {
                        const weatherForecast = garden.coordinates ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$weatherService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWeatherForecast"])(garden.coordinates.latitude, garden.coordinates.longitude) : undefined;
                        const phytoRec = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$phytoEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["suggestPhytoProduct"])(healthAdvice.reason, masterData, weatherForecast, userProfile);
                        if (phytoRec) {
                            // Verifica timing con raccolta
                            const harvestTask = tasks.find((t)=>t.plantName === task.plantName && t.taskType === 'Harvest' && !t.completed);
                            if (harvestTask) {
                                const timingCheck = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$phytoEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkTreatmentTiming"])(phytoRec.product, weatherForecast, new Date(harvestTask.date));
                                if (timingCheck.conflict) {
                                    urgentAlerts.push({
                                        type: 'Planning',
                                        message: `⚠️ Conflitto trattamento/raccolta: ${timingCheck.message}`,
                                        action: timingCheck.options.map((o)=>o.action).join(' o '),
                                        blockOperations: false,
                                        timing: 'now'
                                    });
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Error suggesting phyto product:', error);
                    }
                }
            } else if (garden.windProtection && garden.windProtection !== 'Medium') {
                // Se non c'è health advice ma c'è problema vento, aggiungi warning
                const windAdvice = calculateWindEffect(garden.windProtection, masterData);
                if (windAdvice.risk !== 'LOW') {
                    warnings.push({
                        type: 'Wind',
                        severity: windAdvice.risk === 'HIGH' ? 'High' : 'Medium',
                        message: `Vento: ${windAdvice.message}`,
                        recommendation: windAdvice.action || windAdvice.improvement || 'Monitora condizioni vento'
                    });
                }
            }
            // Fertirrigazione: Calcola piano fertirrigazione se necessario
            const fertigationPlan = calculateFertigationPlan(task, masterData, garden, currentDate);
            if (fertigationPlan.shouldFertigate) {
                const priority = garden.soilType === 'Sandy' ? 'High' : 'Medium';
                const productInfo = fertigationPlan.product ? `${fertigationPlan.product.name} (${fertigationPlan.dosage.totalForIrrigation.toFixed(1)}${fertigationPlan.dosage.unit})` : 'Fertirrigazione consigliata';
                lifecycleTasks.push({
                    taskId: task.id,
                    plantName: task.plantName,
                    phase: 'Fertirrigazione',
                    message: `💧 ${productInfo} per ${task.plantName}`,
                    priority,
                    action: fertigationPlan.instructions.join('; ')
                });
            }
            // Prevenzione Malattie: Suggerimenti preventivi basati su stagione/meteo
            if (daysActive1 > 20) {
                const season = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$seasonalAdjustment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSeasonForDate"])(currentDate, garden.coordinates?.latitude || 0);
                const preventiveMeasures = getPreventiveMeasures(task.plantName, season, garden);
                if (preventiveMeasures.length > 0) {
                    // Aggiungi solo se non ci sono già health tasks critici
                    const hasCriticalHealth = healthTasks.some((ht)=>ht.priority === 'High' && ht.plantName === task.plantName);
                    if (!hasCriticalHealth) {
                        warnings.push({
                            type: 'Disease Prevention',
                            severity: 'Low',
                            message: `Prevenzione malattie per ${task.plantName}: ${preventiveMeasures.slice(0, 2).join(', ')}`,
                            recommendation: preventiveMeasures.join('; ')
                        });
                    }
                }
            }
        }
        // Rain Management: Verifica se task richiede irrigazione e aggiusta in base a pioggia
        if (forecast7Days.length > 0 && (task.taskType === 'Fertilize' || daysActive % 3 === 0)) {
            // Task che potrebbero richiedere irrigazione (fertilizzazione o routine)
            const irrigationAdjustment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$rainManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["adjustIrrigationForRain"])(task, forecast7Days, garden);
            if (irrigationAdjustment.action === 'CANCEL') {
                // Aggiungi warning per skip irrigazione
                warnings.push({
                    type: 'Rain',
                    severity: 'Medium',
                    message: `Irrigazione non necessaria per ${task.plantName}: ${irrigationAdjustment.message}`,
                    recommendation: irrigationAdjustment.nextScheduledDate ? `Riprogramma irrigazione per ${irrigationAdjustment.nextScheduledDate.toLocaleDateString('it-IT')}` : 'Monitora umidità terreno'
                });
            } else if (irrigationAdjustment.action === 'REDUCE') {
                // Aggiungi warning per riduzione dose
                warnings.push({
                    type: 'Rain',
                    severity: 'Low',
                    message: `Riduci irrigazione per ${task.plantName}: ${irrigationAdjustment.message}`,
                    recommendation: `Irriga per ${irrigationAdjustment.adjustedDuration} minuti invece del normale`
                });
            }
        }
    }
    // PRIORITÀ 4.5: GESTIONE COLTURE SPECIALIZZATE (Pro Features)
    // Verifica e aggiunge task per fragole, frutteti, erbe, olivo, vite
    const specializedTasks = [];
    let weatherForecast;
    if (garden.coordinates) {
        try {
            weatherForecast = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$weatherService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWeatherForecast"])(garden.coordinates.latitude, garden.coordinates.longitude);
        } catch (error) {
            console.error('Error fetching weather for specialized crops:', error);
        }
    }
    for (const task of activeTasks){
        const masterData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMasterSheet"])(task.plantName);
        if (!masterData || !masterData.cropType) continue;
        try {
            // FRAGOLE
            if (masterData.cropType === 'Strawberry') {
                const strawberryCrop = masterData;
                const strawberryTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$strawberryEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateStrawberryTasks"])(strawberryCrop, currentDate);
                for (const st of strawberryTasks){
                    specializedTasks.push({
                        taskId: task.id,
                        plantName: task.plantName,
                        phase: `Fragole: ${st.taskType}`,
                        message: st.message,
                        priority: st.priority === 'High' ? 'High' : 'Medium',
                        action: st.instructions.join('; ')
                    });
                }
            }
            // FRUTTETI
            if (masterData.cropType === 'FruitTree') {
                const fruitTreeCrop = masterData;
                const treeAge = task.fruitTreeData?.treeAge || 1; // Default 1 anno se non specificato
                const fruitTreeTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$fruitTreeEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateFruitTreeTasks"])(fruitTreeCrop, treeAge, currentDate);
                for (const ft of fruitTreeTasks){
                    specializedTasks.push({
                        taskId: task.id,
                        plantName: task.plantName,
                        phase: `Frutteto: ${ft.taskType}`,
                        message: ft.message,
                        priority: ft.priority === 'High' ? 'High' : 'Medium',
                        action: ft.instructions.join('; ')
                    });
                }
            }
            // ERBE AROMATICHE/OFFICINALI
            if (masterData.cropType === 'Aromatic' || masterData.cropType === 'Medicinal') {
                const aromaticCrop = masterData;
                const aromaticTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$aromaticEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateAromaticTasks"])(aromaticCrop, currentDate);
                for (const at of aromaticTasks){
                    specializedTasks.push({
                        taskId: task.id,
                        plantName: task.plantName,
                        phase: `Erbe: ${at.taskType}`,
                        message: at.message,
                        priority: at.priority === 'High' ? 'High' : 'Medium',
                        action: at.instructions.join('; ')
                    });
                }
            }
            // OLIVO
            if (masterData.cropType === 'Olive') {
                const oliveCrop = masterData;
                const oliveTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$oliveEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateOliveTasks"])(oliveCrop, currentDate, weatherForecast);
                for (const ot of oliveTasks){
                    // Se è frangitura urgente, aumenta priorità
                    const isUrgent = ot.taskType === 'Milling' && ot.isUrgent;
                    specializedTasks.push({
                        taskId: task.id,
                        plantName: task.plantName,
                        phase: `Olivo: ${ot.taskType}`,
                        message: isUrgent ? `⚠️ URGENTE: ${ot.message}` : ot.message,
                        priority: isUrgent ? 'Critical' : ot.priority === 'High' ? 'High' : 'Medium',
                        action: ot.instructions.join('; ')
                    });
                }
            }
            // VITE
            if (masterData.cropType === 'Vine') {
                const vineCrop = masterData;
                const vineTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$vineEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateVineTasks"])(vineCrop, currentDate, weatherForecast);
                for (const vt of vineTasks){
                    // Se è vinificazione urgente, aumenta priorità
                    const isUrgent = vt.taskType === 'Winemaking' && vt.isUrgent;
                    specializedTasks.push({
                        taskId: task.id,
                        plantName: task.plantName,
                        phase: `Vite: ${vt.taskType}`,
                        message: isUrgent ? `⚠️ URGENTE: ${vt.message}` : vt.message,
                        priority: isUrgent ? 'Critical' : vt.priority === 'High' ? 'High' : 'Medium',
                        action: vt.instructions.join('; ')
                    });
                }
            }
            // FRUTTA ESOTICA
            if (masterData.cropType === 'ExoticFruit') {
                const exoticCrop = masterData;
                const exoticTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$exoticFruitEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateExoticFruitTasks"])(exoticCrop, garden, currentDate);
                for (const et of exoticTasks){
                    // Se è avviso climatico, aumenta priorità
                    const isClimateWarning = et.climateWarning;
                    specializedTasks.push({
                        taskId: task.id,
                        plantName: task.plantName,
                        phase: `Frutta Esotica: ${et.taskType}`,
                        message: isClimateWarning ? `🌡️ CLIMA: ${et.message}` : et.message,
                        priority: isClimateWarning ? 'High' : et.priority === 'High' ? 'High' : 'Medium',
                        action: et.instructions.join('; ')
                    });
                }
            }
            // LAMPONI
            if (masterData.cropType === 'Raspberry') {
                const raspberryCrop = masterData;
                const raspberryTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$raspberryEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateRaspberryTasks"])(raspberryCrop, currentDate);
                for (const rt of raspberryTasks){
                    specializedTasks.push({
                        taskId: task.id,
                        plantName: task.plantName,
                        phase: `Lamponi: ${rt.taskType}`,
                        message: rt.message,
                        priority: rt.priority === 'High' ? 'High' : 'Medium',
                        action: rt.instructions.join('; ')
                    });
                }
            }
        } catch (error) {
            console.error(`Error calculating specialized tasks for ${task.plantName}:`, error);
        }
    }
    // Aggiungi task specializzati al piano
    lifecycleTasks.push(...specializedTasks);
    // NUOVO: SISTEMI IDROPONICI/ACQUAPONICI/AEROPONICI
    // Task a livello giardino per manutenzione sistemi avanzati
    const advancedSystemTasks = [];
    // IDROPONICA
    if (garden.gardenType && (garden.gardenType.startsWith('Hydroponic') || garden.gardenType === 'NFT' || garden.gardenType === 'DWC' || garden.gardenType === 'EbbFlow' || garden.gardenType === 'Drip' || garden.gardenType === 'Wick' || garden.gardenType === 'Kratky' || garden.gardenType === 'Hydroponic')) {
        try {
            // TODO: Ottenere letture parametri da storage provider quando disponibile
            const hydroponicReadings = undefined;
            const hydroponicTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$hydroponicEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateHydroponicTasks"])(garden, tasks, currentDate, hydroponicReadings);
            for (const ht of hydroponicTasks){
                advancedSystemTasks.push({
                    taskId: '',
                    plantName: `Sistema Idroponico (${garden.hydroponicConfig?.systemType || 'Idroponico'})`,
                    phase: `Idroponica: ${ht.taskType}`,
                    message: ht.isUrgent ? `⚠️ URGENTE: ${ht.message}` : ht.message,
                    priority: ht.priority === 'Critical' ? 'Critical' : ht.priority === 'High' ? 'High' : 'Medium',
                    action: ht.instructions.join('; ')
                });
            }
        } catch (error) {
            console.error('Error calculating hydroponic tasks:', error);
        }
    }
    // ACQUAPONICA
    if (garden.gardenType === 'Aquaponic') {
        try {
            // TODO: Ottenere letture parametri da storage provider quando disponibile
            const aquaponicReadings = undefined;
            const aquaponicTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$aquaponicEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateAquaponicTasks"])(garden, tasks, currentDate, aquaponicReadings);
            for (const at of aquaponicTasks){
                advancedSystemTasks.push({
                    taskId: '',
                    plantName: 'Sistema Acquaponico',
                    phase: `Acquaponica: ${at.taskType}`,
                    message: at.isUrgent ? `⚠️ URGENTE: ${at.message}` : at.message,
                    priority: at.priority === 'Critical' ? 'Critical' : at.priority === 'High' ? 'High' : 'Medium',
                    action: at.instructions.join('; ')
                });
            }
        } catch (error) {
            console.error('Error calculating aquaponic tasks:', error);
        }
    }
    // AEROPONICA
    if (garden.gardenType === 'Aeroponic') {
        try {
            const aeroponicTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$aeroponicEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateAeroponicTasks"])(garden, tasks, currentDate);
            for (const at of aeroponicTasks){
                advancedSystemTasks.push({
                    taskId: '',
                    plantName: 'Sistema Aeroponico',
                    phase: `Aeroponica: ${at.taskType}`,
                    message: at.isUrgent ? `⚠️ URGENTE: ${at.message}` : at.message,
                    priority: at.priority === 'Critical' ? 'Critical' : at.priority === 'High' ? 'High' : 'Medium',
                    action: at.instructions.join('; ')
                });
            }
        } catch (error) {
            console.error('Error calculating aeroponic tasks:', error);
        }
    }
    // ACCESSORI
    try {
        // TODO: Ottenere accessori da storage provider quando disponibile
        const accessories = undefined;
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    } catch (error) {
        console.error('Error calculating accessory tasks:', error);
    }
    // Aggiungi task sistemi avanzati al piano
    lifecycleTasks.push(...advancedSystemTasks);
    // GENERAZIONE TIMELINE AUTOMATICA DALLE SEMINE COMPLETATE
    // Quando una semina viene completata, genera automaticamente tutte le fasi successive
    const completedSowings = tasks.filter((t)=>t.gardenId === garden.id && t.taskType === 'Sowing' && t.completed && !t.isSuggested // Solo semine manuali, non suggerite
    );
    const timelineSuggestedTasks = [];
    for (const sowing of completedSowings){
        const sowingMasterData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMasterSheet"])(sowing.plantName);
        if (sowingMasterData) {
            const timeline = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$calendarTimelineEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateTimelineFromSowing"])(sowing, sowingMasterData, garden);
            // Converti i suggerimenti in GardenTask
            for (const suggested of timeline.suggestedTasks){
                // Verifica se il task suggerito esiste già
                const existingTask = tasks.find((t)=>t.gardenId === garden.id && t.plantName === suggested.plantName && t.taskType === suggested.taskType && t.suggestedBy === suggested.suggestedBy && t.suggestedDate === suggested.suggestedDate);
                if (!existingTask) {
                    timelineSuggestedTasks.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$calendarTimelineEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertToGardenTask"])(suggested, sowing));
                }
            }
        }
    }
    // TILLAGE ENGINE: Verifica terreno in tempera per lavorazioni
    try {
        const soilState = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$soilStateService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSoilState"])(garden.id, garden.id);
        if (soilState) {
            const temperaCheck = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$tillageEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateTemperaTiming"])(garden, soilState.lastRainDate || new Date(), soilState.lastRainAmount || 0);
            if (temperaCheck.isTempera) {
                urgentAlerts.push({
                    type: 'Planning',
                    message: `✅ Terreno in tempera. Finestra ottimale per lavorazione.`,
                    action: 'Esegui lavorazione pianificata',
                    timing: 'now',
                    blockOperations: false
                });
            }
        }
    } catch (error) {
        console.error('Error checking tillage timing:', error);
    }
    // Verifica trattamenti in periodo carenza
    try {
        const activeIntervals = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$treatmentRegistryService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getActiveSafetyIntervals"])(garden.id);
        if (activeIntervals.length > 0) {
            urgentAlerts.push({
                type: 'Safety',
                message: `⚠️ ${activeIntervals.length} trattamenti ancora in periodo carenza`,
                action: 'Non raccogliere fino a fine periodo carenza',
                blockOperations: false
            });
        }
    } catch (error) {
        console.error('Error checking safety intervals:', error);
    }
    // LAVORAZIONI MECCANICHE (per terreni > 1000 m²)
    const mechanicalWorkSuggestions = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$mechanicalWorkEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMechanicalWorkTasks"])(garden, currentDate, tasks);
    const mechanicalWorkTasks = mechanicalWorkSuggestions.map((s)=>({
            suggestedDate: s.suggestedDate,
            priority: s.priority,
            message: s.message,
            instructions: s.instructions,
            workType: s.taskType,
            equipmentType: s.equipmentType,
            area: s.area,
            weatherWarning: s.weatherWarning
        }));
    // POTATURA ALBERI (inclusi agrumi)
    const treePruningSuggestions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$treePruningEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateTreePruningTasks"])(garden, currentDate, tasks);
    const treePruningTasks = treePruningSuggestions.map((s)=>({
            suggestedDate: s.suggestedDate,
            priority: s.priority,
            message: s.message,
            instructions: s.instructions,
            treeType: s.treeType,
            pruningType: s.pruningType,
            season: s.season,
            lunarAdvice: s.lunarAdvice
        }));
    // PENDING SUGGESTIONS (task suggeriti non ancora completati)
    const pendingSuggestions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$logic$2f$taskSynchronizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPendingSuggestions"])(tasks);
    // PRIORITÀ 5: TRADIZIONE (ottimizzazione lunare)
    const lunarAdvice = generateLunarAdvice(currentDate);
    // Determina priorità complessiva
    const overallPriority = determineOverallPriority(urgentAlerts, lifecycleTasks);
    return {
        date: currentDate.toISOString().split('T')[0],
        urgentAlerts,
        lifecycleTasks,
        nutrientTasks,
        healthTasks,
        climateWarnings,
        lunarAdvice,
        priority: overallPriority,
        mechanicalWorkTasks,
        treePruningTasks,
        pendingSuggestions,
        solarClassification: solarClassification || undefined
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=logic_3a58fc4a._.js.map