import { GoogleGenerativeAI } from '@google/generative-ai';
import { isApiKeyConfigured } from "./geminiService";
import { findAltitudeByComune, findAltitudeByCoordinates } from "../data/italianComunesAltitude";

// Support both Next.js and Vite environments
// In Next.js, use process.env.NEXT_PUBLIC_* for client-side
// In Vite, use import.meta.env.VITE_* (but this file should work in Next.js)
const getApiKey = () => {
  if (typeof window !== 'undefined') {
    // Client-side: Next.js or Vite
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
           (typeof (globalThis as any).__VITE_ENV__ !== 'undefined' ? (globalThis as any).__VITE_ENV__.VITE_GEMINI_API_KEY : undefined);
  } else {
    // Server-side: Next.js only
    return process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  }
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface GeoClimateInfo {
  altitude: number; // Metri sul livello del mare
  delayFactorDays: number; // Ritardo giorni semina pomodoro vs costa
  minTempApril: number; // Temperatura minima notturna fine Aprile
  region?: string; // Regione identificata
  notes?: string; // Note aggiuntive
  source?: 'gemini' | 'open-elevation' | 'cached'; // Fonte dei dati
}

// Schema per risposta strutturata
const geoClimateSchema = {
  type: "object",
  properties: {
    altitude: {
      type: "number",
      description: "Altitudine media della zona in metri sul livello del mare"
    },
    delayFactorDays: {
      type: "number",
      description: "Ritardo in giorni per semina pomodoro rispetto alla costa (es. 0 per costa, 20-30 per 500m, 50-70 per 1500m)"
    },
    minTempApril: {
      type: "number",
      description: "Temperatura minima notturna prevista fine Aprile in gradi Celsius"
    },
    region: {
      type: "string",
      description: "Regione o zona geografica identificata (es. 'Pianura Padana', 'Appennino Centrale')"
    },
    notes: {
      type: "string",
      description: "Note aggiuntive sul clima locale"
    }
  },
  required: ["altitude", "delayFactorDays", "minTempApril"]
};

// Cache per risultati già calcolati (in memoria, per sessione)
const geoClimateCache = new Map<string, { data: GeoClimateInfo; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 ore

/**
 * Reverse geocoding con Nominatim per ottenere comune da coordinate
 * 
 * @param lat - Latitudine
 * @param lng - Longitudine
 * @returns Promise<{ comune: string; provincia: string } | null>
 */
const reverseGeocodeToComune = async (
  lat: number,
  lng: number
): Promise<{ comune: string; provincia: string } | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `lat=${lat}&lon=${lng}&format=json&accept-language=it`,
      {
        headers: {
          'User-Agent': 'OrtoMio/1.0' // Richiesto da Nominatim
        }
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!data.address) {
      return null;
    }
    
    const comune = data.address.city || data.address.town || data.address.village;
    const provincia = data.address.province || data.address.county;
    
    if (!comune) {
      return null;
    }
    
    return {
      comune,
      provincia: provincia || ''
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
};

/**
 * Ottiene altitudine precisa usando database locale + fallback API
 * 
 * **Priorità**:
 * 1. Database locale dei comuni italiani (altitudine ufficiale del centro abitato)
 * 2. Ricerca per coordinate nel database (se comune non trovato)
 * 3. Open-Elevation API (fallback)
 * 
 * @param lat - Latitudine
 * @param lng - Longitudine
 * @returns Promise<{ altitude: number; source: 'database' | 'open-elevation' }>
 */
const getAccurateAltitude = async (
  lat: number,
  lng: number
): Promise<{ altitude: number; source: 'database' | 'open-elevation' }> => {
  // 1. Prova reverse geocoding per ottenere comune
  const geocodeResult = await reverseGeocodeToComune(lat, lng);
  
  if (geocodeResult) {
    // 2. Cerca nel database locale per comune
    const dbAltitude = findAltitudeByComune(
      geocodeResult.comune,
      geocodeResult.provincia
    );
    
    if (dbAltitude !== null) {
      return { altitude: dbAltitude, source: 'database' };
    }
  }
  
  // 3. Prova ricerca per coordinate nel database (entro 5km)
  const coordAltitude = findAltitudeByCoordinates(lat, lng, 5);
  if (coordAltitude !== null) {
    return { altitude: coordAltitude, source: 'database' };
  }
  
  // 4. Fallback a Open-Elevation API
  const elevation = await getAltitudeFromOpenElevation(lat, lng);
  if (elevation !== null) {
    return { altitude: elevation, source: 'open-elevation' };
  }
  
  // Fallback finale: valore default
  return { altitude: 200, source: 'open-elevation' };
};

/**
 * Ottiene altitudine precisa da Open-Elevation API (fallback gratuito)
 * 
 * **Scopo**: Funzione helper per ottenere altitudine quando Gemini AI non è disponibile.
 * 
 * **API utilizzata**: Open-Elevation (https://api.open-elevation.com) - servizio gratuito
 * che fornisce dati altimetrici basati su modelli digitali del terreno.
 * 
 * **Quando viene usata**:
 * - Quando Gemini API non è configurata
 * - Quando la chiamata a Gemini fallisce
 * - Come fallback per ottenere almeno l'altitudine precisa
 * 
 * **Limitazioni**:
 * - Fornisce solo altitudine, non altre informazioni geoclimatiche
 * - Richiede connessione internet
 * 
 * @param lat - Latitudine
 * @param lng - Longitudine
 * @returns Promise<number | null> - Altitudine in metri o null se errore
 */
const getAltitudeFromOpenElevation = async (lat: number, lng: number): Promise<number | null> => {
  try {
    const response = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].elevation;
    }
  } catch (error) {
    console.error('Error fetching altitude from Open-Elevation:', error);
  }
  return null;
};

