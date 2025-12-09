import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PlantSuggestion, TreatmentAdvice, SpecificPlantInfo } from "../types";
import { findSpecies, findVariety, getVarietyInfo, suggestVarieties } from "./plantDatabaseService";
import { generateCompleteGuide, getVarietyInfo as getMasterVarietyInfo, findSpeciesFromVariety } from "./plantMasterService";
import { getGardenSunExposure } from "./sunExposureService";

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
    },
    guide: {
      type: Type.OBJECT,
      description: "Complete beginner-friendly guide with standardized step-by-step format",
      properties: {
        introduction: { 
          type: Type.STRING, 
          description: "Friendly introduction (2-3 sentences). Template: 'Il [nome pianta] è perfetto per i principianti perché [motivo 1]. [Motivo 2]. Con poche cure, otterrai [risultato atteso].'"
        },
        sowingSteps: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING }, 
          description: "EXACTLY 6 steps for sowing. Each step must start with 'Passo X:' and be 1-2 sentences. Format: 'Passo 1: [azione specifica con misurazioni]. Passo 2: [azione successiva].' Include depth, spacing, and timing."
        },
        transplantSteps: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING }, 
          description: "EXACTLY 5 steps for transplanting. Each step must start with 'Passo X:' and include visual cues. Format: 'Passo 1: [quando trapiantare - dimensione piantina]. Passo 2: [preparazione buca].'"
        },
        careTips: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING }, 
          description: "EXACTLY 6 weekly care tips. Each tip must be 1 sentence starting with action verb. Format: 'Controlla [cosa] ogni [quando].' or 'Innaffia [come] quando [condizione].'"
        },
        commonMistakes: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING }, 
          description: "EXACTLY 4 common mistakes. Format: 'Evita [errore] perché [conseguenza]. Invece [soluzione corretta].'"
        },
        harvestGuide: { 
          type: Type.STRING, 
          description: "Detailed harvest explanation (3-4 sentences). Template: 'Raccogli quando [segni visivi specifici]. [Come raccogliere - tecnica]. [Quando è il momento migliore della giornata]. [Come conservare].'"
        }
      },
      required: ["introduction", "sowingSteps", "transplantSteps", "careTips", "harvestGuide"]
    }
  },
  required: ["name", "seedSowingWindow", "transplantWindow", "harvestWindow", "irrigation", "fertilizer", "indoor", "soil", "harvest", "guide"]
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

