/**
 * Servizio per estrarre il nome principale da nomi composti di piante
 * Es: "peperoncino habanero" → "peperoncino"
 */

export interface ExtractedPlantName {
  mainName: string;
  variety?: string;
  keywords: string[];
}

/**
 * Lista di piante principali comuni per matching
 * Ordinata per frequenza d'uso
 */
const MAIN_PLANT_NAMES = [
  // Solanacee
  'pomodoro', 'pomodori', 'peperone', 'peperoni', 'peperoncino', 'peperoncini',
  'melanzana', 'melanzane', 'patata', 'patate',
  
  // Cucurbitacee
  'zucchina', 'zucchine', 'cetriolo', 'cetrioli', 'carosello', 'caroselli',
  'barattiere', 'barattieri', 'zucca', 'zucche', 'melone', 'meloni',
  'anguria', 'angurie',
  
  // Insalate e foglie
  'lattuga', 'lattughe', 'radicchio', 'radicchi', 'cicoria', 'cicorie',
  'rucola', 'bietola', 'bietole', 'spinacio', 'spinaci',
  
  // Brassiche
  'cavolo', 'cavoli', 'broccolo', 'broccoli', 'cavolfiore', 'cavolfiori',
  'ravanello', 'ravanelli',
  
  // Bulbi
  'cipolla', 'cipolle', 'aglio', 'porro', 'porri', 'scalogno',
  
  // Radici
  'carota', 'carote', 'barbabietola', 'barbabietole', 'rapa', 'rape',
  
  // Legumi
  'fagiolo', 'fagioli', 'pisello', 'piselli', 'fava', 'fave', 'cece', 'ceci',
  'fagiolino', 'fagiolini',
  
  // Aromatiche
  'basilico', 'rosmarino', 'salvia', 'prezzemolo', 'menta', 'timo',
  'origano', 'maggiorana',
  
  // Altri
  'sedano', 'finocchio', 'prezzemolo'
];

/**
 * Estrae la parola principale da un nome composto
 * Es: "peperoncino habanero" → { mainName: "peperoncino", variety: "habanero" }
 * 
 * @param fullName - Nome completo inserito dall'utente
 * @returns Oggetto con nome principale, varietà (opzionale) e keywords
 */
export function extractMainPlantName(fullName: string): ExtractedPlantName {
  const normalized = fullName.toLowerCase().trim();
  if (!normalized) {
    return {
      mainName: '',
      keywords: []
    };
  }
  
  const words = normalized.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length === 0) {
    return {
      mainName: normalized,
      keywords: [normalized]
    };
  }
  
  // Cerca la prima parola che corrisponde a una pianta principale
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Match esatto
    const exactMatch = MAIN_PLANT_NAMES.find(main => 
      word === main || word === main.slice(0, -1) || main === word + 'i' || main === word + 'e'
    );
    
    if (exactMatch) {
      const variety = words
        .filter((w, idx) => idx !== i && w.length > 2)
        .join(' ') || undefined;
      
      return {
        mainName: exactMatch,
        variety,
        keywords: words
      };
    }
    
    // Match parziale (contiene o è contenuto)
    const partialMatch = MAIN_PLANT_NAMES.find(main => 
      word.includes(main) || main.includes(word)
    );
    
    if (partialMatch && word.length >= 4) { // Solo se la parola è abbastanza lunga
      const variety = words
        .filter((w, idx) => idx !== i && w.length > 2)
        .join(' ') || undefined;
      
      return {
        mainName: partialMatch,
        variety,
        keywords: words
      };
    }
  }
  
  // Fallback: usa la prima parola se è abbastanza lunga
  if (words[0] && words[0].length >= 3) {
    const variety = words.slice(1).filter(w => w.length > 2).join(' ') || undefined;
    return {
      mainName: words[0],
      variety,
      keywords: words
    };
  }
  
  // Fallback: usa la seconda parola se la prima è troppo corta
  if (words.length > 1 && words[1] && words[1].length >= 3) {
    const variety = words.filter((w, idx) => idx !== 1 && w.length > 2).join(' ') || undefined;
    return {
      mainName: words[1],
      variety,
      keywords: words
    };
  }
  
  // Ultimo fallback: usa tutto l'input
  return {
    mainName: normalized,
    keywords: words
  };
}

/**
 * Suggerisce un archetipo basato su keywords estratti
 * @param keywords - Array di keywords estratti
 * @returns ID archetipo suggerito o null
 */
export function suggestArchetypeFromKeywords(keywords: string[]): string | null {
  const normalizedKeywords = keywords.map(k => k.toLowerCase());
  
  // Mapping keywords → archetipo
  const keywordToArchetype: Record<string, string> = {
    // Solanacee (A1)
    'pomodoro': 'A1', 'pomodori': 'A1', 'peperone': 'A1', 'peperoni': 'A1',
    'peperoncino': 'A1', 'peperoncini': 'A1', 'melanzana': 'A1', 'melanzane': 'A1',
    'patata': 'A8', 'patate': 'A8', // Patate sono radici
    
    // Cucurbitacee fresche (A2)
    'zucchina': 'A2', 'zucchine': 'A2', 'cetriolo': 'A2', 'cetrioli': 'A2',
    'carosello': 'A2', 'caroselli': 'A2', 'barattiere': 'A2', 'barattieri': 'A2',
    
    // Cucurbitacee grosse (A3)
    'zucca': 'A3', 'zucche': 'A3', 'melone': 'A3', 'meloni': 'A3',
    'anguria': 'A3', 'angurie': 'A3',
    
    // Insalate (A4)
    'lattuga': 'A4', 'lattughe': 'A4', 'radicchio': 'A4', 'radicchi': 'A4',
    'cicoria': 'A4', 'cicorie': 'A4', 'rucola': 'A4',
    
    // Foglie robuste (A5)
    'bietola': 'A5', 'bietole': 'A5', 'spinacio': 'A5', 'spinaci': 'A5',
    
    // Brassiche (A6)
    'cavolo': 'A6', 'cavoli': 'A6', 'broccolo': 'A6', 'broccoli': 'A6',
    'cavolfiore': 'A6', 'cavolfiori': 'A6', 'ravanello': 'A6', 'ravanelli': 'A6',
    
    // Bulbi (A7)
    'cipolla': 'A7', 'cipolle': 'A7', 'aglio': 'A7', 'porro': 'A7',
    'porri': 'A7', 'scalogno': 'A7',
    
    // Radici (A8)
    'carota': 'A8', 'carote': 'A8', 'barbabietola': 'A8', 'barbabietole': 'A8',
    'rapa': 'A8', 'rape': 'A8',
    
    // Legumi (A9)
    'fagiolo': 'A9', 'fagioli': 'A9', 'pisello': 'A9', 'piselli': 'A9',
    'fava': 'A9', 'fave': 'A9', 'cece': 'A9', 'ceci': 'A9',
    'fagiolino': 'A9', 'fagiolini': 'A9',
    
    // Aromatiche (A10)
    'basilico': 'A10', 'rosmarino': 'A10', 'salvia': 'A10', 'prezzemolo': 'A10',
    'menta': 'A10', 'timo': 'A10', 'origano': 'A10', 'maggiorana': 'A10'
  };
  
  // Cerca il primo keyword che ha un match
  for (const keyword of normalizedKeywords) {
    if (keywordToArchetype[keyword]) {
      return keywordToArchetype[keyword];
    }
  }
  
  return null;
}

