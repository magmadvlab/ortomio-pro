/**
 * Service per generare schede prodotto AI per fertilizzanti e trattamenti fitosanitari
 * Simile a plantCardService ma specializzato per prodotti
 */

import { ProductCard } from '../types';
import { generateAIResponse } from './aiProxyService';

export interface ProductCardRequest {
  productName: string;
  type: 'fertilizer' | 'treatment';
  diseaseContext?: string; // Per trattamenti: quale malattia deve curare
  plantContext?: string; // Opzionale: per quale pianta è destinato
  userId: string;
  gardenId?: string;
  aiProvider?: string;
  aiModel?: string;
  aiApiKey?: string;
}

/**
 * Genera una scheda prodotto completa usando AI
 */
export async function generateProductCard(request: ProductCardRequest): Promise<ProductCard> {
  const { productName, type, diseaseContext, plantContext, userId, gardenId, aiProvider, aiModel, aiApiKey } = request;

  // Costruisci prompt specifico per tipo prodotto
  let prompt = '';

  if (type === 'fertilizer') {
    prompt = `Sei un esperto agronomo specializzato in fertilizzanti. Analizza il seguente fertilizzante e fornisci informazioni dettagliate in formato JSON.

FERTILIZZANTE: ${productName}
${plantContext ? `PIANTA TARGET: ${plantContext}` : ''}

Fornisci un oggetto JSON con questa struttura ESATTA (rispondi SOLO con JSON valido, senza markdown):

{
  "description": "Descrizione completa del fertilizzante (2-3 frasi)",
  "scientificName": "Nome scientifico o formula chimica se applicabile",
  "activeIngredients": "Composizione (es. 'Azoto 10%, Fosforo 10%, Potassio 10%' oppure 'Sostanza organica 80%, Humus 30%')",
  "category": "organic | mineral | biostimulant",
  "recommendedDosage": "Dosaggio standard (es. '200g/m²' o '10ml/L acqua')",
  "applicationMethod": "Radicale | Fogliare | Misto",
  "applicationFrequency": "Frequenza testuale (es. 'Ogni 14 giorni in fase vegetativa')",
  "defaultRepeatDays": 14,
  "seasonalAdjustment": {
    "summer": 0.8,
    "winter": 1.5
  },
  "precautions": [
    "Lista di precauzioni d'uso",
    "Esempio: Non superare le dosi consigliate",
    "Esempio: Evitare in giornate ventose"
  ],
  "bestFor": [
    "Lista piante per cui è particolarmente indicato",
    "Esempio: Pomodori, Peperoni, Melanzane"
  ],
  "avoidWith": [
    "Incompatibilità con altri prodotti se esistono"
  ],
  "bestTime": "Momento migliore per applicazione (es. 'Mattina presto' o 'Sera dopo tramonto')",
  "phRequirement": "pH ottimale se rilevante (es. 'Terreno neutro o leggermente acido')",
  "organicCertified": true
}

IMPORTANTE:
- Se è NPK, specifica i numeri nella composizione
- Se organico, indica il tipo di materia organica
- Dosaggi precisi e realistici
- Frequenze basate su best practices agronomiche
- Seasonal adjustment: estate = più frequente (0.7-0.9), inverno = meno frequente (1.2-1.8)
- Rispondi SOLO con JSON valido, senza testo aggiuntivo`;

  } else { // treatment
    prompt = `Sei un esperto in difesa fitosanitaria biologica. Analizza il seguente prodotto fitosanitario e fornisci informazioni dettagliate in formato JSON.

PRODOTTO: ${productName}
${diseaseContext ? `MALATTIA/PROBLEMA: ${diseaseContext}` : ''}
${plantContext ? `PIANTA TARGET: ${plantContext}` : ''}

Fornisci un oggetto JSON con questa struttura ESATTA (rispondi SOLO con JSON valido, senza markdown):

{
  "description": "Descrizione completa del prodotto e meccanismo d'azione (2-3 frasi)",
  "scientificName": "Nome scientifico principio attivo (es. 'Bacillus thuringiensis var. kurstaki')",
  "activeIngredients": "Principi attivi e concentrazione (es. 'Bacillus thuringiensis 32 milioni UFC/g')",
  "category": "fungal | pest | bacterial | preventive",
  "recommendedDosage": "Dosaggio per litro d'acqua (es. '10ml/L acqua' o '5g/L acqua')",
  "applicationMethod": "Fogliare | Radicale | Nebulizzazione",
  "applicationFrequency": "Frequenza applicazioni (es. 'Ogni 7 giorni per 3-4 volte')",
  "defaultRepeatDays": 7,
  "precautions": [
    "Lista precauzioni importanti",
    "Esempio: Applicare al tramonto per preservare efficacia",
    "Esempio: Non miscelare con prodotti a base di rame",
    "Esempio: Rispettare tempo di carenza di X giorni"
  ],
  "bestFor": [
    "Lista malattie/parassiti per cui è efficace",
    "Esempio: Afidi, Aleurodidi, Tripidi"
  ],
  "avoidWith": [
    "Incompatibilità con altri trattamenti"
  ],
  "bestTime": "Momento migliore applicazione (es. 'Sera dopo tramonto', 'Mattina presto prima del sole')",
  "organicCertified": true
}

IMPORTANTE:
- Specifica sempre il principio attivo scientifico
- Dosaggi precisi per litro d'acqua
- Frequenze realistiche (di solito 5-10 giorni)
- Precauzioni specifiche per questo prodotto
- Indica se ammesso in agricoltura biologica
- Rispondi SOLO con JSON valido, senza testo aggiuntivo`;
  }

  try {
    console.log('[ProductCardService] Generando scheda per:', productName, type);

    const aiResponse = await generateAIResponse(
      prompt,
      aiProvider || 'groq',
      aiModel || 'llama-3.3-70b-versatile',
      aiApiKey
    );

    console.log('[ProductCardService] Risposta AI:', aiResponse.substring(0, 200));

    // Pulisci risposta da markdown se presente
    let cleanResponse = aiResponse.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/g, '');
    }

    const parsedData = JSON.parse(cleanResponse);

    // Costruisci ProductCard completo
    const productCard: ProductCard = {
      id: crypto.randomUUID(),
      userId,
      gardenId,
      name: productName,
      type,
      category: parsedData.category,
      description: parsedData.description,
      scientificName: parsedData.scientificName,
      activeIngredients: parsedData.activeIngredients,
      recommendedDosage: parsedData.recommendedDosage,
      applicationMethod: parsedData.applicationMethod,
      applicationFrequency: parsedData.applicationFrequency,
      defaultRepeatDays: parsedData.defaultRepeatDays || (type === 'fertilizer' ? 14 : 7),
      seasonalAdjustment: parsedData.seasonalAdjustment,
      precautions: parsedData.precautions || [],
      bestFor: parsedData.bestFor || [],
      avoidWith: parsedData.avoidWith || [],
      bestTime: parsedData.bestTime,
      phRequirement: parsedData.phRequirement,
      organicCertified: parsedData.organicCertified ?? true,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      timesUsed: 0,
      aiGenerated: true,
      aiProvider: aiProvider || 'groq',
      aiModel: aiModel || 'llama-3.3-70b-versatile',
      aiPrompt: prompt,
      applicationHistory: []
    };

    console.log('[ProductCardService] Scheda generata con successo:', productCard.name);
    return productCard;

  } catch (error: any) {
    console.error('[ProductCardService] Errore generazione scheda:', error);

    // Fallback: crea scheda base senza AI
    console.warn('[ProductCardService] Creando scheda fallback per:', productName);

    return {
      id: crypto.randomUUID(),
      userId,
      gardenId,
      name: productName,
      type,
      description: `${type === 'fertilizer' ? 'Fertilizzante' : 'Trattamento fitosanitario'} - ${productName}`,
      recommendedDosage: type === 'fertilizer' ? 'Seguire istruzioni confezione' : '10ml/L acqua',
      applicationMethod: type === 'fertilizer' ? 'Radicale' : 'Fogliare',
      applicationFrequency: type === 'fertilizer' ? 'Ogni 14-21 giorni' : 'Ogni 7-10 giorni',
      defaultRepeatDays: type === 'fertilizer' ? 14 : 7,
      precautions: ['Seguire sempre le istruzioni del produttore'],
      bestFor: diseaseContext ? [diseaseContext] : [],
      createdAt: new Date().toISOString(),
      timesUsed: 0,
      aiGenerated: false,
      applicationHistory: []
    };
  }
}

/**
 * Cerca una scheda esistente o genera una nuova se non esiste
 */
export async function findOrCreateProductCard(
  productName: string,
  type: 'fertilizer' | 'treatment',
  existingCards: ProductCard[],
  context: Omit<ProductCardRequest, 'productName' | 'type'>
): Promise<ProductCard> {
  // Cerca scheda esistente (case-insensitive)
  const existing = existingCards.find(
    card => card.name.toLowerCase() === productName.toLowerCase() && card.type === type
  );

  if (existing) {
    console.log('[ProductCardService] Scheda esistente trovata:', existing.name);
    return existing;
  }

  // Genera nuova scheda
  console.log('[ProductCardService] Generando nuova scheda per:', productName);
  return await generateProductCard({
    productName,
    type,
    ...context
  });
}