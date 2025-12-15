/**
 * Photo Analysis Service
 * Uses Gemini Vision API to analyze garden photos for sun exposure, aspect direction, and plant health
 */

import { GoogleGenAI } from '@google/genai';

// Support both Next.js and Vite environments
const apiKey = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_GEMINI_API_KEY || (import.meta as any)?.env?.VITE_GEMINI_API_KEY)
  : (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || (import.meta as any)?.env?.VITE_GEMINI_API_KEY);
const genAI = apiKey ? new GoogleGenAI({ apiKey: apiKey }) : null;

export interface SunExposureAnalysis {
  dailySunHours: number;
  sunExposure: 'FullSun' | 'PartSun' | 'Shade';
  confidence: number; // 0-1
  notes: string[];
}

export interface AspectDirectionAnalysis {
  aspectDirection: 'North' | 'South' | 'East' | 'West' | 'Flat';
  confidence: number;
  notes: string[];
}

export interface PlantHealthAnalysis {
  isHealthy: boolean;
  growthRate: 'normal' | 'slow' | 'fast';
  issues: string[];
  phase?: string;
  leafCount?: number;
  confidence: number;
}

export interface PanoramicAnalysis {
  dailySunHours: number;
  sunExposure: 'FullSun' | 'PartSun' | 'Shade';
  aspectDirection: 'North' | 'South' | 'East' | 'West' | 'Flat';
  exposureByDirection: {
    north: number; // Ore sole direzione nord
    south: number;
    east: number;
    west: number;
  };
  obstacles: Array<{
    direction: 'North' | 'South' | 'East' | 'West' | 'Northeast' | 'Northwest' | 'Southeast' | 'Southwest';
    type: 'Building' | 'Tree' | 'Mountain' | 'Other';
    height: 'Low' | 'Medium' | 'High';
    description: string;
  }>;
  confidence: number;
  notes: string[];
}

/**
 * Analizza l'esposizione solare da una foto scattata a mezzogiorno (12:30 PM)
 * 
 * **Scopo**: Determina l'esposizione solare basandosi su un'istantanea del mezzogiorno.
 * 
 * **Limitazioni**:
 * - Analizza solo un momento della giornata (mezzogiorno)
 * - Non considera ostacoli che possono ombreggiare in altri momenti (mattina/sera)
 * - Non fornisce dettaglio per direzione (Nord, Sud, Est, Ovest)
 * 
 * **Quando usarla**:
 * - Per una stima rapida dell'esposizione
 * - Quando non è disponibile una foto panoramica 360°
 * 
 * **Per maggiore precisione**: Usa `analyzePanoramic360()` che analizza l'esposizione
 * da tutte le direzioni e identifica ostacoli che possono ombreggiare l'orto.
 * 
 * @param photoBase64 - Foto scattata a mezzogiorno codificata in base64
 * @returns Promise<SunExposureAnalysis> - Analisi esposizione con ore stimate e tipo
 * @throws Error se Gemini API key non configurata
 */
export const analyzeSunExposure = async (photoBase64: string): Promise<SunExposureAnalysis> => {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  // TypeScript workaround: cast to any per evitare errore tipo (il metodo esiste runtime)
  const model = (genAI as any).generativeModel({ model: 'gemini-pro-vision' });

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
          data: photoBase64.split(',')[1] || photoBase64, // Remove data:image/jpeg;base64, prefix if present
          mimeType: 'image/jpeg',
        },
      },
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
        notes: parsed.notes || [],
      };
    }

    // Fallback parsing
    return {
      dailySunHours: 6,
      sunExposure: 'PartSun',
      confidence: 0.5,
      notes: ['Analisi automatica non disponibile'],
    };
  } catch (error) {
    console.error('Error analyzing sun exposure:', error);
    throw new Error('Failed to analyze sun exposure');
  }
};

/**
 * Analizza la direzione dell'esposizione (orientamento) da una foto dell'orizzonte scattata all'alba o al tramonto
 * 
 * **Scopo**: Determina l'orientamento del terreno rispetto al sole (Nord, Sud, Est, Ovest, o pianura).
 * 
 * **Quando usarla**:
 * - Durante onboarding per determinare automaticamente l'orientamento dell'orto
 * - Per identificare la direzione principale dell'esposizione solare
 * 
 * **Nota**: Per un'analisi più completa che include anche ore di sole per direzione e ostacoli,
 * usa `analyzePanoramic360()` che fornisce informazioni più dettagliate.
 * 
 * @param photoBase64 - Foto dell'orizzonte (alba/tramonto) codificata in base64
 * @returns Promise<AspectDirectionAnalysis> - Analisi direzione esposizione con livello di confidenza
 * @throws Error se Gemini API key non configurata
 */
