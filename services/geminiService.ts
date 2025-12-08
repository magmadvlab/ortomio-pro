import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PlantSuggestion, TreatmentAdvice, SpecificPlantInfo } from "../types";

// Per Vite: usa import.meta.env.VITE_* 
// Crea un file .env nella root del progetto con: VITE_GEMINI_API_KEY=la_tua_chiave
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Validazione API Key
export const isApiKeyConfigured = (): boolean => {
  return !!apiKey && apiKey.trim().length > 0;
};

if (!isApiKeyConfigured()) {
  console.warn("⚠️ VITE_GEMINI_API_KEY non configurata! Le funzionalità AI non saranno disponibili.");
  console.warn("Crea un file .env nella root del progetto con: VITE_GEMINI_API_KEY=la_tua_chiave");
}

const ai = apiKey ? new GoogleGenAI({ apiKey: apiKey }) : null;

// Helper per verificare se l'API è disponibile
const checkApiAvailable = (): boolean => {
  if (!isApiKeyConfigured()) {
    return false;
  }
  return ai !== null;
};

// Schema for Plant Suggestions
const plantSuggestionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Common name in Italian" },
      scientificName: { type: Type.STRING },
      description: { type: Type.STRING, description: "Brief description of why it is good for now" },
      plantingWindow: { type: Type.STRING, description: "When to plant (e.g., 'Marzo - Aprile')" },
      harvestTime: { type: Type.STRING, description: "Days to maturity or month of harvest" },
      difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
      waterNeeds: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
    },
    required: ["name", "description", "plantingWindow", "difficulty"],
  },
};

// Schema for Treatment Advice (Updated for Severity and Structure)
const treatmentAdviceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    problem: { type: Type.STRING, description: "Diagnosis name (e.g. 'Oidio', 'Carenza di Calcio')" },
    description: { type: Type.STRING, description: "Detailed explanation of the visual symptoms and cause." },
    symptoms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of specific visual symptoms observed (e.g. 'Macchie nere', 'Foglie arricciate')." },
    cause: { type: Type.STRING, description: "The underlying cause (e.g. 'Eccesso di umidità', 'Fungo', 'Mancanza di Azoto')." },
    severity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"], description: "Estimated severity based on visual damage." },
    immediateAction: { type: Type.STRING, description: "The most urgent action to take today." },
    longTermCare: { type: Type.STRING, description: "Prevention and long term maintenance advice." },
    steps: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Step by step execution plan" 
    },
    organic: { type: Type.BOOLEAN, description: "Is this an organic solution?" },
    products: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of specific products to buy/use (e.g., 'Olio di Neem', 'Rame')" 
    }
  },
  required: ["problem", "description", "symptoms", "cause", "severity", "immediateAction", "longTermCare", "steps", "organic"]
};

// Schema for Specific Plant Details
const specificPlantSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    variety: { type: Type.STRING },
    seedSowingWindow: { type: Type.STRING, description: "Best time to sow seeds (e.g. 'Febbraio in semenzaio')" },
    transplantWindow: { type: Type.STRING, description: "Best time to transplant/plant seedlings outdoors" },
    harvestWindow: { type: Type.STRING },
    successionIntervalDays: { type: Type.NUMBER, description: "Days between plantings for continuous harvest (e.g. 14 for lettuce). 0 if not applicable." },
    notes: { type: Type.STRING, description: "Specific tips for this variety" },
    soil: {
      type: Type.OBJECT,
      properties: {
        phMin: { type: Type.NUMBER, description: "Minimum ideal pH" },
        phMax: { type: Type.NUMBER, description: "Maximum ideal pH" },
        typeDescription: { type: Type.STRING, description: "Description of ideal soil (e.g. 'Drenante, ricco di potassio')" }
      },
      required: ["phMin", "phMax", "typeDescription"]
    },
    harvest: {
      type: Type.OBJECT,
      properties: {
        minBrix: { type: Type.NUMBER, description: "Minimum Brix degree for optimal sweetness/maturity. Return 0 if not applicable/unknown." },
        visualSigns: { type: Type.STRING, description: "Visual cues for harvest (e.g. 'Picciolo secco', 'Colore rosso intenso')" }
      },
      required: ["visualSigns"]
    },
    indoor: {
      type: Type.OBJECT,
      description: "Details for starting seeds indoors",
      properties: {
        lightHours: { type: Type.NUMBER, description: "Recommended hours of light per day" },
        germinationTemp: { type: Type.STRING, description: "Ideal temp range for germination" },
        daysToGerminate: { type: Type.STRING, description: "Expected days to sprout" },
        transplantSize: { type: Type.STRING, description: "Visual cue for when it is ready to transplant (e.g. '4 true leaves')" }
      },
      required: ["lightHours", "germinationTemp", "daysToGerminate", "transplantSize"]
    },
    irrigation: {
      type: Type.OBJECT,
      properties: {
        frequency: { type: Type.STRING, description: "Frequency (e.g. '2 volte a settimana')" },
        method: { type: Type.STRING, description: "Method (e.g. 'A goccia', 'Scorrimento')" },
        tips: { type: Type.STRING }
      },
      required: ["frequency", "method"]
    },
    fertilizer: {
      type: Type.OBJECT,
      properties: {
        organicType: { type: Type.STRING, description: "Suggested organic fertilizer name" },
        organicDosageGm2: { type: Type.NUMBER, description: "Dosage in grams per square meter" },
        classicType: { type: Type.STRING, description: "Suggested classic/mineral fertilizer name" },
        classicDosageGm2: { type: Type.NUMBER, description: "Dosage in grams per square meter" },
        timing: { type: Type.STRING, description: "When to apply (e.g. 'Alla semina', 'In fioritura')" },
        scheduleDays: { 
          type: Type.ARRAY, 
          items: { type: Type.NUMBER }, 
          description: "Array of days AFTER planting to apply fertilizer again. E.g. [20, 40] means fertilize 20 and 40 days after planting. Empty if none."
        }
      },
      required: ["organicType", "organicDosageGm2", "classicType", "classicDosageGm2", "timing"]
    }
  },
  required: ["name", "seedSowingWindow", "transplantWindow", "harvestWindow", "irrigation", "fertilizer", "indoor", "soil", "harvest"]
};

