import { GoogleGenAI, Type, Schema } from "@google/genai";
import { isApiKeyConfigured } from "./geminiService";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey: apiKey }) : null;

export interface GeoClimateInfo {
  altitude: number; // Metri sul livello del mare
  delayFactorDays: number; // Ritardo giorni semina pomodoro vs costa
  minTempApril: number; // Temperatura minima notturna fine Aprile
  region?: string; // Regione identificata
  notes?: string; // Note aggiuntive
}

// Schema per risposta strutturata
const geoClimateSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    altitude: {
      type: Type.NUMBER,
      description: "Altitudine media della zona in metri sul livello del mare"
    },
    delayFactorDays: {
      type: Type.NUMBER,
      description: "Ritardo in giorni per semina pomodoro rispetto alla costa (es. 0 per costa, 20-30 per 500m, 50-70 per 1500m)"
    },
    minTempApril: {
      type: Type.NUMBER,
      description: "Temperatura minima notturna prevista fine Aprile in gradi Celsius"
    },
    region: {
      type: Type.STRING,
      description: "Regione o zona geografica identificata (es. 'Pianura Padana', 'Appennino Centrale')"
    },
    notes: {
      type: Type.STRING,
      description: "Note aggiuntive sul clima locale"
    }
  },
  required: ["altitude", "delayFactorDays", "minTempApril"]
};

/**
 * Inferisce informazioni geoclimatiche da coordinate usando Gemini API
 */
export const inferGeoClimate = async (
  lat: number,
  lng: number
): Promise<GeoClimateInfo | null> => {
  if (!checkApiAvailable()) {
    console.warn("Gemini API non disponibile per inferenza geoclimatica");
    return null;
  }

  try {
    const prompt = `Coordinate geografiche: Latitudine ${lat.toFixed(4)}, Longitudine ${lng.toFixed(4)} (Italia).

Fornisci informazioni geoclimatiche accurate per questa zona:
1. Altitudine media della zona in metri sul livello del mare
2. Ritardo in giorni per semina pomodoro rispetto alla costa (0 per costa, ~20-30 per 500m, ~50-70 per 1500m)
3. Temperatura minima notturna prevista fine Aprile in gradi Celsius
4. Regione o zona geografica identificata
5. Note aggiuntive sul clima locale (se rilevanti)

Rispondi in formato JSON strutturato.`;

    const model = ai!.generativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: geoClimateSchema
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    if (!text) {
      console.error("Risposta vuota da Gemini API");
      return null;
    }

    const parsed = JSON.parse(text) as GeoClimateInfo;
    
    // Validazione base
    if (typeof parsed.altitude !== 'number' || 
        typeof parsed.delayFactorDays !== 'number' || 
        typeof parsed.minTempApril !== 'number') {
      console.error("Risposta Gemini non valida:", parsed);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Errore nell'inferenza geoclimatica:", error);
    return null;
  }
};

/**
 * Verifica se l'API è disponibile
 */
const checkApiAvailable = (): boolean => {
  if (!isApiKeyConfigured()) {
    return false;
  }
  return ai !== null;
};

/**
 * Calcola ritardo giorni in base all'altitudine
 * Regola: ~4-7 giorni ogni 100m di altitudine
 */
export const calculateAltitudeDelay = (altitudeMeters: number): number => {
  if (altitudeMeters <= 0) return 0;
  
  // Regola empirica: 5 giorni ogni 100m (media tra 4-7)
  const delayDays = Math.round((altitudeMeters / 100) * 5);
  
  return delayDays;
};

/**
 * Corregge date semina/trapianto in base ad altitudine
 */
export const adjustPlantingDates = (
  baseDate: Date,
  altitudeMeters: number,
  plantType: 'early' | 'standard' | 'late' = 'standard'
): Date => {
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

/**
 * Ottiene informazioni geoclimatiche cached o le inferisce
 * Cache per 24h per coordinate
 */
const geoClimateCache = new Map<string, { data: GeoClimateInfo; timestamp: number }>();
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 ore

export const getGeoClimateInfo = async (
  lat: number,
  lng: number,
  useCache: boolean = true
): Promise<GeoClimateInfo | null> => {
  const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}`;
  
  // Check cache
  if (useCache) {
    const cached = geoClimateCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION_MS) {
      return cached.data;
    }
  }
  
  // Inferisci da API
  const info = await inferGeoClimate(lat, lng);
  
  if (info && useCache) {
    geoClimateCache.set(cacheKey, {
      data: info,
      timestamp: Date.now()
    });
  }
  
  return info;
};

