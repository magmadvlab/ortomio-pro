(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/services/geolocationService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCurrentPosition",
    ()=>getCurrentPosition,
    "getCurrentPositionWithRetry",
    ()=>getCurrentPositionWithRetry,
    "getDefaultCoordinates",
    ()=>getDefaultCoordinates
]);
const getCurrentPosition = async (options = {})=>{
    const { timeout = 20000, enableHighAccuracy = false, maximumAge = 300000 } = options;
    return new Promise((resolve)=>{
        if (!navigator.geolocation) {
            resolve({
                success: false,
                error: "Geolocalizzazione non supportata dal browser",
                errorCode: 0
            });
            return;
        }
        // Timeout per evitare attese infinite
        const timeoutId = setTimeout(()=>{
            resolve({
                success: false,
                error: "Timeout: la richiesta di posizione ha impiegato troppo tempo. Verifica i permessi GPS nelle impostazioni del dispositivo.",
                errorCode: 3
            });
        }, timeout);
        navigator.geolocation.getCurrentPosition((position)=>{
            clearTimeout(timeoutId);
            resolve({
                success: true,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        }, (error)=>{
            clearTimeout(timeoutId);
            let errorMessage = "Errore sconosciuto nella geolocalizzazione";
            let errorCode = error.code;
            switch(error.code){
                case 1:
                    errorMessage = "Permesso di geolocalizzazione negato. Abilita la geolocalizzazione nelle impostazioni del browser o dell'app.";
                    break;
                case 2:
                    errorMessage = "Posizione non disponibile. Verifica che il GPS sia attivo sul dispositivo.";
                    break;
                case 3:
                    errorMessage = "Timeout: la richiesta ha impiegato troppo tempo. Riprova o verifica la connessione.";
                    break;
                default:
                    errorMessage = `Errore geolocalizzazione: ${error.message || "Errore sconosciuto"}`;
            }
            resolve({
                success: false,
                error: errorMessage,
                errorCode
            });
        }, {
            timeout,
            enableHighAccuracy,
            maximumAge
        });
    });
};
const getCurrentPositionWithRetry = async (maxRetries = 2, options = {})=>{
    for(let attempt = 1; attempt <= maxRetries; attempt++){
        const result = await getCurrentPosition(options);
        if (result.success) {
            return result;
        }
        // Se è un errore di permesso, non ritentare (l'utente deve dare il permesso manualmente)
        if (result.errorCode === 1) {
            return result;
        }
        // Aspetta prima di ritentare (solo se non è l'ultimo tentativo)
        if (attempt < maxRetries) {
            await new Promise((resolve)=>setTimeout(resolve, 1000 * attempt)); // Backoff: 1s, 2s
        }
    }
    // Se tutti i tentativi falliscono, restituisci l'ultimo errore
    return await getCurrentPosition(options);
};
const getDefaultCoordinates = ()=>{
    return {
        latitude: 41.9028,
        longitude: 12.4964
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/photoAnalysisService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Photo Analysis Service
 * Uses Gemini Vision API to analyze garden photos for sun exposure, aspect direction, and plant health
 */ __turbopack_context__.s([
    "analyzeAspectDirection",
    ()=>analyzeAspectDirection,
    "analyzePanoramic360",
    ()=>analyzePanoramic360,
    "analyzePlantHealth",
    ()=>analyzePlantHealth,
    "analyzeSunExposure",
    ()=>analyzeSunExposure,
    "fileToBase64",
    ()=>fileToBase64
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/genai/dist/web/index.mjs [app-client] (ecmascript)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("services/photoAnalysisService.ts")}`;
    }
};
;
// Support both Next.js and Vite environments
const apiKey = ("TURBOPACK compile-time truthy", 1) ? ("TURBOPACK compile-time value", "AIzaSyDF1nX_pVSmFYWYNBkXziRMX-l9wybOvuA") || __TURBOPACK__import$2e$meta__?.env?.VITE_GEMINI_API_KEY : "TURBOPACK unreachable";
const genAI = ("TURBOPACK compile-time truthy", 1) ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GoogleGenAI"]({
    apiKey: apiKey
}) : "TURBOPACK unreachable";
const analyzeSunExposure = async (photoBase64)=>{
    if (!genAI) {
        throw new Error('Gemini API key not configured');
    }
    const model = genAI.generativeModel({
        model: 'gemini-pro-vision'
    });
    const prompt = `Analizza questa foto di un orto scattata a mezzogiorno (12:30).
  
Determina:
1. Ore di sole diretto giornaliere stimate (0-12 ore)
2. Tipo di esposizione: FullSun (8+ ore), PartSun (4-7 ore), Shade (<4 ore)
3. Presenza di ombre da edifici, alberi, o ostacoli
4. Percentuale di area in ombra vs sole

Rispondi in formato JSON:
{
  "dailySunHours": <numero>,
  "sunExposure": "FullSun" | "PartSun" | "Shade",
  "confidence": <0-1>,
  "notes": ["nota1", "nota2"]
}`;
    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: photoBase64.split(',')[1] || photoBase64,
                    mimeType: 'image/jpeg'
                }
            }
        ]);
        const response = result.response;
        const text = response.text();
        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                dailySunHours: Math.round(parsed.dailySunHours || 6),
                sunExposure: parsed.sunExposure || 'PartSun',
                confidence: parsed.confidence || 0.7,
                notes: parsed.notes || []
            };
        }
        // Fallback parsing
        return {
            dailySunHours: 6,
            sunExposure: 'PartSun',
            confidence: 0.5,
            notes: [
                'Analisi automatica non disponibile'
            ]
        };
    } catch (error) {
        console.error('Error analyzing sun exposure:', error);
        throw new Error('Failed to analyze sun exposure');
    }
};
const analyzeAspectDirection = async (photoBase64)=>{
    if (!genAI) {
        throw new Error('Gemini API key not configured');
    }
    const model = genAI.generativeModel({
        model: 'gemini-pro-vision'
    });
    const prompt = `Analizza questa foto dell'orizzonte dell'orto scattata all'alba o al tramonto.
  
Determina:
1. Direzione dell'esposizione: North, South, East, West, o Flat (pianura)
2. Presenza di ostacoli (montagne, colline, edifici) e loro direzione
3. Orientamento del terreno rispetto al sole

Rispondi in formato JSON:
{
  "aspectDirection": "North" | "South" | "East" | "West" | "Flat",
  "confidence": <0-1>,
  "notes": ["nota1", "nota2"]
}`;
    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: photoBase64.split(',')[1] || photoBase64,
                    mimeType: 'image/jpeg'
                }
            }
        ]);
        const response = result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                aspectDirection: parsed.aspectDirection || 'Flat',
                confidence: parsed.confidence || 0.7,
                notes: parsed.notes || []
            };
        }
        return {
            aspectDirection: 'Flat',
            confidence: 0.5,
            notes: [
                'Analisi automatica non disponibile'
            ]
        };
    } catch (error) {
        console.error('Error analyzing aspect direction:', error);
        throw new Error('Failed to analyze aspect direction');
    }
};
const analyzePlantHealth = async (photoBase64, plantName, expectedPhase, daysFromPlanting)=>{
    if (!genAI) {
        throw new Error('Gemini API key not configured');
    }
    const model = genAI.generativeModel({
        model: 'gemini-pro-vision'
    });
    const prompt = `Analizza questa foto di una pianta di ${plantName}.
  
Contesto:
- Pianta: ${plantName}
- Fase attesa: ${expectedPhase}
- Giorni dalla semina/trapianto: ${daysFromPlanting}

Determina:
1. La pianta è sana? (isHealthy: true/false)
2. Tasso di crescita: "normal", "slow", o "fast" rispetto all'atteso
3. Problemi visibili (es. foglie gialle, parassiti, malattie)
4. Fase attuale della pianta (se diversa da attesa)
5. Numero approssimativo di foglie vere (se visibili)

Rispondi in formato JSON:
{
  "isHealthy": <boolean>,
  "growthRate": "normal" | "slow" | "fast",
  "issues": ["problema1", "problema2"],
  "phase": "<fase rilevata>",
  "leafCount": <numero o null>,
  "confidence": <0-1>
}`;
    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: photoBase64.split(',')[1] || photoBase64,
                    mimeType: 'image/jpeg'
                }
            }
        ]);
        const response = result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                isHealthy: parsed.isHealthy !== false,
                growthRate: parsed.growthRate || 'normal',
                issues: parsed.issues || [],
                phase: parsed.phase,
                leafCount: parsed.leafCount,
                confidence: parsed.confidence || 0.7
            };
        }
        return {
            isHealthy: true,
            growthRate: 'normal',
            issues: [],
            confidence: 0.5
        };
    } catch (error) {
        console.error('Error analyzing plant health:', error);
        throw new Error('Failed to analyze plant health');
    }
};
const analyzePanoramic360 = async (photoBase64)=>{
    if (!genAI) {
        throw new Error('Gemini API key not configured');
    }
    const model = genAI.generativeModel({
        model: 'gemini-pro-vision'
    });
    const prompt = `Analizza questa foto panoramica 360° di un orto/giardino.
  
Determina:
1. Ore di sole diretto giornaliere totali stimate (0-12 ore)
2. Tipo di esposizione complessiva: FullSun (8+ ore), PartSun (4-7 ore), Shade (<4 ore)
3. Direzione dell'esposizione principale: North, South, East, West, o Flat
4. Ore di sole per ogni direzione cardinale (Nord, Sud, Est, Ovest)
5. Ostacoli presenti (edifici, alberi, montagne) con:
   - Direzione (N, S, E, W, NE, NW, SE, SW)
   - Tipo (Building, Tree, Mountain, Other)
   - Altezza (Low, Medium, High)
   - Descrizione breve

Rispondi in formato JSON:
{
  "dailySunHours": <numero>,
  "sunExposure": "FullSun" | "PartSun" | "Shade",
  "aspectDirection": "North" | "South" | "East" | "West" | "Flat",
  "exposureByDirection": {
    "north": <ore>,
    "south": <ore>,
    "east": <ore>,
    "west": <ore>
  },
  "obstacles": [
    {
      "direction": "North" | "South" | "East" | "West" | "Northeast" | "Northwest" | "Southeast" | "Southwest",
      "type": "Building" | "Tree" | "Mountain" | "Other",
      "height": "Low" | "Medium" | "High",
      "description": "<descrizione>"
    }
  ],
  "confidence": <0-1>,
  "notes": ["nota1", "nota2"]
}`;
    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: photoBase64.split(',')[1] || photoBase64,
                    mimeType: 'image/jpeg'
                }
            }
        ]);
        const response = result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                dailySunHours: Math.round(parsed.dailySunHours || 6),
                sunExposure: parsed.sunExposure || 'PartSun',
                aspectDirection: parsed.aspectDirection || 'Flat',
                exposureByDirection: parsed.exposureByDirection || {
                    north: 0,
                    south: 6,
                    east: 3,
                    west: 3
                },
                obstacles: parsed.obstacles || [],
                confidence: parsed.confidence || 0.7,
                notes: parsed.notes || []
            };
        }
        // Fallback
        return {
            dailySunHours: 6,
            sunExposure: 'PartSun',
            aspectDirection: 'Flat',
            exposureByDirection: {
                north: 0,
                south: 6,
                east: 3,
                west: 3
            },
            obstacles: [],
            confidence: 0.5,
            notes: [
                'Analisi automatica non disponibile'
            ]
        };
    } catch (error) {
        console.error('Error analyzing panoramic photo:', error);
        throw new Error('Failed to analyze panoramic photo');
    }
};
const fileToBase64 = (file)=>{
    return new Promise((resolve, reject)=>{
        const reader = new FileReader();
        reader.onload = ()=>{
            const result = reader.result;
            resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/obstacleExtractor.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Obstacle Extractor
 * Estrae ostacoli 3D da foto 360° o input manuale per calcolo esposizione solare
 */ __turbopack_context__.s([
    "extractObstaclesFrom360",
    ()=>extractObstaclesFrom360,
    "formatObstacleDescription",
    ()=>formatObstacleDescription,
    "mergeNearbyObstacles",
    ()=>mergeNearbyObstacles,
    "parseObstaclesFromManualInput",
    ()=>parseObstaclesFromManualInput,
    "validateObstacle",
    ()=>validateObstacle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$photoAnalysisService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/photoAnalysisService.ts [app-client] (ecmascript)");
;
/**
 * Converte direzione cardinale/intercardinale in azimut (0-360°)
 * 0° = Nord, 90° = Est, 180° = Sud, 270° = Ovest
 */ function directionToAzimuth(direction) {
    const directions = {
        'North': 0,
        'Northeast': 45,
        'East': 90,
        'Southeast': 135,
        'South': 180,
        'Southwest': 225,
        'West': 270,
        'Northwest': 315,
        'N': 0,
        'NE': 45,
        'E': 90,
        'SE': 135,
        'S': 180,
        'SW': 225,
        'W': 270,
        'NW': 315
    };
    return directions[direction] ?? 0;
}
/**
 * Stima altezza ostacolo basata su tipo e altezza relativa
 */ function estimateObstacleHeight(type, heightCategory) {
    const heightMap = {
        'Building': {
            'Low': 5,
            'Medium': 10,
            'High': 20
        },
        'Tree': {
            'Low': 4,
            'Medium': 8,
            'High': 15
        },
        'Mountain': {
            'Low': 50,
            'Medium': 200,
            'High': 500
        },
        'Other': {
            'Low': 3,
            'Medium': 6,
            'High': 12
        }
    };
    return heightMap[type]?.[heightCategory] ?? 10;
}
/**
 * Stima distanza ostacolo basata su altezza e dimensione apparente
 * Più grande appare nella foto = più vicino
 */ function estimateObstacleDistance(height, heightCategory, type) {
    // Stima base: distanza tipica = 2-3x altezza per edifici/alberi
    // Per montagne, distanza molto maggiore
    if (type === 'Mountain') {
        return height * 10; // Montagne sono molto lontane
    }
    // Per edifici e alberi, stima più conservativa
    const multiplier = heightCategory === 'High' ? 2.5 : heightCategory === 'Medium' ? 2 : 1.5;
    return height * multiplier;
}
async function extractObstaclesFrom360(photo360Base64, lat, lng) {
    try {
        // Usa analisi AI esistente per identificare ostacoli
        const analysis = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$photoAnalysisService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["analyzePanoramic360"])(photo360Base64);
        // Converti ostacoli identificati dall'AI in ostacoli 3D
        const obstacles = analysis.obstacles.map((obs)=>{
            const azimuth = directionToAzimuth(obs.direction);
            const height = estimateObstacleHeight(obs.type, obs.height);
            const distance = estimateObstacleDistance(height, obs.height, obs.type);
            // Stima larghezza angolare basata su tipo
            // Edifici: più larghi (30-45°), alberi: più stretti (15-30°)
            let widthDegrees = 30; // Default
            if (obs.type === 'Building') {
                widthDegrees = obs.height === 'High' ? 45 : 30;
            } else if (obs.type === 'Tree') {
                widthDegrees = obs.height === 'High' ? 25 : 15;
            } else if (obs.type === 'Mountain') {
                widthDegrees = 60; // Montagne coprono più direzioni
            }
            return {
                azimuth,
                height,
                distance,
                widthDegrees,
                type: obs.type
            };
        });
        return obstacles;
    } catch (error) {
        console.error('Error extracting obstacles from 360 photo:', error);
        throw new Error('Failed to extract obstacles from photo');
    }
}
function parseObstaclesFromManualInput(input) {
    let azimuth;
    // Se è un numero, è già un azimut
    if (typeof input.direction === 'number') {
        azimuth = input.direction;
    } else {
        // Altrimenti converte da direzione cardinale
        azimuth = directionToAzimuth(input.direction);
    }
    return {
        azimuth,
        height: input.height,
        distance: input.distance,
        widthDegrees: input.widthDegrees ?? 30,
        type: input.type ?? 'Other'
    };
}
function validateObstacle(obstacle) {
    const errors = [];
    if (obstacle.azimuth < 0 || obstacle.azimuth > 360) {
        errors.push('Azimut deve essere tra 0 e 360 gradi');
    }
    if (obstacle.height <= 0) {
        errors.push('Altezza deve essere maggiore di 0');
    }
    if (obstacle.distance <= 0) {
        errors.push('Distanza deve essere maggiore di 0');
    }
    if (obstacle.widthDegrees <= 0 || obstacle.widthDegrees > 180) {
        errors.push('Larghezza angolare deve essere tra 0 e 180 gradi');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
function mergeNearbyObstacles(obstacles, azimuthThreshold = 10) {
    if (obstacles.length === 0) return [];
    const merged = [];
    const processed = new Set();
    for(let i = 0; i < obstacles.length; i++){
        if (processed.has(i)) continue;
        const current = obstacles[i];
        const nearby = [
            current
        ];
        // Trova ostacoli vicini nella stessa direzione
        for(let j = i + 1; j < obstacles.length; j++){
            if (processed.has(j)) continue;
            const other = obstacles[j];
            const azimuthDiff = Math.abs(current.azimuth - other.azimuth);
            const minAzimuthDiff = Math.min(azimuthDiff, 360 - azimuthDiff);
            if (minAzimuthDiff <= azimuthThreshold) {
                nearby.push(other);
                processed.add(j);
            }
        }
        // Se ci sono più ostacoli vicini, prendi quello più alto/bloccante
        if (nearby.length > 1) {
            const tallest = nearby.reduce((max, obs)=>{
                const maxElevation = Math.atan2(max.height, max.distance);
                const obsElevation = Math.atan2(obs.height, obs.distance);
                return obsElevation > maxElevation ? obs : max;
            });
            merged.push(tallest);
        } else {
            merged.push(current);
        }
        processed.add(i);
    }
    return merged;
}
function formatObstacleDescription(obstacle) {
    const directionNames = {
        0: 'Nord',
        45: 'Nord-Est',
        90: 'Est',
        135: 'Sud-Est',
        180: 'Sud',
        225: 'Sud-Ovest',
        270: 'Ovest',
        315: 'Nord-Ovest'
    };
    // Trova direzione più vicina
    const directions = Object.keys(directionNames).map(Number);
    const closestDir = directions.reduce((closest, dir)=>{
        const currentDiff = Math.abs(obstacle.azimuth - dir);
        const closestDiff = Math.abs(obstacle.azimuth - closest);
        return currentDiff < closestDiff ? dir : closest;
    });
    const directionName = directionNames[closestDir] || `${Math.round(obstacle.azimuth)}°`;
    const typeName = obstacle.type === 'Building' ? 'Edificio' : obstacle.type === 'Tree' ? 'Albero' : obstacle.type === 'Mountain' ? 'Montagna' : 'Altro';
    return `${typeName} a ${directionName} (${obstacle.height}m alto, ${obstacle.distance}m di distanza)`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/visualSunInputConverter.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Visual Sun Input Converter Service
 * Converte input visivo dell'utente in ore di sole stimate
 */ __turbopack_context__.s([
    "convertSunHoursToVisualInput",
    ()=>convertSunHoursToVisualInput,
    "convertVisualInputToSunHours",
    ()=>convertVisualInputToSunHours,
    "estimateSunHoursFromVisual",
    ()=>estimateSunHoursFromVisual
]);
/**
 * Fattori di posizione per tipo di ubicazione
 */ const POSITION_FACTORS = {
    campo: 1.0,
    muro: 0.8,
    balcone: 0.6
};
/**
 * Fattori di riduzione per ostacoli
 */ const OBSTACLE_FACTORS = {
    edificio_sud: 0.7,
    edificio_est: 0.85,
    edificio_ovest: 0.85,
    albero: 0.9,
    montagna: 0.8,
    nessuno: 1.0
};
/**
 * Converte scala 1-5 in ore stimate per periodo del giorno
 */ function scaleToHours(scale, period) {
    // Scala 1-5 mappata a ore:
    // 1 = 0-1h, 2 = 1-2h, 3 = 2-3h, 4 = 3-4h, 5 = 4-5h
    const baseHours = (scale - 1) * 1.0 + 0.5; // 0.5-4.5h
    // Aggiusta per periodo:
    // Mezzogiorno ha più peso (sole più intenso)
    if (period === 'noon') {
        return baseHours * 1.2; // +20% per mezzogiorno
    }
    // Mattino e pomeriggio hanno peso normale
    return baseHours;
}
function estimateSunHoursFromVisual(morning, noon, afternoon, position) {
    // Converti scale in ore per periodo
    const morningHours = scaleToHours(morning, 'morning');
    const noonHours = scaleToHours(noon, 'noon');
    const afternoonHours = scaleToHours(afternoon, 'afternoon');
    // Formula pesata: mezzogiorno ha più peso
    // (morning * 2 + noon * 4 + afternoon * 2) / 8
    const weightedAverage = (morningHours * 2 + noonHours * 4 + afternoonHours * 2) / 8;
    // Applica fattore posizione
    const positionFactor = POSITION_FACTORS[position];
    const estimatedHours = weightedAverage * positionFactor;
    // Limita tra 0 e 12 ore
    return Math.max(0, Math.min(12, estimatedHours));
}
/**
 * Applica riduzione per ostacoli
 */ function applyObstacleReduction(baseHours, obstacles) {
    if (obstacles.length === 0 || obstacles.includes('nessuno')) {
        return baseHours;
    }
    // Calcola fattore combinato (moltiplicativo)
    // Esempio: edificio_sud (0.7) + albero (0.9) = 0.7 * 0.9 = 0.63
    const combinedFactor = obstacles.reduce((acc, obstacle)=>{
        const factor = OBSTACLE_FACTORS[obstacle] || 1.0;
        return acc * factor;
    }, 1.0);
    return baseHours * combinedFactor;
}
function convertVisualInputToSunHours(input, lat, lng) {
    // Stima base da slider
    const baseHours = estimateSunHoursFromVisual(input.morningSun, input.noonSun, input.afternoonSun, input.position);
    // Applica riduzione ostacoli
    const finalHours = applyObstacleReduction(baseHours, input.obstacles);
    // Arrotonda a 1 decimale
    return Math.round(finalHours * 10) / 10;
}
function convertSunHoursToVisualInput(hours, position = 'campo') {
    // Approssimazione inversa
    // Assumiamo distribuzione tipica: mattino medio, mezzogiorno alto, pomeriggio medio
    const positionFactor = POSITION_FACTORS[position];
    const adjustedHours = hours / positionFactor;
    // Stima scale basata su ore totali
    let morning = 3;
    let noon = 5;
    let afternoon = 3;
    if (adjustedHours < 3) {
        morning = 1;
        noon = 2;
        afternoon = 1;
    } else if (adjustedHours < 5) {
        morning = 2;
        noon = 3;
        afternoon = 2;
    } else if (adjustedHours < 7) {
        morning = 3;
        noon = 4;
        afternoon = 3;
    } else if (adjustedHours < 9) {
        morning = 4;
        noon = 5;
        afternoon = 4;
    } else {
        morning = 5;
        noon = 5;
        afternoon = 5;
    }
    return {
        position,
        morningSun: morning,
        noonSun: noon,
        afternoonSun: afternoon,
        obstacles: []
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/plantMasterService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "findSpeciesFromVariety",
    ()=>findSpeciesFromVariety,
    "generateCompleteGuide",
    ()=>generateCompleteGuide,
    "getAllBehavioralTags",
    ()=>getAllBehavioralTags,
    "getAllMasterSheets",
    ()=>getAllMasterSheets,
    "getMasterSheet",
    ()=>getMasterSheet,
    "getVarietyInfo",
    ()=>getVarietyInfo,
    "getVarietyTags",
    ()=>getVarietyTags
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$plantMasterSheets$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/data/plantMasterSheets.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$varietyMappings$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/data/varietyMappings.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$specializedCropMasterSheets$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/data/specializedCropMasterSheets.ts [app-client] (ecmascript) <locals>");
;
;
;
const getMasterSheet = (speciesName)=>{
    const normalized = speciesName.toLowerCase().trim();
    // Cerca prima nelle piante base
    const baseMatch = __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$plantMasterSheets$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["plantMasterSheets"].find((sheet)=>sheet.id === normalized || sheet.commonName.toLowerCase().includes(normalized) || sheet.scientificName.toLowerCase().includes(normalized) || sheet.commonName.toLowerCase() === normalized);
    if (baseMatch) return baseMatch;
    // Cerca nelle colture specializzate
    const specializedSheets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$specializedCropMasterSheets$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAllSpecializedMasterSheets"])();
    return specializedSheets.find((sheet)=>sheet.id === normalized || sheet.commonName.toLowerCase().includes(normalized) || sheet.scientificName.toLowerCase().includes(normalized) || sheet.commonName.toLowerCase() === normalized) || null;
};
const getVarietyTags = (varietyName)=>{
    const normalizedVariety = varietyName.toLowerCase().trim();
    const mapping = __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$varietyMappings$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["varietyMappings"].find((v)=>v.varietyName.toLowerCase() === normalizedVariety || v.varietyName.toLowerCase().includes(normalizedVariety) || normalizedVariety.includes(v.varietyName.toLowerCase()));
    if (!mapping || !mapping.tags || mapping.tags.length === 0) {
        return [];
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$plantMasterSheets$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["behavioralTags"].filter((tag)=>mapping.tags.includes(tag.id));
};
const findSpeciesFromVariety = (varietyName)=>{
    const normalizedVariety = varietyName.toLowerCase().trim();
    const mapping = __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$varietyMappings$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["varietyMappings"].find((v)=>v.varietyName.toLowerCase() === normalizedVariety || v.varietyName.toLowerCase().includes(normalizedVariety) || normalizedVariety.includes(v.varietyName.toLowerCase()));
    if (!mapping) return null;
    return {
        speciesId: mapping.speciesId,
        tags: mapping.tags || []
    };
};
const generateCompleteGuide = (speciesName, varietyName)=>{
    const masterSheet = getMasterSheet(speciesName);
    if (!masterSheet) return null;
    const tags = varietyName ? getVarietyTags(varietyName) : [];
    const additionalInstructions = tags.flatMap((tag)=>tag.additionalInstructions);
    return {
        masterSheet,
        tags,
        additionalInstructions
    };
};
const getVarietyInfo = (varietyName)=>{
    const speciesInfo = findSpeciesFromVariety(varietyName);
    if (!speciesInfo) return null;
    const masterSheet = getMasterSheet(speciesInfo.speciesId);
    const tags = getVarietyTags(varietyName);
    return {
        varietyName,
        speciesId: speciesInfo.speciesId,
        tags,
        masterSheet
    };
};
const getAllBehavioralTags = ()=>{
    return __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$plantMasterSheets$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["behavioralTags"];
};
const getAllMasterSheets = ()=>{
    return [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$data$2f$plantMasterSheets$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["plantMasterSheets"],
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$specializedCropMasterSheets$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAllSpecializedMasterSheets"])()
    ];
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/taskCalculationService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateDaysActive",
    ()=>calculateDaysActive,
    "calculatePlantDaysActive",
    ()=>calculatePlantDaysActive,
    "findPlantingTask",
    ()=>findPlantingTask,
    "getActivePlants",
    ()=>getActivePlants
]);
const calculateDaysActive = (task)=>{
    const taskDate = new Date(task.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - taskDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays); // Non restituire giorni negativi
};
const findPlantingTask = (tasks, plantName, variety)=>{
    const relevantTasks = tasks.filter((task)=>{
        const nameMatch = task.plantName.toLowerCase() === plantName.toLowerCase();
        const varietyMatch = !variety || !task.variety || task.variety.toLowerCase() === variety.toLowerCase();
        const typeMatch = task.taskType === 'Sowing' || task.taskType === 'Transplant';
        return nameMatch && varietyMatch && typeMatch;
    });
    if (relevantTasks.length === 0) return null;
    // Ordina per data (più recente prima) e prendi il primo
    const sorted = relevantTasks.sort((a, b)=>{
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Più recente prima
    });
    return sorted[0];
};
const getActivePlants = (tasks)=>{
    return tasks.filter((task)=>{
        const isPlanting = task.taskType === 'Sowing' || task.taskType === 'Transplant';
        return isPlanting && !task.completed;
    });
};
const calculatePlantDaysActive = (tasks, plantName, variety)=>{
    const plantingTask = findPlantingTask(tasks, plantName, variety);
    if (!plantingTask) return null;
    return calculateDaysActive(plantingTask);
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/seedInventoryService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addSeedPacket",
    ()=>addSeedPacket,
    "deleteSeedPacket",
    ()=>deleteSeedPacket,
    "findSeedsForPlant",
    ()=>findSeedsForPlant,
    "getExpiredSeeds",
    ()=>getExpiredSeeds,
    "getExpiringSeeds",
    ()=>getExpiringSeeds,
    "getLowStockSeeds",
    ()=>getLowStockSeeds,
    "getSeedPackets",
    ()=>getSeedPackets,
    "shouldShowJanuaryAlert",
    ()=>shouldShowJanuaryAlert,
    "updateSeedPacket",
    ()=>updateSeedPacket,
    "useSeedForPlanting",
    ()=>useSeedForPlanting
]);
const STORAGE_PREFIX = 'seedPackets_';
/**
 * Salva i semi in localStorage
 */ const saveToStorage = (gardenId, packets)=>{
    try {
        localStorage.setItem(`${STORAGE_PREFIX}${gardenId}`, JSON.stringify(packets));
    } catch (error) {
        console.error('Error saving seed packets:', error);
    }
};
/**
 * Carica i semi da localStorage
 */ const loadFromStorage = (gardenId)=>{
    try {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}${gardenId}`);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading seed packets:', error);
    }
    return [];
};
const addSeedPacket = (packet)=>{
    const packets = loadFromStorage(packet.gardenId);
    packets.push(packet);
    saveToStorage(packet.gardenId, packets);
};
const getSeedPackets = (gardenId)=>{
    return loadFromStorage(gardenId);
};
const updateSeedPacket = (gardenId, id, updates)=>{
    const packets = loadFromStorage(gardenId);
    const index = packets.findIndex((p)=>p.id === id);
    if (index !== -1) {
        packets[index] = {
            ...packets[index],
            ...updates
        };
        saveToStorage(gardenId, packets);
    }
};
const deleteSeedPacket = (gardenId, id)=>{
    const packets = loadFromStorage(gardenId);
    const filtered = packets.filter((p)=>p.id !== id);
    saveToStorage(gardenId, filtered);
};
const getExpiringSeeds = (gardenId, currentYear)=>{
    const packets = getSeedPackets(gardenId);
    return packets.filter((p)=>p.expiryYear <= currentYear + 1 && p.quantityRemaining !== 'Empty').sort((a, b)=>a.expiryYear - b.expiryYear);
};
const getLowStockSeeds = (gardenId)=>{
    const packets = getSeedPackets(gardenId);
    return packets.filter((p)=>(p.quantityRemaining === 'Low' || p.quantityRemaining === 'Medium') && p.quantityRemaining !== 'Empty');
};
const useSeedForPlanting = (gardenId, packetId, quantity = 1)=>{
    const packets = loadFromStorage(gardenId);
    const packet = packets.find((p)=>p.id === packetId);
    if (!packet || packet.quantityRemaining === 'Empty') {
        return false;
    }
    // Logica di riduzione quantità
    const quantityMap = {
        'High': 3,
        'Medium': 2,
        'Low': 1,
        'Empty': 0
    };
    const currentValue = quantityMap[packet.quantityRemaining];
    const newValue = Math.max(0, currentValue - quantity);
    let newQuantity;
    if (newValue >= 3) {
        newQuantity = 'High';
    } else if (newValue >= 2) {
        newQuantity = 'Medium';
    } else if (newValue >= 1) {
        newQuantity = 'Low';
    } else {
        newQuantity = 'Empty';
    }
    updateSeedPacket(gardenId, packetId, {
        quantityRemaining: newQuantity
    });
    return true;
};
const findSeedsForPlant = (gardenId, speciesName, varietyName)=>{
    const packets = getSeedPackets(gardenId);
    return packets.filter((p)=>{
        const speciesMatch = p.speciesName.toLowerCase() === speciesName.toLowerCase();
        const varietyMatch = !varietyName || p.varietyName.toLowerCase() === varietyName.toLowerCase();
        return speciesMatch && varietyMatch && p.quantityRemaining !== 'Empty';
    });
};
const getExpiredSeeds = (gardenId, currentYear)=>{
    const packets = getSeedPackets(gardenId);
    return packets.filter((p)=>p.expiryYear < currentYear);
};
const shouldShowJanuaryAlert = ()=>{
    const month = new Date().getMonth() + 1;
    return month === 1; // Gennaio
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/seedlingService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Seedling Service
 * Gestione batch semenzai con tracking dettagliato
 */ __turbopack_context__.s([
    "addPhotoToLog",
    ()=>addPhotoToLog,
    "calculateOptimalSowingDate",
    ()=>calculateOptimalSowingDate,
    "createSeedlingBatch",
    ()=>createSeedlingBatch,
    "getSeedlingTimeline",
    ()=>getSeedlingTimeline,
    "isReadyToTransplant",
    ()=>isReadyToTransplant,
    "shouldStartHardening",
    ()=>shouldStartHardening,
    "updateBatchPhase",
    ()=>updateBatchPhase,
    "updateSurvivalCount",
    ()=>updateSurvivalCount
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/plantMasterService.ts [app-client] (ecmascript)");
;
const createSeedlingBatch = (plantName, sowingDate, quantity, location, gardenId, variety)=>{
    const masterData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMasterSheet"])(plantName);
    if (!masterData) {
        throw new Error(`Pianta ${plantName} non trovata nel database`);
    }
    // Calcola data trapianto attesa (basata su germination + nursing + hardening)
    const avgGerminationDays = (masterData.germination.emergenceDays.min + masterData.germination.emergenceDays.max) / 2;
    const nursingDays = 30; // Fase nursing standard
    const hardeningDays = 10; // Fase hardening standard
    const totalDays = avgGerminationDays + nursingDays + hardeningDays;
    const sowing = new Date(sowingDate);
    const expectedTransplant = new Date(sowing);
    expectedTransplant.setDate(expectedTransplant.getDate() + totalDays);
    return {
        id: crypto.randomUUID(),
        plantName,
        variety,
        sowingDate,
        quantity,
        location,
        phase: 'Sowing',
        currentQuantity: quantity,
        expectedTransplantDate: expectedTransplant.toISOString().split('T')[0],
        gardenId,
        photoLog: []
    };
};
const calculateOptimalSowingDate = (plantName, targetTransplantDate, garden)=>{
    const masterData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMasterSheet"])(plantName);
    if (!masterData) return null;
    // Calcola giorni necessari (germinazione + nursing + hardening)
    const avgGerminationDays = (masterData.germination.emergenceDays.min + masterData.germination.emergenceDays.max) / 2;
    const nursingDays = 30;
    const hardeningDays = 10;
    const totalDays = avgGerminationDays + nursingDays + hardeningDays;
    const targetDate = new Date(targetTransplantDate);
    const optimalSowing = new Date(targetDate);
    optimalSowing.setDate(optimalSowing.getDate() - totalDays);
    // Verifica che la data non sia nel passato
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (optimalSowing < today) {
        return null; // Troppo tardi per seminare
    }
    return optimalSowing.toISOString().split('T')[0];
};
const getSeedlingTimeline = (batch)=>{
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sowingDate = new Date(batch.sowingDate);
    sowingDate.setHours(0, 0, 0, 0);
    const daysSinceSowing = Math.floor((today.getTime() - sowingDate.getTime()) / (1000 * 60 * 60 * 24));
    const masterData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$plantMasterService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMasterSheet"])(batch.plantName);
    if (!masterData) {
        return {
            phase: batch.phase,
            daysInPhase: daysSinceSowing
        };
    }
    const avgGerminationDays = (masterData.germination.emergenceDays.min + masterData.germination.emergenceDays.max) / 2;
    const nursingDays = 30;
    const hardeningDays = 10;
    let phase = 'Sowing';
    let daysInPhase = daysSinceSowing;
    let nextPhase;
    let daysToNextPhase;
    if (daysSinceSowing < avgGerminationDays) {
        phase = 'Germination';
        daysInPhase = daysSinceSowing;
        nextPhase = 'Nursing';
        daysToNextPhase = avgGerminationDays - daysSinceSowing;
    } else if (daysSinceSowing < avgGerminationDays + nursingDays) {
        phase = 'Nursing';
        daysInPhase = daysSinceSowing - avgGerminationDays;
        nextPhase = 'Hardening';
        daysToNextPhase = avgGerminationDays + nursingDays - daysSinceSowing;
    } else if (daysSinceSowing < avgGerminationDays + nursingDays + hardeningDays) {
        phase = 'Hardening';
        daysInPhase = daysSinceSowing - (avgGerminationDays + nursingDays);
        nextPhase = 'ReadyToTransplant';
        daysToNextPhase = avgGerminationDays + nursingDays + hardeningDays - daysSinceSowing;
    } else {
        phase = 'ReadyToTransplant';
        daysInPhase = daysSinceSowing - (avgGerminationDays + nursingDays + hardeningDays);
    }
    return {
        phase,
        daysInPhase,
        nextPhase,
        daysToNextPhase
    };
};
const shouldStartHardening = (batch, garden)=>{
    const timeline = getSeedlingTimeline(batch);
    if (timeline.phase !== 'Nursing') {
        return {
            shouldStart: false,
            reason: 'Non ancora in fase nursing'
        };
    }
    // Inizia hardening quando mancano 10-14 giorni al trapianto previsto
    if (timeline.daysToNextPhase && timeline.daysToNextPhase <= 14) {
        return {
            shouldStart: true,
            reason: `Mancano ${timeline.daysToNextPhase} giorni al trapianto previsto`
        };
    }
    return {
        shouldStart: false
    };
};
const isReadyToTransplant = (batch, garden)=>{
    const timeline = getSeedlingTimeline(batch);
    const warnings = [];
    if (timeline.phase !== 'ReadyToTransplant' && timeline.phase !== 'Hardening') {
        return {
            ready: false,
            reason: 'Non ancora pronto per trapianto'
        };
    }
    // Verifica che ci siano piantine sopravvissute
    if (!batch.currentQuantity || batch.currentQuantity === 0) {
        return {
            ready: false,
            reason: 'Nessuna piantina sopravvissuta'
        };
    }
    // Verifica che la fase hardening sia completata (almeno 7 giorni)
    if (timeline.phase === 'Hardening' && timeline.daysInPhase < 7) {
        return {
            ready: false,
            reason: `Hardening in corso: ${timeline.daysInPhase} giorni (minimo 7 giorni richiesti)`
        };
    }
    // Warnings
    if (batch.currentQuantity < batch.quantity * 0.5) {
        warnings.push(`Solo ${batch.currentQuantity}/${batch.quantity} piantine sopravvissute (50% o meno)`);
    }
    if (timeline.phase === 'Hardening' && timeline.daysInPhase < 10) {
        warnings.push('Hardening ancora in corso, considera di aspettare altri giorni');
    }
    return {
        ready: timeline.phase === 'ReadyToTransplant' || timeline.phase === 'Hardening' && timeline.daysInPhase >= 7,
        warnings: warnings.length > 0 ? warnings : undefined
    };
};
const updateBatchPhase = (batch, newPhase)=>{
    return {
        ...batch,
        phase: newPhase
    };
};
const addPhotoToLog = (batch, image, notes)=>{
    return {
        ...batch,
        photoLog: [
            ...batch.photoLog || [],
            {
                date: new Date().toISOString().split('T')[0],
                image,
                notes
            }
        ]
    };
};
const updateSurvivalCount = (batch, currentQuantity)=>{
    return {
        ...batch,
        currentQuantity: Math.max(0, Math.min(currentQuantity, batch.quantity))
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/seedlingBatchHelper.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Seedling Batch Helper
 * Funzioni helper per filtrare e gestire batch di piantine
 */ __turbopack_context__.s([
    "countReadySeedlings",
    ()=>countReadySeedlings,
    "getAllReadyBatches",
    ()=>getAllReadyBatches,
    "getNextReadyBatches",
    ()=>getNextReadyBatches,
    "getNextTransplantDate",
    ()=>getNextTransplantDate,
    "getReadyBatchesForPlant",
    ()=>getReadyBatchesForPlant,
    "hasReadyBatchForPlant",
    ()=>hasReadyBatchForPlant
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$seedlingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/seedlingService.ts [app-client] (ecmascript)");
;
function getReadyBatchesForPlant(plantName, batches, garden) {
    if (!garden) {
        return batches.filter((b)=>b.plantName.toLowerCase() === plantName.toLowerCase() && (b.phase === 'ReadyToTransplant' || b.phase === 'Hardening'));
    }
    return batches.filter((batch)=>{
        if (batch.plantName.toLowerCase() !== plantName.toLowerCase()) {
            return false;
        }
        const readyCheck = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$seedlingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isReadyToTransplant"])(batch, garden);
        return readyCheck.ready;
    });
}
function hasReadyBatchForPlant(plantName, batches, garden) {
    return getReadyBatchesForPlant(plantName, batches, garden).length > 0;
}
function getNextTransplantDate(plantName, batches, garden) {
    const readyBatches = getReadyBatchesForPlant(plantName, batches, garden);
    if (readyBatches.length === 0) {
        return null;
    }
    // Ordina per expectedTransplantDate crescente
    const sortedBatches = readyBatches.sort((a, b)=>{
        const dateA = a.expectedTransplantDate ? new Date(a.expectedTransplantDate).getTime() : Infinity;
        const dateB = b.expectedTransplantDate ? new Date(b.expectedTransplantDate).getTime() : Infinity;
        return dateA - dateB;
    });
    const nextBatch = sortedBatches[0];
    if (!nextBatch.expectedTransplantDate) {
        return null;
    }
    return new Date(nextBatch.expectedTransplantDate);
}
function getAllReadyBatches(batches, garden) {
    if (!garden) {
        return batches.filter((b)=>b.phase === 'ReadyToTransplant' || b.phase === 'Hardening' && b.currentQuantity && b.currentQuantity > 0);
    }
    return batches.filter((batch)=>{
        const readyCheck = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$seedlingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isReadyToTransplant"])(batch, garden);
        return readyCheck.ready;
    });
}
function countReadySeedlings(batches, garden) {
    const readyBatches = getAllReadyBatches(batches, garden);
    return readyBatches.reduce((total, batch)=>{
        return total + (batch.currentQuantity || 0);
    }, 0);
}
function getNextReadyBatches(batches, limit = 3, garden) {
    const readyBatches = getAllReadyBatches(batches, garden);
    // Ordina per expectedTransplantDate crescente
    const sorted = readyBatches.sort((a, b)=>{
        const dateA = a.expectedTransplantDate ? new Date(a.expectedTransplantDate).getTime() : Infinity;
        const dateB = b.expectedTransplantDate ? new Date(b.expectedTransplantDate).getTime() : Infinity;
        return dateA - dateB;
    });
    return sorted.slice(0, limit);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/geographicMatchingService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Geographic Matching Service
 * Calculates plant feasibility based on user location and USDA zones
 */ __turbopack_context__.s([
    "calculateFeasibility",
    ()=>calculateFeasibility,
    "detectUsdaZone",
    ()=>detectUsdaZone,
    "estimateUsdaZone",
    ()=>estimateUsdaZone,
    "getLocalClimateData",
    ()=>getLocalClimateData,
    "getUserLocationProfile",
    ()=>getUserLocationProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$geolocationService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/geolocationService.ts [app-client] (ecmascript)");
;
/**
 * USDA Zone mapping for Italy (approximate)
 * Based on minimum winter temperatures
 */ const USDA_ZONE_MAP = {
    '7a': {
        min: -17.8,
        max: -15.0
    },
    '7b': {
        min: -15.0,
        max: -12.2
    },
    '8a': {
        min: -12.2,
        max: -9.4
    },
    '8b': {
        min: -9.4,
        max: -6.7
    },
    '9a': {
        min: -6.7,
        max: -3.9
    },
    '9b': {
        min: -3.9,
        max: -1.1
    },
    '10a': {
        min: -1.1,
        max: 1.7
    },
    '10b': {
        min: 1.7,
        max: 4.4
    },
    '11': {
        min: 4.4,
        max: 10.0
    }
};
const estimateUsdaZone = (lat, altitude = 0)=>{
    // Base zone from latitude (Italy ranges from ~36°N to ~47°N)
    let baseZone = 9; // Default for central Italy
    if (lat < 38) {
        // Sicily, southern Calabria
        baseZone = altitude < 200 ? 10 : altitude < 500 ? 9 : 8;
    } else if (lat < 40) {
        // Southern Italy
        baseZone = altitude < 300 ? 9 : altitude < 800 ? 8 : 7;
    } else if (lat < 42) {
        // Central Italy
        baseZone = altitude < 200 ? 9 : altitude < 600 ? 8 : 7;
    } else if (lat < 45) {
        // Northern Italy
        baseZone = altitude < 100 ? 8 : altitude < 400 ? 7 : 6;
    } else {
        // Alpine regions
        baseZone = altitude < 300 ? 7 : altitude < 800 ? 6 : 5;
    }
    // Convert to USDA zone string
    if (baseZone >= 10) return '10a';
    if (baseZone >= 9) return lat < 38 && altitude < 200 ? '10a' : '9b';
    if (baseZone >= 8) return '8b';
    if (baseZone >= 7) return '8a';
    return '7b';
};
const detectUsdaZone = async (lat, lon, altitude)=>{
    // If altitude provided, use it
    if (altitude !== undefined) {
        return estimateUsdaZone(lat, altitude);
    }
    // Try to get altitude from API (simplified - in production use proper elevation API)
    // For now, estimate based on latitude
    return estimateUsdaZone(lat, 0);
};
/**
 * Calculate distance from sea (simplified approximation)
 * In production, use proper geospatial calculation
 */ const estimateDistanceFromSea = (lat, lon)=>{
    // Simplified: Italy is surrounded by sea, so estimate based on distance from coastlines
    // This is a rough approximation - for production use proper coastline distance calculation
    // Major Italian coastlines (simplified)
    const coasts = [
        {
            lat: 44.4,
            lon: 8.9
        },
        {
            lat: 41.9,
            lon: 12.5
        },
        {
            lat: 40.8,
            lon: 14.3
        },
        {
            lat: 38.1,
            lon: 13.4
        },
        {
            lat: 36.9,
            lon: 14.7
        }
    ];
    let minDistance = Infinity;
    for (const coast of coasts){
        const distance = Math.sqrt(Math.pow(lat - coast.lat, 2) + Math.pow(lon - coast.lon, 2)) * 111; // Convert degrees to km (approximate)
        minDistance = Math.min(minDistance, distance);
    }
    return Math.round(minDistance);
};
const getLocalClimateData = async (lat, lon)=>{
    // Simplified estimation based on latitude
    // In production, use weather API like OpenWeatherMap, WeatherAPI, etc.
    const isSouth = lat < 40;
    const isNorth = lat > 45;
    return {
        lastFrostDate: isSouth ? '2024-03-01' : isNorth ? '2024-04-15' : '2024-03-20',
        firstFrostDate: isSouth ? '2024-12-01' : isNorth ? '2024-10-15' : '2024-11-15',
        avgTemp: {
            min: isSouth ? 8 : isNorth ? 2 : 5,
            max: isSouth ? 28 : isNorth ? 24 : 26
        },
        precipitation: isSouth ? 600 : isNorth ? 1000 : 800
    };
};
const calculateFeasibility = (plant, userLocation)=>{
    const warnings = [];
    const requiredProtections = [];
    let score = 100;
    // Get climate compatibility data
    const climate = plant.climateCompatibility;
    if (!climate) {
        // Fallback to basic climate requirements
        return {
            feasibility: 'Possible',
            score: 50,
            requiredProtections: [],
            recommendedSystem: 'greenhouse',
            warnings: [
                'Dati climatici incompleti per questa pianta'
            ],
            recommendedVariety: plant.varieties?.[0]?.name
        };
    }
    // Check USDA zone compatibility
    if (userLocation.usdaZone) {
        const userZoneNum = parseFloat(userLocation.usdaZone.replace(/[a-z]/i, ''));
        const optimalZones = climate.optimalUsdaZones || climate.usdaZones;
        const compatibleZones = climate.usdaZones;
        if (!compatibleZones.includes(userZoneNum)) {
            score -= 40;
            warnings.push(`La tua zona USDA (${userLocation.usdaZone}) non è compatibile con questa pianta`);
        } else if (!optimalZones.includes(userZoneNum)) {
            score -= 20;
            warnings.push(`La tua zona USDA (${userLocation.usdaZone}) è al limite della compatibilità`);
        }
    }
    // Check altitude
    if (userLocation.altitude !== undefined && climate.maxAltitudeMeters) {
        if (userLocation.altitude > climate.maxAltitudeMeters) {
            score -= 30;
            warnings.push(`L'altitudine (${userLocation.altitude}m) supera il limite consigliato (${climate.maxAltitudeMeters}m)`);
        }
    }
    // Check distance from sea
    if (climate.benefitsFromSea && userLocation.distanceFromSea !== undefined) {
        if (userLocation.distanceFromSea > (climate.seaDistanceKm || 50)) {
            score -= 15;
            warnings.push(`La distanza dal mare (${userLocation.distanceFromSea}km) potrebbe limitare la crescita`);
        }
    }
    // Determine recommended system
    const cultivationSystems = plant.cultivationSystems;
    let recommendedSystem = 'greenhouse';
    if (cultivationSystems) {
        // Check open field feasibility
        if (cultivationSystems.openField?.possible) {
            const requires = cultivationSystems.openField.requires;
            if (userLocation.usdaZone && requires.minUsdaZone) {
                const userZoneNum = parseFloat(userLocation.usdaZone.replace(/[a-z]/i, ''));
                if (userZoneNum >= requires.minUsdaZone) {
                    recommendedSystem = 'openField';
                    if (requires.protection !== 'None') {
                        requiredProtections.push(requires.protectionType || 'Protezione temporanea');
                    }
                }
            }
        }
        // Check container feasibility
        if (cultivationSystems.container?.possible && score > 40) {
            if (recommendedSystem === 'greenhouse' && score < 60) {
                recommendedSystem = 'container';
                if (cultivationSystems.container.moveableIndoor) {
                    requiredProtections.push('Spostamento indoor in inverno');
                }
            }
        }
        // Greenhouse requirements
        if (cultivationSystems.greenhouse?.required) {
            recommendedSystem = 'greenhouse';
            if (cultivationSystems.greenhouse.heatingRequired) {
                requiredProtections.push('Riscaldamento serra');
            }
        }
    }
    // Find best variety for this location
    let recommendedVariety;
    if (plant.varieties && plant.varieties.length > 0) {
        // Sort varieties by cold hardiness (best for user's climate)
        const sortedVarieties = [
            ...plant.varieties
        ].sort((a, b)=>{
            // Prefer varieties with better cold hardiness for cooler zones
            if (userLocation.usdaZone) {
                const userZoneNum = parseFloat(userLocation.usdaZone.replace(/[a-z]/i, ''));
                if (userZoneNum < 9) {
                    return b.coldHardiness - a.coldHardiness; // Higher cold hardiness first
                }
            }
            return 0;
        });
        recommendedVariety = sortedVarieties[0]?.name;
        // Also prefer container-friendly varieties if container system recommended
        if (recommendedSystem === 'container') {
            const containerVariety = sortedVarieties.find((v)=>v.containerFriendly);
            if (containerVariety) {
                recommendedVariety = containerVariety.name;
            }
        }
    }
    // Determine feasibility level
    let feasibility;
    if (score >= 80) {
        feasibility = 'Ideal';
    } else if (score >= 50) {
        feasibility = 'Possible';
    } else if (score >= 20) {
        feasibility = 'Difficult';
    } else {
        feasibility = 'NotRecommended';
    }
    // Add system-specific warnings
    if (recommendedSystem === 'greenhouse' && !cultivationSystems?.greenhouse?.required) {
        warnings.push('Serra consigliata per migliori risultati');
    }
    if (recommendedSystem === 'container' && cultivationSystems?.container?.moveableIndoor) {
        warnings.push('Vaso spostabile necessario per protezione invernale');
    }
    return {
        feasibility,
        score: Math.max(0, Math.min(100, score)),
        requiredProtections,
        recommendedVariety,
        recommendedSystem,
        warnings
    };
};
const getUserLocationProfile = async ()=>{
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$geolocationService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentPositionWithRetry"])(2);
        if (!result.success || !result.latitude || !result.longitude) {
            // Fallback to default coordinates
            const defaultCoords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$geolocationService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDefaultCoordinates"])();
            const usdaZone = await detectUsdaZone(defaultCoords.latitude, defaultCoords.longitude);
            const distanceFromSea = estimateDistanceFromSea(defaultCoords.latitude, defaultCoords.longitude);
            return {
                lat: defaultCoords.latitude,
                lon: defaultCoords.longitude,
                usdaZone,
                distanceFromSea,
                city: 'Roma',
                region: 'Lazio'
            };
        }
        const usdaZone = await detectUsdaZone(result.latitude, result.longitude);
        const distanceFromSea = estimateDistanceFromSea(result.latitude, result.longitude);
        return {
            lat: result.latitude,
            lon: result.longitude,
            usdaZone,
            distanceFromSea
        };
    } catch (error) {
        console.error('Error getting user location:', error);
        return null;
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/weatherService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkCriticalWeatherAlerts",
    ()=>checkCriticalWeatherAlerts,
    "checkTransplantConditions",
    ()=>checkTransplantConditions,
    "generateWeatherAlerts",
    ()=>generateWeatherAlerts,
    "getWeatherForecast",
    ()=>getWeatherForecast,
    "getWeatherForecast7Days",
    ()=>getWeatherForecast7Days
]);
const getWeatherForecast = async (lat, lng)=>{
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_min,temperature_2m_max,precipitation_sum,weathercode&timezone=auto`);
        const data = await response.json();
        if (data.current_weather && data.daily) {
            return {
                temp: data.current_weather.temperature,
                tempMin: data.daily.temperature_2m_min?.[0],
                tempMax: data.daily.temperature_2m_max?.[0],
                code: data.current_weather.weathercode,
                rainForecastMm: data.daily.precipitation_sum?.[0] || 0
            };
        }
        return null;
    } catch (error) {
        console.error("Weather fetch failed", error);
        return null;
    }
};
const getWeatherForecast7Days = async (lat, lng)=>{
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_min,temperature_2m_max,precipitation_sum,weathercode,relativehumidity_2m,windspeed_10m&timezone=auto&forecast_days=7`);
        const data = await response.json();
        if (data.daily && data.daily.time) {
            return data.daily.time.map((date, i)=>({
                    temp: (data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) / 2,
                    tempMin: data.daily.temperature_2m_min[i],
                    tempMax: data.daily.temperature_2m_max[i],
                    code: data.daily.weathercode[i],
                    rainForecastMm: data.daily.precipitation_sum[i] || 0,
                    date,
                    humidity: data.daily.relativehumidity_2m?.[i],
                    windSpeed: data.daily.windspeed_10m?.[i]
                }));
        }
        return [];
    } catch (error) {
        console.error("Weather forecast 7 days failed", error);
        return [];
    }
};
const generateWeatherAlerts = (forecast, activePlants)=>{
    const alerts = [];
    // Check for frost
    const frostDays = forecast.filter((f)=>f.tempMin !== undefined && f.tempMin < 2);
    if (frostDays.length > 0) {
        const sensitivePlants = activePlants?.filter((p)=>(p.minTemp || 10) > 10) || [];
        if (sensitivePlants.length > 0) {
            alerts.push({
                severity: 'CRITICAL',
                type: 'FROST',
                message: `⚠️ GELATA PREVISTA: ${frostDays[0].date || 'Oggi'} (Min: ${frostDays[0].tempMin?.toFixed(1)}°C)`,
                actionRequired: [
                    `Copri immediatamente: ${sensitivePlants.map((p)=>p.plantName).join(', ')}`,
                    'Usa teli TNT o campane di plastica',
                    'Se in vaso, sposta al riparo',
                    'Annaffia leggermente al mattino (acqua rilascia calore)'
                ],
                date: frostDays[0].date
            });
        }
    }
    // Check for heatwave (3+ days >35°C)
    const heatDays = forecast.filter((f)=>f.tempMax !== undefined && f.tempMax > 35);
    if (heatDays.length >= 3) {
        alerts.push({
            severity: 'HIGH',
            type: 'HEATWAVE',
            message: `🔥 ONDATA DI CALORE: ${heatDays.length} giorni > 35°C`,
            actionRequired: [
                'Installa teli ombreggianti (50%) su Lattughe, Spinaci',
                'Sposta irrigazione a prima mattina (5-7am) per evitare evaporazione',
                'Aumenta frequenza irrigazione Pomodori/Peperoni',
                'Pacciamatura d\'emergenza se non fatta'
            ]
        });
    }
    // Check for heavy rain (2+ days >20mm)
    const rainDays = forecast.filter((f)=>f.rainForecastMm > 20);
    if (rainDays.length >= 2) {
        alerts.push({
            severity: 'MEDIUM',
            type: 'HEAVYRAIN',
            message: `☔ PIOGGE INTENSE PREVISTE: ${rainDays.length} giorni con >20mm`,
            actionRequired: [
                'Sospendi irrigazione per i prossimi giorni',
                'Se terreno argilloso: verifica che non ci siano ristagni',
                'Zappa leggermente dopo pioggia per arieggiare'
            ]
        });
    }
    // Check for drought (7+ days without rain, low humidity)
    const dryDays = forecast.filter((f)=>f.rainForecastMm === 0);
    if (dryDays.length >= 7 && forecast[0]?.humidity && forecast[0].humidity < 40) {
        alerts.push({
            severity: 'MEDIUM',
            type: 'DROUGHT',
            message: `🏜️ SICCITÀ: 7+ giorni senza pioggia, umidità <40%`,
            actionRequired: [
                'Verifica che pacciamatura sia intatta',
                'Controlla impianto irrigazione',
                'Aumenta frequenza per terreni sabbiosi',
                'Nebulizza foglie di Lattughe/Spinaci alla sera'
            ]
        });
    }
    return alerts;
};
const checkTransplantConditions = async (lat, lng, minTemp)=>{
    const forecast = await getWeatherForecast(lat, lng);
    if (!forecast) {
        return {
            isSuitable: false,
            reason: "Impossibile recuperare le previsioni meteo. Verifica la connessione.",
            requiredMinTemp: minTemp
        };
    }
    // Usa la temperatura minima prevista (notturna) se disponibile, altrimenti usa la corrente
    const currentMinTemp = forecast.tempMin ?? forecast.temp;
    if (currentMinTemp < minTemp) {
        return {
            isSuitable: false,
            reason: `La temperatura minima prevista (${currentMinTemp.toFixed(1)}°C) è inferiore a quella richiesta (${minTemp}°C). Aspetta che le notti si riscaldino.`,
            currentMinTemp,
            requiredMinTemp: minTemp
        };
    }
    return {
        isSuitable: true,
        reason: `Le condizioni sono adatte: temperatura minima prevista ${currentMinTemp.toFixed(1)}°C (richiesta: ${minTemp}°C).`,
        currentMinTemp,
        requiredMinTemp: minTemp
    };
};
const checkCriticalWeatherAlerts = (forecast)=>{
    const alerts = [];
    // Alert gelata tardiva (minime < 0°C)
    if (forecast.tempMin !== undefined && forecast.tempMin < 0) {
        alerts.push({
            type: 'frost',
            severity: 'Critical',
            message: `⚠️ GELATA IN ARRIVO! Stanotte previsti ${forecast.tempMin.toFixed(1)}°C. Copri le piante sensibili!`,
            icon: 'Snowflake'
        });
    }
    // Alert ondata di calore (massime > 35°C)
    if (forecast.tempMax !== undefined && forecast.tempMax > 35) {
        alerts.push({
            type: 'heat',
            severity: 'High',
            message: `🌡️ CALDO ESTREMO! ${forecast.tempMax.toFixed(1)}°C previsti. Aumenta irrigazione e ombreggia!`,
            icon: 'ThermometerSun'
        });
    }
    // Alert pioggia intensa (> 20mm)
    if (forecast.rainForecastMm > 20) {
        alerts.push({
            type: 'heavy_rain',
            severity: 'Medium',
            message: `🌧️ PIOGGIA INTENSA! ${forecast.rainForecastMm.toFixed(1)}mm previsti. Sospendi irrigazione!`,
            icon: 'CloudRain'
        });
    }
    return alerts;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/preciseSunCalculator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Precise Sun Calculator
 * Calcola la posizione del sole e l'esposizione solare precisa giorno-per-giorno
 * considerando ostacoli 3D (palazzi, alberi, montagne)
 */ __turbopack_context__.s([
    "calculateDailySunHours",
    ()=>calculateDailySunHours,
    "calculateMonthlySunHours",
    ()=>calculateMonthlySunHours,
    "calculateOptimalPeriod",
    ()=>calculateOptimalPeriod,
    "calculatePeakSunHours",
    ()=>calculatePeakSunHours,
    "calculateSunHoursInTimeRange",
    ()=>calculateSunHoursInTimeRange,
    "calculateSunPosition",
    ()=>calculateSunPosition,
    "getCropRecommendation",
    ()=>getCropRecommendation,
    "getExposureType",
    ()=>getExposureType
]);
/**
 * Calcola il giorno dell'anno (1-365/366)
 */ function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}
function calculateSunPosition(lat, lng, date, hour) {
    const dayOfYear = getDayOfYear(date);
    // Declinazione solare (angolo del sole rispetto all'equatore)
    // Formula: 23.45 * sin(360 * (284 + dayOfYear) / 365)
    const declination = 23.45 * Math.sin(360 * (284 + dayOfYear) / 365 * Math.PI / 180);
    // Equazione del tempo (correzione per longitudine)
    const timeCorrection = 4 * lng + date.getTimezoneOffset() * -1; // minuti
    const solarTime = hour + timeCorrection / 60;
    // Angolo orario (15° per ora)
    const hourAngle = 15 * (solarTime - 12); // Gradi
    // Converti in radianti
    const latRad = lat * Math.PI / 180;
    const declRad = declination * Math.PI / 180;
    const hourRad = hourAngle * Math.PI / 180;
    // Elevazione solare (altezza sopra l'orizzonte)
    const elevation = Math.asin(Math.sin(latRad) * Math.sin(declRad) + Math.cos(latRad) * Math.cos(declRad) * Math.cos(hourRad)) * 180 / Math.PI;
    // Azimut solare (direzione)
    const azimuth = Math.atan2(Math.sin(hourRad), Math.cos(hourRad) * Math.sin(latRad) - Math.tan(declRad) * Math.cos(latRad)) * 180 / Math.PI + 180;
    return {
        azimuth: azimuth < 0 ? azimuth + 360 : azimuth,
        elevation: Math.max(0, elevation),
        hour
    };
}
/**
 * Verifica se il sole è bloccato da un ostacolo
 */ function isSunBlockedByObstacle(sunPos, obstacle) {
    // Calcola angolo di elevazione dell'ostacolo
    // arctan(height / distance) = angolo sopra l'orizzonte
    const obstacleElevation = Math.atan2(obstacle.height, obstacle.distance) * 180 / Math.PI;
    // Verifica se il sole è nella direzione dell'ostacolo
    const azimuthDiff = Math.abs(sunPos.azimuth - obstacle.azimuth);
    const minAzimuthDiff = Math.min(azimuthDiff, 360 - azimuthDiff);
    // Se il sole è nella direzione dell'ostacolo (entro widthDegrees/2)
    // E l'elevazione del sole è più bassa dell'ostacolo
    if (minAzimuthDiff <= obstacle.widthDegrees / 2) {
        return sunPos.elevation < obstacleElevation;
    }
    return false;
}
function calculateDailySunHours(lat, lng, date, obstacles = [], timeStep = 10) {
    let sunMinutes = 0;
    // Calcola posizione sole ogni timeStep minuti dalle 6:00 alle 18:00
    const startHour = 6;
    const endHour = 18;
    const stepsPerHour = 60 / timeStep;
    for(let hour = startHour; hour <= endHour; hour += timeStep / 60){
        const sunPos = calculateSunPosition(lat, lng, date, hour);
        // Se il sole è sotto l'orizzonte, salta
        if (sunPos.elevation <= 0) continue;
        // Verifica se il sole è bloccato da qualche ostacolo
        const isBlocked = obstacles.some((obstacle)=>isSunBlockedByObstacle(sunPos, obstacle));
        if (!isBlocked) {
            sunMinutes += timeStep;
        }
    }
    return Math.round(sunMinutes / 60 * 10) / 10; // Arrotonda a 1 decimale
}
function calculateMonthlySunHours(lat, lng, year, month, obstacles = []) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const hours = [];
    // Campiona alcuni giorni rappresentativi del mese
    const sampleDays = [
        Math.floor(daysInMonth * 0.1),
        Math.floor(daysInMonth * 0.3),
        Math.floor(daysInMonth * 0.5),
        Math.floor(daysInMonth * 0.7),
        Math.floor(daysInMonth * 0.9)
    ].filter((day)=>day >= 1 && day <= daysInMonth);
    // Se non ci sono giorni validi, usa il 15 del mese
    if (sampleDays.length === 0) {
        sampleDays.push(15);
    }
    for (const day of sampleDays){
        const date = new Date(year, month - 1, day);
        const hoursForDay = calculateDailySunHours(lat, lng, date, obstacles);
        hours.push(hoursForDay);
    }
    const avgHours = hours.reduce((sum, h)=>sum + h, 0) / hours.length;
    const minHours = Math.min(...hours);
    const maxHours = Math.max(...hours);
    return {
        month,
        avgHours: Math.round(avgHours * 10) / 10,
        minHours: Math.round(minHours * 10) / 10,
        maxHours: Math.round(maxHours * 10) / 10
    };
}
function calculateOptimalPeriod(lat, lng, obstacles = [], minSunHours = 6, year = new Date().getFullYear()) {
    const monthlyHours = [];
    // Calcola per ogni mese
    for(let month = 1; month <= 12; month++){
        const monthly = calculateMonthlySunHours(lat, lng, year, month, obstacles);
        monthlyHours.push(monthly);
    }
    // Trova periodo migliore (mesi consecutivi con >= minSunHours)
    let bestStart = -1;
    let bestLength = 0;
    let currentStart = -1;
    let currentLength = 0;
    for(let i = 0; i < 12; i++){
        if (monthlyHours[i].avgHours >= minSunHours) {
            if (currentStart === -1) {
                currentStart = i;
            }
            currentLength++;
            if (currentLength > bestLength) {
                bestLength = currentLength;
                bestStart = currentStart;
            }
        } else {
            currentStart = -1;
            currentLength = 0;
        }
    }
    // Gestisci periodo che attraversa l'anno (dicembre-gennaio)
    if (monthlyHours[11].avgHours >= minSunHours && monthlyHours[0].avgHours >= minSunHours) {
        // Controlla se dicembre e gennaio sono collegati
        let decemberStart = -1;
        if (monthlyHours[11].avgHours >= minSunHours) {
            decemberStart = 11;
            let decemberLength = 1;
            for(let i = 0; i < 12 && monthlyHours[i].avgHours >= minSunHours; i++){
                decemberLength++;
            }
            if (decemberLength > bestLength) {
                bestLength = decemberLength;
                bestStart = 11; // Dicembre
            }
        }
    }
    let bestPeriod = null;
    if (bestStart >= 0 && bestLength > 0) {
        const startMonth = bestStart + 1; // 1-12
        const endMonth = bestStart + bestLength;
        const actualEndMonth = endMonth > 12 ? endMonth - 12 : endMonth;
        const avgSunHours = monthlyHours.slice(bestStart, bestStart + bestLength).reduce((sum, m)=>sum + m.avgHours, 0) / bestLength;
        bestPeriod = {
            start: new Date(year, bestStart, 1),
            end: new Date(year, actualEndMonth - 1, new Date(year, actualEndMonth, 0).getDate()),
            durationMonths: bestLength,
            avgSunHours: Math.round(avgSunHours * 10) / 10
        };
    }
    // Genera raccomandazioni
    const recommendations = [];
    const maxHours = Math.max(...monthlyHours.map((m)=>m.avgHours));
    const minHours = Math.min(...monthlyHours.map((m)=>m.avgHours));
    if (maxHours >= 8) {
        recommendations.push('Ottimo per pomodori, peperoni, zucchine (pieno sole - 8+ ore)');
    }
    if (maxHours >= 6 && maxHours < 8) {
        recommendations.push('Buono per molte verdure (sole parziale - 6-8 ore)');
    }
    if (minHours >= 4) {
        recommendations.push('Adatto tutto l\'anno per insalate e verdure a foglia (minimo 4 ore)');
    }
    if (bestPeriod) {
        const startMonthName = bestPeriod.start.toLocaleDateString('it-IT', {
            month: 'long'
        });
        const endMonthName = bestPeriod.end.toLocaleDateString('it-IT', {
            month: 'long'
        });
        recommendations.push(`Periodo ottimale: ${bestPeriod.durationMonths} mesi consecutivi ` + `(${startMonthName} - ${endMonthName}) con media ${bestPeriod.avgSunHours} ore/giorno`);
    } else {
        recommendations.push('Nessun periodo con sufficiente sole diretto. Considera piante da ombra o spostare l\'orto.');
    }
    return {
        bestPeriod,
        monthlySunHours: monthlyHours,
        recommendations
    };
}
function getExposureType(sunHours) {
    if (sunHours >= 8) return 'FullSun';
    if (sunHours >= 5) return 'PartialSun';
    if (sunHours >= 3) return 'PartialShade';
    return 'FullShade';
}
function getCropRecommendation(exposureType) {
    const recommendations = {
        'FullSun': 'Ideale per pomodori, peperoni, zucchine, melanzane, cetrioli e piante che amano il sole diretto.',
        'PartialSun': 'Buona esposizione. Adatta a molte verdure: fagiolini, piselli, carote, cipolle. Alcune piante potrebbero beneficiare di ombreggiamento nelle ore più calde.',
        'PartialShade': 'Esposizione parziale. Ideale per lattughe, spinaci, rucola, bietole, cavoli e piante che preferiscono ombra parziale.',
        'FullShade': 'Poca esposizione diretta. Considera piante da ombra (lattughe, spinaci, erbe aromatiche) o valuta di spostare l\'orto in una zona più soleggiata.'
    };
    return recommendations[exposureType] || recommendations['PartialSun'];
}
function calculateSunHoursInTimeRange(lat, lng, date, obstacles, startHour, endHour, timeStep = 10) {
    let sunMinutes = 0;
    const stepsPerHour = 60 / timeStep;
    for(let hour = startHour; hour <= endHour; hour += timeStep / 60){
        const sunPos = calculateSunPosition(lat, lng, date, hour);
        // Se il sole è sotto l'orizzonte, salta
        if (sunPos.elevation <= 0) continue;
        // Verifica se il sole è bloccato da qualche ostacolo
        const isBlocked = obstacles.some((obstacle)=>isSunBlockedByObstacle(sunPos, obstacle));
        if (!isBlocked) {
            sunMinutes += timeStep;
        }
    }
    return Math.round(sunMinutes / 60 * 10) / 10; // Arrotonda a 1 decimale
}
function calculatePeakSunHours(lat, lng, date, obstacles) {
    // Calcola presenza sole per ogni ora del giorno
    const hourPresence = new Array(24).fill(0);
    const timeStep = 0.5; // Ogni 30 minuti
    for(let hour = 6; hour < 18; hour += timeStep){
        const sunPos = calculateSunPosition(lat, lng, date, hour);
        if (sunPos.elevation > 0) {
            const isBlocked = obstacles.some((obstacle)=>isSunBlockedByObstacle(sunPos, obstacle));
            if (!isBlocked) {
                const hourIndex = Math.floor(hour);
                hourPresence[hourIndex] += timeStep;
            }
        }
    }
    // Trova l'intervallo con più presenza di sole (minimo 3 ore)
    let maxStart = 9;
    let maxEnd = 16;
    let maxPresence = 0;
    for(let start = 6; start <= 12; start += 0.5){
        for(let end = start + 3; end <= 18; end += 0.5){
            let presence = 0;
            for(let h = Math.floor(start); h < Math.ceil(end); h++){
                presence += hourPresence[h] || 0;
            }
            if (presence > maxPresence) {
                maxPresence = presence;
                maxStart = start;
                maxEnd = end;
            }
        }
    }
    return {
        start: Math.round(maxStart * 10) / 10,
        end: Math.round(maxEnd * 10) / 10
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/seasonalSunWindows.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Seasonal Sun Windows Service
 * Calcola le 4 finestre stagionali solari e classifica il tipo di orto
 */ __turbopack_context__.s([
    "calculateSeasonalWindows",
    ()=>calculateSeasonalWindows,
    "classifyGardenType",
    ()=>classifyGardenType
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$preciseSunCalculator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/preciseSunCalculator.ts [app-client] (ecmascript)");
;
function calculateSeasonalWindows(lat, lng, obstacles = [], year = new Date().getFullYear(), altitudeMeters, soilType, historicalWeather) {
    const windows = [];
    // Helper per calcolare temperatura effettiva per un periodo
    const getEffectiveTempForPeriod = (period)=>{
        const weather = historicalWeather?.find((w)=>w.period === period);
        if (!weather) return undefined;
        // Temperatura base da meteo storico
        let effectiveTemp = weather.avgTemp;
        // Correzione altitudine
        if (altitudeMeters && altitudeMeters > 0) {
            effectiveTemp = calculateEffectiveTemperature(altitudeMeters, effectiveTemp);
        }
        // Correzione tipo terreno (temperatura suolo)
        if (soilType) {
            effectiveTemp = calculateSoilHeatingRate(soilType, effectiveTemp);
        }
        return Math.round(effectiveTemp * 10) / 10;
    };
    // Feb-Mar: Avvio primaverile
    const febMar = aggregateMonths(lat, lng, obstacles, year, [
        2,
        3
    ]);
    windows.push({
        period: 'Feb-Mar',
        ...febMar,
        effectiveTemperature: getEffectiveTempForPeriod('Feb-Mar')
    });
    // Apr-Mag: Crescita vegetativa
    const aprMag = aggregateMonths(lat, lng, obstacles, year, [
        4,
        5
    ]);
    windows.push({
        period: 'Apr-Mag',
        ...aprMag,
        effectiveTemperature: getEffectiveTempForPeriod('Apr-Mag')
    });
    // Giu-Lug: Massimo solare estivo
    const giuLug = aggregateMonths(lat, lng, obstacles, year, [
        6,
        7
    ]);
    const peakHours = calculatePeakSunHoursForPeriod(lat, lng, obstacles, year, 6, 7);
    windows.push({
        period: 'Giu-Lug',
        ...giuLug,
        peakHours,
        effectiveTemperature: getEffectiveTempForPeriod('Giu-Lug')
    });
    // Ago-Set: Maturazione + stress
    const agoSet = aggregateMonths(lat, lng, obstacles, year, [
        8,
        9
    ]);
    windows.push({
        period: 'Ago-Set',
        ...agoSet,
        effectiveTemperature: getEffectiveTempForPeriod('Ago-Set')
    });
    return windows;
}
/**
 * Aggrega dati di più mesi per una finestra stagionale
 */ function aggregateMonths(lat, lng, obstacles, year, months) {
    const allHours = [];
    for (const month of months){
        const monthly = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$preciseSunCalculator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMonthlySunHours"])(lat, lng, year, month, obstacles);
        // Campiona alcuni giorni per avere più dati
        const daysInMonth = new Date(year, month, 0).getDate();
        const sampleDays = [
            5,
            15,
            25
        ].filter((d)=>d <= daysInMonth);
        for (const day of sampleDays){
            const date = new Date(year, month - 1, day);
            const hours = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$preciseSunCalculator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateDailySunHours"])(lat, lng, date, obstacles);
            allHours.push(hours);
        }
    }
    if (allHours.length === 0) {
        return {
            avgHours: 0,
            minHours: 0,
            maxHours: 0
        };
    }
    const avgHours = allHours.reduce((sum, h)=>sum + h, 0) / allHours.length;
    const minHours = Math.min(...allHours);
    const maxHours = Math.max(...allHours);
    return {
        avgHours: Math.round(avgHours * 10) / 10,
        minHours: Math.round(minHours * 10) / 10,
        maxHours: Math.round(maxHours * 10) / 10
    };
}
/**
 * Calcola le ore di picco del sole per un periodo (quando arriva il sole)
 * Restituisce l'intervallo orario principale (es. 9:30-16:30)
 */ function calculatePeakSunHoursForPeriod(lat, lng, obstacles, year, startMonth, endMonth) {
    // Campiona alcuni giorni rappresentativi del periodo
    const sampleDates = [];
    for(let month = startMonth; month <= endMonth; month++){
        const daysInMonth = new Date(year, month, 0).getDate();
        sampleDates.push(new Date(year, month - 1, Math.floor(daysInMonth / 2)));
    }
    // Calcola per ogni ora del giorno quando c'è sole
    const hourPresence = new Array(24).fill(0);
    const samplesPerHour = sampleDates.length;
    for (const date of sampleDates){
        for(let hour = 6; hour < 18; hour += 0.5){
            const sunPos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$preciseSunCalculator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateSunPosition"])(lat, lng, date, hour);
            if (sunPos.elevation > 0) {
                const isBlocked = obstacles.some((obs)=>{
                    const obstacleElevation = Math.atan2(obs.height, obs.distance) * 180 / Math.PI;
                    const azimuthDiff = Math.abs(sunPos.azimuth - obs.azimuth);
                    const minAzimuthDiff = Math.min(azimuthDiff, 360 - azimuthDiff);
                    if (minAzimuthDiff <= obs.widthDegrees / 2) {
                        return sunPos.elevation < obstacleElevation;
                    }
                    return false;
                });
                if (!isBlocked) {
                    const hourIndex = Math.floor(hour);
                    hourPresence[hourIndex] += 1 / samplesPerHour;
                }
            }
        }
    }
    // Trova l'intervallo con più presenza di sole
    let maxStart = 9;
    let maxEnd = 16;
    let maxPresence = 0;
    for(let start = 6; start <= 12; start++){
        for(let end = start + 3; end <= 18; end++){
            let presence = 0;
            for(let h = start; h < end; h++){
                presence += hourPresence[h] || 0;
            }
            if (presence > maxPresence) {
                maxPresence = presence;
                maxStart = start;
                maxEnd = end;
            }
        }
    }
    return {
        start: maxStart,
        end: maxEnd
    };
}
function classifyGardenType(windows) {
    const giuLug = windows.find((w)=>w.period === 'Giu-Lug');
    const febMar = windows.find((w)=>w.period === 'Feb-Mar');
    const aprMag = windows.find((w)=>w.period === 'Apr-Mag');
    const agoSet = windows.find((w)=>w.period === 'Ago-Set');
    if (!giuLug || !febMar || !aprMag || !agoSet) {
        return {
            type: 'Misto',
            summerScore: 0.5,
            springAutumnScore: 0.5,
            windows,
            recommendations: [
                'Dati insufficienti per classificazione precisa'
            ]
        };
    }
    // Verifica condizioni ORTO ESTIVO
    // Giu-Lug >= 6h continuo, meglio se sole tra 9:30-16:30
    const isEstivo = giuLug.avgHours >= 6 && giuLug.minHours >= 5 && // Almeno 5h anche nei giorni peggiori
    (!giuLug.peakHours || giuLug.peakHours.start <= 9.5 && giuLug.peakHours.end >= 16.5);
    // Verifica condizioni ORTO PRIMAVERILE/AUTUNNALE
    // Mar-Apr >= 3-4h, Giu-Lug <= 6-7h (non troppo sole estivo)
    const marAprAvg = (febMar.avgHours + aprMag.avgHours) / 2;
    const isPrimaverileAutunnale = marAprAvg >= 3 && giuLug.avgHours <= 7; // Non troppo sole estivo
    // Verifica condizioni ORTO FOGLIA ESTIVA
    // Sole solo mattino (3-5h), ombra pomeriggio
    const isFogliaEstiva = giuLug.avgHours >= 3 && giuLug.avgHours <= 5 && giuLug.peakHours && giuLug.peakHours.end <= 13; // Sole solo fino alle 13:00
    // Calcola score estivo (0-1)
    let summerScore = 0;
    if (giuLug.avgHours >= 6) {
        summerScore = Math.min(1, (giuLug.avgHours - 6) / 4); // 6h = 0, 10h = 1
    }
    if (giuLug.peakHours && giuLug.peakHours.start <= 9.5 && giuLug.peakHours.end >= 16.5) {
        summerScore = Math.min(1, summerScore + 0.2); // Bonus per sole centrale
    }
    // Calcola score primaverile/autunnale (0-1)
    let springAutumnScore = 0;
    if (marAprAvg >= 3) {
        springAutumnScore = Math.min(1, (marAprAvg - 3) / 3); // 3h = 0, 6h = 1
    }
    if (giuLug.avgHours <= 7) {
        springAutumnScore = Math.min(1, springAutumnScore + 0.3); // Bonus per non troppo sole estivo
    }
    // Determina tipo
    let type;
    if (isEstivo && summerScore >= 0.7) {
        type = 'Estivo';
    } else if (isPrimaverileAutunnale && springAutumnScore >= 0.7) {
        type = 'NonEstivo';
    } else {
        type = 'Misto';
    }
    // Genera raccomandazioni
    const recommendations = [];
    if (type === 'Estivo') {
        recommendations.push('Orto Estivo: Ideale per pomodori, peperoni, melanzane, zucchine, cetrioli');
        recommendations.push(`Periodo ottimale: Maggio-Agosto con ${giuLug.avgHours}h di sole continuo`);
        if (giuLug.peakHours) {
            recommendations.push(`Sole centrale tra le ${Math.floor(giuLug.peakHours.start)}:${Math.floor(giuLug.peakHours.start % 1 * 60)} e le ${Math.floor(giuLug.peakHours.end)}:${Math.floor(giuLug.peakHours.end % 1 * 60)}`);
        }
    } else if (type === 'NonEstivo') {
        recommendations.push('Orto Primaverile/Autunnale: Ideale per insalate, spinaci, rucola, piselli, cipolle, fave');
        recommendations.push(`Periodo ottimale: Marzo-Maggio e Settembre-Ottobre con ${marAprAvg.toFixed(1)}h di sole`);
        recommendations.push('Vantaggi: Produzione più lunga, meno stress, consumo idrico ridotto');
    } else {
        recommendations.push('Orto Misto: Adatto a diverse categorie di colture');
        if (isFogliaEstiva) {
            recommendations.push('Sole mattutino disponibile: Ideale per basilico, prezzemolo, coriandolo, lattughe estive');
            recommendations.push('Cicli rapidi possibili ogni 30-40 giorni');
        }
        if (summerScore > 0.3) {
            recommendations.push(`Possibile coltivazione estiva con resa moderata (${giuLug.avgHours}h di sole)`);
        }
        if (springAutumnScore > 0.3) {
            recommendations.push(`Possibile coltivazione primaverile/autunnale (${marAprAvg.toFixed(1)}h di sole)`);
        }
    }
    return {
        type,
        summerScore: Math.round(summerScore * 100) / 100,
        springAutumnScore: Math.round(springAutumnScore * 100) / 100,
        windows,
        recommendations
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/plantingWindowOptimizer.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Planting Window Optimizer Service
 * Calcola finestre ottimali di impianto considerando seme vs piantina
 */ __turbopack_context__.s([
    "adjustForPlantingMethod",
    ()=>adjustForPlantingMethod,
    "findPlantingWindows",
    ()=>findPlantingWindows
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$plantMasterSheets$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/data/plantMasterSheets.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$preciseSunCalculator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/preciseSunCalculator.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$soilTemperatureUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/soilTemperatureUtils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$altitudeUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/altitudeUtils.ts [app-client] (ecmascript)");
;
;
;
;
/**
 * Trova finestre ottimali di impianto per ogni categoria
 * 
 * @param classification Classificazione del tipo di orto
 * @param windows Finestre stagionali solari
 * @param lat Latitudine
 * @param lng Longitudine
 * @param obstacles Ostacoli 3D (opzionale)
 * @param year Anno per cui calcolare
 * @returns Array di finestre di impianto
 */ /**
 * Helper per aggiustare data considerando terreno e altitudine
 */ function adjustPlantingDateForConditions(baseDate, soilType, altitudeMeters, plantType = 'standard') {
    let adjustedDate = new Date(baseDate);
    // 1. Applica ritardo altitudine
    if (altitudeMeters && altitudeMeters > 200) {
        const altitudeDelay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$altitudeUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateAltitudePlantingDelay"])(altitudeMeters, plantType);
        adjustedDate.setDate(adjustedDate.getDate() + altitudeDelay);
    }
    // 2. Applica correzione tipo terreno
    const soilDelay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$soilTemperatureUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateSoilWarmingDelay"])(soilType);
    adjustedDate.setDate(adjustedDate.getDate() + soilDelay);
    return adjustedDate;
}
function findPlantingWindows(classification, windows, lat, lng, obstacles = [], year = new Date().getFullYear(), soilType, altitudeMeters, historicalWeather) {
    const plantingWindows = [];
    const giuLug = windows.find((w)=>w.period === 'Giu-Lug');
    const febMar = windows.find((w)=>w.period === 'Feb-Mar');
    const aprMag = windows.find((w)=>w.period === 'Apr-Mag');
    const agoSet = windows.find((w)=>w.period === 'Ago-Set');
    if (!giuLug || !febMar || !aprMag || !agoSet) {
        return plantingWindows;
    }
    // ORTO ESTIVO
    if (classification.type === 'Estivo' || classification.summerScore >= 0.7) {
        if (giuLug.avgHours >= 6) {
            const startDate = findFirstDateWithHours(lat, lng, obstacles, year, 6, [
                5,
                6,
                7
            ]);
            const endDate = findLastDateWithHours(lat, lng, obstacles, year, 6, [
                6,
                7,
                8
            ], 8);
            plantingWindows.push({
                category: 'Estivo',
                startDate,
                endDate,
                method: 'Seedling',
                recommendedPlants: [
                    'Pomodoro',
                    'Peperone',
                    'Melanzana',
                    'Zucchina',
                    'Cetriolo'
                ],
                reason: 'Periodo con sole continuo ottimale per piante da frutto. Resa massima garantita.',
                cycles: calculateCycles(startDate, endDate, 120)
            });
        }
    }
    // ORTO PRIMAVERILE/AUTUNNALE
    if (classification.type === 'NonEstivo' || classification.springAutumnScore >= 0.7) {
        const marAprAvg = (febMar.avgHours + aprMag.avgHours) / 2;
        if (marAprAvg >= 3 && giuLug.avgHours <= 7) {
            const baseStartDate = findFirstDateWithHours(lat, lng, obstacles, year, 3, [
                2,
                3,
                4
            ]);
            const baseEndDate = findLastDateWithHours(lat, lng, obstacles, year, 3, [
                4,
                5
            ], 7);
            // Applica aggiustamenti terreno e altitudine
            const adjustedStartDate = adjustPlantingDateForConditions(baseStartDate, soilType, altitudeMeters, 'early' // Piante primaverili sono precoci
            );
            const adjustedEndDate = adjustPlantingDateForConditions(baseEndDate, soilType, altitudeMeters, 'early');
            plantingWindows.push({
                category: 'Primaverile',
                startDate: adjustedStartDate,
                endDate: adjustedEndDate,
                method: 'Seed',
                recommendedPlants: [
                    'Insalata',
                    'Spinaci',
                    'Rucola',
                    'Piselli',
                    'Cipolle',
                    'Fave'
                ],
                reason: 'Orto primaverile/autunnale con sole moderato ideale per foglie e radici. Produzione più lunga e meno stress.',
                cycles: calculateCycles(adjustedStartDate, adjustedEndDate, 60),
                adjustedStartDate: adjustedStartDate
            });
        }
    }
    // ORTO FOGLIA ESTIVA
    if (giuLug.avgHours >= 3 && giuLug.avgHours <= 5 && giuLug.peakHours && giuLug.peakHours.end <= 13) {
        const baseStartDate = new Date(year, 5, 1); // Giugno
        const baseEndDate = new Date(year, 8, 30); // Agosto
        // Applica aggiustamenti terreno e altitudine
        const adjustedStartDate = adjustPlantingDateForConditions(baseStartDate, soilType, altitudeMeters, 'early' // Foglie estive sono precoci
        );
        const adjustedEndDate = adjustPlantingDateForConditions(baseEndDate, soilType, altitudeMeters, 'early');
        plantingWindows.push({
            category: 'FogliaEstiva',
            startDate: adjustedStartDate,
            endDate: adjustedEndDate,
            method: 'Seed',
            recommendedPlants: [
                'Basilico',
                'Prezzemolo',
                'Coriandolo',
                'Lattuga Estiva'
            ],
            reason: 'Sole mattutino con ombra pomeridiana ideale per foglie estive. Cicli rapidi.',
            cycles: calculateCycles(adjustedStartDate, adjustedEndDate, 40),
            adjustedStartDate: adjustedStartDate
        });
    }
    // ORTO MISTO - Finestre aggiuntive
    if (classification.type === 'Misto') {
        if (classification.summerScore >= 0.3) {
            const baseStartDate = findFirstDateWithHours(lat, lng, obstacles, year, 5, [
                5,
                6
            ]);
            const baseEndDate = findLastDateWithHours(lat, lng, obstacles, year, 5, [
                7,
                8
            ], 8);
            const adjustedStartDate = adjustPlantingDateForConditions(baseStartDate, soilType, altitudeMeters, 'standard');
            const adjustedEndDate = adjustPlantingDateForConditions(baseEndDate, soilType, altitudeMeters, 'standard');
            plantingWindows.push({
                category: 'Estivo',
                startDate: adjustedStartDate,
                endDate: adjustedEndDate,
                method: 'Seedling',
                recommendedPlants: [
                    'Pomodoro',
                    'Zucchina'
                ],
                reason: 'Possibile coltivazione estiva con resa moderata.',
                cycles: calculateCycles(adjustedStartDate, adjustedEndDate, 120),
                adjustedStartDate: adjustedStartDate
            });
        }
        if (classification.springAutumnScore >= 0.3) {
            const baseStartDate2 = findFirstDateWithHours(lat, lng, obstacles, year, 3, [
                3,
                4
            ]);
            const baseEndDate2 = findLastDateWithHours(lat, lng, obstacles, year, 3, [
                5,
                6
            ], 7);
            const adjustedStartDate2 = adjustPlantingDateForConditions(baseStartDate2, soilType, altitudeMeters, 'early');
            const adjustedEndDate2 = adjustPlantingDateForConditions(baseEndDate2, soilType, altitudeMeters, 'early');
            plantingWindows.push({
                category: 'Primaverile',
                startDate: adjustedStartDate2,
                endDate: adjustedEndDate2,
                method: 'Seed',
                recommendedPlants: [
                    'Insalata',
                    'Spinaci',
                    'Rucola'
                ],
                reason: 'Possibile coltivazione primaverile/autunnale con sole moderato.',
                cycles: calculateCycles(adjustedStartDate2, adjustedEndDate2, 60),
                adjustedStartDate: adjustedStartDate2
            });
        }
    }
    return plantingWindows;
}
function adjustForPlantingMethod(window, method, plantId) {
    const adjustedWindow = {
        ...window
    };
    if (method === 'Seed') {
        // Per seme, devi iniziare prima (tempo germinazione + nursing)
        let daysBefore = 45; // Default: 45 giorni
        // Se abbiamo l'ID della pianta, calcola giorni precisi
        if (plantId) {
            const plant = (0, __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$plantMasterSheets$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMasterSheetById"])(plantId);
            if (plant) {
                const avgGerminationDays = plant.germination?.emergenceDays ? (plant.germination.emergenceDays.min + plant.germination.emergenceDays.max) / 2 : 10;
                const nursingDays = 30;
                daysBefore = avgGerminationDays + nursingDays;
            }
        }
        adjustedWindow.adjustedStartDate = new Date(window.startDate);
        adjustedWindow.adjustedStartDate.setDate(adjustedWindow.adjustedStartDate.getDate() - daysBefore);
        adjustedWindow.method = 'Seed';
    } else {
        // Per piantina, puoi iniziare direttamente nella finestra
        adjustedWindow.adjustedStartDate = window.startDate;
        adjustedWindow.method = 'Seedling';
    }
    return adjustedWindow;
}
/**
 * Calcola quanti cicli sono possibili in una finestra
 */ function calculateCycles(startDate, endDate, cycleDays) {
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.floor(daysDiff / cycleDays));
}
/**
 * Trova la prima data quando supera una soglia di ore di sole
 */ function findFirstDateWithHours(lat, lng, obstacles, year, minHours, months) {
    for (const month of months){
        const daysInMonth = new Date(year, month, 0).getDate();
        for(let day = 1; day <= daysInMonth; day++){
            const date = new Date(year, month - 1, day);
            const hours = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$preciseSunCalculator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateDailySunHours"])(lat, lng, date, obstacles);
            if (hours >= minHours) {
                return date;
            }
        }
    }
    return new Date(year, months[0] - 1, 1);
}
/**
 * Trova l'ultima data quando supera una soglia di ore di sole
 * o quando supera un limite di stress
 */ function findLastDateWithHours(lat, lng, obstacles, year, minHours, months, maxStressHours) {
    let lastValidDate = null;
    for (const month of months){
        const daysInMonth = new Date(year, month, 0).getDate();
        for(let day = daysInMonth; day >= 1; day--){
            const date = new Date(year, month - 1, day);
            const hours = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$preciseSunCalculator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateDailySunHours"])(lat, lng, date, obstacles);
            if (maxStressHours && hours > maxStressHours) {
                break;
            }
            if (hours >= minHours) {
                if (!lastValidDate || date > lastValidDate) {
                    lastValidDate = date;
                }
            }
        }
    }
    return lastValidDate || new Date(year, months[months.length - 1] - 1, new Date(year, months[months.length - 1], 0).getDate());
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/seasonalPlantSuggestions.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Seasonal Plant Suggestions Service
 * Suggerisce piante in base alla classificazione stagionale dell'orto
 */ __turbopack_context__.s([
    "suggestPlantsForGardenType",
    ()=>suggestPlantsForGardenType
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$plantMasterSheets$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/data/plantMasterSheets.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$preciseSunCalculator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/preciseSunCalculator.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$soilTemperatureUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/soilTemperatureUtils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$altitudeUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/altitudeUtils.ts [app-client] (ecmascript)");
;
;
;
;
/**
 * Suggerisce piante in base alla classificazione stagionale dell'orto
 * 
 * @param classification Classificazione del tipo di orto
 * @param windows Finestre stagionali solari
 * @param lat Latitudine (per calcolo date precise)
 * @param lng Longitudine (per calcolo date precise)
 * @param obstacles Ostacoli 3D (opzionale, per calcolo date precise)
 * @param year Anno per cui calcolare (default: anno corrente)
 * @returns Array di suggerimenti piante
 */ /**
 * Determina tipo pianta per calcolo ritardo altitudine
 */ function getPlantTypeForAltitude(plantName) {
    const nameUpper = plantName.toUpperCase();
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
 * Aggiusta data considerando terreno e altitudine
 */ function adjustDateForConditions(baseDate, soilType, altitudeMeters, plantType = 'standard') {
    let adjustedDate = new Date(baseDate);
    // 1. Applica ritardo altitudine
    if (altitudeMeters && altitudeMeters > 200) {
        const altitudeDelay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$altitudeUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateAltitudePlantingDelay"])(altitudeMeters, plantType);
        adjustedDate.setDate(adjustedDate.getDate() + altitudeDelay);
    }
    // 2. Applica correzione tipo terreno
    const soilDelay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$soilTemperatureUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateSoilWarmingDelay"])(soilType);
    adjustedDate.setDate(adjustedDate.getDate() + soilDelay);
    return adjustedDate;
}
function suggestPlantsForGardenType(classification, windows, lat, lng, obstacles = [], year = new Date().getFullYear(), soilType, altitudeMeters) {
    const suggestions = [];
    const allPlants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$plantMasterSheets$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllMasterSheets"])();
    const giuLug = windows.find((w)=>w.period === 'Giu-Lug');
    const febMar = windows.find((w)=>w.period === 'Feb-Mar');
    const aprMag = windows.find((w)=>w.period === 'Apr-Mag');
    const agoSet = windows.find((w)=>w.period === 'Ago-Set');
    if (!giuLug || !febMar || !aprMag || !agoSet) {
        return suggestions;
    }
    // ORTO ESTIVO
    if (classification.type === 'Estivo' || classification.summerScore >= 0.7) {
        if (giuLug.avgHours >= 6) {
            const estivePlants = allPlants.filter((p)=>p.nutrientCategory === 'FRUITING' && [
                    'POMODORO',
                    'PEPERONE',
                    'PEPERONCINO',
                    'MELANZANA',
                    'ZUCCHINA',
                    'ZUCCHINO',
                    'CETRIOLO'
                ].includes(p.commonName.toUpperCase()));
            estivePlants.forEach((plant)=>{
                // Verifica compatibilità terreno
                const soilCompatibility = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$soilTemperatureUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSoilCompatibility"])(plant.commonName, soilType);
                if (!soilCompatibility.compatible) {
                    return; // Salta piante non compatibili
                }
                const baseStartDate = findFirstDateWithHours(lat, lng, obstacles, year, 6, [
                    5,
                    6,
                    7
                ]); // Maggio-Giugno-Luglio
                const baseEndDate = findLastDateWithHours(lat, lng, obstacles, year, 6, [
                    6,
                    7,
                    8
                ], 8); // Max stress 8h
                // Applica aggiustamenti terreno e altitudine
                const plantType = getPlantTypeForAltitude(plant.commonName);
                const adjustedStartDate = adjustDateForConditions(baseStartDate, soilType, altitudeMeters, plantType);
                const adjustedEndDate = adjustDateForConditions(baseEndDate, soilType, altitudeMeters, plantType);
                // Calcola suitability score (ridotto se terreno non ottimale)
                let suitabilityScore = classification.summerScore;
                if (soilCompatibility.optimalSoilTypes && soilType && !soilCompatibility.optimalSoilTypes.includes(soilType)) {
                    suitabilityScore *= 0.8; // Riduce del 20% se terreno non ottimale
                } else if (soilCompatibility.optimalSoilTypes && soilType && soilCompatibility.optimalSoilTypes.includes(soilType)) {
                    suitabilityScore *= 1.1; // Aumenta del 10% se terreno ottimale
                }
                let reason = 'Orto estivo con sole continuo ottimale per piante da frutto. Resa massima garantita.';
                if (altitudeMeters && altitudeMeters > 200) {
                    reason += ` Finestra aggiustata per altitudine ${altitudeMeters}m.`;
                }
                if (soilType && soilCompatibility.optimalSoilTypes && soilCompatibility.optimalSoilTypes.includes(soilType)) {
                    reason += ` Terreno ${soilType} ideale per questa pianta.`;
                }
                suggestions.push({
                    plantName: plant.commonName,
                    plantId: plant.id,
                    category: 'Estivo',
                    method: 'Seedling',
                    reason,
                    suitabilityScore: Math.min(1, suitabilityScore),
                    plantingWindow: {
                        start: adjustedStartDate,
                        end: adjustedEndDate
                    }
                });
            });
        }
    }
    // ORTO PRIMAVERILE/AUTUNNALE
    if (classification.type === 'NonEstivo' || classification.springAutumnScore >= 0.7) {
        const marAprAvg = (febMar.avgHours + aprMag.avgHours) / 2;
        if (marAprAvg >= 3 && giuLug.avgHours <= 7) {
            const primaveriliPlants = allPlants.filter((p)=>{
                const nameUpper = p.commonName.toUpperCase();
                return (p.nutrientCategory === 'LEAFY' || p.nutrientCategory === 'ROOT') && (nameUpper.includes('INSALATA') || nameUpper.includes('LATTUGA') || nameUpper === 'SPINACIO' || nameUpper === 'RUCOLA' || nameUpper === 'BIETA' || nameUpper === 'PISELLO' || nameUpper === 'CIPOLLA' || nameUpper === 'FAVA');
            });
            primaveriliPlants.forEach((plant)=>{
                // Verifica compatibilità terreno
                const soilCompatibility = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$soilTemperatureUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSoilCompatibility"])(plant.commonName, soilType);
                if (!soilCompatibility.compatible) {
                    return; // Salta piante non compatibili
                }
                const baseStartDate = findFirstDateWithHours(lat, lng, obstacles, year, 3, [
                    2,
                    3,
                    4
                ]); // Febbraio-Marzo-Aprile
                const baseEndDate = findLastDateWithHours(lat, lng, obstacles, year, 3, [
                    4,
                    5
                ], 7); // Max stress 7h
                // Applica aggiustamenti terreno e altitudine
                const plantType = getPlantTypeForAltitude(plant.commonName);
                const adjustedStartDate = adjustDateForConditions(baseStartDate, soilType, altitudeMeters, plantType);
                const adjustedEndDate = adjustDateForConditions(baseEndDate, soilType, altitudeMeters, plantType);
                // Calcola suitability score
                let suitabilityScore = classification.springAutumnScore;
                if (soilCompatibility.optimalSoilTypes && soilType && !soilCompatibility.optimalSoilTypes.includes(soilType)) {
                    suitabilityScore *= 0.8;
                } else if (soilCompatibility.optimalSoilTypes && soilType && soilCompatibility.optimalSoilTypes.includes(soilType)) {
                    suitabilityScore *= 1.1;
                }
                let reason = 'Orto primaverile/autunnale con sole moderato ideale per foglie e radici. Produzione più lunga e meno stress.';
                if (altitudeMeters && altitudeMeters > 200) {
                    reason += ` Finestra aggiustata per altitudine ${altitudeMeters}m.`;
                }
                if (soilType && soilCompatibility.optimalSoilTypes && soilCompatibility.optimalSoilTypes.includes(soilType)) {
                    reason += ` Terreno ${soilType} ideale per questa pianta.`;
                }
                suggestions.push({
                    plantName: plant.commonName,
                    plantId: plant.id,
                    category: 'Primaverile',
                    method: 'Seed',
                    reason,
                    suitabilityScore: Math.min(1, suitabilityScore),
                    plantingWindow: {
                        start: adjustedStartDate,
                        end: adjustedEndDate
                    }
                });
            });
        }
    }
    // ORTO FOGLIA ESTIVA (ombra intelligente)
    if (giuLug.avgHours >= 3 && giuLug.avgHours <= 5 && giuLug.peakHours && giuLug.peakHours.end <= 13) {
        // Sole solo mattino
        const fogliaEstivaPlants = allPlants.filter((p)=>{
            const nameUpper = p.commonName.toUpperCase();
            return p.nutrientCategory === 'LEAFY' && (nameUpper === 'BASILICO' || nameUpper === 'PREZZEMOLO' || nameUpper === 'CORIANDOLO' || nameUpper.includes('LATTUGA ESTIVA'));
        });
        fogliaEstivaPlants.forEach((plant)=>{
            const startDate = new Date(year, 5, 1); // Giugno
            const endDate = new Date(year, 8, 30); // Agosto
            suggestions.push({
                plantName: plant.commonName,
                plantId: plant.id,
                category: 'FogliaEstiva',
                method: 'Seed',
                reason: 'Sole mattutino con ombra pomeridiana ideale per foglie estive. Cicli rapidi ogni 30-40 giorni.',
                suitabilityScore: 0.8,
                plantingWindow: {
                    start: startDate,
                    end: endDate
                }
            });
        });
    }
    // ORTO MISTO - Suggerimenti aggiuntivi
    if (classification.type === 'Misto') {
        // Se ha caratteristiche estive ma non ottimali
        if (classification.summerScore >= 0.3 && classification.summerScore < 0.7) {
            const estiveModerate = allPlants.filter((p)=>p.nutrientCategory === 'FRUITING' && [
                    'POMODORO',
                    'ZUCCHINA'
                ].includes(p.commonName.toUpperCase())).slice(0, 2); // Solo 2 piante principali
            estiveModerate.forEach((plant)=>{
                const startDate = findFirstDateWithHours(lat, lng, obstacles, year, 5, [
                    5,
                    6
                ]); // Maggio-Giugno
                const endDate = findLastDateWithHours(lat, lng, obstacles, year, 5, [
                    7,
                    8
                ], 8);
                suggestions.push({
                    plantName: plant.commonName,
                    plantId: plant.id,
                    category: 'Estivo',
                    method: 'Seedling',
                    reason: 'Possibile coltivazione estiva con resa moderata. Sole disponibile ma non ottimale.',
                    suitabilityScore: classification.summerScore,
                    plantingWindow: {
                        start: startDate,
                        end: endDate
                    }
                });
            });
        }
        // Se ha caratteristiche primaverili/autunnali
        if (classification.springAutumnScore >= 0.3) {
            const primaveriliModerate = allPlants.filter((p)=>p.nutrientCategory === 'LEAFY' && [
                    'INSALATA',
                    'SPINACIO',
                    'RUCOLA'
                ].includes(p.commonName.toUpperCase())).slice(0, 3);
            primaveriliModerate.forEach((plant)=>{
                const startDate = findFirstDateWithHours(lat, lng, obstacles, year, 3, [
                    3,
                    4
                ]); // Marzo-Aprile
                const endDate = findLastDateWithHours(lat, lng, obstacles, year, 3, [
                    5,
                    6
                ], 7);
                suggestions.push({
                    plantName: plant.commonName,
                    plantId: plant.id,
                    category: 'Primaverile',
                    method: 'Seed',
                    reason: 'Possibile coltivazione primaverile/autunnale con sole moderato.',
                    suitabilityScore: classification.springAutumnScore,
                    plantingWindow: {
                        start: startDate,
                        end: endDate
                    }
                });
            });
        }
    }
    return suggestions.sort((a, b)=>b.suitabilityScore - a.suitabilityScore);
}
/**
 * Trova la prima data quando supera una soglia di ore di sole
 */ function findFirstDateWithHours(lat, lng, obstacles, year, minHours, months) {
    for (const month of months){
        const daysInMonth = new Date(year, month, 0).getDate();
        for(let day = 1; day <= daysInMonth; day++){
            const date = new Date(year, month - 1, day);
            const hours = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$preciseSunCalculator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateDailySunHours"])(lat, lng, date, obstacles);
            if (hours >= minHours) {
                return date;
            }
        }
    }
    // Default: primo giorno del primo mese
    return new Date(year, months[0] - 1, 1);
}
/**
 * Trova l'ultima data quando supera una soglia di ore di sole
 * o quando supera un limite di stress
 */ function findLastDateWithHours(lat, lng, obstacles, year, minHours, months, maxStressHours) {
    let lastValidDate = null;
    for (const month of months){
        const daysInMonth = new Date(year, month, 0).getDate();
        for(let day = daysInMonth; day >= 1; day--){
            const date = new Date(year, month - 1, day);
            const hours = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$preciseSunCalculator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateDailySunHours"])(lat, lng, date, obstacles);
            // Se supera limite stress, fermati
            if (maxStressHours && hours > maxStressHours) {
                break;
            }
            // Se supera soglia minima, salva come ultima data valida
            if (hours >= minHours) {
                if (!lastValidDate || date > lastValidDate) {
                    lastValidDate = date;
                }
            }
        }
    }
    // Default: ultimo giorno dell'ultimo mese
    return lastValidDate || new Date(year, months[months.length - 1] - 1, new Date(year, months[months.length - 1], 0).getDate());
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/historicalWeatherService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Historical Weather Service
 * Recupera dati meteo storici per calcolare temperature medie per periodo stagionale
 * Usa Open-Meteo Historical Weather API
 */ __turbopack_context__.s([
    "estimateHistoricalWeather",
    ()=>estimateHistoricalWeather,
    "getAllHistoricalWeather",
    ()=>getAllHistoricalWeather,
    "getHistoricalWeatherForPeriod",
    ()=>getHistoricalWeatherForPeriod
]);
/**
 * Cache locale per evitare troppe chiamate API
 */ const weatherCache = new Map();
/**
 * Genera chiave cache per coordinate e periodo
 */ function getCacheKey(lat, lng, period, year) {
    const y = year || new Date().getFullYear();
    return `${lat.toFixed(2)}_${lng.toFixed(2)}_${period}_${y}`;
}
/**
 * Converte periodo stagionale in range di date per API
 */ function periodToDateRange(period, year) {
    const ranges = {
        'Feb-Mar': {
            startMonth: 2,
            endMonth: 3
        },
        'Apr-Mag': {
            startMonth: 4,
            endMonth: 5
        },
        'Giu-Lug': {
            startMonth: 6,
            endMonth: 7
        },
        'Ago-Set': {
            startMonth: 8,
            endMonth: 9
        }
    };
    const { startMonth, endMonth } = ranges[period];
    const startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(endMonth).padStart(2, '0')}-${new Date(year, endMonth, 0).getDate()}`;
    return {
        start: startDate,
        end: endDate
    };
}
async function getHistoricalWeatherForPeriod(lat, lng, period, year) {
    const targetYear = year || new Date().getFullYear();
    const cacheKey = getCacheKey(lat, lng, period, targetYear);
    // Controlla cache
    if (weatherCache.has(cacheKey)) {
        return weatherCache.get(cacheKey);
    }
    try {
        const { start, end } = periodToDateRange(period, targetYear);
        // Open-Meteo Historical Weather API
        // Endpoint: https://archive-api.open-meteo.com/v1/archive
        const url = new URL('https://archive-api.open-meteo.com/v1/archive');
        url.searchParams.set('latitude', lat.toString());
        url.searchParams.set('longitude', lng.toString());
        url.searchParams.set('start_date', start);
        url.searchParams.set('end_date', end);
        url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min');
        url.searchParams.set('timezone', 'Europe/Rome');
        const response = await fetch(url.toString());
        if (!response.ok) {
            console.warn(`Historical weather API error: ${response.status}`);
            return null;
        }
        const data = await response.json();
        if (!data.daily || !data.daily.temperature_2m_max || !data.daily.temperature_2m_min) {
            return null;
        }
        const maxTemps = data.daily.temperature_2m_max.filter((t)=>t !== null);
        const minTemps = data.daily.temperature_2m_min.filter((t)=>t !== null);
        if (maxTemps.length === 0 || minTemps.length === 0) {
            return null;
        }
        // Calcola statistiche
        const avgMax = maxTemps.reduce((sum, t)=>sum + t, 0) / maxTemps.length;
        const avgMin = minTemps.reduce((sum, t)=>sum + t, 0) / minTemps.length;
        const avgTemp = (avgMax + avgMin) / 2;
        const maxTemp = Math.max(...maxTemps);
        const minTemp = Math.min(...minTemps);
        const tempRange = maxTemp - minTemp;
        const result = {
            period,
            avgTemp: Math.round(avgTemp * 10) / 10,
            minTemp: Math.round(minTemp * 10) / 10,
            maxTemp: Math.round(maxTemp * 10) / 10,
            tempRange: Math.round(tempRange * 10) / 10,
            year: targetYear
        };
        // Salva in cache
        weatherCache.set(cacheKey, result);
        return result;
    } catch (error) {
        console.error('Error fetching historical weather:', error);
        return null;
    }
}
async function getAllHistoricalWeather(lat, lng, year) {
    const periods = [
        'Feb-Mar',
        'Apr-Mag',
        'Giu-Lug',
        'Ago-Set'
    ];
    const results = await Promise.all(periods.map((period)=>getHistoricalWeatherForPeriod(lat, lng, period, year)));
    return results;
}
function estimateHistoricalWeather(lat, lng, period, altitudeMeters = 0) {
    // Stime basate su latitudine Italia (36-47°N)
    // Temperature medie approssimative per periodo
    const baseTemps = {
        'Feb-Mar': {
            avg: 8,
            range: 8
        },
        'Apr-Mag': {
            avg: 15,
            range: 10
        },
        'Giu-Lug': {
            avg: 24,
            range: 12
        },
        'Ago-Set': {
            avg: 22,
            range: 10
        }
    };
    const base = baseTemps[period];
    // Correzione per latitudine (Nord più freddo)
    const latCorrection = (lat - 41.5) * -0.5; // -0.5°C per grado più a nord
    // Correzione per altitudine (-0.6°C ogni 100m)
    const altCorrection = altitudeMeters / 100 * -0.6;
    const avgTemp = base.avg + latCorrection + altCorrection;
    const minTemp = avgTemp - base.range / 2;
    const maxTemp = avgTemp + base.range / 2;
    return {
        period,
        avgTemp: Math.round(avgTemp * 10) / 10,
        minTemp: Math.round(minTemp * 10) / 10,
        maxTemp: Math.round(maxTemp * 10) / 10,
        tempRange: base.range
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/fertilizerInventoryService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Fertilizer Inventory Service
 * Gestisce inventario prodotti fertilizzanti, scorte, alert
 */ __turbopack_context__.s([
    "addFertilizerProduct",
    ()=>addFertilizerProduct,
    "checkLowStock",
    ()=>checkLowStock,
    "getFertilizerAlerts",
    ()=>getFertilizerAlerts,
    "getFertilizerInventory",
    ()=>getFertilizerInventory,
    "suggestPurchaseTiming",
    ()=>suggestPurchaseTiming,
    "updateFertilizerQuantity",
    ()=>updateFertilizerQuantity
]);
async function getFertilizerInventory(gardenId) {
    // TODO: Implementare recupero da Supabase
    // Per ora, mock da localStorage
    const storageKey = `fertilizer_inventory_${gardenId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
        return JSON.parse(stored).map((item)=>({
                ...item,
                expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
                createdAt: new Date(item.createdAt),
                updatedAt: new Date(item.updatedAt)
            }));
    }
    return [];
}
async function addFertilizerProduct(gardenId, product, quantity, cost, expiryDate, supplier) {
    const inventory = await getFertilizerInventory(gardenId);
    // Verifica se prodotto già esiste
    const existing = inventory.find((item)=>item.productId === product.id);
    const newItem = {
        id: existing?.id || `fert_${Date.now()}`,
        gardenId,
        productId: product.id,
        productName: product.name,
        productType: product.type,
        category: product.category,
        quantity: existing ? existing.quantity + quantity : quantity,
        unit: product.dosagePerSqm.unit.includes('g') ? 'kg' : 'L',
        expiryDate,
        costPerUnit: cost,
        supplier,
        createdAt: existing?.createdAt || new Date(),
        updatedAt: new Date()
    };
    // Aggiorna inventario
    const updatedInventory = existing ? inventory.map((item)=>item.id === existing.id ? newItem : item) : [
        ...inventory,
        newItem
    ];
    // Salva in localStorage (temporaneo)
    const storageKey = `fertilizer_inventory_${gardenId}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedInventory));
    return newItem;
}
async function updateFertilizerQuantity(productId, gardenId, quantity) {
    const inventory = await getFertilizerInventory(gardenId);
    const item = inventory.find((i)=>i.id === productId);
    if (!item) {
        throw new Error(`Prodotto ${productId} non trovato nell'inventario`);
    }
    item.quantity = quantity;
    item.updatedAt = new Date();
    const storageKey = `fertilizer_inventory_${gardenId}`;
    localStorage.setItem(storageKey, JSON.stringify(inventory));
}
async function checkLowStock(gardenId, season) {
    const inventory = await getFertilizerInventory(gardenId);
    const lowStockItems = [];
    for (const item of inventory){
        // Soglia minima: 1kg o 1L
        const minThreshold = 1;
        if (item.quantity < minThreshold) {
            lowStockItems.push({
                item,
                reason: `Scorta molto bassa: ${item.quantity}${item.unit}`,
                urgency: 'high'
            });
        } else if (item.quantity < minThreshold * 3) {
            lowStockItems.push({
                item,
                reason: `Scorta bassa: ${item.quantity}${item.unit}`,
                urgency: 'medium'
            });
        }
        // Verifica scadenze
        if (item.expiryDate) {
            const daysUntilExpiry = Math.ceil((item.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry < 0) {
                lowStockItems.push({
                    item,
                    reason: `Prodotto scaduto il ${item.expiryDate.toLocaleDateString('it-IT')}`,
                    urgency: 'high'
                });
            } else if (daysUntilExpiry <= 30) {
                lowStockItems.push({
                    item,
                    reason: `Prodotto in scadenza tra ${daysUntilExpiry} giorni`,
                    urgency: 'medium'
                });
            }
        }
    }
    return lowStockItems;
}
async function getFertilizerAlerts(gardenId, plannedUsage) {
    const alerts = [];
    const inventory = await getFertilizerInventory(gardenId);
    // Raggruppa uso pianificato per prodotto
    const usageByProduct = new Map();
    for (const usage of plannedUsage){
        if (!usageByProduct.has(usage.productId)) {
            usageByProduct.set(usage.productId, []);
        }
        usageByProduct.get(usage.productId).push(usage);
    }
    // Verifica scorte vs necessità
    for (const [productId, usages] of usageByProduct){
        const totalNeeded = usages.reduce((sum, u)=>sum + u.quantityNeeded, 0);
        const inventoryItem = inventory.find((i)=>i.productId === productId);
        if (!inventoryItem) {
            // Prodotto necessario ma non in inventario
            alerts.push({
                type: 'Planning',
                message: `⚠️ Prodotto necessario ma non in inventario: ${usages[0].productName}`,
                action: `Aggiungi ${totalNeeded}${usages[0].unit} all'inventario per ${usages[0].season}`,
                blockOperations: false
            });
        } else {
            const available = inventoryItem.quantity;
            const percentage = available / totalNeeded * 100;
            if (percentage < 20) {
                // Scorte < 20% necessità
                alerts.push({
                    type: 'Planning',
                    message: `⚠️ Scorte insufficienti: ${inventoryItem.productName}`,
                    action: `Disponibili: ${available}${inventoryItem.unit}, necessari: ${totalNeeded}${usages[0].unit}. Aggiungi almeno ${Math.ceil(totalNeeded - available)}${usages[0].unit}`,
                    blockOperations: false
                });
            } else if (percentage < 50) {
                // Scorte < 50% necessità
                alerts.push({
                    type: 'Planning',
                    message: `⚠️ Scorte basse: ${inventoryItem.productName}`,
                    action: `Disponibili: ${available}${inventoryItem.unit}, necessari: ${totalNeeded}${usages[0].unit}. Considera di rifornire`,
                    blockOperations: false
                });
            }
        }
    }
    // Verifica scorte basse generali
    const lowStock = await checkLowStock(gardenId, 'Summer');
    for (const { item, reason, urgency } of lowStock){
        if (urgency === 'high') {
            alerts.push({
                type: 'Planning',
                message: `⚠️ ${reason}: ${item.productName}`,
                action: urgency === 'high' ? 'Rifornisci immediatamente' : 'Considera di rifornire',
                blockOperations: false
            });
        }
    }
    return alerts;
}
function suggestPurchaseTiming(productId, season) {
    // Prodotti stagionali comuni
    const seasonalProducts = {
        bone_meal: {
            season: 'Autumn',
            message: 'Cornunghia quasi finita, serve per concimazione autunnale frutteto'
        },
        manure_bovine: {
            season: 'Autumn',
            message: 'Letame necessario per concimazione autunnale. Ordina ora per avere tempo di maturazione'
        }
    };
    const suggestion = seasonalProducts[productId];
    if (suggestion && suggestion.season === season) {
        return {
            message: suggestion.message,
            urgency: 'high'
        };
    }
    return {
        message: 'Considera di rifornire prima della stagione',
        urgency: 'medium'
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/soilStateService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Soil State Service
 * Gestisce stato fisico del terreno (compattazione, drenaggio, lavorabilità)
 */ __turbopack_context__.s([
    "calculateWorkability",
    ()=>calculateWorkability,
    "getSoilState",
    ()=>getSoilState,
    "suggestSoilWork",
    ()=>suggestSoilWork,
    "updateSoilState",
    ()=>updateSoilState
]);
async function updateSoilState(gardenId, zoneId, state) {
// TODO: Implementare salvataggio in database
}
async function getSoilState(gardenId, zoneId) {
    // TODO: Implementare recupero da database
    return null;
}
async function calculateWorkability(soilState, garden, weatherForecast) {
    // Verifica temperatura
    if (weatherForecast?.tempMin !== undefined && weatherForecast.tempMin < 0) {
        return {
            isWorkable: false,
            reason: 'Terreno ghiacciato. Temperatura minima prevista: ' + weatherForecast.tempMin.toFixed(1) + '°C'
        };
    }
    // Verifica pioggia recente
    if (soilState.lastRainDate) {
        const daysSinceRain = Math.ceil((new Date().getTime() - soilState.lastRainDate.getTime()) / (1000 * 60 * 60 * 24));
        const rainAmount = soilState.lastRainAmount || 0;
        // Terreno argilloso: 4-5 giorni dopo pioggia
        // Terreno sabbioso: 1-2 giorni dopo pioggia
        const requiredDays = garden.soilType === 'Clay' ? 5 : garden.soilType === 'Sandy' ? 2 : 3;
        if (daysSinceRain < requiredDays && rainAmount > 10) {
            return {
                isWorkable: false,
                reason: `Terreno troppo umido. Pioggia di ${rainAmount}mm ${daysSinceRain} giorni fa.`,
                daysUntilWorkable: requiredDays - daysSinceRain
            };
        }
    }
    return {
        isWorkable: true,
        reason: 'Terreno in tempera, pronto per lavorazione'
    };
}
async function suggestSoilWork(soilState, garden, plannedPlanting) {
    // Verifica se terreno è compattato
    if (soilState.compaction < 0.5) {
        return {
            workType: 'Sarchiatura',
            urgency: 'medium',
            reason: 'Terreno compattato. Sarchiatura migliorerà aerazione e drenaggio.'
        };
    }
    // Verifica se serve vangatura per nuova piantagione
    if (plannedPlanting) {
        const daysUntilPlanting = Math.ceil((plannedPlanting.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilPlanting <= 7 && !soilState.lastWorkDate) {
            return {
                workType: 'Vangatura',
                urgency: 'high',
                reason: `Piantagione di ${plannedPlanting.plantName} prevista tra ${daysUntilPlanting} giorni. Vangatura necessaria.`
            };
        }
    }
    return null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/treatmentRegistryService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Treatment Registry Service
 * Registro trattamenti fitosanitari per professionisti (obbligatorio)
 */ __turbopack_context__.s([
    "checkSafetyInterval",
    ()=>checkSafetyInterval,
    "exportRegistry",
    ()=>exportRegistry,
    "getActiveSafetyIntervals",
    ()=>getActiveSafetyIntervals,
    "getTreatmentHistory",
    ()=>getTreatmentHistory,
    "registerTreatment",
    ()=>registerTreatment
]);
async function registerTreatment(gardenId, treatmentData) {
    // TODO: Implementare salvataggio in Supabase
    const storageKey = `treatment_registry_${gardenId}`;
    const stored = localStorage.getItem(storageKey);
    const records = stored ? JSON.parse(stored) : [];
    const safetyIntervalEndDate = new Date(treatmentData.treatmentDate);
    safetyIntervalEndDate.setDate(safetyIntervalEndDate.getDate() + treatmentData.product.safetyInterval);
    const newRecord = {
        id: `treatment_${Date.now()}`,
        gardenId,
        taskId: treatmentData.taskId,
        productId: treatmentData.product.id,
        productName: treatmentData.product.name,
        plantName: treatmentData.plantName,
        treatmentDate: treatmentData.treatmentDate,
        dosage: treatmentData.dosage,
        applicationMethod: treatmentData.applicationMethod,
        targetPestDisease: treatmentData.targetPestDisease,
        weatherConditions: treatmentData.weatherConditions,
        safetyIntervalEndDate,
        notes: treatmentData.notes,
        createdAt: new Date()
    };
    records.push(newRecord);
    localStorage.setItem(storageKey, JSON.stringify(records));
    return newRecord;
}
async function getTreatmentHistory(gardenId, plantName, dateRange) {
    const storageKey = `treatment_registry_${gardenId}`;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];
    let records = JSON.parse(stored).map((r)=>({
            ...r,
            treatmentDate: new Date(r.treatmentDate),
            safetyIntervalEndDate: new Date(r.safetyIntervalEndDate),
            createdAt: new Date(r.createdAt)
        }));
    if (plantName) {
        records = records.filter((r)=>r.plantName.toLowerCase().includes(plantName.toLowerCase()));
    }
    if (dateRange) {
        records = records.filter((r)=>r.treatmentDate >= dateRange.start && r.treatmentDate <= dateRange.end);
    }
    return records.sort((a, b)=>b.treatmentDate.getTime() - a.treatmentDate.getTime());
}
function checkSafetyInterval(treatment, currentDate = new Date()) {
    return currentDate < treatment.safetyIntervalEndDate;
}
async function getActiveSafetyIntervals(gardenId) {
    const records = await getTreatmentHistory(gardenId);
    return records.filter((r)=>checkSafetyInterval(r));
}
async function exportRegistry(gardenId, format) {
    const records = await getTreatmentHistory(gardenId);
    if (format === 'csv') {
        const headers = [
            'Data',
            'Prodotto',
            'Pianta',
            'Dosaggio',
            'Metodo',
            'Target',
            'Fine Carenza',
            'Note'
        ];
        const rows = records.map((r)=>[
                r.treatmentDate.toLocaleDateString('it-IT'),
                r.productName,
                r.plantName,
                r.dosage,
                r.applicationMethod,
                r.targetPestDisease,
                r.safetyIntervalEndDate.toLocaleDateString('it-IT'),
                r.notes || ''
            ]);
        const csv = [
            headers.join(','),
            ...rows.map((r)=>r.join(','))
        ].join('\n');
        return csv;
    }
    // PDF: TODO implementare generazione PDF
    return JSON.stringify(records, null, 2);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/deviceDetectionService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Device Detection Service
 * Rileva primo avvio e nuovo dispositivo
 * Genera e traccia device ID univoco
 */ __turbopack_context__.s([
    "getDeviceId",
    ()=>getDeviceId,
    "getDeviceInfo",
    ()=>getDeviceInfo,
    "isDeviceChanged",
    ()=>isDeviceChanged,
    "isFirstLaunch",
    ()=>isFirstLaunch,
    "markLaunchComplete",
    ()=>markLaunchComplete,
    "resetDeviceDetection",
    ()=>resetDeviceDetection
]);
const DEVICE_ID_KEY = 'ortomio_device_id';
const FIRST_LAUNCH_KEY = 'ortomio_first_launch';
const LAST_DEVICE_ID_KEY = 'ortomio_last_device_id';
function getDeviceId() {
    try {
        let deviceId = localStorage.getItem(DEVICE_ID_KEY);
        if (!deviceId) {
            // Genera nuovo device ID
            deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem(DEVICE_ID_KEY, deviceId);
            localStorage.setItem(FIRST_LAUNCH_KEY, 'true');
        }
        return deviceId;
    } catch (error) {
        console.error('Error getting device ID:', error);
        // Fallback: genera ID temporaneo
        return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
function isFirstLaunch() {
    try {
        const firstLaunch = localStorage.getItem(FIRST_LAUNCH_KEY);
        return firstLaunch === 'true';
    } catch (error) {
        console.error('Error checking first launch:', error);
        return false;
    }
}
function markLaunchComplete() {
    try {
        localStorage.setItem(FIRST_LAUNCH_KEY, 'false');
        // Salva device ID corrente come ultimo conosciuto
        const currentDeviceId = getDeviceId();
        localStorage.setItem(LAST_DEVICE_ID_KEY, currentDeviceId);
    } catch (error) {
        console.error('Error marking launch complete:', error);
    }
}
function isDeviceChanged() {
    try {
        const currentDeviceId = getDeviceId();
        const lastDeviceId = localStorage.getItem(LAST_DEVICE_ID_KEY);
        if (!lastDeviceId) {
            // Prima volta, non è cambiato
            return false;
        }
        return currentDeviceId !== lastDeviceId;
    } catch (error) {
        console.error('Error checking device change:', error);
        return false;
    }
}
function getDeviceInfo() {
    const deviceId = getDeviceId();
    const isFirstLaunch = isFirstLaunch();
    const isDeviceChanged = isDeviceChanged();
    // Rileva piattaforma
    const userAgent = ("TURBOPACK compile-time truthy", 1) ? window.navigator.userAgent.toLowerCase() : "TURBOPACK unreachable";
    let platform = 'web';
    if (/iphone|ipad|ipod/.test(userAgent)) {
        platform = 'ios';
    } else if (/android/.test(userAgent)) {
        platform = 'android';
    } else if (("TURBOPACK compile-time value", "object") !== 'undefined' && window.navigator.platform) {
        const platformStr = window.navigator.platform.toLowerCase();
        if (platformStr.includes('win') || platformStr.includes('mac') || platformStr.includes('linux')) {
            platform = 'desktop';
        }
    }
    return {
        deviceId,
        isFirstLaunch,
        isDeviceChanged,
        platform,
        userAgent
    };
}
function resetDeviceDetection() {
    try {
        localStorage.removeItem(DEVICE_ID_KEY);
        localStorage.removeItem(FIRST_LAUNCH_KEY);
        localStorage.removeItem(LAST_DEVICE_ID_KEY);
    } catch (error) {
        console.error('Error resetting device detection:', error);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/cloudSyncService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Cloud Sync Service
 * Sincronizzazione con iCloud (iOS) e Google Drive (Android)
 * Fallback a localStorage per desktop/web
 */ __turbopack_context__.s([
    "detectCloudBackups",
    ()=>detectCloudBackups,
    "detectPlatform",
    ()=>detectPlatform,
    "restoreFromCloud",
    ()=>restoreFromCloud,
    "syncToCloud",
    ()=>syncToCloud
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$deviceDetectionService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/deviceDetectionService.ts [app-client] (ecmascript)");
;
function detectPlatform() {
    const deviceInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$deviceDetectionService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDeviceInfo"])();
    return deviceInfo.platform;
}
async function syncToCloud(data) {
    const platform = detectPlatform();
    try {
        if (platform === 'ios') {
            await syncToiCloud(data);
        } else if (platform === 'android') {
            await syncToGoogleDrive(data);
        } else {
            // Desktop/web: salva backup locale esteso
            await saveWebBackup(data);
        }
    } catch (error) {
        console.error('Error syncing to cloud:', error);
        // Fallback: salva sempre backup locale
        await saveWebBackup(data);
    }
}
async function detectCloudBackups() {
    const platform = detectPlatform();
    const backups = [];
    try {
        if (platform === 'ios') {
            const iCloudBackups = await detectiCloudBackups();
            backups.push(...iCloudBackups);
        } else if (platform === 'android') {
            const driveBackups = await detectGoogleDriveBackups();
            backups.push(...driveBackups);
        }
        // Aggiungi sempre backup locali
        const localBackups = detectLocalBackups();
        backups.push(...localBackups);
        // Ordina per timestamp (più recente prima)
        backups.sort((a, b)=>new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return backups;
    } catch (error) {
        console.error('Error detecting cloud backups:', error);
        // Fallback: ritorna solo backup locali
        return detectLocalBackups();
    }
}
async function restoreFromCloud(backup) {
    try {
        if (backup.source === 'icloud') {
            return await restoreFromiCloud(backup);
        } else if (backup.source === 'google_drive') {
            return await restoreFromGoogleDrive(backup);
        } else {
            // Backup locale
            return await restoreFromLocal(backup);
        }
    } catch (error) {
        console.error('Error restoring from cloud:', error);
        return null;
    }
}
// ========== iCloud Sync (iOS) ==========
/**
 * Sincronizza su iCloud (iOS)
 */ async function syncToiCloud(data) {
    const { syncToiCloud: synciCloud } = await __turbopack_context__.A("[project]/services/icloudSyncService.ts [app-client] (ecmascript, async loader)");
    await synciCloud(data);
}
/**
 * Cerca backup iCloud disponibili
 */ async function detectiCloudBackups() {
    const { detectiCloudBackups: detectiCloud } = await __turbopack_context__.A("[project]/services/icloudSyncService.ts [app-client] (ecmascript, async loader)");
    return await detectiCloud();
}
/**
 * Ripristina da iCloud
 */ async function restoreFromiCloud(backup) {
    const { restoreFromiCloud: restoreiCloud } = await __turbopack_context__.A("[project]/services/icloudSyncService.ts [app-client] (ecmascript, async loader)");
    return await restoreiCloud(backup);
}
// ========== Google Drive Sync (Android) ==========
/**
 * Sincronizza su Google Drive (Android)
 */ async function syncToGoogleDrive(data) {
    const { syncToGoogleDrive: syncDrive } = await __turbopack_context__.A("[project]/services/googleDriveSyncService.ts [app-client] (ecmascript, async loader)");
    await syncDrive(data);
}
/**
 * Cerca backup Google Drive disponibili
 */ async function detectGoogleDriveBackups() {
    const { detectGoogleDriveBackups: detectDrive } = await __turbopack_context__.A("[project]/services/googleDriveSyncService.ts [app-client] (ecmascript, async loader)");
    return await detectDrive();
}
/**
 * Ripristina da Google Drive
 */ async function restoreFromGoogleDrive(backup) {
    const { restoreFromGoogleDrive: restoreDrive } = await __turbopack_context__.A("[project]/services/googleDriveSyncService.ts [app-client] (ecmascript, async loader)");
    return await restoreDrive(backup);
}
// ========== Local Backup (Desktop/Web) ==========
/**
 * Salva backup locale esteso (per desktop/web)
 */ async function saveWebBackup(data) {
    try {
        const backup = {
            timestamp: new Date().toISOString(),
            data,
            version: '2.0',
            source: 'local'
        };
        localStorage.setItem('ortomio_full_backup', JSON.stringify(backup));
        // Mantieni anche ultimi 3 backup completi
        const backupHistory = getBackupHistory();
        backupHistory.push(backup);
        // Mantieni solo ultimi 3
        if (backupHistory.length > 3) {
            backupHistory.shift();
        }
        localStorage.setItem('ortomio_backup_history', JSON.stringify(backupHistory));
    } catch (error) {
        console.error('Error saving web backup:', error);
    }
}
/**
 * Cerca backup locali disponibili
 */ function detectLocalBackups() {
    const backups = [];
    try {
        // Backup completo corrente
        const fullBackup = localStorage.getItem('ortomio_full_backup');
        if (fullBackup) {
            const backup = JSON.parse(fullBackup);
            backups.push({
                source: 'local',
                filename: 'ortomio-full-backup.json',
                timestamp: backup.timestamp,
                size: new Blob([
                    fullBackup
                ]).size,
                gardenId: backup.data?.garden?.id,
                gardenName: backup.data?.garden?.name
            });
        }
        // Backup history
        const backupHistory = getBackupHistory();
        backupHistory.forEach((backup, index)=>{
            backups.push({
                source: 'local',
                filename: `ortomio-backup-${index}.json`,
                timestamp: backup.timestamp,
                size: new Blob([
                    JSON.stringify(backup)
                ]).size,
                gardenId: backup.data?.garden?.id,
                gardenName: backup.data?.garden?.name
            });
        });
    } catch (error) {
        console.error('Error detecting local backups:', error);
    }
    return backups;
}
/**
 * Ripristina da backup locale
 */ async function restoreFromLocal(backup) {
    try {
        if (backup.filename === 'ortomio-full-backup.json') {
            const fullBackup = localStorage.getItem('ortomio_full_backup');
            if (fullBackup) {
                const parsed = JSON.parse(fullBackup);
                return parsed.data;
            }
        } else {
            // Backup dalla history
            const backupHistory = getBackupHistory();
            const index = parseInt(backup.filename.match(/ortomio-backup-(\d+)\.json/)?.[1] || '0');
            if (backupHistory[index]) {
                return backupHistory[index].data;
            }
        }
    } catch (error) {
        console.error('Error restoring from local:', error);
    }
    return null;
}
/**
 * Ottiene backup history
 */ function getBackupHistory() {
    try {
        const stored = localStorage.getItem('ortomio_backup_history');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        return [];
    }
}
/**
 * Estrae timestamp da filename
 */ function extractTimestampFromFilename(filename) {
    // ortomio-backup-{gardenId}-{YYYY-MM-DD}.json
    const match = filename.match(/ortomio-backup-[^-]+-(\d{4}-\d{2}-\d{2})\.json/);
    if (match) {
        return `${match[1]}T00:00:00.000Z`;
    }
    return new Date().toISOString();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/autoRestoreService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Auto Restore Service
 * Ripristino automatico al primo avvio
 * Cerca backup cloud disponibili e ripristina automaticamente
 */ __turbopack_context__.s([
    "attemptAutoRestore",
    ()=>attemptAutoRestore,
    "restoreFromBackup",
    ()=>restoreFromBackup
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$deviceDetectionService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/deviceDetectionService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$cloudSyncService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/cloudSyncService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$autoBackupService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/autoBackupService.ts [app-client] (ecmascript)");
;
;
;
async function attemptAutoRestore(storage) {
    // 1. Verifica se è primo avvio
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$deviceDetectionService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isFirstLaunch"])()) {
        return {
            restored: false,
            reason: 'not_first_launch'
        };
    }
    // 2. Verifica se ci sono dati locali esistenti
    try {
        const existingGardens = await storage.getGardens();
        if (existingGardens.length > 0) {
            // Ci sono già dati locali, non fare restore automatico
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$deviceDetectionService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markLaunchComplete"])();
            return {
                restored: false,
                reason: 'local_data_exists'
            };
        }
    } catch (error) {
        console.error('Error checking existing gardens:', error);
    // Continua comunque con restore
    }
    // 3. Cerca backup cloud disponibili
    let availableBackups = [];
    try {
        availableBackups = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$cloudSyncService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectCloudBackups"])();
    } catch (error) {
        console.error('Error detecting cloud backups:', error);
        return {
            restored: false,
            reason: 'backup_detection_failed',
            error: error
        };
    }
    if (availableBackups.length === 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$deviceDetectionService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markLaunchComplete"])();
        return {
            restored: false,
            reason: 'no_backups_found'
        };
    }
    // 4. Prendi backup più recente
    const latestBackup = availableBackups[0];
    // 5. Ripristina automaticamente (SILENZIOSAMENTE)
    try {
        const exportData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$cloudSyncService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["restoreFromCloud"])(latestBackup);
        if (!exportData) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$deviceDetectionService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markLaunchComplete"])();
            return {
                restored: false,
                reason: 'backup_restore_failed'
            };
        }
        const restoreResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$autoBackupService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["restoreFromExportData"])(exportData, storage);
        if (restoreResult.success) {
            // Marca launch come completato
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$deviceDetectionService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markLaunchComplete"])();
            return {
                restored: true,
                backupUsed: latestBackup,
                gardensRestored: restoreResult.gardensRestored,
                tasksRestored: restoreResult.tasksRestored,
                harvestsRestored: restoreResult.harvestsRestored,
                seedsRestored: restoreResult.seedsRestored
            };
        } else {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$deviceDetectionService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markLaunchComplete"])();
            return {
                restored: false,
                reason: 'restore_failed',
                error: new Error(restoreResult.errors?.join(', ') || 'Unknown restore error')
            };
        }
    } catch (error) {
        console.error('Auto-restore failed:', error);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$deviceDetectionService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markLaunchComplete"])();
        return {
            restored: false,
            reason: 'restore_exception',
            error: error
        };
    }
}
async function restoreFromBackup(backup, storage) {
    try {
        const exportData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$cloudSyncService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["restoreFromCloud"])(backup);
        if (!exportData) {
            return {
                success: false,
                gardensRestored: 0,
                tasksRestored: 0,
                harvestsRestored: 0,
                seedsRestored: 0,
                errors: [
                    'Impossibile leggere backup'
                ]
            };
        }
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$autoBackupService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["restoreFromExportData"])(exportData, storage);
    } catch (error) {
        return {
            success: false,
            gardensRestored: 0,
            tasksRestored: 0,
            harvestsRestored: 0,
            seedsRestored: 0,
            errors: [
                error.message || 'Errore durante ripristino'
            ]
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=services_4e8cfdf5._.js.map