export const getSeasonalSuggestions = async (lat: number, lng: number): Promise<PlantSuggestion[]> => {
  if (!checkApiAvailable()) {
    throw new Error("API Key non configurata. Configura VITE_GEMINI_API_KEY nel file .env");
  }

  const model = "gemini-2.5-flash";
  const today = new Date().toLocaleDateString('it-IT');
  
  const prompt = `
    I am managing a vegetable garden.
    My location coordinates are: Latitude ${lat}, Longitude ${lng}.
    Today's date is ${today}.
    
    Based on the current season and my geolocation (infer the climate zone), suggest 5 vegetables or herbs that are ideal to plant RIGHT NOW.
    Provide the response in Italian.
  `;

  try {
    const response = await ai!.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: plantSuggestionSchema,
        systemInstruction: "You are an expert agronomist specialized in Italian vegetable gardens (orto). be concise.",
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as PlantSuggestion[];
  } catch (error: any) {
    console.error("Gemini Suggestion Error:", error);
    const errorMessage = error?.message || "Errore sconosciuto";
    if (errorMessage.includes("API_KEY") || errorMessage.includes("401") || errorMessage.includes("403")) {
      throw new Error("Chiave API non valida o scaduta. Verifica la configurazione in .env");
    }
    throw new Error(`Errore nel recupero dei suggerimenti: ${errorMessage}`);
  }
};

export const getSpecificPlantDetails = async (query: string, lat: number, lng: number): Promise<SpecificPlantInfo | null> => {
  if (!checkApiAvailable()) {
    throw new Error("API Key non configurata. Configura VITE_GEMINI_API_KEY nel file .env");
  }

  const model = "gemini-2.5-flash";
  const prompt = `
    User wants to plant: "${query}".
    Location coords: ${lat}, ${lng}.
    Provide detailed planting info.
    Include Soil pH range (soil.phMin, soil.phMax).
    Include Harvest maturity details (harvest.minBrix, harvest.visualSigns).
    Include Indoor planting details.
    Include Succession planting interval.
    Include Fertilizer schedule.
    Response in Italian.
  `;

  try {
    const response = await ai!.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: specificPlantSchema,
        systemInstruction: "You are an expert agronomist. Provide precise numeric data.",
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as SpecificPlantInfo;
  } catch (error: any) {
    console.error("Gemini Specific Plant Error:", error);
    const errorMessage = error?.message || "Errore sconosciuto";
    if (errorMessage.includes("API_KEY") || errorMessage.includes("401") || errorMessage.includes("403")) {
      throw new Error("Chiave API non valida o scaduta. Verifica la configurazione in .env");
    }
    throw new Error(`Errore nella ricerca: ${errorMessage}`);
  }
};

export const getTreatmentAdvice = async (query: string): Promise<TreatmentAdvice | null> => {
  if (!checkApiAvailable()) {
    throw new Error("API Key non configurata. Configura VITE_GEMINI_API_KEY nel file .env");
  }

  const model = "gemini-2.5-flash";
  
  const prompt = `
    The user has a problem in their garden: "${query}".
    Provide a diagnosis and a detailed treatment plan.
    Assess the severity implied by the text.
    Identify symptoms and underlying cause.
    Prioritize organic/preventive solutions.
    Provide the response in Italian.
  `;

  try {
    const response = await ai!.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: treatmentAdviceSchema,
        systemInstruction: "You are an expert plant pathologist. Focus on preventive and organic solutions first.",
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as TreatmentAdvice;
  } catch (error: any) {
    console.error("Gemini Treatment Error:", error);
    const errorMessage = error?.message || "Errore sconosciuto";
    if (errorMessage.includes("API_KEY") || errorMessage.includes("401") || errorMessage.includes("403")) {
      throw new Error("Chiave API non valida o scaduta. Verifica la configurazione in .env");
    }
    throw new Error(`Errore nella diagnosi: ${errorMessage}`);
  }
};

