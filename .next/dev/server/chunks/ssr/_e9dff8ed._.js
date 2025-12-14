module.exports = [
"[project]/utils/areaConverter.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Utility per conversione unità di misura superficie
 * Supporta: metri quadri (sqm), are, ettari (hectare)
 * 
 * **Scopo**: Fornisce funzioni per convertire tra diverse unità di misura della superficie,
 * permettendo all'utente di inserire la dimensione del giardino nell'unità preferita
 * (metri quadri per piccoli orti, are per terreni medi, ettari per terreni grandi).
 * 
 * **Conversioni**:
 * - 1 are = 100 m²
 * - 1 ettaro = 10.000 m² = 100 are
 * 
 * **Nota**: Internamente, il sistema usa sempre metri quadri per tutti i calcoli.
 * Le conversioni sono solo per display e input utente.
 */ __turbopack_context__.s([
    "convertFromSqMeters",
    ()=>convertFromSqMeters,
    "convertToSqMeters",
    ()=>convertToSqMeters,
    "formatArea",
    ()=>formatArea,
    "getRecommendedUnit",
    ()=>getRecommendedUnit
]);
function convertToSqMeters(value, unit) {
    switch(unit){
        case 'sqm':
            return value;
        case 'are':
            return value * 100; // 1 are = 100 m²
        case 'hectare':
            return value * 10000; // 1 ettaro = 10.000 m²
        default:
            return value;
    }
}
function convertFromSqMeters(value, targetUnit) {
    switch(targetUnit){
        case 'sqm':
            return value;
        case 'are':
            return value / 100; // 1 are = 100 m²
        case 'hectare':
            return value / 10000; // 1 ettaro = 10.000 m²
        default:
            return value;
    }
}
function formatArea(value, unit) {
    const formattedValue = value.toLocaleString('it-IT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
    switch(unit){
        case 'sqm':
            return `${formattedValue} m²`;
        case 'are':
            return `${formattedValue} are`;
        case 'hectare':
            return `${formattedValue} ettari`;
        default:
            return `${formattedValue} m²`;
    }
}
function getRecommendedUnit(sqMeters) {
    if (sqMeters >= 10000) {
        return 'hectare'; // Per terreni >= 1 ettaro
    } else if (sqMeters >= 100) {
        return 'are'; // Per terreni >= 1 are
    }
    return 'sqm'; // Per terreni < 1 are
}
}),
"[project]/utils/dateParsing.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Converte una stringa come "7-14 giorni" o "7-10 giorni" in un oggetto con min e max
 * Gestisce anche casi come "10 giorni" (singolo numero) o "circa 7-10 giorni"
 */ __turbopack_context__.s([
    "parseDaysRange",
    ()=>parseDaysRange
]);
const parseDaysRange = (str)=>{
    // Rimuovi spazi extra e converti in minuscolo
    const cleaned = str.trim().toLowerCase();
    // Cerca pattern come "7-14", "7 - 14", "7/14", "circa 7-10"
    const rangeMatch = cleaned.match(/(\d+)\s*[-/–]\s*(\d+)/);
    if (rangeMatch) {
        const min = parseInt(rangeMatch[1], 10);
        const max = parseInt(rangeMatch[2], 10);
        return {
            min,
            max
        };
    }
    // Cerca un singolo numero (es. "10 giorni")
    const singleMatch = cleaned.match(/(\d+)/);
    if (singleMatch) {
        const value = parseInt(singleMatch[1], 10);
        return {
            min: value,
            max: value
        };
    }
    // Fallback: se non trova nulla, restituisce valori di default
    console.warn(`Impossibile parsare il range di giorni: "${str}". Uso valori di default 7-14.`);
    return {
        min: 7,
        max: 14
    };
};
}),
"[project]/utils/seasonalAdjustment.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Seasonal Adjustment Utility
 * Calcola stagioni in base a latitudine (supporto emisfero sud)
 */ __turbopack_context__.s([
    "getNextSeason",
    ()=>getNextSeason,
    "getSeasonDateRange",
    ()=>getSeasonDateRange,
    "getSeasonForDate",
    ()=>getSeasonForDate,
    "isDateInSeason",
    ()=>isDateInSeason
]);
const getSeasonForDate = (date, latitude)=>{
    const month = date.getMonth(); // 0-11
    const isNorthernHemisphere = latitude >= 0;
    if (isNorthernHemisphere) {
        // Emisfero Nord (logica esistente)
        if (month >= 2 && month <= 4) return 'Spring'; // Marzo-Maggio
        if (month >= 5 && month <= 7) return 'Summer'; // Giugno-Agosto
        if (month >= 8 && month <= 10) return 'Autumn'; // Settembre-Novembre
        return 'Winter'; // Dicembre-Febbraio
    } else {
        // Emisfero Sud (stagioni invertite)
        if (month >= 2 && month <= 4) return 'Autumn'; // Marzo-Maggio = Autunno
        if (month >= 5 && month <= 7) return 'Winter'; // Giugno-Agosto = Inverno
        if (month >= 8 && month <= 10) return 'Spring'; // Settembre-Novembre = Primavera
        return 'Summer'; // Dicembre-Febbraio = Estate
    }
};
const getNextSeason = (currentSeason, latitude)=>{
    const isNorthernHemisphere = latitude >= 0;
    const seasonOrder = isNorthernHemisphere ? [
        'Spring',
        'Summer',
        'Autumn',
        'Winter'
    ] : [
        'Spring',
        'Summer',
        'Autumn',
        'Winter'
    ]; // Stesso ordine, ma date diverse
    const currentIndex = seasonOrder.indexOf(currentSeason);
    const nextIndex = (currentIndex + 1) % seasonOrder.length;
    return seasonOrder[nextIndex];
};
const isDateInSeason = (date, season, latitude)=>{
    return getSeasonForDate(date, latitude) === season;
};
const getSeasonDateRange = (season, year, latitude)=>{
    const isNorthernHemisphere = latitude >= 0;
    if (isNorthernHemisphere) {
        switch(season){
            case 'Spring':
                return {
                    start: new Date(year, 2, 1),
                    end: new Date(year, 4, 31)
                };
            case 'Summer':
                return {
                    start: new Date(year, 5, 1),
                    end: new Date(year, 7, 31)
                };
            case 'Autumn':
                return {
                    start: new Date(year, 8, 1),
                    end: new Date(year, 10, 30)
                };
            case 'Winter':
                return {
                    start: new Date(year, 11, 1),
                    end: new Date(year + 1, 1, 28)
                };
        }
    } else {
        // Emisfero Sud: stagioni invertite
        switch(season){
            case 'Spring':
                return {
                    start: new Date(year, 8, 1),
                    end: new Date(year, 10, 30)
                };
            case 'Summer':
                return {
                    start: new Date(year, 11, 1),
                    end: new Date(year + 1, 1, 28)
                };
            case 'Autumn':
                return {
                    start: new Date(year, 2, 1),
                    end: new Date(year, 4, 31)
                };
            case 'Winter':
                return {
                    start: new Date(year, 5, 1),
                    end: new Date(year, 7, 31)
                };
        }
    }
};
}),
"[project]/utils/altitudeUtils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Utility functions for altitude calculations
 * These are pure functions that can be used both client-side and server-side
 */ __turbopack_context__.s([
    "adjustPlantingDates",
    ()=>adjustPlantingDates,
    "adjustSeasonalWindows",
    ()=>adjustSeasonalWindows,
    "calculateAltitudeDelay",
    ()=>calculateAltitudeDelay,
    "calculateAltitudePlantingDelay",
    ()=>calculateAltitudePlantingDelay,
    "calculateEffectiveTemperature",
    ()=>calculateEffectiveTemperature
]);
const calculateAltitudeDelay = (altitudeMeters)=>{
    if (altitudeMeters <= 0) return 0;
    // Regola empirica: 5 giorni ogni 100m (media tra 4-7)
    const delayDays = Math.round(altitudeMeters / 100 * 5);
    return delayDays;
};
const adjustPlantingDates = (baseDate, altitudeMeters, plantType = 'standard')=>{
    const delayDays = calculateAltitudeDelay(altitudeMeters);
    // Aggiungi ritardo base
    const adjustedDate = new Date(baseDate);
    adjustedDate.setDate(adjustedDate.getDate() + delayDays);
    // Modificatori per tipo di pianta
    // Piante precoci (lattuga, ravanelli) hanno ritardo minore
    // Piante tardive (pomodori, peperoni) hanno ritardo maggiore
    let plantModifier = 0;
    if (plantType === 'early') {
        plantModifier = Math.round(delayDays * 0.5); // Ritardo ridotto del 50%
    } else if (plantType === 'late') {
        plantModifier = Math.round(delayDays * 0.2); // Ritardo aumentato del 20%
    }
    adjustedDate.setDate(adjustedDate.getDate() + plantModifier);
    return adjustedDate;
};
function calculateEffectiveTemperature(altitudeMeters, baseTemp) {
    if (altitudeMeters <= 0) return baseTemp;
    // Regola: -0.6°C ogni 100m
    const tempReduction = altitudeMeters / 100 * 0.6;
    return baseTemp - tempReduction;
}
function adjustSeasonalWindows(altitudeMeters, windows) {
    if (altitudeMeters <= 200) {
        return windows; // Sotto 200m, ritardo trascurabile
    }
    // Calcola ritardi differenziati per periodo
    const delayPer100m = 5; // Giorni ogni 100m
    const baseDelay = Math.round(altitudeMeters / 100 * delayPer100m);
    return windows.map((window)=>{
        let delay = 0;
        // Feb-Mar: ritardo maggiore (primavera più fredda in quota)
        if (window.period === 'Feb-Mar') {
            delay = baseDelay;
        } else if (window.period === 'Apr-Mag') {
            delay = Math.round(baseDelay * 0.8);
        } else if (window.period === 'Giu-Lug') {
            delay = Math.round(baseDelay * 0.5);
        } else if (window.period === 'Ago-Set') {
            delay = Math.round(baseDelay * 0.6);
        }
        // Le finestre vengono ritardate, quindi le ore di sole rimangono le stesse
        // ma le date effettive di utilizzo sono spostate in avanti
        return {
            ...window
        };
    });
}
function calculateAltitudePlantingDelay(altitudeMeters, plantType = 'standard') {
    if (altitudeMeters <= 0) return 0;
    const baseDelay = calculateAltitudeDelay(altitudeMeters);
    // Modificatori per tipo pianta
    if (plantType === 'early') {
        return Math.round(baseDelay * 0.5); // Ritardo ridotto del 50%
    } else if (plantType === 'late') {
        return Math.round(baseDelay * 1.2); // Ritardo aumentato del 20%
    }
    return baseDelay;
}
}),
"[project]/utils/soilTemperatureUtils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Utility functions for soil temperature and type calculations
 * These functions consider how different soil types affect heating and planting timing
 */ __turbopack_context__.s([
    "adjustDateForSoilType",
    ()=>adjustDateForSoilType,
    "calculateSoilHeatingRate",
    ()=>calculateSoilHeatingRate,
    "calculateSoilWarmingDelay",
    ()=>calculateSoilWarmingDelay,
    "getSoilCompatibility",
    ()=>getSoilCompatibility,
    "isSoilReadyForPlanting",
    ()=>isSoilReadyForPlanting
]);
function calculateSoilWarmingDelay(soilType) {
    if (!soilType || soilType === 'Loamy' || soilType === 'Silty') {
        return 0; // Terreni medi: nessun aggiustamento
    }
    // Terreni scuri: si scaldano prima → anticipo di 3-7 giorni
    if (soilType === 'Clay' || soilType === 'Peaty') {
        // Argilloso: anticipo di ~5 giorni
        // Torboso: anticipo di ~7 giorni (più scuro)
        return soilType === 'Peaty' ? -7 : -5;
    }
    // Terreni chiari: si scaldano dopo → ritardo di 3-7 giorni
    if (soilType === 'Sandy' || soilType === 'Chalky') {
        // Sabbioso: ritardo di ~5 giorni
        // Calcareo: ritardo di ~3 giorni (meno estremo)
        return soilType === 'Sandy' ? 5 : 3;
    }
    return 0;
}
function calculateSoilHeatingRate(soilType, airTemp) {
    if (!soilType || soilType === 'Loamy' || soilType === 'Silty') {
        return airTemp; // Terreni medi: temperatura aria
    }
    // Terreni scuri: +2-3°C rispetto aria
    if (soilType === 'Clay' || soilType === 'Peaty') {
        return airTemp + (soilType === 'Peaty' ? 3 : 2);
    }
    // Terreni chiari: -1-2°C rispetto aria
    if (soilType === 'Sandy' || soilType === 'Chalky') {
        return airTemp - (soilType === 'Sandy' ? 2 : 1);
    }
    return airTemp;
}
function isSoilReadyForPlanting(soilType, airTemp, minTemp) {
    const soilTemp = calculateSoilHeatingRate(soilType, airTemp);
    return soilTemp >= minTemp;
}
function getSoilCompatibility(plantName, soilType) {
    if (!soilType) {
        return {
            compatible: true
        }; // Se tipo terreno non specificato, assumiamo compatibile
    }
    const plantNameUpper = plantName.toUpperCase();
    // Piante che preferiscono terreni sabbiosi (ben drenati)
    const sandyLovers = [
        'CAROTA',
        'RAPANELLO',
        'RAVANELLO',
        'PATATA DOLCE'
    ];
    if (sandyLovers.some((name)=>plantNameUpper.includes(name))) {
        if (soilType === 'Sandy' || soilType === 'Loamy') {
            return {
                compatible: true,
                reason: 'Terreno ideale per questa pianta. Terreni sabbiosi favoriscono sviluppo radici.',
                optimalSoilTypes: [
                    'Sandy',
                    'Loamy'
                ]
            };
        }
        if (soilType === 'Clay') {
            return {
                compatible: false,
                reason: 'Terreno argilloso non ideale. Rischi di ristagni idrici e radici deformate. Considera varietà resistenti o migliora drenaggio.',
                optimalSoilTypes: [
                    'Sandy',
                    'Loamy'
                ],
                avoidSoilTypes: [
                    'Clay'
                ]
            };
        }
    }
    // Piante che preferiscono terreni argillosi (ritenzione idrica)
    const clayLovers = [
        'POMODORO',
        'PEPERONE',
        'MELANZANA',
        'ZUCCHINA'
    ];
    if (clayLovers.some((name)=>plantNameUpper.includes(name))) {
        if (soilType === 'Clay' || soilType === 'Loamy') {
            return {
                compatible: true,
                reason: 'Terreno ideale per piante da frutto. Buona ritenzione idrica e nutrienti.',
                optimalSoilTypes: [
                    'Clay',
                    'Loamy'
                ]
            };
        }
        if (soilType === 'Sandy') {
            return {
                compatible: true,
                reason: 'Terreno sabbioso richiede irrigazione più frequente e concimazione regolare.',
                optimalSoilTypes: [
                    'Clay',
                    'Loamy'
                ]
            };
        }
    }
    // Piante che preferiscono terreni torbosi (acidi)
    const peatyLovers = [
        'MIRTILLO',
        'LAMPONE',
        'FRAGOLA'
    ];
    if (peatyLovers.some((name)=>plantNameUpper.includes(name))) {
        if (soilType === 'Peaty') {
            return {
                compatible: true,
                reason: 'Terreno torboso ideale per piante acidofile.',
                optimalSoilTypes: [
                    'Peaty'
                ]
            };
        }
        if (soilType === 'Chalky') {
            return {
                compatible: false,
                reason: 'Terreno calcareo troppo alcalino. Queste piante preferiscono terreni acidi.',
                optimalSoilTypes: [
                    'Peaty'
                ],
                avoidSoilTypes: [
                    'Chalky'
                ]
            };
        }
    }
    // Default: compatibile ma senza preferenze specifiche
    return {
        compatible: true,
        reason: 'Pianta adattabile a vari tipi di terreno.'
    };
}
function adjustDateForSoilType(baseDate, soilType) {
    const delay = calculateSoilWarmingDelay(soilType);
    const adjustedDate = new Date(baseDate);
    adjustedDate.setDate(adjustedDate.getDate() + delay);
    return adjustedDate;
}
}),
"[project]/app/(dashboard)/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$hooks$2f$useTier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/hooks/useTier.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$hooks$2f$useStorage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/core/hooks/useStorage.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$context$2f$StorageContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/context/StorageContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$config$2f$tiers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/config/tiers.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$professional$2f$Dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/professional/Dashboard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$shared$2f$HomeDashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/shared/HomeDashboard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GardenOnboarding$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/GardenOnboarding.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$autoRestoreService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/autoRestoreService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-ssr] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
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
function DashboardPage() {
    const { tier, isProfessional, isConsumer } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$hooks$2f$useTier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTier"])();
    const { storageProvider } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$context$2f$StorageContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStorage"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [gardens, setGardens] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [tasks, setTasks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showOnboarding, setShowOnboarding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [restoring, setRestoring] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [restoreResult, setRestoreResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const initializeApp = async ()=>{
            try {
                setLoading(true);
                // 1. TENTA RIPRISTINO AUTOMATICO (se primo avvio e nessun dato locale)
                // Solo per FREE tier (PRO usa Supabase che sincronizza automaticamente)
                if (tier === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$config$2f$tiers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppTier"].FREE) {
                    try {
                        const restoreAttempt = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$autoRestoreService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attemptAutoRestore"])(storageProvider);
                        if (restoreAttempt.restored) {
                            setRestoring(true);
                            setRestoreResult(restoreAttempt);
                            // Nascondi banner dopo 3 secondi
                            setTimeout(()=>{
                                setRestoring(false);
                            }, 3000);
                        }
                    } catch (error) {
                        console.error('Error attempting auto restore:', error);
                    // Continua comunque con caricamento normale
                    }
                }
                // 2. Carica giardini (dopo restore o normalmente)
                const loadedGardens = await storageProvider.getGardens();
                setGardens(loadedGardens);
                // 3. Carica tasks per il primo giardino
                if (loadedGardens.length > 0) {
                    const gardenTasks = await storageProvider.getTasks(loadedGardens[0].id);
                    setTasks(gardenTasks || []);
                }
                if (loadedGardens.length === 0) {
                    setShowOnboarding(true);
                }
            } catch (error) {
                console.error('Error initializing app:', error);
            } finally{
                setLoading(false);
            }
        };
        initializeApp();
    }, [
        storageProvider,
        tier
    ]);
    const handleOnboardingComplete = async (garden)=>{
        try {
            await storageProvider.createGarden(garden);
            const updatedGardens = await storageProvider.getGardens();
            setGardens(updatedGardens);
            setShowOnboarding(false);
            // Ricarica la pagina per aggiornare i dati
            router.refresh();
        } catch (error) {
            console.error('Error creating garden:', error);
            alert('Errore nella creazione dell\'orto. Riprova.');
        }
    };
    const handleOnboardingCancel = ()=>{
        setShowOnboarding(false);
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-gray-600",
                children: "Caricamento..."
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/app/page.tsx",
                lineNumber: 98,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/(dashboard)/app/page.tsx",
            lineNumber: 97,
            columnNumber: 7
        }, this);
    }
    // Mostra onboarding se non ci sono giardini
    if (showOnboarding || gardens.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GardenOnboarding$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                existingGardensCount: gardens.length,
                onComplete: handleOnboardingComplete,
                onCancel: handleOnboardingCancel
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/app/page.tsx",
                lineNumber: 107,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/(dashboard)/app/page.tsx",
            lineNumber: 106,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            restoreResult?.restored && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-green-50 border-l-4 border-green-500 p-4 mb-4 mx-4 mt-4 rounded-r-lg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                            className: "text-green-600",
                            size: 20
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/app/page.tsx",
                            lineNumber: 122,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-semibold text-green-800",
                                    children: "Dati ripristinati automaticamente!"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/app/page.tsx",
                                    lineNumber: 124,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-green-700",
                                    children: [
                                        "Ripristinati ",
                                        restoreResult.gardensRestored || 0,
                                        " giardino/i,",
                                        ' ',
                                        restoreResult.tasksRestored || 0,
                                        " task,",
                                        ' ',
                                        restoreResult.harvestsRestored || 0,
                                        " raccolti",
                                        restoreResult.backupUsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                " dal backup del ",
                                                new Date(restoreResult.backupUsed.timestamp).toLocaleDateString('it-IT')
                                            ]
                                        }, void 0, true)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/app/page.tsx",
                                    lineNumber: 127,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/app/page.tsx",
                            lineNumber: 123,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/app/page.tsx",
                    lineNumber: 121,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/app/page.tsx",
                lineNumber: 120,
                columnNumber: 9
            }, this),
            restoring && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white p-6 rounded-lg shadow-xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            className: "animate-spin text-green-600 mx-auto mb-4",
                            size: 48
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/app/page.tsx",
                            lineNumber: 144,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-center text-gray-700 font-semibold",
                            children: "Ripristino dati in corso..."
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/app/page.tsx",
                            lineNumber: 145,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-center text-sm text-gray-500 mt-2",
                            children: "I tuoi progressi stanno essere ripristinati dal backup cloud"
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/app/page.tsx",
                            lineNumber: 148,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/app/page.tsx",
                    lineNumber: 143,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/app/page.tsx",
                lineNumber: 142,
                columnNumber: 9
            }, this),
            gardens.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$shared$2f$HomeDashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HomeDashboard"], {
                garden: gardens[0],
                tasks: tasks,
                onUpdateGarden: async (updatedGarden)=>{
                    await storageProvider.updateGarden(updatedGarden.id, updatedGarden);
                    const updatedGardens = await storageProvider.getGardens();
                    setGardens(updatedGardens);
                },
                onUpdateTask: async (task)=>{
                    await storageProvider.updateTask(task.id, task);
                    if (gardens[0]) {
                        const updatedTasks = await storageProvider.getTasks(gardens[0].id);
                        setTasks(updatedTasks || []);
                    }
                }
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/app/page.tsx",
                lineNumber: 157,
                columnNumber: 9
            }, this),
            isProfessional && gardens.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$professional$2f$Dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProfessionalDashboard"], {}, void 0, false, {
                fileName: "[project]/app/(dashboard)/app/page.tsx",
                lineNumber: 177,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
];

//# sourceMappingURL=_e9dff8ed._.js.map