/**
 * Inferisce informazioni geoclimatiche (altitudine, ritardo semina, temperatura) da coordinate geografiche
 * 
 * **Scopo**: Calcola automaticamente informazioni geoclimatiche importanti per la pianificazione dell'orto
 * basandosi sulla posizione geografica (latitudine, longitudine).
 * 
 * **Informazioni calcolate**:
 * - **Altitudine**: Metri sul livello del mare (range 0-5000m per Italia)
 * - **Ritardo semina**: Giorni di ritardo per semina pomodoro rispetto alla costa
 *   - 0 giorni per costa
 *   - 20-30 giorni per 500m di altitudine
 *   - 50-70 giorni per 1500m di altitudine
 * - **Temperatura minima Aprile**: Temperatura minima notturna prevista fine Aprile
 * - **Regione**: Zona geografica identificata (es. 'Pianura Padana', 'Appennino Centrale')
 * 
 * **Metodo**:
 * 1. **Prima scelta**: Usa Gemini AI per inferenza intelligente basata su conoscenza geografica
 * 2. **Fallback**: Se Gemini non disponibile, usa Open-Elevation API (gratuita) per altitudine
 * 3. **Cache**: Risultati cachati per 24 ore per coordinate (evita chiamate API ripetute)
 * 
 * **Validazione**:
 * - Range altitudine: 0-5000m per Italia (corregge automaticamente valori fuori range)
 * - Coordinate: Verifica che siano in Italia (lat 35-47, lng 6-19)
 * 
 * **Fallback Open-Elevation**:
 * - Se Gemini non disponibile o fallisce, usa API Open-Elevation per ottenere altitudine precisa
 * - Calcola ritardo semina basandosi sull'altitudine ottenuta
 * - Usa valori default per temperatura e regione
 * 
 * **Cache**:
 * - Risultati salvati in memoria per 24 ore
 * - Chiave cache: `lat_lng` (formato: `41.9028_12.4964`)
 * - Evita chiamate API ripetute per stessa posizione
 * 
 * @param lat - Latitudine (deve essere in Italia: 35-47)
 * @param lng - Longitudine (deve essere in Italia: 6-19)
 * @param useCache - Se true, usa cache se disponibile (default: true)
 * @returns Promise<GeoClimateInfo | null> - Informazioni geoclimatiche o null se errore
 */
