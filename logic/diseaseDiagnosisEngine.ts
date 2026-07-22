/**
 * Disease Diagnosis Engine
 * Analisi AI per diagnosi malattie tramite foto e matching contestuale
 */

import { diseaseDatabase, Disease, getDiseasesForPlant, getDiseasesForSeason } from '../data/diseaseDatabase';
import { PlantMasterSheet, Garden } from '../types';
import { Season, getSeasonForDate } from '../utils/seasonalAdjustment';
import { WeatherForecast } from '../services/weatherService';

/**
 * Converte WMO Weather Code in condition string
 */
const getConditionFromCode = (code: number): string => {
  if (code === 0) return 'sunny';
  if (code >= 1 && code <= 3) return 'cloudy';
  if (code >= 45 && code <= 48) return 'cloudy';
  if (code >= 51 && code <= 67) return 'rainy';
  if (code >= 71 && code <= 77) return 'snowy';
  if (code >= 80 && code <= 99) return code >= 95 ? 'stormy' : 'rainy';
  return 'cloudy';
};

// La diagnosi foto passa dalla route server-side /api/ai/generate (tier + crediti),
// che tiene GEMINI_API_KEY solo lato server. Nessuna chiave esposta al client.
const generateDiagnosisContent = async (contents: any): Promise<string> => {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      feature: 'diagnose',
      model: 'gemini-2.5-flash',
      contents,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || 'Richiesta diagnosi non riuscita');
  }

  const data = await response.json();
  return data.text || '';
};

export interface DiseaseDiagnosis {
  disease: Disease;
  confidence: number; // 0-1
  matchedSymptoms: string[];
  reasoning: string;
}

export interface DiagnosisResult {
  diagnoses: DiseaseDiagnosis[];
  recommendedTreatment: Disease | null;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  contextMatch: {
    season: boolean;
    weather: boolean;
    plant: boolean;
  };
}

export interface TreatmentPlan {
  disease: Disease;
  steps: string[];
  timeline: {
    immediate: string[]; // Azioni immediate (oggi)
    shortTerm: string[]; // Azioni 1-3 giorni
    longTerm: string[]; // Azioni 1-2 settimane
  };
  followUp: {
    checkDate: string; // Data controllo
    expectedImprovement: string;
    warningSigns: string[];
  };
}

/**
 * Analizza foto sintomi con Gemini Vision
 */
