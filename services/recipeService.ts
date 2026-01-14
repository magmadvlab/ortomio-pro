import { GoogleGenerativeAI } from '@google/generative-ai';

// Support both Next.js and Vite environments
const apiKey = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_GEMINI_API_KEY || (import.meta as any)?.env?.VITE_GEMINI_API_KEY)
  : (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || (import.meta as any)?.env?.VITE_GEMINI_API_KEY);
const ai = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string[];
  servings?: number;
  prepTime?: string;
}

// Schema per le ricette
const recipeSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      name: { 
        type: "string", 
        description: "Nome della ricetta italiana tradizionale" 
      },
      ingredients: { 
        type: "array", 
        items: { type: "string" },
        description: "Lista degli ingredienti necessari (formato: 'quantità ingrediente')"
      },
      instructions: { 
        type: "array", 
        items: { type: "string" },
        description: "Procedimento passo-passo (massimo 6 passi, ognuno 1-2 frasi)"
      },
      servings: { 
        type: "number", 
        description: "Numero di porzioni (opzionale)" 
      },
      prepTime: { 
        type: "string", 
        description: "Tempo di preparazione (es. '30 minuti', '1 ora')" 
      }
    },
    required: ["name", "ingredients", "instructions"]
  }
};

/**
 * Ottiene ricette italiane tradizionali per un raccolto specifico
 */
export const getRecipesForHarvest = async (
  plantName: string,
  quantity: number,
  unit: string
): Promise<Recipe[]> => {
  if (!apiKey || !ai) {
    console.warn("API Key non configurata per le ricette");
    return [];
  }

  const model = "gemini-2.5-flash";
  
  const prompt = `
L'utente ha appena raccolto ${quantity}${unit === 'kg' ? ' chilogrammi' : unit === 'g' ? ' grammi' : ' unità'} di ${plantName} dal suo orto.

Genera 2-3 ricette italiane tradizionali e autentiche per utilizzare questo raccolto. Le ricette devono essere:
- Tradizionali italiane (non fusion o moderne)
- Adatte per utilizzare la quantità raccolta
- Con ingredienti facilmente reperibili
- Procedimento chiaro e semplice

Formato richiesto: nome ricetta, lista ingredienti con quantità, procedimento passo-passo.

Rispondi in italiano.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
        systemInstruction: "Sei uno chef italiano esperto di cucina tradizionale regionale. Fornisci ricette autentiche, semplici e deliziose che valorizzano il prodotto dell'orto. Sii preciso nelle quantità e chiaro nelle istruzioni.",
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const recipes = JSON.parse(text) as Recipe[];
    return recipes;
  } catch (error: any) {
    console.error("Errore nel recupero delle ricette:", error);
    // In caso di errore, restituisci ricette di fallback
    return getFallbackRecipes(plantName);
  }
};

/**
 * Ricette di fallback se l'API non è disponibile
 */
const getFallbackRecipes = (plantName: string): Recipe[] => {
  const plantLower = plantName.toLowerCase();
  
  if (plantLower.includes('pomodoro') || plantLower.includes('pomodor')) {
    return [
      {
        name: "Sugo di Pomodoro Fresco",
        ingredients: [
          "1kg pomodori maturi",
          "2 spicchi d'aglio",
          "Olio extravergine d'oliva",
          "Basilico fresco",
          "Sale e pepe"
        ],
        instructions: [
          "Scalda l'olio in una padella e fai rosolare l'aglio",
          "Aggiungi i pomodori tagliati a pezzi",
          "Cuoci a fuoco medio per 20 minuti",
          "Aggiungi basilico, sale e pepe a fine cottura"
        ],
        servings: 4,
        prepTime: "30 minuti"
      }
    ];
  }
  
  if (plantLower.includes('zucchin') || plantLower.includes('zucchino')) {
    return [
      {
        name: "Zucchine alla Scapece",
        ingredients: [
          "1kg zucchine",
          "Aglio",
          "Aceto di vino bianco",
          "Menta fresca",
          "Olio extravergine d'oliva"
        ],
        instructions: [
          "Taglia le zucchine a rondelle e friggi in olio",
          "Scola e disponi in un piatto",
          "Condisci con aglio, menta, aceto e olio",
          "Lascia marinare per almeno 1 ora"
        ],
        servings: 4,
        prepTime: "45 minuti"
      }
    ];
  }
  
  if (plantLower.includes('lattuga') || plantLower.includes('insalata')) {
    return [
      {
        name: "Insalata Mista dell'Orto",
        ingredients: [
          "Lattuga fresca",
          "Pomodori",
          "Cipolla rossa",
          "Olio extravergine d'oliva",
          "Aceto",
          "Sale"
        ],
        instructions: [
          "Lava e taglia la lattuga",
          "Aggiungi pomodori a pezzi e cipolla a fette",
          "Condisci con olio, aceto e sale",
          "Mescola delicatamente e servi"
        ],
        servings: 4,
        prepTime: "10 minuti"
      }
    ];
  }
  
  // Ricetta generica
  return [
    {
      name: `${plantName} Saltati`,
      ingredients: [
        `${plantName} freschi`,
        "Aglio",
        "Olio extravergine d'oliva",
        "Sale e pepe",
        "Prezzemolo"
      ],
      instructions: [
        "Lava e taglia le verdure",
        "Scalda l'olio in padella",
        "Aggiungi aglio e fai rosolare",
        "Aggiungi le verdure e cuoci a fuoco vivo",
        "Condisci con sale, pepe e prezzemolo"
      ],
      servings: 4,
      prepTime: "20 minuti"
    }
  ];
};