export const inferGeoClimate = async (
  lat: number,
  lng: number,
  useCache: boolean = true
): Promise<GeoClimateInfo | null> => {
  // Validazione coordinate (Italia)
  if (lat < 35 || lat > 47 || lng < 6 || lng > 19) {
    console.warn("Coordinate fuori dall'Italia, usando valori default");
    return {
      altitude: 200,
      delayFactorDays: 10,
      minTempApril: 8,
      region: 'Italia',
      source: 'cached'
    };
  }

  // Validazione range altitudine (0-5000m per Italia)
  const validateAltitude = (alt: number): number => {
    if (alt < 0) return 0;
    if (alt > 5000) return 5000;
    return alt;
  };

  // Controlla cache
  const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
  if (useCache) {
    const cached = geoClimateCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return { ...cached.data, source: 'cached' };
    }
  }

  // Ottieni altitudine precisa PRIMA di chiamare Gemini
  const { altitude: accurateAltitude, source: altitudeSource } = await getAccurateAltitude(lat, lng);

  // Prova prima con Gemini API
  try {
  if (checkApiAvailable()) {
      const prompt = `Coordinate geografiche: Latitudine ${lat.toFixed(4)}, Longitudine ${lng.toFixed(4)} (Italia).

Fornisci informazioni geoclimatiche accurate per questa zona:
1. Altitudine PRECISA del centro abitato più vicino in metri sul livello del mare.
   IMPORTANTE: Se conosci l'altitudine ufficiale del comune/paese più vicino, usa quella (es. Pisticci = 106m, non la media della zona collinare).
   Se non conosci l'altitudine precisa, usa ${accurateAltitude}m come riferimento (fonte: ${altitudeSource}).
   Range valido: 0-5000m per Italia.
2. Ritardo in giorni per semina pomodoro rispetto alla costa (0 per costa, ~20-30 per 500m, ~50-70 per 1500m)
3. Temperatura minima notturna prevista fine Aprile in gradi Celsius
4. Regione o zona geografica identificata (es. 'Pianura Padana', 'Appennino Centrale', 'Alpi', 'Sicilia')
5. Note aggiuntive sul clima locale (se rilevanti)

IMPORTANTE: L'altitudine deve essere quella del centro abitato più vicino, non la media della zona collinare circostante.`;

    if (!ai) {
      throw new Error('AI client not available');
    }
    
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: geoClimateSchema
      }
    });

    const text = result.text;
    
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
      // Fallback a altitudine accurata già ottenuta
      const validatedAlt = validateAltitude(accurateAltitude);
      const { calculateAltitudeDelay } = await import('../utils/altitudeUtils');
      const delayDays = calculateAltitudeDelay(validatedAlt);
      const result: GeoClimateInfo = {
        altitude: validatedAlt,
        delayFactorDays: delayDays,
        minTempApril: 8, // Default
        region: 'Italia',
        source: altitudeSource === 'database' ? 'open-elevation' : 'open-elevation' // Mantieni compatibilità
      };
      // Salva in cache
      if (useCache) {
        geoClimateCache.set(cacheKey, { data: result, timestamp: Date.now() });
      }
      return result;
    }

    // Valida e corregge altitudine
    parsed.altitude = validateAltitude(parsed.altitude);
    
    // Se l'altitudine dal database è più accurata (differenza > 50m), usa quella
    // Questo corregge casi in cui Gemini fornisce la media della zona invece dell'altitudine del centro abitato
    if (altitudeSource === 'database' && Math.abs(parsed.altitude - accurateAltitude) > 50) {
      console.log(`Correzione altitudine: Gemini=${parsed.altitude}m, Database=${accurateAltitude}m. Usando valore database.`);
      parsed.altitude = accurateAltitude;
    }
    
    parsed.source = 'gemini';
    
    // Salva in cache
    if (useCache) {
      geoClimateCache.set(cacheKey, { data: parsed, timestamp: Date.now() });
    }
    
    return parsed;
    }
  } catch (error) {
    console.error("Errore nell'inferenza geoclimatica con Gemini:", error);
  }
  
  // Fallback: usa altitudine accurata già ottenuta
    try {
      const validatedAlt = validateAltitude(accurateAltitude);
      const { calculateAltitudeDelay } = await import('../utils/altitudeUtils');
      const delayDays = calculateAltitudeDelay(validatedAlt);
      const result: GeoClimateInfo = {
        altitude: validatedAlt,
        delayFactorDays: delayDays,
        minTempApril: 8, // Default
        region: 'Italia',
        source: altitudeSource === 'database' ? 'open-elevation' : 'open-elevation' // Mantieni compatibilità
      };
      // Salva in cache
      if (useCache) {
        geoClimateCache.set(cacheKey, { data: result, timestamp: Date.now() });
      }
      return result;
    } catch (elevError) {
      console.error("Errore nel fallback:", elevError);
    }
  
  // Fallback finale
    return null;
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

// Funzioni calculateAltitudeDelay e adjustPlantingDates sono state spostate in utils/altitudeUtils.ts
// per permettere l'uso sia lato client che server senza conflitti di moduli

/**
 * Ottiene informazioni geoclimatiche cached o le inferisce
 * Cache per 24h per coordinate
 */
export const getGeoClimateInfo = async (
  lat: number,
  lng: number,
  useCache: boolean = true
): Promise<GeoClimateInfo | null> => {
  return await inferGeoClimate(lat, lng, useCache);
};

// Export default per compatibilità con import dinamici
export default {
  getGeoClimateInfo,
  inferGeoClimate
};