export const diagnoseFromPhoto = async (
  base64Image: string,
  plantName: string,
  context?: {
    season?: Season;
    weather?: WeatherForecast[];
    garden?: Garden;
  }
): Promise<DiagnosisResult> => {
  // Ottieni malattie possibili per questa pianta
  const possibleDiseases = getDiseasesForPlant(plantName);
  
  if (possibleDiseases.length === 0) {
    return {
      diagnoses: [],
      recommendedTreatment: null,
      urgency: 'Low',
      contextMatch: { season: false, weather: false, plant: false }
    };
  }

  // Costruisci prompt con informazioni su malattie possibili
  const diseasesInfo = possibleDiseases.map(d => 
    `${d.nameIT} (${d.category}): ${d.symptoms.visual.join('; ')}. Keywords: ${d.symptoms.keywords.join(', ')}`
  ).join('\n');

  const seasonInfo = context?.season || getSeasonForDate(new Date(), context?.garden?.coordinates?.latitude || 0);
  const currentWeather = context?.weather?.[0];
  const currentTemp =
    currentWeather?.temp ??
    currentWeather?.tempMax ??
    currentWeather?.tempMin;
  const weatherInfo = context?.weather && context.weather.length > 0
    ? `Condizioni meteo: ${getConditionFromCode(currentWeather?.code ?? 0)}, temperatura ${currentTemp ?? 'N/A'}°C, umidità ${currentWeather?.humidity || 'N/A'}%`
    : '';

  const prompt = `Analizza questa foto di una pianta di ${plantName} che mostra sintomi di malattia.

MALATTIE POSSIBILI PER QUESTA PIANTA:
${diseasesInfo}

CONTESTO:
- Stagione: ${seasonInfo}
${weatherInfo}

ANALIZZA:
1. Quali sintomi visibili nella foto? (macchie, ingiallimenti, deformazioni, muffe, insetti, etc.)
2. Quale/i malattia/e tra quelle elencate corrisponde meglio ai sintomi?
3. Per ogni malattia corrispondente, indica:
   - Percentuale di confidenza (0-100%)
   - Sintomi specifici che corrispondono
   - Ragionamento

Rispondi in formato JSON:
{
  "symptoms_detected": ["sintomo1", "sintomo2"],
  "diagnoses": [
    {
      "disease_name": "nome malattia",
      "confidence": 85,
      "matched_symptoms": ["sintomo1", "sintomo2"],
      "reasoning": "perché questa malattia"
    }
  ]
}`;

  try {
    const imageData = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    const responseText = await generateDiagnosisContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg'
        }
      }
    ]);

    // Estrai JSON dalla risposta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const aiResult = JSON.parse(jsonMatch[0]);
    
    // Converti risultato AI in DiseaseDiagnosis
    const diagnoses: DiseaseDiagnosis[] = [];
    
    for (const aiDiagnosis of aiResult.diagnoses || []) {
      const disease = possibleDiseases.find(d => 
        d.nameIT.toLowerCase().includes(aiDiagnosis.disease_name.toLowerCase()) ||
        d.name.toLowerCase().includes(aiDiagnosis.disease_name.toLowerCase())
      );
      
      if (disease) {
        diagnoses.push({
          disease,
          confidence: Math.min(100, Math.max(0, aiDiagnosis.confidence || 0)) / 100,
          matchedSymptoms: aiDiagnosis.matched_symptoms || [],
          reasoning: aiDiagnosis.reasoning || ''
        });
      }
    }

    // Ordina per confidenza
    diagnoses.sort((a, b) => b.confidence - a.confidence);

    // Determina urgenza
    const highestConfidence = diagnoses[0]?.confidence || 0;
    const highestUrgency = diagnoses[0]?.disease.treatment.urgency || 'Low';
    
    let urgency: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    if (highestConfidence > 0.7) {
      urgency = highestUrgency;
    } else if (highestConfidence > 0.5) {
      urgency = highestUrgency === 'Critical' ? 'High' : highestUrgency;
    }

    // Verifica match contestuale
    const recommendedDisease = diagnoses[0]?.disease;
    const contextMatch = {
      season: recommendedDisease ? recommendedDisease.season.includes(seasonInfo) : false,
      weather: false, // TODO: implementare matching meteo
      plant: true
    };

    return {
      diagnoses,
      recommendedTreatment: recommendedDisease || null,
      urgency,
      contextMatch
    };
  } catch (error) {
    console.error('Error diagnosing from photo:', error);
    
    // Fallback: matching basato su sintomi testuali se disponibili
    return {
      diagnoses: [],
      recommendedTreatment: null,
      urgency: 'Low',
      contextMatch: { season: false, weather: false, plant: false }
    };
  }
};

/**
 * Matching sintomi testuali con database malattie
 */
export const matchSymptoms = (
  symptomsText: string,
  plantName: string,
  season?: Season,
  weather?: WeatherForecast[]
): DiagnosisResult => {
  const possibleDiseases = getDiseasesForPlant(plantName);
  const currentSeason = season || getSeasonForDate(new Date(), 0);
  
  const symptomsLower = symptomsText.toLowerCase();
  const diagnoses: DiseaseDiagnosis[] = [];

  for (const disease of possibleDiseases) {
    let confidence = 0;
    const matchedSymptoms: string[] = [];

    // Match keywords
    for (const keyword of disease.symptoms.keywords) {
      if (symptomsLower.includes(keyword.toLowerCase())) {
        confidence += 0.2;
        matchedSymptoms.push(keyword);
      }
    }

    // Match sintomi visivi
    for (const symptom of disease.symptoms.visual) {
      const symptomWords = symptom.toLowerCase().split(' ');
      let matches = 0;
      for (const word of symptomWords) {
        if (word.length > 3 && symptomsLower.includes(word)) {
          matches++;
        }
      }
      if (matches >= symptomWords.length * 0.5) {
        confidence += 0.15;
        matchedSymptoms.push(symptom);
      }
    }

    // Bonus per match stagionale
    if (disease.season.includes(currentSeason)) {
      confidence += 0.1;
    }

    // Bonus per match condizioni meteo
    if (weather && weather.length > 0) {
      const currentWeather = weather[0];
      if (disease.conditions.weather) {
        const weatherCondition = getConditionFromCode(currentWeather.code ?? 0);
        for (const condition of disease.conditions.weather) {
          if (weatherCondition.toLowerCase().includes(condition.toLowerCase())) {
            confidence += 0.1;
            break;
          }
        }
      }
      
      // Match temperatura
      if (disease.conditions.temperature) {
        const temp =
          currentWeather.temp ??
          currentWeather.tempMax ??
          currentWeather.tempMin;
        if (
          typeof temp === 'number' &&
          temp >= disease.conditions.temperature.min &&
          temp <= disease.conditions.temperature.max
        ) {
          confidence += 0.1;
        }
      }
      
      // Match umidità
      if (disease.conditions.humidity && currentWeather.humidity) {
        if (currentWeather.humidity >= disease.conditions.humidity.min && 
            currentWeather.humidity <= disease.conditions.humidity.max) {
          confidence += 0.1;
        }
      }
    }

    if (confidence > 0.2) {
      diagnoses.push({
        disease,
        confidence: Math.min(1, confidence),
        matchedSymptoms: [...new Set(matchedSymptoms)],
        reasoning: `Match basato su: ${matchedSymptoms.slice(0, 3).join(', ')}`
      });
    }
  }

  // Ordina per confidenza
  diagnoses.sort((a, b) => b.confidence - a.confidence);

  // Determina urgenza
  const highestUrgency = diagnoses[0]?.disease.treatment.urgency || 'Low';
  const highestConfidence = diagnoses[0]?.confidence || 0;
  
  let urgency: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  if (highestConfidence > 0.5) {
    urgency = highestUrgency;
  }

  const recommendedDisease = diagnoses[0]?.disease;
  const contextMatch = {
    season: recommendedDisease ? recommendedDisease.season.includes(currentSeason) : false,
    weather: false, // TODO: implementare
    plant: true
  };

  return {
    diagnoses,
    recommendedTreatment: recommendedDisease || null,
    urgency,
    contextMatch
  };
};