export const getSpecificPlantDetails = async (query: string, lat: number, lng: number, garden?: { sunExposure?: string; sunHours?: number; orientation?: string }): Promise<SpecificPlantInfo | null> => {
  if (!checkApiAvailable()) {
    throw new Error("API Key non configurata. Configura VITE_GEMINI_API_KEY nel file .env");
  }

  // Cerca prima nel sistema di schede master
  const varietyInfo = getMasterVarietyInfo(query);
  let masterGuide = null;
  let speciesName = query;
  let varietyName: string | undefined = undefined;

  if (varietyInfo) {
    // Varietà trovata nel sistema master
    speciesName = varietyInfo.speciesId;
    varietyName = varietyInfo.varietyName;
    masterGuide = generateCompleteGuide(speciesName, varietyName);
  } else {
    // Prova a trovare la specie direttamente
    const speciesFromVariety = findSpeciesFromVariety(query);
    if (speciesFromVariety) {
      speciesName = speciesFromVariety.speciesId;
      masterGuide = generateCompleteGuide(speciesName);
    } else {
      // Prova a cercare per nome specie
      masterGuide = generateCompleteGuide(query);
      if (masterGuide) {
        speciesName = query;
      }
    }
  }

  // Verifica anche nel database varietà per retrocompatibilità
  const dbVarietyInfo = getVarietyInfo(query);
  const dbSpecies = findSpecies(query);
  let validatedQuery = query;
  let varietyContext = '';

  if (dbVarietyInfo) {
    validatedQuery = dbVarietyInfo.variety.name;
    varietyContext = `\n\nNOTA: La varietà "${validatedQuery}" è registrata nel database italiano.`;
  } else if (dbSpecies) {
    varietyContext = `\n\nNOTA: La specie "${dbSpecies.commonName}" è presente nel database italiano.`;
  }

  const model = "gemini-2.5-flash";
  const today = new Date();
  const month = today.toLocaleDateString('it-IT', { month: 'long' });
  const season = today.getMonth() >= 2 && today.getMonth() <= 4 ? 'Primavera' : 
                 today.getMonth() >= 5 && today.getMonth() <= 7 ? 'Estate' :
                 today.getMonth() >= 8 && today.getMonth() <= 10 ? 'Autunno' : 'Inverno';

  // Costruisci il prompt basato sulla scheda master se disponibile
  let prompt = '';
  
  if (masterGuide) {
    // Usa la scheda master come base
    const { masterSheet, tags, additionalInstructions } = masterGuide;
    
    // Importa servizio esposizione (sarà passato come parametro opzionale in futuro)
    // Per ora usiamo solo le coordinate
    // Calcola esposizione solare se disponibile
    const sunExposureInfo = garden ? getGardenSunExposure({
      coordinates: { latitude: lat, longitude: lng },
      sunExposure: garden.sunExposure as any,
      sunHours: garden.sunHours,
      orientation: garden.orientation as any
    } as any) : null;
    
    const sunInfo = sunExposureInfo 
      ? `- Esposizione solare: ${sunExposureInfo.exposure === 'FullSun' ? 'Pieno sole' : sunExposureInfo.exposure === 'PartialSun' ? 'Sole parziale' : sunExposureInfo.exposure === 'PartialShade' ? 'Ombra parziale' : 'Ombra'} (${sunExposureInfo.estimatedHours} ore/giorno)`
      : '';
    
    prompt = `
CONTESTO:
- Specie: ${masterSheet.commonName} (${masterSheet.scientificName})
${varietyName ? `- Varietà: ${varietyName}` : ''}
- Posizione: ${lat}, ${lng} (Italia)
${sunInfo}
- Stagione attuale: ${season}
- Mese: ${month}

SCHEDA MASTER DISPONIBILE - Segui ESATTAMENTE questa struttura a 4 fasi:

FASE 0: STRUMENTI NECESSARI
${masterSheet.requiredTools.seedTray ? `- Semenzaio ${masterSheet.requiredTools.seedTrayType || 'alveolato'}` : ''}
${masterSheet.requiredTools.seedSoil ? '- Terriccio da semina fine' : ''}
${masterSheet.requiredTools.heatingMat ? '- Tappetino riscaldante (consigliato)' : ''}
${masterSheet.requiredTools.sprayer ? '- Nebulizzatore d\'acqua' : ''}
${masterSheet.requiredTools.additionalTools ? `- ${masterSheet.requiredTools.additionalTools.join(', ')}` : ''}

FASE 1: GERMINAZIONE (Dati Parametrici)
- Amollo: ${masterSheet.germination.preSoak ? 'Sì' : 'No'}
- Profondità semina: ${masterSheet.germination.sowingDepth}cm
- Temperatura ideale: ${masterSheet.germination.idealTemp}
- Temperatura minima: ${masterSheet.germination.minTemp}°C
- Luce per germinare: ${masterSheet.germination.lightRequirement === 'Dark' ? 'Buio' : masterSheet.germination.lightRequirement === 'Light' ? 'Luce' : 'Entrambi'}
- Tempo emergenza: ${masterSheet.germination.emergenceDays}
${masterSheet.germination.coveringNeeded ? `- Copertura: ${masterSheet.germination.coveringInstructions || 'Usa pellicola trasparente'}` : ''}

FASE 2: GESTIONE PIANTINA (Nursing)
- Quando travasare: ${masterSheet.seedlingCare.transplantWhen}
- Luce necessaria: ${masterSheet.seedlingCare.lightNeeds}
${masterSheet.seedlingCare.lightHours ? `- Ore di luce: ${masterSheet.seedlingCare.lightHours}h/giorno` : ''}
- Acqua: ${masterSheet.seedlingCare.watering}
${masterSheet.seedlingCare.warning ? `- Attenzione: ${masterSheet.seedlingCare.warning}` : ''}
- Temperatura: ${masterSheet.seedlingCare.temperature}

FASE 3: TRAPIANTO (Messa a dimora)
- Quando: ${masterSheet.transplanting.when}
- Distanza: ${masterSheet.transplanting.spacing}
- Buca: ${masterSheet.transplanting.holeDepth}cm profondità, ${masterSheet.transplanting.holeWidth}cm larghezza
- Terreno: ${masterSheet.transplanting.soilRequirements}
${masterSheet.transplanting.buryStem ? `- Interrare gambo: ${masterSheet.transplanting.buryStemInstructions || 'Sì'}` : ''}
${masterSheet.transplanting.protectionNeeded ? `- Protezione: ${masterSheet.transplanting.protectionInstructions || 'Necessaria'}` : ''}

${tags.length > 0 ? `\nTAG COMPORTAMENTALI APPLICABILI:\n${tags.map(t => `- ${t.name}: ${t.description}\n  Istruzioni aggiuntive:\n  ${t.additionalInstructions.map(i => `  • ${i}`).join('\n')}`).join('\n\n')}` : ''}

ISTRUZIONI BASE:
- Introduzione: ${masterSheet.baseInstructions.introduction}
- Errori comuni: ${masterSheet.baseInstructions.commonMistakes.join(' | ')}
- Guida raccolta: ${masterSheet.baseInstructions.harvestGuide}

OBIETTIVO: Genera una guida "for dummies" basata sulla scheda master sopra, seguendo ESATTAMENTE le 4 fasi.
${additionalInstructions.length > 0 ? `\nAggiungi queste istruzioni aggiuntive specifiche per la varietà:\n${additionalInstructions.map(i => `- ${i}`).join('\n')}` : ''}

REGOLE STRETTE PER LA GUIDA (guide):
1. introduction: Esattamente 2-3 frasi. Inizia con "Il [nome] è..." e spiega perché è adatto ai principianti.
2. sowingSteps: ESATTAMENTE 6 passi. Ogni passo inizia con "Passo X:" e include misurazioni precise (cm, giorni, temperatura).
   Template obbligatorio:
   - Passo 1: Preparazione terriccio e contenitore
   - Passo 2: Profondità e distanza semi
   - Passo 3: Copertura e prima innaffiatura
   - Passo 4: Posizione e temperatura
   - Passo 5: Quando innaffiare durante germinazione
   - Passo 6: Quando aspettarsi i primi germogli
3. transplantSteps: ESATTAMENTE 5 passi. Ogni passo include segni visivi specifici.
   Template obbligatorio:
   - Passo 1: Quando trapiantare (dimensione piantina, numero foglie)
   - Passo 2: Preparazione buca (profondità, distanza)
   - Passo 3: Come estrarre dal vaso senza danneggiare
   - Passo 4: Posizionamento e riempimento
   - Passo 5: Prima innaffiatura e protezione
4. careTips: ESATTAMENTE 6 consigli. Ogni consiglio è una frase che inizia con verbo d'azione.
   Template: "Controlla [cosa] ogni [quando]" o "Innaffia [come] quando [condizione]"
5. commonMistakes: ESATTAMENTE 4 errori. Formato: "Evita [errore] perché [conseguenza]. Invece [soluzione]."
6. harvestGuide: Esattamente 3-4 frasi. Include: quando raccogliere (segni visivi), come raccogliere (tecnica), momento migliore della giornata, come conservare.

${masterGuide ? '' : `ESEMPIO DI STRUTTURA STANDARDIZZATA (per pomodoro):`}
guide: {
  introduction: "Il pomodoro è perfetto per i principianti perché cresce velocemente e produce molti frutti. È resistente e si adatta bene a diversi tipi di terreno. Con poche cure, otterrai pomodori saporiti per tutta l'estate.",
  sowingSteps: [
    "Passo 1: Prepara un vasetto di 8-10cm con terriccio universale, lasciando 1cm dal bordo.",
    "Passo 2: Fai 3-4 buchi profondi 0.5cm, distanziati 2cm l'uno dall'altro. Metti 2-3 semi per buco.",
    "Passo 3: Copri i semi con 0.5cm di terriccio e innaffia delicatamente con uno spruzzino fino a bagnare il terreno.",
    "Passo 4: Posiziona il vaso in un luogo caldo (20-25°C) e luminoso, ma non al sole diretto.",
    "Passo 5: Mantieni il terriccio umido (non bagnato) innaffiando ogni 2-3 giorni con lo spruzzino.",
    "Passo 6: I primi germogli appariranno dopo 7-14 giorni. Quando spuntano, sposta in un posto più luminoso."
  ],
  transplantSteps: [
    "Passo 1: Trapianta quando la piantina ha 4-6 foglie vere e raggiunge 15-20cm di altezza (circa 6-8 settimane dopo la semina).",
    "Passo 2: Prepara una buca profonda 30cm e larga 40cm, distanziata 50cm dalle altre piante. Aggiungi 2-3 manciate di compost sul fondo.",
    "Passo 3: Bagna il vaso, poi capovolgi delicatamente tenendo la piantina tra le dita. Il pane di terra dovrebbe uscire intero.",
    "Passo 4: Posiziona la piantina nella buca, interrandola fino alle prime foglie vere. Riempì con terra e compatta leggermente.",
    "Passo 5: Innaffia abbondantemente alla base (circa 2 litri) e proteggi dal sole diretto per 2-3 giorni con un telo ombreggiante."
  ],
  careTips: [
    "Innaffia alla base della pianta 2-3 volte a settimana, evitando di bagnare le foglie per prevenire malattie.",
    "Controlla le foglie ogni settimana per macchie gialle o marroni che indicano problemi.",
    "Rimuovi i getti laterali (femminelle) ogni 10 giorni per concentrare l'energia sui frutti principali.",
    "Lega il fusto a un tutore quando raggiunge 30cm, usando rafia o legacci morbidi.",
    "Fertilizza ogni 3 settimane con concime ricco di potassio quando compaiono i primi fiori.",
    "Controlla l'umidità del terreno infilando un dito: se è asciutto a 2cm di profondità, innaffia."
  ],
  commonMistakes: [
    "Evita di innaffiare troppo perché le radici marciscono. Invece, innaffia solo quando il terreno è asciutto a 2cm di profondità.",
    "Evita di piantare troppo presto all'aperto perché il freddo uccide le piantine. Invece, aspetta che le temperature notturne siano sopra i 12°C.",
    "Evita di non legare il fusto perché la pianta si piega e si spezza. Invece, installa un tutore fin dall'inizio.",
    "Evita di bagnare le foglie durante l'irrigazione perché favorisce l'oidio. Invece, innaffia sempre alla base della pianta."
  ],
  harvestGuide: "Raccogli quando i pomodori hanno raggiunto il colore caratteristico della varietà (rosso intenso per i rossi, giallo per i gialli) e risultano leggermente morbidi al tatto ma ancora sodi. Taglia il picciolo con una forbice affilata, lasciando 1cm di stelo attaccato al frutto. Il momento migliore è la mattina presto quando i frutti sono più freschi. Conserva a temperatura ambiente (non in frigorifero) per mantenere il sapore, e consuma entro 3-5 giorni."
}

IMPORTANTE: 
- Segui ESATTAMENTE la struttura a 4 fasi dalla scheda master sopra
- Usa i dati parametrici esatti (temperatura, profondità, distanze) dalla scheda
- Ogni sezione della guida deve avere il numero esatto di elementi indicato
- Aggiungi le istruzioni aggiuntive dei tag comportamentali se presenti
- Mantieni il formato standardizzato per garantire coerenza
${varietyContext}

ALTRI CAMPI RICHIESTI (arricchisci con dati specifici per posizione e stagione):
- name: Nome comune in italiano
- variety: Varietà specifica (es. "Datterino", "Cuore di Bue")
- seedSowingWindow: Finestra di semina (es. "Febbraio-Marzo in semenzaio, Aprile all'aperto")
- transplantWindow: Finestra di trapianto (es. "Maggio, quando le temperature notturne superano i 12°C")
- harvestWindow: Finestra di raccolta (es. "Luglio-Settembre, 60-80 giorni dopo il trapianto")
- soil: pH range e descrizione tipo terreno
- harvest: Segni visivi e Brix (se applicabile)
- indoor: Dettagli per semina indoor
- irrigation: Frequenza e metodo
- fertilizer: Tipo organico e chimico con dosaggi precisi

Rispondi SOLO in formato JSON valido, rispettando esattamente lo schema fornito.
    `;
  } else {
    // Fallback: comportamento originale senza scheda master
    // Calcola esposizione solare se disponibile
    const sunExposureInfo = garden ? getGardenSunExposure({
      coordinates: { latitude: lat, longitude: lng },
      sunExposure: garden.sunExposure as any,
      sunHours: garden.sunHours,
      orientation: garden.orientation as any
    } as any) : null;
    
    const sunInfo = sunExposureInfo 
      ? `- Esposizione solare: ${sunExposureInfo.exposure === 'FullSun' ? 'Pieno sole' : sunExposureInfo.exposure === 'PartialSun' ? 'Sole parziale' : sunExposureInfo.exposure === 'PartialShade' ? 'Ombra parziale' : 'Ombra'} (${sunExposureInfo.estimatedHours} ore/giorno)`
      : '';
    
    prompt = `
CONTESTO:
- Pianta richiesta: "${validatedQuery}"${varietyContext ? varietyContext : ''}
- Posizione: ${lat}, ${lng} (Italia)
${sunInfo}
- Stagione attuale: ${season}
- Mese: ${month}

OBIETTIVO: Crea una GUIDA STANDARDIZZATA "for dummies" dal seme al raccolto.

REGOLE STRETTE PER LA GUIDA (guide):
1. introduction: Esattamente 2-3 frasi. Inizia con "Il [nome] è..." e spiega perché è adatto ai principianti.
2. sowingSteps: ESATTAMENTE 6 passi. Ogni passo inizia con "Passo X:" e include misurazioni precise (cm, giorni, temperatura).
   Template obbligatorio:
   - Passo 1: Preparazione terriccio e contenitore
   - Passo 2: Profondità e distanza semi
   - Passo 3: Copertura e prima innaffiatura
   - Passo 4: Posizione e temperatura
   - Passo 5: Quando innaffiare durante germinazione
   - Passo 6: Quando aspettarsi i primi germogli
3. transplantSteps: ESATTAMENTE 5 passi. Ogni passo include segni visivi specifici.
   Template obbligatorio:
   - Passo 1: Quando trapiantare (dimensione piantina, numero foglie)
   - Passo 2: Preparazione buca (profondità, distanza)
   - Passo 3: Come estrarre dal vaso senza danneggiare
   - Passo 4: Posizionamento e riempimento
   - Passo 5: Prima innaffiatura e protezione
4. careTips: ESATTAMENTE 6 consigli. Ogni consiglio è una frase che inizia con verbo d'azione.
   Template: "Controlla [cosa] ogni [quando]" o "Innaffia [come] quando [condizione]"
5. commonMistakes: ESATTAMENTE 4 errori. Formato: "Evita [errore] perché [conseguenza]. Invece [soluzione]."
6. harvestGuide: Esattamente 3-4 frasi. Include: quando raccogliere (segni visivi), come raccogliere (tecnica), momento migliore della giornata, come conservare.

ESEMPIO DI STRUTTURA STANDARDIZZATA (per pomodoro):
guide: {
  introduction: "Il pomodoro è perfetto per i principianti perché cresce velocemente e produce molti frutti. È resistente e si adatta bene a diversi tipi di terreno. Con poche cure, otterrai pomodori saporiti per tutta l'estate.",
  sowingSteps: [
    "Passo 1: Prepara un vasetto di 8-10cm con terriccio universale, lasciando 1cm dal bordo.",
    "Passo 2: Fai 3-4 buchi profondi 0.5cm, distanziati 2cm l'uno dall'altro. Metti 2-3 semi per buco.",
    "Passo 3: Copri i semi con 0.5cm di terriccio e innaffia delicatamente con uno spruzzino fino a bagnare il terreno.",
    "Passo 4: Posiziona il vaso in un luogo caldo (20-25°C) e luminoso, ma non al sole diretto.",
    "Passo 5: Mantieni il terriccio umido (non bagnato) innaffiando ogni 2-3 giorni con lo spruzzino.",
    "Passo 6: I primi germogli appariranno dopo 7-14 giorni. Quando spuntano, sposta in un posto più luminoso."
  ],
  transplantSteps: [
    "Passo 1: Trapianta quando la piantina ha 4-6 foglie vere e raggiunge 15-20cm di altezza (circa 6-8 settimane dopo la semina).",
    "Passo 2: Prepara una buca profonda 30cm e larga 40cm, distanziata 50cm dalle altre piante. Aggiungi 2-3 manciate di compost sul fondo.",
    "Passo 3: Bagna il vaso, poi capovolgi delicatamente tenendo la piantina tra le dita. Il pane di terra dovrebbe uscire intero.",
    "Passo 4: Posiziona la piantina nella buca, interrandola fino alle prime foglie vere. Riempì con terra e compatta leggermente.",
    "Passo 5: Innaffia abbondantemente alla base (circa 2 litri) e proteggi dal sole diretto per 2-3 giorni con un telo ombreggiante."
  ],
  careTips: [
    "Innaffia alla base della pianta 2-3 volte a settimana, evitando di bagnare le foglie per prevenire malattie.",
    "Controlla le foglie ogni settimana per macchie gialle o marroni che indicano problemi.",
    "Rimuovi i getti laterali (femminelle) ogni 10 giorni per concentrare l'energia sui frutti principali.",
    "Lega il fusto a un tutore quando raggiunge 30cm, usando rafia o legacci morbidi.",
    "Fertilizza ogni 3 settimane con concime ricco di potassio quando compaiono i primi fiori.",
    "Controlla l'umidità del terreno infilando un dito: se è asciutto a 2cm di profondità, innaffia."
  ],
  commonMistakes: [
    "Evita di innaffiare troppo perché le radici marciscono. Invece, innaffia solo quando il terreno è asciutto a 2cm di profondità.",
    "Evita di piantare troppo presto all'aperto perché il freddo uccide le piantine. Invece, aspetta che le temperature notturne siano sopra i 12°C.",
    "Evita di non legare il fusto perché la pianta si piega e si spezza. Invece, installa un tutore fin dall'inizio.",
    "Evita di bagnare le foglie durante l'irrigazione perché favorisce l'oidio. Invece, innaffia sempre alla base della pianta."
  ],
  harvestGuide: "Raccogli quando i pomodori hanno raggiunto il colore caratteristico della varietà (rosso intenso per i rossi, giallo per i gialli) e risultano leggermente morbidi al tatto ma ancora sodi. Taglia il picciolo con una forbice affilata, lasciando 1cm di stelo attaccato al frutto. Il momento migliore è la mattina presto quando i frutti sono più freschi. Conserva a temperatura ambiente (non in frigorifero) per mantenere il sapore, e consuma entro 3-5 giorni."
}

IMPORTANTE: Segui ESATTAMENTE questa struttura standardizzata. Ogni sezione deve avere il numero esatto di elementi indicato. Usa sempre lo stesso formato per garantire coerenza tra diverse ricerche.
${varietyContext}

ALTRI CAMPI RICHIESTI:
- name: Nome comune in italiano
- variety: Varietà specifica (es. "Datterino", "Cuore di Bue")
- seedSowingWindow: Finestra di semina (es. "Febbraio-Marzo in semenzaio, Aprile all'aperto")
- transplantWindow: Finestra di trapianto (es. "Maggio, quando le temperature notturne superano i 12°C")
- harvestWindow: Finestra di raccolta (es. "Luglio-Settembre, 60-80 giorni dopo il trapianto")
- soil: pH range e descrizione tipo terreno
- harvest: Segni visivi e Brix (se applicabile)
- indoor: Dettagli per semina indoor
- irrigation: Frequenza e metodo
- fertilizer: Tipo organico e chimico con dosaggi precisi

Rispondi SOLO in formato JSON valido, rispettando esattamente lo schema fornito.
    `;
  }

  try {
    const response = await ai!.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: specificPlantSchema,
        systemInstruction: "Sei un agronomo esperto specializzato in orti italiani. Fornisci SEMPRE guide standardizzate con la struttura esatta richiesta. Ogni guida deve seguire il template fornito per garantire coerenza. Usa sempre lo stesso formato per ogni sezione della guida.",
      },
    });

    const text = response.text;
    if (!text) return null;
    const result = JSON.parse(text) as SpecificPlantInfo;
    
    // Aggiungi riferimento alla scheda master se usata
    if (masterGuide) {
      result.masterSheetId = masterGuide.masterSheet.id;
    }
    
    return result;
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