export const analyzeAspectDirection = async (photoBase64: string): Promise<AspectDirectionAnalysis> => {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  // TypeScript workaround: cast to any per evitare errore tipo (il metodo esiste runtime)
  const model = (genAI as any).generativeModel({ model: 'gemini-pro-vision' });

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
          mimeType: 'image/jpeg',
        },
      },
    ]);

    const response = result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        aspectDirection: parsed.aspectDirection || 'Flat',
        confidence: parsed.confidence || 0.7,
        notes: parsed.notes || [],
      };
    }

    return {
      aspectDirection: 'Flat',
      confidence: 0.5,
      notes: ['Analisi automatica non disponibile'],
    };
  } catch (error) {
    console.error('Error analyzing aspect direction:', error);
    throw new Error('Failed to analyze aspect direction');
  }
};

/**
 * Analyze plant health and growth from a photo
 */
export const analyzePlantHealth = async (
  photoBase64: string,
  plantName: string,
  expectedPhase: string,
  daysFromPlanting: number
): Promise<PlantHealthAnalysis> => {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  // TypeScript workaround: cast to any per evitare errore tipo (il metodo esiste runtime)
  const model = (genAI as any).generativeModel({ model: 'gemini-pro-vision' });

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
          mimeType: 'image/jpeg',
        },
      },
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
        confidence: parsed.confidence || 0.7,
      };
    }

    return {
      isHealthy: true,
      growthRate: 'normal',
      issues: [],
      confidence: 0.5,
    };
  } catch (error) {
    console.error('Error analyzing plant health:', error);
    throw new Error('Failed to analyze plant health');
  }
};

/**
 * Analizza foto panoramica 360° per calcolo completo dell'incidenza della luce solare e del sole sull'orto
 * 
 * **Scopo principale**: Calcola con precisione l'incidenza della luce solare e del sole sull'orto
 * analizzando l'esposizione da TUTTE le direzioni cardinali (Nord, Sud, Est, Ovest).
 * 
 * **Perché è importante**:
 * - Una foto panoramica 360° permette di analizzare l'esposizione solare da tutte le direzioni simultaneamente
 * - Identifica ostacoli (edifici, alberi, montagne) che possono ombreggiare l'orto in momenti specifici della giornata
 * - Calcola con precisione le ore di sole per ogni direzione, non solo un momento (come la foto mezzogiorno)
 * - Permette di determinare l'esposizione ottimale per ogni zona dell'orto
 * 
 * **Cosa calcola**:
 * - Ore di sole diretto giornaliere totali stimate (0-12 ore)
 * - Tipo di esposizione complessiva: FullSun (8+ ore), PartSun (4-7 ore), Shade (<4 ore)
 * - Direzione dell'esposizione principale: North, South, East, West, o Flat
 * - Ore di sole per ogni direzione cardinale (Nord, Sud, Est, Ovest)
 * - Ostacoli presenti con direzione, tipo, altezza e descrizione
 * 
 * **Quando usarla**:
 * - Durante l'onboarding dell'orto per calcolo automatico dell'esposizione solare
 * - Quando si vuole una precisione maggiore rispetto alla foto mezzogiorno
 * - Per identificare zone dell'orto con esposizione diversa
 * 
 * **Input**: Foto panoramica 360° in formato base64 (JPEG)
 * **Output**: PanoramicAnalysis con esposizione dettagliata per direzione, ostacoli identificati, e note
 * 
 * **Nota**: Questa analisi è più completa rispetto a `analyzeSunExposure` (foto mezzogiorno) perché
 * considera l'intero panorama circostante, non solo un momento della giornata.
 * 
 * @param photoBase64 - Foto panoramica 360° codificata in base64 (con o senza prefisso data:image)
 * @returns Promise<PanoramicAnalysis> - Analisi completa con esposizione per direzione e ostacoli
 * @throws Error se Gemini API key non configurata o errore nell'analisi
 */
export const analyzePanoramic360 = async (photoBase64: string): Promise<PanoramicAnalysis> => {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  // TypeScript workaround: cast to any per evitare errore tipo (il metodo esiste runtime)
  const model = (genAI as any).generativeModel({ model: 'gemini-pro-vision' });

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
          mimeType: 'image/jpeg',
        },
      },
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
        notes: parsed.notes || [],
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
      notes: ['Analisi automatica non disponibile'],
    };
  } catch (error) {
    console.error('Error analyzing panoramic photo:', error);
    throw new Error('Failed to analyze panoramic photo');
  }
};

/**
 * Convert File to base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

