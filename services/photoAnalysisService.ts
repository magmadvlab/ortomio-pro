/**
 * Photo Analysis Service
 * Uses Gemini Vision API to analyze garden photos for sun exposure, aspect direction, and plant health
 */

import { GoogleGenerativeAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

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

/**
 * Analyze sun exposure from a noon photo (12:30 PM)
 */
export const analyzeSunExposure = async (photoBase64: string): Promise<SunExposureAnalysis> => {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

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
 * Analyze aspect direction from horizon photo (sunrise/sunset)
 */
export const analyzeAspectDirection = async (photoBase64: string): Promise<AspectDirectionAnalysis> => {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

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

  const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

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