/**
 * Genera piano trattamento step-by-step
 */
export const getTreatmentPlan = (
  diseaseId: string,
  plantName: string,
  severity: 'Mild' | 'Moderate' | 'Severe' = 'Moderate'
): TreatmentPlan | null => {
  const disease = diseaseDatabase.find(d => d.id === diseaseId);
  if (!disease) return null;

  const now = new Date();
  const checkDate = new Date(now);
  checkDate.setDate(checkDate.getDate() + 7); // Controllo dopo 7 giorni

  // Adatta steps in base a severity
  let steps = [...disease.treatment.steps];
  if (severity === 'Severe') {
    steps.unshift('⚠️ URGENTE: Intervenire immediatamente per evitare perdita pianta');
  }

  // Timeline
  const immediate: string[] = [];
  const shortTerm: string[] = [];
  const longTerm: string[] = [];

  for (let i = 0; i < steps.length; i++) {
    if (i === 0) {
      immediate.push(steps[i]);
    } else if (i <= 2) {
      shortTerm.push(steps[i]);
    } else {
      longTerm.push(steps[i]);
    }
  }

  // Warning signs basati su malattia
  const warningSigns: string[] = [];
  if (disease.category === 'Fungal') {
    warningSigns.push('Sintomi peggiorano dopo 3 giorni');
    warningSigns.push('Nuove foglie colpite');
  } else if (disease.category === 'Bacterial' || disease.category === 'Viral') {
    warningSigns.push('Pianta continua ad appassire');
    warningSigns.push('Sintomi si diffondono ad altre piante');
  } else if (disease.category === 'Pest') {
    warningSigns.push('Numero insetti aumenta');
    warningSigns.push('Danni visibili aumentano');
  }

  return {
    disease,
    steps,
    timeline: {
      immediate,
      shortTerm,
      longTerm
    },
    followUp: {
      checkDate: checkDate.toISOString().split('T')[0],
      expectedImprovement: severity === 'Severe' 
        ? 'Arresto progressione sintomi entro 3-5 giorni'
        : 'Miglioramento visibile entro 7 giorni',
      warningSigns
    }
  };
};

/**
 * Ottieni misure preventive per una pianta
 */
export const getPreventiveMeasures = (
  plantName: string,
  season: Season,
  garden: Garden
): string[] => {
  const possibleDiseases = getDiseasesForPlant(plantName);
  const seasonalDiseases = possibleDiseases.filter(d => d.season.includes(season));
  
  const measures = new Set<string>();
  
  for (const disease of seasonalDiseases) {
    for (const preventive of disease.treatment.preventive) {
      measures.add(preventive);
    }
  }

  // Aggiungi misure specifiche per tipo terreno
  if (garden.soilType === 'Clay') {
    measures.add('Migliorare drenaggio per evitare ristagni');
  } else if (garden.soilType === 'Sandy') {
    measures.add('Aumentare frequenza irrigazione per evitare stress idrico');
  }

  // Aggiungi misure per vento
  if (garden.windProtection === 'Low') {
    measures.add('Migliorare circolazione aria per prevenire funghi');
  }

  return Array.from(measures);
};