export const analyzePlantImage = async (base64Image: string): Promise<string> => {
  if (!checkApiAvailable()) {
    return "API Key non configurata. Configura VITE_GEMINI_API_KEY nel file .env per utilizzare questa funzionalità.";
  }

  const model = "gemini-2.5-flash";
  
  try {
    const response = await ai!.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: "Analizza questa foto di una pianta (o piantina) del mio orto. Identifica la pianta. Valuta lo stadio di crescita. Se è una piantina in vaso, dimmi se è pronta per il trapianto o se ha bisogno di più luce (se fila). Se è adulta, controlla maturazione o malattie. Rispondi in Italiano in modo conciso ma utile."
          }
        ]
      }
    });

    return response.text || "Impossibile analizzare l'immagine.";
  } catch (error: any) {
    console.error("Gemini Vision Error:", error);
    const errorMessage = error?.message || "Errore sconosciuto";
    if (errorMessage.includes("API_KEY") || errorMessage.includes("401") || errorMessage.includes("403")) {
      return "Chiave API non valida. Verifica la configurazione in .env";
    }
    return `Errore durante l'analisi dell'immagine: ${errorMessage}`;
  }
};

export const diagnosePlantHealth = async (base64Image: string): Promise<TreatmentAdvice | null> => {
  if (!checkApiAvailable()) {
    throw new Error("API Key non configurata. Configura VITE_GEMINI_API_KEY nel file .env");
  }

  const model = "gemini-2.5-flash";

  try {
    const response = await ai!.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: `
            Act as an expert plant pathologist. Analyze this image of a plant.
            1. Identify the disease, pest, or nutrient deficiency. If healthy, state "Pianta Sana".
            2. Estimate the SEVERITY (Low, Medium, High, Critical) based on visual damage.
            3. List the observed SYMPTOMS (e.g. yellowing, spots, holes).
            4. Identify the probable CAUSE (e.g. fungi, insect, abiotic).
            5. Provide a detailed DESCRIPTION of the condition.
            6. Provide an IMMEDIATE ACTION plan.
            7. Provide LONG TERM CARE/Prevention advice.
            8. List specific PRODUCTS if needed.
            Response MUST be in ITALIAN JSON.
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: treatmentAdviceSchema,
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as TreatmentAdvice;
  } catch (error: any) {
    console.error("Gemini Diagnosis Error:", error);
    const errorMessage = error?.message || "Errore sconosciuto";
    if (errorMessage.includes("API_KEY") || errorMessage.includes("401") || errorMessage.includes("403")) {
      throw new Error("Chiave API non valida o scaduta. Verifica la configurazione in .env");
    }
    throw new Error(`Errore nella diagnosi: ${errorMessage}`);
  }
};

export const checkHarvestReadiness = async (plantName: string, brix: number): Promise<string> => {
  if (!checkApiAvailable()) {
    return "API Key non configurata. Configura VITE_GEMINI_API_KEY nel file .env per utilizzare questa funzionalità.";
  }

  const model = "gemini-2.5-flash";
  const prompt = `
    User is growing: ${plantName}.
    Measured Brix degrees: ${brix}.
    Is it ready to harvest? What is the ideal Brix for this specific variety?
    Answer directly and briefly in Italian. Suggest if they should harvest now or wait.
  `;

  try {
    const response = await ai!.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Analisi non disponibile";
  } catch (e: any) {
    const errorMessage = e?.message || "Errore sconosciuto";
    if (errorMessage.includes("API_KEY") || errorMessage.includes("401") || errorMessage.includes("403")) {
      return "Chiave API non valida. Verifica la configurazione in .env";
    }
    return `Errore connessione AI: ${errorMessage}`;
  }
};

export const analyzeSensorData = async (moisture: number, temperature: number, gardenName: string): Promise<string> => {
  if (!checkApiAvailable()) {
    return "API Key non configurata. Configura VITE_GEMINI_API_KEY nel file .env per utilizzare questa funzionalità.";
  }

  const model = "gemini-2.5-flash";
  const prompt = `
    Analizza i dati del sensore smart per l'orto "${gardenName}".
    Umidità del Suolo: ${moisture}% (Sensore Capacitivo).
    Temperatura: ${temperature}°C.
    
    Dammi un consiglio breve (max 2 frasi) sull'irrigazione. 
    Devo innaffiare ora? C'è rischio di malattie fungine?
  `;
  
  try {
    const response = await ai!.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Dati ricevuti.";
  } catch (e: any) {
    const errorMessage = e?.message || "Errore sconosciuto";
    if (errorMessage.includes("API_KEY") || errorMessage.includes("401") || errorMessage.includes("403")) {
      return "Chiave API non valida. Verifica la configurazione in .env";
    }
    return `Errore analisi sensori: ${errorMessage}`;
  }
};
